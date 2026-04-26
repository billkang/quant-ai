import { Row, Col, Card, Typography, Empty } from 'antd'
import { BookOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { StrategyItem } from '../../types/api'

const { Text } = Typography

export default function BuiltinStrategyCards({
  strategies,
  onSelect,
}: {
  strategies: StrategyItem[]
  onSelect: (s: StrategyItem) => void
}) {
  if (!strategies.length) {
    return (
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
        title={
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            <BookOutlined style={{ marginRight: 8, color: 'var(--accent)' }} />
            内置策略
          </span>
        }
      >
        <Empty description="暂无内置策略" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    )
  }

  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      title={
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          <BookOutlined style={{ marginRight: 8, color: 'var(--accent)' }} />
          内置策略
        </span>
      }
    >
      <Row gutter={[16, 16]}>
        {strategies.map(s => (
          <Col key={s.id} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              onClick={() => onSelect(s)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'var(--accent-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ThunderboltOutlined style={{ color: 'var(--accent)', fontSize: 18 }} />
                </div>
                <div>
                  <Text strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                    {s.name}
                  </Text>
                  <div
                    style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}
                  >
                    {s.strategy_code}
                  </div>
                </div>
              </div>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  )
}
