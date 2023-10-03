export class AppState {
    /*
    persist session storage for the local user

    example:
        AppState.GetState().SavedRepositoryURLList
        AppState.AddRepository('Ninmonkey/notebooks')
        AppState.ResetStateDefaults()
        AppState.LogState()

    example:
        return AppState.GetState()
            {  "SavedRepositoryURLList": [
                    "StartAutomating/GitLogger",
                    "Ninmonkey/notebooks" ]
            }
    */

    static GetState() {
        /*
        returns multiple keys from local storage
        example:
            key = 'SavedRepositoryURLList'
            AppState.GetState()[ key ]
        */
        const defaultRepoUrls = ['StartAutomating/GitLogger'] // ['Ninmonkey/notebooks']
        // http://localhost:7071/Show-GitLogger
        // https://gitloggerfunction.azurewebsites.net/Show-GitLogger
        const defaultURL = `https://gitloggerfunction.azurewebsites.net/Get-GitLogger?Repository=https://github.com/StartAutomating/GitLogger&Metric=Churn&Year=2023&Month=07`
        const state = {
            "SavedRepositoryURLList":
                JSON.parse(localStorage.getItem('SavedRepositoryURLList')) ?? defaultRepoUrls,
            "MostRecentURL":
                localStorage.getItem('MostRecentURL') ?? defaultURL
        }
        return state

    }
    static LogState() {
        const state = AppState.GetState()
        const numRepos = AppState.GetState().SavedRepositoryURLList.length
        console.log(`[AppState] config loaded ${numRepos} saved RepoUrls`)
        // console.log(`AppState config = ${numRepos} saved RepoUrls:\n ${JSON.stringify(state)}`)
    }

    static SetState(config) {
        /*
        save multiple keys to local storage.
        This Repopulates any <datalist>s that are affected
        */
        console.log(`AppState => To save: ${config}`)

        // future: enforce distinctList by using properties?
        if (config.MostRecentURL) {
            localStorage.setItem(
                'MostRecentURL',
                config.MostRecentURL)
        }
        if (config.SavedRepositoryURLList) {

            // I wanted to preserve case with insensitive compare, I didn't see a ctor arg, just .has
            const repoURLLowerCase = config.SavedRepositoryURLList.map(
                item => item.toLowerCase())

            const distinctURLList = Array.from(
                [...new Set(repoURLLowerCase)]).sort()

            localStorage.setItem(
                'SavedRepositoryURLList',
                JSON.stringify(distinctURLList))

            AppState.RegenerateRepositoryDatalist()
        }
        AppState.LogState()
    }
    static ResetStateDefaults() {
        /*
        Reset client state to default values / clear cache
        This Repopulates any <datalist>s that are affected
        */
        // const defaultLastURL = 'https://gitloggerfunction.azurewebsites.net/Show-GitLogger?Repository=https://github.com/StartAutomating/GitLogger&Metric=CommitsByLanguage&Year=2023&Month=07'
        const baseURL = 'https://gitloggerfunction.azurewebsites.net'
        const queryPath = `Show-GitLogger`
        const queryStr = `Repository=https://github.com/StartAutomating/GitLogger&Metric=CommitsByLanguage&Year=2023&Month=07`
        const defaultLastURL = `${baseURL}/${queryPath}?${queryStr}` // cleanup: refactor url using search params


        console.log('AppState => clearing localStorage')
        localStorage.removeItem('SavedRepositoryURLList')
        localStorage.setItem('MostRecentURL', defaultLastURL)
        AppState.LogState()
        AppState.RegenerateRepositoryDatalist()
    }

    static AddRepository(repositoryURL) {
        /*
        Sanitize repo url and save it for the future
        This Repopulates any <datalist>s that are affected
        */
        console.log(`AppState.AddRepository => url = "${repositoryURL}"`)
        // saves known repos to localstorage
        const state = AppState.GetState()
        state.SavedRepositoryURLList.push(repositoryURL)
        state.SavedRepositoryURLList.forEach(item => item.toLowerCase())
        AppState.SetState(state)
        AppState.RegenerateRepositoryDatalist()
    }
    static RemoveRepository(repositoryURL) {
        /*
        Sanitize repo url and remove if it already exists
        This Repopulates any <datalist>s that are affected
        */
        let repositoryURLLowerCase = repositoryURL.toLowerCase()
        console.log(`AppState.RemoveRepository => url = "${repositoryURLLowerCase}"`)

        const state = AppState.GetState()
        const index = state.SavedRepositoryURLList.indexOf(repositoryURLLowerCase);
        if (index > -1) {
            state.SavedRepositoryURLList.splice(index, 1);
        }

        AppState.SetState(state)
        AppState.RegenerateRepositoryDatalist()
        return
    }

    static RegenerateMetricDatalist() {
        /*
       (re-)generate datalists used by forms from a distinct list
       and (re-)generate nav list, with a delete button
       */
        // console.info('AppState => Generate Metric name Datalist: Cached')
        return // no longer used
    }
    static RegenerateRepositoryDatalist() {
        /*
        (re-)generate datalists used by forms from a distinct list
        and (re-)generate nav list, with a delete button
        */

        AppState.RegenerateMetricDatalist()

        console.info('AppState => Generate Datalist: SavedRepositoryURLList')
        const names = AppState.GetState().SavedRepositoryURLList
        const distinctNames = [...new Set(names)] // ideally it would be a case-insensitive compare

        const $RepositoryURLChoice = document.getElementById('RepositoryURLChoice')
        // would need: shadow.getElementById('RepositoryURLChoice')
        // $("#mainContent div").shadowRoot
        const $SavedRepositoryURLList = document.getElementById('SavedRepositoryURLList')

        $SavedRepositoryURLList.replaceChildren()
        distinctNames.forEach(name => {
            const elem_option = document.createElement('option')
            elem_option.value = name

            console.log(`adding: ${name}`)
            $SavedRepositoryURLList.appendChild(elem_option)
        })

        const $SavedRepoNameNavList = document.getElementById('SavedRepoNameNavList')
        $SavedRepoNameNavList.replaceChildren()

        if (AppState.GetState()?.MostRecentURL) {
            const elem_li = document.createElement('li')
            const elem_a = document.createElement('a')
            const mostRecentURL = AppState.GetState().MostRecentURL
            elem_a.href = mostRecentURL
            elem_a.textContent = `Most Recent`
            elem_li.appendChild(elem_a)
            $SavedRepoNameNavList.appendChild(elem_li)
        }

        distinctNames.forEach(name => {
            // (re-)generate nav list, with a delete button
            // http://localhost:7071/Show-GitLogger?Repository=https://github.com/StartAutomating/GitLogger&Metric=Churn&Year=2023&Month=07&GraphType=bar
            const url_base_local = 'http://localhost:7071'
            const url_base = 'https://gitloggerfunction.azurewebsites.net'
            const url_template = {
                churn: `${url_base}/Show-GitLogger?Repository=https://github.com/${name}&Metric=Churn&Year=2023&Month=07`,
                busyMonth: `${url_base}/Show-GitLogger?Repository=https://github.com/${name}&Metric=BusyMonth&Year=2023`
            }
            const elem_li = document.createElement('li')
            const elem_a = document.createElement('a')
            elem_a.href = url_template.churn
            elem_a.textContent = name

            elem_li.appendChild(elem_a)
            const elem_a_delete = document.createElement('a')
            elem_a_delete.href = '#'
            elem_a_delete.textContent = ' x'
            elem_a_delete.addEventListener('click', (event) => {
                console.log('nav bar delete clicked')
                AppState.RemoveRepository(name)
            })
            // }, false)
            elem_li.appendChild(elem_a_delete)

            $SavedRepoNameNavList.appendChild(elem_li)
        })

        AppState.LogState()
    }
}

