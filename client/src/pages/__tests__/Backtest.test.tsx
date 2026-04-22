import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { server } from '../../mocks/handlers'
import Backtest from '../Backtest'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Backtest', () => {
  it('renders backtest page', async () => {
    render(
      <MemoryRouter>
        <Backtest />
      </MemoryRouter>
    )

    expect(screen.getByText('策略回测')).toBeInTheDocument()
    expect(screen.getByText('基于历史数据验证策略表现')).toBeInTheDocument()
  })
})
