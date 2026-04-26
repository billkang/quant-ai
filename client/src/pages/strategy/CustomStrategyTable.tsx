import { Card, Table, Button, Tag, Space, Typography } from 'antd'
import { ExperimentOutlined, PlusOutlined } from '@ant-design/icons'
import type { StrategyItem } from '../../types/api'

const { Text } = Typography

export default function CustomStrategyTable({
  strategies,
  loading,
  onDetail,
  onDelete,
  onCreate,
}: {
  strategies: StrategyItem[]
  loading: boolean
  onDetail: (s: StrategyItem) => void
  onDelete: (id: number) => void
  onCreate: () => void
}) {
  const columns = [
    {
      title: '策略名称',
      key: 'name',
      render: (_: unknown, record: StrategyItem) => (
        <Text strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
          {record.name}
        </Text>
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
      render: (_: unknown, record: StrategyItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => onDetail(record)}>
            详情
          </Button>
          <Button type="link" danger size="small" onClick={() => onDelete(record.id)}>
            删除
          </Button>
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
      title={
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          <ExperimentOutlined style={{ marginRight: 8, color: 'var(--accent)' }} />
          自定义策略
        </span>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
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
        locale={{ emptyText: '暂无自定义策略' }}
      />
    </Card>
  )
}
