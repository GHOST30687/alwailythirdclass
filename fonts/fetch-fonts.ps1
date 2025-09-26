$ErrorActionPreference = 'Stop'

New-Item -ItemType Directory -Force -Path "vanilla/fonts" | Out-Null

$headers = @{ 'User-Agent' = 'Mozilla/5.0' }
$cssUrl = "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
$cssPath = "vanilla/fonts/noto.css"
Invoke-WebRequest -Headers $headers -Uri $cssUrl -OutFile $cssPath

$css = Get-Content -Raw $cssPath
$regex = [regex]'https://[^)]+\.woff2'
$urls = $regex.Matches($css) | ForEach-Object { $_.Value } | Sort-Object -Unique

foreach ($u in $urls) {
  $file = Split-Path $u -Leaf
  Invoke-WebRequest -Headers $headers -Uri $u -OutFile (Join-Path "vanilla/fonts" $file)
}

$localCss = $css
foreach ($u in $urls) {
  $file = Split-Path $u -Leaf
  $localCss = $localCss -replace [regex]::Escape($u), ("./" + $file)
}
Set-Content -Path "vanilla/fonts/noto-local.css" -Value $localCss -Encoding UTF8

Write-Output ("Downloaded " + $urls.Count + " font files.")
