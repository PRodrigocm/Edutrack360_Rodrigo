@echo off
echo Iniciando Ollama...
cd %~dp0\..\ollama
start /B ollama.exe serve
