import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StockDetail from './pages/StockDetail'
import News from './pages/News'
import AIAdvice from './pages/AIAdvice'
import Portfolio from './pages/Portfolio'
import Backtest from './pages/Backtest'
import Alerts from './pages/Alerts'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#0ea5e9',
          colorBgBase: '#0f172a',
          colorBgContainer: '#0f172a',
          colorBgElevated: '#1e293b',
          colorTextBase: '#f1f5f9',
          colorTextSecondary: '#94a3b8',
          colorBorder: 'rgba(148, 163, 184, 0.1)',
          colorBorderSecondary: 'rgba(148, 163, 184, 0.08)',
          borderRadius: 12,
          borderRadiusSM: 8,
          borderRadiusLG: 16,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
          fontSize: 14,
          controlHeight: 40,
        },
        components: {
          Card: {
            colorBgContainer: '#0f172a',
            colorBorderSecondary: 'rgba(148, 163, 184, 0.1)',
          },
          Table: {
            colorBgContainer: 'transparent',
            headerBg: '#1e293b',
            headerColor: '#94a3b8',
            rowHoverBg: '#1e293b',
            borderColor: 'rgba(148, 163, 184, 0.1)',
          },
          Button: {
            borderRadius: 8,
          },
          Input: {
            colorBgContainer: '#1e293b',
            colorBorder: 'rgba(148, 163, 184, 0.1)',
            activeBorderColor: '#0ea5e9',
            hoverBorderColor: 'rgba(148, 163, 184, 0.2)',
          },
          Select: {
            colorBgContainer: '#1e293b',
            colorBorder: 'rgba(148, 163, 184, 0.1)',
            optionSelectedBg: 'rgba(14, 165, 233, 0.15)',
            optionActiveBg: '#334155',
          },
          Tabs: {
            colorBgContainer: 'transparent',
            inkBarColor: '#0ea5e9',
            itemActiveColor: '#0ea5e9',
            itemHoverColor: '#38bdf8',
          },
          Tag: {
            borderRadiusSM: 6,
          },
          Modal: {
            colorBgElevated: '#0f172a',
            headerBg: '#0f172a',
            titleColor: '#f1f5f9',
            contentBg: '#0f172a',
          },
          DatePicker: {
            colorBgContainer: '#1e293b',
            colorBorder: 'rgba(148, 163, 184, 0.1)',
          },
          Statistic: {
            colorTextDescription: '#94a3b8',
            colorTextHeading: '#f1f5f9',
          },
          Menu: {
            colorBgContainer: 'transparent',
            colorItemBgSelected: 'rgba(14, 165, 233, 0.15)',
            colorItemTextSelected: '#0ea5e9',
            colorItemBgHover: '#334155',
          },
          Badge: {
            colorError: '#ef4444',
          },
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
            <Route path="backtest" element={<Backtest />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
