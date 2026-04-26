import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm, Typography } from 'antd'
import { DeleteOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import { stockApi } from '../../services/api'

const { Text } = Typography

interface StockItem {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function StockList({ onAdd }: { onAdd: () => void }) {
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStocks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await stockApi.getWatchlist()
      setStocks(res.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  const handleRemove = async (code: string) => {
    try {
      await stockApi.removeStock(code)
      message.success('删除成功')
      fetchStocks()
    } catch {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
          {v}
        </Text>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => (
        <Text strong style={{ color: 'var(--text-primary)' }}>
          {v}
        </Text>
      ),
    },
    {
      title: '最新价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (v: number) => (
        <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          ¥{v?.toFixed(2) || '-'}
        </Text>
      ),
    },
    {
      title: '涨跌幅',
      key: 'change',
      width: 120,
      render: (_: unknown, record: StockItem) => {
        const isUp = (record.changePercent || 0) >= 0
        return (
          <Tag
            style={{
              borderRadius: 6,
              background: isUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: isUp ? '#22c55e' : '#ef4444',
              border: 'none',
              fontWeight: 600,
            }}
          >
            {isUp ? '+' : ''}
            {record.changePercent?.toFixed(2)}%
          </Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: StockItem) => (
        <Popconfirm title="确认删除？" onConfirm={() => handleRemove(record.code)}>
          <Button size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          自选股列表
        </Text>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchStocks} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            添加股票
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={stocks}
        rowKey="code"
        loading={loading}
        pagination={{ pageSize: 20 }}
        locale={{ emptyText: '暂无自选股，点击"添加股票"开始' }}
      />
    </div>
  )
}
