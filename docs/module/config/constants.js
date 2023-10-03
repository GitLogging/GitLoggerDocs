/*
currently hardcoded, from: //docs/_data/GitLoggerMetrics.json
to be an actual api endpoint for discoverability
*/
import { distinctList } from "./../utils.js"

export const gitRepositoryDefaultURLs = [
    // 'https://github.com/GitLogging/GitLoggerAction',
    // 'https://github.com/ninmonkey/dotfiles_git',
    // 'https://github.com/StartAutomating/GitLogger',
    // 'https://github.com/StartAutomating/PipeScript',
    // manual from 2023-09-12
    // 'https://github.com/aaronschlegel/Benchpress',
    'https://github.com/GitLogging/GitLoggerAction',
    // 'https://github.com/mdgrs/dash_mei_Posh',
    'https://github.com/ninmonkey/dotfiles_git',
    'https://github.com/ninmonkey/ExcelAnt',
    'https://github.com/ninmonkey/KnowMoreTangent',
    'https://github.com/ninmonkey/Marking',
    'https://github.com/ninmonkey/Mini.Examples_dash_PowerShell',
    'https://github.com/ninmonkey/MonkeyBusiness',
    'https://github.com/ninmonkey/Nancy',
    'https://github.com/ninmonkey/Ninmonkey.Console',
    'https://github.com/ninmonkey/Ninmonkey.PowerQueryLib',
    'https://github.com/ninmonkey/ninMonkQuery_dash_examples',
    'https://github.com/ninmonkey/notebooks',
    'https://github.com/ninmonkey/TypeWriter',
    'https://github.com/StartAutomating/AutoBrowse',
    'https://github.com/StartAutomating/Benchpress',
    'https://github.com/StartAutomating/CodeCraft',
    'https://github.com/StartAutomating/Discovery',
    'https://github.com/StartAutomating/Eventful',
    'https://github.com/StartAutomating/EZOut',
    'https://github.com/StartAutomating/formulaic',
    'https://github.com/StartAutomating/GitLogger',
    'https://github.com/StartAutomating/GitPub',
    'https://github.com/StartAutomating/HeatMap',
    'https://github.com/StartAutomating/HelpOut',
    'https://github.com/StartAutomating/Irregular',
    'https://github.com/StartAutomating/LightScript',
    'https://github.com/StartAutomating/MenuShell',
    'https://github.com/StartAutomating/obs_dash_powershell',
    'https://github.com/StartAutomating/OnQ',
    'https://github.com/StartAutomating/Patchy',
    'https://github.com/StartAutomating/Piecemeal',
    'https://github.com/StartAutomating/PingMe',
    'https://github.com/StartAutomating/PipeScript',
    'https://github.com/StartAutomating/Pipeworks',
    'https://github.com/StartAutomating/Posh',
    'https://github.com/StartAutomating/PoshMacros',
    'https://github.com/StartAutomating/PowerArcade',
    'https://github.com/StartAutomating/PowerCode',
    'https://github.com/StartAutomating/PowerHistory',
    'https://github.com/StartAutomating/PowerNix',
    'https://github.com/StartAutomating/PowerShell',
    'https://github.com/StartAutomating/PowerShellPowerPoints',
    'https://github.com/StartAutomating/PowRoku',
    'https://github.com/StartAutomating/PS3D',
    'https://github.com/StartAutomating/PSA',
    'https://github.com/StartAutomating/PSDevOps',
    'https://github.com/StartAutomating/PSMetrics',
    'https://github.com/StartAutomating/PSMinifier',
    'https://github.com/StartAutomating/PSPrettifier',
    'https://github.com/StartAutomating/PSSVG',
    'https://github.com/StartAutomating/RoughDraft',
    'https://github.com/StartAutomating/ScriptCop',
    'https://github.com/StartAutomating/ScriptDeck',
    'https://github.com/StartAutomating/SecureSettings',
    'https://github.com/StartAutomating/ShowDemo',
    'https://github.com/StartAutomating/Splatter',
    'https://github.com/StartAutomating/StartAutomating',
    'https://github.com/StartAutomating/TerminalTunes',
    'https://github.com/StartAutomating/TerminalVelocity',
    'https://github.com/StartAutomating/ugit',
    'https://github.com/StartAutomating/Winformal',
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