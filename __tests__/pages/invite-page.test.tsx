import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import InvitePage from '@/app/invite/[token]/page'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

const mockPush = jest.fn()
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
}

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('InvitePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ token: 'token123' })
    mockUseRouter.mockReturnValue({ push: mockPush } as any)
    mockCreateClient.mockReturnValue(mockSupabase as any)

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        channel_name: 'Test Channel',
        inviter_name: 'Test Inviter',
        status: 'pending',
        isExpired: false,
      }),
    })
  })

  it('renders invitation details', async () => {
    render(<InvitePage />)

    await waitFor(() => {
      expect(screen.getByText('Test Channel')).toBeInTheDocument()
      expect(screen.getByText(/invited by test inviter/i)).toBeInTheDocument()
    })
  })

  it('shows sign in button when not logged in', async () => {
    render(<InvitePage />)

    await waitFor(() => {
      expect(screen.getByText(/sign in to join/i)).toBeInTheDocument()
    })
  })

  it('shows join button when logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
    })

    render(<InvitePage />)

    await waitFor(() => {
      expect(screen.getByText(/join channel/i)).toBeInTheDocument()
    })
  })

  it('handles join successfully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
    })

    mockFetch.mockImplementation((url) => {
      if (url.includes('/accept')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, channelId: '123' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          channel_name: 'Test Channel',
          inviter_name: 'Test Inviter',
          status: 'pending',
          isExpired: false,
        }),
      })
    })

    render(<InvitePage />)

    await waitFor(() => {
      const joinButton = screen.getByText(/join channel/i)
      fireEvent.click(joinButton)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/channels/123')
    })
  })

  it('shows error when invitation is expired', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        channel_name: 'Test Channel',
        isExpired: true,
      }),
    })

    render(<InvitePage />)

    await waitFor(() => {
      expect(
        screen.getByText(/this invitation has expired/i)
      ).toBeInTheDocument()
    })
  })
})
