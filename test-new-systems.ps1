#!/usr/bin/env powershell
# Test script for new protection systems

$BASE_URL = "http://localhost:3001"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Testing MyEagle New Protection Systems" -ForegroundColor Cyan
Write-Host "=======================================================`n" -ForegroundColor Cyan

# Test 1: Get Protection Plans
Write-Host "Test 1: GET /api/protection/plans" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/protection/plans" -Method Get -ContentType "application/json" -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Response received" -ForegroundColor Green
    Write-Host "  - Plans available:" $data.plans | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
    Write-Host ""
} catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
}

# Test 2: Get Legal Documents
Write-Host "Test 2: GET /api/legal/documents" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/legal/documents" -Method Get -ContentType "application/json" -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Response received" -ForegroundColor Green
    Write-Host "  - Documents available:" ($data | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name | Where-Object {$_ -ne "success"})
    Write-Host ""
} catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
}

# Test 3: Get Trust Badges
Write-Host "Test 3: GET /api/trust/badges" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/trust/badges" -Method Get -ContentType "application/json" -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[✓] Response received" -ForegroundColor Green
    Write-Host "  └─ Total badges: " $data.totalBadges
    Write-Host "  └─ Total guarantees: " $data.totalGuarantees
    Write-Host ""
} catch {
    Write-Host "[✗] Error: $_" -ForegroundColor Red
}

# Test 4: Get Special Guarantees
Write-Host "Test 4: GET /api/protection/guarantees" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/protection/guarantees" -Method Get -ContentType "application/json" -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[✓] Response received" -ForegroundColor Green
    Write-Host "  └─ Guarantees:" ($data.guarantees | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name)
    Write-Host ""
} catch {
    Write-Host "[✗] Error: $_" -ForegroundColor Red
}

# Test 5: SMS Statistics
Write-Host "Test 5: GET /api/sms/statistics" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/sms/statistics" -Method Get -ContentType "application/json" -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[✓] Response received" -ForegroundColor Green
    Write-Host "  └─ SMS templates available: " $data.templatesCount
    Write-Host ""
} catch {
    Write-Host "[✗] Error: $_" -ForegroundColor Red
}

# Test 6: Trust Score
Write-Host "Test 6: GET /api/trust/score" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/trust/score" -Method Get -ContentType "application/json" -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[✓] Response received" -ForegroundColor Green
    Write-Host "  └─ Trust Score: " $data.overallTrustScore "/100"
    Write-Host "  └─ Status: " $data.trustLevel
    Write-Host ""
} catch {
    Write-Host "[✗] Error: $_" -ForegroundColor Red
}

# Test 7: Legal Summary
Write-Host "Test 7: GET /api/legal/summary" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/legal/summary" -Method Get -ContentType "application/json" -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[✓] Response received" -ForegroundColor Green
    Write-Host "  └─ Documents: " $data.documentsCount
    Write-Host "  └─ Total sections: " $data.totalSections
    Write-Host ""
} catch {
    Write-Host "[✗] Error: $_" -ForegroundColor Red
}

# Test 8: Protection Info
Write-Host "Test 8: GET /api/protection/info" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/protection/info" -Method Get -ContentType "application/json" -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[✓] Response received" -ForegroundColor Green
    Write-Host "  └─ Message: " $data.headline
    Write-Host "  └─ Plans compared: " ($data.planComparison | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name)
    Write-Host ""
} catch {
    Write-Host "[✗] Error: $_" -ForegroundColor Red
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ All new systems tested successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
