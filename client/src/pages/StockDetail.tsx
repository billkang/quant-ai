import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { createChart, IChartApi } from 'lightweight-charts'

interface StockData {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  volume: number
}

interface KLine {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export default function StockDetail() {
  const { code } = useParams<{ code: string }>()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [stock, setStock] = useState<StockData | null>(null)
  const [klines, setKlines] = useState<KLine[]>([])
  const [period, setPeriod] = useState('daily')

  useEffect(() => {
    if (!code) return

    fetch(`/api/stocks/${code}`)
      .then(res => res.json())
      .then(data => setStock(data))
      .catch(() => setStock(null))

    fetch(`/api/stocks/${code}/kline?period=${period}`)
      .then(res => res.json())
      .then(data => {
        setKlines(data)
        renderChart(data)
      })
      .catch(() => setKlines([]))
  }, [code, period])

  const renderChart = (data: KLine[]) => {
    if (!chartContainerRef.current || data.length === 0) return

    if (chartRef.current) {
      chartRef.current.remove()
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
    })

    const candlestickSeries = chart.addCandlestickSeries()
    candlestickSeries.setData(data.map(d => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })))

    chartRef.current = chart
  }

  if (!stock) {
    return <div className="text-gray-500">加载中...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{stock.name}</h1>
        <div className="text-gray-500">{stock.code}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">现价</div>
          <div className="text-xl font-bold">{stock.price?.toFixed(2) || '-'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">涨跌</div>
          <div className={`text-xl font-bold ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {stock.change?.toFixed(2) || '-'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">涨跌幅</div>
          <div className={`text-xl font-bold ${stock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {stock.changePercent ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%` : '-'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">成交量</div>
          <div className="text-xl font-bold">{(stock.volume / 100000000).toFixed(2)}亿</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">K线图</h2>
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-sm ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                {p === 'daily' ? '日线' : p === 'weekly' ? '周线' : '月线'}
              </button>
            ))}
          </div>
        </div>
        <div ref={chartContainerRef} className="w-full" />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-4">技术指标</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">MA5</div>
            <div className="font-medium">-</div>
          </div>
          <div>
            <div className="text-gray-500">MA10</div>
            <div className="font-medium">-</div>
          </div>
          <div>
            <div className="text-gray-500">MA20</div>
            <div className="font-medium">-</div>
          </div>
          <div>
            <div className="text-gray-500">MACD</div>
            <div className="font-medium">-</div>
          </div>
        </div>
      </div>
    </div>
  )
}