import { Card, Space, Tabs } from 'antd'
import { AreaChartOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

interface IndicatorItem {
  tradeDate?: string
  macdDif?: number
  macdDea?: number
  macdBar?: number
  rsi6?: number
  rsi12?: number
  rsi24?: number
}

function getMacdOption(history: IndicatorItem[]) {
  if (!history.length) return {}
  const dates = history.map(i => i.tradeDate)
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '8%', height: '60%' },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#64748b' },
    },
    series: [
      {
        name: 'DIF',
        type: 'line',
        data: history.map(i => i.macdDif),
        smooth: true,
        lineStyle: { color: '#0ea5e9', width: 1.5 },
      },
      {
        name: 'DEA',
        type: 'line',
        data: history.map(i => i.macdDea),
        smooth: true,
        lineStyle: { color: '#f59e0b', width: 1.5 },
      },
      {
        name: 'BAR',
        type: 'bar',
        data: history.map(i => i.macdBar),
        itemStyle: {
          color: (params: { value: number }) => (params.value >= 0 ? '#ef4444' : '#22c55e'),
        },
      },
    ],
  }
}

function getRsiOption(history: IndicatorItem[]) {
  if (!history.length) return {}
  const dates = history.map(i => i.tradeDate)
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '8%', height: '60%' },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#64748b' },
    },
    series: [
      {
        name: 'RSI6',
        type: 'line',
        data: history.map(i => i.rsi6),
        smooth: true,
        lineStyle: { color: '#ef4444', width: 1.5 },
      },
      {
        name: 'RSI12',
        type: 'line',
        data: history.map(i => i.rsi12),
        smooth: true,
        lineStyle: { color: '#0ea5e9', width: 1.5 },
      },
      {
        name: 'RSI24',
        type: 'line',
        data: history.map(i => i.rsi24),
        smooth: true,
        lineStyle: { color: '#a855f7', width: 1.5 },
      },
    ],
  }
}

export default function IndicatorCharts({ history }: { history: IndicatorItem[] }) {
  if (!history.length) return null

  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      title={
        <Space>
          <AreaChartOutlined style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600 }}>指标趋势</span>
        </Space>
      }
    >
      <Tabs
        items={[
          {
            key: 'macd',
            label: 'MACD',
            children: <ReactECharts option={getMacdOption(history)} style={{ height: 300 }} />,
          },
          {
            key: 'rsi',
            label: 'RSI',
            children: <ReactECharts option={getRsiOption(history)} style={{ height: 300 }} />,
          },
        ]}
      />
    </Card>
  )
}
