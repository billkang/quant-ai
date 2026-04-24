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
  CollectionJobItem,
  SystemLogItem,
  SystemLogStats,
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
  getJobs: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<EventJob[]>>('/event-jobs', { params }),
  getJob: (id: number) => api.get<ApiResponse<EventJob>>(`/event-jobs/${id}`),
  getJobsTree: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Array<Record<string, unknown>>>>('/event-jobs/monitor', { params }),
  getJobDetail: (jobId: number) =>
    api.get<ApiResponse<EventJob & { source_name: string | null }>>(`/event-jobs/${jobId}/detail`),
  getJobChannelItems: (sourceId: number, channelId: number) =>
    api.get<ApiResponse<EventItem[]>>(`/event-jobs/${sourceId}/channels/${channelId}/items`),
  getRules: () => api.get<ApiResponse<EventRule[]>>('/event-rules'),
  createRule: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ id: number }>>('/event-rules', data),
  updateRule: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<EventRule>>(`/event-rules/${id}`, data),
  activateRule: (id: number) =>
    api.post<ApiResponse<Record<string, unknown>>>(`/event-rules/${id}/activate`),
}

export const channelApi = {
  getChannels: (params?: { data_source_id?: number; enabled?: number }) =>
    api.get<ApiResponse<ChannelItem[]>>('/channels', { params }),
  createChannel: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ id: number }>>('/channels', data),
  updateChannel: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<ChannelItem>>(`/channels/${id}`, data),
  deleteChannel: (id: number) => api.delete<ApiResponse>(`/channels/${id}`),
  getChannel: (id: number) => api.get<ApiResponse<ChannelItem>>(`/channels/${id}`),
}

export const sourceChannelApi = {
  getSourceChannels: (sourceId: number) =>
    api.get<ApiResponse<ChannelItem[]>>(`/event-sources/${sourceId}/channels`),
  linkChannels: (sourceId: number, channelIds: number[]) =>
    api.post<ApiResponse>(`/event-sources/${sourceId}/channels`, { channel_ids: channelIds }),
  unlinkChannel: (sourceId: number, channelId: number) =>
    api.delete<ApiResponse>(`/event-sources/${sourceId}/channels/${channelId}`),
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

export const collectionApi = {
  getJobs: (params?: { jobType?: string; status?: string; page?: number; pageSize?: number }) =>
    api.get<
      ApiResponse<{ items: CollectionJobItem[]; total: number; page: number; pageSize: number }>
    >('/collection/jobs', { params }),
  getJob: (id: number) => api.get<ApiResponse<CollectionJobItem>>(`/collection/jobs/${id}`),
  triggerJob: (jobType: string) =>
    api.post<ApiResponse<{ id: number }>>('/collection/jobs/trigger', { job_type: jobType }),
  cancelJob: (id: number) => api.post<ApiResponse>(`/collection/jobs/${id}/cancel`),
}

export const dataChannelApi = {
  getChannels: () =>
    api.get<
      ApiResponse<
        Array<{
          id: number
          name: string
          provider: string
          endpoint: string | null
          headers: Record<string, unknown>
          timeout: number
          proxyUrl: string | null
          isActive: number
          createdAt: string | null
        }>
      >
    >('/data-channels'),
  createChannel: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ id: number }>>('/data-channels', data),
  updateChannel: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<{ id: number }>>(`/data-channels/${id}`, data),
  deleteChannel: (id: number) => api.delete<ApiResponse>(`/data-channels/${id}`),
}

export const sectorApi = {
  getSectors: (params?: { level?: number; is_enabled?: boolean }) =>
    api.get<
      ApiResponse<
        Array<{
          id: number
          code: string
          name: string
          level: number
          parentId: number | null
          isEnabled: number
          source: string
        }>
      >
    >('/sectors', { params }),
  getEnabledSectors: () =>
    api.get<
      ApiResponse<
        Array<{ id: number; code: string; name: string; level: number; parentId: number | null }>
      >
    >('/sectors/enabled'),
  createSector: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ id: number }>>('/sectors', data),
  updateSector: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<{ id: number }>>(`/sectors/${id}`, data),
  deleteSector: (id: number) => api.delete<ApiResponse>(`/sectors/${id}`),
}

export const systemLogApi = {
  getLogs: (params?: {
    level?: string
    category?: string
    source?: string
    start_time?: string
    end_time?: string
    limit?: number
    offset?: number
  }) =>
    api.get<
      ApiResponse<{
        items: SystemLogItem[]
        total: number
        limit: number
        offset: number
      }>
    >('/system-logs', { params }),
  createLog: (data: {
    level: string
    category: string
    message: string
    details?: Record<string, unknown>
    source?: string
  }) => api.post<ApiResponse<SystemLogItem>>('/system-logs', data),
  deleteLogs: (params?: { before_days?: number; ids?: number[] }) =>
    api.delete<ApiResponse<{ deleted: number }>>('/system-logs', { params }),
  getStats: (hours?: number) =>
    api.get<ApiResponse<SystemLogStats>>('/system-logs/stats', { params: { hours } }),
}

export default api
