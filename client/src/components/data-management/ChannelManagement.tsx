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
} from 'antd'
import { ReloadOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { channelApi, eventApi } from '../../services/api'
import type { ChannelItem, EventSource } from '../../types/api'

const { Text } = Typography

const methodLabels: Record<string, string> = {
  api: 'API接口',
  rss: 'RSS订阅',
  crawler: '爬虫抓取',
  akshare: 'AkShare',
}

export default function ChannelManagement() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [sources, setSources] = useState<EventSource[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingChannel, setEditingChannel] = useState<ChannelItem | null>(null)
  const [form] = Form.useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [chRes, srcRes] = await Promise.all([channelApi.getChannels(), eventApi.getSources()])
      if (chRes.data?.code === 0) setChannels(chRes.data.data || [])
      if (srcRes.data?.code === 0) setSources(srcRes.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleEnabled = async (channel: ChannelItem) => {
    try {
      const res = await channelApi.updateChannel(channel.id, {
        enabled: channel.enabled === 1 ? 0 : 1,
      })
      if (res.data?.code === 0) {
        message.success('状态更新成功')
        fetchData()
      }
    } catch {
      message.error('更新失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await channelApi.deleteChannel(id)
      message.success('删除成功')
      fetchData()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingChannel) {
        const res = await channelApi.updateChannel(editingChannel.id, values)
        if (res.data?.code === 0) {
          message.success('更新成功')
          setShowModal(false)
          setEditingChannel(null)
          fetchData()
        }
      } else {
        const res = await channelApi.createChannel(values)
        if (res.data?.code === 0) {
          message.success('创建成功')
          setShowModal(false)
          form.resetFields()
          fetchData()
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const openEdit = (channel: ChannelItem) => {
    setEditingChannel(channel)
    form.setFieldsValue({
      data_source_id: channel.dataSourceId,
      name: channel.name,
      collection_method: channel.collectionMethod,
      endpoint: channel.endpoint,
      timeout: channel.timeout,
      proxy_url: channel.proxyUrl,
      enabled: channel.enabled,
      config: channel.config ? JSON.stringify(channel.config, null, 2) : '',
    })
    setShowModal(true)
  }

  const openCreate = () => {
    setEditingChannel(null)
    form.resetFields()
    form.setFieldsValue({
      collection_method: 'api',
      timeout: 30,
      enabled: 1,
    })
    setShowModal(true)
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
      title: '数据源',
      dataIndex: 'dataSourceName',
      key: 'dataSourceName',
      render: (v: string) => v || '-',
    },
    {
      title: '被引用数据源',
      dataIndex: 'referencingSourceNames',
      key: 'referencingSourceNames',
      render: (v: string[]) => (v && v.length > 0 ? v.join(', ') : '-'),
    },
    {
      title: '采集方式',
      dataIndex: 'collectionMethod',
      key: 'collectionMethod',
      render: (v: string) => (
        <Tag style={{ borderRadius: 6, background: 'var(--bg-elevated)', border: 'none' }}>
          {methodLabels[v] || v}
        </Tag>
      ),
    },
    {
      title: '端点',
      dataIndex: 'endpoint',
      key: 'endpoint',
      ellipsis: true,
      render: (v: string) => <Text style={{ color: 'var(--text-muted)' }}>{v || '-'}</Text>,
    },
    {
      title: '激活',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (_: number, record: ChannelItem) => (
        <Switch
          checked={record.enabled === 1}
          onChange={() => handleToggleEnabled(record)}
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: ChannelItem) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
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
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      bodyStyle={{ padding: 0 }}
      title={<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>渠道管理</span>}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建渠道
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={channels}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="small"
        locale={{ emptyText: '暂无渠道配置' }}
      />

      <Modal
        title={editingChannel ? '编辑渠道' : '新建渠道'}
        open={showModal}
        onOk={handleSave}
        onCancel={() => {
          setShowModal(false)
          setEditingChannel(null)
        }}
        okText={editingChannel ? '保存' : '创建'}
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="data_source_id" label="所属数据源" rules={[{ required: true }]}>
            <Select
              placeholder="选择数据源"
              options={sources.map(s => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：东方财富个股新闻" />
          </Form.Item>
          <Form.Item
            name="collection_method"
            label="采集方式"
            rules={[{ required: true }]}
            initialValue="api"
          >
            <Select
              options={[
                { value: 'api', label: 'API接口' },
                { value: 'rss', label: 'RSS订阅' },
                { value: 'crawler', label: '爬虫抓取' },
                { value: 'akshare', label: 'AkShare' },
              ]}
            />
          </Form.Item>
          <Form.Item name="endpoint" label="端点地址">
            <Input placeholder="如：https://api.example.com/v1/news" />
          </Form.Item>
          <Form.Item name="timeout" label="超时 (秒)" initialValue={30}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="proxy_url" label="代理地址">
            <Input placeholder="可选 HTTP 代理" />
          </Form.Item>
          <Form.Item name="config" label="配置 (JSON)">
            <Input.TextArea
              rows={4}
              placeholder={'{\n  "source": "eastmoney",\n  "api": "stock_news_em"\n}'}
            />
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
    </Card>
  )
}
