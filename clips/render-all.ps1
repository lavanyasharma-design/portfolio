# Every Bolt clip in the shape the case study uses (all phone clips 4:5, decision 02's pair square), then
# the two edge-case screens as bare phones (PNG, no panel). Run from PowerShell: launched from Claude's
# bash shell the renderer's headless Chrome crashes.   powershell -File render-all.ps1
Set-Location $PSScriptRoot
foreach ($s in 'low-balance', 'grace-period') {
  cmd /c "npx remotion still $s ../public/work/bolt/$s.png --scale=1 --image-format=png" *> $null
  "${s}: exit $LASTEXITCODE"
}
$jobs = @(@('menu','tall'), @('fleet','tall'), @('geofence','tall'), @('devices','tall'), @('poi','tall'),
  @('subscriptions','tall'), @('vehicle','tall'), @('geofence-slider','square'), @('terrain','square'))
foreach ($j in $jobs) {
  $t0 = Get-Date; node render.mjs @j *> $null
  if ($LASTEXITCODE -ne 0) { node render.mjs @j *> $null }  # the headless Chrome crashes now and then: one retry
  "{0} {1}: exit {2}, {3:N0}s" -f $j[0], $j[1], $LASTEXITCODE, ((Get-Date) - $t0).TotalSeconds
}
"ALL DONE"
