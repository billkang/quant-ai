import { useState, useEffect } from 'react'
import axios from 'axios'
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
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  FundOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
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
  }>({
    positions: [],
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
  })
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; code: string; name: string }>(
    {
      show: false,
      code: '',
      name: '',
    }
  )

  useEffect(() => {
    fetchPortfolio()
    fetchAnalysis()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/portfolio')
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
      if (res.data?.code === 0) {
        setAnalysis(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await axios.post('/api/portfolio', {
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

  const handleDeleteClick = (code: string, name: string) => {
    setDeleteConfirm({ show: true, code, name })
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/portfolio/${deleteConfirm.code}`)
      setDeleteConfirm({ show: false, code: '', name: '' })
      await fetchPortfolio()
    } catch (error) {
      console.error('Failed to delete position:', error)
    }
  }

  const totalProfitPercent = data.totalCost > 0 ? (data.totalProfit / data.totalCost) * 100 : 0

  const columns = [
    {
      title: '股票',
      key: 'name',
      width: '20%',
      render: (_: unknown, record: Position) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 15 }}>
            {record.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.code}
          </Text>
        </Space>
      ),
    },
    {
      title: '持仓量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      width: '12%',
      render: (qty: number) => <Text>{qty} 股</Text>,
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      render: (price: number) => `¥${price?.toFixed(2) || '-'}`,
    },
    {
      title: '现价',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      align: 'right' as const,
      render: (price: number) => `¥${price?.toFixed(2) || '-'}`,
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      align: 'right' as const,
      width: '15%',
      render: (profit: number) => (
        <Text type={profit >= 0 ? 'danger' : 'success'}>
          {profit >= 0 ? '+' : ''}¥{profit?.toFixed(2) || '-'}
        </Text>
      ),
    },
    {
      title: '盈亏比',
      dataIndex: 'profitPercent',
      key: 'profitPercent',
      align: 'right' as const,
      width: '12%',
      render: (pct: number) => (
        <Tag color={pct >= 0 ? 'red' : 'green'}>
          {pct >= 0 ? '+' : ''}
          {pct?.toFixed(2) || '-'}%
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      width: '10%',
      render: (_: unknown, record: Position) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteClick(record.code, record.name)}
        />
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>持仓市值</span>}
              value={data.totalValue}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              background:
                data.totalProfit >= 0
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)'
                  : 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              boxShadow: `0 8px 32px rgba(${data.totalProfit >= 0 ? '255,107,107' : '82,196,26'}, 0.3)`,
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>持仓盈亏</span>}
              value={data.totalProfit}
              precision={2}
              prefix={
                data.totalProfit >= 0 ? (
                  <RiseOutlined style={{ color: '#fff' }} />
                ) : (
                  <FallOutlined style={{ color: '#fff' }} />
                )
              }
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>盈亏比例</span>}
              value={totalProfitPercent}
              precision={2}
              suffix={<span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>%</span>}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {analysis && (
        <Card
          title={
            <Space>
              <BarChartOutlined /> 组合风险分析
            </Space>
          }
          style={{ borderRadius: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="夏普比率" value={analysis.sharpeRatio} precision={2} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="最大回撤"
                  value={analysis.maxDrawdown}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="波动率" value={analysis.volatility} precision={2} suffix="%" />
              </Card>
            </Col>
          </Row>
          {Object.keys(analysis.correlationMatrix).length > 1 && (
            <div style={{ marginTop: 16 }}>
              <Text strong>相关性矩阵</Text>
              <ReactECharts
                option={{
                  tooltip: { position: 'top' },
                  grid: { height: '50%', top: '10%' },
                  xAxis: {
                    type: 'category',
                    data: Object.keys(analysis.correlationMatrix),
                    splitArea: { show: true },
                  },
                  yAxis: {
                    type: 'category',
                    data: Object.keys(analysis.correlationMatrix),
                    splitArea: { show: true },
                  },
                  visualMap: {
                    min: -1,
                    max: 1,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '15%',
                    inRange: { color: ['#52c41a', '#fff', '#ff4d4f'] },
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
                      },
                    },
                  ],
                }}
                style={{ height: 350 }}
              />
            </div>
          )}
          {Object.keys(analysis.industryDistribution).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong>行业分布</Text>
              <ReactECharts
                option={{
                  tooltip: { trigger: 'item' },
                  series: [
                    {
                      name: '行业分布',
                      type: 'pie',
                      radius: ['40%', '70%'],
                      avoidLabelOverlap: false,
                      itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2,
                      },
                      label: { show: true, formatter: '{b}: {d}%' },
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

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px',
            }}
          >
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FundOutlined style={{ fontSize: 20, color: '#fff' }} />
              </div>
              持仓明细
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAdd(true)}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
              }}
            >
              记录交易
            </Button>
          </div>

          <div style={{ padding: 24, background: '#fafafa', borderRadius: 12 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
            ) : data.positions.length === 0 ? (
              <Empty description="暂无持仓记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={columns}
                dataSource={data.positions}
                rowKey="code"
                pagination={false}
              />
            )}
          </div>
        </Space>
      </Card>

      <Modal
        title="记录交易"
        open={showAdd}
        onOk={handleSubmit}
        onCancel={() => setShowAdd(false)}
        okText="保存"
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="stock_code" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如：600519" />
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
            <InputNumber style={{ width: '100%' }} min={1} placeholder="100" />
          </Form.Item>
          <Form.Item name="cost_price" label="价格" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0.01} precision={2} placeholder="100.00" />
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
        centered
      >
        <p style={{ fontSize: 16 }}>
          确定要删除持仓 <Text strong>{deleteConfirm.name}</Text> ({deleteConfirm.code}) 吗？
        </p>
      </Modal>
    </div>
  )
}
