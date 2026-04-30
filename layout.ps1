<#
.SYNOPSIS
    Layout script: Builds files into html/css/js/json
.DESCRIPTION
    This script is used to layout a page with a consistent style and structure.
#>
param(
    [string] $PageTitle = 'GitLogger — Watch Your Git',
    [string] $HtmlMenu = $(
@"
    <nav>
        <div class="nav-inner">
            <ul class="nav-menu">
                <li><a href="index.html">GitLogger</a></li>
                <li><a href="getting-started.html">Getting Started</a></li>
                <li><a href="about-us.html">About Us</a></li>
                <li><a href="index.html#pricing">Pricing</a></li>
            </ul>
        </div>
    </nav>
"@
    )
)

# Collect array then emit html document
$AllInput = @( $input )

$HtmlHeader  = @"
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${PageTitle}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Comfortaa">
    <link rel="stylesheet" href="./css/base.css">
    <script src="js/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
</head>

<body>
"@

$HtmlFooter = @"
    <aside>
        <p class="footer-note">GitLogger &mdash; metrics that help you know your repos in and out.</p>
    </aside>
</body>
</html>
"@

$HtmlHeader
$HtmlMenu
$AllInput -join [Environment]::Newline
$HtmlFooter
