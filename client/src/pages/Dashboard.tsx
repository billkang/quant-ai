import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function Dashboard() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stocks/watchlist')
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(() => setStocks([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">市场概览</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">自选股数</div>
          <div className="text-2xl font-bold">{stocks.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">今日涨跌幅</div>
          <div className="text-2xl font-bold text-green-600">
            +1.23%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">AI 建议</div>
          <div className="text-2xl font-bold text-blue-600">
            3 只关注
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">自选股行情</h2>
      {loading ? (
        <div className="text-gray-500">加载中...</div>
      ) : stocks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">暂无自选股</p>
          <Link to="/watchlist" className="text-blue-600 hover:underline">
            去添加自选股 →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">股票</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">现价</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">涨跌</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">涨跌幅</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(stock => (
                <tr key={stock.code} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/stock/${stock.code}`} className="font-medium hover:text-blue-600">
                      {stock.name}
                    </Link>
                    <div className="text-sm text-gray-500">{stock.code}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{stock.price?.toFixed(2) || '-'}</td>
                  <td className={`px-4 py-3 text-right ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {stock.change?.toFixed(2) || '-'}
                  </td>
                  <td className={`px-4 py-3 text-right ${stock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {stock.changePercent ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}