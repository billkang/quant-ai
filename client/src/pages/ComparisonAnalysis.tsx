import { Card, Typography, Empty } from 'antd'
import { AreaChartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function ComparisonAnalysis() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <AreaChartOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          对比分析
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          多策略对比分析，支持收益曲线、风险指标和持仓对比
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="对比分析功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
