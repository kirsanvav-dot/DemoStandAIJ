import type { DataProvider } from './provider'

// TODO: подключить WS/REST к backend-оркестратору
export class RemoteDataProvider implements DataProvider {
  readonly kind = 'remote' as const
  readonly modeLabel = 'живой контур'

  getPipelineStages() {
    return []
  }

  subscribePipelineEvents() {
    return () => {}
  }

  playDirtyRun() {}

  getAlerts() {
    return []
  }

  subscribeNewAlerts() {
    return () => {}
  }

  getInvestigation() {
    return null
  }

  getVerdict() {
    return null
  }

  getLiveAnalysis() {
    return () => {}
  }
}
