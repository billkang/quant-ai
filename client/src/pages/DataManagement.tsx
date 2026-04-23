import { Card, Typography, Empty } from 'antd'
import { DatabaseOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function DataManagement() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          数据管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>数据源与历史数据管理</Text>
      </div>
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
      >
        <Empty
          image={<DatabaseOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />}
          description="数据管理功能开发中"
        />
      </Card>
    </div>
  )
}
