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
  code: string
  name: string
  quantity: number
  costPrice: number
  currentPrice: number
  profit: number
  profitPercent: number
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
