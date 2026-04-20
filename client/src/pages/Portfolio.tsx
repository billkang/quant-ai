import { useState, useEffect } from 'react'
import axios from 'axios'

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
  const [data, setData] = useState<{
    positions: Position[]
    totalValue: number
    totalCost: number
    totalProfit: number
  }>({
    positions: [],
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0
  })
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    stock_code: '',
    stock_name: '',
    type: 'buy',
    quantity: '',
    cost_price: ''
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; code: string; name: string }>({
    show: false,
    code: '',
    name: ''
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/portfolio')
      setData(res.data || { positions: [], totalValue: 0, totalCost: 0, totalProfit: 0 })
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.stock_code || !form.quantity || !form.cost_price) return

    try {
      await axios.post('/api/portfolio', {
        stock_code: form.stock_code,
        stock_name: form.stock_name || form.stock_code,
        quantity: parseInt(form.quantity),
        cost_price: parseFloat(form.cost_price)
      })
      setShowAdd(false)
      setForm({ stock_code: '', stock_name: '', type: 'buy', quantity: '', cost_price: '' })
      await fetchPortfolio()
    } catch (error) {
      console.error('Failed to add position:', error)
    }
  }

  const handleDeleteClick = (code: string, name: string) => {
    setDeleteConfirm({ show: true, code, name })
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/portfolio/${deleteConfirm.code}`)
      setDeleteConfirm({ show: false, code: '', name: '' })
      await fetchPortfolio()
    } catch (error) {
      console.error('Failed to delete position:', error)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, code: '', name: '' })
  }

  const totalProfitPercent = data.totalCost > 0
    ? (data.totalProfit / data.totalCost * 100)
    : 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">持仓管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">持仓市值</div>
          <div className="text-2xl font-bold">¥ {data.totalValue.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">持仓盈亏</div>
          <div className={`text-2xl font-bold ${data.totalProfit >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {data.totalProfit >= 0 ? '+' : ''}¥ {data.totalProfit.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">盈亏比例</div>
          <div className={`text-2xl font-bold ${totalProfitPercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
          </div>
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
              value={form.stock_code}
              onChange={e => setForm({ ...form, stock_code: e.target.value })}
              className="border rounded px-3 py-2 col-span-2 md:col-span-1"
            />
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="buy">买入</option>
              <option value="sell">卖出</option>
            </select>
            <input
              type="number"
              placeholder="数量"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="价格"
              value={form.cost_price}
              onChange={e => setForm({ ...form, cost_price: e.target.value })}
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
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">加载中...</div>
        ) : data.positions.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            暂无持仓记录
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">股票</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">持仓量</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">成本价</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">现价</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">盈亏</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">盈亏比</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.positions.map(pos => (
                <tr key={pos.code} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{pos.name}</div>
                    <div className="text-sm text-gray-500">{pos.code}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{pos.quantity}</td>
                  <td className="px-4 py-3 text-right">¥{pos.costPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">¥{pos.currentPrice.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right ${pos.profit >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {pos.profit >= 0 ? '+' : ''}¥{pos.profit.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right ${pos.profitPercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {pos.profitPercent >= 0 ? '+' : ''}{pos.profitPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteClick(pos.code, pos.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 删除确认弹框 */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除持仓 <span className="font-medium">{deleteConfirm.name}</span> ({deleteConfirm.code}) 吗？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}