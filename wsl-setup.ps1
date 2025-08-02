# WSL Network Setup & Diagnostic Tool for Gaussian Mixture App
# Run this in PowerShell as Administrator - handles everything in one script

param(
    [switch]$Diagnose,
    [switch]$Setup,
    [int]$Port = 3100
)

Write-Host "=== WSL Network Tool for Gaussian Mixture App ===" -ForegroundColor Cyan
Write-Host "Usage: .\wsl-setup.ps1 [-Setup] [-Diagnose] [-Port 3100]" -ForegroundColor Gray

if (-not $Setup -and -not $Diagnose) {
    $Setup = $true  # Default to setup mode
}

# Get WSL IP
$wslIP = (wsl hostname -I).Split()[0].Trim()
Write-Host "WSL IP: $wslIP" -ForegroundColor Yellow

if ($Diagnose) {
    Write-Host "`n=== DIAGNOSTIC MODE ===" -ForegroundColor Cyan
    
    # Check WSL status
    Write-Host "`n1. WSL Status:" -ForegroundColor Yellow
    try { wsl --version } catch { Write-Host "WSL version info not available" -ForegroundColor Gray }
    
    # Test app running
    Write-Host "`n2. App Status:" -ForegroundColor Yellow
    $appCheck = wsl ps aux | Select-String "next dev"
    if ($appCheck) {
        Write-Host "✓ Next.js app is running" -ForegroundColor Green
        Write-Host $appCheck -ForegroundColor Gray
    } else {
        Write-Host "✗ Next.js app not found" -ForegroundColor Red
    }
    
    # Test connectivity
    Write-Host "`n3. Connectivity Tests:" -ForegroundColor Yellow
    $pingTest = Test-Connection -ComputerName $wslIP -Count 1 -Quiet
    Write-Host "WSL Ping: $pingTest" -ForegroundColor $(if($pingTest){"Green"}else{"Red"})
    
    foreach ($testPort in @(3000,3001,3002,3003,3100,8080)) {
        try {
            $portTest = Test-NetConnection -ComputerName $wslIP -Port $testPort -WarningAction SilentlyContinue -InformationLevel Quiet
            Write-Host "Port $testPort`: $($portTest.TcpTestSucceeded)" -ForegroundColor $(if($portTest.TcpTestSucceeded){"Green"}else{"Red"})
        } catch {
            Write-Host "Port $testPort`: Failed" -ForegroundColor Red
        }
    }
    
    # Show current port forwarding
    Write-Host "`n4. Current Port Forwarding:" -ForegroundColor Yellow
    $proxies = netsh interface portproxy show all
    if ($proxies -match "Listen") {
        Write-Host $proxies -ForegroundColor Green
    } else {
        Write-Host "No port forwarding rules" -ForegroundColor Gray
    }
}

