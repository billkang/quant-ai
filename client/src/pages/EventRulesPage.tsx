import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Descriptions,
} from 'antd'
import {
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { eventApi } from '../services/api'
import type { EventRule } from '../types/api'

const { Text } = Typography

export default function EventRulesPage() {
  const [rules, setRules] = useState<EventRule[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRule, setSelectedRule] = useState<EventRule | null>(null)
  const [form] = Form.useForm()

  const fetchRules = async () => {
    setLoading(true)
    try {
      const res = await eventApi.getRules()
      if (res.data?.code === 0) {
        setRules(res.data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleActivate = async (id: number) => {
    try {
      const res = await eventApi.activateRule(id)
      if (res.data?.code === 0) {
        message.success('规则已激活')
        fetchRules()
      }
    } catch {
      message.error('激活失败')
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
      const res = await eventApi.createRule({ ...values, config })
      if (res.data?.code === 0) {
        message.success('规则创建成功')
        setShowCreate(false)
        form.resetFields()
        fetchRules()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const openDetail = (rule: EventRule) => {
    setSelectedRule(rule)
    setShowDetail(true)
  }

  const typeLabels: Record<string, string> = {
    sentiment_extractor: '情感提取',
    classifier: '事件分类',
    sector_mapper: '板块映射',
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
      dataIndex: 'rule_type',
      key: 'rule_type',
      render: (v: string) => (
        <Tag style={{ borderRadius: 6, background: 'var(--bg-elevated)', border: 'none' }}>
          {typeLabels[v] || v}
        </Tag>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{v}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: number) => (
        <Tag
          style={{
            borderRadius: 6,
            background: active === 1 ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
            color: active === 1 ? '#22c55e' : 'var(--text-muted)',
            border: 'none',
          }}
        >
          {active === 1 ? '活跃' : '未激活'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: EventRule) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
          >
            详情
          </Button>
          {record.is_active !== 1 && (
            <Button
              size="small"
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => handleActivate(record.id)}
            >
              激活
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>提取规则管理</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
          管理事件信号的提取、分类和板块映射规则
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
            <SafetyCertificateOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>规则列表</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>
            新建规则
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无规则配置' }}
        />
      </Card>

      <Modal
        title="新建规则"
        open={showCreate}
        onOk={handleCreate}
        onCancel={() => setShowCreate(false)}
        okText="创建"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：情感词典 v2.0" />
          </Form.Item>
          <Form.Item
            name="rule_type"
            label="类型"
            rules={[{ required: true }]}
            initialValue="sentiment_extractor"
          >
            <Select
              options={[
                { value: 'sentiment_extractor', label: '情感提取' },
                { value: 'classifier', label: '事件分类' },
                { value: 'sector_mapper', label: '板块映射' },
              ]}
            />
          </Form.Item>
          <Form.Item name="version" label="版本" initialValue="1.0">
            <Input placeholder="如：1.0" />
          </Form.Item>
          <Form.Item name="config" label="配置 (JSON)">
            <Input.TextArea
              rows={6}
              placeholder={`{\n  "positive_keywords": ["增长", "上涨"],\n  "negative_keywords": ["下跌", "亏损"]\n}`}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="规则详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={null}
        width={600}
      >
        {selectedRule && (
          <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
            <Descriptions.Item label="名称">{selectedRule.name}</Descriptions.Item>
            <Descriptions.Item label="类型">
              {typeLabels[selectedRule.rule_type] || selectedRule.rule_type}
            </Descriptions.Item>
            <Descriptions.Item label="版本">{selectedRule.version}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                style={{
                  borderRadius: 6,
                  background:
                    selectedRule.is_active === 1 ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
                  color: selectedRule.is_active === 1 ? '#22c55e' : 'var(--text-muted)',
                  border: 'none',
                }}
              >
                {selectedRule.is_active === 1 ? '活跃' : '未激活'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="配置">
              <pre
                style={{
                  background: 'var(--bg-elevated)',
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  overflow: 'auto',
                  color: 'var(--text-primary)',
                }}
              >
                {JSON.stringify(selectedRule.config || {}, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
