[CmdletBinding()]
param(
  [switch] $Verify
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = 'C:\Users\jober\.cache\codex-runtimes\codex-primary-runtime\dependencies\node'
$nodeExecutable = Join-Path $runtimeRoot 'bin\node.exe'
$nodeModules = Join-Path $runtimeRoot 'node_modules'
$captureScript = Join-Path $PSScriptRoot 'capture-qa.cjs'

if (-not (Test-Path -LiteralPath $nodeExecutable)) {
  throw "Bundled Node runtime not found: $nodeExecutable"
}
if (-not (Test-Path -LiteralPath $nodeModules)) {
  throw "Bundled Node modules not found: $nodeModules"
}

$env:NODE_PATH = $nodeModules
Push-Location $repoRoot
try {
  $captureArguments = @($captureScript)
  if ($Verify) { $captureArguments += '--verify' }
  & $nodeExecutable @captureArguments
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
}
exit $exitCode
