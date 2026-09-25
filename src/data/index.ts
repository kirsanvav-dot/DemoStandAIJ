import { MockDataProvider } from './mockProvider'
import type { DataProvider, DataProviderKind } from './provider'
import { RemoteDataProvider } from './remoteProvider'

export type { DataProvider, DataProviderKind, Investigation, PipelineEvent, VerdictView } from './provider'

function kindFromEnv(): DataProviderKind {
  return import.meta.env.VITE_DATA_PROVIDER === 'remote' ? 'remote' : 'mock'
}

let singleton: DataProvider | null = null

export function getDataProvider(): DataProvider {
  if (!singleton) {
    singleton = kindFromEnv() === 'remote' ? new RemoteDataProvider() : new MockDataProvider()
  }
  return singleton
}
