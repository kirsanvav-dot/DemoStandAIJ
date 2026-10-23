// Сценарий полного цикла: АРМ Обращений → разбор данных → RCA (чат и расследование) → АРМ Аналитика: правило → АРМ Аналитика: эффективность.
// Все данные вымышленные (демо). Сквозной кейс DEMO-204817 лежит в happy-path.json,
// здесь — фоновая очередь и два дополнительных кейса. TODO: заменить на ответы backend-оркестратора.
import { happyPath } from './happyPath'
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

/** Описание правила в АРМ Аналитика: почему сработало неверно и что правило проверяет теперь. */
export type RuleDescription = { whyWrong: string; checks: string[] }

export type ReportMetric = { label: string; before: string; after: string; note?: string }

/** Отчёт об эффективности правила после активации. */
export type RuleReport = {
  period: string
  /** Час активации — совпадает с одной из точек hourly. */
  activatedAt: string
  metrics: ReportMetric[]
  hourly: Array<{ t: string; hits: number }>
  conclusion: string
}

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
  /** Запуск RCA из рабочего чата: что спрашивает аналитик и что отвечает агент. */
  chat: {
    agent: string
    prompt: string
    ack: string
  } | null
  rca: {
    steps: RcaStep[]
    latency: Array<{ t: string; ms: number }>
    timeoutMs: number
    conclusion: string
  } | null
  rule: {
    id: string
    name: string
    description: RuleDescription
    current: DiffLine[]
    proposed: DiffLine[]
    basis: Basis[]
    effect: string
    related: number
  }
  report: RuleReport
}

export const QUEUE_TOTAL = 128

export const caseRows: CaseRow[] = [
  happyPath.queueRow,
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
  happyPath.journey,
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
    chat: null,
    rca: null,
    rule: {
      id: 'DEMO_RULE_007',
      name: 'Категория повышенного риска',
      description: {
        whyWrong:
          'Правило считало отсутствие MCC признаком риска. По контракту acquiring v3.1 поле рекомендуемое: 6% операций штатно приходят без него, и все они получали +40.',
        checks: [
          'MCC мерчанта входит в список повышенного риска',
          'если MCC не пришёл — категория берётся из профиля мерчанта',
        ],
      },
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
    report: {
      period: 'первые 6 часов после активации',
      activatedAt: '15:00',
      metrics: [
        { label: 'Срабатываний правила в час', before: '12', after: '5' },
        { label: 'Доля ложных срабатываний', before: '71%', after: '18%' },
        { label: 'Операций без MCC с повышенным риском', before: '6%', after: '0%' },
        { label: 'Подтверждённый фрод, пойманный правилом', before: '1', after: '1', note: 'правило не ослабло' },
      ],
      hourly: [
        { t: '09:00', hits: 11 },
        { t: '10:00', hits: 13 },
        { t: '11:00', hits: 12 },
        { t: '12:00', hits: 14 },
        { t: '13:00', hits: 12 },
        { t: '14:00', hits: 11 },
        { t: '15:00', hits: 6 },
        { t: '16:00', hits: 5 },
        { t: '17:00', hits: 4 },
        { t: '18:00', hits: 5 },
        { t: '19:00', hits: 5 },
        { t: '20:00', hits: 4 },
      ],
      conclusion:
        'Правило перестало штрафовать операции без MCC: срабатываний стало вдвое меньше, а фрод в категориях повышенного риска оно ловит по-прежнему.',
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
    chat: null,
    rca: null,
    rule: {
      id: 'DEMO_RULE_021',
      name: 'Крупный перевод новому получателю',
      description: {
        whyWrong:
          'Правило не отличало перевод на собственный счёт в другом банке от перевода чужому лицу: «новый получатель» определялся по счёту, а не по ИНН.',
        checks: [
          'сумма больше 1 000 000 ₽',
          'получатель новый для клиента',
          'получатель — другое лицо: ИНН не совпадает с ИНН отправителя',
        ],
      },
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
    report: {
      period: 'первые 6 часов после активации',
      activatedAt: '15:00',
      metrics: [
        { label: 'Срабатываний правила в час', before: '4', after: '2' },
        { label: 'Доля ложных срабатываний', before: '58%', after: '9%' },
        { label: 'Переводов на свой счёт в очереди', before: '14 за неделю', after: '0' },
        { label: 'Подтверждённый фрод, пойманный правилом', before: '1', after: '1', note: 'правило не ослабло' },
      ],
      hourly: [
        { t: '09:00', hits: 3 },
        { t: '10:00', hits: 5 },
        { t: '11:00', hits: 4 },
        { t: '12:00', hits: 4 },
        { t: '13:00', hits: 5 },
        { t: '14:00', hits: 4 },
        { t: '15:00', hits: 2 },
        { t: '16:00', hits: 2 },
        { t: '17:00', hits: 1 },
        { t: '18:00', hits: 2 },
        { t: '19:00', hits: 2 },
        { t: '20:00', hits: 1 },
      ],
      conclusion:
        'Переводы между своими счетами больше не попадают в очередь; переводы другим лицам на крупные суммы правило проверяет так же, как раньше.',
    },
  },
]

export function findCase(id: CaseId | null): JourneyCase | null {
  if (!id) return null
  return journeyCases.find((item) => item.id === id) ?? null
}
