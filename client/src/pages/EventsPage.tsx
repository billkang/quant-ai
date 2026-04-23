import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Input,
  Button,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
  Drawer,
  Descriptions,
  Typography,
} from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { eventApi } from '../services/api'
import type { EventItem } from '../types/api'

const { Title, Text } = Typography

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [scope, setScope] = useState<string | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { limit: 100 }
      if (symbol) params.symbol = symbol
      if (scope) params.scope = scope
      const res = await eventApi.getEvents(params)
      if (res.data?.code === 0) {
        setEvents(res.data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await eventApi.deleteEvent(id)
      message.success('删除成功')
      fetchEvents()
    } catch {
      message.error('删除失败')
    }
  }

  const openDetail = (event: EventItem) => {
    setSelectedEvent(event)
    setShowDetail(true)
  }

  const scopeColors: Record<string, string> = {
    individual: '#3b82f6',
    sector: '#a855f7',
    market: '#f59e0b',
  }

  const scopeLabels: Record<string, string> = {
    individual: '个股',
    sector: '板块',
    market: '市场',
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (v: string, record: EventItem) => (
        <Button
          type="link"
          style={{ padding: 0, textAlign: 'left', whiteSpace: 'normal', height: 'auto' }}
          onClick={() => openDetail(record)}
        >
          {v}
        </Button>
      ),
    },
    {
      title: '股票',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      render: (v: string) => v || '-',
    },
    {
      title: '板块',
      dataIndex: 'sector',
      key: 'sector',
      width: 160,
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: '范围',
      dataIndex: 'scope',
      key: 'scope',
      width: 80,
      render: (v: string) => (
        <Tag
          style={{
            borderRadius: 6,
            background: `${scopeColors[v] || '#64748b'}15`,
            color: scopeColors[v] || '#64748b',
            border: 'none',
          }}
        >
          {scopeLabels[v] || v}
        </Tag>
      ),
    },
    {
      title: '情感',
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 80,
      align: 'right' as const,
      render: (v: number) => (
        <span
          style={{
            color: v > 0 ? 'var(--up)' : v < 0 ? 'var(--down)' : 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          {v?.toFixed(2) ?? '-'}
        </span>
      ),
    },
    {
      title: '强度',
      dataIndex: 'strength',
      key: 'strength',
      width: 80,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ color: 'var(--text-secondary)' }}>{v?.toFixed(2) ?? '-'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: EventItem) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
          />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          事件查询
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          浏览和管理系统采集的事件信号
        </Text>
      </div>

      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} lg={6}>
            <Input
              placeholder="股票代码"
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} lg={4}>
            <Select
              placeholder="事件范围"
              value={scope}
              onChange={v => setScope(v)}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 'individual', label: '个股' },
                { value: 'sector', label: '板块' },
                { value: 'market', label: '市场' },
              ]}
            />
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={fetchEvents}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchEvents}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          size="small"
          locale={{ emptyText: '暂无事件数据' }}
        />
      </Card>

      <Drawer
        title="事件详情"
        placement="right"
        width={480}
        onClose={() => setShowDetail(false)}
        open={showDetail}
      >
        {selectedEvent && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="标题">{selectedEvent.title}</Descriptions.Item>
            <Descriptions.Item label="股票">{selectedEvent.symbol || '-'}</Descriptions.Item>
            <Descriptions.Item label="板块">{selectedEvent.sector || '-'}</Descriptions.Item>
            <Descriptions.Item label="范围">
              <Tag
                style={{
                  borderRadius: 6,
                  background: `${scopeColors[selectedEvent.scope]}15`,
                  color: scopeColors[selectedEvent.scope],
                  border: 'none',
                }}
              >
                {scopeLabels[selectedEvent.scope]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="情感">
              {selectedEvent.sentiment?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="强度">{selectedEvent.strength?.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="确定性">
              {selectedEvent.certainty?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="紧急度">
              {selectedEvent.urgency?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="标签">
              {(selectedEvent.tags || []).join(', ') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="信号">
              <pre
                style={{
                  background: 'var(--bg-elevated)',
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 12,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(selectedEvent.signals || {}, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
