Get-GitLoggerSql
----------------




### Synopsis

Get-GitLoggerSql [-CustomerID] <string> [-Datastore] <string> [-Query <string>] [-QueryParameter <psobject>] [-Filter <scriptblock>] [<CommonParameters>]




---


### Description


---


### Parameters
#### **CustomerID**




|Type      |Required|Position|PipelineInput|Aliases                |
|----------|--------|--------|-------------|-----------------------|
|`[string]`|true    |0       |false        |UserID<br/>CustomerName|



#### **Datastore**




|Type      |Required|Position|PipelineInput|Aliases  |
|----------|--------|--------|-------------|---------|
|`[string]`|true    |1       |false        |TableName|



#### **Filter**




|Type           |Required|Position|PipelineInput        |Aliases          |
|---------------|--------|--------|---------------------|-----------------|
|`[scriptblock]`|false   |Named   |true (ByPropertyName)|Foreach<br/>Where|



#### **Query**




|Type      |Required|Position|PipelineInput        |
|----------|--------|--------|---------------------|
|`[string]`|false   |Named   |true (ByPropertyName)|



#### **QueryParameter**




|Type        |Required|Position|PipelineInput        |
|------------|--------|--------|---------------------|
|`[psobject]`|false   |Named   |true (ByPropertyName)|





---


### Inputs
System.String
System.Management.Automation.PSObject
System.Management.Automation.ScriptBlock




---


### Outputs
* [Object](https://learn.microsoft.com/en-us/dotnet/api/System.Object)






---


### Syntax
```PowerShell
syntaxItem
```
```PowerShell
----------
```
```PowerShell
{@{name=Get-GitLoggerSql; CommonParameters=True; parameter=System.Object[]}}
```
