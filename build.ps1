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

#region index data in `/xrpc/`

# We want to run any script in `/xrpc/`.

# Fun fact: this becomes our site data.

# We'll call each script that generates xrpc an "indexer"
# (because it generates an index of the content)
# Any `*.*.*.ps1` beneath /xrpc/ will be conisdered an indexer.

$xrpcOutputRoot = Join-Path $PSScriptRoot docs |
    Join-Path -childPath xrpc    
foreach ($xrpcIndexFile in 
    Get-ChildItem -Path $psScriptRoot -Filter xrpc | 
    Get-ChildItem -filter *.*.*.ps1 
) {
    # Let's get the script
    $xrpcScript = Get-Command $xrpcIndexFile.FullName

    # and run it in the current scope.
    $xrpcOutput = . $xrpcScript

    # To get the NSID, we just need to remove the extension.
    $xrpcNsid = $xrpcScript.Name -replace '\.ps1$'
    
    # Once we know the NSID, we can start to construct the directory.
    $xrpcOutputDirectory = Join-Path $xrpcOutputRoot $xrpcNsid
    
    # Fun fact number #2:
    # We can use an index.json file to return static json.
    # This eliminates most of the server side load. 
    $xrpcOutputFile = Join-Path $xrpcOutputDirectory "index.json"

    # All we have to do is cache our results into a json file
    # and now our site can serve them up.
    New-Item -ItemType File -Path $xrpcOutputFile -Value (
        $xrpcOutput | ConvertTo-Json -Depth 10
    ) -Force
    
    # Before we move onto the next indexer,
    # let's save our site data.
    $site[$xrpcNsid] = $xrpcOutput
}

#endregion index data in `/xrpc/`

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
