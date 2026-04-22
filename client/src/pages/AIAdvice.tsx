import { useState, useEffect } from 'react'
import {
  Card,
  Select,
  Button,
  Typography,
  Space,
  Empty,
  Divider,
  Row,
  Col,
  message,
  Modal,
  Tag,
} from 'antd'
import {
  RobotOutlined,
  StockOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  AreaChartOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import api from '../services/api'

const { Text, Title } = Typography

interface Stock {
  code: string
  name: string
  price: number
  changePercent: number
}

interface History {
  id: number
  stockCode: string
  stockName: string
  finalReport: string
  fundamentalAnalysis?: string
  technicalAnalysis?: string
  riskAnalysis?: string
  score: string
  createdAt: string
}

export default function AIAdvice() {
  const [stockCode, setStockCode] = useState<string>('')
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<History[]>([])
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailData, setDetailData] = useState<History | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    api
      .get('/stocks/watchlist')
      .then(res => setStocks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setStocks([]))
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = () => {
    api
      .get('/ai/history', { params: { limit: 5 } })
      .then(res => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch(() => setHistory([]))
  }

  const viewDetail = (id: number) => {
    setDetailLoading(true)
    api
      .get(`/ai/history/${id}`)
      .then(res => {
        setDetailData(res.data)
        setDetailOpen(true)
      })
      .catch(() => message.error('获取详情失败'))
      .finally(() => setDetailLoading(false))
  }

  const analyze = () => {
    if (!stockCode) return
    setLoading(true)
    setResult('')
    api
      .post('/ai/analyze', { code: stockCode, dimensions: ['fundamental', 'technical', 'risk'] })
      .then(res => {
        const data = res.data
        if (data.detail) {
          message.error(data.detail)
          setResult('分析失败：' + data.detail)
          return
        }
        const result = data.data || data
        const report = result.final_report || result.finalReport || result.advice || ''
        if (report) {
          setResult(report)
          fetchHistory()
        } else {
          setResult('未获取到分析结果')
        }
      })
      .catch(() => {
        message.error('分析失败，请稍后重试')
        setResult('分析失败，请稍后重试')
      })
      .finally(() => setLoading(false))
  }

  const SectionCard = ({
    title,
    icon: Icon,
    content,
    color,
  }: {
    title: string
    icon: React.ElementType
    content?: string
    color: string
  }) => (
    <div
      style={{
        padding: 16,
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <Space size={8} style={{ marginBottom: 10 }}>
        <Icon style={{ fontSize: 16, color }} />
        <Text strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>
          {title}
        </Text>
      </Space>
      <div
        style={{
          whiteSpace: 'pre-wrap',
          lineHeight: 1.8,
          color: 'var(--text-secondary)',
          fontSize: 13,
        }}
      >
        {content || '暂无分析结果'}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          AI 智能诊断
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          基于真实指标数据的多维度智能分析
        </Text>
      </div>

      <Card
        className="metric-card"
        bodyStyle={{ padding: '24px 28px' }}
        data-testid="ai-select-card"
      >
        <Row gutter={[24, 16]} align="middle">
          <Col flex="auto">
            <Space.Compact style={{ width: '100%' }}>
              <Select
                style={{ width: '60%' }}
                placeholder="选择股票代码"
                showSearch
                allowClear
                optionFilterProp="children"
                value={stockCode}
                onChange={setStockCode}
                size="large"
                options={stocks.map(s => ({ value: s.code, label: `${s.name} (${s.code})` }))}
                data-testid="ai-stock-select"
              />
              <Button
                type="primary"
                onClick={analyze}
                disabled={loading || !stockCode}
                loading={loading}
                size="large"
                style={{ width: '40%' }}
                data-testid="ai-analyze-btn"
              >
                <ThunderboltOutlined /> {loading ? '分析中...' : '开始分析'}
              </Button>
            </Space.Compact>
          </Col>
        </Row>
      </Card>

      {result && (
        <Card
          title={
            <Space>
              <BulbOutlined style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600 }}>诊断结果</span>
            </Space>
          }
        >
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              color: 'var(--text-primary)',
              fontSize: 14,
              padding: 8,
            }}
          >
            {result}
          </div>
        </Card>
      )}

      {!result && !loading && stocks.length === 0 && (
        <Empty
          description="暂无自选股，请在首页添加后使用 AI 诊断"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 60 }}
        />
      )}
      {!result && !loading && stocks.length > 0 && (
        <Empty
          description="请在上方选择股票进行 AI 诊断"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 60 }}
        />
      )}

      {history.length > 0 && (
        <Card
          title={
            <Space>
              <HistoryOutlined style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600 }}>诊断历史</span>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {history.map((h, i) => (
              <div
                key={i}
                onClick={() => viewDetail(h.id)}
                style={{
                  padding: '14px 18px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)'
                  e.currentTarget.style.background = 'var(--bg-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text strong style={{ color: 'var(--text-primary)' }}>
                    {h.stockName} ({h.stockCode})
                  </Text>
                  {h.score && (
                    <Tag
                      style={{
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        border: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {h.score}
                    </Tag>
                  )}
                </div>
                <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                </Text>
              </div>
            ))}
          </Space>
        </Card>
      )}

      <Modal
        title={`${detailData?.stockName} (${detailData?.stockCode}) - 诊断详情`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={720}
        loading={detailLoading}
      >
        {detailData && (
          <div>
            <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {detailData.createdAt ? new Date(detailData.createdAt).toLocaleString() : ''}
            </Text>
            {detailData.score && (
              <Tag
                style={{
                  marginLeft: 12,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {detailData.score}
              </Tag>
            )}
            <Divider style={{ borderColor: 'var(--border)' }} />
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <SectionCard
                title="基本面分析"
                icon={StockOutlined}
                content={detailData.fundamentalAnalysis}
                color="#0ea5e9"
              />
              <SectionCard
                title="技术面分析"
                icon={AreaChartOutlined}
                content={detailData.technicalAnalysis}
                color="#a855f7"
              />
              <SectionCard
                title="风险评估"
                icon={SafetyOutlined}
                content={detailData.riskAnalysis}
                color="#f59e0b"
              />
              <SectionCard
                title="最终建议"
                icon={RobotOutlined}
                content={detailData.finalReport}
                color="#22c55e"
              />
            </Space>
          </div>
        )}
      </Modal>

      <Row gutter={[16, 16]}>
        {[
          { icon: ThunderboltOutlined, title: '快速分析', desc: '秒级响应', color: '#0ea5e9' },
          { icon: AreaChartOutlined, title: '多维分析', desc: '基本面+技术面', color: '#22c55e' },
          { icon: BulbOutlined, title: '智能建议', desc: '买卖点参考', color: '#f59e0b' },
        ].map((item, i) => (
          <Col xs={24} sm={8} key={i}>
            <Card bodyStyle={{ padding: '24px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${item.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <item.icon style={{ fontSize: 24, color: item.color }} />
              </div>
              <Text
                strong
                style={{
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                {item.title}
              </Text>
              <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
