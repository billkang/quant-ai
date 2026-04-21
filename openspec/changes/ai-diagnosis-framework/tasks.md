# AI 诊断框架实现任务

## 1. 依赖安装

- [ ] 1.1 安装 langchain, langgraph 依赖
- [ ] 1.2 更新 requirements.txt

## 2. LangChain 集成

- [ ] 2.1 创建 AI 服务基类
- [ ] 2.2 实现 DeepSeek/LLM 提供商适配器
- [ ] 2.3 测试基本连接

## 3. LangGraph 工作流

- [ ] 3.1 定义诊断图结构
- [ ] 3.2 实现各分析节点
- [ ] 3.3 实现状态管理
- [ ] 3.4 测试工作流

## 4. 诊断历史

- [ ] 4.1 创建 diagnostic_history 表
- [ ] 4.2 实现 CRUD 操作
- [ ] 4.3 添加历史查询 API

## 5. API 集成

- [ ] 5.1 创建 /api/ai/analyze/v2 端点
- [ ] 5.2 创建 /api/ai/history 端点
- [ ] 5.3 保留向后兼容的旧端点

## 6. 前端更新

- [ ] 6.1 更新 AIAdvice 组件支持新 API
- [ ] 6.2 添加诊断历史展示
- [ ] 6.3 测试完整流程

## 验证步骤

```bash
# 1. 安装依赖后测试
pip list | grep lang

# 2. 测试 AI 服务
curl http://localhost:8000/api/ai/analyze?code=600519

# 3. 测试新版 API  
curl -X POST http://localhost:8000/api/ai/analyze/v2 \
  -H "Content-Type: application/json" \
  -d '{"code": "600519", "dimensions": ["fundamental", "technical"]}'

# 4. 测试历史查询
curl http://localhost:8000/api/ai/history?limit=10

# 5. 前端测试
# 访问 http://localhost:4000/ai-advice
```