import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Button } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import { quantApi, stockApi, researchApi } from '../services/api'
import type { ResearchReportItem, StockNoticeItem } from '../types/api'
import PriceHero from './stock/PriceHero'
import TechnicalIndicators from './stock/TechnicalIndicators'
import KlineChart from './stock/KlineChart'
import IndicatorCharts from './stock/IndicatorCharts'
import FundamentalsPanel from './stock/FundamentalsPanel'
import ResearchPanel from './stock/ResearchPanel'

interface StockData {
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

interface KLine {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
}

interface IndicatorItem {
  tradeDate?: string
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

interface Fundamentals {
  peTtm?: number
  pb?: number
  roe?: number
  grossMargin?: number
  revenueGrowth?: number
  debtRatio?: number
}

export default function StockDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [stock, setStock] = useState<StockData | null>(null)
  const [klines, setKlines] = useState<KLine[]>([])
  const [indicators, setIndicators] = useState<IndicatorItem | null>(null)
  const [indicatorHistory, setIndicatorHistory] = useState<IndicatorItem[]>([])
  const [fundamentals, setFundamentals] = useState<Fundamentals | null>(null)
  const [period, setPeriod] = useState('daily')
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<ResearchReportItem[]>([])
  const [notices, setNotices] = useState<StockNoticeItem[]>([])

  useEffect(() => {
    if (!code) return
    setLoading(true)
    stockApi
      .getStock(code)
      .then(res => setStock(res.data))
      .finally(() => setLoading(false))
  }, [code])

  useEffect(() => {
    if (!code) return
    const periodMap: Record<string, string> = { daily: '6mo', weekly: '6mo', monthly: '1y' }
    stockApi.getKline(code, periodMap[period] || '6mo').then(res => setKlines(res.data))
  }, [code, period])

  useEffect(() => {
    if (!code) return
    quantApi.getIndicators(code).then(res => {
      if (res.data?.code === 0) setIndicators(res.data.data)
    })
    quantApi.getIndicatorHistory(code, 120).then(res => {
      if (res.data?.code === 0) setIndicatorHistory(res.data.data || [])
    })
    quantApi.getFundamentals(code).then(res => {
      if (res.data?.code === 0) setFundamentals(res.data.data)
    })
    researchApi.getReports(code).then(res => {
      if (res.data?.code === 0) setReports(res.data.data || [])
    })
    researchApi.getNotices(code).then(res => {
      if (res.data?.code === 0) setNotices(res.data.data || [])
    })
  }, [code])

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<LeftOutlined />}
            onClick={() => navigate('/')}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            返回
          </Button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {stock?.name}{' '}
              <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 400 }}>
                {stock?.code}
              </span>
            </div>
          </div>
        </div>

        <PriceHero {...stock} />

        <TechnicalIndicators data={indicators || undefined} />

        <KlineChart klines={klines} period={period} onPeriodChange={setPeriod} />

        <IndicatorCharts history={indicatorHistory} />

        <FundamentalsPanel data={fundamentals} />

        <ResearchPanel reports={reports} notices={notices} />
      </div>
    </Spin>
  )
}
