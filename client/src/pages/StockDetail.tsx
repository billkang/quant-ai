import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Card, Row, Col, Statistic, Button, Space, Spin, Tag, Descriptions, Tabs } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, LeftOutlined } from '@ant-design/icons'
import type { DescriptionsProps } from 'antd'
import { quantApi } from '../services/api'

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
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
}

interface Indicators {
  ma5?: number
  ma10?: number
  ma20?: number
  ma60?: number
  rsi6?: number
  rsi12?: number
  rsi24?: number
  macdDif?: number
  macdDea?: number
  macdBar?: number
  kdjK?: number
  kdjD?: number
  kdjJ?: number
  bollUpper?: number
  bollMid?: number
  bollLower?: number
  volMa5?: number
  volMa10?: number
}

interface Fundamentals {
  peTtm?: number
  pb?: number
  roe?: number
  grossMargin?: number
  revenueGrowth?: number
  debtRatio?: number
}

export default function StockDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [stock, setStock] = useState<StockData | null>(null)
  const [klines, setKlines] = useState<KLine[]>([])
  const [indicators, setIndicators] = useState<Indicators | null>(null)
  const [indicatorHistory, setIndicatorHistory] = useState<Indicators[]>([])
  const [fundamentals, setFundamentals] = useState<Fundamentals | null>(null)
  const [period, setPeriod] = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    fetch(`/api/stocks/${code}`)
      .then(res => res.json())
      .then(data => setStock(data))
      .finally(() => setLoading(false))
  }, [code])

  useEffect(() => {
    if (!code) return
    const periodMap: Record<string, string> = {
      daily: '6mo',
      weekly: '6mo',
      monthly: '1y',
    }
    fetch(`/api/stocks/${code}/kline?period=${periodMap[period] || '6mo'}`)
      .then(res => res.json())
      .then(data => setKlines(data))
  }, [code, period])

  useEffect(() => {
    if (!code) return
    quantApi.getIndicators(code).then(res => {
      if (res.data?.code === 0) {
        setIndicators(res.data.data)
      }
    })
    quantApi.getIndicatorHistory(code, 120).then(res => {
      if (res.data?.code === 0) {
        setIndicatorHistory(res.data.data || [])
      }
    })
    quantApi.getFundamentals(code).then(res => {
      if (res.data?.code === 0) {
        setFundamentals(res.data.data)
      }
    })
  }, [code])

  const getChartOption = () => {
    if (klines.length === 0) return {}

    const dates = klines.map(k => k.date)
    const opens = klines.map(k => k.open)
    const closes = klines.map(k => k.close)

    // Calculate MA5 and MA20 from klines
    const ma5 = klines.map((_, i) => {
      if (i < 4) return null
      const sum = klines.slice(i - 4, i + 1).reduce((s, k) => s + k.close, 0)
      return sum / 5
    })
    const ma20 = klines.map((_, i) => {
      if (i < 19) return null
      const sum = klines.slice(i - 19, i + 1).reduce((s, k) => s + k.close, 0)
      return sum / 20
    })

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['Kline', 'MA5', 'MA20'],
      },
      grid: [
        { left: '10%', right: '8%', height: '50%' },
        { left: '10%', right: '8%', top: '68%', height: '16%' },
      ],
      xAxis: [
        { type: 'category', data: dates, gridIndex: 0 },
        { type: 'category', data: dates, gridIndex: 1 },
      ],
      yAxis: [
        { scale: true, gridIndex: 0 },
        { scale: true, gridIndex: 1, splitNumber: 2 },
      ],
      dataZoom: [{ type: 'inside', xAxisIndex: [0, 1], start: 60, end: 100 }],
      series: [
        {
          name: 'Kline',
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
          lineStyle: { opacity: 0.8, width: 1 },
          symbol: 'none',
        },
        {
          name: 'MA20',
          type: 'line',
          data: ma20,
          smooth: true,
          lineStyle: { opacity: 0.8, width: 1 },
          symbol: 'none',
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: klines.map((k, i) => ({
            value: k.volume,
            itemStyle: {
              color: closes[i] >= opens[i] ? '#ef4444' : '#22c55e',
            },
          })),
        },
      ],
    }
  }

  const getMacdChartOption = () => {
    if (!indicatorHistory.length) return {}
    const dates = indicatorHistory.map(i => i.tradeDate)
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '10%', right: '8%', height: '60%' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [
        { name: 'DIF', type: 'line', data: indicatorHistory.map(i => i.macdDif), smooth: true },
        { name: 'DEA', type: 'line', data: indicatorHistory.map(i => i.macdDea), smooth: true },
        {
          name: 'BAR',
          type: 'bar',
          data: indicatorHistory.map(i => i.macdBar),
          itemStyle: {
            color: (params: { value: number }) => (params.value >= 0 ? '#ef4444' : '#22c55e'),
          },
        },
      ],
    }
  }

  const getRsiChartOption = () => {
    if (!indicatorHistory.length) return {}
    const dates = indicatorHistory.map(i => i.tradeDate)
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '10%', right: '8%', height: '60%' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value', min: 0, max: 100 },
      series: [
        { name: 'RSI6', type: 'line', data: indicatorHistory.map(i => i.rsi6), smooth: true },
        { name: 'RSI12', type: 'line', data: indicatorHistory.map(i => i.rsi12), smooth: true },
        { name: 'RSI24', type: 'line', data: indicatorHistory.map(i => i.rsi24), smooth: true },
      ],
    }
  }

  const priceChange = stock?.changePercent ?? 0
  const isUp = priceChange >= 0

  const items: DescriptionsProps['items'] = [
    { key: '1', label: 'Open', children: stock?.open?.toFixed(2) || '-' },
    { key: '2', label: 'High', children: stock?.high?.toFixed(2) || '-' },
    { key: '3', label: 'Low', children: stock?.low?.toFixed(2) || '-' },
    {
      key: '4',
      label: 'Volume',
      children: stock ? `${(stock.volume / 100000000).toFixed(2)}亿` : '-',
    },
  ]

  const indicatorCards = [
    { title: 'MA5', value: indicators?.ma5, color: '#1677ff' },
    { title: 'MA20', value: indicators?.ma20, color: '#52c41a' },
    { title: 'MA60', value: indicators?.ma60, color: '#faad14' },
    {
      title: 'RSI6',
      value: indicators?.rsi6,
      color:
        indicators && indicators.rsi6 > 70
          ? '#ff4d4f'
          : indicators && indicators.rsi6 < 30
            ? '#52c41a'
            : '#8c8c8c',
    },
    { title: 'MACD DIF', value: indicators?.macdDif, color: '#722ed1' },
    {
      title: 'MACD BAR',
      value: indicators?.macdBar,
      color: indicators && indicators.macdBar >= 0 ? '#ff4d4f' : '#52c41a',
    },
    { title: 'KDJ K', value: indicators?.kdjK, color: '#eb2f96' },
    { title: 'BOLL 上轨', value: indicators?.bollUpper, color: '#13c2c2' },
  ]

  return (
    <Spin spinning={loading}>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<LeftOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Space>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title={stock?.name}
              value={stock?.price}
              precision={2}
              prefix={isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix=""
              valueStyle={{ color: isUp ? '#ff4d4f' : '#52c41a' }}
            />
            <Tag color={isUp ? 'red' : 'green'} style={{ fontSize: 16, marginTop: 8 }}>
              {priceChange >= 0 ? '+' : ''}
              {priceChange.toFixed(2)}%
            </Tag>
          </Col>
          <Col span={12}>
            <Descriptions items={items} column={2} size="small" />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 16 }} title="技术指标">
        <Row gutter={[16, 16]}>
          {indicatorCards.map(card => (
            <Col span={6} key={card.title}>
              <Card size="small" style={{ borderLeft: `4px solid ${card.color}` }}>
                <Statistic
                  title={card.title}
                  value={card.value ?? '-'}
                  precision={2}
                  valueStyle={{ color: card.color, fontSize: 20 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 500 }}>K线图</span>
          <Button
            type={period === 'daily' ? 'primary' : 'default'}
            onClick={() => setPeriod('daily')}
          >
            日线
          </Button>
          <Button
            type={period === 'weekly' ? 'primary' : 'default'}
            onClick={() => setPeriod('weekly')}
          >
            周线
          </Button>
          <Button
            type={period === 'monthly' ? 'primary' : 'default'}
            onClick={() => setPeriod('monthly')}
          >
            月线
          </Button>
        </Space>
        <ReactECharts option={getChartOption()} style={{ height: 500 }} />
      </Card>

      {indicatorHistory.length > 0 && (
        <Card style={{ marginTop: 16 }} title="指标趋势">
          <Tabs
            items={[
              {
                key: 'macd',
                label: 'MACD',
                children: <ReactECharts option={getMacdChartOption()} style={{ height: 300 }} />,
              },
              {
                key: 'rsi',
                label: 'RSI',
                children: <ReactECharts option={getRsiChartOption()} style={{ height: 300 }} />,
              },
            ]}
          />
        </Card>
      )}

      {fundamentals && (
        <Card style={{ marginTop: 16 }} title="基本面数据">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic title="PE(TTM)" value={fundamentals.peTtm ?? '-'} precision={2} />
            </Col>
            <Col span={6}>
              <Statistic title="PB" value={fundamentals.pb ?? '-'} precision={2} />
            </Col>
            <Col span={6}>
              <Statistic title="ROE" value={fundamentals.roe ?? '-'} precision={2} suffix="%" />
            </Col>
            <Col span={6}>
              <Statistic
                title="毛利率"
                value={fundamentals.grossMargin ?? '-'}
                precision={2}
                suffix="%"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="营收增速"
                value={fundamentals.revenueGrowth ?? '-'}
                precision={2}
                suffix="%"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="负债率"
                value={fundamentals.debtRatio ?? '-'}
                precision={2}
                suffix="%"
              />
            </Col>
          </Row>
        </Card>
      )}
    </Spin>
  )
}
