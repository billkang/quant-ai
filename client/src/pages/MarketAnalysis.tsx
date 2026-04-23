import { Card, Typography, Empty } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function MarketAnalysis() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          行情分析
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>多维度市场数据分析</Text>
      </div>
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
      >
        <Empty
          image={<BarChartOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />}
          description="行情分析功能开发中"
        />
      </Card>
    </div>
  )
}
