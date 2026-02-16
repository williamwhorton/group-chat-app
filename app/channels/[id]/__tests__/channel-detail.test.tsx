import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import ChatPage from '@/app/channels/[id]/page'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')
jest.mock('@/components/navigation', () => {
  return function Navigation() {
    return <div>Navigation</div>
  }
})
jest.mock('@/components/invite-user-modal', () => {
  return function InviteUserModal() {
    return <div>Invite User Modal</div>
  }
})
jest.mock('@/components/delete-channel-modal', () => {
  return function DeleteChannelModal() {
    return <div>Delete Channel Modal</div>
  }
})

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
  from: jest.fn(),
  channel: jest.fn(),
  removeChannel: jest.fn(),
}

describe('ChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ id: 'channel-123' })
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  it('shows loading state initially', () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    } as any)

    const mockChannelSubscription = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockReturnThis(),
    } as any)

    render(<ChatPage />)

    expect(screen.getByText(/loading chat/i)).toBeInTheDocument()
  })

  it('displays channel not found message when channel does not exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    } as any)

    const mockChannelSubscription = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        } as any
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      } as any
    })

    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText(/channel not found/i)).toBeInTheDocument()
    })
  })

  it('renders channel details and messages', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    } as any)

    const mockChannelSubscription = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    const mockChannel = {
      id: 'channel-123',
      name: 'General',
      description: 'General discussion',
      creator_id: 'user-123',
    }

    const mockMessages = [
      {
        id: 'msg-1',
        content: 'Hello world',
        user_id: 'user-456',
        created_at: new Date().toISOString(),
        profiles: { username: 'testuser' },
      },
    ]

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChannel, error: null }),
        } as any
      }
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest
            .fn()
            .mockResolvedValue({ data: mockMessages, error: null }),
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        } as any
      }
      return {} as any
    })

    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('General discussion')).toBeInTheDocument()
      expect(screen.getByText('Hello world')).toBeInTheDocument()
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })

  it('shows empty message when no messages exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    } as any)

    const mockChannelSubscription = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    const mockChannel = {
      id: 'channel-123',
      name: 'General',
      creator_id: 'user-123',
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChannel, error: null }),
        } as any
      }
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        } as any
      }
      return {} as any
    })

    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
    })
  })

  it('allows user to send a message', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    } as any)

    const mockChannelSubscription = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    const mockChannel = {
      id: 'channel-123',
      name: 'General',
      creator_id: 'user-123',
    }

    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChannel, error: null }),
        } as any
      }
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: mockInsert,
        } as any
      }
      return {} as any
    })

    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/type a message/i)
    const sendButton = screen.getByRole('button', { name: '' })

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        channel_id: 'channel-123',
        user_id: 'user-123',
        content: 'Test message',
      })
    })
  })

  it('shows invite button for all users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-456' } },
    } as any)

    const mockChannelSubscription = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    const mockChannel = {
      id: 'channel-123',
      name: 'General',
      creator_id: 'user-123',
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChannel, error: null }),
        } as any
      }
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        } as any
      }
      return {} as any
    })

    render(<ChatPage />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /invite/i })
      ).toBeInTheDocument()
    })
  })

  it('shows delete button only for channel creator', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    } as any)

    const mockChannelSubscription = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    const mockChannel = {
      id: 'channel-123',
      name: 'General',
      creator_id: 'user-123',
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChannel, error: null }),
        } as any
      }
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        } as any
      }
      return {} as any
    })

    render(<ChatPage />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
    })
  })

  it('handles message send error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    } as any)

    const mockChannelSubscription = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    const mockChannel = {
      id: 'channel-123',
      name: 'General',
      creator_id: 'user-123',
    }

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChannel, error: null }),
        } as any
      }
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: jest
            .fn()
            .mockResolvedValue({ error: { message: 'Insert failed' } }),
        } as any
      }
      return {} as any
    })

    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/type a message/i)
    const sendButton = screen.getByRole('button', { name: '' })

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    consoleSpy.mockRestore()
  })

  it('handles channel subscription and new messages', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    } as any)

    let subscriptionCallback: any
    const mockChannelSubscription = {
      on: jest.fn().mockImplementation((event, filter, callback) => {
        subscriptionCallback = callback
        return mockChannelSubscription
      }),
      subscribe: jest.fn(),
    }
    mockSupabase.channel.mockReturnValue(mockChannelSubscription as any)

    const mockChannel = {
      id: 'channel-123',
      name: 'General',
      creator_id: 'user-123',
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChannel, error: null }),
        } as any
      }
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'msg-2',
              content: 'New message',
              profiles: { username: 'newuser' },
            },
            error: null,
          }),
        } as any
      }
      return {} as any
    })

    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument()
    })

    // Simulate real-time message
    await waitFor(() => {
      expect(subscriptionCallback).toBeDefined()
    })

    await waitFor(async () => {
      await subscriptionCallback({
        eventType: 'INSERT',
        new: { id: 'msg-2' },
      })
    })

    await waitFor(() => {
      expect(screen.getByText('New message')).toBeInTheDocument()
      expect(screen.getByText('newuser')).toBeInTheDocument()
    })
  })
})
