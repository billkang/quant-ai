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
]

export const server = setupServer(...handlers)
