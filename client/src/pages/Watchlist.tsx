import { useState, useEffect } from 'react'
import axios from 'axios'

interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function Watchlist() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [newCode, setNewCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; code: string; name: string }>({
    show: false,
    code: '',
    name: ''
  })

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/stocks/watchlist')
      setStocks(res.data || [])
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const addStock = async () => {
    if (!newCode) return
    try {
      const res = await axios.post(`/api/stocks/watchlist?stock_code=${newCode}`)
      if (res.data.status === 'error') {
        alert(res.data.message || '添加失败')
        return
      }
      setNewCode('')
      await fetchWatchlist()
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        console.error('Failed to add stock:', error)
      }
    }
  }

  const handleDeleteClick = (code: string, name: string) => {
    setDeleteConfirm({ show: true, code, name })
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/stocks/watchlist/${deleteConfirm.code}`)
      setDeleteConfirm({ show: false, code: '', name: '' })
      await fetchWatchlist()
    } catch (error) {
      console.error('Failed to remove stock:', error)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, code: '', name: '' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addStock()
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">自选股管理</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入股票代码 (如: 600519 或 00700)"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={addStock}
            disabled={!newCode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            添加
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">加载中...</div>
        ) : stocks.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            暂无自选股，请添加
          </div>
        ) : (
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
              {stocks.map(stock => (
                <tr key={stock.code} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-sm text-gray-500">{stock.code}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{stock.price?.toFixed(2) || '-'}</td>
                  <td className={`px-4 py-3 text-right ${stock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {stock.changePercent ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteClick(stock.code, stock.name)}
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
              确定要从自选股中删除 <span className="font-medium">{deleteConfirm.name}</span> ({deleteConfirm.code}) 吗？
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