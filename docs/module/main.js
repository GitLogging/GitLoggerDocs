/*
note: this file may show up as unused imports in vscode,
even though they are required by the entry point: docs/StaticSite/GitLogger-WebComponent.html
which uses module style imports:
    <script type="module" src="module/main.js"></script>
*/
import { inspectType, printStyle, randomInt, randomItem } from './utils.js'
import { GitLoggerChartElement } from './control/GitLoggerChart.js'
import { MetricNameSelector } from './control/MetricNameSelector.js'
import { YearMonthSelector } from './control/YearMonthSelector.js'
import { RepoNameSelector } from './control/RepoNameSelector.js'
