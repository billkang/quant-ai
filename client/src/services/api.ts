import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const stockApi = {
  getWatchlist: () => api.get('/stocks/watchlist'),
  addStock: (code: string) => api.post(`/stocks/watchlist?stock_code=${code}`),
  removeStock: (code: string) => api.delete(`/stocks/watchlist/${code}`),
  getStock: (code: string) => api.get(`/stocks/${code}`),
}

export const newsApi = {
  getNews: (symbol?: string) => api.get('/news', { params: { symbol } }),
  getSources: () => api.get('/news/sources'),
  addSource: (data: unknown) => api.post('/news/sources', data),
}

export const aiApi = {
  analyze: (code: string) =>
    api.post('/ai/analyze', { code, dimensions: ['fundamental', 'technical', 'risk'] }),
  getHistory: (limit = 5) => api.get('/ai/history', { params: { limit } }),
}

export const portfolioApi = {
  getPortfolio: () => api.get('/portfolio'),
  addPosition: (data: unknown) => api.post('/portfolio', data),
}

export const quantApi = {
  getIndicators: (code: string) => api.get(`/quant/indicators/${code}`),
  getIndicatorHistory: (code: string, limit = 60) =>
    api.get(`/quant/indicators/${code}/history`, { params: { limit } }),
  getFundamentals: (code: string) => api.get(`/quant/fundamentals/${code}`),
  runBacktest: (data: unknown) => api.post('/quant/backtest', data),
  getBacktests: (limit = 50) => api.get('/quant/backtests', { params: { limit } }),
  getBacktestDetail: (id: number) => api.get(`/quant/backtests/${id}`),
  getPortfolioAnalysis: () => api.get('/quant/portfolio/analysis'),
  getAlerts: (isRead?: boolean, limit = 50) =>
    api.get('/quant/alerts', { params: { is_read: isRead, limit } }),
  createAlertRule: (data: unknown) => api.post('/quant/alerts/rules', data),
  markAlertRead: (id: number) => api.put(`/quant/alerts/${id}/read`),
}

export default api
