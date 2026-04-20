
import httpx

from src.core.config import settings


class AIService:
    def __init__(self):
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL
        self.base_url = "https://api.deepseek.com/v1"

    def analyze_stock(self, stock_data: dict, news: list) -> str:
        if not self.api_key:
            return "AI API 未配置，请在环境变量中设置 AI_API_KEY"

        prompt = f"""请分析以下股票:
股票信息: {stock_data.get('name')} ({stock_data.get('code')})
当前价格: {stock_data.get('price')}
涨跌幅: {stock_data.get('changePercent')}%
最新新闻:
{chr(10).join([f"- {n.get('title', '')}" for n in news[:5]])}

请从基本面、技术面、资金面三个角度给出分析和建议。"""

        try:
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=60,
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                return f"分析失败: {response.text}"
        except Exception as e:
            return f"分析失败: {str(e)}"

    def answer_question(self, question: str, context: dict) -> str:
        if not self.api_key:
            return "AI API 未配置"

        prompt = f"""根据以下上下文信息回答用户问题:
{context}

用户问题: {question}"""

        try:
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=60,
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                return f"回答失败: {response.text}"
        except Exception as e:
            return f"回答失败: {str(e)}"


ai_service = AIService()
