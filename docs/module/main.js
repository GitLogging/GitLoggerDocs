import { AppState } from './appState.js'
import { inspectType, printStyle, randomInt, randomItem } from './utils.js'
import { GitLoggerChartElement } from './control/GitLoggerChart.js'
import { MetricNameSelector } from './control/MetricNameSelector.js'
import { YearMonthSelector } from './control/YearMonthSelector.js'
import { RepoNameSelector } from './control/RepoNameSelector.js'
import { CachedAPISummary } from './control/CachedAPISummary.js'
// import { forEachRecord  } from './localStorage.js'
// AppState.LogState()

AppState.LogState()
function App_OnDomLoad() {
    // redundant
    // AppState.LogState()
    /*
    OnDomLoad handler that is specific to the page: <http://127.0.0.1:3005/docs/GitLogger-WebComponent.html>
    */

    // AppState.LogState()

    // # load existing names
    // AppState.RegenerateRepositoryDatalist()
}

if (document.readyState === "loading") { // https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", App_OnDomLoad);
} else {
    App_OnDomLoad();
}



