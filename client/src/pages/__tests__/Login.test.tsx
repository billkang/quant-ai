import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
    mockedNavigate.mockClear()
  })

  it('redirects to home when already logged in', () => {
    localStorage.setItem('token', 'existing-token')
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(mockedNavigate).toHaveBeenCalledWith('/')
  })

  it('shows login form when not logged in', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(mockedNavigate).not.toHaveBeenCalled()
  })
})
