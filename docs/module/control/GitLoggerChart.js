import { distinctList, dropBlankProperties, renderJsonAsPre, throttle, debounce } from "../utils.js"
import { gitLoggerMetrics, gitLoggerMetricNames } from '../config/constants.js'
import { getServerConfig } from '../config/server.js'
import { CachedAPI } from "../cachedApi.js"

export class GitLoggerChartElement extends HTMLElement {
    /*

    chart supports the following properties:

        chart-title: title of the chart, sets `options.plugins.title.text`
        chart-subtitle: subtitle of the chart, sets `options.plugins.subtitle.text`
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
    #requestFailCount = 0
    #disableCache = false

    /* warning, url.RelativePath differs for local verses live:

        http://localhost:9099/api/Get-GitLogger?Repository=https://github.com/StartAutomating/ugit
        https://gitloggerfunction.azurewebsites.net/Get-GitLogger?Repository=https://github.com/StartAutomating/ugit
    */

    // convenience members for the user
    #shadow = null // root shadow parent for reverything
    #ctx = null // maybe redundant, reference to root div, that should always exist, child of #shadow
    #chartType = 'bar'
    // #chartTitle = 'empty title'
    #metric = 'CommitCount'
    #chart // current ChartJS instance, if existing

    // show final options used by `ShowChartJS()` when constructing the `Chart()`
    #lastChartOptions

