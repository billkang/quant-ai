import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { server } from '../../mocks/handlers'
import Alerts from '../Alerts'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Alerts', () => {
  it('renders alerts page', async () => {
    render(
      <MemoryRouter>
        <Alerts />
      </MemoryRouter>
    )

    expect(screen.getByText('告警中心')).toBeInTheDocument()
  })
})
