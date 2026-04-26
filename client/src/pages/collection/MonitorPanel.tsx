import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Tag, Select, Progress, Space, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { eventApi, collectionApi } from '../../services/api'
import type { EventJob, CollectionJobItem } from '../../types/api'

const { Text } = Typography

const statusColors: Record<string, string> = {
  success: 'green',
  failed: 'red',
  running: 'blue',
  completed: 'green',
  cancelled: 'orange',
}
const statusLabels: Record<string, string> = {
  success: '成功',
  failed: '失败',
  running: '运行中',
  completed: '已完成',
  cancelled: '已取消',
}

export default function MonitorPanel() {
  const [eventJobs, setEventJobs] = useState<EventJob[]>([])
  const [collectionJobs, setCollectionJobs] = useState<CollectionJobItem[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  const fetchEventJobs = useCallback(async () => {
    try {
      const res = await eventApi.getJobs({ limit: 50 })
      if (res.data?.code === 0) setEventJobs(res.data.data || [])
    } catch {
      // ignore
    }
  }, [])

  const fetchCollectionJobs = useCallback(async () => {
    try {
      const res = await collectionApi.getJobs({ pageSize: 50 })
      if (res.data?.code === 0) setCollectionJobs(res.data.data.items || [])
    } catch {
      // ignore
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchEventJobs(), fetchCollectionJobs()])
    setLoading(false)
  }, [fetchEventJobs, fetchCollectionJobs])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  const allJobs = [
    ...eventJobs.map(j => ({
      id: j.id,
      _type: 'event' as const,
      status: j.status,
      progress: j.progress || 0,
      new_events_count: j.new_events_count,
      started_at: j.started_at || null,
      completed_at: j.completed_at || null,
      jobType: '' as string | undefined,
    })),
    ...collectionJobs.map(j => ({
      id: j.id,
      _type: 'collection' as const,
      status: j.status,
      progress: j.progress || 0,
      new_events_count: undefined as number | undefined,
      started_at: j.startTime || null,
      completed_at: j.endTime || null,
      jobType: j.jobType,
    })),
  ]
    .filter(j => {
      if (!statusFilter) return true
      return j.status === statusFilter
    })
    .sort((a, b) => {
      const ta = new Date(a.started_at || 0).getTime()
      const tb = new Date(b.started_at || 0).getTime()
      return tb - ta
    })

  const jobColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '类型',
      key: 'jobType',
      render: (_: unknown, record: (typeof allJobs)[number]) => (
        <Tag style={{ borderRadius: 6 }}>
          {record.jobType
            ? record.jobType === 'stock_collection'
              ? '股票采集'
              : '新闻采集'
            : '事件采集'}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, record: (typeof allJobs)[number]) => (
        <Tag color={statusColors[record.status] || 'default'} style={{ borderRadius: 6 }}>
          {statusLabels[record.status] || record.status}
        </Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: unknown, record: (typeof allJobs)[number]) => {
        const pct = record.progress || 0
        if (record.status === 'running' || pct > 0) return <Progress percent={pct} />
        return <Text style={{ color: 'var(--text-muted)' }}>-</Text>
      },
    },
    {
      title: '新事件',
      key: 'new_events',
      render: (_: unknown, record: (typeof allJobs)[number]) => (
        <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {record.new_events_count ?? '-'}
        </Text>
      ),
    },
    {
      title: '开始时间',
      key: 'started_at',
      render: (_: unknown, record: (typeof allJobs)[number]) => {
        return record.started_at ? new Date(record.started_at).toLocaleString() : '-'
      },
    },
    {
      title: '完成时间',
      key: 'completed_at',
      render: (_: unknown, record: (typeof allJobs)[number]) => {
        return record.completed_at ? new Date(record.completed_at).toLocaleString() : '-'
      },
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
      title={<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>采集任务监控</span>}
      extra={
        <Space>
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 120 }}
            onChange={v => setStatusFilter(v)}
            options={[
              { value: 'running', label: '运行中' },
              { value: 'success', label: '成功' },
              { value: 'completed', label: '已完成' },
              { value: 'failed', label: '失败' },
              { value: 'cancelled', label: '已取消' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            刷新
          </Button>
        </Space>
      }
    >
      <Table
        columns={jobColumns}
        dataSource={allJobs}
        rowKey={(record: (typeof allJobs)[number]) => `${record._type}-${record.id}`}
        loading={loading}
        pagination={{ pageSize: 20 }}
        locale={{ emptyText: '暂无任务记录' }}
      />
    </Card>
  )
}
