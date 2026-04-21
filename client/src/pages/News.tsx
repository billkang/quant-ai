import { useState, useEffect } from 'react'
import { Card, Row, Col, Select, Button, Space, message, Typography, Empty, Tabs, Spin } from 'antd'
import { FileTextOutlined, DatabaseOutlined, GlobalOutlined, ReloadOutlined, StockOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface NewsItem {
  id: string
  title: string
  source: string
  time: string
  summary: string
}

interface NewsSource {
  id: number
  name: string
  sourceType: string
  config: Record<string, string>
  intervalMinutes: number
  enabled: boolean
  lastFetchedAt: string | null
}

const DEFAULT_SOURCES: Array<{name: string, source_type: string, config: Record<string, string>, interval_minutes: number}> = [
  { name: '大盘行情', source_type: 'stock_news', config: { symbol: '000001' }, interval_minutes: 60 },
  { name: '创业板指', source_type: 'stock_news', config: { symbol: '399006' }, interval_minutes: 60 },
  { name: '科创板', source_type: 'stock_news', config: { symbol: '000688' }, interval_minutes: 60 },
  { name: '贵州茅台', source_type: 'stock_news', config: { symbol: '600519' }, interval_minutes: 60 },
  { name: '宁德时代', source_type: 'stock_news', config: { symbol: '300750' }, interval_minutes: 60 },
  { name: '腾讯控股', source_type: 'stock_news', config: { symbol: '00700.HK' }, interval_minutes: 60 },
  { name: '阿里巴巴', source_type: 'stock_news', config: { symbol: '9988.HK' }, interval_minutes: 60 },
]

export default function News() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [selectedStock, setSelectedStock] = useState<string>('')
  const [stocks, setStocks] = useState<Array<{code: string, name: string}>>([])
  const [loading, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [tabKey, setTabKey] = useState('news')

  useEffect(() => {
    fetchSources()
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/stocks/watchlist')
      const data = await res.json()
      setStocks(data.map((s: {code: string, name: string}) => ({ code: s.code, name: s.name })))
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
    }
  }

  const fetchSources = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/news/sources')
      const data = await res.json()
      setSources(data)
      if (data.length === 0) {
        await initDefaultSources()
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const initDefaultSources = async () => {
    for (const src of DEFAULT_SOURCES) {
      try {
        await fetch('/api/news/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(src)
        })
      } catch (e) {
        console.error('Failed to add source:', e)
      }
    }
    await fetchSources()
  }

  const fetchNews = async (stockCode: string) => {
    if (!stockCode) return
    setNewsLoading(true)
    try {
      const res = await fetch(`/api/news?symbol=${stockCode}`)
      const data = await res.json()
      setNews(data)
    } catch (error) {
      console.error('Failed to fetch news:', error)
      message.error('获取资讯失败')
    } finally {
      setNewsLoading(false)
    }
  }

  const handleStockChange = (code: string) => {
    setSelectedStock(code)
    setNews([])
    if (code) {
      fetchNews(code)
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'stock_news': return <FileTextOutlined />
      case 'stock_notices': return <DatabaseOutlined />
      case 'macro_news': return <GlobalOutlined />
      default: return <FileTextOutlined />
    }
  }

  const tabItems = [
    {
      key: 'news',
      label: (
        <span><FileTextOutlined /> 股票新闻</span>
      ),
      children: (
        <Card bordered={false} style={{ background: '#fafafa', borderRadius: 12 }}>
          {newsLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
          ) : news.length === 0 ? (
            <Empty description="暂无新闻，请先选择股票或添加自选股" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {news.map((item, idx) => (
                <Card key={idx} size="small" style={{ borderRadius: 8 }}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 15 }}>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.summary}</Text>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.source}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>|</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                    </Space>
                  </Space>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )
    },
    {
      key: 'notices',
      label: (
        <span><DatabaseOutlined /> 股票公告</span>
      ),
      children: (
        <Card bordered={false} style={{ background: '#fafafa', borderRadius: 12 }}>
          <Empty description="请选择股票查看公告" />
        </Card>
      )
    },
    {
      key: 'macro',
      label: (
        <span><GlobalOutlined /> 宏观资讯</span>
      ),
      children: (
        <Card bordered={false} style={{ background: '#fafafa', borderRadius: 12 }}>
          <Empty description="宏观资讯功能开发中" />
        </Card>
      )
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card style={{ 
        borderRadius: 16, 
        border: 'none',
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileTextOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, color: '#fff' }}>资讯中心</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              聚合股票新闻、公告、宏观资讯
            </Text>
          </div>
        </div>
      </Card>

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16,
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
            borderRadius: 12
          }}>
            <StockOutlined style={{ fontSize: 18, color: '#11998e' }} />
            <Text strong style={{ fontSize: 15 }}>选择股票查看资讯</Text>
            <Select
              style={{ width: 280 }}
              placeholder="选择自选股或输入股票代码"
              showSearch
              allowClear
              value={selectedStock}
              onChange={handleStockChange}
              options={[
                ...stocks.map(s => ({ value: s.code, label: `${s.name} (${s.code})` })),
                ...DEFAULT_SOURCES.filter(s => s.source_type === 'stock_news').map(s => ({
                  value: s.config.symbol,
                  label: s.name
                }))
              ]}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => selectedStock && fetchNews(selectedStock)}
              disabled={!selectedStock}
            >
              刷新
            </Button>
          </div>

          <Tabs 
            activeKey={tabKey} 
            onChange={setTabKey}
            items={tabItems}
          />
        </Space>
      </Card>
    </div>
  )
}