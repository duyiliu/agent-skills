#Requires -Version 5.1
<#
.SYNOPSIS
  Synchronize LifeOS Markdown knowledge with Git without calling an AI model.
.EXAMPLE
  .\lifeos-knowledge-sync.ps1 -Action Run
  .\lifeos-knowledge-sync.ps1 -Action Install
  .\lifeos-knowledge-sync.ps1 -Action Uninstall
#>
[CmdletBinding()]
param(
    [ValidateSet('Run','Install','Uninstall')][string]$Action = 'Run',
    [string]$VaultPath = ''
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$TaskName = 'LifeOS Knowledge Git Sync'
$ScopeSpec = ':(glob)30_资料/知识/**/*.md'
$LogDirectory = Join-Path $env:LOCALAPPDATA 'LifeOSGitSync'
$LogPath = Join-Path $LogDirectory 'sync.log'
$PendingFile = Join-Path $LogDirectory 'pending-commit.txt'

function Write-SyncLog {
    param([string]$Message)
    if (-not (Test-Path -LiteralPath $LogDirectory)) {
        New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
    }
    $line = '[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
    Add-Content -LiteralPath $LogPath -Value $line -Encoding UTF8
    Write-Host $line
}

function Invoke-VaultGit {
    param([string[]]$Arguments)
    $old = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $output = & git -C $script:VaultRoot -c core.quotepath=false @Arguments 2>&1
        $code = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $old
    }
    $out = [string]::Join([Environment]::NewLine, @($output | ForEach-Object { [string]$_ })).Trim()
    if ($code -ne 0) {
        throw ('git {0} exited {1}: {2}' -f ($Arguments -join ' '), $code, $out)
    }
    return $out
}

function Undo-AutoStaging {
    Invoke-VaultGit -Arguments @('restore','--staged','--',$script:ScopeSpec) | Out-Null
}

function Resolve-Vault {
    if ([string]::IsNullOrWhiteSpace($script:VaultPath)) {
        if (-not [string]::IsNullOrWhiteSpace($env:KNOWLEDGE_HOME)) {
            $script:VaultPath = $env:KNOWLEDGE_HOME
        }
        else {
            $script:VaultPath = 'D:\workspace\LifeOS'
        }
    }
    if (-not [System.IO.Path]::IsPathRooted($script:VaultPath)) {
        throw 'VaultPath / KNOWLEDGE_HOME must be an absolute path.'
    }
    $script:VaultRoot = [System.IO.Path]::GetFullPath($script:VaultPath)
    if (-not (Test-Path -LiteralPath $script:VaultRoot -PathType Container)) {
        throw "Vault not found: $script:VaultRoot"
    }
    foreach ($name in @('Home.md','10_工作','20_生活','30_资料/知识')) {
        if (-not (Test-Path -LiteralPath (Join-Path $script:VaultRoot $name))) {
            throw "Not an existing LifeOS vault: missing $name"
        }
    }
}

function Install-Task {
    $exe = (Get-Process -Id $PID).Path
    $arg = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{0}" -Action Run -VaultPath "{1}"' -f $PSCommandPath, $script:VaultRoot
    $taskAction = New-ScheduledTaskAction -Execute $exe -Argument $arg
    $trigger = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes 10) -RepetitionDuration (New-TimeSpan -Days 3650)
    $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable
    $user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
    $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
    Register-ScheduledTask -TaskName $TaskName -Action $taskAction -Trigger $trigger -Settings $settings -Principal $principal -Description 'Auto-sync AI-maintained LifeOS knowledge Markdown' -Force | Out-Null
    Write-SyncLog "Task installed for logged-in user, every 10 minutes: $TaskName"
}

