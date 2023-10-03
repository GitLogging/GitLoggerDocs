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

    get totalRequestCount() {
        return TelemetryStats.cacheHitCount + TelemetryStats.cacheMissCount
    }
    static resetStats() {
        TelemetryStats.cacheHitCount = 0
        TelemetryStats.cacheMissCount = 0
    }

    static logCacheHitRequest() {
        TelemetryStats.cacheHitCount++
    }
    static logCacheMissRequest() {
        TelemetryStats.cacheMissCount++
    }
    static getModel() {
        return {
            cacheHitCount: TelemetryStats.cacheHitCount,
            cacheMissCount: TelemetryStats.cacheMissCount
        }
    }
}