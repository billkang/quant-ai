import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Select,
  message,
  Modal,
  Typography,
  Empty,
  Statistic,
  Row,
  Col,
  DatePicker,
  Input,
  Drawer,
} from 'antd'
import {
  ReloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  BugOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { systemLogApi } from '../services/api'
import type { SystemLogItem, SystemLogStats } from '../types/api'
import type { Dayjs } from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const levelColors: Record<string, string> = {
  DEBUG: 'default',
  INFO: 'blue',
  WARNING: 'orange',
  ERROR: 'red',
  CRITICAL: 'purple',
}

const levelIcons: Record<string, React.ReactNode> = {
  DEBUG: <BugOutlined />,
  INFO: <InfoCircleOutlined />,
  WARNING: <WarningOutlined />,
  ERROR: <CloseCircleOutlined />,
  CRITICAL: <ExclamationCircleOutlined />,
}

const categoryLabels: Record<string, string> = {
  general: '通用',
  scheduler: '调度器',
  api: 'API',
  data_collection: '数据采集',
  event: '事件',
  paper_trading: '虚拟盘',
  notification: '通知',
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<SystemLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [stats, setStats] = useState<SystemLogStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [detailLog, setDetailLog] = useState<SystemLogItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await systemLogApi.getLogs({
        level: levelFilter,
        category: categoryFilter,
        source: sourceFilter || undefined,
        start_time: dateRange?.[0]?.toISOString(),
        end_time: dateRange?.[1]?.toISOString(),
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
      if (res.data?.code === 0) {
        setLogs(res.data.data.items)
        setTotal(res.data.data.total)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, levelFilter, categoryFilter, sourceFilter, dateRange])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await systemLogApi.getStats(24)
      if (res.data?.code === 0) {
        setStats(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [fetchLogs, fetchStats])

  const handleCleanup = () => {
    Modal.confirm({
      title: '清理历史日志',
      content: '确定要删除 30 天前的所有日志吗？此操作不可恢复。',
      okText: '确认清理',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await systemLogApi.deleteLogs({ before_days: 30 })
          if (res.data?.code === 0) {
            message.success(`已清理 ${res.data.data.deleted} 条日志`)
            fetchLogs()
            fetchStats()
          }
        } catch {
          message.error('清理失败')
        }
      },
    })
  }

  const openDetail = (log: SystemLogItem) => {
    setDetailLog(log)
    setDrawerOpen(true)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag
          color={levelColors[level] || 'default'}
          icon={levelIcons[level]}
          style={{ borderRadius: 6, fontWeight: 500 }}
        >
          {level}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat: string) => (
        <Tag style={{ borderRadius: 6, background: 'var(--bg-elevated)', border: 'none' }}>
          {categoryLabels[cat] || cat}
        </Tag>
      ),
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg: string, record: SystemLogItem) => (
        <Text
          style={{ color: 'var(--text-primary)', cursor: 'pointer' }}
          onClick={() => openDetail(record)}
        >
          {msg}
        </Text>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 140,
      render: (src: string | null) => (
        <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{src || '-'}</Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (t: string) => (
        <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {t ? new Date(t).toLocaleString() : '-'}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: SystemLogItem) => (
        <Button type="text" size="small" onClick={() => openDetail(record)}>
          详情
        </Button>
      ),
    },
  ]

  const statCards = [
    {
      title: '24h 日志总数',
      value: stats?.total ?? 0,
      icon: <FileTextOutlined style={{ fontSize: 20, color: 'var(--accent)' }} />,
    },
    {
      title: '错误数',
      value: (stats?.byLevel?.ERROR ?? 0) + (stats?.byLevel?.CRITICAL ?? 0),
      icon: <CloseCircleOutlined style={{ fontSize: 20, color: '#ef4444' }} />,
    },
    {
      title: '警告数',
      value: stats?.byLevel?.WARNING ?? 0,
      icon: <WarningOutlined style={{ fontSize: 20, color: '#f59e0b' }} />,
    },
    {
      title: '信息数',
      value: stats?.byLevel?.INFO ?? 0,
      icon: <InfoCircleOutlined style={{ fontSize: 20, color: '#3b82f6' }} />,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <FileTextOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          系统日志
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>查看和管理系统运行日志</Text>
      </div>

      <Row gutter={16}>
        {statCards.map((card, idx) => (
          <Col span={6} key={idx}>
            <Card
              style={{
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
              }}
              bodyStyle={{ padding: '16px 20px' }}
              loading={statsLoading}
            >
              <Space>
                {card.icon}
                <Statistic
                  title={
                    <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>{card.title}</Text>
                  }
                  value={card.value}
                  valueStyle={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
        title={
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
            日志列表
          </span>
        }
        extra={
          <Space>
            <RangePicker
              showTime
              onChange={dates => {
                setDateRange(dates)
                setPage(1)
              }}
              style={{ width: 320 }}
            />
            <Select
              placeholder="级别"
              allowClear
              style={{ width: 110 }}
              onChange={v => {
                setLevelFilter(v)
                setPage(1)
              }}
              options={[
                { value: 'DEBUG', label: 'DEBUG' },
                { value: 'INFO', label: 'INFO' },
                { value: 'WARNING', label: 'WARNING' },
                { value: 'ERROR', label: 'ERROR' },
                { value: 'CRITICAL', label: 'CRITICAL' },
              ]}
            />
            <Select
              placeholder="分类"
              allowClear
              style={{ width: 130 }}
              onChange={v => {
                setCategoryFilter(v)
                setPage(1)
              }}
              options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))}
            />
            <Input
              placeholder="来源筛选"
              allowClear
              style={{ width: 140 }}
              value={sourceFilter}
              onChange={e => {
                setSourceFilter(e.target.value)
                setPage(1)
              }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading}>
              刷新
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleCleanup}>
              清理旧日志
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={logs}
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
          locale={{ emptyText: <Empty description="暂无日志" /> }}
        />
      </Card>

      <Drawer
        title={`日志详情 #${detailLog?.id}`}
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {detailLog && (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <div>
              <Text type="secondary">日志级别</Text>
              <div>
                <Tag
                  color={levelColors[detailLog.level] || 'default'}
                  icon={levelIcons[detailLog.level]}
                  style={{ borderRadius: 6, fontSize: 14, padding: '4px 12px' }}
                >
                  {detailLog.level}
                </Tag>
              </div>
            </div>
            <div>
              <Text type="secondary">分类</Text>
              <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {categoryLabels[detailLog.category] || detailLog.category}
              </div>
            </div>
            <div>
              <Text type="secondary">来源</Text>
              <div style={{ color: 'var(--text-primary)' }}>{detailLog.source || '-'}</div>
            </div>
            <div>
              <Text type="secondary">时间</Text>
              <div style={{ color: 'var(--text-primary)' }}>
                {detailLog.createdAt ? new Date(detailLog.createdAt).toLocaleString() : '-'}
              </div>
            </div>
            <div>
              <Text type="secondary">消息</Text>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: 12,
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  marginTop: 4,
                }}
              >
                {detailLog.message}
              </div>
            </div>
            {detailLog.details && Object.keys(detailLog.details).length > 0 && (
              <div>
                <Text type="secondary">详情</Text>
                <pre
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: 12,
                    borderRadius: 8,
                    overflow: 'auto',
                    maxHeight: 400,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                  }}
                >
                  {JSON.stringify(detailLog.details, null, 2)}
                </pre>
              </div>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  )
}
