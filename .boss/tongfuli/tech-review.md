# Tech Review

## 摘要

- 采用 Java + Python 双栈是按问题边界分治，不是为了堆技术名词。
- 当前环境默认 `java=11`、`python=2.7`，仓库会声明目标版本，但开发环境后续必须补齐。
- 单仓 monorepo 适合当前阶段，过早拆多仓只会增加契约同步和联调成本。
- 第一阶段风险主要集中在剧本解析质量、外部资料治理和本地开发环境不一致。

## 结论

- 继续采用单仓模式
- Java 主业务声明使用 21 工具链
- Python 服务声明使用 3.12
- 前端使用 pnpm workspace + Turborepo 管理
- `.boss/tongfuli` 作为当前 feature 的编排产物目录

## 风险

- 本地未检测到 JDK 21
- 本地未检测到 Python 3
- boss 自带 bash 脚本在当前 Windows 沙箱不可直接运行

## 建议

- 代码骨架先落地，环境升级随后补齐
- CI 中强制校验 Java/Python 目标版本
- 所有接口变更以 `contracts/` 为唯一真源
