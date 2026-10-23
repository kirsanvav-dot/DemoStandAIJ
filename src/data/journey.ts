// Сценарий полного цикла: АРМ Обращений → разбор данных → RCA → условия → АРМ Аналитика.
// Все данные вымышленные (демо). TODO: заменить на ответы backend-оркестратора.
import type { ScenarioId } from './scenarios'

export type CaseId = 'c-device' | 'c-mcc' | 'c-self'

export type CaseStatus = 'new' | 'review' | 'closed'

export type CaseRow = {
  eventId: string
  time: string
  client: string
  inn: string
  counterparty: string
  counterpartyNote: string
  amount: string
  operation: string
  rule: string
  ruleName: string
  channel: string
  city: string
  status: CaseStatus
  caseId: CaseId | null
  flag: string | null
}

export type CaseAction = 'defect' | 'rule'

export type DiffLine = { text: string; change: 'same' | 'removed' | 'added' }

export type Basis = { label: string; text: string; needsRca?: boolean }

export type RcaStep = {
  source: string
  title: string
  finding: string
  detail: string
  chart?: boolean
}

export type ConditionChange = { key: string; from: string; to: string; why: string }

export type JourneyCase = {
  id: CaseId
  eventId: string
  /** Сценарий для экрана «Разбор проблемы данных» (4 агента). */
  scenarioId: ScenarioId | null
  attribute: string | null
  assistant: {
    summary: string
    facts: string[]
    recommendation: string
    action: CaseAction
  }
  analysis: {
    kind: 'optional' | 'needs_rca'
    headline: string
    text: string
  } | null
  rca: {
    steps: RcaStep[]
    latency: Array<{ t: string; ms: number }>
    timeoutMs: number
    conclusion: string
  } | null
  conditions: {
    changes: ConditionChange[]
    forecast: string
    note: string
  } | null
  rule: {
    id: string
    name: string
    current: DiffLine[]
    proposed: DiffLine[]
    basis: Basis[]
    effect: string
    related: number
  }
}

export const QUEUE_TOTAL = 128

