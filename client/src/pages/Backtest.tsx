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
  Statistic,
} from 'antd'
import ReactECharts from 'echarts-for-react'
import { PlayCircleOutlined, HistoryOutlined } from '@ant-design/icons'
import { quantApi } from '../services/api'

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
      if (res.data?.code === 0) {
        setHistory(res.data.data || [])
      }
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
      tooltip: { trigger: 'axis' },
      grid: { left: '10%', right: '8%', height: '70%' },
      xAxis: { type: 'category', data: result.equityCurve.map(e => e.date) },
      yAxis: { type: 'value' },
      series: [
        {
          name: '权益',
          type: 'line',
          data: result.equityCurve.map(e => e.value),
          smooth: true,
          areaStyle: { opacity: 0.2 },
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
        <Tag color={action === 'buy' ? 'red' : 'green'}>{action === 'buy' ? '买入' : '卖出'}</Tag>
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
        <Tag color={v >= 0 ? 'red' : 'green'}>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card title="策略回测" style={{ borderRadius: 16 }}>
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
        <Card title="回测历史" style={{ borderRadius: 16 }}>
          <Table
            columns={historyColumns}
            dataSource={history}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {result && (
        <>
          <Row gutter={16}>
            <Col span={4}>
              <Card>
                <Statistic
                  title="总收益"
                  value={result.totalReturn}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: result.totalReturn >= 0 ? '#ff4d4f' : '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="年化收益"
                  value={result.annualizedReturn}
                  precision={2}
                  suffix="%"
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="最大回撤"
                  value={result.maxDrawdown}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic title="夏普比率" value={result.sharpeRatio} precision={2} />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic title="胜率" value={result.winRate} precision={2} suffix="%" />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic title="交易次数" value={result.tradeCount} />
              </Card>
            </Col>
          </Row>

          <Card title="收益曲线" style={{ borderRadius: 16 }}>
            <ReactECharts option={getEquityChartOption()} style={{ height: 400 }} />
          </Card>

          <Card title="交易记录" style={{ borderRadius: 16 }}>
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
