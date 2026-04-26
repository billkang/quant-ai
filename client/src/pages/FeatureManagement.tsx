import { Card, Typography, Empty } from 'antd'
import { ContainerOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function FeatureManagement() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <ContainerOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          特征管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          管理模型特征，支持特征工程、特征选择和特征监控
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="特征管理功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
