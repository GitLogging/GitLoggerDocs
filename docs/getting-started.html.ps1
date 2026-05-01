if ($PSScriptRoot) { Push-Location $PSScriptRoot}
# "🐒:::building: $PSScriptRoot (as out)" | Out-Host
":::$( $PSCommandPath.Name ):::PSScriptRoot: ${PSScriptRoot}" | Write-Host

@'
    <article>
        <section class="hero">
            <h1>Getting started with GitLogger</h1>
            <p class="hero-sub">To get started, you'll need to add some data from a repository. This is really easy if your project is on
                GitHub, and pretty easy to do for any Git repository.</p>
        </section>
'@

Get-Content './getting-started.md' -Raw
    | from_markdown

@'
        </section>
    </article>

'@


# Copy-Item ../Examples/* ./Examples -Force
# Copy-Item ../README.md.ps1 ./ -Force
# ./README.md.ps1 > ./README.md
# (ConvertFrom-Markdown -Path ./README.md).Html
if ($PSScriptRoot) { Pop-Location}
