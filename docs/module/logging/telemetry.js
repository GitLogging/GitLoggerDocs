export class TelemetryStats {
    /**
     * @description super minimal metrics on when caches are being hit or not
     *
     * future: log datetimes or durations for for performance / timing
     *  of requests
     */
    // totalRequestCount = 0
    static cacheHitCount = 0
    static cacheMissCount = 0
    static verboseLogging = true
    static config = {
        LogCacheHit: false,
        LogCacheMiss: true,
    }
    static lastResetDatetime = new Date()

    get totalRequestCount() {
        return TelemetryStats.cacheHitCount + TelemetryStats.cacheMissCount
    }
    static resetStats() {
        if(this.verboseLogging) {
            console.log(`[TelemetryStats] resetStats()`)
        }
        TelemetryStats.lastResetDatetime = new Date()
        TelemetryStats.cacheHitCount  = 0
        TelemetryStats.cacheMissCount = 0
    }

    static logCacheHitRequest() {
        TelemetryStats.cacheHitCount++
        if( this.verboseLogging && this.config.LogCacheHit ) {
            console.log(`[TelemetryStats] cache hit: 🟢 ${ TelemetryStats.cacheHitCount }`)

        }
    }
    static logCacheMissRequest() {
        TelemetryStats.cacheMissCount++
        if( this.verboseLogging && this.config.LogCacheMiss ) {
            console.log(`[TelemetryStats] cache miss: 🟡 ${ TelemetryStats.cacheMissCount }`)
        }
    }
    static getModel() {
        return {
            cacheHitCount: TelemetryStats.cacheHitCount,
            cacheMissCount: TelemetryStats.cacheMissCount,
            lastResetDatetime: TelemetryStats.lastResetDatetime,
        }
    }
}