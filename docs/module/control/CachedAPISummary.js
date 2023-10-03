import { distinctList, debounce, dropBlankProperties, renderJsonAsPre } from "../utils.js"

import { NamedCodepoints } from '../text.js'
import { AppState } from "../appState.js"
import { CachedAPI } from "../cachedApi.js"
import { TelemetryStats } from "../logging/telemetry.js"
// import { gitLoggerMetrics, gitLoggerMetricNames } from '../config/constants.js'
export class CachedAPISummary extends HTMLElement {
    /**
     * @description visualize and clear cache
     *
     **/
    #rootElement // topmost div under shadow,below style tag
    #inputElement // the core selector
    #shadow // the shadowRoot node
    #attachedDom // attached to a [GitLoggerChartElement] element, else null
    verboseLogging = false

    constructor() {
        super();
        const shadow = this.attachShadow( { mode: 'open' } );
        this.#shadow = shadow
        this.rebuildAll()
    }
    static get observedAttributes () {
        return []
    }
//     connectedCallback () {
//         // console.debug( '[CachedAPISummary]::connected' );
//     }

//     disconnectedCallback () {
//         // console.debug( '[CachedAPISummary]::disconnected' );
//     }

//     adoptedCallback () {
//         // console.debug( '[CachedAPISummary]::adopted' );
//     }

//     attributeChangedCallback ( name, oldValue, newValue ) {
//         if ( this.verboseLogging ) {
//             console.debug( `[CachedAPISummary]::setAttribute : ${ name } = ${ newValue } was ${ oldValue }` );
//         }
//         if ( name == 'year' ) {
//             // this.#inputElement.value = newValue
//         }
//         if ( name == 'month' ) {

//         }
//         if ( name == 'year-month' ) {

//         }
//         if ( name == 'min-date' ) {

//         }
//         if ( name == 'min-date' ) {

//         }
//     }
//     /*
//     this.#inputElement.value = this.getAttribute( 'year-month' )
//     updateModel ( options ) {
//     */
//     updateModel ( options ) {
//         /**
//          * @description updates the model, encapsulating details. accepts any keys
//          * @see getQueryModel
//          * @see updateSelfFromChart
//          * @see updateModel
//          * @see attachTo
//          */

//         const filterOptions = {
//             dropEmpty: false,
//             dropNull: false,
//             dropWhitespace: true,
//         }
//         const opt = dropBlankProperties( options, filterOptions )

//         const paddedMonth = opt.month?.toString().padStart( 2, '0' )

//         if ( opt.title ) {
//             console.error( 'nyi: mutate title in place: title' )
//         }
//         if ( opt.year ) {
//             this.setAttribute( 'year', opt.year )
//         }
//         if ( opt.yearMonth ) {
//             this.setAttribute( 'year-month', opt.yearMonth )
//         }
//         if ( opt.year && opt.month ) {
//             this.setAttribute( 'year-month', `${ opt.year }-${ paddedMonth }` )
//         }
//         if ( opt.date ) {
//             // ...

//         }
//         if ( opt.month ) {
//             this.setAttribute( 'month', paddedMonth )
//         }
//         // this.rebuildAll() // this triggers stack overflow
//     }
//     attachTo ( targetChart ) {
//         /**
//          * @description Attach to [GitLoggerChartElement] element, else null and update to name to the existing chart's value
//          * @see getQueryModel
//          * @see updateSelfFromChart
//          * @see updateModel
//          * @see attachTo
//         **/

//         this.#attachedDom = targetChart ?? this.#attachedDom

//         // const { year, month } = targetChart.getQueryModel() //.metric ?? 'CommitCount'
//         if ( !this.#attachedDom ) {
//             console.log( `Control is not attached to a chart` )
//             return
//         }

//         // const chart1 = this.#attachedDom

//         // this.#selectElement.value = existingValue
//         // const yearMonthStr = [ finalData.year, finalData.month ].join( ', ' )
//         // if( ! chart1 ) {
//         //     console.log()
//         // }
//         this.updateSelfFromChart()

//         // const existingValue = targetChart.getQueryModel().metric ?? 'CommitCount'
//         // this.#inputElement.value = existingValue
//     }
//     updateSelfFromChart () {
//         /**
//          * @description read the chart's state, updating self
//          * The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
//          **/
//         const chart = this.#attachedDom
//         const state = chart.getQueryModel()
//         const newYear = state.year ?? this.getAttribute( 'year' )
//         const newMonth = state.month ?? this.getAttribute( 'month' )
//         // return

//         this.updateModel( {
//             year: newYear,
//             month: newMonth,
//             yearMonth: `${ newYear }-${ newMonth }`
//         } )

//         // future: update min/max date ranges on repo change
//         // The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
//         // this.#inputElement.value = this.getAttribute( 'year-month' )

//     }
//     updateChartFromSelf ( event ) {
//         /**
//          * @description update attached chart's state from self's state
//         * alias as this.updateModel()
//          **/
//         const chart = this.#attachedDom
//         const state = this.getQueryModel()
//         const newMetric = event.target.value // or this.#selectElement.value
//         const newDate = event.target.valueAsDate

//         // event.target.value is new
//         // get-attribute on self is old, even though it echo'd the change event

//         chart.updateModel( {
//             year: newDate.getFullYear(),
//             month: newDate.getMonth() + 1,
//             // year: state.year,
//             // month: state.month
//         } )

//         chart.throttledRebuildAll()

//         return
//         otherChart.setAttribute( 'metric', newMetric )
//         otherChart.rebuildAll()

//         let { year, month } = chart.getQueryModel()
//         if ( this.verboseLogging ) {
//             console.log( 'form was', chart.getQueryModel() )
//         }
//         const newYear = chart.getQueryModel().year ?? this.getAttribute( 'year' )
//         const newMonth = chart.getQueryModel().month ?? this.getAttribute( 'month' )

//         this.setAttribute( 'year', newYear )
//         this.setAttribute( 'month', newMonth )
//         this.setAttribute( 'year-month', `${ newYear }-${ newMonth }` )

//         // The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
//         this.#inputElement.value = this.getAttribute( 'year-month' )

//     }
//     getQueryModel ( options ) {
//         /**
//          * @description returns only the model as Json ( technically, an object ). query-specific transforms are part of `this.buildRequestURL`
//          * @param {object} options - optional overrides like dropping blank fields or not. supports fields: `includeStyle` | `filterOptions`
//          * @returns {object} - the model as an object that easily serializes to JSON         *
//          */
//         options = {
//             includeStyle: false,
//             filterOptions: {
//                 dropEmpty: true,
//                 dropNull: true,
//                 dropWhitespace: true,
//             },
//             ...options
//         }
//         const curDate = this.#inputElement.valueAsDate

//         // const newYear = chart.getQueryModel().year ?? this.getAttribute( 'year' )
//         // const newMonth = chart.getQueryModel().month ?? this.getAttribute( 'month' )

//         //

//         let finalData = {
//             year: curDate.getFullYear(),
//             month: curDate.getMonth() + 1, // API uses months 1=jan, javascript uses jan = 0
//             date: curDate,
//         }
//         const yearMonthStr = [ finalData.year, finalData.month ].join( '_' )
//         finalData.yearMonth = yearMonthStr

//         // this.#shadow.querySelector( ... )
//         return dropBlankProperties( finalData, options.filterOptions )
//     }
    updateElement ( event ) {
        console.warn(' note: using "mouseOver" because storage event does not seem to be firing this method (after the ctor)')
        // const opt = options
        const storedUrlSet = CachedAPI.getCachedURLSet()
        const labelCount = this.#rootElement.querySelector('div#keyCountMessage span.number')
        labelCount.textContent = storedUrlSet.size

        const msg = this.#rootElement.querySelector('#innerContent')
        let  html = `<br/>More Stats<br/> ${

            TelemetryStats.getModel()
        }`
        html = `More <br/>${
            TelemetryStats.getModel() }

        `
        msg.InnerHTML = html
        // this.#rootElement.getElementById('innerContent').innerHTML += `Part3 <br/>${
        this.#rootElement.querySelector('#innerContent').innerHTML = `Part3 <br/>${
            renderJsonAsPre( TelemetryStats.getModel()  )
        }`

        console.log(event)



        // console.log( storedUrlSet.size ?? 0 )
    }
    rebuildAll () {
        /**
         * @description expensive: regenerate `datalists`, `inputs` and any other DOM elements based on the metric name list
         **/
        const shadow = this.#shadow
        const rootElement = document.createElement( 'div' )
        this.#rootElement = rootElement
        rootElement.setAttribute( 'class', 'CachedAPISummaryRoot' )
        const style = document.createElement( 'style' );
        style.textContent = `
        .CachedAPISummaryRoot, .CachedAPISummaryRoot.enableDebug {
            border: 2px solid #a2a2a250;
            opacity: .4;
            font-size: clamp(10px, .8rem, 2rem);
        }


