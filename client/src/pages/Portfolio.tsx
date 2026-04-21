import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, Table, Button, Typography, Space, Tag, Modal, Form, Input, InputNumber, Select, Empty, Row, Col, Statistic } from 'antd'
import { PlusOutlined, DeleteOutlined, FundOutlined, DollarOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'

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
    totalProfit: 0
  })
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; code: string; name: string }>({
    show: false,
    code: '',
    name: ''
  })

  useEffect(() => {
    fetchPortfolio()
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await axios.post('/api/portfolio', {
        stock_code: values.stock_code,
        stock_name: values.stock_name || values.stock_code,
        quantity: values.quantity,
        cost_price: values.cost_price
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

  const totalProfitPercent = data.totalCost > 0
    ? (data.totalProfit / data.totalCost * 100)
    : 0

  const columns = [
    {
      title: '股票',
      key: 'name',
      width: '20%',
      render: (_: unknown, record: Position) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 15 }}>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text>
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
          {pct >= 0 ? '+' : ''}{pct?.toFixed(2) || '-'}%
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
          <Card style={{ 
            borderRadius: 16, 
            border: 'none',
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)'
          }}>
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
          <Card style={{ 
            borderRadius: 16, 
            border: 'none',
            background: data.totalProfit >= 0 
              ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)'
              : 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
            boxShadow: `0 8px 32px rgba(${data.totalProfit >= 0 ? '255,107,107' : '82,196,26'}, 0.3)`
          }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>持仓盈亏</span>}
              value={data.totalProfit}
              precision={2}
              prefix={data.totalProfit >= 0 
                ? <RiseOutlined style={{ color: '#fff' }} /> 
                : <FallOutlined style={{ color: '#fff' }} />
              }
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ 
            borderRadius: 16, 
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
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

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0 8px'
          }}>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
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
                border: 'none'
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
            <Select options={[
              { value: 'buy', label: '买入' },
              { value: 'sell', label: '卖出' }
            ]} />
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