    // internals
    #lastRequestURL = ''
    #lastRebuildAllInfo = {
        lastRequestUrl: '', // this.#lastRequestURL,
        lastRebuildAllTime: null, // new Date(),
        lastThrottledRebuildAllTime: null, // new Date(),
        lastRebuildFromResponseTime: null, // new Date(),
    }

    #requestUrlHistory = [] // future: autocapture datetime with events
    #ctxCanvas = null // direct pointer for ChartJS too the top level 'canvas' node. see also #shadow, #ctx

    // controls: Chart.Plugin.Title
    #chartTitle = null
    #chartLabel = null
    // controls: Chart.Plugin.Title
    #chartSubTitle = null
    // metadata on the current state, information that doesn't trigger rebuilding the model
    #stateInfo = {
        chart: {
            dataIsEmptyArray: false, // response.Data exists and is empty
        }
    }

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
            'chart-title',
            'chart-subtitle',
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
        try {
            this.rebuildAll()
        } catch {
            this.#requestFailCount++
            console.log(`GitLoggerChartElement::rebuildAll() had an error. retrying... fail count: ${ this.#requestFailCount } `)
            if( this.#requestFailCount <= 1 ) {
                setTimeout( () => { this.rebuildAll() }, 400)
            }
        }

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
        if ( name == 'dimension-title' ) {
            // this.#chartTitle = newValue
            // future: throttled rebuild on changes to title
        }
        if ( name == 'chartType' ) {
            this.#chartType = newValue
        }
    }
    hasPropertyDefined ( propertyName ) {
        return this[ propertyName ] !== undefined
    }

    get chartTitle() {
        return this.#chartTitle
    }
    set chartTitle( text ) {
        if (typeof text === 'string') {
            this.#chartTitle = text
            this.setAttribute('chart-title', text)
            this.rebuildAll()
        }
        // this.updateChartConfig(...)
    }
    get chartSubTitle() {
        return this.#chartSubTitle
    }
    set chartSubTitle( text ) {
        if (typeof text === 'string') {
            this.#chartSubTitle = text
            this.setAttribute('chart-subtitle', text)
            this.rebuildAll()
        }
        // this.updateChartConfig(...
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


    updateChartConfig ( options ) {
        console.group('Chart::UpdateChartConfig()')

        if(this.verboseLogging) {
            console.log('GitLoggerChartElement::updateChartConfig', options )
        }

        console.log(`updating Chart() with new state, currently a no-op.`, options)
        console.log(
        'this would first update the options for the chart, and then call `this.rebuildAll()`',
        `see implementation of the property 'this.#chartSubTitle' for an example` )
        console.groupEnd()
    }
    getChartConfig () {
        /**
         * @description returns options used for the last Chart() instantiation
         */
        return {
            initOptions: this.#lastChartOptions,
            curOptions: this.#lastChartOptions // todo: inspect chart metadata instead
            // otherStates: 123,
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
        if(this.verboseLogging) {
            console.log('GitLoggerChartElement::updateModel', opt )
        }

        if ( opt.title ) {
            console.error( 'nyi: mutate title in place: title' )
        }
        if ( opt.labelText ) {
            this.setAttribute('label-text', opt.labelText)
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
    updateMetadata ( stateOptions ) {
            /**
             * @description updates the model, encapsulating details. accepts any keys
             * @see getMetadata
             */

            const filterOptions = {
                dropEmpty: false,
                dropNull: false,
                dropWhitespace: true,
            }
            const opt = dropBlankProperties( stateOptions, filterOptions )
            this.#stateInfo = {
                ...this.#stateInfo,
                ...opt
            }
        }

    getMetadata ( options ) {
        /**
         * @description returns info that would not trigger a query or model update
         * @param {object} options - optional overrides like dropping blank fields or not. supports fields: `includeStyle` | `filterOptions`
         * @returns {object} - metadata as a record
        * @see getMetadata
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
        let finalData = {
            ...this.#stateInfo
        }
        return dropBlankProperties( finalData, options.filterOptions )
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
            repoURL        : this.getAttribute( 'repo' ),
            repoShort      : this.getAttribute( 'repo' )?.split('/').slice( -1 ),
            baseURL        : getServerConfig().urlPrefix,
            year           : this.getAttribute( 'year' ),
            month          : this.getAttribute( 'month' ),
            metric         : this.getAttribute( 'metric' ),
            chartType      : this.getAttribute( 'chartType' ),
            title          : this.getAttribute( 'title' ),                          // null resolves as auto title
            endpoint       : 'Get-GitLogger',
            // yearMonthPair: this.getAttribute('year-month')
        }


        if ( options.includeStyle ) {
            finalData = {
                ...finalData,
                maxHeight: this.getAttribute( 'max-height' ) || null,
                maxWidth : this.getAttribute( 'max-width' )  || null,
                debugCss : this.getAttribute( 'debug-css' )  || false,
            }
        }
        this.setAttribute('label-text', finalData.repoShort )

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
            Metric    : config.metric,
            Year      : config.year,
            Month     : config.month
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
        console.groupCollapsed('throttledRebuildAll()')
        console.log( this.#lastRebuildAllInfo)
        this.#lastRebuildAllInfo.lastThrottledRebuildAllTime = new Date()
        console.log( this.#lastRebuildAllInfo)
        console.groupEnd()

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
        console.groupCollapsed('rebuildAll()')
        console.log( this.#lastRebuildAllInfo)
        this.#lastRebuildAllInfo.lastRebuildAllTime = new Date()
        console.log( this.#lastRebuildAllInfo)
        console.groupEnd()


        const shadow = this.#shadow
        let pathJekyllPrefix = '../style/' ?? '' // to work around Jekyll's relative paths
        pathJekyllPrefix = ''
        pathJekyllPrefix = '../style/'

        // pathJekyllPrefix = 'style/'
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
        style1.setAttribute( 'href', `${ pathJekyllPrefix }Flexbits.css` )
        style1.setAttribute( 'href', `style/Flexbits2.css` )
        style1.setAttribute( 'href', `style/Flexbits1.css` )
        style1.setAttribute( 'rel', 'stylesheet' )
        shadow.appendChild( style1 )
        const style2 = document.createElement( 'link' )
        style2.setAttribute( 'href', `${ pathJekyllPrefix }iceberg-dark.css` )
        style2.setAttribute( 'rel', 'stylesheet' )
        shadow.appendChild( style2 )
        const style3 = document.createElement( 'link' )
        style3.setAttribute( 'href', `${ pathJekyllPrefix }base.css` )
        style3.setAttribute( 'rel', 'stylesheet' )
        const style4 = document.createElement( 'link' )
        style4.setAttribute( 'href', `${ pathJekyllPrefix }gitLoggerChart.css` )
        style4.setAttribute( 'rel', 'stylesheet' )
        // shadow.appendChild(style3)

        const divRoot = document.createElement( 'div' ); // effective base. is also '#ctx'
        divRoot.setAttribute( 'id', 'gitloggerChartRoot' ); // doesn't need to be class because it's a shadow dom
        divRoot.setAttribute( 'class', 'commonChartRoot' ); // doesn't need to be class because it's a shadow dom
        shadow.appendChild( divRoot );

        // div.style = `position: relative; height:80vh; width:80vw`
        // <link href="style/base.css" rel="stylesheet"></link>
        const debugStyle = document.createElement( 'link' )
        debugStyle.setAttribute( 'href', `${ pathJekyllPrefix }usingDebug.css` )
        debugStyle.setAttribute( 'rel', 'stylesheet' )
        if ( this.hasAttribute( 'debug-css' ) ) {
            shadow.appendChild( debugStyle );
        }

        const tempStyle = document.createElement( 'link' )
        tempStyle.setAttribute( 'href', `${ pathJekyllPrefix }base.css` )
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
@        */

        this.#ctxCanvas = canvas
        this.#ctx = divRoot

        const context = this.#ctx;

        if ( this.#ctx === null ) {
            console.error( 'Mandatory ctx is null! [GitLoggerChartElement]::rebuildAll' )
            return
        }

        const showDebugInfoBox = this.hasAttribute( 'debugInfo' ) // to remove
        this.#chartType = this.getAttribute( 'chartType' )
        this.#chartTitle = this.getAttribute( 'dimension-title' )
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
        linkToggleDebug.setAttribute( 'href', this.#lastRequestURL )
        linkToggleDebug.setAttribute( 'id', 'linkInfoText' )
        linkToggleDebug.setAttribute( 'target', '_blank' )

        // linkToggleDebug.innerHtml = `Info`

        const svgContents = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
        linkAddRepo.innerHTML = `${ svgContents }`

        linkToggleDebug.innerHTML = `info`

        context.appendChild( linkToggleDebug )

        shadow.addEventListener( 'click', ( event ) => {
            // click removes the most recent url from the cache, leaving the remaining items
            console.log(`debug: clear cached url: ${ this.#lastRequestURL } `)
            let configNeverCallback = false
            CachedAPI.deleteCachedURL( this.#lastRequestURL )
            // reload after a delay
            CachedAPI.requestURL( this.#lastRequestURL )
            // todo: future: move this logic to this.throttledRebuildAll()
                // Or, it could be caused by the live-reload. test whether it heppens on production
            // note: the problem here is because if you click 3 times, the event handler
            // is being registered 3 times, because it flashes 1 extra time per click
            // so, unregister the callback before .rebuildAll DOM is cleaned up
            if( configNeverCallback )  { return }
            if( this.#requestFailCount <= 0 ) {
                setTimeout( () => {
                    this.rebuildAll()
                    console.log('rebuildAll::click => rebuildAll')
                    this.#requestFailCount = 0
                }, 150)
            }
        } )
        const newRequestURL = this.buildRequestURL()
        if( this.#lastRequestURL == newRequestURL ) {
            console.warn( `request url hasn't changed, state may have.` )
        }
        this.#lastRequestURL = newRequestURL
        this.#lastRebuildAllInfo.lastRequestUrl = this.#lastRequestURL
        this.#requestUrlHistory.push( this.#lastRequestURL )

        if ( this.verboseLogging ) {
            console.log( `🧪 GitLoggerChartElement::disabledCache == ${ this.#disableCache }` )
        }
        if(this.#disableCache) {
            CachedAPI.deleteCachedURL( newRequestURL )
            console.log( '#cache is disabled')
        }
        const cachedResponsePromise = new Promise((resolve, reject) => {
            const cachedResponse = CachedAPI.requestURL(newRequestURL);
            if (cachedResponse) {
                resolve(cachedResponse);
            } else {
                reject('Failed to get cached response');
            }
        });

        cachedResponsePromise
            .then(response => {
                // console.debug( 'CachedResponsePromise::ThenA', response)
                return response
            })
            .catch(
                error =>
                    console.error( 'CachedResponsePromise::Catch', error))
            .then(
                (response) => {
                    if( this.verboseLogging ) {
                        console.debug( 'CachedResponsePromise::ThenB rebuildAllUpdateFromResponse', response)
                    }
                    this.rebuildAllUpdateFromResponse( response )
                }
            )

        const curRepoURL = this.getQueryModel().repoURL
        // next query build

        // const repoDimensionsPromise = new Promise((resolve, reject) => {
        //     const nextUrl = `http://localhost:9099/api/Get-GitLogger?Repository=${ curRepoURL
        //         }&Metric=RepoSummary`
        //     const cachedResponse = CachedAPI.requestURL(nextUrl);
        //     if (cachedResponse) {
        //         resolve(cachedResponse);
        //     } else {
        //         reject('Failed to get cached response');
        //     }
        // });


        // repoDimensionsPromise.then(response => {
        //     // console.log('RepoSummary', response)
        //     return response.Data[0]
        // }).then(data => {
        //     const meta = {
        //         start: data.StartDate,
        //         end: data.EndDate,
        //         filters: data.DateFilters,
        //         users: data.GitUserNames,
        //         records: data.RecordCount,
        //         startYear: data.StartYear,
        //         endYear: data.EndYear,
        //     }
        //     if(this.verboseLogging) {
        //         console.log(meta)
        //     }
        //     const message = `From ${ meta.start } to ${ meta.end } there are ${ meta.records } records for ${ meta.users } users.`
        //     console.log(curRepoURL, message)
        // })

    }
    rebuildAllUpdateFromResponse ( response ) {
        /**
         * at the end of rebuildAll(), it async invokes this function with the new json data         *
         * Which comes from either the cache, else a fetch()
         *
         * @param response - json from the GitLoggerAPI endpoint
         *
         *
        **/

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
        // let curChartTitle = this.getAttribute('chart-title', 'def')
        // let curChartTitle = this.getAttribute('chart-title') ?? ''
        // // let curChartSubTitle = this.getAttribute('chart-subtitle', 'def')
        // let curChartSubTitle = this.getAttribute('chart-subtitle') ?? ''
        // this.#chartLabel = this.getAttribute('chart-label') ?? ''
        let curChartTitle = this.getAttribute('chart-title')
        // let curChartSubTitle = this.getAttribute('chart-subtitle', 'def')
        let curChartSubTitle = this.getAttribute('chart-subtitle')
        this.#chartLabel = this.getAttribute('chart-label')

        let data = response.Data ?? response[0].Data

        if( this.verboseLogging ) {
            console.groupCollapsed('rebuildAllUpdateFromResponse()')
            console.log( this.#lastRebuildAllInfo)
        }
        this.#lastRebuildAllInfo.lastRebuildFromResponseTime = new Date()
        if( this.verboseLogging ) {
            console.log( this.#lastRebuildAllInfo)
            console.groupEnd()
        }

        if( ! response ) {
            throw new Error(`InvalidState: Response: ${ response } `)
        }
        if( ! data ) {
            throw new Error(`InvalidState: falsy response.Data = ${ response.Data } `)
        }
        if( ! ('map' in data) ) {
            throw new Error(`InvalidState: .map() not defined in 'data' ! ${ data } `)
        }

        const gitUserNames =
            new Set( data.map( (i) => i.GitUserName ) )

        const { labels, graphData } = this.flattenData(data)
        const chartType = this.#chartType

        let resultIsEmptyArray = false
        if( Array.isArray(data) && data.length == 0 ) {
            resultIsEmptyArray = true
        }
        this.#stateInfo.chart.dataIsEmptyArray = resultIsEmptyArray

        // guess at keys based on the JSON shape
        let maybeKeysList =
             Object.keys( data[0] ?? [] )
            //  Object.keys( data[0] )
        let defaultAxisLabel =
            maybeKeysList[0] ?? 'Axis'

        if(resultIsEmptyArray) {
            defaultAxisLabel = 'No Records Found'
            // this.#chartTitle = 'empty'
            // this.#chartTitle = 'No Records Found'
            // this.chartTitle = 'No Records (title)'
            // this.chartSubTitle = 'No Records (subtitle)'
        }

        console.debug(
            `autoTitleFromKeys: ${
                maybeKeysList.join(', ')
            }`
        )

        // let customLabel = this.#chartTitle ?? defaultAxisLabel
        let customLabel = this.#chartLabel ?? defaultAxisLabel
        let optionsConfig = {
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
                        display: ! resultIsEmptyArray,
                        beginAtZero: true,
                    },
                },
                plugins: {
                    title: {
                        display: true,
                        text: curChartTitle
                        // text: this.chartTitle
                    },
                    subtitle: {
                        display: true,
                        text: curChartSubTitle
                        // text: this.chartSubTitle
                    }
                },
            },
        }
        // if( ! this.#chartTitle) {
        //     // force on for test
        //     this.#chartTitle = 'Chart.Title.'

        // }
        // if( ! this.#chartSubTitle) {
        //     // force on for test
        //     this.#chartSubTitle = 'Chart.Subtitle'

        // }

        if( ! this.#chartTitle ) {
            optionsConfig.options.plugins.title.display = false
        }
        if( ! this.#chartSubTitle ) {
            optionsConfig.options.plugins.subtitle.display = false
        }

        this.showChartJS(optionsConfig)
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

        if( this.verboseLogging ) {
            console.group ('GLC::ShowChartJS')
        }
        // console.groupCollapsed ('GLC::ShowChartJS')

        if ( this.#ctxCanvas === null ) {
            if( this.verboseLogging ) {
                console.log( 'verbose warn: #ctxCanvas was  null' )
            }
        }
        if ( this.#chart ) {
            if( this.verboseLogging ) {
                console.log('#chart.destroy()')
            }
            this.#chart?.destroy()
            this.#chart = null
        } else {
            console.warn( '::showChartJS => this.#chart was blank')
        }

        if( this.verboseLogging ) {
            console.log('new Chart() with options', options)
        }

        this.#lastChartOptions = options
        try {
            this.#chart = new Chart( this.#ctxCanvas, options );
            // when blank, hide axis <https://www.chartjs.org/docs/latest/axes/>
        } catch ( err ) {
            console.warn( '::showChartJS: new Chart(...) Exception! Re-throwing...', err )
            throw err
        } finally {
            if( this.verboseLogging ) {
                console.groupEnd()
            }
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
        let targetData = data

        try {
            targetData.map( element => {
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



