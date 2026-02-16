import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import ChannelsPage from '@/app/channels/page'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Mock the modules
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')
jest.mock('@/components/navigation', () => {
  return function MockNavigation() {
    return <div data-testid="navigation">Navigation</div>
  }
})

describe('Channels Page', () => {
  const mockPush = jest.fn()
  const mockCreateClient = createClient as jest.MockedFunction<
    typeof createClient
  >

  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  it('redirects to login if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    render(<ChannelsPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('displays loading state initially', () => {
    mockSupabase.auth.getUser.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<ChannelsPage />)

    expect(screen.getByText(/loading channels/i)).toBeInTheDocument()
  })

  it('displays channels after loading', async () => {
    const mockChannels = [
      {
        id: 'channel-1',
        name: 'general',
        description: 'General discussion',
        creator_id: 'user-123',
        created_at: '2024-01-01',
      },
      {
        id: 'channel-2',
        name: 'random',
        description: 'Random topics',
        creator_id: 'user-123',
        created_at: '2024-01-02',
      },
    ]

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest
          .fn()
          .mockResolvedValue({
            data: mockChannels.map((c) => ({ channels: c })),
            error: null,
          }),
      }),
    })

    render(<ChannelsPage />)

    await waitFor(() => {
      expect(screen.getByText('general')).toBeInTheDocument()
      expect(screen.getByText('random')).toBeInTheDocument()
    })
  })

  it('displays empty state when no channels exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    })

    render(<ChannelsPage />)

    await waitFor(() => {
      expect(screen.getByText(/no channels yet/i)).toBeInTheDocument()
    })
  })

  it('opens create channel modal when button is clicked', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    })

    render(<ChannelsPage />)

    await waitFor(() => {
      expect(screen.getByText(/no channels yet/i)).toBeInTheDocument()
    })

    const createButton = screen.getAllByRole('button', {
      name: /create channel|new channel/i,
    })[0]
    fireEvent.click(createButton)

    // Modal should be visible (Dialog component renders)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('displays page title and heading', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    })

    render(<ChannelsPage />)

    await waitFor(() => {
      expect(screen.getByText('Channels')).toBeInTheDocument()
      expect(
        screen.getByText(/join or create a channel to start chatting/i)
      ).toBeInTheDocument()
    })
  })

  it('displays channels as list items', async () => {
    const mockChannels = [
      {
        id: 'channel-1',
        name: 'general',
        description: 'General discussion',
        creator_id: 'user-123',
        created_at: '2024-01-01',
      },
    ]

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest
          .fn()
          .mockResolvedValue({
            data: mockChannels.map((c) => ({ channels: c })),
            error: null,
          }),
      }),
    })

    render(<ChannelsPage />)

    await waitFor(() => {
      const channelLink = screen.getByRole('link', { name: /general/i })
      expect(channelLink).toHaveAttribute('href', '/channels/channel-1')
    })
  })
})
