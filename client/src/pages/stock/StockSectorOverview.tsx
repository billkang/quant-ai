import { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Typography } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import { sectorApi } from '../../services/api'

const { Text } = Typography

interface SectorItem {
  id: number
  code: string
  name: string
  level: number
  isEnabled: number
  source: string
}

export default function StockSectorOverview() {
  const [sectors, setSectors] = useState<SectorItem[]>([])

  useEffect(() => {
    sectorApi.getSectors({ level: 1 }).then(res => {
      if (res.data?.code === 0) setSectors(res.data.data || [])
    })
  }, [])

  const level1Sectors = sectors.filter(s => s.level === 1).slice(0, 12)

  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      bodyStyle={{ padding: '16px 20px' }}
      title={
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          <SafetyCertificateOutlined style={{ marginRight: 8, color: 'var(--accent)' }} />
          一级板块概览
        </span>
      }
    >
      <Row gutter={[12, 12]}>
        {level1Sectors.map(s => (
          <Col key={s.id} xs={12} sm={8} md={6} lg={4}>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                {s.name}
              </Text>
              <Tag
                style={{
                  fontSize: 10,
                  borderRadius: 4,
                  border: 'none',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  marginLeft: 'auto',
                }}
              >
                {s.code}
              </Tag>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  )
}