if ($Setup) {
    Write-Host "`n=== COMPLETE SETUP MODE (Port $Port) ===" -ForegroundColor Cyan
    
    # Step 1: Clean existing rules
    Write-Host "`n1. Cleaning existing configurations..." -ForegroundColor Yellow
    netsh interface portproxy delete v4tov4 listenport=$Port listenaddress=0.0.0.0 2>$null
    Get-NetFirewallRule -DisplayName "WSL-GMM*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue
    Write-Host "✓ Cleaned up existing rules" -ForegroundColor Green
    
    # Step 2: Add port forwarding
    Write-Host "`n2. Setting up port forwarding..." -ForegroundColor Yellow
    $result = netsh interface portproxy add v4tov4 listenport=$Port listenaddress=0.0.0.0 connectport=$Port connectaddress=$wslIP
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Port forwarding added for $Port" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to add port forwarding" -ForegroundColor Red
    }
    
    # Step 3: Initial connection test
    Write-Host "`n3. Initial connection test..." -ForegroundColor Yellow
    Start-Sleep 2
    $initialTest = $false
    try {
        $test = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
        $initialTest = $test.TcpTestSucceeded
    } catch { }
    
    if ($initialTest) {
        Write-Host "✓ Connection works immediately!" -ForegroundColor Green
    } else {
        Write-Host "✗ Connection blocked - testing firewall" -ForegroundColor Yellow
        
        # Step 4: Firewall test and fix
        Write-Host "`n4. Testing Windows Firewall..." -ForegroundColor Yellow
        
        # Store original firewall states
        $originalStates = @{}
        try {
            $profiles = Get-NetFirewallProfile
            foreach ($profile in $profiles) {
                $originalStates[$profile.Name] = $profile.Enabled
            }
        } catch { }
        
        # Temporarily disable firewall for test
        try {
            Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
            Write-Host "  Firewall temporarily disabled for test..." -ForegroundColor Gray
            
            Start-Sleep 2
            $firewallTest = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
            
            # Restore firewall immediately
            foreach ($profileName in $originalStates.Keys) {
                Set-NetFirewallProfile -Name $profileName -Enabled $originalStates[$profileName]
            }
            Write-Host "  Firewall restored" -ForegroundColor Gray
            
            if ($firewallTest.TcpTestSucceeded) {
                Write-Host "✓ Connection works with firewall disabled - adding firewall rules" -ForegroundColor Green
                
                # Add comprehensive firewall rules
                try {
                    # Inbound rule
                    New-NetFirewallRule -DisplayName "WSL-GMM-$Port-In" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -Profile Any -Force | Out-Null
                    # Outbound rule
                    New-NetFirewallRule -DisplayName "WSL-GMM-$Port-Out" -Direction Outbound -Protocol TCP -LocalPort $Port -Action Allow -Profile Any -Force | Out-Null
                    # Additional localhost rule
                    New-NetFirewallRule -DisplayName "WSL-GMM-$Port-Local" -Direction Inbound -Protocol TCP -LocalPort $Port -RemoteAddress "127.0.0.1","::1" -Action Allow -Profile Any -Force | Out-Null
                    
                    Write-Host "✓ Firewall rules added" -ForegroundColor Green
                } catch {
                    Write-Host "⚠ Could not add firewall rules automatically" -ForegroundColor Yellow
                    Write-Host "  Manual step needed: Add firewall rule for port $Port" -ForegroundColor Gray
                }
            } else {
                Write-Host "✗ Connection fails even with firewall disabled" -ForegroundColor Red
            }
        } catch {
            Write-Host "⚠ Could not test firewall (need admin rights)" -ForegroundColor Yellow
        }
    }
    
    # Step 5: Final connection test
    Write-Host "`n5. Final connection test..." -ForegroundColor Yellow
    Start-Sleep 3
    try {
        $finalTest = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
        if ($finalTest.TcpTestSucceeded) {
            Write-Host "✓ SUCCESS! Connection works" -ForegroundColor Green
        } else {
            Write-Host "✗ Connection still fails" -ForegroundColor Red
        }
    } catch {
        Write-Host "⚠ Could not test final connection" -ForegroundColor Yellow
    }
    
    # Step 6: Show results and instructions
    Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Green
    Write-Host "Try accessing the app at:" -ForegroundColor White
    Write-Host "• http://localhost:$Port" -ForegroundColor Yellow
    Write-Host "• http://127.0.0.1:$Port" -ForegroundColor Yellow
    Write-Host "• http://$wslIP`:$Port (direct WSL)" -ForegroundColor Yellow
    
    if (-not $finalTest -or -not $finalTest.TcpTestSucceeded) {
        Write-Host "`n⚠ If still not working, try:" -ForegroundColor Yellow
        Write-Host "1. Manual firewall: Windows Security -> Advanced -> Inbound Rules -> Allow TCP $Port" -ForegroundColor Gray
        Write-Host "2. WSL restart: wsl --shutdown (wait 10s) then restart app" -ForegroundColor Gray
        Write-Host "3. Different browser or incognito mode" -ForegroundColor Gray
        Write-Host "4. Run: .\wsl-setup.ps1 -Diagnose" -ForegroundColor Gray
    }
    
    # Show firewall rules created
    Write-Host "`nFirewall rules created:" -ForegroundColor Gray
    try {
        Get-NetFirewallRule -DisplayName "WSL-GMM*" | Select-Object DisplayName, Direction, Action, Enabled | Format-Table -AutoSize
    } catch { }
}

# Show current status
Write-Host "`nCurrent port forwarding rules:" -ForegroundColor Gray
netsh interface portproxy show all

Read-Host "`nPress Enter to exit"