## Pushing Changes directly

If your repository is not on GitHub, you'll have to use a bit of PowerShell to import your logs.

You'll also need to install [ugit](https://github.com/StartAutomating/ugit) from the PowerShell gallery.
            
```ps1
# Fetch all of your git history
git fetch --unshallow | Write-Verbose

# Determine the URL for your repo
$gitRemoteUrl = git remote | git remote get-url | Select-Object -First 1
Write-Progress "Getting Logs" " $gitRemoteUrl " -Id $progId

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
```
