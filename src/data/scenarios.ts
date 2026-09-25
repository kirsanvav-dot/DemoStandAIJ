// TODO: заменить на live-фид событий — сценарии и выводы агентов сейчас записаны заранее.
// На стенде итог Агента-Аналитика формирует GigaChat.

export type ScenarioId =
  | 'geo_missing'
  | 'device_missing'
  | 'mcc_missing'
  | 'history_missing'

export type StageId =
  | 'intake'
  | 'validation'
  | 'enrichment'
  | 'attributes'
  | 'rules'
  | 'verdict'

export type AgentId = 'expert' | 'statistic' | 'detective' | 'analyst'
export type AgentStatus = 'confirmed' | 'recovered' | 'unavailable'
export type VerdictStatus = 'confirmed' | 'recovered' | 'unavailable'
export type RiskLevel = 'high' | 'medium' | 'low'

export type StageDef = {
  id: StageId
  label: string
  sublabel: string
  attributes: string[]
}

export type AgentOutput = {
  status: AgentStatus
  summary: string
  detail: string
}

export type Scenario = {
  id: ScenarioId
  title: string
  attributeName: string
  source: string
  brokenStage: StageId
  downstream: string
  channel: string
  timestamp: string
  severity: 1 | 2 | 3
  missingChip: string
  agentOutputs: Record<AgentId, AgentOutput>
  verdict: {
    status: VerdictStatus
    reason: string
    technicalDetail: string
    recommendation: string
    scoringImpact: string
    riskLevel: RiskLevel
  }
}

export const STAGES: StageDef[] = [
  {
    id: 'intake',
    label: 'Входящее событие',
    sublabel: 'Event intake',
    attributes: ['event_id', 'channel', 'timestamp'],
  },
  {
    id: 'validation',
    label: 'Валидация контракта',
    sublabel: 'L1 contract validation',
    attributes: ['contract_version', 'required_fields_ok'],
  },
  {
    id: 'enrichment',
    label: 'Обогащение данных',
    sublabel: 'Enrichers',
    attributes: ['geo', 'device_id', 'mcc', 'ip_reputation'],
  },
  {
    id: 'attributes',
    label: 'Расчёт атрибутов',
    sublabel: 'ФП ДО / ПКБ',
    attributes: ['online_facts', 'interval_facts', 'behavioral_score'],
  },
  {
    id: 'rules',
    label: 'Применение правил',
    sublabel: 'Rule engine',
    attributes: ['rule_hits', 'risk_score'],
  },
  {
    id: 'verdict',
    label: 'Вердикт',
    sublabel: 'Decision',
    attributes: ['decision'],
  },
]

export const AGENTS: Array<{
  id: AgentId
  label: string
  description: string
  sourceId: string | null
}> = [
  {
    id: 'expert',
    label: 'Агент-Эксперт',
    description: 'Проверяет требования DataContract: обязателен ли атрибут по контракту канала',
    sourceId: 'data_contracts',
  },
  {
    id: 'statistic',
    label: 'Агент-Статистика',
    description: 'Оценивает критичность атрибута через справочник связей',
    sourceId: 'attr_links',
  },
  {
    id: 'detective',
    label: 'Агент-Детектив',
    description: 'Восстанавливает историю заполнения атрибута через ПКБ / поток событий',
    sourceId: 'pkb_stream',
  },
  {
    id: 'analyst',
    label: 'Агент-Аналитик',
    description: 'Синтезирует выводы всех агентов, снимает противоречия, формирует итог',
    sourceId: null,
  },
]

export const SOURCES = [
  { id: 'data_contracts', label: 'DataContracts', sublabel: 'Реестр контрактов' },
  { id: 'attr_links', label: 'Справочник связей', sublabel: 'Атрибуты и зависимости' },
  { id: 'pkb_stream', label: 'ПКБ / поток событий', sublabel: 'История операций' },
] as const

export function stageIndex(id: StageId): number {
  return STAGES.findIndex((stage) => stage.id === id)
}

