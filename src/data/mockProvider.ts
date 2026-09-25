import {
  AGENTS,
  SOURCES,
  STAGES,
  scenarios,
  type Scenario,
} from './scenarios'
import type { DataProvider, PipelineEvent } from './provider'

const STAGE_MS = 700
const PAUSE_MS = 2500
const LIVE_THINK_MS = 900
const LIVE_TOKEN_MS = 140

type QueueItem = { type: 'clean' | 'dirty'; scenario?: Scenario }

export class MockDataProvider implements DataProvider {
  readonly kind = 'mock' as const
  readonly modeLabel = 'демо-данные'

  private readonly catalog = scenarios
  private readonly alertListeners = new Set<(alert: Scenario) => void>()
  private readonly pipelineListeners = new Set<(event: PipelineEvent) => void>()
  private stageTimers: number[] = []
  private intervalId: number | null = null
  private resumeId: number | null = null
  private queueIndex = 0
  private cycle = 0
  private current: PipelineEvent = {
    cycle: 0,
    type: 'clean',
    scenario: null,
    activeStage: -1,
    phase: 'flowing',
  }

  getPipelineStages() {
    return STAGES
  }

  subscribePipelineEvents(onEvent: (event: PipelineEvent) => void) {
    this.pipelineListeners.add(onEvent)
    onEvent(this.current)
    if (this.pipelineListeners.size === 1) this.startLoop()
    return () => {
      this.pipelineListeners.delete(onEvent)
      if (this.pipelineListeners.size === 0) this.stopLoop()
    }
  }

  playDirtyRun(alertId: string) {
    const scenario = this.catalog.find((item) => item.id === alertId)
    if (!scenario) return
    this.publishAlert(scenario)
    if (this.pipelineListeners.size === 0) return
    this.clearInterval()
    this.clearResume()
    this.cycle += 1
    this.play('dirty', scenario, () => {
      this.resumeId = window.setTimeout(() => {
        this.resumeId = null
        if (this.pipelineListeners.size > 0) this.startLoop()
      }, PAUSE_MS)
    })
  }

  getAlerts() {
    return this.catalog
  }

  subscribeNewAlerts(onAlert: (alert: Scenario) => void) {
    this.alertListeners.add(onAlert)
    return () => {
      this.alertListeners.delete(onAlert)
    }
  }

  getInvestigation(alertId: string) {
    const scenario = this.catalog.find((item) => item.id === alertId)
    if (!scenario) return null
    return {
      id: scenario.id,
      title: scenario.title,
      brokenStage: scenario.brokenStage,
      sources: SOURCES.map((source) => ({ ...source })),
      agents: AGENTS.map((agent) => ({
        id: agent.id,
        label: agent.label,
        description: agent.description,
        output: scenario.agentOutputs[agent.id],
      })),
    }
  }

  getVerdict(alertId: string) {
    const scenario = this.catalog.find((item) => item.id === alertId)
    if (!scenario) return null
    return { id: scenario.id, title: scenario.title, ...scenario.verdict }
  }

  getLiveAnalysis(alertId: string, onToken: (token: string) => void) {
    const scenario = this.catalog.find((item) => item.id === alertId)
    if (!scenario) return () => {}
    const parts = scenario.agentOutputs.analyst.summary.split(/(\s+)/).filter((part) => part.length > 0)
    let index = 0
    let tokenTimer: number | null = null
    const thinkTimer = window.setTimeout(() => {
      tokenTimer = window.setInterval(() => {
        if (index >= parts.length) {
          if (tokenTimer !== null) window.clearInterval(tokenTimer)
          tokenTimer = null
          return
        }
        onToken(parts[index])
        index += 1
      }, LIVE_TOKEN_MS)
    }, LIVE_THINK_MS)
    return () => {
      window.clearTimeout(thinkTimer)
      if (tokenTimer !== null) window.clearInterval(tokenTimer)
    }
  }

  private startLoop() {
    this.clearInterval()
    this.clearResume()
    const queue = this.buildQueue()
    const tick = () => {
      const next = queue[this.queueIndex % queue.length]
      this.queueIndex += 1
      this.cycle += 1
      this.play(next.type, next.scenario)
    }
    tick()
    this.intervalId = window.setInterval(tick, STAGE_MS * STAGES.length + PAUSE_MS)
  }

  private play(type: 'clean' | 'dirty', scenario?: Scenario, onSettled?: () => void) {
    this.clearStageTimers()
    this.emit({
      cycle: this.cycle,
      type,
      scenario: scenario ?? null,
      activeStage: -1,
      phase: 'flowing',
    })
    STAGES.forEach((_, index) => {
      this.stageTimers.push(
        window.setTimeout(() => {
          this.emit({ ...this.current, activeStage: index, phase: 'flowing' })
        }, index * STAGE_MS),
      )
    })
    const tail = type === 'dirty' ? 400 : 200
    this.stageTimers.push(
      window.setTimeout(() => {
        const phase = type === 'dirty' ? 'alerting' : 'done'
        this.emit({
          ...this.current,
          activeStage: STAGES.length - 1,
          phase,
        })
        if (type === 'dirty' && scenario) this.publishAlert(scenario)
        onSettled?.()
      }, STAGES.length * STAGE_MS + tail),
    )
  }

  private buildQueue(): QueueItem[] {
    const queue: QueueItem[] = []
    this.catalog.forEach((scenario) => {
      queue.push({ type: 'clean' })
      queue.push({ type: 'dirty', scenario })
    })
    return queue
  }

  private publishAlert(alert: Scenario) {
    this.alertListeners.forEach((listener) => listener(alert))
  }

  private emit(event: PipelineEvent) {
    this.current = event
    this.pipelineListeners.forEach((listener) => listener(event))
  }

  private stopLoop() {
    this.clearInterval()
    this.clearResume()
    this.clearStageTimers()
  }

  private clearInterval() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private clearResume() {
    if (this.resumeId !== null) {
      window.clearTimeout(this.resumeId)
      this.resumeId = null
    }
  }

  private clearStageTimers() {
    this.stageTimers.forEach((timer) => window.clearTimeout(timer))
    this.stageTimers = []
  }
}
