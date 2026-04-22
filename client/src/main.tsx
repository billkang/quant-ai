import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import { useTheme } from './hooks/useTheme'
import './index.css'

function ThemedApp() {
  const { antdToken, algorithm } = useTheme()
  const antdAlgorithm = algorithm === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: antdAlgorithm,
        token: {
          borderRadius: 8,
          ...antdToken,
        },
      }}
    >
      <App />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
)
