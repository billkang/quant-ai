import { Card, Row, Col, Space } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

interface Fundamentals {
  peTtm?: number
  pb?: number
  roe?: number
  grossMargin?: number
  revenueGrowth?: number
  debtRatio?: number
}

export default function FundamentalsPanel({ data }: { data?: Fundamentals | null }) {
  if (!data) return null

  const items = [
    { label: 'PE(TTM)', value: data.peTtm, suffix: '' },
    { label: 'PB', value: data.pb, suffix: '' },
    { label: 'ROE', value: data.roe, suffix: '%' },
    { label: '毛利率', value: data.grossMargin, suffix: '%' },
    { label: '营收增速', value: data.revenueGrowth, suffix: '%' },
    { label: '负债率', value: data.debtRatio, suffix: '%' },
  ]

  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      title={
        <Space>
          <InfoCircleOutlined style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600 }}>基本面数据</span>
        </Space>
      }
    >
      <Row gutter={[24, 16]}>
        {items.map(item => (
          <Col span={4} key={item.label}>
            <div
              style={{
                padding: '16px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.value !== undefined && item.value !== null
                  ? `${item.value.toFixed(2)}${item.suffix}`
                  : '-'}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  )
}
