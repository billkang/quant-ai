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
  Typography,
  Empty,
  message,
  Descriptions,
  Tabs,
  Row,
  Col,
} from 'antd'
import {
  ExperimentOutlined,
  BookOutlined,
  ThunderboltOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { strategyApi } from '../services/api'

const { Title, Text } = Typography

interface Strategy {
  id: number
  name: string
  description?: string
  category: string
  strategy_code: string
  params_schema?: Record<string, unknown>
  is_builtin: number
  is_active: number
  created_at: string
}

interface StrategyVersion {
  id: number
  version_number: number
  params_schema?: Record<string, unknown>
  changelog?: string
  created_at: string
}

export default function StrategyManagement() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [builtinStrategies, setBuiltinStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [versions, setVersions] = useState<StrategyVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchStrategies()
    fetchBuiltinStrategies()
  }, [])

  const fetchStrategies = async () => {
    setLoading(true)
    try {
      const res = await strategyApi.getStrategies()
      if (res.data?.code === 0) {
        const all = res.data.data || []
        setStrategies(all.filter((s: Strategy) => !s.is_builtin))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchBuiltinStrategies = async () => {
    try {
      const res = await strategyApi.getBuiltinStrategies()
      if (res.data?.code === 0) {
        setBuiltinStrategies(res.data.data || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchVersions = async (strategyId: number) => {
    try {
      const res = await strategyApi.getVersions(strategyId)
      if (res.data?.code === 0) {
        setVersions(res.data.data || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      let paramsSchema = {}
      try {
        paramsSchema = values.params_schema ? JSON.parse(values.params_schema) : {}
      } catch {
        message.error('params_schema 不是有效的 JSON')
        return
      }
      const res = await strategyApi.createStrategy({
        ...values,
        params_schema: paramsSchema,
      })
      if (res.data?.code === 0) {
        message.success('策略创建成功')
        setShowCreate(false)
        form.resetFields()
        fetchStrategies()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await strategyApi.deleteStrategy(id)
      if (res.data?.code === 0) {
        message.success('删除成功')
        fetchStrategies()
      }
    } catch {
      message.error('删除失败')
    }
  }

  const openDetail = (strategy: Strategy) => {
    setSelectedStrategy(strategy)
    fetchVersions(strategy.id)
    setShowDetail(true)
  }

  const columns = [
    {
      title: '策略名称',
      key: 'name',
      render: (_: unknown, record: Strategy) => (
        <Space>
          <Text strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
            {record.name}
          </Text>
          {record.is_builtin === 1 && (
            <Tag
              style={{
                borderRadius: 6,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                border: 'none',
              }}
            >
              内置
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '代码',
      dataIndex: 'strategy_code',
      key: 'strategy_code',
      render: (v: string) => (
        <Text style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{v}</Text>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (v: string) => (
        <Tag
          style={{
            borderRadius: 6,
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            border: 'none',
          }}
        >
          {v === 'technical' ? '技术' : v === 'event' ? '事件' : v === 'combined' ? '组合' : v}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (v: number) => (
        <Tag
          style={{
            borderRadius: 6,
            background: v === 1 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: v === 1 ? '#22c55e' : '#ef4444',
            border: 'none',
          }}
        >
          {v === 1 ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Strategy) => (
        <Space>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          {record.is_builtin !== 1 && (
            <Button type="link" danger size="small" onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          策略管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>管理量化交易策略与参数配置</Text>
      </div>

      {/* Builtin Strategies */}
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        title={
          <Space>
            <BookOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>内置策略</span>
          </Space>
        }
      >
        {builtinStrategies.length === 0 ? (
          <Empty description="暂无内置策略" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Row gutter={[16, 16]}>
            {builtinStrategies.map(s => (
              <Col key={s.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  onClick={() => openDetail(s)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'var(--accent-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ThunderboltOutlined style={{ color: 'var(--accent)', fontSize: 18 }} />
                    </div>
                    <div>
                      <Text strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                        {s.name}
                      </Text>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {s.strategy_code}
                      </div>
                    </div>
                  </div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {s.description}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Custom Strategies */}
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        title={
          <Space>
            <ExperimentOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>自定义策略</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>
            新建策略
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={strategies}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无自定义策略' }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="新建策略"
        open={showCreate}
        onOk={handleCreate}
        onCancel={() => setShowCreate(false)}
        okText="创建"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="策略名称" rules={[{ required: true }]}>
            <Input placeholder="如：双均线策略" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="策略逻辑简述..." />
          </Form.Item>
          <Form.Item name="category" label="类别" initialValue="technical">
            <Select
              options={[
                { value: 'technical', label: '技术' },
                { value: 'event', label: '事件' },
                { value: 'combined', label: '组合' },
              ]}
            />
          </Form.Item>
          <Form.Item name="strategy_code" label="策略代码标识" rules={[{ required: true }]}>
            <Input placeholder="如：my_strategy_v1" />
          </Form.Item>
          <Form.Item name="params_schema" label="参数 Schema (JSON)">
            <Input.TextArea
              rows={6}
              placeholder={`{\n  "type": "object",\n  "properties": {\n    "short": { "type": "integer", "minimum": 2, "maximum": 60, "default": 5 }\n  }\n}`}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="策略详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={null}
        width={720}
      >
        {selectedStrategy && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: '基本信息',
                children: (
                  <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
                    <Descriptions.Item label="名称">{selectedStrategy.name}</Descriptions.Item>
                    <Descriptions.Item label="代码">
                      {selectedStrategy.strategy_code}
                    </Descriptions.Item>
                    <Descriptions.Item label="类别">{selectedStrategy.category}</Descriptions.Item>
                    <Descriptions.Item label="描述">
                      {selectedStrategy.description || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="参数 Schema">
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
                        {JSON.stringify(selectedStrategy.params_schema || {}, null, 2)}
                      </pre>
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'versions',
                label: '版本历史',
                children: (
                  <Table
                    dataSource={versions}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    style={{ marginTop: 8 }}
                    columns={[
                      { title: '版本号', dataIndex: 'version_number', key: 'version_number' },
                      {
                        title: '变更说明',
                        dataIndex: 'changelog',
                        key: 'changelog',
                        render: (v: string) => v || '-',
                      },
                      {
                        title: '创建时间',
                        dataIndex: 'created_at',
                        key: 'created_at',
                        render: (v: string) => (v ? new Date(v).toLocaleDateString() : '-'),
                      },
                    ]}
                    locale={{ emptyText: '暂无版本记录' }}
                  />
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  )
}
