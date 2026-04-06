$javaHome = 'C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot'
$pythonExe = 'C:\Users\MI\AppData\Local\Programs\Python\Python312\python.exe'

if (-not (Test-Path $javaHome)) {
  throw "未找到 Java 21 安装目录：$javaHome"
}

if (-not (Test-Path $pythonExe)) {
  throw "未找到 Python 3.12 可执行文件：$pythonExe"
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"
$env:TONGFULI_PYTHON = $pythonExe

Write-Host "Tongfuli 开发环境已加载：" -ForegroundColor Green
Write-Host "  JAVA_HOME=$env:JAVA_HOME"
Write-Host "  TONGFULI_PYTHON=$env:TONGFULI_PYTHON"
