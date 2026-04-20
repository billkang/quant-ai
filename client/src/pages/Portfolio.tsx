import { useState } from 'react'

interface Position {
  code: string
  name: string
  quantity: number
  costPrice: number
  currentPrice: number
  profit: number
  profitPercent: number
}

export default function Portfolio() {
  const [positions, setPositions] = useState<Position[]>([])
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">持仓管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">持仓市值</div>
          <div className="text-2xl font-bold">¥ 0.00</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">持仓盈亏</div>
          <div className="text-2xl font-bold text-green-600">+0.00</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">盈亏比例</div>
          <div className="text-2xl font-bold text-green-600">+0.00%</div>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          记录交易
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="股票代码"
              className="border rounded px-3 py-2 col-span-2 md:col-span-1"
            />
            <select className="border rounded px-3 py-2">
              <option value="buy">买入</option>
              <option value="sell">卖出</option>
            </select>
            <input
              type="number"
              placeholder="数量"
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="价格"
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 border rounded"
            >
              取消
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              保存
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">股票</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">持仓量</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">成本价</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">现价</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">盈亏</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">盈亏比</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  暂无持仓记录
                </td>
              </tr>
            ) : (
              positions.map(pos => (
                <tr key={pos.code} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{pos.name}</div>
                    <div className="text-sm text-gray-500">{pos.code}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{pos.quantity}</td>
                  <td className="px-4 py-3 text-right">{pos.costPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{pos.currentPrice.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right ${pos.profit >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {pos.profit.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right ${pos.profitPercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {pos.profitPercent >= 0 ? '+' : ''}{pos.profitPercent.toFixed(2)}%
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