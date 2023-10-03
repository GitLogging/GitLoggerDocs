import { distinctList, debounce, dropBlankProperties } from "../utils.js"
import { gitLoggerMetrics, gitLoggerMetricNames, gitRepositoryDefaultURLs } from '../config/constants.js'

export class RepoNameSelector extends HTMLElement {
    /**
     * @description an input that selects 'year_month' date pairs*

     * The html Element supports the following attributes
     * `chart-id` - is the `id` of the `GitLoggerChartElement` instance to attach to
     * `repo` - repository short name
     * `repo-url` - repository full URL
     * @example
        <repo-name-selector chart-id="first-chart" label-text="RepoName"></repo-name-selector>
     *
     **/
    #rootElement // topmost div under shadow,below style tag
    #selectElement // the core selector
    #shadow // the shadowRoot node
    #attachedDom // attached to a [GitLoggerChartElement] element, else null
    repoURLList = distinctList( gitRepositoryDefaultURLs )
    // repoNames = distinctList([
    //     'GitLogger',
    //     'PipeScript',
    //     'ugit',
    //     'ExcelAnt',
    //     'Posh',
    //     'dotfiles_git',
    // ])
    verboseLogging = true

    constructor() {
        super();
        const shadow = this.attachShadow( { mode: 'open' } );
        this.#shadow = shadow
        this.rebuildAll()
    }
    static get observedAttributes () {
        return [ // todo: run a pass, to see which may no longer be used
            'repo', 'repo-url'
        ];
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
    connectedCallback () {
        // console.debug( '[RepoNameSelector]::connected' );
    }

    disconnectedCallback () {
        // console.debug( '[RepoNameSelector]::disconnected' );
    }

    adoptedCallback () {
        // console.debug( '[RepoNameSelector]::adopted' );
    }

    attributeChangedCallback ( name, oldValue, newValue ) {
        if ( this.verboseLogging ) {
            console.debug( `[RepoNameSelector]::setAttribute : ${ name } = ${ newValue } was ${ oldValue }` );
        }
    }
    /*
    this.#inputElement.value = this.getAttribute( 'year-month' )
    updateModel ( options ) {
    */
    updateModel ( options ) {
        /**
         * @description updates the model, encapsulating details. accepts any keys
         * @see getQueryModel
         * @see updateSelfFromChart
         * @see updateModel
         * @see attachTo
         */

        const filterOptions = {
            dropEmpty: false,
            dropNull: false,
            dropWhitespace: true,
        }
        const opt = dropBlankProperties( options, filterOptions )

        if( opt.repoURL ) {
            this.setAttribute('repo-url', opt.repoURL)
        }
        if( opt.repo ) {
            this.setAttribute('repo', opt.repo)
        }
        return

        throw 'nyi: Left off here'


        // const paddedMonth = opt.month?.toString().padStart( 2, '0' )

        // if ( opt.title ) {
        //     console.error( 'nyi: mutate title in place: title' )
        // }
        // if ( opt.year ) {
        //     this.setAttribute( 'year', opt.year )
        // }
        // if ( opt.yearMonth ) {
        //     this.setAttribute( 'year-month', opt.yearMonth )
        // }
        // if ( opt.year && opt.month ) {
        //     this.setAttribute( 'year-month', `${ opt.year }-${ paddedMonth }` )
        // }
        // if ( opt.date ) {
        //     // ...

        // }
        // if ( opt.month ) {
        //     this.setAttribute( 'month', paddedMonth )
        // }
        // this.rebuildAll() // this triggers stack overflow
    }
    attachTo ( targetChart ) {
        /**
         * @description Attach to [GitLoggerChartElement] element, else null and update to name to the existing chart's value
         * @see getQueryModel
         * @see updateSelfFromChart
         * @see updateModel
         * @see attachTo
        **/

        this.#attachedDom = targetChart ?? this.#attachedDom

        // const { year, month } = targetChart.getQueryModel() //.metric ?? 'CommitCount'
        if ( !this.#attachedDom ) {
            console.log( `Control is not attached to a chart` )
            return
        }

        // const chart1 = this.#attachedDom

        // this.#selectElement.value = existingValue
        // const yearMonthStr = [ finalData.year, finalData.month ].join( ', ' )
        // if( ! chart1 ) {
        //     console.log()
        // }
        this.updateSelfFromChart()

        // const existingValue = targetChart.getQueryModel().metric ?? 'CommitCount'
        // this.#inputElement.value = existingValue
    }
    updateSelfFromChart () {
        /**
         * @description read the chart's state, updating self
         * The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
         **/
        const chart = this.#attachedDom
        const state = chart.getQueryModel()
        const curRepoURL = state.repoURL
        // this.#selectElement.value = curRepoURL // ex: 'https://github.com/GitLogging/GitLoggerAction'

        // const newRepo = state.year ?? this.getAttribute( 'repo' )
        // const newRepoUrl = state.month ?? this.getAttribute( 'repo-url' )

        this.updateModel( {
            // repo: null,
            repoURL: curRepoURL,
        } )

        console.warn('nyi: updateFromChart')
        return
        // return


        // future: update min/max date ranges on repo change
        // The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
        // this.#inputElement.value = this.getAttribute( 'year-month' )

    }
    updateChartFromSelf ( event ) {
        /**
         * @description update attached chart's state from self's state
        * alias as this.updateModel()
         **/
        const chart = this.#attachedDom
        const state = this.getModel()

        // const newMetric = event.target.value // or this.#selectElement.value
        // const newDate = event.target.valueAsDate
        // // event.target.value is new
        // get-attribute on self is old, even though it echo'd the change event
        if ( this.verboseLogging ) {
            console.log( 'before update', chart.getQueryModel() )
        }
        const newRepoURL = event.currentTarget.value

        // event.currentTarget.value
        console.log( newRepoURL )
        chart.updateModel( {
            repoURL: newRepoURL,
            // year: newDate.getFullYear(),
            // month: newDate.getMonth() + 1,
            // year: state.year,
            // month: state.month
        } )

        if ( this.verboseLogging ) {
            console.log( 'after update', chart.getQueryModel() )
        }

        chart.throttledRebuildAll()

        return
        otherChart.setAttribute( 'metric', newMetric )
        otherChart.rebuildAll()

        let { year, month } = chart.getQueryModel()
        if ( this.verboseLogging ) {
            console.log( 'form was', chart.getQueryModel() )
        }
        const newYear = chart.getQueryModel().year ?? this.getAttribute( 'year' )
        const newMonth = chart.getQueryModel().month ?? this.getAttribute( 'month' )

        this.setAttribute( 'year', newYear )
        this.setAttribute( 'month', newMonth )
        this.setAttribute( 'year-month', `${ newYear }-${ newMonth }` )

        // The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
        // this.#inputElement.value = this.getAttribute( 'year-month' )

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
        // const curRepo = this.#inputElement.value
        const curRepoURL = this.#selectElement.value

        // const newYear = chart.getQueryModel().year ?? this.getAttribute( 'year' )
        // const newMonth = chart.getQueryModel().month ?? this.getAttribute( 'month' )

        //

        let finalData = {
            repo: this.getAttribute( 'repo' ),
            repoURL: curRepoURL ?? this.getAttribute( 'repo-url' ),
        }
        // finalData.yearMonth = yearMonthStr

        // this.#shadow.querySelector( ... )
        return dropBlankProperties( finalData, options.filterOptions )
    }
    rebuildAll () {
        /**
         * @description expensive: regenerate `datalists`, `inputs` and any other DOM elements based on the metric name list
         **/
              /*
        ** Regenerate `datalists` and `inputs`  based on the metric name list
        */
        const shadow = this.#shadow
        const rootElement = document.createElement( 'div' );
        rootElement.setAttribute( 'class', 'RepoNameSelectorRoot' );
        this.#rootElement = rootElement

        const text = this.getAttribute( 'label-text' );
        const info = document.createElement( 'span' );
        info.textContent = text;

        const style = document.createElement( 'style' );
        style.textContent = `
        .RepoNameSelectorRoot.enableDebug {
            border: 2px solid #a2a2a250;
        }
        `
        const selectedRepo = document.createElement( 'select' )
        selectedRepo.setAttribute( 'name', 'selectedRepo' )
        selectedRepo.setAttribute( 'id', 'MetricName' )
        rootElement.appendChild( selectedRepo )
        // this.repoNames.forEach( ( item ) => {
        this.repoURLList.forEach( ( item ) => {
            const option = document.createElement( 'option' )
            option.setAttribute( 'value', item )
            option.textContent = item
            selectedRepo.appendChild( option )
        } )
        this.#selectElement = selectedRepo

        shadow.appendChild( style )
        shadow.appendChild( info );
        shadow.appendChild( rootElement );

        const targetChart = this.getAttribute( 'chart-id' ) // #first-chart
        const otherChart = document.querySelector( `#${ targetChart }` )
        this.attachTo( otherChart )
        selectedRepo.addEventListener( 'change', ( event ) => {
            this.updateChartFromSelf( event )
            // if ( !this.#attachedDom ) {
            //     console.log( `Control is not attached to a chart! Source: ${ event }` )
            // }
            // this.#attachedDom.updateModel({
            //     repo: '',
            //     repoURL: ''
            // })
            // const otherChart = this.#attachedDom
            // const newRepoValue = event.target.value
            // otherChart.updateModel({
            //     repo: newRepoValue,
            //     // repoURL: '',
            // })
            // const newMetric = event.target.value // or this.#selectElement.value
            // otherChart.setAttribute( 'metric', newMetric )
            // otherChart.rebuildAll()
        } )

    }
}
customElements.define( 'repo-name-selector', RepoNameSelector );