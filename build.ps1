<#
.SYNOPSIS
    Rebuilds Static Site pages
#>
param(
    [switch] $Archive
)
":::build.ps1:::Started $( Get-Date )" | Write-Host
Set-Alias 'layout' -Value ( Get-Item -ea 'stop'  './layout.ps1' )

. './filters.ps1'

$Site = [Ordered]@{}
$Site['LastBuildTime'] = $LastBuildTime = [DateTime]::Now
$Site['Files'] = [ordered]@{}

$Files_Template = gci './docs/template' -File -recurse
    | ?{ $_.Extension -match '\.(css|html|js|json|ps1)' }

foreach( $item in $Files_Template ) {
    # Does not include relativepath as a prefix, for now.
    $Site['Files'][ $item.Name ] = $Item
}

# find and build files: *.html.ps1
$PSFiles_Html = gci './docs' -Filter *.html.ps1 -Recurse

$Site['Files'].Values.FullName
    | Join-string -sep ', ' -DoubleQuote -op ':::build.ps1:::Files = '
    | Write-verbose

foreach($file in $PSFiles_Html) {
    $OutFilePath = $file.FullName -replace '\.html\.ps1', '.html'
    & $file
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

$TotalBuildDuration = [DateTime]::Now - $LastBuildTime
':::build.ps1:::Total Duration: {0:n0} ms' -f $TotalBuildDuration.TotalMilliseconds
