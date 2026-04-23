import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Statistic,
  Row,
  Col,
  message,
  Typography,
  Popconfirm,
} from 'antd'
import {
  DollarOutlined,
  WalletOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { paperApi } from '../services/api'
import type { PaperAccountData, PaperPositionItem, PaperOrderItem } from '../types/api'

const { Title } = Typography

export default function PaperTrading() {
  const [account, setAccount] = useState<PaperAccountData | null>(null)
  const [positions, setPositions] = useState<PaperPositionItem[]>([])
  const [orders, setOrders] = useState<PaperOrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderForm] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [accRes, posRes, ordRes] = await Promise.all([
        paperApi.getAccount(),
        paperApi.getPositions(),
        paperApi.getOrders(),
      ])
      if (accRes.data?.code === 0) setAccount(accRes.data.data)
      if (posRes.data?.code === 0) setPositions(posRes.data.data)
      if (ordRes.data?.code === 0) setOrders(ordRes.data.data)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateOrder = async (values: {
    stock_code: string
    stock_name: string
    side: string
    quantity: number
  }) => {
    try {
      const res = await paperApi.createOrder({
        ...values,
        order_type: 'market',
      })
      if (res.data?.code === 0) {
        message.success('下单成功')
        setOrderModalOpen(false)
        orderForm.resetFields()
        fetchData()
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '下单失败')
    }
  }

  const handleReset = async () => {
    try {
      const res = await paperApi.resetAccount()
      if (res.data?.code === 0) {
        message.success('账户已重置')
        fetchData()
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '重置失败')
    }
  }

  const positionColumns = [
    { title: '代码', dataIndex: 'code', key: 'code' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (v: number) => v?.toFixed(2),
    },
    {
      title: '当前价',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (v: number) => v?.toFixed(2),
    },
    {
      title: '市值',
      dataIndex: 'marketValue',
      key: 'marketValue',
      render: (v: number) => v?.toFixed(2),
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#10b981' : '#f43f5e' }}>
          {v >= 0 ? '+' : ''}
          {v?.toFixed(2)}
        </span>
      ),
    },
    {
      title: '盈亏率%',
      dataIndex: 'profitPercent',
      key: 'profitPercent',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#10b981' : '#f43f5e' }}>
          {v >= 0 ? '+' : ''}
          {v?.toFixed(2)}%
        </span>
      ),
    },
  ]

  const orderColumns = [
    { title: '代码', dataIndex: 'stock_code', key: 'stock_code' },
    { title: '名称', dataIndex: 'stock_name', key: 'stock_name' },
    {
      title: '方向',
      dataIndex: 'side',
      key: 'side',
      render: (v: string) => (
        <span style={{ color: v === 'buy' ? '#10b981' : '#f43f5e' }}>
          {v === 'buy' ? '买入' : '卖出'}
        </span>
      ),
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '成交价', dataIndex: 'price', key: 'price', render: (v: number) => v?.toFixed(2) },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => v?.toFixed(2) },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '时间', dataIndex: 'created_at', key: 'created_at' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>
          虚拟盘
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => setOrderModalOpen(true)}
          >
            下单
          </Button>
          <Popconfirm
            title="确认重置账户？"
            description="这将清空所有虚拟持仓和交易记录"
            onConfirm={handleReset}
            okText="确认"
            cancelText="取消"
          >
            <Button icon={<ReloadOutlined />} danger>
              重置账户
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="初始资金"
              value={account?.initialCash || 0}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="可用资金"
              value={account?.availableCash || 0}
              precision={2}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总市值"
              value={account?.totalMarketValue || 0}
              precision={2}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计盈亏"
              value={account?.totalProfit || 0}
              precision={2}
              prefix={account && account.totalProfit >= 0 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ color: account && account.totalProfit >= 0 ? '#10b981' : '#f43f5e' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="虚拟持仓" loading={loading}>
        <Table
          dataSource={positions}
          columns={positionColumns}
          rowKey="code"
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无持仓' }}
        />
      </Card>

      <Card title="交易记录" loading={loading}>
        <Table
          dataSource={orders}
          columns={orderColumns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          size="small"
          locale={{ emptyText: '暂无交易记录' }}
        />
      </Card>

      <Modal
        title="模拟下单"
        open={orderModalOpen}
        onCancel={() => setOrderModalOpen(false)}
        onOk={() => orderForm.submit()}
      >
        <Form form={orderForm} layout="vertical" onFinish={handleCreateOrder}>
          <Form.Item
            name="stock_code"
            label="股票代码"
            rules={[{ required: true, message: '请输入股票代码' }]}
          >
            <Input placeholder="如 600519" />
          </Form.Item>
          <Form.Item
            name="stock_name"
            label="股票名称"
            rules={[{ required: true, message: '请输入股票名称' }]}
          >
            <Input placeholder="如 贵州茅台" />
          </Form.Item>
          <Form.Item name="side" label="方向" rules={[{ required: true }]} initialValue="buy">
            <Select
              options={[
                { value: 'buy', label: '买入' },
                { value: 'sell', label: '卖出' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="100" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
