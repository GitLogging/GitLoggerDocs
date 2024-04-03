export const localhost = {
    domain: "http://localhost",
    // relativePath: "/api",
    relativePath: null,
    port: 9099 // 3000
}
export const live = {
    domain: "https://gitloggerfunction.azurewebsites.net",
    relativePath: null,
    port: null

}
export function getServerConfig( name = 'live' ) {
    /*
    example values:
        > getServerConfig('live').urlPrefix
            'https://gitloggerfunction.azurewebsites.net'

        > getServerConfig().urlPrefix
            'http://localhost:9099/api'
    */
    const finalConfig = name == 'localhost' ? localhost : live
    finalConfig.urlPrefix  = finalConfig.domain
    finalConfig.urlPrefix += finalConfig.port ? `:${ finalConfig.port }` : ``
    finalConfig.urlPrefix += finalConfig.relativePath ? finalConfig.relativePath : ``
    return finalConfig
}
