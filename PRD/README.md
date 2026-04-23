# Quant AI — PRD 文档目录

> 本文档目录以 `openspec/` 为权威来源，对 Quant AI 量化投资辅助系统进行完整的需求梳理与项目规划。
> 原有 Word 文档（UI设计PRD、开发PRD）保留在同级目录供参考。

---

## 文档结构

| 文件 | 内容 |
|------|------|
| [01-project-overview.md](./01-project-overview.md) | 项目定位、技术栈、数据源、部署与环境变量 |
| [02-main-specs.md](./02-main-specs.md) | 现有主规格汇总（已完成的核心功能） |
| [03-planned-specs.md](./03-planned-specs.md) | 规划中规格（待实现功能） |
| [04-changes-and-tasks.md](./04-changes-and-tasks.md) | 变更计划与实施任务清单（以 openspec/changes/ 为准） |
| [05-architecture.md](./05-architecture.md) | 系统架构与设计决策 |
| [06-ui-design-reference.md](./06-ui-design-reference.md) | UI 设计 PRD 关键要点提取 |

## 项目一句话描述

Quant AI 是一个量化投资辅助系统，基于 AI 大模型提供股票诊断、投资建议、策略回测和市场分析，支持 A 股与港股市场。

## 核心原则

1. **所有计算必须可回放（deterministic）**
2. **禁止使用未来数据**
3. **因子必须时间对齐**
4. **分析结果必须由后端计算**
5. **事件可溯源**
6. **规则可版本化**

## 状态图例

- ✅ 已完成
- 🚧 计划中 / 开发中
- 📋 待排期
