import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { server } from '../../mocks/handlers'
import StockDetail from '../StockDetail'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('StockDetail', () => {
  it('renders stock detail page', async () => {
    render(
      <MemoryRouter initialEntries={['/stock/600519']}>
        <Routes>
          <Route path="/stock/:code" element={<StockDetail />} />
        </Routes>
      </MemoryRouter>
    )

    // StockDetail fetches data asynchronously; wait for it to render
    await waitFor(() => {
      expect(screen.getByText('返回')).toBeInTheDocument()
    })
  })
})
