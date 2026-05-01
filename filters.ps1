<#
.SYNOPSIS
    Common filters and converting html/json/md/etc
#>

#region Special Filters
filter content {$Content}

filter now {[DateTime]::Now}

filter utc_now {[DateTime]::UtcNow}

filter today {[DateTime]::Today}

filter yaml_header_pattern {
    [Regex]::new('
(?<Markdown_YAMLHeader>
(?m)\A\-{3,}                      # At least 3 dashes mark the start of the YAML header
(?<YAML>(?:.|\s){0,}?(?=\z|\-{3,} # And anything until at least three dashes is the content
))\-{3,}                          # Include the dashes in the match, so that the pointer is correct.
)
','IgnoreCase, IgnorePatternWhitespace')
}

filter yaml_header {
    $in = $_
    if ($in -is [IO.FileInfo]) {
        $in | Get-Content -Raw | yaml_header
        return
    }
    foreach ($match in (yaml_header_pattern).Matches("$in")) {
        $match.Groups['YAML'].Value | from_yaml
    }
}

filter from_yaml {
    $in = $_
    "YaYaml" | RequireModule
    $in | ConvertFrom-Yaml
}

filter to_yaml {
    $in = $_
    "YaYaml" | RequireModule
    $in | ConvertTo-Yaml
}

filter to_json {
    $in = $_
    $in | ConvertTo-Json -Depth 10
}

filter strip_yaml_header {
    $in = $_
    if ($in -is [IO.FileInfo]) {
        $in | Get-Content -Raw | strip_yaml_header
        return
    }
    $in -replace (yaml_header_pattern)
}

filter from_markdown {
    $in = $_
    if ($in -is [IO.FileInfo]) {
        $in | Get-Content -Raw | from_markdown
        return
    }
    @(
        $in |
            strip_yaml_header |
                ConvertFrom-Markdown |
                    Select-Object -ExpandProperty Html
    ) -replace 'disabled="disabled"'
}

#endregion Special Filters
