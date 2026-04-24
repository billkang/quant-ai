export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

// ---- Stock ----

export interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  high?: number
  low?: number
  open?: number
  volume?: number
}

export interface KLine {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
}

// ---- News ----

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  time: string
  url: string
}

export interface NewsSource {
  id: number
  name: string
  sourceType: string
  config: Record<string, unknown>
  intervalMinutes: number
  enabled: boolean
  lastFetchedAt: string | null
}

export interface NewsSourceCreate {
  name: string
  source_type: string
  config: Record<string, unknown>
  interval_minutes: number
}

// ---- AI Advice ----

export interface DiagnosticResult {
  code: string
  fundamentalAnalysis: string
  technicalAnalysis: string
  riskAnalysis: string
  finalReport: string
  score: string
}

export interface DiagnosticHistory {
  id: number
  stockCode: string
  stockName: string
  finalReport: string
  score: string
  createdAt: string
}

export interface AnalyzeRequest {
  code: string
  dimensions: string[]
}

export interface ChatResponse {
  answer: string
}

// ---- Portfolio ----

export interface Position {
  id?: number
  backtestTaskId?: number
  strategyId?: number
  code: string
  name: string
  quantity: number
  avgCost: number
  currentPrice: number
  unrealizedPnl?: number
  profit: number
  profitPercent: number
  isActive?: number
}

export interface PortfolioData {
  positions: Position[]
  totalValue: number
  totalCost: number
  totalProfit: number
}

export interface Transaction {
  code: string
  name: string
  type: string
  quantity: number
  price: number
  commission: number
  date: string
}

export interface AddPositionRequest {
  stock_code: string
  stock_name: string
  quantity: number
  cost_price: number
  buy_date?: string
}

// ---- Quant ----

export interface Indicators {
  stockCode: string
  tradeDate: string
  ma5?: number
  ma10?: number
  ma20?: number
  ma60?: number
  rsi6?: number
  rsi12?: number
  rsi24?: number
  macdDif?: number
  macdDea?: number
  macdBar?: number
  kdjK?: number
  kdjD?: number
  kdjJ?: number
  bollUpper?: number
  bollMid?: number
  bollLower?: number
  volMa5?: number
  volMa10?: number
}

export interface IndicatorHistoryItem {
  tradeDate: string
  ma5?: number
  ma10?: number
  ma20?: number
  ma60?: number
  rsi6?: number
  rsi12?: number
  rsi24?: number
  macdDif?: number
  macdDea?: number
  macdBar?: number
  kdjK?: number
  kdjD?: number
  kdjJ?: number
  bollUpper?: number
  bollMid?: number
  bollLower?: number
  volMa5?: number
  volMa10?: number
}

export interface Fundamentals {
  stockCode: string
  reportDate: string
  peTtm?: number
  pb?: number
  ps?: number
  roe?: number
  roa?: number
  grossMargin?: number
  netMargin?: number
  revenueGrowth?: number
  profitGrowth?: number
  debtRatio?: number
  freeCashFlow?: number
}

export interface BacktestRequest {
  stockCode: string
  strategy: string
  strategyParams: Record<string, unknown>
  startDate: string
  endDate: string
  initialCash: number
}

export interface BacktestResult {
  id: number
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  tradeCount: number
  equityCurve: Array<{ date: string; value: number }>
  trades: Array<{ date: string; action: string; price: number; shares: number; value: number }>
}

export interface BacktestRecord {
  id: number
  strategy: string
  stockCode: string
  startDate: string
  endDate: string
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  tradeCount: number
}

export interface BacktestDetail extends BacktestRecord {
  initialCash: number
  finalValue: number
  equityCurve: Array<{ date: string; value: number }>
  trades: Array<{ date: string; action: string; price: number; shares: number; value: number }>
}

export interface PortfolioAnalysis {
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  industryDistribution: Record<string, number>
  correlationMatrix: Record<string, Record<string, number>>
}

export interface AlertItem {
  id: number
  stockCode: string
  alertType: string
  condition: string
  message: string
  triggeredAt: string
  isRead: boolean
  createdAt: string
}

