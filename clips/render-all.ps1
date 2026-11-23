# Every Bolt clip in the shape the case study uses: all of them tall, 2:3, decision 02's pair included (hers,
# 2026-11-21, were square on desktop), then the two edge-case screens in the same 2:3 panel (JPEG), all at 1.2x
# (render.mjs says why). Run from PowerShell: launched from Claude's bash shell the renderer's headless Chrome crashes.
# Close any browser tab showing the case study first (and, if it still fails, stop the dev server): Windows locks an mp4
# a page has played, so Remotion's last step (renaming <clip>.mp4.<id>.remotion-in-progress to <clip>.mp4) fails with exit 1. The in-progress file is the
# finished clip then: check it plays, move it into place and render its poster (2026-11-21).
# powershell -File render-all.ps1
Set-Location $PSScriptRoot
$study = 'bolt'  # this list is Bolt's clips; a new study gets its own list (or a copy of this file)
foreach ($s in 'low-balance', 'grace-period') {
  cmd /c "npx remotion still $s ../public/work/$study/$s.jpg --scale=1.2 --image-format=jpeg --jpeg-quality=92" *> $null
  "${s}: exit $LASTEXITCODE"
}
$jobs = @(@('menu','tall'), @('fleet','tall'), @('geofence','tall'), @('devices','tall'), @('poi','tall'),
  @('subscriptions','tall'), @('vehicle','tall'), @('geofence-slider','tall'), @('terrain','tall'))
foreach ($j in $jobs) {
  $t0 = Get-Date; node render.mjs $study @j *> $null
  if ($LASTEXITCODE -ne 0) { node render.mjs $study @j *> $null }  # the headless Chrome crashes now and then: one retry
  "{0} {1}: exit {2}, {3:N0}s" -f $j[0], $j[1], $LASTEXITCODE, ((Get-Date) - $t0).TotalSeconds
}
"ALL DONE"
