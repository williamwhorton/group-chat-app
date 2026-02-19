import React from 'react'
import { render, screen, waitFor } from '@/__tests__/setup'
import HomePage from '@/app/page'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
}

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

beforeEach(() => {
  jest.clearAllMocks()
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  mockUseRouter.mockReturnValue({
    push: mockPush,
  } as any)
})

describe('HomePage', () => {
  it('redirects authenticated user to channels', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    render(<HomePage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/channels')
    })
  })

  it('displays landing page for unauthenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getAllByText('Treehouse')[0]).toBeInTheDocument()
      expect(
        screen.getByText(/team chat that brings everyone together/i)
      ).toBeInTheDocument()
    })
  })

  it('shows Get Started button', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    render(<HomePage />)

    await waitFor(() => {
      const getStartedButton = screen.getByRole('link', {
        name: /get started for free/i,
      })
      expect(getStartedButton).toHaveAttribute('href', '/auth/sign-up')
    })
  })

  it('shows Login button', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    render(<HomePage />)

    await waitFor(() => {
      const loginButton = screen.getByRole('link', { name: /log in/i })
      expect(loginButton).toHaveAttribute('href', '/auth/login')
    })
  })

  it('displays feature list', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText(/organized conversations/i)).toBeInTheDocument()
      expect(screen.getByText(/real-time messaging/i)).toBeInTheDocument()
      expect(screen.getByText(/team invitations/i)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    mockSupabase.auth.getUser.mockImplementation(() => new Promise(() => {}))

    const { container } = render(<HomePage />)

    expect(container.firstChild).toBeNull()
  })
})
