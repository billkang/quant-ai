import { useState, useEffect } from 'react'

interface NewsItem {
  id: string
  title: string
  source: string
  time: string
  summary: string
  relatedStocks?: string[]
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [category, setCategory] = useState('all')

  useEffect(() => {
    fetch(`/api/news?category=${category}`)
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(() => setNews([]))
  }, [category])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">资讯中心</h1>

      <div className="flex gap-2 mb-6">
        {['all', 'stock', 'macro', 'industry'].map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded ${category === c ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            {c === 'all' ? '全部' : c === 'stock' ? '个股' : c === 'macro' ? '宏观' : '行业'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            暂无资讯
          </div>
        ) : (
          news.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{item.title}</h3>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{item.summary}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">{item.source}</span>
                {item.relatedStocks && (
                  <div className="flex gap-2">
                    {item.relatedStocks.map(code => (
                      <span key={code} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                        {code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}