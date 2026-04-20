import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Table, Button, Input, Space, Modal, message, Card, Typography, Tag, Popconfirm } from 'antd'

const { Title } = Typography

interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function Watchlist() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [newCode, setNewCode] = useState('')
  const [loading, setLoading] = useState(true)

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
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: Stock) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{record.name}</span>
          <span className="text-gray-400 text-sm">{record.code}</span>
        </Space>
      ),
    },
    {
      title: '现价',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (price: number) => price?.toFixed(2) || '-',
    },
    {
      title: '涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      align: 'right' as const,
      render: (pct: number) => (
        <Tag color={pct >= 0 ? 'red' : 'green'}>
          {pct ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : '-'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      render: (_: unknown, record: Stock) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/stock/${record.code}`)}>
            详情
          </Button>
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
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <Title level={2} className="mb-4">自选股管理</Title>

      <Card className="mb-4" bordered={false}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="输入股票代码 (如: 600519 或 00700.HK)"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            onPressEnter={addStock}
          />
          <Button type="primary" onClick={addStock} disabled={!newCode}>
            添加
          </Button>
        </Space.Compact>
      </Card>

      <Table
        columns={columns}
        dataSource={stocks}
        loading={loading}
        rowKey="code"
        pagination={false}
        locale={{ emptyText: '暂无自选股，请添加' }}
      />
    </Card>
  )
}