        `
        shadow.appendChild( style )

        const label = document.createElement('div')
        label.textContent = this.getAttribute( 'label-text' ) ?? 'Api Cache Stats'


        rootElement.appendChild( label )

        const d1 = document.createElement( 'div' )
        d1.setAttribute('id', 'keyCountMessage')
        d1.innerHTML = `Key Count: <span class="number">0</span>`
        rootElement.appendChild( d1 )

        const d2 = document.createElement( 'div' )
        d2.setAttribute('id', 'innerContent')
        rootElement.appendChild(d2)

        // rootElement.style.fontSize = '16px;'
        shadow.appendChild( rootElement )
        this.updateElement()

        this.#rootElement.addEventListener( 'click', ( event ) => {
            CachedAPI.resetCache()
           this.updateElement( event )
        })

        // window.addEventListener("storage", (event) => {
        this.#rootElement.addEventListener("storage", (event) => {
            console.log('🧪 storage event', event)
            this.updateElement( event )
            // this.updateElement( event )
            // When local storage changes, dump the list to
            // the console.
            // console.log(JSON.parse(window.localStorage.getItem("sampleList")));
        })
        this.#rootElement.addEventListener('mouseenter', (event) => {
            // console.log('e', event)
            this.updateElement()
        })

        return
        this.#rootElement = rootElement

        const text = this.getAttribute( 'label-text' );
        const info = document.createElement( 'span' );
        info.textContent = text;


        // `
        // const selectedMetric = document.createElement( 'select' )
        // selectedMetric.setAttribute( 'name', 'SelectedMetric' )
        // selectedMetric.setAttribute( 'id', 'MetricName' )
        // rootElement.appendChild( selectedMetric )
        // this.#metricNames.forEach( ( item ) => {
        //     const option = document.createElement( 'option' )
        //     option.setAttribute( 'value', item )
        //     option.textContent = item
        //     selectedMetric.appendChild( option )
        // } )
        // this.#inputElement = selectedMetric

