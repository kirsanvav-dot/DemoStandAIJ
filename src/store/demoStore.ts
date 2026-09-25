import { create } from 'zustand'
import type { Scenario, ScenarioId } from '../data/scenarios'

export type ScreenId = 'pipeline' | 'alerts' | 'analysis' | 'verdict'

type DemoState = {
  screen: ScreenId
  selected: Scenario | null
  resolved: ScenarioId[]
  setScreen: (screen: ScreenId) => void
  selectScenario: (scenario: Scenario) => void
  markResolved: (id: ScenarioId) => void
  reset: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
  screen: 'pipeline',
  selected: null,
  resolved: [],
  setScreen: (screen) => set({ screen }),
  selectScenario: (scenario) => set({ selected: scenario, screen: 'analysis' }),
  markResolved: (id) =>
    set((state) => ({
      resolved: state.resolved.includes(id) ? state.resolved : [...state.resolved, id],
    })),
  reset: () => set({ screen: 'pipeline', selected: null, resolved: [] }),
}))
