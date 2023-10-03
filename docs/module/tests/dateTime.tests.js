// import { AppState } from './appState.js'
// import { inspectType, printStyle, randomInt, randomItem } from './utils.js'
// import { GitLoggerChartElement } from './control/GitLoggerChart.js'
// import { MetricNameSelector } from './control/MetricNameSelector.js'
import { YearMonthSelector } from '../control/YearMonthSelector.js'
// import { RepoNameSelector } from './control/RepoNameSelector.js'
// import { CachedAPISummary } from './control/CachedAPISummary.js'
import { DateConversion } from  '../dateUtils.js'
// // import { forEachRecord  } from './localStorage.js'
// // AppState.LogState()

// // AppState.LogState()
// // function App_OnDomLoad() {
// //     // redundant
// //     // AppState.LogState()
// //     /*
// //     OnDomLoad handler that is specific to the page: <http://127.0.0.1:3005/docs/GitLogger-WebComponent.html>
// //     */

// //     // AppState.LogState()

// //     // # load existing names
// //     // AppState.RegenerateRepositoryDatalist()
// // }

// // if (document.readyState === "loading") { // https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
// //     // Loading hasn't finished yet
// //     document.addEventListener("DOMContentLoaded", App_OnDomLoad);
// // } else {
// //     App_OnDomLoad();
// // }

window.addEventListener( "load", ( event ) => {
    let dc
    const now = new Date()
    const dFromUTC = new Date( Date.UTC(2020, 11, 20, 3, 23, 16, 738) )
    console.info("event ▸ on('load')" )
    console.log('🚀 => enter dateTime.tests.js')
    try {
        dc = new DateConversion()
    } catch (e) {
        console.log('🐜 Caught ExpectedException')
    }
    let dc2 = new DateConversion( new Date() )
    dc2 = new DateConversion( { year: 2020, month: 1 } )

    if( dc2.Year === 2020 && dc2.Month === 1 && dc2.Day === 1 ) {

    } else {
        console.error( `🔴 Expected dc2.Year === 2020 && dc.Month === 1 && dc.Day === 1` )
    }


    console.log(dc2)

    let parts = dc2.formatToParts()
    const culture = new Intl.DateTimeFormat('en-us')
    const summary = {
        dc2: dc2,
        cultDefault: culture.format( now ),
        // parts: parts,
        partsJson: JSON.stringify( parts ),

    }
    console.table( summary )
    console.log( summary )
    console.table( parts )
    console.table( dc2 )
    // assert( dc2.Year === 2020 )
    // assert( dc2.Year == 2000 )

    // assert format string
    // https://developer.mozilla.org/en-US/docs/Web/API/console#using_string_substitutions




} );



// YearMonthSelector

// const sel1 = document.getElementsByTagName('year-month-selector')[0]
// console.log(
//     sel1,
//     sel1 instanceof YearMonthSelector
// )