import { useState, useEffect, useCallback } from 'react'
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
  Drawer,
  Typography,
} from 'antd'
import {
  ThunderboltOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { eventApi } from '../../services/api'
import type { EventSource, EventJob } from '../../types/api'

const { Text } = Typography

const sourceTypeLabels: Record<string, string> = {
  stock_news: '个股新闻',
  stock_notice: '个股公告',
  macro_data: '宏观数据',
  stock_price: '个股行情',
  stock_fundamental: '个股财务',
  sector_data: '板块轮动',
  international: '国际市场',
}
const scopeLabels: Record<string, string> = {
  individual: '个股',
  sector: '板块',
  market: '市场',
}
const statusColors: Record<string, string> = {
  success: 'green',
  failed: 'red',
  running: 'blue',
  completed: 'green',
  cancelled: 'orange',
}
const statusLabels: Record<string, string> = {
  success: '成功',
  failed: '失败',
  running: '运行中',
  completed: '已完成',
  cancelled: '已取消',
}

export default function DataSourceList() {
  const [sources, setSources] = useState<EventSource[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingSource, setEditingSource] = useState<EventSource | null>(null)
  const [detailSource, setDetailSource] = useState<EventSource | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sourceJobs, setSourceJobs] = useState<EventJob[]>([])
  const [sourceJobsLoading, setSourceJobsLoading] = useState(false)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const fetchSources = useCallback(async () => {
    setLoading(true)
    try {
      const res = await eventApi.getSources()
      if (res.data?.code === 0) setSources(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSources()
  }, [fetchSources])

  const handleTrigger = async (id: number) => {
    try {
      const res = await eventApi.triggerSource(id)
      if (res.data?.code === 0) {
        const data = res.data.data || {}
        if (data.status === 'error') message.error(`采集失败: ${data.message || '未知错误'}`)
        else {
          message.success(`采集完成: 新事件 ${data.new_events ?? 0} 条`)
          fetchSources()
        }
      }
    } catch {
      message.error('采集失败')
    }
  }

  const handleDeleteSource = async (id: number) => {
    try {
      await eventApi.deleteSource(id)
      message.success('删除成功')
      fetchSources()
    } catch {
      message.error('删除失败')
    }
  }

  const handleCreateSource = async () => {
    try {
      const values = await createForm.validateFields()
      let config = {}
      try {
        config = values.config ? JSON.parse(values.config) : {}
      } catch {
        message.error('config 不是有效的 JSON')
        return
      }
      const res = await eventApi.createSource({ ...values, config })
      if (res.data?.code === 0) {
        message.success('创建成功')
        setShowCreate(false)
        createForm.resetFields()
        fetchSources()
      }
    } catch {
      // ignore
    }
  }

  const handleEditSource = (source: EventSource) => {
    setEditingSource(source)
    editForm.setFieldsValue({
      name: source.name,
      source_type: source.source_type,
      scope: source.scope,
      schedule: source.schedule,
      config: source.config ? JSON.stringify(source.config, null, 2) : '',
      enabled: source.enabled,
    })
    setShowEdit(true)
  }

  const handleUpdateSource = async () => {
    if (!editingSource) return
    try {
      const values = await editForm.validateFields()
      let config = editingSource.config || {}
      if (values.config) {
        try {
          config = JSON.parse(values.config)
        } catch {
          message.error('config 不是有效的 JSON')
          return
        }
      }
      const res = await eventApi.updateSource(editingSource.id, { ...values, config })
      if (res.data?.code === 0) {
        message.success('更新成功')
        setShowEdit(false)
        setEditingSource(null)
        fetchSources()
      }
    } catch {
      // ignore
    }
  }

  const openDetail = async (source: EventSource) => {
    setDetailSource(source)
    setDrawerOpen(true)
    setSourceJobsLoading(true)
    try {
      const res = await eventApi.getJobs({ limit: 50, source_id: source.id })
      if (res.data?.code === 0) setSourceJobs(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setSourceJobsLoading(false)
    }
  }

  const sourceColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, record: EventSource) => (
        <Space>
          <Text strong style={{ color: 'var(--text-primary)' }}>
            {v}
          </Text>
          {record.is_builtin === 1 && (
            <Tag color="blue" style={{ borderRadius: 6 }}>
              内置
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'source_type',
      key: 'source_type',
      render: (v: string) => (
        <Tag style={{ borderRadius: 6, background: 'var(--bg-elevated)', border: 'none' }}>
          {sourceTypeLabels[v] || v}
        </Tag>
      ),
    },
    {
      title: '范围',
      dataIndex: 'scope',
      key: 'scope',
      render: (v: string) => scopeLabels[v] || v,
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
      width: 260,
      render: (_: unknown, record: EventSource) => (
        <Space size="small">
          <Button
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => handleTrigger(record.id)}
          >
            采集
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditSource(record)}>
            编辑
          </Button>
          <Button size="small" icon={<InfoCircleOutlined />} onClick={() => openDetail(record)}>
            详情
          </Button>
          {record.is_builtin !== 1 && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDeleteSource(record.id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        styles={{ body: { padding: 0 } }}
        title={<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>数据源列表</span>}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchSources} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>
              新建数据源
            </Button>
          </Space>
        }
      >
        <Table
          columns={sourceColumns}
          dataSource={sources}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: '暂无数据源配置' }}
        />
      </Card>

      {/* Create Source Modal */}
      <Modal
        title="新建数据源"
        open={showCreate}
        onOk={handleCreateSource}
        onCancel={() => setShowCreate(false)}
        okText="创建"
        width={560}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
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
                { value: 'stock_price', label: '个股行情' },
                { value: 'stock_fundamental', label: '个股财务' },
                { value: 'sector_data', label: '板块轮动' },
                { value: 'international', label: '国际市场' },
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
              placeholder={'{\n  "source": "eastmoney",\n  "api": "stock_news_em"\n}'}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Source Modal */}
      <Modal
        title="编辑数据源"
        open={showEdit}
        onOk={handleUpdateSource}
        onCancel={() => {
          setShowEdit(false)
          setEditingSource(null)
        }}
        okText="保存"
        width={560}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="source_type" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'stock_news', label: '个股新闻' },
                { value: 'stock_notice', label: '个股公告' },
                { value: 'macro_data', label: '宏观数据' },
                { value: 'stock_price', label: '个股行情' },
                { value: 'stock_fundamental', label: '个股财务' },
                { value: 'sector_data', label: '板块轮动' },
                { value: 'international', label: '国际市场' },
              ]}
            />
          </Form.Item>
          <Form.Item name="scope" label="范围">
            <Select
              options={[
                { value: 'individual', label: '个股' },
                { value: 'sector', label: '板块' },
                { value: 'market', label: '市场' },
              ]}
            />
          </Form.Item>
          <Form.Item name="schedule" label="调度 (Cron)">
            <Input />
          </Form.Item>
          <Form.Item name="config" label="配置 (JSON)">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="enabled" label="启用状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '禁用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title={detailSource ? `数据源详情: ${detailSource.name}` : '数据源详情'}
        placement="right"
        width={600}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {detailSource && (
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <div>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                基本信息
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Text type="secondary">名称</Text>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {detailSource.name}
                  </div>
                </div>
                <div>
                  <Text type="secondary">类型</Text>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {sourceTypeLabels[detailSource.source_type] || detailSource.source_type}
                  </div>
                </div>
                <div>
                  <Text type="secondary">范围</Text>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {scopeLabels[detailSource.scope] || detailSource.scope}
                  </div>
                </div>
                <div>
                  <Text type="secondary">调度</Text>
                  <div style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {detailSource.schedule}
                  </div>
                </div>
                <div>
                  <Text type="secondary">启用状态</Text>
                  <div>
                    <Tag color={detailSource.enabled === 1 ? 'green' : 'default'}>
                      {detailSource.enabled === 1 ? '启用' : '禁用'}
                    </Tag>
                    {detailSource.is_builtin === 1 && <Tag color="blue">内置</Tag>}
                  </div>
                </div>
                <div>
                  <Text type="secondary">上次采集</Text>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {detailSource.last_fetched_at
                      ? new Date(detailSource.last_fetched_at).toLocaleString()
                      : '从未'}
                  </div>
                </div>
              </div>
              {detailSource.last_error && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">上次错误</Text>
                  <div style={{ color: 'var(--down)', fontSize: 12 }}>
                    {detailSource.last_error}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDrawerOpen(false)
                    handleEditSource(detailSource)
                  }}
                >
                  编辑
                </Button>
              </div>
            </div>
            <div>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                历史采集任务
              </Text>
              <Table
                columns={[
                  { title: 'ID', dataIndex: 'id', key: 'id', width: 50 },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (s: string) => (
                      <Tag color={statusColors[s] || 'default'} style={{ borderRadius: 6 }}>
                        {statusLabels[s] || s}
                      </Tag>
                    ),
                  },
                  {
                    title: '新事件',
                    dataIndex: 'new_events_count',
                    key: 'new_events_count',
                    width: 70,
                    align: 'right' as const,
                  },
                  {
                    title: '重复',
                    dataIndex: 'duplicate_count',
                    key: 'duplicate_count',
                    width: 70,
                    align: 'right' as const,
                  },
                  {
                    title: '错误',
                    dataIndex: 'error_count',
                    key: 'error_count',
                    width: 70,
                    align: 'right' as const,
                  },
                  {
                    title: '开始时间',
                    dataIndex: 'started_at',
                    key: 'started_at',
                    render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
                  },
                  {
                    title: '完成时间',
                    dataIndex: 'completed_at',
                    key: 'completed_at',
                    render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
                  },
                ]}
                dataSource={sourceJobs}
                rowKey="id"
                loading={sourceJobsLoading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: '暂无历史任务' }}
              />
            </div>
          </Space>
        )}
      </Drawer>
    </>
  )
}
