import { useState, useEffect } from 'react'
import { Card, Select, Button, Typography, Space, Empty, Divider, Row, Col, message } from 'antd'
import { RobotOutlined, StockOutlined, BulbOutlined, RocketOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface Stock {
  code: string
  name: string
  price: number
  changePercent: number
}

interface History {
  stockCode: string
  stockName: string
  createdAt: string
}

export default function AIAdvice() {
  const [stockCode, setStockCode] = useState<string>('')
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<History[]>([])

  useEffect(() => {
    fetch('/api/stocks/watchlist')
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(() => setStocks([]))
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = () => {
    fetch('/api/ai/history?limit=5')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(() => setHistory([]))
  }

  const analyze = () => {
    if (!stockCode) return
    setLoading(true)
    setResult('')

    fetch(`/api/ai/analyze/v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: stockCode, dimensions: ['fundamental', 'technical', 'risk'] }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.detail) {
          message.error(data.detail)
          setResult('分析失败：' + data.detail)
        } else {
          setResult(data.advice || '未获取到分析结果')
          fetchHistory()
        }
      })
      .catch(() => {
        message.error('分析失败，请稍后重试')
        setResult('分析失败，请稍后重试')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card style={{ 
        borderRadius: 16, 
        border: 'none',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <RobotOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, color: '#fff' }}>AI 智能诊断</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              基于大数据+AI模型，提供专业投资分析建议
            </Text>
          </div>
        </div>
      </Card>

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16,
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
            borderRadius: 12
          }}>
            <StockOutlined style={{ fontSize: 20, color: '#667eea' }} />
            <Text strong style={{ fontSize: 15 }}>选择自选股进行 AI 分析</Text>
          </div>

          <Space.Compact style={{ width: '100%' }}>
            <Select
              style={{ width: '65%', height: 44 }}
              placeholder="选择股票代码"
              showSearch
              allowClear
              optionFilterProp="children"
              value={stockCode}
              onChange={setStockCode}
              size="large"
              options={stocks.map(s => ({
                value: s.code,
                label: `${s.name} (${s.code})`
              }))}
            />
            <Button 
              type="primary" 
              onClick={analyze} 
              disabled={loading || !stockCode}
              loading={loading}
              size="large"
              style={{ 
                width: '35%', 
                borderRadius: 8, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                border: 'none',
                fontWeight: 600
              }}
            >
              <BulbOutlined />
              {loading ? '分析中...' : '开始分析'}
            </Button>
          </Space.Compact>

          <Divider style={{ margin: '12px 0' }} />

          {result && (
            <div style={{ padding: 24, background: '#fafafa', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <BulbOutlined style={{ fontSize: 20, color: '#faad14' }} />
                <Title level={5} style={{ margin: 0 }}>AI 诊断结果</Title>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {result.split('\n').map((line, i) => (
                  <Text key={i}>
                    {line}
                    <br />
                  </Text>
                ))}
              </div>
            </div>
          )}

          {!result && !loading && stocks.length === 0 && (
            <Empty 
              description="暂无自选股，请在首页添加自选股后使用 AI 诊断" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {!result && !loading && stocks.length > 0 && (
            <Empty 
              description="请在上方选择股票进行 AI 诊断" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Space>
      </Card>

      {history.length > 0 && (
        <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Title level={4} style={{ marginBottom: 16 }}>诊断历史</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {history.map((h, i) => (
              <Card key={i} size="small" style={{ borderRadius: 8 }}>
                <Space direction="vertical" size={0}>
                  <Text strong>{h.stockName} ({h.stockCode})</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                  </Text>
                </Space>
              </Card>
            ))}
          </Space>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <RocketOutlined style={{ fontSize: 28, color: '#667eea' }} />
              <Text strong>快速分析</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>秒级响应</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <StockOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              <Text strong>多维分析</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>基本面+技术面</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <BulbOutlined style={{ fontSize: 28, color: '#faad14' }} />
              <Text strong>智能建议</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>买卖点参考</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
