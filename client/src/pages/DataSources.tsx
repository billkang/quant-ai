import { Card, Typography, Empty } from 'antd'
import { ApiOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function DataSources() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <ApiOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          数据源
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          管理数据接入源，配置API接口和数据通道
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="数据源功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
