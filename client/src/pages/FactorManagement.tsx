import { Card, Typography, Empty } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function FactorManagement() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <AppstoreOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          因子管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          管理量化因子库，包括技术因子、基本面因子和市场因子
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="因子管理功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