// TODO: заменить на live-фид событий
export const scenarios: Scenario[] = [
  {
    id: 'geo_missing',
    title: 'Пропала гео-локация устройства',
    attributeName: 'geo_lat / geo_lon',
    source: 'Энричер «Гео» → mobile_sdk',
    brokenStage: 'enrichment',
    downstream:
      'Не рассчитывается атрибут «расстояние от привычных точек». Зависимые правила гео-аномалий не могут сработать.',
    channel: 'Мобильное приложение',
    timestamp: '14:32:07',
    severity: 2,
    missingChip: 'geo',
    agentOutputs: {
      expert: {
        status: 'confirmed',
        summary:
          'Гео-локация обязательна по контракту канала mobile_app v2.4. Поле geo_lat помечено как required.',
        detail:
          'DataContract: channel=mobile_app, version=2.4, field=geo_lat, constraint=required, source=mobile_sdk',
      },
      statistic: {
        status: 'confirmed',
        summary:
          'Атрибут geo связан с 4 зависимыми расчётами и 3 правилами гео-аномалий. Критичность — высокая.',
        detail:
          'Справочник связей: geo → distance_from_home, geo → velocity_check, geo → geo_fencing_rule, geo → anomaly_cluster',
      },
      detective: {
        status: 'recovered',
        summary:
          'Последний раз гео приходила 8 минут назад. За последние 24 часа — 99.2% заполненности по этому каналу.',
        detail: 'ПКБ: last_seen=14:24:03, fill_rate_24h=99.2%, missing_count=12, client_id=****7421',
      },
      analyst: {
        status: 'confirmed',
        summary:
          'Атрибут подтверждённо отсутствует. Кратковременный сбой энричера, не системная деградация. Рекомендуется повторный запрос.',
        detail:
          'Синтез: contract=required, criticality=high, history=transient_gap, verdict=retry_source',
      },
    },
    verdict: {
      status: 'confirmed',
      reason: 'Гео-локация устройства не поступила от мобильного SDK в момент обогащения.',
      technicalDetail:
        'Энричер «Гео» вернул пустой ответ. Контракт mobile_app v2.4 требует geo_lat/geo_lon как required-поля.',
      recommendation: 'Запросить у источника повторно (retry enrichment)',
      scoringImpact: 'Риск занижения скоринга: 3 правила гео-аномалий не сработали',
      riskLevel: 'medium',
    },
  },
  {
    id: 'device_missing',
    title: 'Пропал идентификатор устройства',
    attributeName: 'device_id (device fingerprint)',
    source: 'Валидация контракта (L1) → Энричер «Устройство»',
    brokenStage: 'validation',
    downstream:
      'Не строится профиль устройства. История операций по устройству недоступна, привязка к предыдущим событиям невозможна.',
    channel: 'Веб-канал',
    timestamp: '14:28:41',
    severity: 3,
    missingChip: 'device_id',
    agentOutputs: {
      expert: {
        status: 'confirmed',
        summary:
          'Device_id обязателен по контракту web_channel v1.8. Без него невозможно сопоставить сессии.',
        detail:
          'DataContract: channel=web, version=1.8, field=device_id, constraint=required, source=fingerprint_sdk',
      },
      statistic: {
        status: 'confirmed',
        summary:
          'Атрибут device_id связан с 6 зависимыми расчётами и 5 правилами. Критичность — критическая.',
        detail:
          'Справочник связей: device_id → device_profile, device_id → session_link, device_id → repeat_device_rule, device_id → velocity_by_device',
      },
      detective: {
        status: 'unavailable',
        summary:
          'Атрибут отсутствует с начала сессии. В ПКБ нет записей по этому device_id за последние 30 дней.',
        detail: 'ПКБ: last_seen=never, fill_rate_24h=0%, missing_count=all, client_id=****0387',
      },
      analyst: {
        status: 'confirmed',
        summary:
          'Атрибут подтверждённо отсутствует и не восстанавливается из истории. Вероятна проблема на стороне fingerprint SDK.',
        detail: 'Синтез: contract=required, criticality=critical, history=no_records, verdict=escalate',
      },
    },
    verdict: {
      status: 'confirmed',
      reason:
        'Идентификатор устройства не передан клиентским SDK. Профиль устройства не может быть построен.',
      technicalDetail:
        'Fingerprint SDK не вернул device_id. Контракт web v1.8 требует device_id как required-поле на стадии L1.',
      recommendation: 'Эскалировать в команду интеграции (fingerprint SDK)',
      scoringImpact: 'Критический риск: 5 правил и 6 расчётов затронуты',
      riskLevel: 'high',
    },
  },
  {
    id: 'mcc_missing',
    title: 'Пропал код категории мерчанта (MCC)',
    attributeName: 'mcc',
    source: 'Обогащение по справочникам → merchant_directory',
    brokenStage: 'enrichment',
    downstream:
      'Не работает правило по категориям повышенного риска. Скоринг идёт без учёта профиля мерчанта.',
    channel: 'Эквайринг',
    timestamp: '14:35:12',
    severity: 2,
    missingChip: 'mcc',
    agentOutputs: {
      expert: {
        status: 'confirmed',
        summary:
          'MCC не является строго обязательным по контракту, но помечен как recommended для канала acquiring.',
        detail:
          'DataContract: channel=acquiring, version=3.1, field=mcc, constraint=recommended, source=merchant_directory',
      },
      statistic: {
        status: 'confirmed',
        summary:
          'MCC связан с 2 правилами категорий повышенного риска и 1 расчётом профиля мерчанта. Критичность — средняя.',
        detail:
          'Справочник связей: mcc → high_risk_category_rule, mcc → merchant_profile, mcc → category_velocity',
      },
      detective: {
        status: 'recovered',
        summary:
          'MCC стабильно приходил до 14:30. Последние 5 минут — 40% пропусков, совпадает с обновлением справочника.',
        detail: 'ПКБ: last_seen=14:29:58, fill_rate_24h=97.8%, missing_window=5min, client_id=****1192',
      },
      analyst: {
        status: 'recovered',
        summary:
          'Атрибут восстанавливается из истории. Пропуск связан с обновлением справочника мерчантов. Использовать fallback.',
        detail: 'Синтез: contract=recommended, criticality=medium, history=transient_gap, verdict=use_fallback',
      },
    },
    verdict: {
      status: 'recovered',
      reason:
        'Код категории мерчанта временно недоступен из-за обновления справочника. Восстановлен из кэша истории.',
      technicalDetail:
        'Справочник merchant_directory обновлялся 14:30. MCC восстановлен из ПКБ по last_known_value.',
      recommendation: 'Использовать fallback-значение (last_known MCC из ПКБ)',
      scoringImpact: 'Низкий риск: 2 правила работают с fallback-значением',
      riskLevel: 'low',
    },
  },
  {
    id: 'history_missing',
    title: 'Пропала история операций клиента',
    attributeName: 'client_history (ФП ДО / ПКБ)',
    source: 'Расчёт фактов → online-facts / interval-facts',
    brokenStage: 'attributes',
    downstream:
      'Не рассчитываются поведенческие метрики. Скоринг идёт по неполному набору атрибутов.',
    channel: 'Мобильное приложение',
    timestamp: '14:40:33',
    severity: 3,
    missingChip: 'online_facts',
    agentOutputs: {
      expert: {
        status: 'confirmed',
        summary:
          'История операций требуется для расчёта online-facts и interval-facts по контракту mobile_app v2.4.',
        detail:
          'DataContract: channel=mobile_app, version=2.4, field=client_history, constraint=required_for_facts, source=fp_do_pkb',
      },
      statistic: {
        status: 'confirmed',
        summary:
          'История связана с 8 поведенческими метриками и 4 правилами. Критичность — критическая для скоринга.',
        detail:
          'Справочник связей: client_history → online_facts, client_history → interval_facts, client_history → behavioral_metrics, client_history → velocity_rules',
      },
      detective: {
        status: 'unavailable',
        summary: 'ПКБ не отвечает на запросы по этому клиенту. Таймаут на стороне ФП ДО. История недоступна.',
        detail: 'ПКБ: status=timeout, last_successful_query=14:15:00, error=connection_refused, client_id=****9034',
      },
      analyst: {
        status: 'unavailable',
        summary:
          'История недоступна для расчёта. Скоринг идёт по неполному набору атрибутов. Требуется эскалация.',
        detail:
          'Синтез: contract=required_for_facts, criticality=critical, history=unavailable, verdict=escalate',
      },
    },
    verdict: {
      status: 'unavailable',
      reason: 'История операций клиента недоступна. Сервис ФП ДО / ПКБ не отвечает на запросы.',
      technicalDetail:
        'Таймаут соединения с ПКБ. online-facts и interval-facts не рассчитаны. Скоринг по 8 поведенческим метрикам пропущен.',
      recommendation: 'Эскалировать в команду ФП ДО / ПКБ (инцидент инфраструктуры)',
      scoringImpact: 'Критический риск: скоринг по неполному набору, 8 метрик пропущено',
      riskLevel: 'high',
    },
  },
]

export function getScenario(id: ScenarioId): Scenario {
  const found = scenarios.find((item) => item.id === id)
  if (!found) throw new Error(`Unknown scenario: ${id}`)
  return found
}
