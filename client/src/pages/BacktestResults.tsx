import { Card, Typography, Empty } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function BacktestResults() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <BarChartOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          回测结果
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          查看历史回测结果，分析策略表现和收益曲线
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="回测结果功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
