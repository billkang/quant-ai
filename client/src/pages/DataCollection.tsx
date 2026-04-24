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
  Typography,
  Tabs,
  Drawer,
  Progress,
} from 'antd'
import type { TabsProps } from 'antd'
import {
  ApiOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  CloudSyncOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { eventApi, collectionApi, dataChannelApi, sectorApi } from '../services/api'
import type { EventSource, EventJob, CollectionJobItem } from '../types/api'

const { Title, Text } = Typography

const sourceTypeLabels: Record<string, string> = {
  stock_news: '个股新闻',
  stock_notice: '个股公告',
  macro_data: '宏观数据',
  stock_price: '个股行情',
  stock_fundamental: '个股财务',
  sector_data: '板块轮动',
  international: '国际市场',
}
const scopeLabels: Record<string, string> = { individual: '个股', sector: '板块', market: '市场' }
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

export default function DataCollection() {
  const [activeTab, setActiveTab] = useState('sources')

  // Sources
  const [sources, setSources] = useState<EventSource[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingSource, setEditingSource] = useState<EventSource | null>(null)
  const [detailSource, setDetailSource] = useState<EventSource | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sourceJobs, setSourceJobs] = useState<EventJob[]>([])
  const [sourceJobsLoading, setSourceJobsLoading] = useState(false)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  // Monitor
  const [eventJobs, setEventJobs] = useState<EventJob[]>([])
  const [collectionJobs, setCollectionJobs] = useState<CollectionJobItem[]>([])
  const [monitorLoading, setMonitorLoading] = useState(false)
  const [monitorStatusFilter, setMonitorStatusFilter] = useState<string | undefined>(undefined)

  // Channels
  const [channels, setChannels] = useState<Record<string, unknown>[]>([])
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Record<string, unknown> | null>(null)
  const [channelForm] = Form.useForm()

  // Sectors
  const [sectors, setSectors] = useState<Record<string, unknown>[]>([])
  const [sectorsLoading, setSectorsLoading] = useState(false)

  const fetchSources = useCallback(async () => {
    setSourcesLoading(true)
    try {
      const res = await eventApi.getSources()
      if (res.data?.code === 0) setSources(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setSourcesLoading(false)
    }
  }, [])

  const fetchEventJobs = useCallback(async () => {
    try {
      const res = await eventApi.getJobs(50)
      if (res.data?.code === 0) setEventJobs(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const fetchCollectionJobs = useCallback(async () => {
    try {
      const res = await collectionApi.getJobs({ pageSize: 50 })
      if (res.data?.code === 0) setCollectionJobs(res.data.data.items || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const fetchChannels = useCallback(async () => {
    setChannelsLoading(true)
    try {
      const res = await dataChannelApi.getChannels()
      if (res.data?.code === 0) setChannels(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setChannelsLoading(false)
    }
  }, [])

  const fetchSectors = useCallback(async () => {
    setSectorsLoading(true)
    try {
      const res = await sectorApi.getSectors()
      if (res.data?.code === 0) setSectors(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setSectorsLoading(false)
    }
  }, [])

  const fetchMonitorData = useCallback(async () => {
    setMonitorLoading(true)
    await Promise.all([fetchEventJobs(), fetchCollectionJobs()])
    setMonitorLoading(false)
  }, [fetchEventJobs, fetchCollectionJobs])

  useEffect(() => {
    fetchSources()
  }, [fetchSources])
  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])
  useEffect(() => {
    fetchSectors()
  }, [fetchSectors])
  useEffect(() => {
    if (activeTab === 'monitor') {
      fetchMonitorData()
      const i = setInterval(fetchMonitorData, 5000)
      return () => clearInterval(i)
    }
  }, [activeTab, fetchMonitorData])

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知错误'
      message.error(`采集失败: ${msg}`)
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
    } catch (e) {
      console.error(e)
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
    } catch (e) {
      console.error(e)
    }
  }

  const openDetail = async (source: EventSource) => {
    setDetailSource(source)
    setDrawerOpen(true)
    setSourceJobsLoading(true)
    try {
      const res = await eventApi.getJobs(50, source.id)
      if (res.data?.code === 0) setSourceJobs(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setSourceJobsLoading(false)
    }
  }

  // Channel actions
  const handleSaveChannel = async () => {
    try {
      const values = await channelForm.validateFields()
      if (editingChannel) {
        const res = await dataChannelApi.updateChannel(editingChannel.id, values)
        if (res.data?.code === 0) {
          message.success('更新成功')
          setShowChannelModal(false)
          setEditingChannel(null)
          fetchChannels()
        }
      } else {
        const res = await dataChannelApi.createChannel(values)
        if (res.data?.code === 0) {
          message.success('创建成功')
          setShowChannelModal(false)
          fetchChannels()
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteChannel = async (id: number) => {
    try {
      await dataChannelApi.deleteChannel(id)
      message.success('删除成功')
      fetchChannels()
    } catch {
      message.error('删除失败')
    }
  }

  // Sector actions
  const handleToggleSector = async (sector: Record<string, unknown>) => {
    try {
      const res = await sectorApi.updateSector(sector.id, { is_enabled: sector.isEnabled ? 0 : 1 })
      if (res.data?.code === 0) {
        message.success('更新成功')
        fetchSectors()
      }
    } catch {
      message.error('更新失败')
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
    { title: '范围', dataIndex: 'scope', key: 'scope', render: (v: string) => scopeLabels[v] || v },
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
      width: 240,
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

  const jobColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '类型',
      key: 'jobType',
      render: (_: unknown, record: Record<string, unknown>) => (
        <Tag style={{ borderRadius: 6 }}>
          {record.jobType
            ? record.jobType === 'stock_collection'
              ? '股票采集'
              : '新闻采集'
            : '事件采集'}
        </Tag>
      ),
    },
    {
      title: '数据源',
      key: 'source',
      render: (_: unknown, record: Record<string, unknown>) => {
        if (record.source_id) {
          const src = sources.find(s => s.id === record.source_id)
          return (
            <Text style={{ color: 'var(--text-secondary)' }}>
              {src?.name || `源#${record.source_id}`}
            </Text>
          )
        }
        return (
          <Text style={{ color: 'var(--text-muted)' }}>
            {record.jobType === 'stock_collection' ? '行情采集' : '新闻采集'}
          </Text>
        )
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, record: Record<string, unknown>) => (
        <Tag color={statusColors[record.status] || 'default'} style={{ borderRadius: 6 }}>
          {statusLabels[record.status] || record.status}
        </Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: unknown, record: Record<string, unknown>) => {
        const pct = record.progress || 0
        if (record.status === 'running' || pct > 0) return <Progress percent={pct} size="small" />
        return <Text style={{ color: 'var(--text-muted)' }}>-</Text>
      },
    },
    {
      title: '新事件',
      key: 'new_events',
      render: (_: unknown, record: Record<string, unknown>) => (
        <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {record.new_events_count ?? '-'}
        </Text>
      ),
    },
    {
      title: '开始时间',
      key: 'started_at',
      render: (_: unknown, record: Record<string, unknown>) => {
        const t = record.started_at || record.startTime
        return t ? new Date(t).toLocaleString() : '-'
      },
    },
    {
      title: '完成时间',
      key: 'completed_at',
      render: (_: unknown, record: Record<string, unknown>) => {
        const t = record.completed_at || record.endTime
        return t ? new Date(t).toLocaleString() : '-'
      },
    },
  ]

  const allJobs = [
    ...eventJobs.map(j => ({ ...j, _type: 'event' })),
    ...collectionJobs.map(j => ({ ...j, _type: 'collection' })),
  ]
    .filter((j: Record<string, unknown>) => {
      if (!monitorStatusFilter) return true
      return j.status === monitorStatusFilter
    })
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const ta = new Date(a.started_at || a.startTime || 0).getTime()
      const tb = new Date(b.started_at || b.startTime || 0).getTime()
      return tb - ta
    })

  const tabItems: TabsProps['items'] = [
    {
      key: 'sources',
      label: (
        <span>
          <ApiOutlined style={{ marginRight: 6 }} />
          采集源
        </span>
      ),
      children: (
        <Card
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
          bodyStyle={{ padding: 0 }}
          title={<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>数据源列表</span>}
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchSources} loading={sourcesLoading}>
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
            loading={sourcesLoading}
            pagination={{ pageSize: 20 }}
            size="small"
            locale={{ emptyText: '暂无数据源配置' }}
          />
        </Card>
      ),
    },
    {
      key: 'monitor',
      label: (
        <span>
          <ScheduleOutlined style={{ marginRight: 6 }} />
          采集监控
        </span>
      ),
      children: (
        <Card
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
          bodyStyle={{ padding: 0 }}
          title={
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>采集任务监控</span>
          }
          extra={
            <Space>
              <Select
                placeholder="状态筛选"
                allowClear
                style={{ width: 120 }}
                onChange={v => setMonitorStatusFilter(v)}
                options={[
                  { value: 'running', label: '运行中' },
                  { value: 'success', label: '成功' },
                  { value: 'completed', label: '已完成' },
                  { value: 'failed', label: '失败' },
                  { value: 'cancelled', label: '已取消' },
                ]}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchMonitorData} loading={monitorLoading}>
                刷新
              </Button>
            </Space>
          }
        >
          <Table
            columns={jobColumns}
            dataSource={allJobs}
            rowKey={(record: Record<string, unknown>) => `${record._type}-${record.id}`}
            loading={monitorLoading}
            pagination={{ pageSize: 20 }}
            size="small"
            locale={{ emptyText: '暂无任务记录' }}
          />
        </Card>
      ),
    },
    {
      key: 'channels',
      label: (
        <span>
          <GlobalOutlined style={{ marginRight: 6 }} />
          渠道管理
        </span>
      ),
      children: (
        <Card
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
          bodyStyle={{ padding: 0 }}
          title={
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>数据渠道列表</span>
          }
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchChannels} loading={channelsLoading}>
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingChannel(null)
                  channelForm.resetFields()
                  setShowChannelModal(true)
                }}
              >
                新建渠道
              </Button>
            </Space>
          }
        >
          <Table
            columns={[
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
                title: '提供商',
                dataIndex: 'provider',
                key: 'provider',
                render: (v: string) => <Tag style={{ borderRadius: 6 }}>{v}</Tag>,
              },
              {
                title: 'Endpoint',
                dataIndex: 'endpoint',
                key: 'endpoint',
                render: (v: string) => (
                  <Text style={{ color: 'var(--text-muted)' }}>{v || '-'}</Text>
                ),
              },
              { title: '超时', dataIndex: 'timeout', key: 'timeout', width: 80 },
              {
                title: '启用',
                dataIndex: 'isActive',
                key: 'isActive',
                render: (v: number) => <Switch checked={v === 1} disabled size="small" />,
              },
              {
                title: '操作',
                key: 'action',
                render: (_: unknown, record: Record<string, unknown>) => (
                  <Space size="small">
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingChannel(record)
                        channelForm.setFieldsValue(record)
                        setShowChannelModal(true)
                      }}
                    >
                      编辑
                    </Button>
                    <Popconfirm title="确认删除？" onConfirm={() => handleDeleteChannel(record.id)}>
                      <Button size="small" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={channels}
            rowKey="id"
            loading={channelsLoading}
            pagination={{ pageSize: 20 }}
            size="small"
            locale={{ emptyText: '暂无渠道配置' }}
          />
        </Card>
      ),
    },
    {
      key: 'sectors',
      label: (
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          板块管理
        </span>
      ),
      children: (
        <Card
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
          bodyStyle={{ padding: 0 }}
          title={
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>板块分类管理</span>
          }
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchSectors} loading={sectorsLoading}>
              刷新
            </Button>
          }
        >
          <Table
            columns={[
              {
                title: '代码',
                dataIndex: 'code',
                key: 'code',
                width: 80,
                render: (v: string) => (
                  <Text style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
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
                title: '级别',
                dataIndex: 'level',
                key: 'level',
                width: 80,
                render: (v: number) => (v === 1 ? '一级' : '二级'),
              },
              {
                title: '来源',
                dataIndex: 'source',
                key: 'source',
                width: 100,
                render: (v: string) => <Tag style={{ borderRadius: 6 }}>{v?.toUpperCase()}</Tag>,
              },
              {
                title: '启用',
                dataIndex: 'isEnabled',
                key: 'isEnabled',
                width: 100,
                render: (_: unknown, record: Record<string, unknown>) => (
                  <Switch
                    checked={record.isEnabled === 1}
                    onChange={() => handleToggleSector(record)}
                  />
                ),
              },
            ]}
            dataSource={sectors}
            rowKey="id"
            loading={sectorsLoading}
            pagination={{ pageSize: 20 }}
            size="small"
            locale={{ emptyText: '暂无板块数据' }}
          />
        </Card>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <CloudSyncOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          数据采集
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          统一管理数据采集源、渠道、板块分类与采集任务
        </Text>
      </div>
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={setActiveTab}
        style={{ color: 'var(--text-primary)' }}
      />

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
              placeholder={`{\n  "source": "eastmoney",\n  "api": "stock_news_em"\n}`}
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
              <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: 12 }}>
                基本信息
              </Title>
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
              <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: 12 }}>
                历史采集任务
              </Title>
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
                size="small"
                locale={{ emptyText: '暂无历史任务' }}
              />
            </div>
          </Space>
        )}
      </Drawer>

      {/* Channel Modal */}
      <Modal
        title={editingChannel ? '编辑渠道' : '新建渠道'}
        open={showChannelModal}
        onOk={handleSaveChannel}
        onCancel={() => {
          setShowChannelModal(false)
          setEditingChannel(null)
        }}
        okText={editingChannel ? '保存' : '创建'}
        width={560}
      >
        <Form form={channelForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="provider" label="提供商" rules={[{ required: true }]}>
            <Input placeholder="如：akshare / eastmoney / yahoo" />
          </Form.Item>
          <Form.Item name="endpoint" label="Endpoint">
            <Input placeholder="可选 API 基础地址" />
          </Form.Item>
          <Form.Item name="timeout" label="超时 (秒)" initialValue={30}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="proxy_url" label="代理地址">
            <Input placeholder="可选 HTTP 代理" />
          </Form.Item>
          <Form.Item name="is_active" label="启用状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '禁用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
