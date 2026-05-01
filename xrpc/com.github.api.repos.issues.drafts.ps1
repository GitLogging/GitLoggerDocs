<#
.SYNOPSIS
    Repos Issue Drafts
.DESCRIPTION
    Gets the issues in this repository with the label 'Drafts'
#>
param(
# The GitHub organization.
# This should default to the repository owner.
[string]$Organization = $(
    if ($env:GITHUB_REPOSITORY_OWNER) {
        $env:GITHUB_REPOSITORY_OWNER
    } else {
        'Gitlogging'
    }
),

[string]$Repository = $(
    if ($env:GITHUB_REPOSITORY) {
        @($env:GITHUB_REPOSITORY -split '/')[1]
    } else {
        'GitLoggerDocs'
    }
)
)

if (-not $script:Cache) {
    $script:Cache = [Ordered]@{}
}


$DraftsUrl = "https://api.github.com/repos/$Organization/$Repository/issues?per_page=100&labels=Drafts"



if (-not $script:Cache[$DraftsUrl]) {
    $script:Cache[$DraftsUrl] = Invoke-RestMethod -Uri $DraftsUrl |
        Where-Object Name -notmatch '^.github'
}

$script:Cache[$DraftsUrl] |
    Add-Member NoteProperty '$type' 'com.github.api.repos.issues' -Force -PassThru
