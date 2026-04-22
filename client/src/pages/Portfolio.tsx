import { useState, useEffect } from 'react'
import { portfolioApi } from '../services/api'
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Empty,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  FundOutlined,
  DollarOutlined,
  BarChartOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { quantApi } from '../services/api'

const { Title, Text } = Typography

interface Position {
  code: string
  name: string
  quantity: number
  costPrice: number
  currentPrice: number
  profit: number
  profitPercent: number
}

interface PortfolioAnalysis {
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  industryDistribution: Record<string, number>
  correlationMatrix: Record<string, Record<string, number>>
}

export default function Portfolio() {
  const [data, setData] = useState<{
    positions: Position[]
    totalValue: number
    totalCost: number
    totalProfit: number
  }>({ positions: [], totalValue: 0, totalCost: 0, totalProfit: 0 })
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; code: string; name: string }>(
    { show: false, code: '', name: '' }
  )

  useEffect(() => {
    fetchPortfolio()
    fetchAnalysis()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const res = await portfolioApi.getPortfolio()
      setData(res.data || { positions: [], totalValue: 0, totalCost: 0, totalProfit: 0 })
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalysis = async () => {
    try {
      const res = await quantApi.getPortfolioAnalysis()
      if (res.data?.code === 0) setAnalysis(res.data.data)
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await portfolioApi.addPosition({
        stock_code: values.stock_code,
        stock_name: values.stock_name || values.stock_code,
        quantity: values.quantity,
        cost_price: values.cost_price,
      })
      setShowAdd(false)
      form.resetFields()
      await fetchPortfolio()
    } catch (error) {
      console.error('Failed to add position:', error)
    }
  }

  const confirmDelete = async () => {
    try {
      await portfolioApi.deletePosition(deleteConfirm.code)
      setDeleteConfirm({ show: false, code: '', name: '' })
      await fetchPortfolio()
    } catch (error) {
      console.error('Failed to delete position:', error)
    }
  }

  const totalProfitPercent = data.totalCost > 0 ? (data.totalProfit / data.totalCost) * 100 : 0

  const StatCard = ({
    label,
    value,
    suffix,
    icon: Icon,
    color,
  }: {
    label: string
    value: string | number
    suffix?: string
    icon: React.ElementType
    color: string
  }) => (
    <Card className="metric-card" bodyStyle={{ padding: '20px 24px' }}>
      <Space align="start" size={14}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ fontSize: 20, color }} />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginBottom: 4,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            {value}
            {suffix && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>
                {suffix}
              </span>
            )}
          </div>
        </div>
      </Space>
    </Card>
  )

  const columns = [
    {
      title: '股票',
      key: 'name',
      width: '22%',
      render: (_: unknown, record: Position) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>
            {record.name}
          </Text>
          <Text style={{ fontSize: 12, color: 'var(--text-muted)' }}>{record.code}</Text>
        </Space>
      ),
    },
    {
      title: '持仓量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      render: (qty: number) => <Text style={{ color: 'var(--text-primary)' }}>{qty} 股</Text>,
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      render: (price: number) => (
        <Text style={{ color: 'var(--text-primary)' }}>¥{price?.toFixed(2) || '-'}</Text>
      ),
    },
    {
      title: '现价',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      align: 'right' as const,
      render: (price: number) => (
        <Text style={{ color: 'var(--text-primary)' }}>¥{price?.toFixed(2) || '-'}</Text>
      ),
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      align: 'right' as const,
      render: (profit: number) => (
        <Text style={{ color: (profit || 0) >= 0 ? 'var(--up)' : 'var(--down)', fontWeight: 600 }}>
          {profit >= 0 ? '+' : ''}¥{profit?.toFixed(2) || '-'}
        </Text>
      ),
    },
    {
      title: '盈亏比',
      dataIndex: 'profitPercent',
      key: 'profitPercent',
      align: 'right' as const,
      render: (pct: number) => (
        <Tag
          style={{
            background: (pct || 0) >= 0 ? 'var(--up-soft)' : 'var(--down-soft)',
            color: (pct || 0) >= 0 ? 'var(--up)' : 'var(--down)',
            border: 'none',
            fontWeight: 600,
          }}
        >
          {pct >= 0 ? '+' : ''}
          {pct?.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'center' as const,
      width: '8%',
      render: (_: unknown, record: Position) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          size="small"
          style={{ opacity: 0.5, transition: 'opacity 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          onClick={() => setDeleteConfirm({ show: true, code: record.code, name: record.name })}
        />
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          持仓管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>跟踪持仓表现与组合风险分析</Text>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={8}>
          <StatCard
            label="持仓市值"
            value={data.totalValue.toFixed(2)}
            suffix="¥"
            icon={DollarOutlined}
            color="#0ea5e9"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            label="持仓盈亏"
            value={data.totalProfit.toFixed(2)}
            suffix="¥"
            icon={FundOutlined}
            color={data.totalProfit >= 0 ? '#ef4444' : '#22c55e'}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            label="盈亏比例"
            value={totalProfitPercent.toFixed(2)}
            suffix="%"
            icon={BarChartOutlined}
            color={data.totalProfit >= 0 ? '#ef4444' : '#22c55e'}
          />
        </Col>
      </Row>

      {analysis && (
        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600 }}>组合风险分析</span>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
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
                  夏普比率
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {analysis.sharpeRatio?.toFixed(2) ?? '-'}
                </div>
              </div>
            </Col>
            <Col span={8}>
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
                  最大回撤
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: analysis.maxDrawdown < -10 ? 'var(--down)' : 'var(--text-primary)',
                  }}
                >
                  {analysis.maxDrawdown?.toFixed(2) ?? '-'}%
                </div>
              </div>
            </Col>
            <Col span={8}>
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
                  波动率
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {analysis.volatility?.toFixed(2) ?? '-'}%
                </div>
              </div>
            </Col>
          </Row>
          {Object.keys(analysis.correlationMatrix).length > 1 && (
            <div style={{ marginTop: 20 }}>
              <Text strong style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                相关性矩阵
              </Text>
              <ReactECharts
                option={{
                  backgroundColor: 'transparent',
                  tooltip: { position: 'top' },
                  grid: { height: '50%', top: '10%' },
                  xAxis: {
                    type: 'category',
                    data: Object.keys(analysis.correlationMatrix),
                    splitArea: {
                      show: true,
                      areaStyle: { color: ['rgba(148,163,184,0.03)', 'transparent'] },
                    },
                    axisLine: { lineStyle: { color: '#334155' } },
                    axisLabel: { color: '#94a3b8' },
                  },
                  yAxis: {
                    type: 'category',
                    data: Object.keys(analysis.correlationMatrix),
                    splitArea: {
                      show: true,
                      areaStyle: { color: ['rgba(148,163,184,0.03)', 'transparent'] },
                    },
                    axisLine: { lineStyle: { color: '#334155' } },
                    axisLabel: { color: '#94a3b8' },
                  },
                  visualMap: {
                    min: -1,
                    max: 1,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '10%',
                    inRange: { color: ['#22c55e', '#0f172a', '#ef4444'] },
                    textStyle: { color: '#94a3b8' },
                  },
                  series: [
                    {
                      name: '相关性',
                      type: 'heatmap',
                      data: Object.entries(analysis.correlationMatrix).flatMap(([row, cols]) =>
                        Object.entries(cols).map(([col, val]) => [row, col, val])
                      ),
                      label: {
                        show: true,
                        formatter: (p: { value: [string, string, number] }) =>
                          p.value[2].toFixed(2),
                        color: '#e2e8f0',
                      },
                    },
                  ],
                }}
                style={{ height: 360 }}
              />
            </div>
          )}
          {Object.keys(analysis.industryDistribution).length > 0 && (
            <div style={{ marginTop: 20 }}>
              <Text strong style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                行业分布
              </Text>
              <ReactECharts
                option={{
                  backgroundColor: 'transparent',
                  tooltip: {
                    trigger: 'item',
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    textStyle: { color: '#e2e8f0' },
                  },
                  series: [
                    {
                      name: '行业分布',
                      type: 'pie',
                      radius: ['40%', '70%'],
                      avoidLabelOverlap: false,
                      itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 3 },
                      label: { show: true, formatter: '{b}: {d}%', color: '#94a3b8' },
                      data: Object.entries(analysis.industryDistribution).map(([name, value]) => ({
                        name,
                        value,
                      })),
                    },
                  ],
                }}
                style={{ height: 300 }}
              />
            </div>
          )}
        </Card>
      )}

      <Card
        title={
          <Space>
            <FundOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>持仓明细</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAdd(true)}
            data-testid="portfolio-add-btn"
          >
            记录交易
          </Button>
        }
        bodyStyle={{ padding: 0 }}
        data-testid="portfolio-holdings-card"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Text style={{ color: 'var(--text-muted)' }}>加载中...</Text>
          </div>
        ) : data.positions.length === 0 ? (
          <Empty
            description="暂无持仓记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: 60 }}
          />
        ) : (
          <Table columns={columns} dataSource={data.positions} rowKey="code" pagination={false} />
        )}
      </Card>

      <Modal
        title="记录交易"
        open={showAdd}
        onOk={handleSubmit}
        onCancel={() => setShowAdd(false)}
        okText="保存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="stock_code" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如：600519" data-testid="portfolio-modal-stock-code" />
          </Form.Item>
          <Form.Item name="stock_name" label="股票名称">
            <Input placeholder="如：贵州茅台" />
          </Form.Item>
          <Form.Item name="type" label="交易类型" initialValue="buy">
            <Select
              options={[
                { value: 'buy', label: '买入' },
                { value: 'sell', label: '卖出' },
              ]}
            />
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="100"
              data-testid="portfolio-modal-quantity"
            />
          </Form.Item>
          <Form.Item name="cost_price" label="价格" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              precision={2}
              placeholder="100.00"
              data-testid="portfolio-modal-price"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="确认删除"
        open={deleteConfirm.show}
        onOk={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, code: '', name: '' })}
        okText="确定删除"
        okButtonProps={{ danger: true }}
      >
        <p style={{ fontSize: 15, color: 'var(--text-primary)' }}>
          确定要删除持仓 <Text strong>{deleteConfirm.name}</Text> ({deleteConfirm.code}) 吗？
        </p>
      </Modal>
    </div>
  )
}
