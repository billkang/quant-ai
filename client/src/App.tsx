import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StockManagement from './pages/StockManagement'
import StrategyManagement from './pages/StrategyManagement'
import DataCollection from './pages/DataCollection'
import DataSources from './pages/DataSources'
import FactorManagement from './pages/FactorManagement'
import FeatureManagement from './pages/FeatureManagement'
import FeatureEvaluation from './pages/FeatureEvaluation'
import BacktestTasks from './pages/BacktestTasks'
import BacktestResults from './pages/BacktestResults'
import ComparisonAnalysis from './pages/ComparisonAnalysis'
import BacktestReports from './pages/BacktestReports'
import EventManagement from './pages/EventManagement'
import SystemStatus from './pages/SystemStatus'
import UserManagement from './pages/UserManagement'
import Settings from './pages/Settings'
import StockDetail from './pages/StockDetail'
import News from './pages/News'
import AIAdvice from './pages/AIAdvice'
import Portfolio from './pages/Portfolio'
import Backtest from './pages/Backtest'
import Alerts from './pages/Alerts'
import Login from './pages/Login'
import Screener from './pages/Screener'
import MarketAnalysis from './pages/MarketAnalysis'
import StrategyLibrary from './pages/StrategyLibrary'
import DataManagement from './pages/DataManagement'
import EventsPage from './pages/EventsPage'
import EventRulesPage from './pages/EventRulesPage'
import PaperTrading from './pages/PaperTrading'
import Docs from './pages/Docs'
import SystemLogs from './pages/SystemLogs'

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
            <Route path="events" element={<EventsPage />} />
            <Route path="event-rules" element={<EventRulesPage />} />
            <Route path="paper-trading" element={<PaperTrading />} />
            <Route path="docs" element={<Docs />} />
            <Route path="system-logs" element={<SystemLogs />} />
            {/* New routes based on design */}
            <Route path="stock-management" element={<StockManagement />} />
            <Route path="data-collection" element={<DataCollection />} />
            <Route path="data-sources" element={<DataSources />} />
            <Route path="factor-management" element={<FactorManagement />} />
            <Route path="feature-management" element={<FeatureManagement />} />
            <Route path="feature-evaluation" element={<FeatureEvaluation />} />
            <Route path="backtest-tasks" element={<BacktestTasks />} />
            <Route path="backtest-results" element={<BacktestResults />} />
            <Route path="comparison-analysis" element={<ComparisonAnalysis />} />
            <Route path="backtest-reports" element={<BacktestReports />} />
            <Route path="event-management" element={<EventManagement />} />
            <Route path="system-status" element={<SystemStatus />} />
            <Route path="user-management" element={<UserManagement />} />
            {/* Redirects for old routes */}
            <Route
              path="data-collection-old"
              element={<Navigate to="/data-collection" replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
