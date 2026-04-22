import { useState, useEffect } from 'react'
import { Card, Select, Button, Space, message, Typography, Empty, Tabs, Spin, Tag } from 'antd'
import {
  FileTextOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  ReloadOutlined,
  StockOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

const { Text, Title } = Typography

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

const MARKET_SOURCES: Array<{
  name: string
  source_type: string
  config: Record<string, string>
  interval_minutes: number
}> = [
  {
    name: '上证指数',
    source_type: 'stock_news',
    config: { symbol: '000001' },
    interval_minutes: 30,
  },
  {
    name: '创业板指',
    source_type: 'stock_news',
    config: { symbol: '399006' },
    interval_minutes: 30,
  },
  { name: '科创板', source_type: 'stock_news', config: { symbol: '000688' }, interval_minutes: 30 },
]

export default function News() {
  const [, setSources] = useState<NewsSource[]>([])
  const [selectedStock, setSelectedStock] = useState<string>('')
  const [stocks, setStocks] = useState<Array<{ code: string; name: string }>>([])
  const [, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [tabKey, setTabKey] = useState('news')

  useEffect(() => {
    fetchSources()
    fetchWatchlist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/stocks/watchlist')
      const data = await res.json()
      setStocks(data.map((s: { code: string; name: string }) => ({ code: s.code, name: s.name })))
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
      if (data.length === 0) await initDefaultSources()
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const initDefaultSources = async () => {
    const watchlistRes = await fetch('/api/stocks/watchlist')
    const watchlist = await watchlistRes.json()
    const existingSymbols = new Set()
    for (const src of MARKET_SOURCES) {
      try {
        await fetch('/api/news/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(src),
        })
        existingSymbols.add(src.config.symbol)
      } catch (e) {
        console.error(e)
      }
    }
    for (const stock of watchlist) {
      if (!existingSymbols.has(stock.code)) {
        try {
          await fetch('/api/news/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: stock.name,
              source_type: 'stock_news',
              config: { symbol: stock.code },
              interval_minutes: 60,
            }),
          })
        } catch (e) {
          console.error(e)
        }
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
      console.error(error)
      message.error('获取资讯失败')
    } finally {
      setNewsLoading(false)
    }
  }

  const handleStockChange = (code: string) => {
    setSelectedStock(code)
    setNews([])
    if (code) fetchNews(code)
  }

  const tabItems = [
    {
      key: 'news',
      label: (
        <span>
          <FileTextOutlined style={{ marginRight: 6 }} />
          股票新闻
        </span>
      ),
      children: (
        <div>
          {newsLoading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin />
            </div>
          ) : news.length === 0 ? (
            <Empty
              description="暂无新闻，请先选择股票"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: 60 }}
            />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {news.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px 20px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid transparent',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
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
                  <Text
                    strong
                    style={{
                      fontSize: 15,
                      color: 'var(--text-primary)',
                      display: 'block',
                      marginBottom: 6,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      display: 'block',
                      marginBottom: 8,
                      lineHeight: 1.6,
                    }}
                  >
                    {item.summary}
                  </Text>
                  <Space size={12}>
                    <Tag
                      style={{
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        border: 'none',
                        fontSize: 11,
                      }}
                    >
                      {item.source}
                    </Tag>
                    <Text style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {item.time}
                    </Text>
                  </Space>
                </div>
              ))}
            </Space>
          )}
        </div>
      ),
    },
    {
      key: 'notices',
      label: (
        <span>
          <DatabaseOutlined style={{ marginRight: 6 }} />
          股票公告
        </span>
      ),
      children: (
        <Empty
          description="请选择股票查看公告"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 60 }}
        />
      ),
    },
    {
      key: 'macro',
      label: (
        <span>
          <GlobalOutlined style={{ marginRight: 6 }} />
          宏观资讯
        </span>
      ),
      children: (
        <Empty
          description="宏观资讯功能开发中"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 60 }}
        />
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          资讯中心
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          聚合股票新闻、公告与宏观资讯
        </Text>
      </div>

      <Card bodyStyle={{ padding: '16px 20px' }}>
        <Space size={16} wrap>
          <StockOutlined style={{ fontSize: 18, color: 'var(--accent)' }} />
          <Text strong style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            选择股票
          </Text>
          <Select
            style={{ width: 280 }}
            placeholder="选择自选股或输入股票代码"
            showSearch
            allowClear
            value={selectedStock}
            onChange={handleStockChange}
            options={[
              ...MARKET_SOURCES.map(s => ({ value: s.config.symbol, label: s.name })),
              ...stocks.map(s => ({ value: s.code, label: `${s.name} (${s.code})` })),
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => selectedStock && fetchNews(selectedStock)}
            disabled={!selectedStock}
          >
            刷新
          </Button>
        </Space>
      </Card>

      <Tabs activeKey={tabKey} onChange={setTabKey} items={tabItems} />
    </div>
  )
}
