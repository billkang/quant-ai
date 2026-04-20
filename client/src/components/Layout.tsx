import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14">
            <div className="flex items-center space-x-8">
              <Link to="/" className="font-bold text-lg text-blue-600">
                Quant AI
              </Link>
              <div className="flex space-x-6">
                <Link to="/" className="text-gray-600 hover:text-gray-900">首页</Link>
                <Link to="/watchlist" className="text-gray-600 hover:text-gray-900">自选股</Link>
                <Link to="/news" className="text-gray-600 hover:text-gray-900">资讯</Link>
                <Link to="/ai-advice" className="text-gray-600 hover:text-gray-900">AI诊断</Link>
                <Link to="/portfolio" className="text-gray-600 hover:text-gray-900">持仓</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}