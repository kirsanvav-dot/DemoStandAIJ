// Сквозной кейс (хэппи-пасс) из единого JSON. Все вкладки берут его отсюда, а не из своих копий.
// Структура и атрибутный состав — docs/data-contract.md.
import raw from './happy-path.json'
import type { CaseRow, JourneyCase } from './journey'
import type { Scenario } from './scenarios'

export type HappyPath = {
  /** Строка очереди в АРМ Обращений. */
  queueRow: CaseRow
  /** Разбор проблемы данных 4 агентами и событие на заставке-конвейере. */
  scenario: Scenario
  /** Полный цикл: ассистент → разбор → чат → RCA → правило → отчёт. */
  journey: JourneyCase
}

export const happyPath = raw as HappyPath
