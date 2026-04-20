import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Watchlist from './pages/Watchlist'
import StockDetail from './pages/StockDetail'
import News from './pages/News'
import AIAdvice from './pages/AIAdvice'
import Portfolio from './pages/Portfolio'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="stock/:code" element={<StockDetail />} />
          <Route path="news" element={<News />} />
          <Route path="ai-advice" element={<AIAdvice />} />
          <Route path="portfolio" element={<Portfolio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App