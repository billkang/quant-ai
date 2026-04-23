import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StockDetail from './pages/StockDetail'
import News from './pages/News'
import AIAdvice from './pages/AIAdvice'
import Portfolio from './pages/Portfolio'
import Backtest from './pages/Backtest'
import Alerts from './pages/Alerts'
import Login from './pages/Login'
import Screener from './pages/Screener'
import MarketAnalysis from './pages/MarketAnalysis'
import StrategyManagement from './pages/StrategyManagement'
import StrategyLibrary from './pages/StrategyLibrary'
import DataManagement from './pages/DataManagement'
import Settings from './pages/Settings'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stock/:code" element={<StockDetail />} />
            <Route path="news" element={<News />} />
            <Route path="ai-advice" element={<AIAdvice />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="screener" element={<Screener />} />
            <Route path="backtest" element={<Backtest />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="market-analysis" element={<MarketAnalysis />} />
            <Route path="strategy-management" element={<StrategyManagement />} />
            <Route path="strategy-library" element={<StrategyLibrary />} />
            <Route path="data-management" element={<DataManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
