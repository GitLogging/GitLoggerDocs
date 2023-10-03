
export function throttle ( callback, delayMs = 1000 ) {
    /**
     * @description basic throttle function, fire at most X times per delayMs
     * @param {function} callback - the function to throttle
     * @returns {function} - result of the throttled function
     **/
    let shouldWait = false
    return ( ...args ) => {
        if ( shouldWait ) return
        callback( ...args )
        shouldWait = true
        setTimeout( () => {
            shouldWait = false
        }, delayMs )
    }
}

export function debounce ( callback, delayMs = 1000 ) {
    /**
     * @description basic debounce function, fire at the end of delayMs
     * @param {function} - callback - the function to debounce
     * @returns {function} - result of the debounced function
     */
    let timeout
    return ( ...args ) => {
        clearTimeout( timeout )
        timeout = setTimeout( () => {
            callback( ...args )
        }, delayMs )
    }
}
export function distinctList ( object ) {
    /**
     * @description returns a sorted array of distinct values from an enumerable
     * @param {object} object - an enumerable object
     * @returns {array} - a sorted array of distinct values from the enumerable
     *
     */
    // returns a new array of distinct values from an enumerable
    const items = Array.from( object ).sort()
    return [ ...new Set( items ) ]
}
export function inspectType ( object ) {
    /*
    all_dom = document.querySelectorAll('*')
    Array.from(all_dom).map( (e) => e.__proto__.constructor.name )
    */
    let info = {
        Type: typeof object,
        Ctor: object.__proto__.constructor.name ?? "missing"
    }
    return info
}
export function dropBlankProperties ( target, options ) {
    /**
     * @description returns a new object with blank properties removed
     * @param {object} target - the object to remove blank properties from
     * @param {object} options - optional param options, which can toggle states for: `dropEmpty` | `dropNull` | `dropWhitespace` | `dropControlChars`
     * @returns {object} - a new object with blank properties removed
     * @example dropBlankProperties( {a:1, b:2, c:3, d:null, e:""} ) // {a:1, b:2, c:3}
    */
    const config = {
        dropEmpty: true,
        dropNull: true,
        dropWhitespace: false,
        dropControlChars: false,
        ...options,
    }
    const anyNonWhitespace_re = /\S+/
    if ( config.dropControlChars ) { throw 'nyi: find the correct regex group, or text clean' }

    // Object.fromEntries(Object.entries(target).filter((e) => e[1] !== null))
    return Object.fromEntries(
        Object.entries( target ).filter(
            ( pair ) => {
                let [key, value] = pair
                let shouldSkip = false
                // const key = pair[ 0 ]
                // const value = pair[ 1 ]
                if ( config.dropEmpty && value === "" ) {
                    return false
                }
                if ( config.dropNull && value === null ) {
                    return false
                }
                if ( config.dropNull && value === undefined ) {
                    return false
                }
                if ( config.dropWhitespace && ( !value.toString().match( anyNonWhitespace_re ) ) ) {
                    return false
                }
                return true
            }
        )
    )
}

export function randomInt ( min, max ) {
    /**
     * @description returns a random integer in the set: [min, max)
     * The maximum is exclusive and the minimum is inclusive
     * @param {number} min - the minimum value, inclusive
     * @param {number} max - the maximum value, exclusive
     */
    min = Math.ceil( min );
    max = Math.floor( max );
    return Math.floor( Math.random() * ( max - min ) + min );
}

export function newArrayIntList ( count ) {
    /**
     * @description returns an array from the range: [0, count) , max exclusive
     * @param {number} count - the maximum value, exclusive
     * @returns {array} - an array of integers from the range: [0, count)
     * @example newArrayIntList(3) // # output: [0, 1, 2 ]
     * @example newArrayRange( 0, count - 1, 1) // # output: [0, 1, 2]
     **/
    return Array.from( { length: count }, ( value, index ) => index );
}
export function newArrayRange ( start, stop, step = 1 ) {
    /**
     * @description returns an array from the range: [start, stop] with step size, max is inclusive
     * @param {number} start - the minimum value, inclusive
     * @param {number} stop - the maximum value, inclusive
     * @param {number} step - the step size, default is 1
     * @returns {array} - an array of integers from the range: [start, stop]
     * @example newArrayRange(0, 3, 1) // [ 0, 1, 2, 3 ]
     * @example newArrayRange(4,13, 3) // [ 4, 7, 10, 13 ]
     **/
    return Array.from(
        { length: ( stop - start ) / step + 1 },
        ( value, index ) =>
            start + index * step )
}
export function randomItem ( list ) {
    /**
     * @description returns a random item from a list
     * @param {array} list - the list to select from
     * @returns {any} - a random item from the list
     * @example all_dom = document.querySelectorAll('*'); randomItem( all_dom )
    */
    const i = randomInt( 0, list.length )
    return list[ i ]
}

export function renderJsonAsPre ( target ) {
    /**
     * @description renders json using whitespace, and inside a<pre> element
     * @param {object} target - the object to render, it is converted to JSON
     * @returns {string} - string that contains HTML generated to render json with whitespace
     */
    const contents = JSON.stringify( target, null, 4 ) // .replaceAll('\n', "<br/>" )
    return `<pre style='text-wrap:unset'>${ contents }</pre>`
}

export function printStyle ( elementStyle ) {
    /**
     * @description prints style info of element, or declaration,
     * @param {object} elementStyle - an element that contains {CSSStyleDeclaration}, or a {CSSStyleDeclaration}
     * @returns {void} - prints to console
     */

    let actualStyle = elementStyle
    if ( !( elementStyle instanceof CSSStyleDeclaration ) ) {
        actualStyle = elementStyle.style
    }
    if ( !( actualStyle instanceof CSSStyleDeclaration ) ) {
        console.error( `neither of the values elementStyle or elementStyle.style were a CSSStyleDeclaration!` )
    }

    const all_keys = Array.from( actualStyle )
    const all_values = all_keys.map( ( m ) => actualStyle.getPropertyValue( m ) )

    let summary = {}
    all_keys.map( ( m ) =>
        summary[ m ] = actualStyle.getPropertyValue( m ) )
    console.log( JSON.stringify( summary ) )
}

