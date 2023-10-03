import { distinctList } from "../utils.js"

export class FieldDetails extends HTMLElement {
    /*
      Element supports the following properties:

        target-id: is the `id` of the instance to attach to

    example:

    */
    #rootElement // topmost div under shadow,below style tag
    #shadow // the shadowRoot node
    #attachedDom // attached to a [GitLoggerChartElement] element, else null
    constructor() {
        super();
        const shadow = this.attachShadow( { mode: 'open' } );
        this.#shadow = shadow
        this.rebuildAll()
    }
    attachTo ( targetChart ) {
        /*
        ** Attach to [GitLoggerChartElement] element, else null
        */
        this.#attachedDom = targetChart
    }
    rebuildAll () {
        /*
        ** Regenerate `datalists` and `inputs`  based on the metric name list
        */
        const shadow = this.#shadow
        const rootElement = document.createElement( 'div' );
        rootElement.setAttribute( 'class', 'metricNameSelectorRoot' );
        this.#rootElement = rootElement

        const text = this.getAttribute( 'label-text' );
        const info = document.createElement( 'span' );
        info.textContent = text;

        const style = document.createElement( 'style' );
        style.textContent = `
        .metricNameSelectorRoot.enableDebug {
            border: 2px solid #a2a2a250;
        }
        `
        const selectedMetric = document.createElement( 'select' )
        selectedMetric.setAttribute( 'name', 'SelectedMetric' )
        selectedMetric.setAttribute( 'id', 'MetricName' )
        rootElement.appendChild( selectedMetric )
        this.#metricNames.forEach( ( item ) => {
            const option = document.createElement( 'option' )
            option.setAttribute( 'value', item )
            option.textContent = item
            selectedMetric.appendChild( option )
        } )
        this.#selectElement = selectedMetric

        shadow.appendChild( style )
        shadow.appendChild( info );
        shadow.appendChild( rootElement );

        const targetChart = this.getAttribute( 'chart-id' ) // #first-chart
        const otherChart = document.querySelector( `#${ targetChart }` )
        this.attachTo( otherChart )
        selectedMetric.addEventListener( 'change', ( event ) => {
            return
            console.log( event )
            if ( !this.#attachedDom ) {
                console.log( `Control is not attached to a chart! Source: ${ event }` )
            }
            console.log( 'attachedTo', this.#attachedDom )

            //
            // const chart1 = document.querySelector( '#chart-one' )
            // chart1.setAttribute( 'metric', 'CommitCadence' )
            // chart1.rebuildAll()

            const targetChartName = this.getAttribute( 'chart-id' ) // #first-chart
            const otherChart = document.querySelector( `#${ targetChartName }` )
            const newMetric = event.target.value
            console.log( 'event.value', event.target.value )
            // console.log( 'this.value', this.nodeValue )
            console.log( 'private value', this.#selectElement.value )

            otherChart.setAttribute( 'metric', event.target.value )
            otherChart.rebuildAll()

            return
            this.#attachedDom.setAttribute( 'Metric', event.value )
            this.#attachedDom.rebuildAll() // future: chart itself will auto-call rebuild on attribute changes
            // this.#attachedDom.setAttribute( 'Metric', event.target.value )
            // document.querySelector('#first-chart').getAttribute('Metric')
        } )

    }
}
customElements.define( 'field-details', FieldDetails );