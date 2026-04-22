import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Badge,
  Typography,
} from 'antd'
import { CheckOutlined, PlusOutlined, AlertOutlined } from '@ant-design/icons'
import { quantApi } from '../services/api'

const { Text, Title } = Typography

interface AlertItem {
  id: number
  stockCode: string
  alertType: string
  condition: string
  message: string
  triggeredAt: string
  isRead: boolean
  createdAt: string
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const res = await quantApi.getAlerts(undefined, 50)
      if (res.data?.code === 0) setAlerts(res.data.data || [])
      const unreadRes = await quantApi.getAlerts(false, 1)
      setUnreadCount(unreadRes.data?.data?.length || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id: number) => {
    await quantApi.markAlertRead(id)
    fetchAlerts()
  }

  const handleAddRule = async () => {
    try {
      const values = await form.validateFields()
      await quantApi.createAlertRule(values)
      setShowAdd(false)
      form.resetFields()
      fetchAlerts()
    } catch (e) {
      console.error(e)
    }
  }

  const typeMap: Record<string, string> = {
    price_break: '价格突破',
    indicator_signal: '指标信号',
    news_sentiment: '新闻情绪',
  }
  const typeColor: Record<string, string> = {
    price_break: '#0ea5e9',
    indicator_signal: '#a855f7',
    news_sentiment: '#f59e0b',
  }

  const columns = [
    {
      title: '股票',
      dataIndex: 'stockCode',
      key: 'stockCode',
      render: (code: string) => (
        <Text strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {code}
        </Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'alertType',
      key: 'alertType',
      render: (type: string) => (
        <Tag
          style={{
            background: `${typeColor[type] || '#64748b'}18`,
            color: typeColor[type] || '#64748b',
            border: 'none',
            fontWeight: 600,
            borderRadius: 6,
          }}
        >
          {typeMap[type] || type}
        </Tag>
      ),
    },
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      render: (v: string) => (
        <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v}</Text>
      ),
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      render: (v: string) => (
        <Text style={{ color: 'var(--text-primary)', fontSize: 13 }}>{v}</Text>
      ),
    },
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      render: (v: string) => <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      render: (isRead: boolean) => (
        <Badge
          status={isRead ? 'default' : 'processing'}
          text={
            <span style={{ color: isRead ? 'var(--text-muted)' : 'var(--accent)', fontSize: 12 }}>
              {isRead ? '已读' : '未读'}
            </span>
          }
        />
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'center' as const,
      render: (_: unknown, record: AlertItem) => (
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          disabled={record.isRead}
          onClick={() => handleMarkRead(record.id)}
          style={{
            color: record.isRead ? 'var(--text-muted)' : 'var(--accent)',
            opacity: record.isRead ? 0.4 : 1,
          }}
        >
          标记已读
        </Button>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
            告警中心
          </Title>
          <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>监控指标信号与价格突破</Text>
        </div>
        {unreadCount > 0 && (
          <Badge
            count={unreadCount}
            style={{
              background: '#ef4444',
              fontSize: 12,
              minWidth: 20,
              height: 20,
              lineHeight: '20px',
            }}
          />
        )}
      </div>

      <Card
        title={
          <Space>
            <AlertOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>告警列表</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAdd(true)}
            data-testid="alerts-add-rule-btn"
          >
            添加规则
          </Button>
        }
        bodyStyle={{ padding: 0 }}
        data-testid="alerts-table-card"
      >
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, size: 'small' }}
          size="small"
          data-testid="alerts-table"
        />
      </Card>

      <Modal
        title="添加告警规则"
        open={showAdd}
        onOk={handleAddRule}
        onCancel={() => setShowAdd(false)}
        okText="保存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如：600519" />
          </Form.Item>
          <Form.Item
            name="alertType"
            label="告警类型"
            initialValue="price_break"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: 'price_break', label: '价格突破' },
                { value: 'indicator_signal', label: '指标信号' },
                { value: 'news_sentiment', label: '新闻情绪' },
              ]}
            />
          </Form.Item>
          <Form.Item name="condition" label="触发条件" rules={[{ required: true }]}>
            <Input placeholder="如：price > 1600" />
          </Form.Item>
          <Form.Item name="message" label="告警消息" rules={[{ required: true }]}>
            <Input placeholder="如：股价突破1600元" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
