import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Switch,
  Tag,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Typography,
} from 'antd'
import { ApiOutlined, ThunderboltOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { eventApi } from '../services/api'
import type { EventSource } from '../types/api'

const { Text } = Typography

export default function EventSourcesPage() {
  const [sources, setSources] = useState<EventSource[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form] = Form.useForm()

  const fetchSources = async () => {
    setLoading(true)
    try {
      const res = await eventApi.getSources()
      if (res.data?.code === 0) {
        setSources(res.data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const handleTrigger = async (id: number) => {
    try {
      const res = await eventApi.triggerSource(id)
      if (res.data?.code === 0) {
        message.success(`采集完成: 新事件 ${res.data.data?.new_events ?? 0} 条`)
        fetchSources()
      }
    } catch {
      message.error('采集失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await eventApi.deleteSource(id)
      message.success('删除成功')
      fetchSources()
    } catch {
      message.error('删除失败')
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      let config = {}
      try {
        config = values.config ? JSON.parse(values.config) : {}
      } catch {
        message.error('config 不是有效的 JSON')
        return
      }
      const res = await eventApi.createSource({ ...values, config })
      if (res.data?.code === 0) {
        message.success('数据源创建成功')
        setShowCreate(false)
        form.resetFields()
        fetchSources()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const columns = [
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
      title: '类型',
      dataIndex: 'source_type',
      key: 'source_type',
      render: (v: string) => (
        <Tag style={{ borderRadius: 6, background: 'var(--bg-elevated)', border: 'none' }}>{v}</Tag>
      ),
    },
    {
      title: '范围',
      dataIndex: 'scope',
      key: 'scope',
      render: (v: string) => (v === 'individual' ? '个股' : v === 'sector' ? '板块' : '市场'),
    },
    {
      title: '调度',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{v}</Text>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: number) => <Switch checked={enabled === 1} disabled size="small" />,
    },
    {
      title: '上次采集',
      dataIndex: 'last_fetched_at',
      key: 'last_fetched_at',
      render: (v: string) =>
        v ? new Date(v).toLocaleString() : <span style={{ color: 'var(--text-muted)' }}>从未</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: EventSource) => (
        <Space>
          <Button
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => handleTrigger(record.id)}
          >
            采集
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>数据源配置</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
          管理事件数据采集源与调度策略
        </p>
      </div>

      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        bodyStyle={{ padding: 0 }}
        title={
          <Space>
            <ApiOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>数据源列表</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>
            新建数据源
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sources}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无数据源配置' }}
        />
      </Card>

      <Modal
        title="新建数据源"
        open={showCreate}
        onOk={handleCreate}
        onCancel={() => setShowCreate(false)}
        okText="创建"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：东方财富个股新闻" />
          </Form.Item>
          <Form.Item
            name="source_type"
            label="类型"
            rules={[{ required: true }]}
            initialValue="stock_news"
          >
            <Select
              options={[
                { value: 'stock_news', label: '个股新闻' },
                { value: 'stock_notice', label: '个股公告' },
                { value: 'macro_data', label: '宏观数据' },
              ]}
            />
          </Form.Item>
          <Form.Item name="scope" label="范围" initialValue="individual">
            <Select
              options={[
                { value: 'individual', label: '个股' },
                { value: 'sector', label: '板块' },
                { value: 'market', label: '市场' },
              ]}
            />
          </Form.Item>
          <Form.Item name="schedule" label="调度 (Cron)" initialValue="0 */6 * * *">
            <Input placeholder="如：0 */6 * * *" />
          </Form.Item>
          <Form.Item name="config" label="配置 (JSON)">
            <Input.TextArea
              rows={4}
              placeholder={`{\n  "source": "eastmoney",\n  "api": "stock_news_em"\n}`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
