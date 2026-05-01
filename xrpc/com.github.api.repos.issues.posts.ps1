<#
.SYNOPSIS
    Repos Issue Posts
.DESCRIPTION
    Gets the issues in this repository with the label 'Post'
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


$PostsUrl = "https://api.github.com/repos/$Organization/$Repository/issues?per_page=100&labels=Post"

if (-not $script:Cache[$PostsUrl]) {
    $script:Cache[$PostsUrl] = Invoke-RestMethod -Uri $PostsUrl |
        Where-Object Name -notmatch '^.github'
}

$script:Cache[$PostsUrl] |
    Add-Member NoteProperty '$type' 'com.github.api.repos.issues' -Force -PassThru
