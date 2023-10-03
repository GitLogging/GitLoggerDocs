import { distinctList, dropBlankProperties, renderJsonAsPre, throttle, debounce } from "../utils.js"
import { gitLoggerMetrics, gitLoggerMetricNames } from '../config/constants.js'
import { CachedAPI } from "../cachedApi.js"

export class GitLoggerChartElement extends HTMLElement {
    /*

    chart supports the following properties:

        repo: repository url
        maxWidth, maxHeight: optionally enforce sizes using CSS units
        no-ui: hide input controls
        year: 4 digit year
        month: month as [1..12]
        title: name of the chart
        metric: metric name to use
        max-width: constrain width of containing element
        max-height: constrain height of containing element
        chartType: chart: bar, pie, doughnut, line, radar, polarArea, bubble, scatter, ...
        label-text: standard name for optional lables on custom elements, this is in addition to the chart-title section
        debugInfo: show debugging info

    */
    #disableCache = false
    #usingLocalhost = false
    // convenience members for the user
    #shadow = null // root shadow parent for reverything
    #ctx = null // maybe redundant, reference to root div, that should always exist, child of #shadow
    #chartType = 'bar'
    #chartTitle = 'empty title'
    #metric = 'CommitCount'
    #chart // current ChartJS instance, if existing

    // internals
    #lastRequestURL = ''
    #requestUrlHistory = [] // future: autocapture datetime with events
    #ctxCanvas = null // direct pointer for ChartJS too the top level 'canvas' node. see also #shadow, #ctx

    #debugInfo = {}

