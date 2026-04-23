import { Card, Typography, Empty } from 'antd'
import { ToolOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function Settings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          系统设置
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>个性化与系统配置</Text>
      </div>
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
      >
        <Empty
          image={<ToolOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />}
          description="系统设置功能开发中"
        />
      </Card>
    </div>
  )
}
