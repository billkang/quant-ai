import { useState, useEffect } from 'react'
import { Card, Tabs, Typography, Alert } from 'antd'
import type { TabsProps } from 'antd'
import {
  DatabaseOutlined,
  GlobalOutlined,
  AlertOutlined,
  ScheduleOutlined,
  ApiOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import DataSourceList from '../components/data-management/DataSourceList'
import ChannelManagement from '../components/data-management/ChannelManagement'
import CollectionMonitoring from '../components/data-management/CollectionMonitoring'
import EventQueryTab from '../components/data-management/EventQueryTab'
import SectorManagement from '../components/data-management/SectorManagement'

const { Title, Text } = Typography

const tabItems: TabsProps['items'] = [
  {
    key: 'sources',
    label: (
      <span>
        <ApiOutlined style={{ marginRight: 6 }} />
        数据源
      </span>
    ),
    children: <DataSourceList />,
  },
  {
    key: 'channels',
    label: (
      <span>
        <GlobalOutlined style={{ marginRight: 6 }} />
        渠道管理
      </span>
    ),
    children: <ChannelManagement />,
  },
  {
    key: 'events',
    label: (
      <span>
        <AlertOutlined style={{ marginRight: 6 }} />
        事件查询
      </span>
    ),
    children: <EventQueryTab />,
  },
  {
    key: 'monitor',
    label: (
      <span>
        <ScheduleOutlined style={{ marginRight: 6 }} />
        采集监控
      </span>
    ),
    children: <CollectionMonitoring />,
  },
  {
    key: 'sectors',
    label: (
      <span>
        <SafetyCertificateOutlined style={{ marginRight: 6 }} />
        板块管理
      </span>
    ),
    children: <SectorManagement />,
  },
]

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState('sources')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && tabItems.some(t => t?.key === hash)) {
      setActiveTab(hash)
    }
  }, [])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    window.location.hash = key
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <DatabaseOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          数据管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          统一管理数据源、采集渠道、事件查询、采集监控与板块分类
        </Text>
      </div>
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={handleTabChange}
        style={{ color: 'var(--text-primary)' }}
      />
    </div>
  )
}