    // future: metric names will by dynamic using a cached endpoint
    #metricNames = distinctList(
        gitLoggerMetricNames
    )
    verboseLogging = false

    static get observedAttributes () {
        return [ // todo: run a pass, to see which may no longer be used
            // future: custom attributes should always be hyphens?
            'chartType',
            'debugInfo',
            'metric',
            'max-height',
            'max-width',
            'label-text',
            'month',
            'otherChartType',
            'repo',
            'title',
            'year'
        ];
    }


    // constructor(ctx, options) {
    constructor() {
        super()
        if( this.verboseLogging ) {
            console.log( "trace.🤖 GitLoggerChart :: ctor [docs/module/gitLoggerChartElement.js]" )
        }
        const shadow = this.attachShadow( { mode: 'open' } );
        this.#shadow = shadow

        // this.#ctxCanvas = canvas
        // this.#ctx = div
        this.rebuildAll()

        if ( this.#disableCache ) {
            console.warn( 'caching is disabled [GitLoggerChartElement]::ctor' )
        }
    }

    connectedCallback () {
        if ( this.verboseLogging ) {
            console.debug( '[GitLoggerChartElement]::connected' );
        }
    }

    disconnectedCallback () {
        if ( this.verboseLogging ) {
            console.debug( '[GitLoggerChartElement]::disconnected' );
        }
    }

    adoptedCallback () {
        if ( this.verboseLogging ) {
            console.debug( '[GitLoggerChartElement]::adopted' );
        }
    }

    attributeChangedCallback ( name, oldValue, newValue ) {
        if ( this.verboseLogging ) {
            console.debug( `[GitLoggerChartElement]::setAttribute : ${ name } = ${ newValue } was ${ oldValue }` );
        }
        // update properties: 'repo', 'metric', 'month', 'year', 'debugInfo'
        if ( name == 'title' ) {
            this.#chartTitle = newValue
            // future: throttled rebuild on changes to title
        }
        if ( name == 'chartType' ) {
            this.#chartType = newValue
        }
    }
    hasPropertyDefined ( propertyName ) {
        return this[ propertyName ] !== undefined
    }
    rebuildCustomCSS () {
        /**
         * builds base style based on parameters
         *
         * @remarks:
         * allows overriding defaults
         *
         * @returns css content as a `string`
         */
        const css_content = `
:root {
    --primary-bg: #abc0cc;
    --primary-fg: #abc0cc;
    --primary-bg: #161821;
    --primary-bg: #6c7fcc;
    --primary-bg: #d4d6df;
    --bg-purple: #948597;
    --content-fg-main-2: #b6c1ec;
    --content-fg-main-1: #6c7fcc;
    /* --content-bg: rgb(238, 189, 171); */
    --content-bg-darker: rgb(255, 102, 0);
    --content-bg-darker: var(--brightBlue);
    --darker: var(--brightBlue);

    --border-primary-fg: #7f7f7fff;
    --border-primary-fg-dim-1: #7f7f7fd5;
    --border-primary-fg-dim-2: #7f7f7f65;
    --border-primary-fg-dim-3: #7f7f7f21;
    --border-gray-alpha: #8806067f;

    --font-family-default: 'Comfortaa', 'Segoe UI', ' Comfortaa', ' Cascadia code', ' fira code retina', sans-serif;

}

body,
html {
    font-size: 12px;
    font-size: 16px;
    /* font-family: Arial, Georgia, 'Times New Roman', Times, serif; */
    /* font-family: var(--font-family-default); */

    /* font-family: 'Comfortaa', 'cascadia code', 'Segoe UI', sans-serif;
    font-family: 'Segoe UI', 'Comfortaa', 'Cascadia code', 'fira code retina', sans-serif; */
    background-color: var(--bg-purple);
}


    /* font-family: var(--font-family-default); */
    /* font-family: 'Comfortaa', 'cascadia code', 'Segoe UI', sans-serif */

.collapsed {
    /* visibility: collapse; */
}

#mainContent {
    /* border: 2px solid magenta; */
    border: 0;
    min-height: 80%;
    margin: 20px 20px;
    padding: 60px 20px;
}

#mainFormContent a,
#mainContent a {
    color: var(--content-fg-main-2);
    text-decoration: underline;

}

#mainFormContent a:hover,
#mainContent a:hover {
    color: var(--content-fg-main-1);
    text-decoration: underline;

}

gitloggerChartRoot,
.commonChartRoot {

}
div.commonChartRoot {

}
h1,
h2,
h3 {

}

.usingMaxWidth {
    max-width: ${ this.getAttribute( 'max-width' ) ?? '200px'
            };
}
.usingMaxHeight {
    max-height: ${ this.getAttribute( 'max-height' ) ?? '200px'
            };
}
`;
        return css_content
    }
    clearDebugInfo () {
        /*
        Clears metadata bag, use `updateDebugInfo` to update new values
        */
        this.#debugInfo = {}
    }
    updateDebugInfo ( data ) {
        /*
        Append metadata to a bag, or use `clearDebugInfo` to reset
        */
        this.#debugInfo = {
            ...this.#debugInfo,
            ...data
        }
    }
    updateModel ( options ) {
        /**
         * @description updates the model, encapsulating details. accepts any keys
         * @see getQueryModel
         */

        const filterOptions = {
            dropEmpty: false,
            dropNull: false,
            dropWhitespace: true,
        }
        const opt = dropBlankProperties( options, filterOptions )

        const paddedMonth = opt.month?.toString().padStart( 2, '0' )

        if ( opt.title ) {
            console.error( 'nyi: mutate title in place: title' )
        }
        if ( opt.year ) {
            this.setAttribute( 'year', opt.year )
        }
        if ( opt.month ) {
            this.setAttribute( 'month', paddedMonth )
        }
        if ( opt.repoURL ) {
            this.setAttribute( 'repo', opt.repoURL )
        }
        // this.rebuildAll() // can cause recurse stack overflow
    }
    getQueryModel ( options ) {
        /**
         * @description returns only the model as Json ( technically, an object ). query-specific transforms are part of `this.buildRequestURL`
         * @param {object} options - optional overrides like dropping blank fields or not. supports fields: `includeStyle` | `filterOptions`
         * @returns {object} - the model as an object that easily serializes to JSON         *
        * @see updateModel
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

        // in the future: form selectors will  move controllers outside as another class
        // let metricParam = this.shadowRoot.querySelector('select#MetricName')
        // let monthParam = this.shadowRoot.querySelector( 'input#MonthParam' )
        // let yearFromAttr = this.getAttribute( 'year' )
        // let monthFromAttr = this.getAttribute( 'month' )
        // let yearFromInput = null
        // if ( monthParam ) { // future-style: learn idiomatic-js
        //     yearFromInput = monthParam.valueAsDate?.getFullYear()
        // }
        /*
        ex:
            <div debug-css="true" chartType="bar" maxHeight="400px" is="gitlogger-chart" repo="https://github.com/StartAutomating/GitLogger" metric="CommitCount"
            Year="2023" Month="04" class="gitLoggerChartRootElement"></div>

            <div debugInfo="true" debug-css="true" chartType="bar" maxHeight="400px" is="gitlogger-chart" repo="https://github.com/StartAutomating/GitLogger" metric="CommitCount"
            Year="2023" Month="04" class="gitLoggerChartRootElement"></div>
            */

        let finalData = {
            repoURL: this.getAttribute( 'repo' ),
            repoShort:  this.getAttribute( 'repo' )?.split('/').slice( -1 ),
            prefixLocalhost: 'http://127.0.0.1:7077',
            prefixLive: 'https://gitloggerfunction.azurewebsites.net',
            baseURL: 'https://gitloggerfunction.azurewebsites.net',
            year: this.getAttribute( 'year' ),
            month: this.getAttribute( 'month' ),
            metric: this.getAttribute( 'metric' ),
            chartType: this.getAttribute( 'chartType' ),
            title: this.getAttribute( 'title' ), // null resolves as auto title
            endpoint: 'Get-GitLogger',
            // yearMonthPair: this.getAttribute('year-month')
        }

        if ( this.#usingLocalhost ) {
            finalData.baseURL = finalData.prefixLocalhost
        } else {
            finalData.baseURL = finalData.prefixLive
        }
        if ( options.includeStyle ) {
            finalData = {
                ...finalData,
                maxHeight: this.getAttribute( 'max-height' ) || null,
                maxWidth: this.getAttribute( 'max-width' ) || null,
                debugCss: this.getAttribute( 'debug-css' ) || false,
            }
        }

        if ( this.hasAttribute( 'year' ) ) {
            finalData.year = this.getAttribute( 'year' )
        }
        if ( this.hasAttribute( 'month' ) ) {
            finalData.month = this.getAttribute( 'month' )
        }

        const yearMonthStr = [ finalData.year, finalData.month ].join( ', ' )
        let autoTitle = `${ finalData.metric } for ${ yearMonthStr }`

        // optionally update model
        finalData.title ??= autoTitle
        this.setAttribute( 'title', autoTitle )
        this.#shadow.querySelector( '#linkInfoText' ).innerHTML = finalData.title

        this.updateDebugInfo( {
            autoTitle: autoTitle,
            title: finalData.title,
            metricFromAttr: this.getAttribute( 'metric' ),
            // metricFromInput: metricParam?.value,
            metric: finalData.metric,
            year: finalData.year ?? null,
            month: finalData.month ?? null,
            // yearFromAttr: yearFromAttr ?? null,
            // yearFromInput: yearFromInput ?? null,
            // monthFromAttr: monthFromAttr ?? null,
            // monthFromInput: yearFromInput ?? null,
        } )

        return dropBlankProperties( finalData, options.filterOptions )
    }
    buildRequestURL ( options ) {
        /**
        * build a request url based on the chart's current state
        *
        * @param options - optional overrides, else uses chart's state
        * @remarks
        * @returns {string} - the url to fetch data from
       */
        const config = this.getQueryModel() // {...options })
        const config_withEmpty = this.getQueryModel( {
            filterOptions: {
                dropEmpty: true,
                dropNull: true,
            }
        } )
        // future: should sync properties on change
        // if(this.hasAttribute('year')){
        // this.setAttribute('year', yearFromInput )
        // config.year = this.getAttribute('year')
        // }

        // const yearMonthStr = [ config.year, config.month ].join(', ')
        // let autoTitle = `${ config.metric } for ${ yearMonthStr }`
        // this.#debugInfo.autoTitle = autoTitle
        // this.setAttribute('title', autoTitle)


        // pm[0].valueAsDate.getFullYear()
        // // config.year = monthParam.valueAsDate.getFullYear()

        // console.log("buildRequestURL() : defaults = ", config )
        // config = { ...config, ...options }
        // config.baseUrl = config.usingLocalhost ? config.prefixLocalhost : config.prefixLive
        // console.log("final config", config )
        const selectedParams = {
            Repository: config.repoURL,
            Metric: config.metric,
            Year: config.year,
            Month: config.month
        }
        const dropBlank = dropBlankProperties( selectedParams )
        const newSearchParams = new URLSearchParams( dropBlank )
        // const pwshEndpont = 'Get-GitLogger'
        const renderURL = `${ config.baseURL }/${ config.endpoint }?${ newSearchParams.toString() }`
        if ( this.verboseLogging ) {
            console.log( 'finalUrl', renderURL )
        }
        return renderURL
        return 'http://127.0.0.1:7077/Get-GitLogger?Repository=https://github.com/StartAutomating/Ugit&Metric=CommitCount&Year=2023&Month=01'

        // return "http://127.0.0.1:7077/Get-GitLogger?Repository=https://github.com/StartAutomating/Ugit&Metric=CommitCount&Year=2023&Month=01"

        /*
        // Url: "http://127.0.0.1:7077/Get-GitLogger?
            Repository = https://github.com/StartAutomating/Ugit
            Metric = CommitCount
            Year = 2023
            Month = 01"
        */
    }
    throttledRebuildAll () {
        console.warn('throttle here')
        this.rebuildAll()
        return

    }
    rebuildAll () {
        /**
         * Regenerates chart elements under the `#shadow` dom
         *
         * @remarks
         * builds the dom and event handlers, required for the ChartJS graph and controls
         * It also invokes `flattenData`
        *
        * todo: future: debounce/throttle this render call
        * besides caching request, the`Chart()` itself can be reused without destroying elements
        */

        const shadow = this.#shadow
        shadow.replaceChildren();
        if ( this.verboseLogging ) {
            console.log( "[GitLoggerChartElement]::rebuildAll [docs/module/gitLoggerChartElement.js]" )
        }

        const style = document.createElement( 'style' );
        style.textContent = this.rebuildCustomCSS()
        shadow.appendChild( style );

        const style0 = document.createElement( 'link' );
        style0.setAttribute( 'href', 'https://fonts.googleapis.com/css?family=Comfortaa' );
        style0.setAttribute( 'rel', 'stylesheet' );
        shadow.appendChild( style0 )

        // this  kind of contextextual boiler-plate is when copilot is useful
        // add stylesheets to shadowdom for
        // <link rel="stylesheet" type="text/css" href="style/Flexbits.css" />
        // <link rel="stylesheet" type="text/css" href="style/iceberg-dark.css" />
        // <link href="style/base.css" rel="stylesheet"></link>
        const style1 = document.createElement( 'link' )
        style1.setAttribute( 'href', 'style/Flexbits.css' )
        style1.setAttribute( 'rel', 'stylesheet' )
        shadow.appendChild( style1 )
        const style2 = document.createElement( 'link' )
        style2.setAttribute( 'href', 'style/iceberg-dark.css' )
        style2.setAttribute( 'rel', 'stylesheet' )
        shadow.appendChild( style2 )
        const style3 = document.createElement( 'link' )
        style3.setAttribute( 'href', 'style/base.css' )
        style3.setAttribute( 'rel', 'stylesheet' )
        const style4 = document.createElement( 'link' )
        style4.setAttribute( 'href', 'style/gitLoggerChart.css' )
        style4.setAttribute( 'rel', 'stylesheet' )
        // shadow.appendChild(style3)

        const divRoot = document.createElement( 'div' ); // effective base. is also '#ctx'
        divRoot.setAttribute( 'id', 'gitloggerChartRoot' ); // doesn't need to be class because it's a shadow dom
        divRoot.setAttribute( 'class', 'commonChartRoot' ); // doesn't need to be class because it's a shadow dom
        shadow.appendChild( divRoot );

        // div.style = `position: relative; height:80vh; width:80vw`
        // <link href="style/base.css" rel="stylesheet"></link>
        const tempStyle = document.createElement( 'link' )
        tempStyle.setAttribute( 'href', 'style/base.css' )
        tempStyle.setAttribute( 'rel', 'stylesheet' )
        shadow.appendChild( tempStyle );

        const optionalDivTitle = document.createElement( 'div' )
        optionalDivTitle.setAttribute( 'class', 'elementLabel' )
        const labelText = this.getAttribute('label-text') ?? ''
        optionalDivTitle.innerText = labelText
        if( labelText == '' ) {
            optionalDivTitle.style.display = 'none'
        }
        // shadow.appendChild(optionalDivTitle)
        divRoot.appendChild(optionalDivTitle)
        // context.appendChild(optionalDivTitle)


        // #647e8f

        const canvas = document.createElement( 'canvas' )
        canvas.setAttribute( 'id', 'myChart' )
        if ( this.hasAttribute( 'max-height' ) ) {
            canvas.setAttribute( 'class', 'usingMaxHeight' )
        }
        if ( this.hasAttribute( 'max-width' ) ) {
            canvas.setAttribute( 'class', 'usingMaxWidth' )
        }

        shadow.appendChild( canvas )


        // chartContainer.appendChild(canvas)
        // shadow.appendChild(canvas)
        // or shadow.appendChild(div)
        /*
        <div id='myChartContainer' style='position: relative; height:80vh; width:80vw'>
        <canvas id="myChart"></canvas>
        */

        this.#ctxCanvas = canvas
        this.#ctx = divRoot

        const context = this.#ctx;

        if ( this.#ctx === null ) {
            console.error( 'Mandatory ctx is null! [GitLoggerChartElement]::rebuildAll' )
            return
        }

        const showDebugInfoBox = this.hasAttribute( 'debugInfo' )
        this.#chartType = this.getAttribute( 'chartType' )
        this.#chartTitle = this.getAttribute( 'title' )
        this.#metric = this.getAttribute( 'metric' )

        const messageBox = document.createElement( 'div' )
        messageBox.setAttribute( 'id', 'debugInfoBox' )
        messageBox.setAttribute( 'class', 'hidden' )

        // shadow.appendChild(messageBox)
        shadow.insertBefore( messageBox, this.#ctx )
        // context.appendChild(messageBox)
        // shadow.appendChild(messageBox)

        // copilot works great for this, like:
        //   <input list="SavedRepositoryURLList" type="url" id="RepositoryURLChoice" name="RepositoryURLChoice"

        const linkAddRepo = document.createElement( 'a' )
        linkAddRepo.setAttribute( 'href', 'javascript:void(0)' )
        const linkToggleDebug = document.createElement( 'a' )
        linkToggleDebug.setAttribute( 'href', 'javascript:void(0)' )
        linkToggleDebug.setAttribute( 'id', 'linkInfoText' )
        // linkToggleDebug.innerHtml = `Info`

        const svgContents = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
        linkAddRepo.innerHTML = `${ svgContents }`

        linkToggleDebug.innerHTML = `info`

        context.appendChild( linkToggleDebug )

        messageBox.addEventListener( 'click', ( event ) => {
            const debugBox = this.#shadow.querySelector( "#debugInfoBox" )
            // console.log( debugBox )
            debugBox.classList.toggle( 'hidden' )
        } )
        linkToggleDebug.addEventListener( "click", ( event ) => {
            const debugBox = this.#shadow.querySelector( "#debugInfoBox" )
            debugBox?.classList.toggle( 'hidden' )
            // const monthParam = this.#shadow.querySelector("#MonthParam")
            // console.log(debugBox)
            // if( debugBox.style.display !== 'none' ) {
            // debugBox.style.display = 'none'
            // } else {
            // debugBox.style.display = 'block'
            // }

            messageBox.innerHTML = `
    LastRequest: <br/><a href="${ decodeURIComponent(
                this.#debugInfo.lastRequestURL )
                }">${ decodeURIComponent(
                    this.#debugInfo.lastRequestURL )
                }</a>
    <br/>LastHistory: <br/>${ this.#requestUrlHistory.map( ( e ) => `<a href="${ e }">${ e }</a>` ).join( "<br/>" )
                }
    <br/>
    ${ renderJsonAsPre( this.#debugInfo )
                }
    `
    // <br/>LastHistory: <br/>${ this.#requestUrlHistory.map( ( e ) => `<a href="${ e }">${ e }</
        } )
        if ( showDebugInfoBox ) {
            messageBox.classList.remove( 'hidden' )
        }
        // let fetchURL = `http://127.0.0.1:7077/Get-GitLogger?repository=https://github.com/StartAutomating/${repoName}&Metric=BusyMonth`
        // const responseJson = await response.json()
        // const graphData = []
        // const labels = []

        const newRequestURL = this.buildRequestURL()
        this.updateDebugInfo( {
            lastRequestURL: newRequestURL
        } )

        this.#lastRequestURL = newRequestURL
        this.#requestUrlHistory.push( this.#lastRequestURL )
        // if ( false ) {
        //     console.log( `🌎Fetch 🟢 cached:  ${ this.#lastRequestURL }` )
        // } else {
        //     console.log( `🌎Fetch 🟡 not cached: ${ this.#lastRequestURL }` )
        // }

        // let knownCached = new Set( Array.from( localStorage.getItem( 'cachedURLList' ) ) ) ?? new Set()
        // console.log( '🌎', knownCached.has( newRequestURL ) )

        // CachedAPI.resetCache()
        // knownCached.push( newRequestURL )

        if ( this.verboseLogging ) {
            console.log( `🧪 GitLoggerChartElement::disabledCache == ${ this.#disableCache }` )
        }
        if(this.#disableCache) {
            CachedAPI.deleteCachedURL( newRequestURL )
        }
        const cachedResponse = CachedAPI.requestURL( newRequestURL )
        let data

        try {
            data = JSON.parse( cachedResponse )
        } catch (err) {
            console.warn( `FailedParsingJsonInput: ${ err } `)
            console.error(`GitLoggerChart::rebuildAll FailedParsingJsonResponse: ${ newRequestURL }`)
            console.debug(
                `GitLoggerChart::rebuildAll FailedParsingJsonResponse: ${ newRequestURL }`
            )
            console.debug( err.stack )
            // throw new Error(`GitLoggerChart::rebuildAll FailedParsingJsonResponse`)
            return
        }



        const gitUserNames =
            new Set( data.map( (i) => i.GitUserName ) )

        const { labels, graphData } = this.flattenData(data)
        const chartType = this.#chartType

        const customLabel = this.#chartTitle ?? 'default text'
        this.showChartJS({
            type: chartType,
            data: {
                labels: labels,
                datasets: [
                    {
                        label: customLabel,
                        data: graphData,
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        })

        return
    }
    showChartJS ( options ) {
        /**
         * creates a new ChartJS graph instance
         *
         * @remarks:
         * allows extending default options
        *
        * see also: https://www.chartjs.org/docs/latest/developers/api.html
         */
        // future: could update it, instead of destroying it
        // ensure resources are cleaned up before creating a new chart
        if ( this.#ctxCanvas === null ) {
            console.log( 'warn: chart not ready' );
        }
        if ( this.#chart ) {
            this.#chart?.destroy()
            this.#chart = null
        } else { }

        try {
            this.#chart = new Chart( this.#ctxCanvas, options );
        } catch ( err ) {
            console.log( err )
            throw err
        }
    }
    flattenData ( data ) {
        /**
         * flattens data from the API into a format that ChartJS can render
         *
         * @param data - json from the API
         *
         * @returns {labels, graphData}
        **/

        // collect and transform data, before being passed to render
        // */
        const labels = []
        const graphData = []

        try {
            data.map( element => {
                // data[0]
                // {GitUserName: 'StartAutomating', Commits: 796}
                //             // example: {Month: 'January', LinesChanged: 0}
                labels.push(
                    Object.values( element )[ 0 ]
                )
                // Object.values(element) becomes tuple: ['January', 0]
                // therefore january
                graphData.push(
                    Object.values( element )[ 1 ] )
            } )
            return {
                labels: labels, graphData: graphData
            }
        } catch ( err ) {
            console.error( err )
        }
    }


}

// customElements.define( 'git-logger-chart', GitLoggerChartElement, { extends: "div" } );
customElements.define( 'git-logger-chart', GitLoggerChartElement );



