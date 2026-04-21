# AI 诊断框架设计

## 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| AI 框架 | LangChain | 成熟的 LLM 应用框架 |
| 工作流 | LangGraph | 支持 DAG，可视化流程 |
| 模型 | DeepSeek API | 兼容 OpenAI API |

## 架构设计

### LangChain LCEL 诊断链

```
用户输入 → 解析股票代码 → 获取市场数据 → 
LLM分析 → 格式化输出
```

### LangGraph 工作流

```
┌─────────────┐
│   input    │
└─────┬──────┘
      ▼
┌─────────────┐
│ fetch_data  │ ← 获取行情数据
└─────┬──────┘
      ▼
┌─────────────┐
│ fundamental │ ← 基本面分析
└─────┬──────┘
      ▼
┌─────────────┐
│ technical   │ ← 技术面分析
└─────┬──────┘
      ▼
┌─────────────┐
│ risk评估    │ ← 风险评估
└─────┬──────┘
      ▼
┌─────────────┐
│ synthesize  │ ← 综合建议
└─────┬──────┘
      ▼
┌─────────────┐
│   output    │
└─────────────┘
```

## 数据流

1. 用户输入股票代码
2. `fetch_data` 节点获取实时行情、K线、历史数据
3. 并行执行 `fundamental`, `technical`, `risk` 分析
4. `synthesize` 节点综合所有分析结果
5. 输出结构化诊断报告

## 依赖项

```python
langchain>=0.3.0
langchain-openai>=0.2.0
langgraph>=0.2.0
```

## API 变更

### 新增端点

```
POST /api/ai/analyze/v2
Body: { code: string, dimensions?: string[] }
```
- dimensions: 可选分析维度 ["fundamental", "technical", "risk"]

```
GET /api/ai/history
Query: { limit?: number, code?: string }
```

## 状态

⏳ 待实现