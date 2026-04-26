import { Card, Row, Col, Space } from 'antd'
import { AreaChartOutlined } from '@ant-design/icons'

interface IndicatorValue {
  ma5?: number
  ma10?: number
  ma20?: number
  ma60?: number
  rsi6?: number
  rsi12?: number
  rsi24?: number
  macdDif?: number
  macdDea?: number
  macdBar?: number
  kdjK?: number
  kdjD?: number
  kdjJ?: number
  bollUpper?: number
  bollMid?: number
  bollLower?: number
}

function IndicatorBadge({ label, value, color }: { label: string; value?: number; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '14px 8px' }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: value !== undefined ? color : 'var(--text-muted)',
        }}
      >
        {value !== undefined ? value.toFixed(2) : '-'}
      </div>
    </div>
  )
}

export default function TechnicalIndicators({ data }: { data?: IndicatorValue }) {
  if (!data) return null

  const rsiColor =
    data.rsi6 && data.rsi6 > 70
      ? 'var(--up)'
      : data.rsi6 && data.rsi6 < 30
        ? 'var(--down)'
        : 'var(--text-primary)'

  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      styles={{ body: { padding: 0 } }}
      title={
        <Space>
          <AreaChartOutlined style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600 }}>技术指标</span>
        </Space>
      }
    >
      <Row>
        <Col span={3}>
          <IndicatorBadge label="MA5" value={data.ma5} color="#0ea5e9" />
        </Col>
        <Col span={3}>
          <IndicatorBadge label="MA20" value={data.ma20} color="#a855f7" />
        </Col>
        <Col span={3}>
          <IndicatorBadge label="MA60" value={data.ma60} color="#f59e0b" />
        </Col>
        <Col span={3}>
          <IndicatorBadge label="RSI6" value={data.rsi6} color={rsiColor} />
        </Col>
        <Col span={3}>
          <IndicatorBadge label="MACD" value={data.macdDif} color="#22d3ee" />
        </Col>
        <Col span={3}>
          <IndicatorBadge
            label="BAR"
            value={data.macdBar}
            color={data.macdBar && data.macdBar >= 0 ? 'var(--up)' : 'var(--down)'}
          />
        </Col>
        <Col span={3}>
          <IndicatorBadge label="KDJ K" value={data.kdjK} color="#ec4899" />
        </Col>
        <Col span={3}>
          <IndicatorBadge label="BOLL上轨" value={data.bollUpper} color="#14b8a6" />
        </Col>
      </Row>
    </Card>
  )
}
