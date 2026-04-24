import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Space, Switch, Tag, Typography, Select } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { eventApi, channelApi, sourceChannelApi } from '../../services/api'
import type { EventSource, ChannelItem } from '../../types/api'

const { Text } = Typography

const sourceTypeLabels: Record<string, string> = {
  stock_info: '股票信息',
  hk_stock_info: '港股信息',
  international_news: '国际新闻',
  financial_news: '财经资讯',
  sector_data: '板块数据',
  macro_data: '宏观数据',
}

export default function DataSourceList() {
  const [sources, setSources] = useState<EventSource[]>([])
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sourcesRes, channelsRes] = await Promise.all([
        eventApi.getSources(),
        channelApi.getChannels(),
      ])
      if (sourcesRes.data?.code === 0) setSources(sourcesRes.data.data || [])
      if (channelsRes.data?.code === 0) setChannels(channelsRes.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleChannel = async (channel: ChannelItem) => {
    try {
      await channelApi.updateChannel(channel.id, {
        enabled: channel.enabled === 1 ? 0 : 1,
      })
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleTriggerSource = async (source: EventSource) => {
    try {
      await eventApi.triggerSource(source.id)
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectChannels = async (sourceId: number, channelIds: number[]) => {
    try {
      await sourceChannelApi.linkChannels(sourceId, channelIds)
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const columns = [
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
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (v: string) => (
        <Tag style={{ borderRadius: 6, background: 'var(--bg-elevated)', border: 'none' }}>
          {sourceTypeLabels[v] || v}
        </Tag>
      ),
    },
    {
      title: '调度',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{v}</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: EventSource) => (
        <Button
          size="small"
          icon={<ThunderboltOutlined />}
          onClick={() => handleTriggerSource(record)}
        >
          采集
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
      bodyStyle={{ padding: 0 }}
      title={<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>数据源</span>}
    >
      <Table
        columns={columns}
        dataSource={sources}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        expandable={{
          expandedRowRender: (record: EventSource) => {
            const selectedIds = record.selected_channel_ids || []
            const selectedChannels = channels.filter(c => selectedIds.includes(c.id))
            return (
              <div style={{ padding: '8px 16px' }}>
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    选择渠道
                  </Text>
                  <Select
                    mode="multiple"
                    style={{ width: '100%', marginTop: 8 }}
                    placeholder="选择要关联的采集渠道"
                    value={selectedIds}
                    onChange={(vals: number[]) => handleSelectChannels(record.id, vals)}
                    options={channels.map(ch => ({
                      value: ch.id,
                      label: `${ch.name} (${ch.collectionMethod})`,
                    }))}
                    size="small"
                  />
                </div>
                {selectedChannels.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>未选择渠道（将使用默认渠道）</div>
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {selectedChannels.map(ch => (
                      <div
                        key={ch.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'var(--bg-elevated)',
                          borderRadius: 6,
                        }}
                      >
                        <Space>
                          <Text style={{ color: 'var(--text-primary)' }}>{ch.name}</Text>
                          <Tag size="small">{ch.collectionMethod}</Tag>
                          {ch.endpoint && (
                            <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                              {ch.endpoint}
                            </Text>
                          )}
                        </Space>
                        <Switch
                          checked={ch.enabled === 1}
                          onChange={() => handleToggleChannel(ch)}
                          size="small"
                        />
                      </div>
                    ))}
                  </Space>
                )}
              </div>
            )
          },
        }}
        locale={{ emptyText: '暂无数据源配置' }}
      />
    </Card>
  )
}
