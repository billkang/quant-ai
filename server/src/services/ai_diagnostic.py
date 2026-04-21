from typing import TypedDict, Annotated, Sequence
import operator

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

from src.core.config import settings


class DiagnosticState(TypedDict):
    stock_code: str
    stock_data: dict
    news: list
    fundamental_analysis: str
    technical_analysis: str
    risk_analysis: str
    final_report: str


class AIDiagnosticService:
    def __init__(self):
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL
        self.base_url = "https://api.deepseek.com/v1"
        self._llm = None

    @property
    def llm(self):
        if not self.api_key:
            raise ValueError("AI_API_KEY not configured")
        if self._llm is None:
            self._llm = ChatOpenAI(
                model=self.model,
                api_key=self.api_key,
                base_url=self.base_url,
                temperature=0.7,
            )
        return self._llm

    def create_diagnostic_graph(self):
        workflow = StateGraph(DiagnosticState)

        workflow.add_node("fetch_data", self.fetch_data_node)
        workflow.add_node("fundamental", self.fundamental_node)
        workflow.add_node("technical", self.technical_node)
        workflow.add_node("risk", self.risk_node)
        workflow.add_node("synthesize", self.synthesize_node)

        workflow.set_entry_point("fetch_data")
        workflow.add_edge("fetch_data", "fundamental")
        workflow.add_edge("fetch_data", "technical")
        workflow.add_edge("fetch_data", "risk")
        workflow.add_edge("fundamental", "synthesize")
        workflow.add_edge("technical", "synthesize")
        workflow.add_edge("risk", "synthesize")
        workflow.add_edge("synthesize", END)

        return workflow.compile()

    def fetch_data_node(self, state: DiagnosticState) -> dict:
        return {"stock_data": state.get("stock_data", {}), "news": state.get("news", [])}

    def fundamental_node(self, state: DiagnosticState) -> dict:
        stock = state.get("stock_data", {})
        prompt = f"""请分析 {stock.get('name')} ({stock.get('code')}) 的基本面:

- 当前价格: {stock.get('price')}
- 涨跌: {stock.get('change', 0)} ({stock.get('changePercent', 0)}%)

请从以下角度分析:
1. 公司概况及行业地位
2. 营收和利润趋势
3. 估值分析 (市盈率、市净率)
4. 基本面优劣势

请用简洁的中文回答。"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return {"fundamental_analysis": response.content}
        except Exception as e:
            return {"fundamental_analysis": f"基本面分析失败: {str(e)}"}

    def technical_node(self, state: DiagnosticState) -> dict:
        stock = state.get("stock_data", {})
        prompt = f"""请分析 {stock.get('name')} ({stock.get('code')}) 的技术面:

- 当前价格: {stock.get('price')}
- 涨跌幅: {stock.get('changePercent', 0)}%

请从以下角度分析:
1. 短期趋势 (5日、10日均线)
2. 技术指标 (MACD、RSI)
3. 支撑位和压力位
4. 技术面建议

请用简洁的中文回答。"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return {"technical_analysis": response.content}
        except Exception as e:
            return {"technical_analysis": f"技术面分析失败: {str(e)}"}

    def risk_node(self, state: DiagnosticState) -> dict:
        stock = state.get("stock_data", {})
        prompt = f"""请评估 {stock.get('name')} ({stock.get('code')}) 的风险:

- 当前价格: {stock.get('price')}
- 涨跌幅: {stock.get('changePercent', 0)}%

请从以下角度评估:
1. 市场风险
2. 行业风险
3. 公司风险
4. 风险等级建议 (低/中/高)

请用简洁的中文回答。"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return {"risk_analysis": response.content}
        except Exception as e:
            return {"risk_analysis": f"风险评估失败: {str(e)}"}

    def synthesize_node(self, state: DiagnosticState) -> dict:
        fundamental = state.get("fundamental_analysis", "")
        technical = state.get("technical_analysis", "")
        risk = state.get("risk_analysis", "")

        prompt = f"""请综合以下分析，给出最终投资建议:

===== 基本面分析 =====
{fundamental}

===== 技术面分析 =====
{technical}

===== 风险评估 =====
{risk}

请给出:
1. 综合评级 (买入/持有/卖出)
2. 目标价位建议
3. 风险提示

请用简洁的中文回答。"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return {"final_report": response.content}
        except Exception as e:
            return {"final_report": f"综合分析失败: {str(e)}"}

    def analyze(self, stock_code: str, stock_data: dict, news: list = []) -> str:
        if not self.api_key:
            return "AI API 未配置，请在环境变量中设置 AI_API_KEY"

        try:
            graph = self.create_diagnostic_graph()
            initial_state = {
                "stock_code": stock_code,
                "stock_data": stock_data,
                "news": news,
                "fundamental_analysis": "",
                "technical_analysis": "",
                "risk_analysis": "",
                "final_report": "",
            }
            result = graph.invoke(initial_state)
            return result.get("final_report", "分析结果生成失败")
        except Exception as e:
            return f"分析失败: {str(e)}"


diagnostic_service = AIDiagnosticService()