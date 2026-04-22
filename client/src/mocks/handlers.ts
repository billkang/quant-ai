import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const handlers = [
  http.get('/api/stocks/watchlist', () => {
    return HttpResponse.json([
      { code: '600519', name: '贵州茅台', price: 1700, change: 10, changePercent: 0.59 },
    ])
  }),

  http.post('/api/stocks/watchlist', async ({ request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('stock_code')
    if (code === '600519') {
      return HttpResponse.json({ status: 'error', message: '股票已存在' })
    }
    return HttpResponse.json({ status: 'ok', name: '宁德时代' })
  }),

  http.delete('/api/stocks/watchlist/:code', () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  http.get('/api/stocks/:code', () => {
    return HttpResponse.json({
      code: '600519',
      name: '贵州茅台',
      price: 1700,
      change: 10,
      changePercent: 0.59,
      high: 1710,
      low: 1690,
      open: 1695,
      volume: 5000000,
    })
  }),

  http.get('/api/stocks/:code/kline', () => {
    return HttpResponse.json([
      { date: '2024-01-01', open: 1690, close: 1700, high: 1710, low: 1680, volume: 1000000 },
    ])
  }),

  http.get('/api/news', ({ request }) => {
    const url = new URL(request.url)
    const symbol = url.searchParams.get('symbol')
    if (symbol) {
      return HttpResponse.json([
        {
          id: '1',
          title: '测试新闻',
          summary: '摘要',
          source: '东方财富',
          time: '2026-04-21 10:00:00',
          url: 'http://test.com/1',
        },
      ])
    }
    return HttpResponse.json([])
  }),

  http.get('/api/ai/history', () => {
    return HttpResponse.json([
      {
        id: 1,
        stockCode: '000001',
        stockName: '平安银行',
        finalReport: '...',
        score: 'B+',
        createdAt: '2026-04-21T10:00:00Z',
      },
    ])
  }),

  http.post('/api/ai/analyze', () => {
    return HttpResponse.json({
      code: '000001',
      finalReport: '综合评级：买入',
      fundamentalAnalysis: '基本面良好',
      technicalAnalysis: '技术面上行',
      riskAnalysis: '风险可控',
      score: 'B+',
    })
  }),

  http.get('/api/portfolio', () => {
    return HttpResponse.json({
      positions: [
        {
          code: '600519',
          name: '贵州茅台',
          quantity: 100,
          costPrice: 1600,
          currentPrice: 1700,
          profit: 10000,
          profitPercent: 6.25,
        },
      ],
      totalValue: 170000,
      totalCost: 160000,
      totalProfit: 10000,
    })
  }),

  http.get('/api/quant/indicators/:code', () => {
    return HttpResponse.json({
      code: 0,
      data: {
        stockCode: '600519',
        tradeDate: '2024-01-01',
        ma5: 1700,
        ma20: 1680,
        rsi6: 55,
        macdDif: 0.5,
        macdBar: 0.2,
      },
    })
  }),

  http.get('/api/quant/indicators/:code/history', () => {
    return HttpResponse.json({
      code: 0,
      data: [
        {
          tradeDate: '2024-01-01',
          ma5: 1700,
          macdDif: 0.5,
          macdDea: 0.3,
          macdBar: 0.2,
          rsi6: 55,
        },
      ],
    })
  }),

  http.get('/api/quant/fundamentals/:code', () => {
    return HttpResponse.json({
      code: 0,
      data: {
        stockCode: '600519',
        reportDate: '2024-03-31',
        peTtm: 25.5,
        pb: 8.2,
        roe: 15.2,
      },
    })
  }),

  http.get('/api/quant/alerts', () => {
    return HttpResponse.json({ code: 0, data: [] })
  }),

  http.put('/api/quant/alerts/:id/read', () => {
    return HttpResponse.json({ code: 0, data: null })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { username?: string; password?: string }
    if (body.username === 'testuser' && body.password === 'testpass') {
      return HttpResponse.json({
        code: 0,
        data: { access_token: 'mock-token-123', token_type: 'bearer', expires_in: 604800 },
        message: '登录成功',
      })
    }
    return HttpResponse.json({ detail: '用户名或密码错误' }, { status: 401 })
  }),

  http.post('/api/auth/register', async () => {
    return HttpResponse.json({
      code: 0,
      data: { id: 1, username: 'testuser', access_token: 'mock-token-123', token_type: 'bearer' },
      message: '注册成功',
    })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      code: 0,
      data: { id: 1, username: 'testuser', email: 'test@example.com' },
      message: 'ok',
    })
  }),
]

export const server = setupServer(...handlers)
