import { distinctList } from "./utils.js";
import { TelemetryStats } from "./logging/telemetry.js"

export class CachedAPI {
    /**
     * @description case-insensitive key-value store, where the key is the requested API URL
     * minimal wraper that caches API requests
     * @member {boolean} verboseLogging - toggles some extra logging
     */
    verboseLogging = true;
    static CacheKeyName = "SavedRepositoryURLList";
    static resetCache( options ) {
        for (const item of CachedAPI.getCachedURLSet()) {
            if (this.verboseLogging ) { console.log(`delete url: item`) }
            CachedAPI.deleteCachedURL( item )
        }
        localStorage.removeItem("SavedRepositoryURLList");
        console.log("clearing cache [SavedRepositoryURLList]");

        // optionally remove other app keys
        if( options?.clearAll ) {
            console.log(`deleting all localStorage keys, including non-CacheAPI resources....`)
            localStorage.clear()

        }
    }
    static forEachKey(callback) {
        /**
         * @description iterates over all keys in the cache, including not-owned-keys, and calls the callback
         * @example CachedAPI.forEachKey( (k) => console.log( k ) )
         * @example CachedAPI.forEachOwnedKey( (k) => console.log(k) )
         * @example CachedAPI.forEachOwnedRecord( (item) => console.log( `${ item.url } = ${ item.data }` ))
         */
        for (let i = 0; i < localStorage.length; i++) {
            callback(localStorage.key(i));
        }
    }
    static forEachOwnedKey(callback) {
        /**
         * @description iterates only owned keys
         * @example CachedAPI.forEachKey( (k) => console.log( k ) )
         * @example CachedAPI.forEachOwnedKey( (k) => console.log(k) )
         * @example CachedAPI.forEachOwnedRecord( (item) => console.log( `${ item.url } = ${ item.data }` ))
         */
        const myKeys = CachedAPI.getCachedURLSet()
        for (const url of myKeys) {
            callback( localStorage.getItem( url ))
        }
    }
    static forEachOwnedRecord(callback) {
        /**
         * @description iterates only owned records
         * @example CachedAPI.forEachKey( (k) => console.log( k ) )
         * @example CachedAPI.forEachOwnedKey( (k) => console.log(k) )
         * @example CachedAPI.forEachOwnedRecord( (item) => console.log( `${ item.url } = ${ item.data }` ))
         */
        const myKeys = CachedAPI.getCachedURLSet()
        for (const url of myKeys) {
            callback({
                url: url,
                data: localStorage.getItem( url )
            })
        }
    }

    static requestURL(url) {
        /**
         * @description requests data from a url, cached to localstorage as json
         * @returns {text} - returns the unparsed string, without JSON.parse
         * future: make error handling more flexible, or automatic for the invoker
         **/

        const urlList = CachedAPI.getCachedURLSet();
        const isCached = urlList.has(url);
        if (isCached) {
            // CachedAPI.getCachedURLList().has(url)
            TelemetryStats.logCacheHitRequest()
            if (this.verboseLogging) { console.log(`CachedAPI::🌎Fetch 🟢 cached:  ${url}`); }
            return localStorage.getItem(url);
        }else {
            TelemetryStats.logCacheMissRequest()
        }
        if (this.verboseLogging) { console.log(`CachedAPI::🌎Fetch 🟡 not cached: ${url}`); }
        let finalResponse = fetch(url)
            .then((response) => {
                if (!response.ok) { throw new Error(`HTTP error: ${response.status}`); }
                return response.json();
            })
            .then((json) => {
                if (this.verboseLogging) { console.log(`CachedAPI::🌎Fetch 🟢 okay: ${url}`); }
                CachedAPI.saveRequest(url, json);
                // maybe without return, just set?
                return json;
            });

        // description saves a request to the cache. does not cache results that are empty arrays
        // delete url key when that is true
        // if promise was okay, save
        // CachedAPI.saveRequest( url, response )

        return finalResponse;
    }
    static saveRequest(url, data) {
        /**
         * @description saves a request to the cache. does not cache results that are empty arrays
         * currently: if the API throws an exception, it should bubble up to the caller
         * or at least the request should skip caching
         */
        const json = JSON.stringify(data);
        if (data.length == 0) {
            console.warn(`🟠 response had length == 0, url:  ${url}`);
            // it might not be an error. maybe test http content length itself is 0
            // caching empty responses could cause issues, but, not caching would also have other issues. don't cache empty responses for now
            // throw new Error( `HTTP error: ${ response.status }` )
            return data
        }
        if (data.length >= 1) {
            localStorage.setItem(url, json);
            CachedAPI.addCachedURLList(url);

            if (this.verboseLogging) {
                // console.log(`CachedAPI::🌎Fetch 🟠 >= 1? ${data.length >= 1} wrote cache: ${url}`);
            }
        } else {
            console.warn(`🔴 response was empty ${url}`);
        }
    }
    static addCachedURLList(url) {
        /**
         * @description adds a url to the list of cached urls
         * @param {string} url - url of the api request
         */
        let current = CachedAPI.getCachedURLSet();
        current.add(url).forEach((a) => a.toString().toLowerCase());
        const uniques = distinctList(current) || [current];
        // current = current.map( ( e ) => e.toLowerCase() )
        // current.map(.map(
        //         item => item.toLowerCase()))
        // Array.from(s).map((m) => m.toString().toLowerCase() )

        // const uniques = Array.from( [ ...new Set( current ) ] )

        //     .forEach(
        //         ( a ) => a.toString().toLowerCase()
        //     ).sort()

        localStorage.setItem(CachedAPI.CacheKeyName, JSON.stringify(uniques));
    }

    static deleteCachedURL(url) {
        /**
         * @description removes a url from the list of cached urls, and removes cached response
         * @param {string} url - key to be removed
         */
        localStorage.removeItem(url);
        const currentUrls = Array.from(CachedAPI.getCachedURLSet())
            .filter( (item) =>
                item.toLowerCase() !== url.toLowerCase() )

        localStorage.setItem(CachedAPI.CacheKeyName, JSON.stringify(currentUrls ?? []));
    }
    static getCachedURLList() {
        /**
         * @description returns a list of cached urls, convienence method
         * @returns {Array} - the list of cached urls
         */
        return Array.from( CachedAPI.getCachedURLSet() )
    }
    static getCachedURLSet() {
        /**
         * @description returns a set of cached urls
            get list of known valid keys
            not optimized, no try blocks to see which error types may throw
         * @returns {Set} - the set of cached urls
         **/

        const savedRepoList = JSON.parse(localStorage.getItem(CachedAPI.CacheKeyName)) ?? []
        const cachedURLlist = new Set(savedRepoList)
        const distinctURL = Array.from([...cachedURLlist]).sort()
        return new Set(distinctURL)
    }
}
