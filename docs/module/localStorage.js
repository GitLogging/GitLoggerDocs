export function forEachKey(callback) {
        /**
         * @description iterates over all keys in the cache, including not-owned-keys, and calls the callback
         * @example CachedAPI.forEachKey( (k) => console.log( k ) )
         * @example CachedAPI.forEachOwnedKey( (k) => console.log(k) )
         * @example CachedAPI.forEachOwnedRecord( (item) => console.log( `${ item.url } = ${ item.data }` ))
         */
        for (let i = 0; i < localStorage.length; i++) {
            callback( localStorage.key(i) )
        }
    }
export function forEachRecord(callback) {
        /**
         * @description sugar for enumerating .entries of all keys
         * @example CachedAPI.forEachKey( (k) => console.log( k ) )
         * @example CachedAPI.forEachOwnedKey( (k) => console.log(k) )
         * @example CachedAPI.forEachOwnedRecord( (item) => console.log( `${ item.url } = ${ item.data }` ))
         */
        // for( const [key, value] of Object.entries( localStorage ) ) {
        for( const record of Object.entries( localStorage ) ) {
            callback( record )
        }
    }
