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
  EventItem,
  EventSource,
  EventJob,
  EventRule,
  StrategyItem,
  StrategyVersion,
  PaperAccountData,
  PaperPositionItem,
  PaperOrderItem,
  ResearchReportItem,
  StockNoticeItem,
  NotificationSettingData,
  NotificationItem,
} from '../types/api'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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

    // Handle authentication errors (401 / 422 missing Authorization)
    if (
      status === 401 ||
      (status === 422 &&
        data?.detail?.some?.((d: { loc?: string[] }) => d.loc?.includes('Authorization')))
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      // Use full reload to ensure React Router picks up the login route cleanly
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Log to console in dev; could send to Sentry in production
    console.error(`[API Error ${status}]`, message)

    // Reject with enriched error for components to handle if needed
    return Promise.reject({ status, message, data })
  }
)

export const stockApi = {
  getWatchlist: () => api.get<Stock[]>('/stocks/watchlist'),
  addStock: (code: string) =>
    api.post<ApiResponse<{ stock_code: string; name: string }>>('/stocks/watchlist', {
      stock_code: code,
    }),
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
  getPortfolio: () => api.get<ApiResponse<PortfolioData>>('/portfolio'),
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

export const dashboardApi = {
  getOverview: () => api.get<ApiResponse<Record<string, unknown>>>('/dashboard'),
}

export const eventApi = {
  getEvents: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<EventItem[]>>('/events', { params }),
  updateEvent: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<EventItem>>(`/events/${id}`, data),
  deleteEvent: (id: number) => api.delete<ApiResponse>(`/events/${id}`),
  getSources: () => api.get<ApiResponse<EventSource[]>>('/event-sources'),
  createSource: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ id: number }>>('/event-sources', data),
  updateSource: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<EventSource>>(`/event-sources/${id}`, data),
  deleteSource: (id: number) => api.delete<ApiResponse>(`/event-sources/${id}`),
  triggerSource: (id: number) =>
    api.post<ApiResponse<Record<string, unknown>>>(`/event-sources/${id}/trigger`),
  getJobs: (limit = 50) => api.get<ApiResponse<EventJob[]>>('/event-jobs', { params: { limit } }),
  getJob: (id: number) => api.get<ApiResponse<EventJob>>(`/event-jobs/${id}`),
  getRules: () => api.get<ApiResponse<EventRule[]>>('/event-rules'),
  createRule: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ id: number }>>('/event-rules', data),
  updateRule: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<EventRule>>(`/event-rules/${id}`, data),
  activateRule: (id: number) =>
    api.post<ApiResponse<Record<string, unknown>>>(`/event-rules/${id}/activate`),
}

export const strategyApi = {
  getStrategies: () => api.get<ApiResponse<StrategyItem[]>>('/strategies'),
  getBuiltinStrategies: () => api.get<ApiResponse<StrategyItem[]>>('/strategies/builtin'),
  getStrategy: (id: number) => api.get<ApiResponse<StrategyItem>>(`/strategies/${id}`),
  createStrategy: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ id: number }>>('/strategies', data),
  updateStrategy: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<StrategyItem>>(`/strategies/${id}`, data),
  deleteStrategy: (id: number) => api.delete<ApiResponse>(`/strategies/${id}`),
  getVersions: (id: number) =>
    api.get<ApiResponse<StrategyVersion[]>>(`/strategies/${id}/versions`),
  createVersion: (id: number, data: Record<string, unknown>) =>
    api.post<ApiResponse<StrategyVersion>>(`/strategies/${id}/versions`, data),
}

export const systemApi = {
  health: () => api.get<ApiResponse<HealthCheck>>('/health'),
  externalHealth: () => api.get<ApiResponse<HealthCheck>>('/health/external'),
}

export const paperApi = {
  getAccount: () => api.get<ApiResponse<PaperAccountData>>('/paper/account'),
  getPositions: () => api.get<ApiResponse<PaperPositionItem[]>>('/paper/positions'),
  createOrder: (data: {
    stock_code: string
    stock_name: string
    side: string
    quantity: number
    order_type?: string
  }) => api.post<ApiResponse<PaperOrderItem>>('/paper/orders', data),
  getOrders: (limit = 50) => api.get<ApiResponse<PaperOrderItem[]>>(`/paper/orders?limit=${limit}`),
  resetAccount: () => api.post<ApiResponse>('/paper/reset'),
}

export const researchApi = {
  getReports: (symbol: string, limit = 20) =>
    api.get<ApiResponse<ResearchReportItem[]>>(`/research/reports?symbol=${symbol}&limit=${limit}`),
  getNotices: (symbol: string, category = 'all', limit = 20) =>
    api.get<ApiResponse<StockNoticeItem[]>>(
      `/research/notices?symbol=${symbol}&category=${category}&limit=${limit}`
    ),
  fetchData: (symbol: string, type: string) =>
    api.post<ApiResponse>('/research/fetch', { symbol, type }),
}

export const notificationApi = {
  getSettings: () => api.get<ApiResponse<NotificationSettingData>>('/notifications/settings'),
  updateSettings: (data: Partial<NotificationSettingData>) =>
    api.put<ApiResponse>('/notifications/settings', data),
  getHistory: (limit = 50, isRead?: boolean) =>
    api.get<ApiResponse<NotificationItem[]>>(
      `/notifications/history?limit=${limit}${isRead !== undefined ? `&is_read=${isRead}` : ''}`
    ),
  markRead: (id: number) => api.put<ApiResponse>(`/notifications/${id}/read`),
  testChannel: (channel: string) => api.post<ApiResponse>('/notifications/test', { channel }),
}

export default api
