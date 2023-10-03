import { distinctList } from "../utils.js"
import { gitLoggerMetrics, gitLoggerMetricNames } from '../config/constants.js'
export class RepoNameSelector extends HTMLElement {
    /*
      Element supports the following properties:

        chart-id: is the `id` of the `GitLoggerChartElement` instance to attach to
        metric: the value of the inner select element

    example:
        <metric-name-selector chart-id="first-chart" label-text="MetricName"></metric-name-selector>
        <div id="first-chart" no-ui="true" debugInfo="true" debug-css="true" chartType="bar" maxHeight="400px" is="gitlogger-chart" repo="https://github.com/StartAutomating/GitLogger" metric="CommitCount"
            Year="2023" Month="04" class="gitLoggerChartRootElement" max-width="300px">
        </div>
    */
    #rootElement // topmost div under shadow,below style tag
    #selectElement
    #shadow // the shadowRoot node
    #attachedDom // attached to a [GitLoggerChartElement] element, else null
    //cached names
    repoNames = distinctList([
        'GitLogger',
        'PipeScript',
        'ugit',
        'ExcelAnt',
        'Posh',
        'dotfiles_git',
    ])
    verboseLogging = true
    constructor() {
        super();
        const shadow = this.attachShadow( { mode: 'open' } );
        this.#shadow = shadow
        this.rebuildAll()
    }
    static get observedAttributes () {
        return [ // todo: run a pass, to see which may no longer be used
            'metric',
        ];
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
        if ( name == 'metric' ) {
            this.#selectElement.value = newValue
        }
    }
    attachTo ( targetChart ) {
        /*
        ** Attach to [GitLoggerChartElement] element, else null
        and update to name to the existing chart's value
        */
        this.#attachedDom = targetChart
        const existingValue = targetChart.getQueryModel().repoShort ?? 'GitLogger'
        this.#selectElement.value = existingValue
    }
    rebuildAll () {
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
        this.repoNames.forEach( ( item ) => {
            const option = document.createElement( 'option' )
            option.setAttribute( 'value', item )
            option.textContent = item
            selectedRepo.appendChild( option )
        } )
        this.#selectElement = selectedRepo

        shadow.appendChild( style )
        shadow.appendChild( info );
        shadow.appendChild( rootElem6ent );

        const targetChart = this.getAttribute( 'chart-id' ) // #first-chart
        const otherChart = document.querySelector( `#${ targetChart }` )
        this.attachTo( otherChart )
        selectedRepo.addEventListener( 'change', ( event ) => {
            console.log( event )
            if ( !this.#attachedDom ) {
                console.log( `Control is not attached to a chart! Source: ${ event }` )
            }
            const otherChart = this.#attachedDom
            // const newMetric = event.target.value // or this.#selectElement.value
            // otherChart.setAttribute( 'metric', newMetric )
            // otherChart.rebuildAll()
        } )

    }
}
customElements.define( 'repo-name-selector', RepoNameSelector );