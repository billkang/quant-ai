import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { server } from '../../mocks/handlers'
import Portfolio from '../Portfolio'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Portfolio', () => {
  it('renders portfolio with positions', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('贵州茅台')).toBeInTheDocument()
    })

    expect(screen.getByText('600519')).toBeInTheDocument()
  })
})
