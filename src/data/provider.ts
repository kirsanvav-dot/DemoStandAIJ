import type { AgentId, AgentOutput, Scenario, ScenarioId, StageDef, StageId } from './scenarios'

export type DataProviderKind = 'mock' | 'remote'

export type PipelinePhase = 'flowing' | 'alerting' | 'done'

export type PipelineEvent = {
  cycle: number
  type: 'clean' | 'dirty'
  scenario: Scenario | null
  activeStage: number
  phase: PipelinePhase
}

export type InvestigationSource = {
  id: string
  label: string
  sublabel: string
}

export type InvestigationAgent = {
  id: AgentId
  label: string
  description: string
  output: AgentOutput
}

export type Investigation = {
  id: ScenarioId
  title: string
  brokenStage: StageId
  sources: InvestigationSource[]
  agents: InvestigationAgent[]
}

export type VerdictView = Scenario['verdict'] & {
  id: ScenarioId
  title: string
}

export interface DataProvider {
  readonly kind: DataProviderKind
  /** Подпись для оператора: «демо-данные» или «живой контур». */
  readonly modeLabel: string
  getPipelineStages(): StageDef[]
  subscribePipelineEvents(onEvent: (event: PipelineEvent) => void): () => void
  /** Принудительный грязный прогон в обход idle-цикла. */
  playDirtyRun(alertId: string): void
  getAlerts(): Scenario[]
  subscribeNewAlerts(onAlert: (alert: Scenario) => void): () => void
  getInvestigation(alertId: string): Investigation | null
  getVerdict(alertId: string): VerdictView | null
  /**
   * Стриминг итога Агента-Аналитика.
   * Мок эмулирует токены заранее записанного текста.
   */
  getLiveAnalysis(alertId: string, onToken: (token: string) => void): () => void
}
