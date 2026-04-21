import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Card, Row, Col, Statistic, Button, Space, Spin, Tag, Descriptions } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, LeftOutlined } from '@ant-design/icons'
import type { DescriptionsProps } from 'antd'

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

export default function StockDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [stock, setStock] = useState<StockData | null>(null)
  const [klines, setKlines] = useState<KLine[]>([])
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
      monthly: '1y'
    }
    fetch(`/api/stocks/${code}/kline?period=${periodMap[period] || '6mo'}`)
      .then(res => res.json())
      .then(data => setKlines(data))
  }, [code, period])

  const getChartOption = () => {
    if (klines.length === 0) return {}

    const dates = klines.map(k => k.date)
    const opens = klines.map(k => k.open)
    const closes = klines.map(k => k.close)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: [
        { left: '10%', right: '8%', height: '50%' },
        { left: '10%', right: '8%', top: '68%', height: '16%' }
      ],
      xAxis: [
        { type: 'category', data: dates, gridIndex: 0 },
        { type: 'category', data: dates, gridIndex: 1 }
      ],
      yAxis: [
        { scale: true, gridIndex: 0 },
        { scale: true, gridIndex: 1, splitNumber: 2 }
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: 60, end: 100 }
      ],
      series: [
        {
          name: 'Kline',
          type: 'candlestick',
          data: klines.map(k => [k.open, k.close, k.low, k.high]),
          itemStyle: {
            color: '#ef4444',
            color0: '#22c55e',
            borderColor: '#ef4444',
            borderColor0: '#22c55e'
          }
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: klines.map((k, i) => ({
            value: k.volume,
            itemStyle: {
              color: closes[i] >= opens[i] ? '#ef4444' : '#22c55e'
            }
          }))
        }
      ]
    }
  }

  const priceChange = stock?.changePercent ?? 0
  const isUp = priceChange >= 0

  const items: DescriptionsProps['items'] = [
    { key: '1', label: 'Open', children: stock?.open?.toFixed(2) || '-' },
    { key: '2', label: 'High', children: stock?.high?.toFixed(2) || '-' },
    { key: '3', label: 'Low', children: stock?.low?.toFixed(2) || '-' },
    { key: '4', label: 'Volume', children: stock ? `${(stock.volume / 100000000).toFixed(2)}亿` : '-' },
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
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </Tag>
          </Col>
          <Col span={12}>
            <Descriptions items={items} column={2} size="small" />
          </Col>
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
    </Spin>
  )
}