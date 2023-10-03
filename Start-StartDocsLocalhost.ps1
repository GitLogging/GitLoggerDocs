

<#
.SYNOPSIS
    This will build the local jekyll docs using 'bundle' and then host on localhost with live reload
.NOTES
    Set $Jekyll_BuildCfg.DocsRoot and the rest should run off of defaults and _config.yml

    Example directory layout from git clone:

        > pushd 'H:/data/2023/my_git'
        > gh repo clone GitLogging/GitLoggerDocs
        > pushd 'GitLoggerDocs'
        > . ./Start-StartDocsLocalhost.ps1
#>

if(-not (gcm 'bundle' -ea ignore)) {
    # $Env:PATH += ([IO.Path]::PathSeparator), (gi -ea stop 'C:\Ruby32-x64\bin') -join ''
    $Env:Path = $Env:Path, 'C:\Ruby32-x64\bin' -join ([IO.Path]::PathSeparator)
}

$Jekyll_BuildCfg ??= @{
    LiveReload = $true
    AutoOpen   = $True
    DocsRoot = 'H:/data/2023/my_git/GitLoggerDocs'
}
"Using `$Jekyll_BuildCfg in `"$PSCommandPath`"" | write-verbose -verb
$Jekyll_BuildCfg | ft -auto

$BinBundle = Get-Command -CommandType Application -Name 'bundle' -ea 'continue'
if( ! $binBundle ) {
    throw 'Ruby binary "bundle" was not found in $Env:Path !'
}
if( ! (Test-Path $Jekyll_BuildCfg.DocsRoot)) {
    throw ( 'Directory $Jekyll_BuildCfg.DocsRoot did not exist, `$Jekyll_BuildCfg.DocsRoot = {0}.' -f @(
        $Jekyll_BuildCfg.DocsRoot ))
}
$Jekyll_BuildCfg.StaticSiteRoot = gi -ea 'stop' (Join-Path $Jekyll_BuildCfg.DocsRoot 'docs')
if(-not (Test-Path $Jekyll_BuildCfg.StaticSiteRoot)) {
    mkdir -Path $Jekyll_BuildCfg.StaticSiteRoot
}

Push-Location -stack 'jekyll' $Jekyll_BuildCfg.StaticSiteRoot

# others: '--incremental'
if ($Jekyll_BuildCfg.AutoOpen) {
    sleep -Seconds 7
    Start-Process -FilePath 'http://localhost:4000'
}

if ($Jekyll_BuildCfg.LiveReload) {
    # else: & $BinBundle @('exec', 'jekyll', 'serve', '--livereload')
    #throws: 'bundle.bat bundle' is not recognized as a name of a cmdlet,
    & 'Bundle' @('exec', 'jekyll', 'serve', '--livereload')
}
else {
    &  'Bundle' @('exec', 'jekyll', 'serve')
}


Pop-Location -stack 'jekyll'