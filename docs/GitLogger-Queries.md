---
layout: default
title: GitLogger Queries
---
You can query any repository in GitLogger using the RESTful endpoint @ [https://gitloggerfunction.azurewebsites.net/Get-GitLogger]()

It supports the following query parameters:

|Name|Description|
|-|-|
|Repository| The full URL to the repository |
|Property  | A comma separated list of properties |
|Year      | An optional year |
|Month     | An optional month |
|Metric    | The [metric](/GitLogger-Metrics) you would like to collect |
|Top/First | Get the first N results |
|Skip      | Skip N results |
|Sort/Descending| Sort or sort descending by a property|