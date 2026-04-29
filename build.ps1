":::deploy.ps1" | Write-Host

# find and build files: *.html.ps1
$files_html = gci *.html.ps1 -Recurse

foreach($file in $files_html) {
    $outFile = $file.FullName -replace '\.html\.ps1', '.html'
    & $files_html
        | Layout # -PageTitle 'GitLogger'
        | Set-Content -path $outFile -encoding utf8
    ':::build.ps1:::wrote: "{0}"' -f $outFile | Write-Host
}

Set-Alias 'layout' -Value (Get-Item -ea 'stop'  './layout.ps1' )
