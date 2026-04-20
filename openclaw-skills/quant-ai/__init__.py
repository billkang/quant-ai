import os
import httpx
from typing import Optional

QUANT_API_URL = os.getenv("QUANT_AI_API_URL", "http://localhost:8000")


async def get_stock_quote(code: str) -> dict:
    """获取股票实时行情"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{QUANT_API_URL}/api/stocks/{code}", timeout=30)
        return response.json()


async def get_stock_news(code: str) -> dict:
    """获取股票新闻"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{QUANT_API_URL}/api/news?symbol={code}", timeout=30)
        return response.json()


async def analyze_stock(code: str) -> dict:
    """AI 分析股票"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{QUANT_API_URL}/api/ai/analyze?code={code}", timeout=60)
        return response.json()


async def get_watchlist() -> dict:
    """获取自选股列表"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{QUANT_API_URL}/api/stocks/watchlist", timeout=30)
        return response.json()


async def get_portfolio() -> dict:
    """获取持仓"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{QUANT_API_URL}/api/portfolio", timeout=30)
        return response.json()


async def ai_chat(question: str) -> dict:
    """AI 问答"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{QUANT_API_URL}/api/ai/chat?question={question}", timeout=60)
        return response.json()


class Tool:
    name = "quant_ai"
    description = "量化投资助手 - 分析A股/港股，获取AI投资建议"

    @staticmethod
    async def get_stock_quote(code: str) -> str:
        """查询股票行情"""
        data = await get_stock_quote(code)
        if not data or not data.get('price'):
            return f"未找到股票 {code} 的行情数据"
        
        return f"""
{data.get('name')} ({data.get('code')})
现价: {data.get('price')}
涨跌: {data.get('change'):+.2f}
涨跌幅: {data.get('changePercent'):+.2f}%
最高: {data.get('high')}
最低: {data.get('low')}
成交量: {data.get('volume', 0):,.0f}
"""

    @staticmethod
    async def get_stock_news(code: str) -> str:
        """查询股票新闻"""
        news = await get_stock_news(code)
        if not news:
            return f"未找到股票 {code} 的相关新闻"
        
        result = f"**{code} 最近新闻:**\n\n"
        for i, item in enumerate(news[:5], 1):
            title = item.get('title', '')[:50]
            result += f"{i}. {title}\n"
        
        return result

    @staticmethod
    async def analyze_stock(code: str) -> str:
        """AI 分析股票"""
        result = await analyze_stock(code)
        return result.get('advice', '分析失败')

    @staticmethod
    async def list_watchlist() -> str:
        """查看自选股"""
        stocks = await get_watchlist()
        if not stocks:
            return "自选股列表为空"
        
        result = "**自选股列表:**\n\n"
        for s in stocks:
            result += f"- {s.get('name')} ({s.get('code')}): {s.get('price')} {s.get('changePercent'):+.2f}%\n"
        
        return result

    @staticmethod
    async def show_portfolio() -> str:
        """查看持仓"""
        data = await get_portfolio()
        positions = data.get('positions', [])
        
        if not positions:
            return "暂无持仓记录"
        
        result = f"**持仓概览:**\n\n"
        result += f"总市值: ¥{data.get('totalValue', 0):,.2f}\n"
        result += f"总盈亏: ¥{data.get('totalProfit', 0):,.2f}\n\n"
        
        for p in positions:
            result += f"- {p.get('name')}: {p.get('quantity')}股 @ {p.get('costPrice')} | 现{p.get('currentPrice')} | {p.get('profitPercent'):+.2f}%\n"
        
        return result

    @staticmethod
    async def chat_with_ai(question: str) -> str:
        """AI 问答"""
        result = await ai_chat(question)
        return result.get('answer', '回答失败')
