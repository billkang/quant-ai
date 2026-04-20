import { useState } from 'react'

interface Stock {
  code: string
  name: string
  price: number
  change: number
}

export default function Watchlist() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [newCode, setNewCode] = useState('')

  const addStock = () => {
    if (!newCode) return
    // TODO: API call to add stock
    setNewCode('')
  }

  const removeStock = (code: string) => {
    // TODO: API call to remove stock
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">自选股管理</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入股票代码 (如: 600519 或 00700.HK)"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={addStock}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            添加
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">股票</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">现价</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">涨跌</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  暂无自选股，请添加
                </td>
              </tr>
            ) : (
              stocks.map(stock => (
                <tr key={stock.code} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-sm text-gray-500">{stock.code}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{stock.price?.toFixed(2) || '-'}</td>
                  <td className={`px-4 py-3 text-right ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {stock.change?.toFixed(2) || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeStock(stock.code)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}