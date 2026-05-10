$ErrorActionPreference = "Continue"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Test-Url {
  param([string]$Url)

  try {
    $response = Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 2
    return [int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Start-MindCareService {
  param(
    [string]$Name,
    [string]$Url,
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$WorkingDirectory,
    [string]$OutLog,
    [string]$ErrLog
  )

  if (Test-Url $Url) {
    Write-Host "$Name is already running."
    return
  }

  Write-Host "Starting $Name..."
  $process = Start-Process `
    -FilePath $FilePath `
    -ArgumentList $Arguments `
    -WorkingDirectory $WorkingDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -PassThru

  Write-Host "$Name process id: $($process.Id)"
}

Write-Host "Starting MindCare AI complete project..."

Start-MindCareService `
  -Name "ML service" `
  -Url "http://127.0.0.1:5001/health" `
  -FilePath "python" `
  -Arguments @("app.py") `
  -WorkingDirectory (Join-Path $Root "ml-service") `
  -OutLog (Join-Path $Root "ml-service\complete.out.log") `
  -ErrLog (Join-Path $Root "ml-service\complete.err.log")

Start-MindCareService `
  -Name "Backend" `
  -Url "http://127.0.0.1:5000/health" `
  -FilePath "node" `
  -Arguments @("src/server.js") `
  -WorkingDirectory (Join-Path $Root "server") `
  -OutLog (Join-Path $Root "server\complete.out.log") `
  -ErrLog (Join-Path $Root "server\complete.err.log")

Start-MindCareService `
  -Name "Frontend" `
  -Url "http://127.0.0.1:5173" `
  -FilePath "node" `
  -Arguments @("serve-dist.js") `
  -WorkingDirectory (Join-Path $Root "client") `
  -OutLog (Join-Path $Root "client\complete.out.log") `
  -ErrLog (Join-Path $Root "client\complete.err.log")

Start-MindCareService `
  -Name "Load balancer" `
  -Url "http://127.0.0.1:8080/lb-health" `
  -FilePath "node" `
  -Arguments @("src/load-balancer.js") `
  -WorkingDirectory (Join-Path $Root "server") `
  -OutLog (Join-Path $Root "server\lb-complete.out.log") `
  -ErrLog (Join-Path $Root "server\lb-complete.err.log")

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Service status:"
Write-Host "Frontend:      $(if (Test-Url 'http://127.0.0.1:5173') { 'ready' } else { 'not ready' })"
Write-Host "Backend:       $(if (Test-Url 'http://127.0.0.1:5000/health') { 'ready' } else { 'not ready' })"
Write-Host "ML service:    $(if (Test-Url 'http://127.0.0.1:5001/health') { 'ready' } else { 'not ready' })"
Write-Host "Load balancer: $(if (Test-Url 'http://127.0.0.1:8080/lb-health') { 'ready' } else { 'not ready' })"
Write-Host ""
Write-Host "Direct app link: http://127.0.0.1:5173"
Write-Host "Complete project link: http://127.0.0.1:8080"
Write-Host ""
