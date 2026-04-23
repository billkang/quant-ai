import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { server } from '../../mocks/handlers'
import Dashboard from '../Dashboard'

vi.mock('echarts-for-react', () => ({
  default: function ReactECharts({ style }: { style?: React.CSSProperties }) {
    return <div data-testid="echarts-mock" style={style} />
  },
}))

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Dashboard', () => {
  it('renders metric cards', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    expect(screen.getByText('总资产 (USD)')).toBeInTheDocument()
    expect(screen.getByText('$128,450.36')).toBeInTheDocument()
    expect(screen.getByText('今日收益')).toBeInTheDocument()
    expect(screen.getByText('运行中策略')).toBeInTheDocument()
    expect(screen.getByText('风险指标')).toBeInTheDocument()
  })

  it('renders charts', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    expect(screen.getByText('资产组合走势')).toBeInTheDocument()
    expect(screen.getByText('策略分布')).toBeInTheDocument()
    expect(screen.getByText('实时行情 - BTC/USDT')).toBeInTheDocument()
    expect(screen.getAllByTestId('echarts-mock').length).toBeGreaterThanOrEqual(3)
  })

  it('renders watchlist with stock data', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('贵州茅台')).toBeInTheDocument()
    })

    expect(screen.getByText('600519')).toBeInTheDocument()
  })
})
