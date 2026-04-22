import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../../components/Layout'

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear()
    mockedNavigate.mockClear()
  })

  it('redirects to login when no token', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    expect(mockedNavigate).toHaveBeenCalledWith('/login')
  })

  it('displays cached username from localStorage', async () => {
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('username', 'testuser')

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })

  it('shows fallback text when username is not cached', async () => {
    localStorage.setItem('token', 'mock-token')

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('用户')).toBeInTheDocument()
    })
  })
})
