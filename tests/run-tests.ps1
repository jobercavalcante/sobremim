[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string[]] $TestFiles
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = 'C:\Users\jober\.cache\codex-runtimes\codex-primary-runtime\dependencies\node'
$nodeExecutable = Join-Path $runtimeRoot 'bin\node.exe'
$nodeModules = Join-Path $runtimeRoot 'node_modules'

if (-not (Test-Path -LiteralPath $nodeExecutable)) {
  throw "Bundled Node runtime not found: $nodeExecutable"
}
if (-not (Test-Path -LiteralPath $nodeModules)) {
  throw "Bundled Node modules not found: $nodeModules"
}

$selectedFiles = @()
if ($TestFiles -and $TestFiles.Count -gt 0) {
  foreach ($item in $TestFiles) {
    foreach ($file in ($item -split ',')) {
      if (-not [string]::IsNullOrWhiteSpace($file)) {
        $selectedFiles += [IO.Path]::GetFullPath((Join-Path $repoRoot $file.Trim()))
      }
    }
  }
} else {
  $selectedFiles = @(Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.test.cjs' -File | Sort-Object FullName | Select-Object -ExpandProperty FullName)
}

if ($selectedFiles.Count -eq 0) {
  throw "No *.test.cjs files found under $PSScriptRoot"
}

$env:NODE_PATH = $nodeModules
Push-Location $repoRoot
try {
  & $nodeExecutable '--test' @selectedFiles
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
}
exit $exitCode
