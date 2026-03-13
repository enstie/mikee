#!/usr/bin/env pwsh
<#
.SYNOPSIS
Exchange Zoho authorization code for refresh token.

.DESCRIPTION
After getting your authorization code, run this script to get the refresh token.

.PARAMETER ClientId
Your Zoho Client ID

.PARAMETER ClientSecret
Your Zoho Client Secret

.PARAMETER AuthCode
The authorization code from Step 4

.PARAMETER RedirectUri
Must match the redirect URI registered in Zoho OAuth app (default: http://localhost:8080/callback)

.EXAMPLE
.\get-refresh-token.ps1 -ClientId abc123 -ClientSecret xyz789 -AuthCode code_from_browser

#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientSecret,
    
    [Parameter(Mandatory=$true)]
    [string]$AuthCode,
    
    [string]$RedirectUri = "http://localhost:8080/callback"
)

$tokenUrl = "https://accounts.zoho.com/oauth/v2/token"

$body = @{
    grant_type = "authorization_code"
    client_id = $ClientId
    client_secret = $ClientSecret
    redirect_uri = $RedirectUri
    code = $AuthCode
}

Write-Host "Exchanging authorization code for tokens..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "`n✓ Success!" -ForegroundColor Green
    Write-Host "`nHere are your tokens:`n" -ForegroundColor Green
    Write-Host "Access Token:" -ForegroundColor Yellow
    Write-Host $response.access_token
    Write-Host "`nRefresh Token:" -ForegroundColor Yellow
    Write-Host $response.refresh_token
    Write-Host "`nToken Type: $($response.token_type)" -ForegroundColor Cyan
    Write-Host "Expires In: $($response.expires_in) seconds`n" -ForegroundColor Cyan
    
    Write-Host "Save the Refresh Token above—you'll need it for wrangler secret put ZOHO_REFRESH_TOKEN" -ForegroundColor Magenta
}
catch {
    Write-Host "`n✗ Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
