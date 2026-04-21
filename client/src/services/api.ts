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

export default api
