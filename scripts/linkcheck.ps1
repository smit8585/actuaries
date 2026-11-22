# usage: powershell -File scripts/linkcheck.ps1 <urls.txt> <out.tsv>
param([string]$In, [string]$Out, [int]$Batch = 24, [int]$Timeout = 30)
Add-Type -AssemblyName System.Net.Http
$handler = New-Object System.Net.Http.HttpClientHandler
$handler.AllowAutoRedirect = $true
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds($Timeout)
$client.DefaultRequestHeaders.UserAgent.ParseAdd('Mozilla/5.0 (link-checker; prototype audit)')
$urls = Get-Content $In | Where-Object { $_ -match '^https?://' }
$res = New-Object System.Collections.Generic.List[string]
$batch = $Batch
for ($i = 0; $i -lt $urls.Count; $i += $batch) {
  $slice = $urls[$i..([Math]::Min($i + $batch, $urls.Count) - 1)]
  $tasks = @()
  foreach ($u in $slice) {
    $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Head, $u)
    $tasks += [pscustomobject]@{ Url = $u; Task = $client.SendAsync($req, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead) }
  }
  foreach ($t in $tasks) {
    $code = ''
    try { $r = $t.Task.GetAwaiter().GetResult(); $code = [int]$r.StatusCode; $r.Dispose() } catch { $code = 'ERR:' + $_.Exception.InnerException.Message }
    if ($code -is [int] -and ($code -eq 405 -or $code -eq 403 -or $code -eq 400 -or $code -eq 501)) {
      try { $req2 = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, $t.Url); $r2 = $client.SendAsync($req2, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult(); $code = [int]$r2.StatusCode; $r2.Dispose() } catch { $code = 'ERR:' + $_.Exception.Message }
    }
    $res.Add("$code`t$($t.Url)")
  }
}
$res | Set-Content $Out
"checked $($res.Count)"
