import { Card, Row, Col } from 'antd'
import {
  BookOutlined,
  ContainerOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
} from '@ant-design/icons'

interface StatItem {
  title: string
  value: string | number
  change?: string
  changeUp?: boolean
  icon: React.ReactNode
  color: string
}

const stats: StatItem[] = [
  {
    title: '策略总数',
    value: 12,
    change: '较上周 ↑ 2',
    icon: <BookOutlined />,
    color: '#3b82f6',
  },
  {
    title: '特征总数',
    value: 48,
    change: '较上周 ↑ 7',
    icon: <ContainerOutlined />,
    color: '#8b5cf6',
  },
  {
    title: '有效特征占比',
    value: '37%',
    change: '较上周 ↑ 5%',
    icon: <PieChartOutlined />,
    color: '#22c55e',
  },
  {
    title: '回测总数（7天）',
    value: 86,
    change: '较上周 ↑ 23',
    icon: <BarChartOutlined />,
    color: '#f59e0b',
  },
  {
    title: '平均夏普比率',
    value: 1.24,
    change: '较上周 ↑ 0.15',
    icon: <LineChartOutlined />,
    color: '#14b8a6',
  },
  {
    title: '胜率（回测）',
    value: '62%',
    change: '较上周 ↑ 8%',
    icon: <TrophyOutlined />,
    color: '#ec4899',
  },
]

export default function ResearchOverview() {
  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, idx) => (
        <Col xs={24} sm={12} lg={8} xl={4} key={idx}>
          <Card
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                  fontSize: 18,
                }}
              >
                {stat.icon}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stat.title}</span>
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                marginBottom: 4,
              }}
            >
              {stat.value}
            </div>
            {stat.change && <div style={{ fontSize: 12, color: '#22c55e' }}>{stat.change}</div>}
          </Card>
        </Col>
      ))}
    </Row>
  )
}