export const caseRows: CaseRow[] = [
  {
    eventId: 'DEMO-204817',
    time: '14:52:18',
    client: 'ООО «Северный контур»',
    inn: '7700001000',
    counterparty: 'ООО «Орбита решений»',
    counterpartyNote: 'Получатель',
    amount: '1 250 000,00 ₽',
    operation: 'Перевод · RUB',
    rule: 'DEMO_RULE_014',
    ruleName: 'Новое устройство',
    channel: 'Веб',
    city: 'Москва',
    status: 'new',
    caseId: 'c-device',
    flag: 'пустой device_id',
  },
  {
    eventId: 'DEMO-204816',
    time: '14:51:02',
    client: 'ООО «Вектор систем»',
    inn: '7700001001',
    counterparty: 'ООО «Модуль поставок»',
    counterpartyNote: 'Мерчант',
    amount: '185 400,50 ₽',
    operation: 'Оплата · RUB',
    rule: 'DEMO_RULE_007',
    ruleName: 'Категория повышенного риска',
    channel: 'Эквайринг',
    city: 'Казань',
    status: 'review',
    caseId: 'c-mcc',
    flag: 'нет MCC',
  },
  {
    eventId: 'DEMO-204815',
    time: '14:49:47',
    client: 'ООО «Новая траектория»',
    inn: '7700001002',
    counterparty: 'ООО «Новая траектория»',
    counterpartyNote: 'Свой счёт, другой банк',
    amount: '3 400 000,00 ₽',
    operation: 'Перевод · RUB',
    rule: 'DEMO_RULE_021',
    ruleName: 'Крупный перевод новому получателю',
    channel: 'Веб',
    city: 'Москва',
    status: 'new',
    caseId: 'c-self',
    flag: 'знакомый шаблон',
  },
  {
    eventId: 'DEMO-204814',
    time: '14:48:30',
    client: 'ООО «Спектр технологий»',
    inn: '7700001003',
    counterparty: 'ООО «Новая линия»',
    counterpartyNote: 'Получатель',
    amount: '1 345 000,00 ₽',
    operation: 'Перевод · RUB',
    rule: 'DEMO_RULE_004',
    ruleName: 'Нетипичная сумма',
    channel: 'Веб',
    city: 'Казань',
    status: 'review',
    caseId: null,
    flag: null,
  },
  {
    eventId: 'DEMO-204813',
    time: '14:47:12',
    client: 'ООО «Модуль логистики»',
    inn: '7700001004',
    counterparty: 'ООО «Северные проекты»',
    counterpartyNote: 'Получатель',
    amount: '9 800,00 ₽',
    operation: 'Перевод · RUB',
    rule: 'DEMO_RULE_005',
    ruleName: 'Серия мелких переводов',
    channel: 'Мобильное приложение',
    city: 'Москва',
    status: 'new',
    caseId: null,
    flag: null,
  },
  {
    eventId: 'DEMO-204812',
    time: '14:45:56',
    client: 'ООО «Точка сборки»',
    inn: '7700001005',
    counterparty: 'ООО «Базис логистики»',
    counterpartyNote: 'Получатель',
    amount: '450 000,00 ₽',
    operation: 'Перевод · RUB',
    rule: 'DEMO_RULE_006',
    ruleName: 'Смена реквизитов',
    channel: 'Веб',
    city: 'Казань',
    status: 'review',
    caseId: null,
    flag: null,
  },
  {
    eventId: 'DEMO-204811',
    time: '14:44:09',
    client: 'ООО «Ладья плюс»',
    inn: '7700001006',
    counterparty: 'ООО «Прайм сервис»',
    counterpartyNote: 'Получатель',
    amount: '72 000,00 ₽',
    operation: 'Перевод · RUB',
    rule: 'DEMO_RULE_003',
    ruleName: 'Ночная активность',
    channel: 'Мобильное приложение',
    city: 'Екатеринбург',
    status: 'new',
    caseId: null,
    flag: null,
  },
]

