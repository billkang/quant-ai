import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Table, Statistic, Row, Col, Button, Typography, Space, Empty, Tag } from 'antd'
import { ArrowUpOutlined, PlusOutlined } from '@ant-design/icons'

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

  useEffect(() => {
    fetch('/api/stocks/watchlist')
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(() => setStocks([]))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    {
      title: 'Stock',
      key: 'name',
      render: (_: unknown, record: Stock) => (
        <Space direction="vertical" size={0}>
          <Link to={`/stock/${record.code}`} style={{ fontWeight: 500 }}>
            {record.name}
          </Link>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (price: number) => price?.toFixed(2) || '-',
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      align: 'right' as const,
      render: (change: number, record: Stock) => (
        <Text type={record.changePercent >= 0 ? 'danger' : 'success'}>
          {change?.toFixed(2) || '-'}
        </Text>
      ),
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      align: 'right' as const,
      render: (pct: number) => (
        <Tag color={pct >= 0 ? 'red' : 'green'}>
          {pct ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : '-'}
        </Tag>
      ),
    },
  ]

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Watchlist"
              value={stocks.length}
              suffix="stocks"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="AI Analysis"
              value="Ready"
              valueStyle={{ color: '#1677ff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/watchlist')}>
              Add Stock
            </Button>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Title level={4} style={{ marginBottom: 16 }}>My Watchlist</Title>
        {loading ? null : stocks.length === 0 ? (
          <Empty description="No stocks in watchlist" />
        ) : (
          <Table
            columns={columns}
            dataSource={stocks}
            rowKey="code"
            pagination={false}
            onRow={(record) => ({
              onClick: () => navigate(`/stock/${record.code}`),
              style: { cursor: 'pointer' }
            })}
          />
        )}
      </Card>
    </div>
  )
}