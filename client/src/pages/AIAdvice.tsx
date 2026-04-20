import { useState } from 'react'

export default function AIAdvice() {
  const [stockCode, setStockCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const analyze = () => {
    if (!stockCode) return
    setLoading(true)
    setResult('')

    fetch(`/api/ai/analyze?code=${stockCode}`)
      .then(res => res.json())
      .then(data => setResult(data.advice))
      .catch(() => setResult('分析失败，请稍后重试'))
      .finally(() => setLoading(false))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI 诊断</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入股票代码"
            value={stockCode}
            onChange={e => setStockCode(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={analyze}
            disabled={loading || !stockCode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '分析中...' : '开始分析'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">AI 诊断结果</h2>
          <div className="prose max-w-none">
            {result.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p>输入股票代码，获取 AI 分析建议</p>
          <p className="text-sm mt-2">系统将结合基本面、技术面、资金面进行分析</p>
        </div>
      )}
    </div>
  )
}