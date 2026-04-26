import { Card, Typography, Empty } from 'antd'
import { AlertOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function EventManagement() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <AlertOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          事件管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          管理事件源、事件规则和事件监控
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="事件管理功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
