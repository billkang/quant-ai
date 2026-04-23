import { Card, Typography, Empty } from 'antd'
import { BookOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function StrategyLibrary() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          策略库
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>浏览和选用系统预设策略</Text>
      </div>
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
      >
        <Empty
          image={<BookOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />}
          description="策略库功能开发中"
        />
      </Card>
    </div>
  )
}
