import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Switch,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { dataChannelApi } from '../../services/api'

const { Text } = Typography

interface ChannelRecord {
  id: number
  name: string
  provider: string
  endpoint: string | null
  timeout: number
  isActive: number
}

export default function ChannelManager() {
  const [channels, setChannels] = useState<ChannelRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingChannel, setEditingChannel] = useState<ChannelRecord | null>(null)
  const [form] = Form.useForm()

  const fetchChannels = useCallback(async () => {
    setLoading(true)
    try {
      const res = await dataChannelApi.getChannels()
      if (res.data?.code === 0) setChannels(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingChannel) {
        const res = await dataChannelApi.updateChannel(editingChannel.id, values)
        if (res.data?.code === 0) {
          message.success('更新成功')
          setShowModal(false)
          setEditingChannel(null)
          fetchChannels()
        }
      } else {
        const res = await dataChannelApi.createChannel(values)
        if (res.data?.code === 0) {
          message.success('创建成功')
          setShowModal(false)
          fetchChannels()
        }
      }
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await dataChannelApi.deleteChannel(id)
      message.success('删除成功')
      fetchChannels()
    } catch {
      message.error('删除失败')
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
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
      render: (v: string) => <Tag style={{ borderRadius: 6 }}>{v}</Tag>,
    },
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (v: string | null) => <Text style={{ color: 'var(--text-muted)' }}>{v || '-'}</Text>,
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
      render: (_: unknown, record: ChannelRecord) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingChannel(record)
              form.setFieldsValue(record as unknown as Record<string, unknown>)
              setShowModal(true)
            }}
          >
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
    <>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        styles={{ body: { padding: 0 } }}
        title={<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>数据渠道列表</span>}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchChannels} loading={loading}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingChannel(null)
                form.resetFields()
                setShowModal(true)
              }}
            >
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
          locale={{ emptyText: '暂无渠道配置' }}
        />
      </Card>

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
    </>
  )
}
