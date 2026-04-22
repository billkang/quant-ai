import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StockDetail from './pages/StockDetail'
import News from './pages/News'
import AIAdvice from './pages/AIAdvice'
import Portfolio from './pages/Portfolio'
import Backtest from './pages/Backtest'
import Alerts from './pages/Alerts'
import { darkTheme } from './theme'

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN} theme={darkTheme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="stock/:code" element={<StockDetail />} />
              <Route path="news" element={<News />} />
              <Route path="ai-advice" element={<AIAdvice />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="backtest" element={<Backtest />} />
              <Route path="alerts" element={<Alerts />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App
