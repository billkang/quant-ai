import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Card, Row, Col, Button, Space, Spin, Tag, Tabs } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LeftOutlined,
  StockOutlined,
  AreaChartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { quantApi, stockApi } from '../services/api'

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

interface IndicatorItem {
  tradeDate?: string
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
  const [indicators, setIndicators] = useState<IndicatorItem | null>(null)
  const [indicatorHistory, setIndicatorHistory] = useState<IndicatorItem[]>([])
  const [fundamentals, setFundamentals] = useState<Fundamentals | null>(null)
  const [period, setPeriod] = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    stockApi
      .getStock(code)
      .then(res => setStock(res.data))
      .finally(() => setLoading(false))
  }, [code])

  useEffect(() => {
    if (!code) return
    const periodMap: Record<string, string> = { daily: '6mo', weekly: '6mo', monthly: '1y' }
    stockApi.getKline(code, periodMap[period] || '6mo').then(res => setKlines(res.data))
  }, [code, period])

  useEffect(() => {
    if (!code) return
    quantApi.getIndicators(code).then(res => {
      if (res.data?.code === 0) setIndicators(res.data.data)
    })
    quantApi.getIndicatorHistory(code, 120).then(res => {
      if (res.data?.code === 0) setIndicatorHistory(res.data.data || [])
    })
    quantApi.getFundamentals(code).then(res => {
      if (res.data?.code === 0) setFundamentals(res.data.data)
    })
  }, [code])

  const getChartOption = () => {
    if (klines.length === 0) return {}
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

  const getMacdChartOption = () => {
    if (!indicatorHistory.length) return {}
    const dates = indicatorHistory.map(i => i.tradeDate)
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
          data: indicatorHistory.map(i => i.macdDif),
          smooth: true,
          lineStyle: { color: '#0ea5e9', width: 1.5 },
        },
        {
          name: 'DEA',
          type: 'line',
          data: indicatorHistory.map(i => i.macdDea),
          smooth: true,
          lineStyle: { color: '#f59e0b', width: 1.5 },
        },
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
          data: indicatorHistory.map(i => i.rsi6),
          smooth: true,
          lineStyle: { color: '#ef4444', width: 1.5 },
        },
        {
          name: 'RSI12',
          type: 'line',
          data: indicatorHistory.map(i => i.rsi12),
          smooth: true,
          lineStyle: { color: '#0ea5e9', width: 1.5 },
        },
        {
          name: 'RSI24',
          type: 'line',
          data: indicatorHistory.map(i => i.rsi24),
          smooth: true,
          lineStyle: { color: '#a855f7', width: 1.5 },
        },
      ],
    }
  }

  const priceChange = stock?.changePercent ?? 0
  const isUp = priceChange >= 0
  const changeColor = isUp ? 'var(--up)' : 'var(--down)'

  const IndicatorBadge = ({
    label,
    value,
    color,
  }: {
    label: string
    value?: number
    color: string
  }) => (
    <div style={{ textAlign: 'center', padding: '14px 8px' }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: value !== undefined ? color : 'var(--text-muted)',
        }}
      >
        {value !== undefined ? value.toFixed(2) : '-'}
      </div>
    </div>
  )

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
          <Button
            icon={<LeftOutlined />}
            onClick={() => navigate('/')}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            返回
          </Button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {stock?.name}{' '}
              <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 400 }}>
                {stock?.code}
              </span>
            </div>
          </div>
        </div>

        {/* Price hero */}
        <Card className="metric-card" bodyStyle={{ padding: '24px 28px' }}>
          <Row gutter={[40, 16]} align="middle">
            <Col>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)' }}>
                  ¥{stock?.price?.toFixed(2) || '-'}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: changeColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {stock?.change ? `${isUp ? '+' : ''}${stock.change.toFixed(2)}` : '-'}
                  </span>
                  <Tag
                    style={{
                      background: isUp ? 'var(--up-soft)' : 'var(--down-soft)',
                      color: changeColor,
                      border: 'none',
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {priceChange >= 0 ? '+' : ''}
                    {priceChange.toFixed(2)}%
                  </Tag>
                </div>
              </div>
            </Col>
            <Col flex="auto">
              <Row gutter={[32, 8]}>
                <Col>
                  <div
                    style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}
                  >
                    今开
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {stock?.open?.toFixed(2) || '-'}
                  </div>
                </Col>
                <Col>
                  <div
                    style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}
                  >
                    最高
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {stock?.high?.toFixed(2) || '-'}
                  </div>
                </Col>
                <Col>
                  <div
                    style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}
                  >
                    最低
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {stock?.low?.toFixed(2) || '-'}
                  </div>
                </Col>
                <Col>
                  <div
                    style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}
                  >
                    成交量
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {stock ? `${(stock.volume / 100000000).toFixed(2)}亿` : '-'}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Indicators */}
        {indicators && (
          <Card
            title={
              <Space>
                <AreaChartOutlined style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 600 }}>技术指标</span>
              </Space>
            }
            bodyStyle={{ padding: 0 }}
          >
            <Row>
              <Col span={3}>
                <IndicatorBadge label="MA5" value={indicators.ma5} color="#0ea5e9" />
              </Col>
              <Col span={3}>
                <IndicatorBadge label="MA20" value={indicators.ma20} color="#a855f7" />
              </Col>
              <Col span={3}>
                <IndicatorBadge label="MA60" value={indicators.ma60} color="#f59e0b" />
              </Col>
              <Col span={3}>
                <IndicatorBadge
                  label="RSI6"
                  value={indicators.rsi6}
                  color={
                    indicators.rsi6 && indicators.rsi6 > 70
                      ? 'var(--up)'
                      : indicators.rsi6 && indicators.rsi6 < 30
                        ? 'var(--down)'
                        : 'var(--text-primary)'
                  }
                />
              </Col>
              <Col span={3}>
                <IndicatorBadge label="MACD" value={indicators.macdDif} color="#22d3ee" />
              </Col>
              <Col span={3}>
                <IndicatorBadge
                  label="BAR"
                  value={indicators.macdBar}
                  color={
                    indicators.macdBar && indicators.macdBar >= 0 ? 'var(--up)' : 'var(--down)'
                  }
                />
              </Col>
              <Col span={3}>
                <IndicatorBadge label="KDJ K" value={indicators.kdjK} color="#ec4899" />
              </Col>
              <Col span={3}>
                <IndicatorBadge label="BOLL上轨" value={indicators.bollUpper} color="#14b8a6" />
              </Col>
            </Row>
          </Card>
        )}

        {/* Kline chart */}
        <Card
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
                    onClick={() => setPeriod(p)}
                    style={{ borderRadius: 6, minWidth: 56 }}
                  >
                    {p === 'daily' ? '日线' : p === 'weekly' ? '周线' : '月线'}
                  </Button>
                ))}
              </Space>
            </div>
          }
        >
          <ReactECharts option={getChartOption()} style={{ height: 480 }} />
        </Card>

        {/* Indicator charts */}
        {indicatorHistory.length > 0 && (
          <Card
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

        {/* Fundamentals */}
        {fundamentals && (
          <Card
            title={
              <Space>
                <InfoCircleOutlined style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 600 }}>基本面数据</span>
              </Space>
            }
          >
            <Row gutter={[24, 16]}>
              {[
                { label: 'PE(TTM)', value: fundamentals.peTtm, suffix: '' },
                { label: 'PB', value: fundamentals.pb, suffix: '' },
                { label: 'ROE', value: fundamentals.roe, suffix: '%' },
                { label: '毛利率', value: fundamentals.grossMargin, suffix: '%' },
                { label: '营收增速', value: fundamentals.revenueGrowth, suffix: '%' },
                { label: '负债率', value: fundamentals.debtRatio, suffix: '%' },
              ].map(item => (
                <Col span={4} key={item.label}>
                  <div
                    style={{
                      padding: '16px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.value !== undefined && item.value !== null
                        ? `${item.value.toFixed(2)}${item.suffix}`
                        : '-'}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>
    </Spin>
  )
}
