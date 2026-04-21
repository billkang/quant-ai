import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StockDetail from './pages/StockDetail'
import News from './pages/News'
import AIAdvice from './pages/AIAdvice'
import Portfolio from './pages/Portfolio'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stock/:code" element={<StockDetail />} />
            <Route path="news" element={<News />} />
            <Route path="ai-advice" element={<AIAdvice />} />
            <Route path="portfolio" element={<Portfolio />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
