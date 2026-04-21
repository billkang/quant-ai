import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Empty,
  Tag,
  Input,
  Popconfirm,
  message,
} from 'antd'
import {
  PlusOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/stocks/watchlist')
      setStocks(res.data || [])
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const addStock = async () => {
    if (!newCode) return
    try {
      const res = await axios.post(`/api/stocks/watchlist?stock_code=${newCode}`)
      if (res.data.status === 'error') {
        message.error(res.data.message || '添加失败')
        return
      }
      message.success(`已添加 ${res.data.name}`)
      setNewCode('')
      await fetchWatchlist()
    } catch (error) {
      message.error('添加失败')
    }
  }

  const columns = [
    {
      title: '股票',
      key: 'name',
      width: '30%',
      render: (_: unknown, record: Stock) => (
        <Space direction="vertical" size={0}>
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            <Link to={`/stock/${record.code}`} style={{ fontWeight: 600, fontSize: 15 }}>
              {record.name}
            </Link>
          </Space>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 22 }}>
            {record.code}
          </Text>
        </Space>
      ),
    },
    {
      title: '现价',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      width: '20%',
      render: (price: number) => (
        <Text style={{ fontSize: 16, fontWeight: 500 }}>
          {price ? `¥${price.toFixed(2)}` : '-'}
        </Text>
      ),
    },
    {
      title: '涨跌',
      dataIndex: 'change',
      key: 'change',
      align: 'right' as const,
      width: '20%',
      render: (change: number, record: Stock) => (
        <Space>
          {record.changePercent >= 0 ? (
            <RiseOutlined style={{ color: '#ff4d4f' }} />
          ) : (
            <FallOutlined style={{ color: '#52c41a' }} />
          )}
          <Text type={record.changePercent >= 0 ? 'danger' : 'success'}>
            {change ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}` : '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: '涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      align: 'right' as const,
      width: '20%',
      render: (pct: number) => (
        <Tag
          color={pct >= 0 ? 'red' : 'green'}
          style={{ borderRadius: 4, fontSize: 13, padding: '2px 8px' }}
        >
          {pct ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : '-'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'center' as const,
      width: '10%',
      render: (_: unknown, record: Stock) => (
        <Popconfirm
          title="确认删除"
          description={`确定要从自选股中删除 ${record.name} 吗？`}
          onConfirm={async () => {
            try {
              await axios.delete(`/api/stocks/watchlist/${record.code}`)
              message.success('删除成功')
              await fetchWatchlist()
            } catch {
              message.error('删除失败')
            }
          }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>自选股数量</span>}
              value={stocks.length}
              suffix={<span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>只</span>}
              valueStyle={{ color: '#fff', fontSize: 42, fontWeight: 700 }}
              prefix={<StarOutlined style={{ color: '#faad14', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>AI 助手</span>}
              value="就绪"
              valueStyle={{ color: '#fff', fontSize: 42, fontWeight: 700 }}
              prefix={<InfoCircleOutlined style={{ color: '#fff', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
              boxShadow: '0 8px 32px rgba(238, 9, 121, 0.3)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>今日涨跌幅</span>}
              value={
                stocks.length > 0
                  ? stocks.reduce((sum, s) => sum + (s.changePercent || 0), 0) / stocks.length
                  : 0
              }
              precision={2}
              suffix={<span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>%</span>}
              valueStyle={{ color: '#fff', fontSize: 42, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
              borderRadius: 12,
            }}
          >
            <Input
              placeholder="输入股票代码添加自选股 (如: 600519 或 00700.HK)"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              onPressEnter={addStock}
              size="large"
              style={{ flex: 1, borderRadius: 8 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addStock}
              disabled={!newCode}
              size="large"
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              添加股票
            </Button>
          </div>

          <div style={{ padding: '0 8px' }}>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <StarOutlined style={{ color: '#faad14' }} />
              我的自选股
            </Title>
          </div>

          {loading ? null : stocks.length === 0 ? (
            <Empty
              description="暂无自选股，请在上方添加股票"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={stocks}
              rowKey="code"
              pagination={false}
              onRow={record => ({
                onClick: () => navigate(`/stock/${record.code}`),
                style: { cursor: 'pointer' },
              })}
              locale={{ emptyText: '暂无自选股' }}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  )
}
