<#
.SYNOPSIS
    Rebuilds Static Site pages
#>
param(
    [switch] $Archive
)
":::build.ps1: Started $( Get-Date )" | Write-Host

Set-Alias 'layout' -Value (Get-Item -ea 'stop'  './layout.ps1' )

# find and build files: *.html.ps1
$PSFiles_Html = gci *.html.ps1 -Recurse

foreach($file in $PSFiles_Html) {
    $OutFilePath = $file.FullName -replace '\.html\.ps1', '.html'
    & $PSFiles_Html
        | Layout # -PageTitle 'GitLogger'
        | Set-Content -path $OutFilePath -encoding utf8
    ':::build.ps1:::wrote: "{0}"' -f $OutFilePath | Write-Host
}

if( -not (Test-Path './output')) {
    New-Item -ItemType Directory -Path './output' | Out-Null
}

if( $Archive ) {
    $OutputArchivePath = Join-Path './output' 'archive.zip'
    Compress-Archive -Path '.' -DestinationPath $OutputArchivePath -CompressionLevel Optimal -Force
    ":::build.ps1:::archived: '{0}'" -f $OutputArchivePath | Write-Host
}
