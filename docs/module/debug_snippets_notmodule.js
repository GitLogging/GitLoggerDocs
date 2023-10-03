// import { byId, nq, nqa }  from './snippets'

// window.byId = byId
// window.nq = nq
// window.nqa = nqa
// window.ninStuff = function () {
//     console.log('ninStuff')
// }
function nq( selector ) {
    /*
    sugar for using the debug console
    */
    return document.querySelector('.gitLoggerChartRootElement').shadowRoot.querySelector( selector ) }
function nqa( selector ) {
    /*
    sugar for using the debug console

    example:
        nq('input')
        nqa('input')
    */
    return document.querySelector('.gitLoggerChartRootElement').shadowRoot.querySelectorAll( selector ) }
function byId ( id ) {
    console.log('id', id)

    // if( ! id.startsWith( '#' ) ) {
    //     id  = `#${ id }`
    // }
    return document.getElementById( id )
}
