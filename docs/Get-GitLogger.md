Get-GitLogger
-------------




### Synopsis
Gets data from GitLogger



---


### Description

Gets data from any GitLogger datastore.



---


### Parameters
#### **CustomerID**

The customer ID.






|Type      |Required|Position|PipelineInput|Aliases                |
|----------|--------|--------|-------------|-----------------------|
|`[String]`|true    |1       |false        |UserID<br/>CustomerName|



#### **Datastore**

The name of the datastore.






|Type      |Required|Position|PipelineInput|Aliases  |
|----------|--------|--------|-------------|---------|
|`[String]`|true    |2       |false        |TableName|



#### **Query**

Server side query (passed to the datastore)






|Type      |Required|Position|PipelineInput        |
|----------|--------|--------|---------------------|
|`[String]`|false   |named   |true (ByPropertyName)|



#### **QueryParameter**

Additional parameters to provide to a given GitLogger function.






|Type        |Required|Position|PipelineInput        |
|------------|--------|--------|---------------------|
|`[PSObject]`|false   |named   |true (ByPropertyName)|



#### **Filter**

PowerShell filter for results (run on each result returned from the datastore)






|Type           |Required|Position|PipelineInput        |Aliases          |
|---------------|--------|--------|---------------------|-----------------|
|`[ScriptBlock]`|false   |named   |true (ByPropertyName)|Foreach<br/>Where|



#### **IncludeTotalCount**




|Type      |Required|Position|PipelineInput|
|----------|--------|--------|-------------|
|`[Switch]`|false   |named   |false        |



#### **Skip**




|Type      |Required|Position|PipelineInput|
|----------|--------|--------|-------------|
|`[UInt64]`|false   |named   |false        |



#### **First**




|Type      |Required|Position|PipelineInput|
|----------|--------|--------|-------------|
|`[UInt64]`|false   |named   |false        |





---


### Notes
A customer can have any number of datastores.
Each datastore contains a number of property bags or rows that can represent a git log or git web hook.
May become:
Find-GitLogger
Search-GitLogger



---


### Syntax
```PowerShell
Get-GitLogger [-CustomerID] <String> [-Datastore] <String> [-Query <String>] [-QueryParameter <PSObject>] [-Filter <ScriptBlock>] [-IncludeTotalCount] [-Skip <UInt64>] [-First <UInt64>] [<CommonParameters>]
```
