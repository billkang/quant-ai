import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Empty,
  Typography,
} from 'antd'
import ReactECharts from 'echarts-for-react'
import {
  PlayCircleOutlined,
  HistoryOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { quantApi } from '../services/api'

const { Title, Text } = Typography

interface BacktestResult {
  id?: number
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  tradeCount: number
  equityCurve: { date: string; value: number }[]
  trades: { date: string; action: string; price: number; shares: number; value: number }[]
}

interface BacktestRecord {
  id: number
  strategy: string
  stockCode: string
  startDate: string
  endDate: string
  totalReturn: number
  sharpeRatio: number
  tradeCount: number
}

export default function Backtest() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [history, setHistory] = useState<BacktestRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await quantApi.getBacktests(20)
      if (res.data?.code === 0) setHistory(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleRun = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      const res = await quantApi.runBacktest({
        stockCode: values.stockCode,
        strategy: values.strategy,
        strategyParams: values.strategyParams || {},
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        initialCash: values.initialCash,
      })
      if (res.data?.code === 0) {
        setResult(res.data.data)
        fetchHistory()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getEquityChartOption = () => {
    if (!result?.equityCurve?.length) return {}
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0' },
      },
      grid: { left: '10%', right: '8%', height: '70%' },
      xAxis: {
        type: 'category',
        data: result.equityCurve.map(e => e.date),
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
          name: '权益',
          type: 'line',
          data: result.equityCurve.map(e => e.value),
          smooth: true,
          lineStyle: { color: '#0ea5e9', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(14,165,233,0.2)' },
                { offset: 1, color: 'rgba(14,165,233,0)' },
              ],
            },
          },
        },
      ],
    }
  }

  const strategyOptions = [
    { value: 'ma_cross', label: 'MA交叉 (MA5/MA20)' },
    { value: 'rsi_oversold', label: 'RSI超买卖' },
    { value: 'macd_signal', label: 'MACD金叉死叉' },
  ]

  const tradeColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag
          style={{
            background: action === 'buy' ? 'var(--up-soft)' : 'var(--down-soft)',
            color: action === 'buy' ? 'var(--up)' : 'var(--down)',
            border: 'none',
            fontWeight: 600,
          }}
        >
          {action === 'buy' ? '买入' : '卖出'}
        </Tag>
      ),
    },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '数量', dataIndex: 'shares', key: 'shares' },
    { title: '金额', dataIndex: 'value', key: 'value', render: (v: number) => `¥${v.toFixed(2)}` },
  ]

  const historyColumns = [
    { title: '策略', dataIndex: 'strategy', key: 'strategy' },
    { title: '股票', dataIndex: 'stockCode', key: 'stockCode' },
    {
      title: '区间',
      key: 'range',
      render: (_: unknown, r: BacktestRecord) => `${r.startDate} ~ ${r.endDate}`,
    },
    {
      title: '总收益',
      dataIndex: 'totalReturn',
      key: 'totalReturn',
      render: (v: number) => (
        <Tag
          style={{
            background: (v || 0) >= 0 ? 'var(--up-soft)' : 'var(--down-soft)',
            color: (v || 0) >= 0 ? 'var(--up)' : 'var(--down)',
            border: 'none',
            fontWeight: 600,
          }}
        >
          {v >= 0 ? '+' : ''}
          {v?.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: '夏普比率',
      dataIndex: 'sharpeRatio',
      key: 'sharpeRatio',
      render: (v: number) => v?.toFixed(2),
    },
    { title: '交易次数', dataIndex: 'tradeCount', key: 'tradeCount' },
  ]

  const MetricCard = ({
    label,
    value,
    suffix,
    color,
  }: {
    label: string
    value: string | number
    suffix?: string
    color?: string
  }) => (
    <Card bodyStyle={{ padding: '16px 20px', textAlign: 'center' }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || 'var(--text-primary)' }}>
        {value}
        {suffix && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>{suffix}</span>
        )}
      </div>
    </Card>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          策略回测
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>基于历史数据验证策略表现</Text>
      </div>

      <Card
        title={
          <Space>
            <ExperimentOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>回测配置</span>
          </Space>
        }
        data-testid="backtest-config-card"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
                <Input placeholder="如：600519" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="strategy"
                label="策略"
                initialValue="ma_cross"
                rules={[{ required: true }]}
              >
                <Select options={strategyOptions} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="dateRange" label="回测区间" rules={[{ required: true }]}>
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="initialCash"
                label="初始资金"
                initialValue={100000}
                rules={[{ required: true }]}
              >
                <Input type="number" addonAfter="元" />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRun}
              loading={loading}
              data-testid="backtest-run-btn"
            >
              运行回测
            </Button>
            <Button icon={<HistoryOutlined />} onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? '隐藏' : '显示'}历史
            </Button>
          </Space>
        </Form>
      </Card>

      {showHistory && (
        <Card
          title={
            <Space>
              <HistoryOutlined style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600 }}>回测历史</span>
            </Space>
          }
        >
          {history.length === 0 ? (
            <Empty description="暂无回测记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Table
              columns={historyColumns}
              dataSource={history}
              rowKey="id"
              pagination={false}
              size="small"
            />
          )}
        </Card>
      )}

      {result && (
        <>
          <Row gutter={[16, 16]}>
            <Col span={4}>
              <MetricCard
                label="总收益"
                value={result.totalReturn.toFixed(2)}
                suffix="%"
                color={result.totalReturn >= 0 ? 'var(--up)' : 'var(--down)'}
              />
            </Col>
            <Col span={4}>
              <MetricCard label="年化收益" value={result.annualizedReturn.toFixed(2)} suffix="%" />
            </Col>
            <Col span={4}>
              <MetricCard
                label="最大回撤"
                value={result.maxDrawdown.toFixed(2)}
                suffix="%"
                color="var(--down)"
              />
            </Col>
            <Col span={4}>
              <MetricCard label="夏普比率" value={result.sharpeRatio.toFixed(2)} />
            </Col>
            <Col span={4}>
              <MetricCard label="胜率" value={result.winRate.toFixed(2)} suffix="%" />
            </Col>
            <Col span={4}>
              <MetricCard label="交易次数" value={result.tradeCount} />
            </Col>
          </Row>

          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 600 }}>收益曲线</span>
              </Space>
            }
          >
            <ReactECharts option={getEquityChartOption()} style={{ height: 400 }} />
          </Card>

          <Card
            title={
              <Space>
                <SwapOutlined style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 600 }}>交易记录</span>
              </Space>
            }
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={tradeColumns}
              dataSource={result.trades}
              rowKey={(r, i) => `${r.date}-${i}`}
              pagination={false}
              size="small"
            />
          </Card>
        </>
      )}
    </div>
  )
}
