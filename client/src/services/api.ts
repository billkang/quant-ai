import axios from 'axios'
import type {
  ApiResponse,
  Stock,
  KLine,
  NewsItem,
  NewsSource,
  NewsSourceCreate,
  DiagnosticResult,
  DiagnosticHistory,
  AnalyzeRequest,
  ChatResponse,
  PortfolioData,
  Transaction,
  AddPositionRequest,
  Indicators,
  IndicatorHistoryItem,
  Fundamentals,
  BacktestRequest,
  BacktestResult,
  BacktestRecord,
  BacktestDetail,
  PortfolioAnalysis,
  AlertItem,
  AlertRuleRequest,
  HealthCheck,
} from '../types/api'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use(
  config => {
    // Could add auth token here
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor for unified error handling
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    const data = error.response?.data
    const message = data?.message || error.message || '请求失败'

    // Log to console in dev; could send to Sentry in production
    console.error(`[API Error ${status}]`, message)

    // Reject with enriched error for components to handle if needed
    return Promise.reject({ status, message, data })
  }
)

export const stockApi = {
  getWatchlist: () => api.get<Stock[]>('/stocks/watchlist'),
  addStock: (code: string) =>
    api.post<ApiResponse<{ stock_code: string; name: string }>>(
      `/stocks/watchlist?stock_code=${code}`
    ),
  removeStock: (code: string) => api.delete<ApiResponse>(`/stocks/watchlist/${code}`),
  getStock: (code: string) => api.get<Stock>(`/stocks/${code}`),
  getKline: (code: string, period?: string) =>
    api.get<KLine[]>(`/stocks/${code}/kline`, { params: { period } }),
}

export const newsApi = {
  getNews: (symbol?: string) => api.get<NewsItem[]>('/news', { params: { symbol } }),
  getSources: () => api.get<NewsSource[]>('/news/sources'),
  addSource: (data: NewsSourceCreate) =>
    api.post<ApiResponse<{ id: number }>>('/news/sources', data),
}

export const aiApi = {
  analyze: (code: string) =>
    api.post<ApiResponse<DiagnosticResult>>('/ai/analyze', {
      code,
      dimensions: ['fundamental', 'technical', 'risk'],
    } as AnalyzeRequest),
  getHistory: (limit = 5) => api.get<DiagnosticHistory[]>('/ai/history', { params: { limit } }),
  getHistoryDetail: (id: number) => api.get<DiagnosticHistory>(`/ai/history/${id}`),
  chat: (question: string) =>
    api.get<ApiResponse<ChatResponse>>('/ai/chat', { params: { question } }),
}

export const portfolioApi = {
  getPortfolio: () => api.get<PortfolioData>('/portfolio'),
  addPosition: (data: AddPositionRequest) => api.post<ApiResponse>('/portfolio', data),
  deletePosition: (code: string) => api.delete<ApiResponse>(`/portfolio/${code}`),
  getTransactions: (limit = 50) =>
    api.get<Transaction[]>('/portfolio/transactions', { params: { limit } }),
}

export const quantApi = {
  getIndicators: (code: string) =>
    api.get<ApiResponse<Indicators | null>>(`/quant/indicators/${code}`),
  getIndicatorHistory: (code: string, limit = 60) =>
    api.get<ApiResponse<IndicatorHistoryItem[]>>(`/quant/indicators/${code}/history`, {
      params: { limit },
    }),
  getFundamentals: (code: string) =>
    api.get<ApiResponse<Fundamentals | null>>(`/quant/fundamentals/${code}`),
  runBacktest: (data: BacktestRequest) =>
    api.post<ApiResponse<BacktestResult>>('/quant/backtest', data),
  getBacktests: (limit = 50) =>
    api.get<ApiResponse<BacktestRecord[]>>('/quant/backtests', { params: { limit } }),
  getBacktestDetail: (id: number) => api.get<ApiResponse<BacktestDetail>>(`/quant/backtests/${id}`),
  getPortfolioAnalysis: () => api.get<ApiResponse<PortfolioAnalysis>>('/quant/portfolio/analysis'),
  getAlerts: (isRead?: boolean, limit = 50) =>
    api.get<ApiResponse<AlertItem[]>>(`/quant/alerts`, { params: { is_read: isRead, limit } }),
  createAlertRule: (data: AlertRuleRequest) =>
    api.post<ApiResponse<{ id: number }>>('/quant/alerts/rules', data),
  markAlertRead: (id: number) => api.put<ApiResponse>(`/quant/alerts/${id}/read`),
}

export const systemApi = {
  health: () => api.get<ApiResponse<HealthCheck>>('/health'),
  externalHealth: () => api.get<ApiResponse<HealthCheck>>('/health/external'),
}

export default api
