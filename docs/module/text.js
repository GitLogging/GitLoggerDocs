
export function iterateCodepoints ( text ) {
    /**
     * @description iterate over the codepoints in a string
     * @param {string} text - the string to iterate over
     * @returns {array} - an array of codepoints
     * @example iterateCodepoints( 'abc' ) // [ 'a', 'b', 'c' ]
     * @example iterateCodepoints( '👍' ) // [ '👍' ]
     */
    return [ ...text ]
}

export function codepointsAsHexString ( text ) {
    /**
     * @description returns an array of codepoints as hex strings
     * @param {string} string - the string to iterate over
     * @returns {array} - an array of codepoints as hex strings
     * @example codepointsAsHexString( 'abc' ) // [ '61', '62', '63' ]
     * @example codepointsAsHexString( '👍' ) // [ '1f44d' ]
     */
    return [ ...text ].map( ( c ) => c.codePointAt( 0 ).toString( 16 ) )
}

export const NamedCodepoints = {
    CarriageReturn      : '\u000d',   // \r
    CarriageReturnSymbol: '\u240d',   // ␍
    EmptySet            : '\u2205',   // ∅
    Newline             : '\u000a',   // \n
    NewlineSymbol       : '\u2424',   // ␤
    NullString          : '\u0000',   // \0
    NullSymbol          : '\u2400',   // ␀
    SpaceSymbol         : '\u2420',   // ␠
    ZWJ                 : '\u200d',   // ‍ZWJ
}