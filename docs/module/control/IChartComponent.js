import { distinctList, debounce, dropBlankProperties } from "../utils.js"

class IChartComponent extends HTMLElement{
    /**
     * @description sketch of Base class for all chart components

        <div is: shadowRoot>
            <head>
            <stylesheets is: styleElement>
            <div is: rootElement>
                <input is: selectElement>
                    # is the top form element
    */
    verboseLogging = true
    #shadow = null
    #rootElement = null
    #styleElement = null
    // #selectElement = null



    constructor() {
        super()
        const shadow = this.attachShadow( { mode: 'open' } );
        this.#shadow = shadow
        this.rebuildAll()
    }

    getShadow() {
        /**
         * @description returns the shadowRoot node
         */
        return this.#shadow
    }

    getRootElement() {
        /**
         * @description main 'content' of the inner dom
         */
        if( ! this.#rootElement) {
            throw new Error('Shadow not found')
        }
        return this.#rootElement
    }

    static get observedAttributes () {
        /**
         * DOM attributes to watch for mutations
         */
        return [ // todo: run a pass, to see which may no longer be used
            'text-label'
            // 'repo',
            // 'repo-url'
        ];
    }

    rebuildAll() {

    }
    connectedCallback () {
        // console.debug( '[MetricNameSelector]::connected' );
    }

    disconnectedCallback () {
        // console.debug( '[MetricNameSelector]::disconnected' );
    }

    adoptedCallback () {
        // console.debug( '[MetricNameSelector]::adopted' );
    }

    attributeChangedCallback ( name, oldValue, newValue ) {
    if ( this.verboseLogging ) {
        console.debug( `[RepoNameSelector]::setAttribute : ${ name } = ${ newValue } was ${ oldValue }` );
        }
    }
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

        // if( opt.repoURL ) {
        //     this.setAttribute('repo-url', opt.repoURL)
        // }
        // if( opt.repo ) {
        //     this.setAttribute('repo', opt.repo)
        // }
        throw 'child must implement'
        return opt
    }
    attachTo ( targetChart ) {
        /**
         * @description Attach to [GitLoggerChartElement] element, else null and update to name to the existing chart's value
         * @see getQueryModel
         * @see updateSelfFromChart
         * @see updateModel
         * @see attachTo
        **/
       throw 'child must implement'

        //     this.#attachedDom = targetChart ?? this.#attachedDom

        //             // const { year, month } = targetChart.getQueryModel() //.metric ?? 'CommitCount'
        //     if ( ! this.#attachedDom ) {
        //         console.log( `Control is not attached to a chart` )
        //         return
        //     }

        //             // const chart1 = this.#attachedDom

        //             // this.#selectElement.value = existingValue
        //             // const yearMonthStr = [ finalData.year, finalData.month ].join( ', ' )
        //             // if( ! chart1 ) {
        //             //     console.log()
        //             // }
        //     this.updateSelfFromChart()

        //             // const existingValue = targetChart.getQueryModel().metric ?? 'CommitCount'
        //             // this.#inputElement.value = existingValue
        // }
    }
    updateSelfFromChart () {
        /**
         * @description read the chart's state, updating self
         * The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
         **/
        throw 'child must implement'
        // const chart = this.#attachedDom
        // const state = chart.getQueryModel()
        // const curRepoURL = state.repoURL
        // // this.#selectElement.value = curRepoURL // ex: 'https://github.com/GitLogging/GitLoggerAction'

        //     // const newRepo = state.year ?? this.getAttribute( 'repo' )
        //     // const newRepoUrl = state.month ?? this.getAttribute( 'repo-url' )

        // this.updateModel( {
        //     // repo: null,
        //     repoURL: curRepoURL,
        // } )

        // console.warn('nyi: updateFromChart')
        // return
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
        throw 'child must implement'
        // const chart = this.#attachedDom
        // const state = this.getModel()

        // // const newMetric = event.target.value // or this.#selectElement.value
        // // const newDate = event.target.valueAsDate
        // // // event.target.value is new
        // // get-attribute on self is old, even though it echo'd the change event
        // if ( this.verboseLogging ) {
        //     console.log( 'before update', chart.getQueryModel() )
        // }
        // const newRepoURL = event.currentTarget.value

        // // event.currentTarget.value
        // console.log( newRepoURL )
        // chart.updateModel( {
        //     repoURL: newRepoURL,
        //     // year: newDate.getFullYear(),
        //     // month: newDate.getMonth() + 1,
        //     // year: state.year,
        //     // month: state.month
        // } )

        // if ( this.verboseLogging ) {
        //     console.log( 'after update', chart.getQueryModel() )
        // }

        // chart.throttledRebuildAll()

        // return
        // otherChart.setAttribute( 'metric', newMetric )
        // otherChart.rebuildAll()

        // let { year, month } = chart.getQueryModel()
        // if ( this.verboseLogging ) {
        //     console.log( 'form was', chart.getQueryModel() )
        // }
        // const newYear = chart.getQueryModel().year ?? this.getAttribute( 'year' )
        // const newMonth = chart.getQueryModel().month ?? this.getAttribute( 'month' )

        // this.setAttribute( 'year', newYear )
        // this.setAttribute( 'month', newMonth )
        // this.setAttribute( 'year-month', `${ newYear }-${ newMonth }` )

        // // The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
        // // this.#inputElement.value = this.getAttribute( 'year-month' )

    }
    getModel ( options ) {
        /**
         * @description returns only the model as Json ( technically, an object ). query-specific transforms are part of `this.buildRequestURL`
         * @param {object} options - optional overrides like dropping blank fields or not. supports fields: `includeStyle` | `filterOptions`
         * @returns {object} - the model as an object that easily serializes to JSON         *
         */
        throw 'child must implement'
        options = {
            includeStyle: false,
            filterOptions: {
                dropEmpty: true,
                dropNull: true,
                dropWhitespace: true,
            },
            ...options
        }
        // // const curRepo = this.#inputElement.value
        // const curRepoURL = this.#selectElement.value

        // // const newYear = chart.getQueryModel().year ?? this.getAttribute( 'year' )
        // // const newMonth = chart.getQueryModel().month ?? this.getAttribute( 'month' )

        // //

        // let finalData = {
        //     repo: this.getAttribute( 'repo' ),
        //     repoURL: curRepoURL ?? this.getAttribute( 'repo-url' ),
        // }
        // // finalData.yearMonth = yearMonthStr

        // // this.#shadow.querySelector( ... )
        // return dropBlankProperties( finalData, options.filterOptions )
    }
}