        const inputYearMonthParam = document.createElement( 'input' )
        inputYearMonthParam.setAttribute( 'type', 'month' )
        inputYearMonthParam.setAttribute( 'id', 'MonthParam' )
        inputYearMonthParam.setAttribute( 'name', 'MonthParam' )

        let yearMonthString_today = CachedAPISummary.YearMonthStringFromNow()
        inputYearMonthParam.setAttribute( 'value', yearMonthString_today )
        inputYearMonthParam.setAttribute( 'max', yearMonthString_today ) // future: set max date from a summary endpoint
        // future: use API endpoint as defaults
        // but always allow user to override when attributes exist
        const minDate = this.getAttribute( 'min-date' )
        const maxDate = this.getAttribute( 'max-date' )
        if ( maxDate ) {
            inputYearMonthParam.setAttribute( 'max', maxDate )
        }
        if ( minDate ) {
            inputYearMonthParam.setAttribute( 'max', minDate )
        }
        if ( this.verboseLogging ) {
            `[CachedAPISummary] :: rebuildAll :: yearMonthParam => new constraint = { min:  ${ minDate ?? NamedCodepoints.NullSymbol }, max: ${ maxDate ?? NamedCodepoints.NullSymbol
                } }`
        }

        this.#inputElement = inputYearMonthParam

        shadow.appendChild( style )
        shadow.appendChild( info );
        shadow.appendChild( rootElement );

        rootElement.appendChild( inputYearMonthParam )

        inputYearMonthParam.addEventListener( 'change', ( event ) => {
            console.log( this.#inputElement )
            console.log( event.target.value )
            this.updateChartFromSelf( event )

            // // this.#inputElement.value
            // const selectedDate = this.#inputElement.valueAsDate
            // const year = selectedDate?.getFullYear()
            // const month = selectedDate.getMonth() + 1

            // this.setAttribute( 'year', year )
            // this.setAttribute( 'month', month )
            // this.setAttribute( 'year-month', `${ year }_${ month }` )
            // event.target // -is input#MonthParam
            // event.target.value // -is [string] 2003-04

        } )


        const targetChart = this.getAttribute( 'chart-id' ) // #first-chart
        const otherChart = document.querySelector( `#${ targetChart }` )
        this.attachTo( otherChart )
        selectedMetric.addEventListener( 'change', ( event ) => {
            console.log( event )
            if ( !this.#attachedDom ) {
                console.log( `Control is not attached to a chart! Source: ${ event }` )
            }
            const otherChart = this.#attachedDom
            const newMetric = event.target.value // or this.#inputElement.value
            otherChart.setAttribute( 'metric', newMetric )
            otherChart.rebuildAll()
        } )

    }
}
customElements.define( 'cached-api-summary', CachedAPISummary );