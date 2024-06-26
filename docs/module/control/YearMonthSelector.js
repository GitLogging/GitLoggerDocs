import { distinctList, debounce, dropBlankProperties } from "../utils.js"

// import { gitLoggerMetrics, gitLoggerMetricNames } from '../config/constants.js'
export class YearMonthSelector extends HTMLElement {
    /**
     * @description an input that selects 'year_month' date pairs*

     * The html Element supports the following attributes
     * `chart-id-list` - is the `id` of the `GitLoggerChartElement` instances to attach to
     * `month` - date in terms of month
     * `year` - date in terms of year
     * `year-month` - or get/set date pairs, declared  as a string in the format 'yyyy-MM'
     * `min-date` - the oldest date allowed, declared  as a string in the format 'yyyy-MM'
     * `max-date` - the newest date allowed, declared  as a string in the format 'yyyy-MM'
     * @example
        <metric-name-selector chart-id-list="first-chart" label-text="MetricName"></metric-name-selector>
        <div id="first-chart" no-ui="true" debugInfo="true" debug-css="true" chartType="bar" maxHeight="400px" is="gitlogger-chart" repo="https://github.com/StartAutomating/GitLogger" metric="CommitCount"
            Year="2023" Month="04" class="gitLoggerChartRootElement" max-width="300px">
        </div>
     *

     **/
    #attachedDomSelector // css selectors to attach, ex value: "#chart-one,#chart-two",
    #rootElement // topmost div under shadow,below style tag
    #inputElement // the core selector
    #shadow // the shadowRoot node
    #attachedDomList = [] // attached to <git-logger-chart> elements  [GitLoggerChartElement[]] elements
    verboseLogging = false

    // list of all properties that getModel() and updateModel() can support. unhandled keys are gracefully ignored.
    #supportedModelPropertyNames = distinctList( [ 'year', 'month', 'yearMonth', 'date' ] )

    constructor() {
        super();
        const shadow = this.attachShadow( { mode: 'open' } );
        this.#shadow = shadow
        this.rebuildAll()
    }
    get supportedModelPropertyNames() {
        /**
         * @description returns a list of all properties that getModel() and updateModel() currently support. unhandled keys are gracefully ignored.
         */
        return this.#supportedModelPropertyNames
    }
    static get observedAttributes () {
        return [ 'year', 'month', 'year-month', 'min-date', 'max-date', 'chart-id-list' ];
    }
    static YearMonthStringFromNow () {
        /*
        ** returns "2023-04" from today
        */
        return moment().format( 'yyyy-MM' )
    }
    static YearMonthFromYearMonthString ( dateString ) {
        // convert "2023-04" to { year, month }
        const { year, month, ...rest } = dateString.split( '-' )
        return { year: year, month: month }
    }
    static DateToYearMonthString ( date ) {
        // convert `Date` to "2023-04"
        moment( date ).format( 'yyyy-MM' )
    }
    // no special behavior:
    connectedCallback () { }

    disconnectedCallback () { }

    adoptedCallback () { }

