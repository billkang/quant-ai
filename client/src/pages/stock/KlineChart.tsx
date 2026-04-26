import { Card, Button, Space } from 'antd'
import { StockOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

interface KLineData {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
}

interface Props {
  klines: KLineData[]
  period: string
  onPeriodChange: (p: string) => void
}

function getChartOption(klines: KLineData[]) {
  if (!klines.length) return {}
  const dates = klines.map(k => k.date)
  const opens = klines.map(k => k.open)
  const closes = klines.map(k => k.close)
  const ma5 = klines.map((_, i) => {
    if (i < 4) return null
    return klines.slice(i - 4, i + 1).reduce((s, k) => s + k.close, 0) / 5
  })
  const ma20 = klines.map((_, i) => {
    if (i < 19) return null
    return klines.slice(i - 19, i + 1).reduce((s, k) => s + k.close, 0) / 20
  })
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['K线', 'MA5', 'MA20'], textStyle: { color: '#94a3b8' } },
    grid: [
      { left: '10%', right: '8%', height: '50%' },
      { left: '10%', right: '8%', top: '68%', height: '16%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        gridIndex: 0,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#64748b' },
      },
      {
        type: 'category',
        data: dates,
        gridIndex: 1,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#64748b' },
      },
    ],
    yAxis: [
      {
        scale: true,
        gridIndex: 0,
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { color: '#64748b' },
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { color: '#64748b' },
      },
    ],
    dataZoom: [{ type: 'inside', xAxisIndex: [0, 1], start: 60, end: 100 }],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: klines.map(k => [k.open, k.close, k.low, k.high]),
        itemStyle: {
          color: '#ef4444',
          color0: '#22c55e',
          borderColor: '#ef4444',
          borderColor0: '#22c55e',
        },
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        lineStyle: { color: '#0ea5e9', width: 1.5 },
        symbol: 'none',
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        lineStyle: { color: '#a855f7', width: 1.5 },
        symbol: 'none',
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: klines.map((k, i) => ({
          value: k.volume,
          itemStyle: { color: closes[i] >= opens[i] ? '#ef4444' : '#22c55e' },
        })),
      },
    ],
  }
}

export default function KlineChart({ klines, period, onPeriodChange }: Props) {
  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <StockOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>K线图</span>
          </Space>
          <Space>
            {['daily', 'weekly', 'monthly'].map(p => (
              <Button
                key={p}
                size="small"
                type={period === p ? 'primary' : 'default'}
                onClick={() => onPeriodChange(p)}
                style={{ borderRadius: 6, minWidth: 56 }}
              >
                {p === 'daily' ? '日线' : p === 'weekly' ? '周线' : '月线'}
              </Button>
            ))}
          </Space>
        </div>
      }
    >
      <ReactECharts option={getChartOption(klines)} style={{ height: 480 }} />
    </Card>
  )
}
