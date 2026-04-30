<#
.SYNOPSIS
    Deploy Static Site to Github Pages
#>
":::deploy.ps1" | Write-Host

& './build.ps1' -Archive:$false
