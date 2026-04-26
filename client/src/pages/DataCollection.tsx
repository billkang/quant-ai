import { useState } from 'react'
import { Typography, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import {
  ApiOutlined,
  ScheduleOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  CloudSyncOutlined,
} from '@ant-design/icons'
import DataSourceList from './collection/DataSourceList'
import MonitorPanel from './collection/MonitorPanel'
import ChannelManager from './collection/ChannelManager'
import SectorManager from './collection/SectorManager'

const { Title, Text } = Typography

export default function DataCollection() {
  const [activeTab, setActiveTab] = useState('sources')

  const tabItems: TabsProps['items'] = [
    {
      key: 'sources',
      label: (
        <span>
          <ApiOutlined style={{ marginRight: 6 }} />
          采集源
        </span>
      ),
      children: <DataSourceList />,
    },
    {
      key: 'monitor',
      label: (
        <span>
          <ScheduleOutlined style={{ marginRight: 6 }} />
          采集监控
        </span>
      ),
      children: <MonitorPanel />,
    },
    {
      key: 'channels',
      label: (
        <span>
          <GlobalOutlined style={{ marginRight: 6 }} />
          渠道管理
        </span>
      ),
      children: <ChannelManager />,
    },
    {
      key: 'sectors',
      label: (
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          板块管理
        </span>
      ),
      children: <SectorManager />,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <CloudSyncOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          数据采集
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          统一管理数据采集源、渠道、板块分类与采集任务
        </Text>
      </div>
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={setActiveTab}
        style={{ color: 'var(--text-primary)' }}
      />
    </div>
  )
}
