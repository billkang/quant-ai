from typing import TypedDict

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph

from src.core.config import settings


class DiagnosticState(TypedDict):
    stock_code: str
    stock_data: dict
    indicators: dict
    fundamentals: dict
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
        return {
            "stock_data": state.get("stock_data", {}),
            "indicators": state.get("indicators", {}),
            "fundamentals": state.get("fundamentals", {}),
            "news": state.get("news", []),
        }

    def fundamental_node(self, state: DiagnosticState) -> dict:
        stock = state.get("stock_data", {})
        fundamentals = state.get("fundamentals", {})
        prompt = f"""请分析 {stock.get("name")} ({stock.get("code")}) 的基本面:

- 当前价格: {stock.get("price")}
- 涨跌: {stock.get("change", 0)} ({stock.get("changePercent", 0)}%)
- PE(TTM): {fundamentals.get("pe_ttm", "N/A")}
- PB: {fundamentals.get("pb", "N/A")}
- ROE: {fundamentals.get("roe", "N/A")}%
- 毛利率: {fundamentals.get("gross_margin", "N/A")}%
- 营收增速: {fundamentals.get("revenue_growth", "N/A")}%
- 负债率: {fundamentals.get("debt_ratio", "N/A")}%

请从以下角度分析:
1. 公司概况及行业地位
2. 营收和利润趋势
3. 估值分析 (PE/PB/ROE水平)
4. 基本面优劣势

请用简洁的中文回答。"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return {"fundamental_analysis": response.content}
        except Exception as e:
            return {"fundamental_analysis": f"基本面分析失败: {str(e)}"}

    def technical_node(self, state: DiagnosticState) -> dict:
        stock = state.get("stock_data", {})
        indicators = state.get("indicators", {})
        ma5 = indicators.get("ma5")
        ma20 = indicators.get("ma20")
        rsi6 = indicators.get("rsi6")
        macd_dif = indicators.get("macd_dif")
        macd_dea = indicators.get("macd_dea")
        boll_upper = indicators.get("boll_upper")
        boll_lower = indicators.get("boll_lower")

        trend = "上行" if ma5 and ma20 and ma5 > ma20 else "下行" if ma5 and ma20 else "未知"
        rsi_status = "超买" if rsi6 and rsi6 > 70 else "超卖" if rsi6 and rsi6 < 30 else "中性"
        macd_signal = (
            "金叉"
            if macd_dif and macd_dea and macd_dif > macd_dea
            else "死叉"
            if macd_dif and macd_dea
            else "中性"
        )
        price = stock.get("price", 0)
        boll_position = "中轨附近"
        if boll_upper and boll_lower and price:
            if price > boll_upper:
                boll_position = "上轨之上 (超买区)"
            elif price < boll_lower:
                boll_position = "下轨之下 (超卖区)"
            else:
                boll_position = "布林带内"

        prompt = f"""请分析 {stock.get("name")} ({stock.get("code")}) 的技术面:

- 当前价格: {price}
- 涨跌幅: {stock.get("changePercent", 0)}%
- MA5: {ma5} | MA20: {ma20} (趋势: {trend})
- RSI(6): {rsi6} (状态: {rsi_status})
- MACD: DIF={macd_dif}, DEA={macd_dea} (信号: {macd_signal})
- 布林带: 股价位于{boll_position}

请从以下角度分析:
1. 短期趋势 (MA5/MA20关系)
2. 技术指标 (MACD/RSI状态)
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
        prompt = f"""请评估 {stock.get("name")} ({stock.get("code")}) 的风险:

- 当前价格: {stock.get("price")}
- 涨跌幅: {stock.get("changePercent", 0)}%

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

    def analyze(
        self,
        stock_code: str,
        stock_data: dict,
        indicators: dict = None,
        fundamentals: dict = None,
        news: list = None,
    ) -> dict:
        if news is None:
            news = []
        if not self.api_key:
            return {
                "fundamental_analysis": "",
                "technical_analysis": "",
                "risk_analysis": "",
                "final_report": "AI API 未配置，请在环境变量中设置 AI_API_KEY",
            }

        try:
            graph = self.create_diagnostic_graph()
            initial_state = {
                "stock_code": stock_code,
                "stock_data": stock_data,
                "indicators": indicators or {},
                "fundamentals": fundamentals or {},
                "news": news,
                "fundamental_analysis": "",
                "technical_analysis": "",
                "risk_analysis": "",
                "final_report": "",
            }
            result = graph.invoke(initial_state)
            return {
                "fundamental_analysis": result.get("fundamental_analysis", ""),
                "technical_analysis": result.get("technical_analysis", ""),
                "risk_analysis": result.get("risk_analysis", ""),
                "final_report": result.get("final_report", "分析结果生成失败"),
            }
        except Exception as e:
            return {
                "fundamental_analysis": "",
                "technical_analysis": "",
                "risk_analysis": "",
                "final_report": f"分析失败: {str(e)}",
            }


diagnostic_service = AIDiagnosticService()
