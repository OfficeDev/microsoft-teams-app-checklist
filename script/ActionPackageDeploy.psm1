New-Variable -Name LogDirectoryPath -Value "" -Scope Script -Force
New-Variable -Name LogFilePath -Value "" -Scope Script -Force
New-Variable -Name LogLevel -Value "Info" -Scope Script -Force
New-Variable -Name Endpoint -Value "" -Scope Script -Force
New-Variable -Name AccessToken -Value "" -Scope Script -Force
New-Variable -Name RequestCorrelationId -Value "" -Scope Script -Force

# Maximum time API calls must take
Set-Variable MAX_API_TIMEOUT -option Constant -value 30 # seconds

# Maximum number of retries in API calls
Set-Variable MAX_API_RETRIES -option Constant -value 3

# Minimum API retry interval in exponential retry pattern
Set-Variable MIN_RETRY_DELAY -option Constant -value 2 # seconds

# Http error codes that need to be retried
Set-Variable RETRYABLE_ERROR_CODES -option Constant -value @(429 <# TooManyRequests #>, 408 <# RequestTimeout #>, 502 <# BadGateway #>, 503 <# ServiceUnavailable #>, 504 <# GatewayTimeout #>)

# Maximum number of retries to monitor status url
Set-Variable MAX_MONITORING_RETRIES -option Constant -value 30


#region logging

Set-Variable LogLevelMap -option Constant -value @{
    'None'    = 0
    'Error'   = 1
    'Success' = 2
    'Status'  = 3
    'Warning' = 4
    'Info'    = 5
    'Debug'   = 6
}

function Initialize-Logger {
    if ([string]::IsNullOrWhiteSpace($LogDirectoryPath) -or !(Test-Path -Path $LogDirectoryPath -PathType Container -ErrorAction Stop)) {
        $LogDirectoryPath = "$Home\ActionPackageLogs"
    }

    $LogFileName = (Get-Date).ToString('dd-MM-yyyy')
    $Script:LogFilePath = "$LogDirectoryPath\$LogFileName.log"

    if (!(Test-Path -Path $LogFilePath -PathType Leaf -ErrorAction Stop)) {
        $LogFile = New-Item -Path $LogFilePath -Force -ItemType File
    }
    Write-Host "Log file path: $LogFilePath" -ForegroundColor Magenta
}

function Write-Log {
    param (
        [Parameter(Mandatory = $false)]
        [Alias("LogLevel")]
        [ValidateSet("Success", "Error", "Warning", "Info", "Debug")]
        [string]$StatementLogLevel = "Info",

        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    # check if logger is initialized
    if ([string]::IsNullOrWhiteSpace($LogFilePath)) {
        Initialize-Logger
        Write-DebugLog "`n`n`n`n------------------New script run logs-----------------"
        Write-InfoLog "RequestCorrelationId for this session: $RequestCorrelationId"
    }

    # Generate date string to log
    $DateTimeToLog = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    "$DateTimeToLog $StatementLogLevel $Message" | Out-File -FilePath $LogFilePath -Append

    if ($LogLevelMap[$LogLevel] -lt $LogLevelMap[$StatementLogLevel]) {
        return
    }

    switch ($StatementLogLevel) {
        'Success' {
            Write-Host $Message -ForegroundColor Green
        }
        'Error' {
            Write-Host $Message -ForegroundColor Red
        }
        'Warning' {
            Write-Host $Message -ForegroundColor Yellow
        }
        'Info' {
            Write-Host $Message
        }
        'Debug' {
            Write-Host $Message
        }
    }
}

function Write-ErrorLog {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Log -LogLevel "Error" -Message $Message
}

function Write-WarningLog {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Log -LogLevel "Warning" -Message $Message
}

function Write-InfoLog {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Log -LogLevel "Info" -Message $Message
}

function Write-SuccessLog {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Log -LogLevel "Success" -Message $Message
}

function Write-DebugLog {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Log -LogLevel "Debug" -Message $Message
}

#endregion logging


#region utils

function Initialize-Environment {
    $Script:LogFilePath = ""
    $Script:RequestCorrelationId = [guid]::NewGuid().ToString()
    [System.IO.Directory]::SetCurrentDirectory(((Get-Location -PSProvider FileSystem).ProviderPath))

    # setting security protocol to Tls12, without this, API calls fail
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
}

function Exit-OnError {
    param (
        [Parameter(Mandatory = $false)]
        [bool]$IsError = $true,

        [Parameter(Mandatory = $true)]
        [String]$OnErrorMessage
    )

    if ($IsError) {
        Write-ErrorLog $OnErrorMessage
        throw $OnErrorMessage
    }
}

function Invoke-API {
    param (
        [Parameter(Mandatory = $true)]
        [String]$Method,

        [Parameter(Mandatory = $true)]
        [String]$Uri,

        [Parameter(Mandatory = $false)]
        [hashtable]$Headers,

        [Parameter(Mandatory = $false)]
        [System.Object]$Body,

        [Parameter(Mandatory = $false)]
        [int]$RetryAttempt = 0,

        [Parameter(Mandatory = $false)]
        [String]$OnErrorMessage
    )

    try {
        $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $Body -TimeoutSec $MAX_API_TIMEOUT -ErrorAction Stop
        Write-DebugLog "Executed API: Method: $Method, Uri: $Uri"
        return $response
    }
    catch {
        Write-DebugLog "API execution failed. $PSItem"

        if ([bool]($_.Exception.PSobject.Properties.name -match "Response")) {

            Write-ErrorLog "API failed. StatusCode: $($_.Exception.Response.StatusCode.value__), StatusDescription: $($_.Exception.Response.StatusDescription)"

            $StatusCode = $_.Exception.Response.StatusCode.value__

            if ($RETRYABLE_ERROR_CODES.Contains($StatusCode)) {
                Write-DebugLog "$StatusCode is a retryable status code. Current RetryAttempt# $RetryAttempt"

                if ($RetryAttempt -le $MAX_API_RETRIES) {
                    $Delay = [math]::Pow($MIN_RETRY_DELAY, $RetryAttempt + 1)
                    Write-DebugLog "Retrying after $Delay seconds."
                    Start-Sleep -Seconds $Delay
                    return Invoke-API -Method $Method -Uri $Uri -Headers $Headers -Body $Body -RetryAttempt ($RetryAttempt + 1) -OnErrorMessage $OnErrorMessage
                }
                else {
                    Write-ErrorLog "API failed after $RetryAttempt retries. "
                }
            }
            else {
                Write-DebugLog "StatusCode: $($_.Exception.Response.StatusCode.value__) is not retryable."
            }
        }

        if (!([string]::IsNullOrWhiteSpace($OnErrorMessage))) {
            Write-ErrorLog $OnErrorMessage
        }

        throw
    }
}

function Invoke-ActionPlatformAPI {
    param (
        [Parameter(Mandatory = $true)]
        [String]$Method,

        [Parameter(Mandatory = $true)]
        [String]$Uri,

        [Parameter(Mandatory = $false)]
        [System.Object]$Body = $null,

        [Parameter(Mandatory = $false)]
        [String]$OnErrorMessage
    )

    if ([string]::IsNullOrWhiteSpace($AccessToken)) {
        Write-DebugLog "ExecuteActionAPI: AccessToken not acquired already"
        ValidateOrAcquireToken
        Write-DebugLog "ExecuteActionAPI: Post ValidateOrAcquireToken, AccessToken IsNullOrWhiteSpace: $([string]::IsNullOrWhiteSpace($AccessToken))"
    }

    $Headers = Get-ActionHeaders
    Write-DebugLog "ExecuteActionAPI: Method: $Method, Uri: $Uri, Body: $Body"
    return Invoke-API -Method $Method -Uri $Uri -Headers $Headers -Body $Body -OnErrorMessage $OnErrorMessage
}

function Get-ActionHeaders {
    return @{
        'Authorization'        = "Bearer $AccessToken"
        'Content-Type'         = "application/json"
        'RequestCorrelationId' = $RequestCorrelationId
        'Accept-Encoding'      = "gzip, deflate"
    }
}

#endregion utils


#region ActionService APIs

function ValidateOrAcquireToken {
    if ([string]::IsNullOrWhiteSpace($AccessToken)) {
        if (!(Get-Module -ListAvailable -Name MSAL.PS)) {
            Write-DebugLog "MSAL.PS module is not already installed"
            Write-InfoLog "Need to install MSAL.PS module for authentication purpose. Updating Nuget Package and PowerShellGet Module for the same"

            # ## Update Nuget Package and PowerShellGet Module
            Install-PackageProvider NuGet -Force -Scope CurrentUser
            Install-Module PowerShellGet -Force -Scope CurrentUser -AllowClobber

            # ## In a new PowerShell process, install the MSAL.PS Module. Restart PowerShell console if this fails.
            Write-InfoLog "Installing the MSAL.PS Module. Restart PowerShell console if this fails."

            &(Get-Process -Id $pid).Path -Command { Install-Module MSAL.PS -Scope CurrentUser }
            Import-Module MSAL.PS

            if (!(Get-Module -ListAvailable -Name MSAL.PS)) {
                Exit-OnError -OnErrorMessage "Not able to find MSAL.PS module. Please restart PowerShell console and try again, or provide the AccessToken as parameter to this script"
            }
        }
        else {
            Write-DebugLog "MSAL.PS module is already installed."
        }

        $Scope = "$($Endpoint)/ActionPackage.ReadWrite.All"

        $ClientId = "cac88df7-3599-49cf-9465-867b9eee33cf"
        $RedirectUri = "urn:ietf:wg:oauth:2.0:oob"
        $Authority = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"

        Write-DebugLog "Fetching API token for endpoint: $Endpoint, scope: $Scope..."
        Write-InfoLog "Please login to your AAD account when prompted ..."

        $authResponse = Get-MsalToken -Scope $Scope -ClientId $ClientId -RedirectUri $RedirectUri -Authority $Authority -Prompt 'SelectAccount'

        if ($null -eq $authResponse -or [string]::IsNullOrWhiteSpace($authResponse.AccessToken)) {
            Exit-OnError -OnErrorMessage "Token acquisition failed. Please try again later"
        }

        $Script:AccessToken = $authResponse.AccessToken

        Write-DebugLog "Token acquisition successful"
    }
    else {
        Write-InfoLog "Using AccessToken provided as input parameter"
    }
}

function Get-ActionPackageUploadUrl {
    $Uri = "$Endpoint/v1/actionPackages/zipUploadUrl"

    Write-InfoLog "Fetching ActionPackage zip upload url ..."
    $ErrorMessage = "Failed to get zip upload url!"
    $response = Invoke-ActionPlatformAPI -Method "Get" -Uri $Uri -OnErrorMessage $ErrorMessage

    $PackageZipUploadUrl = $response.url

    Exit-OnError -IsError ([string]::IsNullOrWhiteSpace($PackageZipUploadUrl)) -OnErrorMessage $ErrorMessage

    Write-DebugLog "PackageZipUploadUrl: $PackageZipUploadUrl"
    return $PackageZipUploadUrl
}

function UploadPackageZipToBlob {
    param (
        [Parameter(Mandatory = $true)]
        [String]$PackageZipUploadUrl,

        [Parameter(Mandatory = $true)]
        [String]$PackageZipFilePath
    )

    $Headers = @{
        'Content-Type'   = "application/zip"
        'x-ms-blob-type' = "BlockBlob"
    }

    Write-InfoLog "Uploading action package zip ..."
    $FileBytes = [System.IO.File]::ReadAllBytes($PackageZipFilePath)
    $response = Invoke-API -Method "Put" -Uri $PackageZipUploadUrl -Headers $Headers -Body $FileBytes -OnErrorMessage "Failed to upload action package zip!"
}

function ProcessActionPackageZip {
    param (
        [Parameter(Mandatory)]
        [String]$PackageZipUploadUrl
    )

    $Uri = "$Endpoint/v1/actionPackages/processZip"

    Write-InfoLog "Processing action package zip ..."
    $Body = "{'url':'$PackageZipUploadUrl'}"

    $ErrorMessage = "Failed to process action package zip!"
    $response = Invoke-ActionPlatformAPI -Method "Post" -Uri $Uri -Body $Body -OnErrorMessage $ErrorMessage
    $MonitorPackageZipProcessingUrl = $response.url

    Exit-OnError -IsError ([string]::IsNullOrWhiteSpace($MonitorPackageZipProcessingUrl)) -OnErrorMessage $ErrorMessage

    Write-DebugLog "Monitor Url: $MonitorPackageZipProcessingUrl"
    return $MonitorPackageZipProcessingUrl
}

function MonitorStatusUrl {
    param (
        [Parameter(Mandatory = $true)]
        [String]$StatusUrl,

        [Parameter(Mandatory = $false)]
        [String]$OnErrorMessage,

        [Int32]$RetryAttempt = 0
    )

    if ($RetryAttempt -gt $MAX_MONITORING_RETRIES) {
        Write-ErrorLog "Max retries exhausted!"
        Exit-OnError -OnErrorMessage "Max retries exhausted!"
    }

    $response = Invoke-ActionPlatformAPI -Method "Get" -Uri $StatusUrl

    Write-DebugLog "Retry# $RetryAttempt, Status: $($response.status), SubStatus: $($response.subStatus), Message: $($response.message)"

    if ($response.status -eq "InProgress") {
        Start-Sleep -s 2
        return MonitorStatusUrl -StatusUrl $StatusUrl -OnErrorMessage $OnErrorMessage -RetryAttempt ($RetryAttempt + 1)
    }

    $ActionPackageResourceUrl = $response.resourceUrl

    if ($response.status -eq "Completed" -and $response.subStatus -eq "Success") {
        Write-SuccessLog "Package processing succeeded! $($response.message)"
        return $ActionPackageResourceUrl
    }
    else {
        # Processing failed
        Exit-OnError -OnErrorMessage "$OnErrorMessage, Message: $($response.message)"
    }
}

function CreateTeamsApp {
    param (
        [Parameter(Mandatory)]
        [string]$ActionPackageResourceUrl
    )

    $Uri = "$ActionPackageResourceUrl/teamsApp"

    Write-InfoLog "Creating Teams app ..."

    $ErrorMessage = "Failed to create Teams app!"

    $response = Invoke-ActionPlatformAPI -Method "Post" -Uri $Uri -OnErrorMessage $ErrorMessage
    $AppCreationStatusMonitorUrl = $response.url
    Exit-OnError -IsError ([string]::IsNullOrWhiteSpace($AppCreationStatusMonitorUrl)) -OnErrorMessage $ErrorMessage

    Write-DebugLog "Monitor App Creation status Url: $AppCreationStatusMonitorUrl"
    return $AppCreationStatusMonitorUrl
}

function DownloadTeamsApp {
    param (
        [Parameter(Mandatory = $true)]
        [String]$TeamsAppDownloadUrl,

        [Parameter(Mandatory = $false)]
        [String]$TeamsAppDownloadDirectoryPath
    )

    Write-InfoLog "Downloading Teams app ..."

    if ([string]::IsNullOrWhiteSpace($TeamsAppDownloadDirectoryPath) -or !(Test-Path -Path $TeamsAppDownloadDirectoryPath -PathType Container -ErrorAction Stop)) {
        $TeamsAppDownloadDirectoryPath = "$Home\TeamsApp"
        $TeamsAppDirectory = New-Item -Path $TeamsAppDownloadDirectoryPath -Force -ItemType Directory
    }

    $ManifestPath = "$TeamsAppDownloadDirectoryPath\microsoft-teams-appzip-upload.zip"

    Invoke-RestMethod -Uri $TeamsAppDownloadUrl -Method "Get" -ContentType "application/zip" -OutFile $ManifestPath
    Exit-OnError -IsError $(!(Test-Path $ManifestPath -PathType leaf)) -OnErrorMessage "Failed to download Teams app!"

    Write-SuccessLog "Teams app download succeeded! Path: $ManifestPath"
}

#endregion ActionService APIs


#region ActionService API wrappers

function UploadPackage {
    param (
        [Parameter(Mandatory)]
        [String]$PackageZipFilePath
    )

    $PackageZipUploadUrl = Get-ActionPackageUploadUrl

    UploadPackageZipToBlob $PackageZipUploadUrl $PackageZipFilePath

    $MonitorPackageZipProcessingUrl = ProcessActionPackageZip $PackageZipUploadUrl

    Write-InfoLog "Monitoring package processing status ..."
    $ActionPackageResourceUrl = MonitorStatusUrl -StatusUrl $MonitorPackageZipProcessingUrl -OnErrorMessage "Package Processing failed! "
    return $ActionPackageResourceUrl
}

function CreateApp {
    param (
        [Parameter(Mandatory)]
        [String]$ActionPackageResourceUrl,

        [Parameter(Mandatory = $false)]
        [String]$TeamsAppDownloadDirectoryPath
    )

    $AppCreationStatusMonitorUrl = CreateTeamsApp $ActionPackageResourceUrl

    Write-InfoLog "Monitoring Teams app creation status ..."
    $TeamsAppDownloadUrl = MonitorStatusUrl -StatusUrl $AppCreationStatusMonitorUrl -OnErrorMessage "Teams app creation failed! "

    DownloadTeamsApp -TeamsAppDownloadUrl $TeamsAppDownloadUrl -TeamsAppDownloadDirectoryPath $TeamsAppDownloadDirectoryPath
}

#endregion ActionService API wrappers


#region Functions exposed by the PS module
function New-ActionPackage {
    param(
        [Parameter(Mandatory = $true, HelpMessage = "Action package zip file local path")]
        [ValidateScript( { Test-Path $_ -PathType leaf })]
        [Alias("PackageZipFilePath")]
        [string]$PackageZipFilePathParam,

        [Parameter(Mandatory = $false, HelpMessage = "Teams app zip download directory path")]
        [Alias("TeamsAppDownloadDirectoryPath")]
        [string]$TeamsAppDownloadDirectoryPathParam,

        [Parameter(Mandatory = $false, HelpMessage = "Log Level")]
        [ValidateSet("None", "Status", "Info", "Debug")]
        [Alias("LogLevel")]
        [string]$LogLevelParam = "Info",

        [Parameter(Mandatory = $false, HelpMessage = "Log directory path")]
        [Alias("LogDirectoryPath")]
        [string]$LogDirectoryPathParam,

        [Parameter(Mandatory = $false, HelpMessage = "Action platform endpoint")]
        [Alias("Endpoint")]
        [string]$EndpointParam = "https://actions.office365.com",

        [Parameter(Mandatory = $false, HelpMessage = "AccessToken acquired manually, if automated token acquisition fails")]
        [Alias("AccessToken")]
        [string]$AccessTokenParam
    )
    $Script:LogLevel = $LogLevelParam
    $Script:LogDirectoryPath = $LogDirectoryPathParam
    $Script:Endpoint = $EndpointParam
    $Script:AccessToken = $AccessTokenParam

    Initialize-Environment

    $ActionPackageResourceUrl = UploadPackage -PackageZipFilePath $PackageZipFilePathParam
    CreateApp -ActionPackageResourceUrl $ActionPackageResourceUrl -TeamsAppDownloadDirectoryPath $TeamsAppDownloadDirectoryPath
}

function Update-ActionPackage {
    param(
        [Parameter(Mandatory = $true, HelpMessage = "Action package zip file local path")]
        [ValidateScript( { Test-Path $_ -PathType leaf })]
        [Alias("PackageZipFilePath")]
        [string]$PackageZipFilePathParam,

        [Parameter(Mandatory = $false, HelpMessage = "Log Level")]
        [ValidateSet("None", "Status", "Info", "Debug")]
        [Alias("LogLevel")]
        [string]$LogLevelParam = "Info",

        [Parameter(Mandatory = $false, HelpMessage = "Log directory path")]
        [Alias("LogDirectoryPath")]
        [string]$LogDirectoryPathParam,

        [Parameter(Mandatory = $false, HelpMessage = "Action platform endpoint")]
        [Alias("Endpoint")]
        [string]$EndpointParam = "https://actions.office365.com",

        [Parameter(Mandatory = $false, HelpMessage = "AccessToken acquired manually, if automated token acquisition fails")]
        [Alias("AccessToken")]
        [string]$AccessTokenParam
    )

    $Script:LogLevel = $LogLevelParam
    $Script:LogDirectoryPath = $LogDirectoryPathParam
    $Script:Endpoint = $EndpointParam
    $Script:AccessToken = $AccessTokenParam

    Initialize-Environment

    UploadPackage -PackageZipFilePath $PackageZipFilePathParam
}

Export-ModuleMember -Function New-ActionPackage, Update-ActionPackage

#endregion Functions exposed by the PS module