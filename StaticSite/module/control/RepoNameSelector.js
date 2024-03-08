import { distinctList, debounce, dropBlankProperties } from "../utils.js"
import { gitLoggerMetrics, gitLoggerMetricNames, gitRepositoryDefaultURLs } from '../config/constants.js'
import { getServerConfig } from '../config/server.js'
import { CachedAPI } from "../cachedApi.js"

export class RepoNameSelector extends HTMLElement {
    /**
     * @description an input that selects 'year_month' date pairs*

     * The html Element supports the following attributes
     * `chart-id-list` - is the `id` of the `GitLoggerChartElement` instance to attach to
     * `repo` - repository short name
     * `repo-url` - repository full URL
     * @example
        <repo-name-selector chart-id-list="first-chart" label-text="RepoName"></repo-name-selector>
     *
     **/
    #shadow // the shadowRoot node
    #selectRepoElement // the core selector <selector name="selectedRepo" id="repoName">
    #attachedDomList = [] // attached to <git-logger-chart> elements  [GitLoggerChartElement[]] elements
    #attachedDomSelector // css selectors to attach, ex value: "#chart-one,#chart-two",
    #rootElement // topmost div under shadow,below style tag
    #lastRequestInfo = {
        lastRequestUrl: ''
    }

    repoURLList = distinctList( gitRepositoryDefaultURLs )
    verboseLogging = false

    constructor() {
        super();
        const shadow = this.attachShadow( { mode: 'open' } );
        this.#shadow = shadow
        this.rebuildAll()
    }
    static get observedAttributes () {
        return [ // todo: run a pass, to see which may no longer be used
            'repo', 'repo-url',
            'chart-id-list',
            'label-text',
            'user-name',
            // ,
            // // 'label-text'
            // // 'chart-id-list' // future: should
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
        if ( oldValue == newValue )  {
            if ( this.verboseLogging ) {
                console.debug( `[RepoNameSelector]::setAttribute : unchanged: ${ name } = ${ newValue } was ${ oldValue }` );
                return
            }

        }
        if ( this.verboseLogging ) {
            console.debug( `[RepoNameSelector]::setAttribute : ${ name } = ${ newValue } was ${ oldValue }` );
        }
        if ( name == "user-name" ) {
            this.updateModel({userName: newValue })
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

        if( opt.repoURL ) {
            this.setAttribute('repo-url', opt.repoURL)
            this.#selectRepoElement.value = opt.repoURL
        }
        if( opt.repo ) {
            this.setAttribute('repo', opt.repo)
        }
        if( opt.chartIdList ) {
            this.setAttribute('chart-id-list', opt.chartIdList)
        }
        if ( opt.userName ) {
            if( opt.userName == this.getAttribute('user-name')) {
                console.log('model property was unchanged. skipping write.')
                return
            }
            console.log( 'model was updated, setting...')
            this.setAttribute('user-name', opt.userName)
        }
        return
    }
    attachTo ( targetChart ) {
        /**
         * @description Attach to [GitLoggerChartElement] element, else null and update to name to the existing chart's value
         * @see getQueryModel
         * @see updateSelfFromChart
         * @see updateModel
         * @see attachTo
        **/
        if ( ! targetChart ) {
            console.error( `Control is not attached to a chart` )
            return
        }
        if( ! this.#attachedDomList.includes( targetChart )) {
            this.#attachedDomList.push( targetChart )
        }
        const debug_enableUpdates = true
        if(debug_enableUpdates) {
            this.updateSelfFromChart()
        }
    }
    updateSelfFromChart () {
        /**
         * @description read the chart's state, updating self
         * The format is "yyyy-MM" where yyyy is year in four or more digits, and MM is 01-12.
         **/

        // for now, only read state from the first chart
        const targetChart = this.#attachedDomList[0]
        if( ! targetChart ) { return }
        const state = targetChart.getQueryModel()
        const chartRepoURL = state.repoURL
        // this.repoURLList.filter( (s) => s.match( chartRepoURL ))
        const isValidChoice  = this.repoURLList.includes( chartRepoURL )
        if( ! isValidChoice) {
            if( this.verboseLogging ) {
                console.warn(`repoUrl for the first chart does not match RepoNameSelector's current options`)
                return
            }
        }
        this.updateModel( {
            // repo: null,
            repoURL: chartRepoURL,
        } )
        this.setAttribute('repo-url', chartRepoURL)

        return
    }
    updateChartFromSelf ( event ) {
        /**
         * @description update attached chart's state from self's state
        * alias as this.updateModel()
         **/
        const state = this.getModel()
        // Array.from( this.#attachedDomList ).forEach( (o) => console.log(o))
        for(const chart of this.#attachedDomList) {
            if ( this.verboseLogging ) {
                console.log(`RepoNameSelector::updateChartFromSelf, event`, event)
                // console.log( 'updateChartFromSelf: inital state', chart.getQueryModel() )
            }
            const newRepoURL = event.currentTarget.value
            chart.updateModel( {
                repoURL: newRepoURL,
            } )
            if ( this.verboseLogging ) {
                // console.log( 'after update', chart.getQueryModel() )
            }
            chart.throttledRebuildAll()
        }
        return
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
        const curRepoURL = this.#selectRepoElement.value

        let finalData = {
            repo       : this.getAttribute( 'repo' ),
            repoURL    : curRepoURL ?? this.getAttribute( 'repo-url' ),
            chartIdList: this.getAttribute( 'chart-id-list' ),
        }
        // finalData.yearMonth = yearMonthStr

        // this.#shadow.querySelector( ... )
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
        let finalData = {
            userName: this.getAttribute('user-name'),
            includePrivate: false,
            baseURL        : getServerConfig().urlPrefix,
            endpoint       : 'Get-MyRepos',
        }
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
        const selectedParams = {
            User          : config.userName,
            IncludePrivate: config.includePrivate,
        }
        const dropBlank = dropBlankProperties( selectedParams )
        const newSearchParams = new URLSearchParams( dropBlank )
        const renderURL = `${ config.baseURL }/${ config.endpoint }?${ newSearchParams.toString() }`
        return renderURL
    }
    rebuildAll () {
        /**
         * @description expensive: regenerate `datalists`, `inputs` and any other DOM elements based on the metric name list
         **/
              /*
        ** Regenerate `datalists` and `inputs`  based on the metric name list
        */

        if ( this.#rootElement ) {
            console.warn('rebuild creates a 2nd input, need to rewrite logic to match main chart')
        }
        const shadow =  this.#shadow
        shadow.replaceChildren()

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
        const selectedRepoElement = document.createElement( 'select' )
        this.#selectRepoElement = selectedRepoElement
        const repoAuthorName = this.getAttribute('user-name')
        selectedRepoElement.setAttribute( 'name', 'selectedRepo' )
        selectedRepoElement.setAttribute( 'id', 'repoName' )
        rootElement.appendChild( selectedRepoElement )
        if( this.verboseLogging ) {
            console.log(`repo author name`, repoAuthorName)
        }

        shadow.appendChild( style )
        shadow.appendChild( info );
        shadow.appendChild( rootElement );

        // const targetChart = this.getAttribute( 'chart-id-list' ) // #first-chart

        const listIdsSelector = // in : 'first-chart,second-chart'
                                // out: '#first-chart,#second-chart'
            this.getAttribute( 'chart-id-list' )
                .split(',')
                .map((o) => `#${ o }`)
                .join(',')

        this.#attachedDomSelector = listIdsSelector

        if( this.verboseLogging ) {
            console.log( `🎯attach to querySelector: ${ this.#attachedDomSelector }`)
        }
        for( const curTarget of document.querySelectorAll( this.#attachedDomSelector )) {
            if( this.verboseLogging ) {
                console.log( `🎯attach to: ${ curTarget.id }`)
            }
            // this populates this.#attachedDomList
            this.attachTo( curTarget )
            selectedRepoElement.addEventListener('change', (event) => {
                if( this.verboseLogging ) {
                    console.log(`🎯attach: add change listener: ${ curTarget.id }`)
                }
                this.updateChartFromSelf( event )
            })
        }

        const newRequestURL = this.buildRequestURL()
        if ( this.#lastRequestInfo.lastRequestUrl == newRequestURL ) {
            return
        } else { console.log(`requestUrl is new`, newRequestURL) }
        this.#lastRequestInfo.lastRequestUrl = newRequestURL // better to set before or after promise ?

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
                console.debug( 'RepoNameSelector::CachedResponsePromise::ThenA', response)
                return response
            })
            .catch(
                error =>
                    console.error( 'RepoNameSelector::CachedResponsePromise::Catch', error))
            .then(
                (response) => {
                    console.debug( 'RepoNameSelector::CachedResponsePromise::ThenB rebuildAllUpdateFromResponse', response)
                    this.rebuildAllUpdateFromResponse( response )
                }
            )

        // for( const curTarget of this.#attachedDomList ) {

        // }
        return
    }
    rebuildAllUpdateFromResponse ( response ) {
        /**
         * populate <Select> element with new repo names
         * at the end of rebuildAll(), it async invokes this function with the new json data         *
         * Which comes from either the cache, else a fetch()
         *
         * @param response - json from the GitLoggerAPI endpoint
         *
         *
        **/
       const repoUrlList = response.Data
       this.repoURLList = repoUrlList
    //    const repoManual = Array.from( [ 'https://github.com/ninmonkey/notebooks' ])
        // # todo this is a web request instead.
        // const matchingRepoNames = this.repoURLList.filter( (s) => s.match( repoAuthorName ))



        repoUrlList.forEach( ( item ) => {
        // repoManual.forEach( ( item ) => {
            const option = document.createElement( 'option' )
            const shortName = item.RepoName
            const fullName = item.FullRepoUrl
            option.setAttribute( 'value', fullName )
            option.textContent = shortName
            this.#selectRepoElement.appendChild( option )
        } )
    }

}
customElements.define( 'repo-name-selector', RepoNameSelector );