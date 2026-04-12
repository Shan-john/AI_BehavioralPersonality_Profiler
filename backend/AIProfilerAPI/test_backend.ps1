$headers = @{"Content-Type" = "application/json"}
$baseUri = "http://localhost:5233/api"

Write-Host "--- Testing Registration ---"
$newUser = @{
    Name = "TestUser"
    Email = "testuser_test@example.com"
    Password = "Password123"
} | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$baseUri/user/register" -Method Post -Headers $headers -Body $newUser
    Write-Host "Register result: $($res | ConvertTo-Json -Depth 5)"
} catch {
    Write-Host "Register failed (expected if user exists): $_"
}

Write-Host "`n--- Testing Login ---"
$login = @{
    Email = "testuser_test@example.com"
    Password = "Password123"
} | ConvertTo-Json
$userId = 1
try {
    $res = Invoke-RestMethod -Uri "$baseUri/user/login" -Method Post -Headers $headers -Body $login
    Write-Host "Login result: $($res | ConvertTo-Json -Depth 5)"
    $userId = $res.userId
} catch {
    Write-Host "Login failed: $_"
}

Write-Host "`n--- Testing AI Chat Flow ---"
for ($i = 0; $i -le 15; $i++) {
    $chatBody = @{
        QuestionCount = $i
        Answer = "This is my answer to question $i"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUri/ai/chat?userId=$userId" -Method Post -Headers $headers -Body $chatBody
    Write-Host "Step $i result type: $($res.type)"
    if ($res.type -eq "result") {
        Write-Host "Result Data Received: $($res.data.Substring(0, [math]::Min($res.data.Length, 150)))..."
    } else {
        Write-Host "Question Received: $($res.data.Substring(0, [math]::Min($res.data.Length, 100)))..."
    }
}

Write-Host "`n--- Testing Report ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUri/report/$userId" -Method Get
    Write-Host "Reports found: $($res.Count)"
} catch {
    Write-Host "Report fetch failed: $_"
}
