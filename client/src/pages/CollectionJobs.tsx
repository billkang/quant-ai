import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Progress,
  Space,
  Drawer,
  Modal,
  Select,
  message,
  Empty,
  Typography,
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { collectionApi } from '../services/api'
import type { CollectionJobItem } from '../types/api'

const { Text } = Typography

const statusColors: Record<string, string> = {
  running: 'blue',
  completed: 'green',
  failed: 'red',
  cancelled: 'orange',
}

const statusLabels: Record<string, string> = {
  running: '运行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
}

export default function CollectionJobs() {
  const [jobs, setJobs] = useState<CollectionJobItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [jobTypeFilter, setJobTypeFilter] = useState<string | undefined>(undefined)
  const [detailJob, setDetailJob] = useState<CollectionJobItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [triggerLoading, setTriggerLoading] = useState<Record<string, boolean>>({})

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await collectionApi.getJobs({
        page,
        pageSize,
        status: statusFilter,
        jobType: jobTypeFilter,
      })
      if (res.data?.code === 0) {
        setJobs(res.data.data.items)
        setTotal(res.data.data.total)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, statusFilter, jobTypeFilter])

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(() => {
      // Only poll if there are running jobs visible
      fetchJobs()
    }, 3000)
    return () => clearInterval(interval)
  }, [fetchJobs])

  const handleTrigger = async (jobType: string) => {
    setTriggerLoading(prev => ({ ...prev, [jobType]: true }))
    try {
      const res = await collectionApi.triggerJob(jobType)
      if (res.data?.code === 0) {
        message.success(`任务已创建 (ID: ${res.data.data.id})`)
        fetchJobs()
      } else {
        message.error(res.data?.message || '创建失败')
      }
    } catch {
      message.error('创建失败')
    } finally {
      setTriggerLoading(prev => ({ ...prev, [jobType]: false }))
    }
  }

  const handleCancel = (job: CollectionJobItem) => {
    Modal.confirm({
      title: '确认取消任务',
      content: `确定要取消 ${job.jobType === 'stock_collection' ? '股票采集' : '新闻采集'} 任务 #${job.id} 吗？`,
      okText: '确认取消',
      okType: 'danger',
      cancelText: '返回',
      onOk: async () => {
        try {
          await collectionApi.cancelJob(job.id)
          message.success('任务已取消')
          fetchJobs()
        } catch {
          message.error('取消失败')
        }
      },
    })
  }

  const openDetail = async (job: CollectionJobItem) => {
    try {
      const res = await collectionApi.getJob(job.id)
      if (res.data?.code === 0) {
        setDetailJob(res.data.data)
        setDrawerOpen(true)
      }
    } catch {
      message.error('获取详情失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '任务类型',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (t: string) => (
        <Tag style={{ borderRadius: 6, fontWeight: 500 }}>
          {t === 'stock_collection' ? '股票采集' : '新闻采集'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={statusColors[s] || 'default'} style={{ borderRadius: 6, fontWeight: 500 }}>
          {statusLabels[s] || s}
        </Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: unknown, record: CollectionJobItem) => (
        <div style={{ minWidth: 120 }}>
          <Progress
            percent={record.progress}
            size="small"
            status={
              record.status === 'failed'
                ? 'exception'
                : record.status === 'completed'
                  ? 'success'
                  : 'active'
            }
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {record.processedItems} / {record.totalItems}
          </div>
        </div>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (t: string | null) => (t ? new Date(t).toLocaleString() : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (t: string | null) => (t ? new Date(t).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: CollectionJobItem) => (
        <Space size="small">
          {record.status === 'running' && (
            <Button
              type="text"
              danger
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => handleCancel(record)}
            >
              取消
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => openDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
        title={
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
            采集任务监控
          </span>
        }
        extra={
          <Space>
            <Select
              placeholder="任务类型"
              allowClear
              style={{ width: 120 }}
              onChange={v => {
                setJobTypeFilter(v)
                setPage(1)
              }}
              options={[
                { value: 'stock_collection', label: '股票采集' },
                { value: 'news_collection', label: '新闻采集' },
              ]}
            />
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 120 }}
              onChange={v => {
                setStatusFilter(v)
                setPage(1)
              }}
              options={[
                { value: 'running', label: '运行中' },
                { value: 'completed', label: '已完成' },
                { value: 'failed', label: '失败' },
                { value: 'cancelled', label: '已取消' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchJobs} loading={loading}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={triggerLoading['stock_collection']}
              onClick={() => handleTrigger('stock_collection')}
            >
              采集行情
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={triggerLoading['news_collection']}
              onClick={() => handleTrigger('news_collection')}
            >
              采集新闻
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps || 20)
            },
          }}
          locale={{ emptyText: <Empty description="暂无任务" /> }}
        />
      </Card>

      <Drawer
        title={`任务详情 #${detailJob?.id}`}
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {detailJob && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Text type="secondary">任务类型</Text>
              <div>{detailJob.jobType === 'stock_collection' ? '股票采集' : '新闻采集'}</div>
            </div>
            <div>
              <Text type="secondary">状态</Text>
              <div>
                <Tag color={statusColors[detailJob.status] || 'default'}>
                  {statusLabels[detailJob.status] || detailJob.status}
                </Tag>
              </div>
            </div>
            <div>
              <Text type="secondary">进度</Text>
              <div>
                <Progress
                  percent={detailJob.progress}
                  status={
                    detailJob.status === 'failed'
                      ? 'exception'
                      : detailJob.status === 'completed'
                        ? 'success'
                        : 'active'
                  }
                />
                <Text type="secondary">
                  {detailJob.processedItems} / {detailJob.totalItems}
                </Text>
              </div>
            </div>
            <div>
              <Text type="secondary">开始时间</Text>
              <div>
                {detailJob.startTime ? new Date(detailJob.startTime).toLocaleString() : '-'}
              </div>
            </div>
            <div>
              <Text type="secondary">结束时间</Text>
              <div>{detailJob.endTime ? new Date(detailJob.endTime).toLocaleString() : '-'}</div>
            </div>
            {detailJob.errorLog && (
              <div>
                <Text type="secondary">错误日志</Text>
                <pre
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: 12,
                    borderRadius: 8,
                    overflow: 'auto',
                    maxHeight: 300,
                    fontSize: 12,
                  }}
                >
                  {detailJob.errorLog}
                </pre>
              </div>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  )
}
