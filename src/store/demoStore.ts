import { create } from 'zustand'
import { getScenario, type Scenario, type ScenarioId } from '../data/scenarios'
import type { CaseId } from '../data/journey'

/**
 * pipeline — заставка-конвейер (idle на плазме)
 * arm — АРМ Обращений · analysis — разбор проблемы данных · chat — запуск RCA из рабочего чата
 * rca — поиск первопричины · rule — АРМ Аналитика: описание правила
 * report — АРМ Аналитика: отчёт об эффективности правила после активации
 * alerts / verdict — экраны первой версии демо, в полном цикле не используются
 */
export type ScreenId =
  | 'pipeline'
  | 'arm'
  | 'analysis'
  | 'chat'
  | 'rca'
  | 'rule'
  | 'report'
  | 'alerts'
  | 'verdict'

export type ClosedCase = { caseId: CaseId; related: number; ruleId: string }

type DemoState = {
  screen: ScreenId
  selected: Scenario | null
  resolved: ScenarioId[]
  caseId: CaseId | null
  visited: ScreenId[]
  closed: ClosedCase[]
  lastClosed: ClosedCase | null
  setScreen: (screen: ScreenId) => void
  selectScenario: (scenario: Scenario) => void
  markResolved: (id: ScenarioId) => void
  openCase: (caseId: CaseId, scenarioId: ScenarioId | null) => void
  go: (screen: ScreenId) => void
  closeCase: (closed: ClosedCase) => void
  dismissToast: () => void
  reset: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
  screen: 'pipeline',
  selected: null,
  resolved: [],
  caseId: null,
  visited: [],
  closed: [],
  lastClosed: null,
  setScreen: (screen) => set({ screen }),
  selectScenario: (scenario) => set({ selected: scenario, screen: 'analysis' }),
  markResolved: (id) =>
    set((state) => ({
      resolved: state.resolved.includes(id) ? state.resolved : [...state.resolved, id],
    })),
  openCase: (caseId, scenarioId) =>
    set({
      caseId,
      selected: scenarioId ? getScenario(scenarioId) : null,
      visited: ['arm'],
    }),
  go: (screen) =>
    set((state) => ({
      screen,
      visited: state.visited.includes(screen) ? state.visited : [...state.visited, screen],
    })),
  closeCase: (closed) =>
    set((state) => ({
      screen: 'arm',
      caseId: null,
      selected: null,
      visited: [],
      closed: [...state.closed.filter((item) => item.caseId !== closed.caseId), closed],
      lastClosed: closed,
    })),
  dismissToast: () => set({ lastClosed: null }),
  reset: () =>
    set({
      screen: 'pipeline',
      selected: null,
      resolved: [],
      caseId: null,
      visited: [],
      closed: [],
      lastClosed: null,
    }),
}))
