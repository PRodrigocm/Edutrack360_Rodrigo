# PowerShell script to restart Ollama

# Stop Ollama process if running
Get-Process -Name "ollama" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment to ensure process is stopped
Start-Sleep -Seconds 2

# Start Ollama server
Start-Process -FilePath ".\ollama\ollama.exe" -ArgumentList "serve" -NoNewWindow