    attributeChangedCallback ( name, oldValue, newValue ) {
        if ( this.verboseLogging ) {
            console.debug( `[YearMonthSelector]::setAttribute : ${ name } = ${ newValue } was ${ oldValue }` );
            console.info(`PropertyHadNoHandlerRegistered: No-Op for: ${ name } `)
        }
        // /*
        //     future: changes call this.updateModel( year: ..., month: ... ) et
        // */
        // if ( name == 'year' ) { }
        // if ( name == 'month' ) { }
        // if ( name == 'year-month' ) { }
        // if ( name == 'min-date' ) { }
        // if ( name == 'min-date' ) { }
    }
    updateModel ( params ) {
        /**
         * @description updates the model, encapsulating details. accepts any keys
         * @summary accepts any properties named [ year | month | yearMonth ]
         *  yearMonth if specified, has the highest precedence
         * @see getModel
         * @see updateSelfFromChart
         * @see updateModel
         * @see attachTo
        * @example ym.updateModel( {
        year: 2021
    } )
         */
        const filterOptions = {
            dropEmpty: false,
            dropNull: false,
            dropWhitespace: true,
        }
        const existing = this.getModel()
        let fromDateParam = {}
        if( params.date ) {
            fromDateParam = {
                month: params.date.getMonth() + 1,
                year: params.date.getFullYear(),
            }
        }
        //     year: params.date
        // }
        const merged = dropBlankProperties( { ...existing, ...params, ...fromDateParam }, filterOptions )
        const paddedMonth = merged.month?.toString().padStart( 2, '0' )
        const yearMonthPair = `${ merged.year }-${ paddedMonth }` // future: refactor to a function that adds month + 1
        /*
        params are explicit user params, **without** existing state
            some case use 'params' for existence check, that way properties not defined aren't modified
        */
        if ( params.year ) {
            this.setAttribute( 'year', merged.year )
        }
        if ( params.month ) {
            this.setAttribute( 'month', paddedMonth )
        }
        if ( params.year && params.month ) {
            this.setAttribute( 'year-month',  yearMonthPair)
        }
        if ( params.yearMonth ) {
            this.setAttribute( 'year-month',  yearMonthPair)
        }
        if ( params.date ) {
            this.setAttribute( 'year', merged.year )
            this.setAttribute( 'month', merged.month )
            this.setAttribute( 'year-month',  yearMonthPair)
        }

        if ( merged.chartIdList ) {
            this.setAttribute( 'chart-id-list', merged.chartIdList )
        }

        this.#inputElement.value = yearMonthPair
    }
    attachTo ( targetChart ) {
        /**
         * @description Attach to [GitLoggerChartElement] element, else null and update to name to the existing chart's value
         * @see getModel
         * @see updateSelfFromChart
         * @see updateModel
         * @see attachTo
        **/
        if ( !targetChart ) {
            console.error( `Control has no target to attach to: targetChart` )
            return
        }
        if ( !this.#attachedDomList.includes( targetChart ) ) {
            this.#attachedDomList.push( targetChart )
        }
        this.updateSelfFromChart()
    }
    updateSelfFromChart () {
        /**
         * @description read the chart's state, updating self
         * The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
         **/
        const targetChart = this.#attachedDomList[ 0 ]
        if ( !targetChart ) { return }

        const state = targetChart.getQueryModel()

        const newYear =
            state.year ??
                this.getAttribute( 'year' )

        const newMonth = state.month ?? this.getAttribute( 'month' )

        this.updateModel( {
            year: newYear,
            month: newMonth,
            yearMonth: `${ newYear }-${ newMonth }`
        } )
        // note: set attribute, or should UpdateModel handle that?
        this.setAttribute( 'year', newYear )
        this.setAttribute( 'month', newMonth )
        // future: update min/max date ranges on repo change
        // The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
        // this.#inputElement.value = this.getAttribute( 'year-month' )
    }
    updateChartFromSelf ( event ) {
        /**
         * @description update attached chart's state from self's state
        * alias as this.updateModel()
        **/
        const state = this.getModel()
        for ( const chart of this.#attachedDomList ) {
            if ( this.verboseLogging ) {
                console.log( `repoNameSelector::updateChartFromSelf, event: ${ event }` )
            }

            // note: verify this is event and not state for #125:
            const newDate = event?.currentTarget.valueAsDate
            chart.updateModel( {
                year: newDate.getFullYear(),
                month: newDate.getMonth() + 1,
            } )
            chart.throttledRebuildAll()
        }
    }
    getModel ( options ) {
        /**
         * @description returns only the model as Json ( technically, an object ). query-specific transforms are part of `this.buildRequestURL`
         * @param {object} options - optional overrides like dropping blank fields or not. supports fields: `includeStyle` | `filterOptions`
         * @returns {object} - the model as an object that easily serializes to JSON         *
         */
        options = {
            includeStyle: false,
            filterOptions: {
                dropEmpty: true,
                dropNull: true,
                dropWhitespace: true,
            },
            ...options
        }
        let curDate = this.#inputElement.valueAsDate
        if( ! curDate ) {
            curDate = new Date()
        }
        let finalData = {
            // validate month mapping is correct for #125:
            year: curDate.getFullYear(),
            month: curDate.getMonth() + 1, // API uses months 1=jan, javascript uses jan = 0
            date: curDate,
            chartIdList: this.getAttribute( 'chart-id-list' )
        }
        const yearMonthStr = [ finalData.year, finalData.month ].join( '-' )
        finalData.yearMonth = yearMonthStr
        return dropBlankProperties( finalData, options.filterOptions )
    }
    rebuildAll () {
        /**
         * @description expensive: regenerate `datalists`, `inputs` and any other DOM elements based on the metric name list
         **/
        const shadow = this.#shadow
        const rootElement = document.createElement( 'div' );
        rootElement.setAttribute( 'class', 'yearMonthSelectorRoot' );
        this.#rootElement = rootElement

        const text = this.getAttribute( 'label-text' );
        const info = document.createElement( 'span' );
        info.textContent = text;

        const style = document.createElement( 'style' );
        const inputYearMonthParam = document.createElement( 'input' )
        inputYearMonthParam.setAttribute( 'type', 'month' )
        inputYearMonthParam.setAttribute( 'id', 'MonthParam' )
        inputYearMonthParam.setAttribute( 'name', 'MonthParam' )

        let yearMonthString_today = YearMonthSelector.YearMonthStringFromNow()
        inputYearMonthParam.setAttribute( 'value', yearMonthString_today )
        inputYearMonthParam.setAttribute( 'max', yearMonthString_today )  // future: set max date from a summary endpoint
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
        this.#inputElement = inputYearMonthParam
        shadow.appendChild( style )
        shadow.appendChild( info );
        shadow.appendChild( rootElement );
        rootElement.appendChild( inputYearMonthParam )

        // transform basic user string into a valid CSS Query
        const idList_selector = // in : 'first-chart,second-chart'
            // out: '#first-chart,#second-chart'
            this.getAttribute( 'chart-id-list' )
                .split( ',' )
                .map( ( o ) => `#${ o }` )
                .join( ',' )

        this.#attachedDomSelector = idList_selector;// css selectors to attach, ex value: "#chart-one,#chart-two",

        for ( const curTarget of document.querySelectorAll( this.#attachedDomSelector ) ) {
            if ( this.verboseLogging ) {
                console.debug( `YearMonthSelector: 🎯attached to: ${ curTarget.id }` )
            }
            // this populates this.#attachedDomList
            this.attachTo( curTarget )
            this.#inputElement.addEventListener( 'change', ( event ) => {
                if ( this.verboseLogging ) {
                    console.debug( `YearMonthSelector: 🎯attached: add change listener: ${ curTarget.id }` )
                }
                this.updateChartFromSelf( event )
            } )
        }

        return

        const targetChart = this.getAttribute( 'chart-id-list' ) // #first-chart
        const otherChart = document.querySelector( `#${ targetChart }` )
        inputYearMonthParam.addEventListener( 'change', ( event ) => {
            this.updateChartFromSelf( event )
        } )
        this.attachTo( otherChart )
    }
}
customElements.define( 'year-month-selector', YearMonthSelector );