
export class DateConversion {
    #dateTime = null
    #culture = new Intl.DateTimeFormat('en-us')
    #defaultCultureName  = 'en-us'

    // member datetime



    // constructor takes date or string
    // constructor () {
    //     this.#dateTime = null
    // }
    constructor ( referenceObject ) {
        /**
         * @description converts to a standard internal datetime based on the original datetime
         * @returns DateConversion
         * @summary pass a string, or Date instance, or <selectElement> instance
         *
         * supported types:
         * - [x] Date() instance
         * - [ ] monthYearString
         * - [ ] ISO string
         * - [x] property pairs: <year>, [ month ], [ day ]
         * - [ ] property yearMonth: <year>, <month>
         * - [ ] customElement: <year-month-selector>
         * - [ ] customElement: <date-selector>
         * - [ ] element <input> type == month
         * - [ ] https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week
         * - [ ] https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month
         * - [ ] https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date
         * - [ ] https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local
         * - [ ] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
         *
         */
        const obj = referenceObject
        this.#dateTime = null
        if( obj === undefined || obj === null) {
            throw new Error( `InvalidObjectValue: 'obj' was null or undefined` )
        }
        if( obj instanceof Date) {
            this.#dateTime = obj
            return
        }

        if( obj.year && obj.month ) {
            const params = {
                year: obj.year,
                month: obj.month,
                day: obj.day ?? 1
            }
            const newDt = new Date( params.year, params.month - 1, params.day - 1 )
            this.#dateTime = newDt
            return
            // Date()
        }
        // throw exception could not coerce type
        throw new Error( `InvalidObjectValue: Could not coerce type 'obj' into an expected type. From: ${
                obj
            }` )

    }
    dateTimeFormat( options ) {

    }

    get Year() {
        // returns: "2005"
        return this.#dateTime.getFullYear()
    }
    get Month() {
        // january returns 1
        return this.#dateTime.getMonth() + 1
    }
    get Day() {
        return this.#dateTime.getDay()
    }
    asDate() {
        return this.#dateTime
    }
    formatToParts( options ) {
        const cultDefaults = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        options = {
            ...cultDefaults,
            ...options
        }
        const cult = new Intl.DateTimeFormat( this.#defaultCultureName, options  )
        return cult.formatToParts( this.#dateTime)
    }
    static fromDateTime( referenceObject ) {
        return new DateConversion( referenceObject )
    }

    // function AsDateTime
    // constructor ( baseObject ) {

    //     this.date = new Date( date )
    // }

    // static function fromDateTimeObject {

    // }

    // returns date as string

}