import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Form,
  Input,
  Switch,
  Button,
  message,
  Space,
  Divider,
  Tag,
  Table,
} from 'antd'
import { BellOutlined, SettingOutlined, MailOutlined, LinkOutlined } from '@ant-design/icons'
import { notificationApi } from '../services/api'
import type { NotificationSettingData, NotificationItem } from '../types/api'

const { Title, Text } = Typography

export default function Settings() {
  const [, setSettings] = useState<NotificationSettingData | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [setRes, histRes] = await Promise.all([
        notificationApi.getSettings(),
        notificationApi.getHistory(20),
      ])
      if (setRes.data?.code === 0) {
        setSettings(setRes.data.data)
        form.setFieldsValue(setRes.data.data)
      }
      if (histRes.data?.code === 0) {
        setNotifications(histRes.data.data || [])
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSaveSettings = async (values: NotificationSettingData) => {
    try {
      const res = await notificationApi.updateSettings(values)
      if (res.data?.code === 0) {
        message.success('设置已保存')
        fetchData()
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '保存失败')
    }
  }

  const handleTestChannel = async (channel: string) => {
    try {
      const res = await notificationApi.testChannel(channel)
      if (res.data?.code === 0) message.success(res.data.message)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '测试失败')
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      const res = await notificationApi.markRead(id)
      if (res.data?.code === 0) fetchData()
    } catch (e: unknown) {
      console.error(e)
    }
  }

  const columns = [
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      render: (v: boolean) => (v ? <Tag>已读</Tag> : <Tag color="red">未读</Tag>),
    },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: NotificationItem) =>
        !record.isRead ? (
          <Button size="small" onClick={() => handleMarkRead(record.id)}>
            标记已读
          </Button>
        ) : null,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          系统设置
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>个性化与系统配置</Text>
      </div>

      <Card
        title={
          <Space>
            <BellOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>通知设置</span>
          </Space>
        }
        loading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
          <Divider style={{ color: 'var(--text-secondary)' }}>
            <Space>
              <MailOutlined />
              邮件通知
            </Space>
          </Divider>
          <Form.Item name={['email', 'enabled']} valuePropName="checked" label="启用邮件通知">
            <Switch />
          </Form.Item>
          <Form.Item name={['email', 'address']} label="邮箱地址">
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Divider style={{ color: 'var(--text-secondary)' }}>
            <Space>
              <LinkOutlined />
              Webhook
            </Space>
          </Divider>
          <Form.Item name={['webhook', 'enabled']} valuePropName="checked" label="启用 Webhook">
            <Switch />
          </Form.Item>
          <Form.Item name={['webhook', 'url']} label="Webhook URL">
            <Input placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>
              <Button onClick={() => handleTestChannel('email')}>测试邮件</Button>
              <Button onClick={() => handleTestChannel('webhook')}>测试 Webhook</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <SettingOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>通知历史</span>
          </Space>
        }
        loading={loading}
      >
        <Table
          dataSource={notifications}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无通知记录' }}
        />
      </Card>
    </div>
  )
}
