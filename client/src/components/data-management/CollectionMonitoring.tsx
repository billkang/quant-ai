import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Space, Tag, DatePicker, Select, Typography, Drawer } from 'antd'
import { ReloadOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { eventApi, channelApi } from '../../services/api'
import type { EventJob, EventItem, ChannelItem } from '../../types/api'

const { Text } = Typography
const { RangePicker } = DatePicker

interface MonitorRow {
  channelId: number
  channelName: string
  dataSourceName: string
  totalJobs: number
  successCount: number
  failedCount: number
  lastStartedAt: string | null
}

export default function CollectionMonitoring() {
  const [view, setView] = useState<'list' | 'tasks' | 'detail'>('list')
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)

  const [monitorData, setMonitorData] = useState<MonitorRow[]>([])
  const [jobs, setJobs] = useState<EventJob[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [jobDetail, setJobDetail] = useState<EventJob | null>(null)

  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)
  const [collectionType, setCollectionType] = useState<string | undefined>(undefined)

  const fetchMonitorList = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      if (collectionType) params.collection_type = collectionType

      const [monitorRes, channelsRes] = await Promise.all([
        eventApi.getJobsTree(params),
        channelApi.getChannels(),
      ])

      const monitorItems = (monitorRes.data?.data || []) as Array<Record<string, unknown>>
      const channels = (channelsRes.data?.data || []) as ChannelItem[]
      const channelMap = new Map(channels.map(c => [c.id, c]))

      const rows: MonitorRow[] = monitorItems.map(item => {
        const ch = channelMap.get(item.id as number)
        return {
          channelId: item.id as number,
          channelName: ch?.name || (item.name as string),
          dataSourceName: ch?.dataSourceName || '-',
          totalJobs: (item.aggregated as Record<string, number>)?.total_jobs ?? 0,
          successCount: (item.aggregated as Record<string, number>)?.success_count ?? 0,
          failedCount: (item.aggregated as Record<string, number>)?.failed_count ?? 0,
          lastStartedAt: (item.last_started_at as string) || null,
        }
      })
      setMonitorData(rows)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, collectionType])

  useEffect(() => {
    if (view === 'list') {
      fetchMonitorList()
    }
  }, [view, fetchMonitorList])

  const fetchChannelTasks = async (channelId: number) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { source_id: channelId }
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      if (collectionType) params.collection_type = collectionType

      const res = await eventApi.getJobs(params)
      if (res.data?.code === 0) setJobs(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobDetail = async (jobId: number) => {
    setLoading(true)
    try {
      const res = await eventApi.getJobDetail(jobId)
      if (res.data?.code === 0) {
        const detail = res.data.data || null
        setJobDetail(detail)
        if (detail) {
          fetchJobEvents(detail.source_id)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobEvents = async (sourceId: number | undefined) => {
    if (!sourceId) {
      setEvents([])
      return
    }
    setLoading(true)
    try {
      const res = await eventApi.getEvents({ source_id: sourceId, limit: 50 })
      if (res.data?.code === 0) setEvents(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleViewTasks = (channelId: number) => {
    setSelectedChannelId(channelId)
    setView('tasks')
    fetchChannelTasks(channelId)
  }

  const handleViewJobDetail = (jobId: number) => {
    setSelectedJobId(jobId)
    setView('detail')
    fetchJobDetail(jobId)
  }

  const listColumns = [
    {
      title: '渠道名称',
      dataIndex: 'channelName',
      key: 'channelName',
      render: (v: string) => (
        <Text strong style={{ color: 'var(--text-primary)' }}>
          {v}
        </Text>
      ),
    },
    {
      title: '数据源',
      dataIndex: 'dataSourceName',
      key: 'dataSourceName',
    },
    {
      title: '任务数',
      dataIndex: 'totalJobs',
      key: 'totalJobs',
      render: (v: number) => <Tag>{v}</Tag>,
    },
    {
      title: '成功',
      dataIndex: 'successCount',
      key: 'successCount',
      render: (v: number) => <Tag color="green">{v}</Tag>,
    },
    {
      title: '失败',
      dataIndex: 'failedCount',
      key: 'failedCount',
      render: (v: number) => <Tag color="red">{v}</Tag>,
    },
    {
      title: '最近采集',
      dataIndex: 'lastStartedAt',
      key: 'lastStartedAt',
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: MonitorRow) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewTasks(record.channelId)}
        >
          详情
        </Button>
      ),
    },
  ]

  const taskColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag color={v === 'success' ? 'green' : v === 'failed' ? 'red' : 'blue'}>
          {v === 'success' ? '成功' : v === 'failed' ? '失败' : v}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'trigger_type',
      key: 'trigger_type',
      render: (v: string) => (v === 'auto' ? '自动' : '人工'),
    },
    { title: '新事件', dataIndex: 'new_events_count', key: 'new_events_count' },
    { title: '重复', dataIndex: 'duplicate_count', key: 'duplicate_count' },
    { title: '错误', dataIndex: 'error_count', key: 'error_count' },
    {
      title: '开始时间',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: EventJob) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewJobDetail(record.id)}>
          查看内容
        </Button>
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
      bodyStyle={{ padding: 16 }}
      title={
        <Space>
          {view !== 'list' && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setView(view === 'detail' ? 'tasks' : 'list')}
            >
              返回
            </Button>
          )}
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {view === 'list' ? '采集监控' : view === 'tasks' ? '任务列表' : '任务详情'}
          </span>
        </Space>
      }
      extra={
        view === 'list' && (
          <Space>
            <RangePicker
              onChange={dates => {
                if (dates && dates[0] && dates[1]) {
                  setStartDate(dates[0].format('YYYY-MM-DD'))
                  setEndDate(dates[1].format('YYYY-MM-DD'))
                } else {
                  setStartDate(undefined)
                  setEndDate(undefined)
                }
              }}
            />
            <Select
              placeholder="采集分类"
              allowClear
              style={{ width: 120 }}
              value={collectionType}
              onChange={v => setCollectionType(v)}
              options={[
                { value: 'auto', label: '自动' },
                { value: 'manual', label: '人工' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchMonitorList} loading={loading}>
              刷新
            </Button>
          </Space>
        )
      }
    >
      {view === 'list' && (
        <Table
          columns={listColumns}
          dataSource={monitorData}
          rowKey="channelId"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
          locale={{ emptyText: '暂无采集记录' }}
        />
      )}

      {view === 'tasks' && (
        <Table
          columns={taskColumns}
          dataSource={jobs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
          locale={{ emptyText: '暂无任务记录' }}
        />
      )}

      {view === 'detail' && jobDetail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card size="small" title="任务信息">
            <Space direction="vertical">
              <Text>
                状态:{' '}
                <Tag color={jobDetail.status === 'success' ? 'green' : 'red'}>
                  {jobDetail.status}
                </Tag>
              </Text>
              {jobDetail.channel_name && <Text>渠道: {jobDetail.channel_name}</Text>}
              <Text>分类: {jobDetail.trigger_type === 'auto' ? '自动' : '人工'}</Text>
              <Text>新事件: {jobDetail.new_events_count}</Text>
              <Text>重复: {jobDetail.duplicate_count}</Text>
              <Text>错误: {jobDetail.error_count}</Text>
              {jobDetail.error_message && (
                <Text type="danger">错误信息: {jobDetail.error_message}</Text>
              )}
              {jobDetail.logs && (
                <pre
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: 8,
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  {jobDetail.logs}
                </pre>
              )}
            </Space>
          </Card>

          <Card size="small" title="采集内容">
            <Table
              columns={[
                { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
                { title: '股票', dataIndex: 'symbol', key: 'symbol', width: 100 },
                {
                  title: '情感',
                  dataIndex: 'sentiment',
                  key: 'sentiment',
                  width: 80,
                  render: (v: number) => v?.toFixed(2) ?? '-',
                },
                {
                  title: '时间',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
                },
              ]}
              dataSource={events}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              size="small"
              locale={{ emptyText: '暂无采集内容' }}
            />
          </Card>
        </div>
      )}
    </Card>
  )
}
