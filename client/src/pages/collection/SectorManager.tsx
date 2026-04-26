import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Switch, Tag, Typography, message } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { sectorApi } from '../../services/api'

const { Text } = Typography

interface SectorRecord {
  id: number
  code: string
  name: string
  level: number
  parentId: number | null
  isEnabled: number
  source: string
}

export default function SectorManager() {
  const [sectors, setSectors] = useState<SectorRecord[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSectors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sectorApi.getSectors()
      if (res.data?.code === 0) setSectors(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSectors()
  }, [fetchSectors])

  const handleToggle = async (sector: SectorRecord) => {
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

  const columns = [
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
      width: 80,
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{v}</Text>
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
      render: (_: unknown, record: SectorRecord) => (
        <Switch checked={record.isEnabled === 1} onChange={() => handleToggle(record)} />
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
      styles={{ body: { padding: 0 } }}
      title={<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>板块分类管理</span>}
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchSectors} loading={loading}>
          刷新
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={sectors}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        locale={{ emptyText: '暂无板块数据' }}
      />
    </Card>
  )
}
