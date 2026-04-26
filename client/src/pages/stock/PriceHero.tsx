import { Card, Row, Col, Tag } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface Props {
  name?: string
  code?: string
  price?: number
  change?: number
  changePercent?: number
  open?: number
  high?: number
  low?: number
  volume?: number
}

export default function PriceHero({
  price,
  change,
  changePercent = 0,
  open,
  high,
  low,
  volume,
}: Props) {
  const isUp = changePercent >= 0
  const changeColor = isUp ? 'var(--up)' : 'var(--down)'

  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      styles={{ body: { padding: '24px 28px' } }}
    >
      <Row gutter={[40, 16]} align="middle">
        <Col>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)' }}>
              ¥{price?.toFixed(2) || '-'}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: changeColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {change ? `${isUp ? '+' : ''}${change.toFixed(2)}` : '-'}
              </span>
              <Tag
                style={{
                  background: isUp ? 'var(--up-soft)' : 'var(--down-soft)',
                  color: changeColor,
                  border: 'none',
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {isUp ? '+' : ''}
                {changePercent.toFixed(2)}%
              </Tag>
            </div>
          </div>
        </Col>
        <Col flex="auto">
          <Row gutter={[32, 8]}>
            <Col>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                今开
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {open?.toFixed(2) || '-'}
              </div>
            </Col>
            <Col>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                最高
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {high?.toFixed(2) || '-'}
              </div>
            </Col>
            <Col>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                最低
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {low?.toFixed(2) || '-'}
              </div>
            </Col>
            <Col>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                成交量
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {volume ? `${(volume / 100000000).toFixed(2)}亿` : '-'}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  )
}
