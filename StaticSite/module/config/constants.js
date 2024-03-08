/*
currently hardcoded, from: //docs/_data/GitLoggerMetrics.json
to be an actual api endpoint for discoverability
*/
import { distinctList } from "./../utils.js"

export const gitRepositoryDefaultURLs = [
    'https://github.com/StartAutomating/GitLogger',
    'https://github.com/StartAutomating/PipeScript',
    'https://github.com/ninmonkey/notebooks',
    'https://github.com/StartAutomating/EZOut',
]
export const gitLoggerMetrics = [
    {
        name: "AttachRate",
        synopsis: "Attach Rate by User",
        description: "Gets the percentage of commit messages that reference an issue number or pull request."
    },
    {
        name: "BusyDayOfWeek",
        synopsis: "Busy Day Of Week",
        description: "Shows total lines changed by day of week."
    },
    {
        name: "BusyMonth",
        synopsis: "Busy Month",
        description: "Shows total lines changed by month of year."
    },
    {
        name: "Churn",
        synopsis: "Average number of files in a commit",
        description: "Gets the average number of files in a commit by a contributer"
    },
    {
        name: "CommitCadence",
        synopsis: "Commit Cadence",
        description: "Gets the total Commits per contributor and divides by their active timeframe."
    },
    {
        name: "CommitsByLanguage",
        synopsis: "Commits By Language",
        description: "Total commits grouped by language used"
    },
    {
        name: "CommitCount",
        synopsis: "Commit Counts",
        description: "Gets the number of commits by each contributor."
    },
    {
        name: "CommitRepeats",
        synopsis: "Commit Repeats",
        description: "Total Repeated Commit Messages by User"
    },
    {
        name: "IssueBreadth",
        synopsis: "Issue Breadth",
        description: "Gets the distinct number of issues mentioned in commits by user."
    },
    {
        name: "LineCadence",
        synopsis: "Line Cadence",
        description: "The total number of lines changed per user, divided by the time between commits."
    },
    {
        name: "LinesChanged",
        synopsis: "Lines Changed",
        description: "Lines Changed by a user"
    },
    {
        name: "NetLineCadence",
        synopsis: "Net Line Cadence",
        description: "The insertions-deletions changed per user, divided by the time between commits."
    },
    {
        name: "NetLinesChanged",
        synopsis: "Net Lines Changed",
        description: "Total Insertions - Total Deletions by UserName"
    }
]

export const gitLoggerMetricNames = distinctList(
    gitLoggerMetrics.map(m => m.name)
)