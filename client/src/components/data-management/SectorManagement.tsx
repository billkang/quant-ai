import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Switch, Tag, message, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { sectorApi } from '../../services/api'

const { Text } = Typography

interface SectorItem {
  id: number
  code: string
  name: string
  level: number
  isEnabled: number
  source: string
}

export default function SectorManagement() {
  const [sectors, setSectors] = useState<SectorItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSectors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sectorApi.getSectors()
      if (res.data?.code === 0) setSectors(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSectors()
  }, [fetchSectors])

  const handleToggle = async (sector: SectorItem) => {
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
      render: (_: number, record: SectorItem) => (
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
      bodyStyle={{ padding: 0 }}
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
        size="small"
        locale={{ emptyText: '暂无板块数据' }}
      />
    </Card>
  )
}
