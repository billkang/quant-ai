import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, Typography, message, Descriptions, Tabs, Table } from 'antd'
import { ExperimentOutlined } from '@ant-design/icons'
import { strategyApi } from '../services/api'
import type { StrategyItem, StrategyVersion } from '../types/api'
import BuiltinStrategyCards from './strategy/BuiltinStrategyCards'
import CustomStrategyTable from './strategy/CustomStrategyTable'

const { Title, Text } = Typography

export default function StrategyManagement() {
  const [strategies, setStrategies] = useState<StrategyItem[]>([])
  const [builtinStrategies, setBuiltinStrategies] = useState<StrategyItem[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyItem | null>(null)
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
        setStrategies(all.filter((s: StrategyItem) => !s.is_builtin))
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const fetchBuiltinStrategies = async () => {
    try {
      const res = await strategyApi.getBuiltinStrategies()
      if (res.data?.code === 0) setBuiltinStrategies(res.data.data || [])
    } catch {
      // ignore
    }
  }

  const fetchVersions = async (strategyId: number) => {
    try {
      const res = await strategyApi.getVersions(strategyId)
      if (res.data?.code === 0) setVersions(res.data.data || [])
    } catch {
      // ignore
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
      const res = await strategyApi.createStrategy({ ...values, params_schema: paramsSchema })
      if (res.data?.code === 0) {
        message.success('策略创建成功')
        setShowCreate(false)
        form.resetFields()
        fetchStrategies()
      }
    } catch {
      // ignore
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

  const openDetail = (strategy: StrategyItem) => {
    setSelectedStrategy(strategy)
    fetchVersions(strategy.id)
    setShowDetail(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <ExperimentOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          策略管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>管理量化交易策略与参数配置</Text>
      </div>

      <BuiltinStrategyCards strategies={builtinStrategies} onSelect={openDetail} />

      <CustomStrategyTable
        strategies={strategies}
        loading={loading}
        onDetail={openDetail}
        onDelete={handleDelete}
        onCreate={() => setShowCreate(true)}
      />

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
              placeholder={
                '{\n  "type": "object",\n  "properties": {\n    "short": { "type": "integer" }\n  }\n}'
              }
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
                    pagination={false}
                    style={{ marginTop: 8 }}
                    columns={[
                      { title: '版本号', dataIndex: 'version_number', key: 'version_number' },
                      {
                        title: '变更说明',
                        dataIndex: 'changelog',
                        key: 'changelog',
                        render: (v: string | null) => v || '-',
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
