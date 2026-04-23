import { Card, Typography, Empty } from 'antd'
import { SettingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function StrategyManagement() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          策略管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>管理您的量化交易策略</Text>
      </div>
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
      >
        <Empty
          image={<SettingOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />}
          description="策略管理功能开发中"
        />
      </Card>
    </div>
  )
}