export const journeyCases: JourneyCase[] = [
  {
    id: 'c-device',
    eventId: 'DEMO-204817',
    scenarioId: 'device_missing',
    attribute: 'device_id',
    assistant: {
      summary:
        'Правило «Новое устройство» сработало потому, что в событии пустой device_id, а не потому, что устройство новое. За последние 40 минут так же сработали ещё 36 обращений веб-канала. Похоже на дефект данных, а не на поведение клиента.',
      facts: ['device_id: пусто', 'DEMO_RULE_014 сработало на пустом поле', '37 похожих обращений за 40 мин', 'канал: Веб'],
      recommendation: 'Разобрать дефект данных',
      action: 'defect',
    },
    analysis: {
      kind: 'needs_rca',
      headline: 'Поле обязательное, но массово не доходит',
      text: 'Пропуски начались одномоментно в 13:47 и затрагивают весь веб-канал. Это сбой в цепочке обработки — нужно найти, где именно теряется device_id.',
    },
    rca: {
      steps: [
        {
          source: 'Трейсы оркестратора',
          title: 'Трассировка события',
          finding:
            'Событие прошло L1-валидацию. Вызов энричера «Устройство» оркестратор оборвал по таймауту 800 мс — device_id записан пустым.',
          detail: 'trace: orchestrator → enricher.device → fingerprint-service · status=TIMEOUT · waited=800ms',
        },
        {
          source: 'Метрики модулей (L5)',
          title: 'Задержка модуля',
          finding:
            'Время ответа fingerprint-service (p99) выросло с 420 мс до 1 840 мс в 13:47. Таймаут оркестратора — 800 мс: 38% вызовов обрываются.',
          detail: 'metric: fingerprint_service_latency_p99 · timeout: orchestrator.enricher.device.timeout_ms=800',
          chart: true,
        },
        {
          source: 'Журнал релизов',
          title: 'Что изменилось',
          finding:
            '13:45 — релиз fingerprint-service v3.12 (новый алгоритм расчёта отпечатка). Совпадает с началом деградации.',
          detail: 'release: fingerprint-service 3.11.4 → 3.12.0 · 13:45 · owner: команда клиентских SDK',
        },
        {
          source: 'ПКБ / поток событий',
          title: 'Масштаб',
          finding: 'С 13:47 затронуто 2 140 событий веб-канала. Мобильный канал не затронут — у него свой SDK.',
          detail: 'ПКБ: channel=web, device_id=null, window=13:47–14:52, events=2140; channel=mobile: 0',
        },
      ],
      latency: [
        { t: '13:00', ms: 410 },
        { t: '13:10', ms: 425 },
        { t: '13:20', ms: 405 },
        { t: '13:30', ms: 430 },
        { t: '13:40', ms: 420 },
        { t: '13:50', ms: 1760 },
        { t: '14:00', ms: 1840 },
        { t: '14:10', ms: 1800 },
        { t: '14:20', ms: 1820 },
        { t: '14:30', ms: 1790 },
        { t: '14:40', ms: 1830 },
        { t: '14:50', ms: 1810 },
      ],
      timeoutMs: 800,
      conclusion:
        'Первопричина — таймаут на стороне модуля fingerprint-service после релиза v3.12. Модуль отвечает, но дольше, чем ждёт оркестратор, — поэтому device_id приходит пустым.',
    },
    conditions: {
      changes: [
        {
          key: 'orchestrator.enricher.device.timeout_ms',
          from: '800',
          to: '1500',
          why: 'После релиза модуль отвечает медленнее; 1 500 мс покрывают основную массу ответов',
        },
        {
          key: 'orchestrator.enricher.device.retry',
          from: '0',
          to: '1 (через 200 мс)',
          why: 'Единичные долгие ответы добирает повтор',
        },
        {
          key: 'enricher.device.fallback',
          from: 'нет',
          to: 'device_hash, device_id_source=fallback',
          why: 'Событие не уходит в скоринг с пустым device_id',
        },
        {
          key: 'monitoring.L5.fingerprint_p99',
          from: 'нет',
          to: 'алерт при > 1 000 мс 5 мин',
          why: 'Следующую деградацию увидим до того, как она дойдёт до правил',
        },
      ],
      forecast: 'Доля пустых device_id: 38% → менее 1% (оценка по трейсам за последний час)',
      note: 'Условия обработки согласует владелец модуля. Правило DEMO_RULE_014 нужно поправить отдельно: оно считало пустой device_id новым устройством.',
    },
    rule: {
      id: 'DEMO_RULE_014',
      name: 'Новое устройство',
      current: [
        { text: 'ЕСЛИ device_id не встречался у клиента за 90 дней', change: 'same' },
        { text: '   ИЛИ device_id пустой', change: 'removed' },
        { text: 'ТО риск +35, обращение на проверку', change: 'same' },
      ],
      proposed: [
        { text: 'ЕСЛИ device_id не встречался у клиента за 90 дней', change: 'same' },
        { text: '   И device_id_source ≠ fallback', change: 'added' },
        { text: 'ТО риск +35, обращение на проверку', change: 'same' },
        { text: 'ЕСЛИ device_id пустой — не повышать риск, ставить метку «дефект данных»', change: 'added' },
      ],
      basis: [
        { label: 'Разбор данных', text: 'device_id обязателен по контракту web v1.8; пропуски массовые с 13:47' },
        { label: 'RCA', text: 'таймаут оркестратора к fingerprint-service после релиза v3.12', needsRca: true },
        { label: 'Условия', text: 'таймаут 800 → 1 500 мс, retry, fallback device_hash', needsRca: true },
      ],
      effect: 'Пустой device_id больше не превращается в «новое устройство» и не создаёт обращений',
      related: 37,
    },
  },
  {
    id: 'c-mcc',
    eventId: 'DEMO-204816',
    scenarioId: 'mcc_missing',
    attribute: 'mcc',
    assistant: {
      summary:
        'Правило «Категория повышенного риска» добавило +40 к риску из-за пустого MCC. Сам платёж для клиента типичный: тот же мерчант — 23 операции за 90 дней. Стоит проверить, должен ли MCC вообще приходить.',
      facts: ['mcc: пусто', 'DEMO_RULE_007: +40 за отсутствие MCC', 'мерчант знаком: 23 операции за 90 дней'],
      recommendation: 'Разобрать дефект данных',
      action: 'defect',
    },
    analysis: {
      kind: 'optional',
      headline: 'Поле опциональное — данные в порядке',
      text: 'По контракту acquiring v3.1 MCC — рекомендуемое, а не обязательное поле, и 6% операций штатно приходят без него. Ошибка не в данных, а в логике правила: оно считает отсутствие MCC признаком риска.',
    },
    rca: null,
    conditions: null,
    rule: {
      id: 'DEMO_RULE_007',
      name: 'Категория повышенного риска',
      current: [
        { text: 'ЕСЛИ mcc ∈ список повышенного риска', change: 'same' },
        { text: '   ИЛИ mcc отсутствует', change: 'removed' },
        { text: 'ТО риск +40', change: 'same' },
      ],
      proposed: [
        { text: 'ЕСЛИ mcc отсутствует — взять категорию из профиля мерчанта', change: 'added' },
        { text: 'ЕСЛИ mcc ∈ список повышенного риска', change: 'same' },
        { text: 'ТО риск +40', change: 'same' },
      ],
      basis: [
        { label: 'Разбор данных', text: 'mcc — опциональное поле контракта acquiring v3.1' },
        { label: 'История', text: '6% операций эквайринга штатно без MCC, всплесков за 90 дней нет' },
      ],
      effect: 'Отсутствие MCC больше не добавляет риск само по себе',
      related: 9,
    },
  },
  {
    id: 'c-self',
    eventId: 'DEMO-204815',
    scenarioId: null,
    attribute: null,
    assistant: {
      summary:
        'Шаблон знаком: получатель — сам клиент (ИНН совпадает), счёт в другом банке. За неделю 14 таких обращений, все аналитики закрыли как легитимные. Данные полные — разбор не нужен, нужна правка правила.',
      facts: ['ИНН отправителя = ИНН получателя', '14 похожих обращений за 7 дней', 'все закрыты: легитимно'],
      recommendation: 'Сразу к правилу',
      action: 'rule',
    },
    analysis: null,
    rca: null,
    conditions: null,
    rule: {
      id: 'DEMO_RULE_021',
      name: 'Крупный перевод новому получателю',
      current: [
        { text: 'ЕСЛИ сумма > 1 000 000 ₽', change: 'same' },
        { text: '   И получатель новый для клиента', change: 'same' },
        { text: 'ТО обращение на проверку', change: 'same' },
      ],
      proposed: [
        { text: 'ЕСЛИ сумма > 1 000 000 ₽', change: 'same' },
        { text: '   И получатель новый для клиента', change: 'same' },
        { text: '   И ИНН получателя ≠ ИНН отправителя', change: 'added' },
        { text: 'ТО обращение на проверку', change: 'same' },
      ],
      basis: [
        { label: 'Агент-ассистент', text: '14 обращений за 7 дней по этому шаблону, все закрыты как легитимные' },
      ],
      effect: 'Переводы между своими счетами больше не попадают в очередь',
      related: 14,
    },
  },
]

export function findCase(id: CaseId | null): JourneyCase | null {
  if (!id) return null
  return journeyCases.find((item) => item.id === id) ?? null
}
