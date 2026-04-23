import { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Progress } from 'antd'
import { ScheduleOutlined } from '@ant-design/icons'
import { eventApi } from '../services/api'
import type { EventJob } from '../types/api'

const { Title, Text } = Typography

export default function EventJobsPage() {
  const [jobs, setJobs] = useState<EventJob[]>([])
  const [loading, setLoading] = useState(false)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await eventApi.getJobs(50)
      if (res.data?.code === 0) {
        setJobs(res.data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '数据源', dataIndex: 'source_id', key: 'source_id', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, { bg: string; color: string; label: string }> = {
          success: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: '成功' },
          failed: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: '失败' },
          running: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', label: '运行中' },
        }
        const c = colors[status] || colors.running
        return (
          <Tag style={{ borderRadius: 6, background: c.bg, color: c.color, border: 'none' }}>
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '新事件',
      dataIndex: 'new_events_count',
      key: 'new_events_count',
      width: 80,
      align: 'right' as const,
      render: (v: number) => (
        <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</Text>
      ),
    },
    {
      title: '重复',
      dataIndex: 'duplicate_count',
      key: 'duplicate_count',
      width: 80,
      align: 'right' as const,
      render: (v: number) => <Text style={{ color: 'var(--text-muted)' }}>{v}</Text>,
    },
    {
      title: '错误',
      dataIndex: 'error_count',
      key: 'error_count',
      width: 80,
      align: 'right' as const,
      render: (v: number) => (
        <Text style={{ color: v > 0 ? 'var(--down)' : 'var(--text-muted)' }}>{v}</Text>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      width: 120,
      render: (_: unknown, record: EventJob) => {
        if (record.status === 'running') {
          return (
            <Progress percent={record.progress || 0} size="small" strokeColor="var(--accent)" />
          )
        }
        return <Text style={{ color: 'var(--text-muted)' }}>-</Text>
      },
    },
    {
      title: '开始时间',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '完成时间',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          采集任务日志
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          查看事件数据采集任务的执行历史和状态
        </Text>
      </div>

      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        bodyStyle={{ padding: 0 }}
        title={
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            <ScheduleOutlined style={{ marginRight: 8, color: 'var(--accent)' }} />
            任务历史
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
          locale={{ emptyText: '暂无任务记录' }}
        />
      </Card>
    </div>
  )
}
