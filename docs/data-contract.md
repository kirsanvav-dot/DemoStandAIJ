# Контракт данных сквозного кейса

Задачи 8 и 9: один JSON на весь кейс и список атрибутов, которые части стенда передают друг другу.

- **Файл:** `src/data/happy-path.json`
- **Типы:** `src/data/happyPath.ts`, `src/data/journey.ts` (`JourneyCase`, `CaseRow`), `src/data/scenarios.ts` (`Scenario`)
- **Интерфейс для backend:** `src/data/provider.ts` (`DataProvider`). Мок читает JSON, живой контур (`remoteProvider.ts`) должен отдавать те же структуры.

Изменение структуры — только через запись в [decisions.md](decisions.md) и правку типов. После правки проверяем, что `npm run build` проходит.

## Верхний уровень

| Ключ | Тип | Кто читает |
|---|---|---|
| `queueRow` | `CaseRow` | АРМ Обращений: строка очереди |
| `scenario` | `Scenario` | Заставка-конвейер и разбор данных 4 агентами |
| `journey` | `JourneyCase` | Все экраны полного цикла |

Связь между частями: `queueRow.caseId = journey.id`, `journey.scenarioId = scenario.id`, `queueRow.eventId = journey.eventId`.

## Атрибутный состав по этапам

Каждая строка — что этап получает на вход и что отдаёт следующему.

### 0. Заставка-конвейер

| Вход | Откуда |
|---|---|
| `scenario.title`, `scenario.brokenStage`, `scenario.attributeName`, `scenario.missingChip` | JSON |
| `scenario.channel`, `scenario.timestamp`, `scenario.severity` | JSON, подпись алерта |
| стадии конвейера `STAGES[]` (`id`, `label`, `sublabel`, `attributes[]`) | `scenarios.ts`, общие для всех кейсов |

**Отдаёт:** переход в АРМ Обращений.

### 1. АРМ Обращений · агент-ассистент

| Вход | Поле |
|---|---|
| Событие | `queueRow.eventId`, `time`, `client`, `inn`, `counterparty`, `counterpartyNote`, `amount`, `operation`, `channel`, `city`, `status` |
| Сработавшее правило | `queueRow.rule`, `queueRow.ruleName` |
| Метка агента | `queueRow.flag` |
| Вывод ассистента | `journey.assistant.summary`, `facts[]`, `recommendation`, `action` (`defect` → разбор, `rule` → сразу к правилу) |

**Отдаёт дальше:** `journey.id`, `journey.scenarioId`, `journey.eventId`, `journey.attribute`.

### 2. Разбор проблемы данных · 4 агента

| Вход | Поле |
|---|---|
| Кейс | `journey.scenarioId`, `journey.eventId` |
| Выводы агентов | `scenario.agentOutputs.{expert, statistic, detective, analyst}` → `status` (`confirmed` / `recovered` / `unavailable`), `summary`, `detail` |
| Источники | `DataContracts`, справочник связей, ПКБ / поток событий (`SOURCES` в `scenarios.ts`) |
| Итог | `journey.analysis.kind` (`needs_rca` / `optional`), `headline`, `text` |

**Отдаёт дальше:** при `needs_rca` — переход в чат, иначе — к правилу.

### 3. Рабочий чат · агент RCA

| Вход | Поле |
|---|---|
| Контекст из АРМ | `journey.eventId`, `journey.analysis.headline`, `journey.rule.id`, `journey.rule.name`, `journey.attribute` |
| Диалог | `journey.chat.agent`, `journey.chat.prompt`, `journey.chat.ack` |
| Источники RCA | `journey.rca.steps[].source` |

**Отдаёт дальше:** запуск RCA по `journey.eventId` и `journey.attribute`.

### 4. RCA · поиск первопричины

| Вход | Поле |
|---|---|
| Шаги расследования | `journey.rca.steps[]` → `source`, `title`, `finding`, `detail`, `chart?` |
| График задержки модуля | `journey.rca.latency[]` → `t` (ЧЧ:ММ), `ms`; `journey.rca.timeoutMs` |
| Вывод | `journey.rca.conclusion` |

**Отдаёт дальше:** первопричину для оснований правила.

### 5. АРМ Аналитика · описание правила

| Вход | Поле |
|---|---|
| Правило | `journey.rule.id`, `journey.rule.name` |
| Описание | `journey.rule.description.whyWrong`, `journey.rule.description.checks[]` |
| Дифф | `journey.rule.current[]`, `journey.rule.proposed[]` → `text`, `change` (`same` / `removed` / `added`) |
| Основания | `journey.rule.basis[]` → `label`, `text`, `needsRca?` (показывается, только если прошли RCA) |
| Эффект | `journey.rule.effect`, `journey.rule.related` (сколько связанных обращений закроется) |

**Отдаёт дальше:** активированное правило `rule.id`.

### 6. АРМ Аналитика · эффективность правила

| Вход | Поле |
|---|---|
| Период | `journey.report.period`, `journey.report.activatedAt` (ЧЧ:ММ, совпадает с одной из точек `hourly`) |
| Метрики до/после | `journey.report.metrics[]` → `label`, `before`, `after`, `note?` (значения — готовые строки для показа) |
| Срабатывания по часам | `journey.report.hourly[]` → `t`, `hits` |
| Вывод | `journey.report.conclusion` |

**Отдаёт дальше:** закрытие кейса → в АРМ Обращений приходит `{ caseId, related, ruleId }`.

## Части стенда и владельцы

Предложение для задачи 7. Владельцев подтверждаем на встрече.

| Часть | Экраны / файлы | Читает из JSON | Владелец |
|---|---|---|---|
| Заставка и маскот | `FlowScreen.tsx`, `Mascot.tsx` | `scenario` | — |
| АРМ Обращений | `journey/ArmScreen.tsx` | `queueRow`, `journey.assistant` | — |
| Разбор данных (4 агента) | `AnalysisScreen.tsx` | `scenario.agentOutputs`, `journey.analysis` | Вика (качество данных) |
| Чат и RCA | `journey/ChatScreen.tsx`, `journey/RcaScreen.tsx`, `LatencyChart.tsx` | `journey.chat`, `journey.rca` | Надя (RCA) |
| Правило и отчёт | `journey/RuleScreen.tsx`, `journey/ReportScreen.tsx`, `HitsChart.tsx` | `journey.rule`, `journey.report` | — |
| Данные и провайдер | `src/data/*` | весь файл | — |

## Как подставить реальный инцидент

1. Скопировать `happy-path.json` и заполнить поля по таблицам выше данными инцидента. Персональные данные, ИНН и названия клиентов заменить на вымышленные.
2. Если у инцидента нет RCA, поставить `analysis.kind = "optional"`, а `chat` и `rca` — `null`. Основания с `needsRca` убрать.
3. Проверить `npm run build`, пройти цикл на `npm run dev`, пересобрать `npm run build:kiosk`.
