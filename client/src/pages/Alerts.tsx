import { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Badge } from 'antd'
import { BellOutlined, CheckOutlined, PlusOutlined } from '@ant-design/icons'
import { quantApi } from '../services/api'

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
      if (res.data?.code === 0) {
        setAlerts(res.data.data || [])
      }
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

  const columns = [
    {
      title: '股票',
      dataIndex: 'stockCode',
      key: 'stockCode',
    },
    {
      title: '类型',
      dataIndex: 'alertType',
      key: 'alertType',
      render: (type: string) => {
        const map: Record<string, string> = {
          price_break: '价格突破',
          indicator_signal: '指标信号',
          news_sentiment: '新闻情绪',
        }
        return <Tag>{map[type] || type}</Tag>
      },
    },
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      render: (isRead: boolean) => (
        <Badge status={isRead ? 'default' : 'processing'} text={isRead ? '已读' : '未读'} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AlertItem) => (
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          disabled={record.isRead}
          onClick={() => handleMarkRead(record.id)}
        >
          标记已读
        </Button>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>告警中心</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAdd(true)}>
            添加规则
          </Button>
        }
        style={{ borderRadius: 16 }}
      >
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
        />
      </Card>

      <Modal
        title="添加告警规则"
        open={showAdd}
        onOk={handleAddRule}
        onCancel={() => setShowAdd(false)}
        okText="保存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
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
