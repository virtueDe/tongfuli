# 本地开发环境说明

## 摘要

- Tongfuli 本地开发要求 `Node 20`、`pnpm 8`、`Java 21`、`Python 3.12`。
- 当前机器已安装 `JDK 21` 与 `Python 3.12`，但系统默认 PATH 仍优先指向旧版本。
- 仓库通过 PowerShell 脚本显式切换到项目所需版本，避免污染全局环境。

## 当前已确认的本机路径

- Java 21：`C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot`
- Python 3.12：`C:\Users\MI\AppData\Local\Programs\Python\Python312\python.exe`
- Node：`v20.20.2`
- pnpm：`8.15.7`

## 使用方式

在仓库根目录执行：

```powershell
. .\infra\scripts\use-dev-env.ps1
```

执行后会：

- 设置当前 PowerShell 会话的 `JAVA_HOME`
- 把 Java 21 的 `bin` 放到 PATH 最前面
- 设置 `TONGFULI_PYTHON`

## 验证命令

```powershell
. .\infra\scripts\use-dev-env.ps1
java -version
& $env:TONGFULI_PYTHON --version
```

预期结果：

- `java -version` 输出 21
- `TONGFULI_PYTHON` 输出 3.12.x

## 依赖安装建议

### 前端

```powershell
pnpm install
```

### Python 服务

```powershell
. .\infra\scripts\use-dev-env.ps1
Set-Location .\services\ai-orchestrator
uv venv --python $env:TONGFULI_PYTHON
uv pip install -e .[dev]
```

知识处理服务同理。

### Java 服务

Java 服务当前已声明 Gradle Kotlin DSL 配置，但仓库尚未生成 Gradle Wrapper。建议下一步补 `gradlew`，再执行测试或启动命令。