export function AddRepo() {
    // this is the oldest function, could use a pass
    if (typeof (Storage) == "undefined") {
        throw "Cannot save themes without HTML5 Local Storage"
    }
    let addRepoHasError = false

    // prefix url if not already prefixed by github
    const $RepositoryURLChoice = document.getElementById('RepositoryURLChoice')
    const $SavedRepositoryURLList = document.getElementById('SavedRepositoryURLList')
    let repoUrl = $RepositoryURLChoice.value
    if (!repoUrl.toLowerCase().startsWith('https://github.com')) {
        repoUrl = `https://github.com/${repoUrl}`
    }
    if (!repoUrl) return
    const metricName = document.getElementById("MetricName").value
    const $metricFrame = document.getElementById("MetricFrame");

    // let url_requestGetLogger = `https://gitloggerfunction.azurewebsites.net/Get-GitLogger?Repository=${repoUrl}&Metric=${metricName}`
    // let url_requestShowLogger = `https://gitloggerfunction.azurewebsites.net/Show-GitLogger?Repository=${repoUrl}&Metric=${metricName}`
    // let serverRoot = `https://gitloggerfunction.azurewebsites.net`
    let serverRoot
    if (false || window.location.host.indexOf('localhost') >= 0) {
        serverRoot = `https://localhost:7071`
    }
    else {
        serverRoot = `https://gitloggerfunction.azurewebsites.net/`

    }
    let url_requestShowLogger = `${serverRoot}/Show-GitLogger?Repository=${repoUrl}&Metric=${metricName}`
    // let url_requestGetLogger = `${serverRoot}/Get-GitLogger?Repository=${repoUrl}&Metric=${metricName}`

    const MostRecentURL = // never localhost
        `https://gitloggerfunction.azurewebsites.net/Show-GitLogger?Repository=${repoUrl}&Metric=${metricName}`

    AppState.SetState({
        MostRecentURL: MostRecentURL
    })

    const $MonthParam = document.getElementById('MonthParam')
    let [year, month] = $MonthParam.value.split('-')
    // simplify append using query string function?

    if (year) {
        url_requestShowLogger = `${url_requestShowLogger}&Year=${year}`
    }
    if (month) {
        url_requestShowLogger = `${url_requestShowLogger}&Month=${month}`
    }

    /*
    test response on a /api/Get-GitLogger API call.
    if valid, then the iframe invokes /api/Show-GitLogger API call

    Future: Should either cache or convert json payload.
    otherwise this calls 2x for one "event".
    the same arguments to /api/GetGit{star}/ and / api / ShowGit{star} */

    $metricFrame.classList.remove('collapsed')
    $metricFrame.src = url_requestShowLogger;
    console.log(`request: ${url_requestShowLogger}`)

    if (!addRepoHasError) { // future: test whether it failed
        console.log(`saving added repo: ${$RepositoryURLChoice.value}`)
        AppState.AddRepository(RepositoryURLChoice.value)
        AppState.LogState()
    }

    // // const fetchPromise = fetch(url_requestGetLogger);
    // const fetchPromise = fetch(url_requestShowLogger);
    // fetchPromise.then(
    //     response => {
    //         if (!response.ok) {
    //             throw new Error(`Error: ${response.status} ${response.statusText}`);
    //         }
    //         console.log(response.body)

    //         $metricFrame.innerHTML = response.body.toString();
    //         //  = url_requestShowLogger;
    //     }).catch(
    //         error => {
    //             $metricFrame.src = "/index"; // "/MyRepos"; // index.html"; // or some error page
    //             $metricFrame.src = "/index"; // "/MyRepos"; // index.html"; // or some error page
    //             console.error(error);
    //         })

}