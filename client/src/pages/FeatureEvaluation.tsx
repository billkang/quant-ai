import { Card, Typography, Empty } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function FeatureEvaluation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <LineChartOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          特征评估
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          评估特征有效性，分析IC值、IR值和分层收益
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="特征评估功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
