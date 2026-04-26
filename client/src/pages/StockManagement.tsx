import { useState } from 'react'
import { Typography, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { StockOutlined, FundOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import StockList from './stock/StockList'
import AddStockModal from './stock/AddStockModal'
import StockSectorOverview from './stock/StockSectorOverview'

const { Title, Text } = Typography

export default function StockManagement() {
  const [showAdd, setShowAdd] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAdded = () => setRefreshKey(k => k + 1)

  const tabItems: TabsProps['items'] = [
    {
      key: 'stocks',
      label: (
        <span>
          <StockOutlined style={{ marginRight: 6 }} />
          自选股
        </span>
      ),
      children: <StockList key={refreshKey} onAdd={() => setShowAdd(true)} />,
    },
    {
      key: 'sectors',
      label: (
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          板块概览
        </span>
      ),
      children: <StockSectorOverview />,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <FundOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          股票管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          管理自选股、查看板块信息和数据覆盖情况
        </Text>
      </div>
      <Tabs items={tabItems} style={{ color: 'var(--text-primary)' }} />

      <AddStockModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={handleAdded} />
    </div>
  )
}
