if ($PSScriptRoot) { Push-Location $PSScriptRoot}
# "🐒:::building: $PSScriptRoot (as out)" | Out-Host
":::index.html.ps1:::PSScriptRoot: ${PSScriptRoot}" | Write-Host

# if (-not (Test-Path ./Examples)) {
#     $null = New-Item -ItemType Directory -Path ./Examples -Force
# }
# "<html><body><h3>Hi world $(Get-Date)" | Set-Content 'index.html' -encoding utf8

@'
 <article>
        <section class="hero">
            <h1>Getting started with GitLogger</h1>
            <p class="hero-sub">To get started, you'll need to add some data from a repository. This is really easy if your project is on
                GitHub, and pretty easy to do for any Git repository.</p>
        </section>

        <section class="guide-section">
            <h2>Using the GitLogger GitHub Action</h2>
            <p>If your repository is on GitHub, you can use the <a href="https://github.com/GitLogging/GitLoggerAction">GitLogger GitHub
                    Action</a> to get up and running.</p>
            <p>Just copy/paste this step into any job. Use a "push" trigger to make sure you capture every commit.</p>
            <pre><code class="language-yaml">- name: Run GitLogger
  uses: GitLogging/GitLoggerAction@main</code></pre>
        </section>

        <section class="guide-section">
            <h2>Pushing Changes directly</h2>
            <p>If your repository is not on GitHub, you'll have to use a bit of PowerShell to import your logs.</p>
            <p>You'll also need to install <a href="https://github.com/StartAutomating/ugit">ugit</a> from the PowerShell gallery.</p>
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
