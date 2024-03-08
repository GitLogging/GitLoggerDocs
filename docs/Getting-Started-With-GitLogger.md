---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
layout: default
title: Getting Started with GitLogger
---

To Get Started with GitLogger, you'll need to add some data from a repository.

This is really easy if your project is on GitHub, and pretty easy to do for any Git repository.

## Using the GitLogger GitHub Action

If your repository is on GitHub, you can use the [GitLogger GitHub Action](https://github.com/GitLogging/GitLoggerAction) to get up and running.

Just copy/paste this step into any job.  Use a "push" trigger to make sure you capture every commit.

```yaml
- name: Run GitLogger
  uses: GitLogging/GitLoggerAction@main
```

## Pushing Changes directly

If your repository is not on GitHub, you'll have to use a bit of PowerShell to import your logs.

You'll also need to install [ugit](https://github.com/StartAutomating/ugit) from the PowerShell gallery.

~~~PowerShell
# Fetch all of your git history
git fetch --unshallow | Write-Verbose

# Determine the URL for your repo
$gitRemoteUrl = git remote | git remote get-url | Select-Object -First 1
Write-Progress "Getting Logs" " $gitRemotUrl " -Id $progId

# Get logs with detailed stats
$gitLogs = git log --stat |
    Foreach-Object {
        # Standardize the datetime
        $_.CommitDate = $_.CommitDate.ToString('s')
        # Join all of the output lines
        $_.GitOutputLines = $_.GitOutputLines -join [Environment]::NewLine
        $_ |
            Add-Member NoteProperty RepositoryURL $gitRemoteUrl.RemoteUrl -Force -PassThru
    }

$gitLogsJSON = $gitLogs | ConvertTo-Json -Depth 20

$gitLoggerPushUrl = 'https://gitloggerfunction.azurewebsites.net/PushGitLogger/'

$gotResponse = Invoke-RestMethod -Uri $gitLoggerPushUrl

if (-not $gotResponse) {
    Write-Error "$gitloggerPushUrl unavailable"
    return
}

$repoRestUrl = $gitLoggerPushUrl + '/' + ($gitRemoteUrl.RemoteUrl -replace '^(?>https?|git|ssh)://' -replace '\.git$') + '.git'
Invoke-RestMethod -Uri $repoRestUrl -Body $allJson -Method Post
~~~