function Uninstall-Task {
    if ($null -ne (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-SyncLog "Task removed: $TaskName"
    }
    else {
        Write-SyncLog "Task not present: $TaskName"
    }
}

function Sync-LifeOS {
    $actualRoot = Invoke-VaultGit -Arguments @('rev-parse','--show-toplevel')
    $actualRoot = [IO.Path]::GetFullPath($actualRoot).TrimEnd([char[]]@('\','/'))
    if ($actualRoot -ine $script:VaultRoot.TrimEnd([char[]]@('\','/'))) {
        throw 'VaultPath must point to LifeOS Git repository root.'
    }
    $branch = Invoke-VaultGit -Arguments @('symbolic-ref','--quiet','--short','HEAD')
    $remote = Invoke-VaultGit -Arguments @('config','--get',"branch.$branch.remote")
    $mergeRef = Invoke-VaultGit -Arguments @('config','--get',"branch.$branch.merge")
    if ($remote -eq '.' -or $mergeRef -ne "refs/heads/$branch") {
        throw 'Branch must track a same-named remote branch, e.g. master -> origin/master.'
    }
    $staged = Invoke-VaultGit -Arguments @('diff','--cached','--name-only')
    if ($staged.Length -gt 0) {
        Write-SyncLog 'Skip: pre-existing staged changes. Manual intervention required.'
        return
    }
    $unmerged = Invoke-VaultGit -Arguments @('diff','--name-only','--diff-filter=U')
    if ($unmerged.Length -gt 0) {
        Write-SyncLog 'Skip: unresolved Git conflict.'
        return
    }

    Invoke-VaultGit -Arguments @('fetch','--quiet',$remote,$branch) | Out-Null
    $divergence = Invoke-VaultGit -Arguments @('rev-list','--left-right','--count','HEAD...@{upstream}')
    if ($divergence -notmatch '^\s*(\d+)\s+(\d+)\s*$') {
        throw "Cannot parse upstream divergence: $divergence"
    }
    $ahead = [int]$Matches[1]
    $behind = [int]$Matches[2]
    $status = Invoke-VaultGit -Arguments @('status','--porcelain=v1','--untracked-files=all')

    if ($ahead -gt 0 -or $behind -gt 0) {
        if ($behind -eq 0 -and $ahead -eq 1 -and (Test-Path -LiteralPath $PendingFile)) {
            $ownCommit = (Get-Content -LiteralPath $PendingFile -Raw).Trim()
            $head = Invoke-VaultGit -Arguments @('rev-parse','HEAD')
            if ($head -eq $ownCommit) {
                Invoke-VaultGit -Arguments @('push',$remote,"HEAD:$mergeRef") | Out-Null
                Remove-Item -LiteralPath $PendingFile -Force
                Write-SyncLog "Retried push of own pending commit: $head"
                return
            }
        }
        if ($ahead -eq 0 -and $behind -gt 0 -and $status.Length -eq 0) {
            Invoke-VaultGit -Arguments @('pull','--ff-only','--quiet') | Out-Null
            Write-SyncLog "Fast-forward pulled $behind remote commit(s)."
        }
        else {
            Write-SyncLog "Skip: ahead=$ahead, behind=$behind, or dirty worktree. Manual reconciliation required."
        }
        return
    }

    # Do not silently commit deletions, including one side of a rename.
    $deleted = Invoke-VaultGit -Arguments @('diff','--no-renames','--name-only','--diff-filter=D','HEAD','--',$script:ScopeSpec)
    if ($deleted.Length -gt 0) {
        Write-SyncLog 'Skip: Markdown deletion detected.'
        return
    }
    Invoke-VaultGit -Arguments @('add','-A','--',$script:ScopeSpec) | Out-Null
    $selected = Invoke-VaultGit -Arguments @('diff','--cached','--name-only')
    if ($selected.Length -eq 0) { return }

    $deletedInIndex = Invoke-VaultGit -Arguments @('diff','--cached','--no-renames','--name-only','--diff-filter=D')
    if ($deletedInIndex.Length -gt 0) {
        Undo-AutoStaging
        Write-SyncLog 'Skip: deletion / rename requires manual review.'
        return
    }
    $fileNames = @($selected -split '\r?\n' | Where-Object { $_.Trim().Length -gt 0 })
    if ($fileNames.Count -gt 20) {
        Undo-AutoStaging
        Write-SyncLog "Skip: $($fileNames.Count) files exceeds safety limit of 20."
        return
    }
    $patch = Invoke-VaultGit -Arguments @('diff','--cached','--no-ext-diff','--unified=0','--',$script:ScopeSpec)
    $newLines = @($patch -split '\r?\n' | Where-Object { $_.StartsWith('+') -and -not $_.StartsWith('+++') })
    if ($newLines.Count -gt 1500) {
        Undo-AutoStaging
        Write-SyncLog "Skip: $($newLines.Count) added lines exceeds safety limit of 1500."
        return
    }

    # This is only a heuristic; it does not replace a real secrets scan.
    $suspicious = '(?i)(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|(?:api[_-]?key|access[_-]?token|password|passwd|secret)\s*[:=]\s*\S{12,})'
    foreach ($line in $newLines) {
        if ($line -match $suspicious) {
            Undo-AutoStaging
            Write-SyncLog 'Skip: possible credential in added content (not logged).'
            return
        }
    }

    $message = 'docs(knowledge): 自动同步 {0}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm')
    Invoke-VaultGit -Arguments @('commit','-m',$message) | Out-Null
    $commit = Invoke-VaultGit -Arguments @('rev-parse','HEAD')
    # The marker permits retrying only our own single pending commit after a network failure.
    Set-Content -LiteralPath $PendingFile -Value $commit -Encoding ASCII
    Invoke-VaultGit -Arguments @('push',$remote,"HEAD:$mergeRef") | Out-Null
    Remove-Item -LiteralPath $PendingFile -Force
    Write-SyncLog "Committed + pushed $($fileNames.Count) Markdown file(s): $commit"
}

$mutex = $null
$ownsMutex = $false
try {
    if ($Action -eq 'Uninstall') {
        Uninstall-Task
        return
    }
    Resolve-Vault
    if ($Action -eq 'Install') {
        Install-Task
        return
    }
    if (-not (Test-Path -LiteralPath $LogDirectory)) {
        New-Item -Path $LogDirectory -ItemType Directory -Force | Out-Null
    }
    $mutex = [Threading.Mutex]::new($false, 'Local\LifeOSGitSync')
    $ownsMutex = $mutex.WaitOne(0)
    if (-not $ownsMutex) { return }
    Sync-LifeOS
}
catch {
    Write-SyncLog ('ERROR: ' + $_.Exception.Message)
    exit 1
}
finally {
    if ($null -ne $mutex) {
        if ($ownsMutex) { $mutex.ReleaseMutex() }
        $mutex.Dispose()
    }
}