export interface AlertRuleRequest {
  stockCode: string
  alertType: string
  condition: string
  message: string
}

export interface HealthCheck {
  status: string
}

// ---- Events ----

export interface EventItem {
  id: number
  source_id: number
  scope: string
  symbol: string | null
  sector: string | null
  title: string
  summary: string | null
  sentiment: number | null
  strength: number | null
  certainty: number | null
  urgency: number | null
  duration: string | null
  tags: string[] | null
  signals: Record<string, unknown> | null
  is_edited: number
  created_at: string
}

export interface EventSource {
  id: number
  name: string
  source_type: string
  scope: string
  config: Record<string, unknown>
  schedule: string
  enabled: number
  is_builtin: number
  category: string | null
  selected_channel_ids: number[]
  last_fetched_at: string | null
  last_error: string | null
  created_at: string
}

export interface ChannelItem {
  id: number
  dataSourceId: number
  dataSourceName: string | null
  referencingSourceIds: number[]
  referencingSourceNames: string[]
  name: string
  collectionMethod: string
  endpoint: string | null
  headers: Record<string, unknown>
  timeout: number
  proxyUrl: string | null
  config: Record<string, unknown>
  enabled: number
  createdAt: string
  updatedAt: string
}

export interface EventJob {
  id: number
  source_id: number
  channel_id?: number
  channel_name?: string | null
  status: string
  trigger_type: string
  new_events_count: number
  duplicate_count: number
  error_count: number
  progress?: number
  started_at: string
  completed_at: string | null
  logs?: string | null
  error_message?: string | null
}

export interface EventRule {
  id: number
  name: string
  rule_type: string
  version: string
  config: Record<string, unknown>
  is_active: number
  created_at: string
}

// ---- Strategy ----

export interface StrategyItem {
  id: number
  name: string
  description: string | null
  category: string
  strategy_code: string
  params_schema: Record<string, unknown> | null
  is_builtin: number
  is_active: number
  created_at: string
}

export interface StrategyVersion {
  id: number
  version_number: number
  params_schema: Record<string, unknown> | null
  changelog: string | null
  created_at: string
}

// ---- Paper Trading ----

export interface PaperAccountData {
  initialCash: number
  availableCash: number
  totalMarketValue: number
  totalAssets: number
  totalProfit: number
  totalProfitPercent: number
}

export interface PaperPositionItem {
  code: string
  name: string
  quantity: number
  costPrice: number
  currentPrice: number
  marketValue: number
  profit: number
  profitPercent: number
}

export interface PaperOrderItem {
  id: number
  stock_code: string
  stock_name: string
  side: string
  quantity: number
  price: number
  amount: number
  status: string
  created_at: string
}

// ---- Research Report ----

export interface ResearchReportItem {
  id: number
  symbol: string
  title: string
  source: string | null
  author: string | null
  rating: string | null
  targetPrice: number | null
  publishDate: string | null
  summary: string | null
}

export interface StockNoticeItem {
  id: number
  symbol: string
  title: string
  category: string | null
  source: string | null
  publishDate: string | null
  url: string | null
}

// ---- Notification ----

export interface NotificationSettingData {
  email: { enabled: boolean; address: string }
  webhook: { enabled: boolean; url: string }
  channels: Record<string, string[]>
}

export interface NotificationItem {
  id: number
  type: string
  title: string
  content: string | null
  channels: string[]
  isRead: boolean
  createdAt: string
}

// ---- Collection Job ----

export interface CollectionJobItem {
  id: number
  jobType: string
  status: string
  progress: number
  totalItems: number
  processedItems: number
  startTime: string | null
  endTime: string | null
  errorLog: string | null
  createdAt: string | null
  updatedAt: string | null
}

// ---- System Log ----

export interface SystemLogItem {
  id: number
  level: string
  category: string
  message: string
  details: Record<string, unknown> | null
  source: string | null
  createdAt: string
}

export interface SystemLogStats {
  total: number
  byLevel: Record<string, number>
  byCategory: Record<string, number>
}
