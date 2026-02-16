/**
 * @jest-environment node
 */
import { POST } from '../route'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

jest.mock('@/lib/supabase/server')
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      data,
      ...init,
      status: init?.status || 200,
    })),
  },
}))

describe('DELETE account API route', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('returns 401 if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    const response = await POST()

    expect(response.status).toBe(401)
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  })

  it('successfully deletes account and associated data', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

    const mockChannels = [{ id: 'channel-1' }, { id: 'channel-2' }]

    // Mock for channels selection
    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: mockChannels, error: null }),
    }

    // Mock for deletes
    const mockDelete = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    }

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'channels') {
        // First call is select, second (if any) is delete
        if (
          mockSupabase.from.mock.calls.filter((c) => c[0] === 'channels')
            .length === 1
        ) {
          return mockSelect
        }
        return mockDelete
      }
      return mockDelete
    })

    const response = await POST()

    expect(response.status).toBe(200)
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true })
    expect(mockSupabase.from).toHaveBeenCalledWith('channels')
    expect(mockSupabase.from).toHaveBeenCalledWith('channel_members')
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  })

  it('successfully deletes account when user has no channels', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
    }))

    const response = await POST()

    expect(response.status).toBe(200)
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true })
  })

  it('returns 500 if channels error occurs', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'channels') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Channels error' },
          }),
        }
      }
      return {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }
    })

    const response = await POST()

    expect(response.status).toBe(500)
  })

  it('returns 500 if delete channel error occurs', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'channels') {
        // First call is select
        if (
          mockSupabase.from.mock.calls.filter((c) => c[0] === 'channels')
            .length === 1
        ) {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest
              .fn()
              .mockResolvedValue({ data: [{ id: '1' }], error: null }),
          }
        }
        // Second call is delete
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest
            .fn()
            .mockResolvedValue({ error: { message: 'Delete channel error' } }),
        }
      }
      return {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }
    })

    const response = await POST()

    expect(response.status).toBe(500)
  })

  it('returns 500 if leave channel error occurs', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'channel_members') {
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest
            .fn()
            .mockResolvedValue({ error: { message: 'Leave error' } }),
        }
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
    })

    const response = await POST()

    expect(response.status).toBe(500)
  })

  it('returns 500 if profile error occurs', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest
            .fn()
            .mockResolvedValue({ error: { message: 'Profile error' } }),
        }
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
    })

    const response = await POST()

    expect(response.status).toBe(500)
  })

  it('returns 500 if an error occurs during deletion', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

    const error = new Error('Database error')
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockRejectedValue(error),
    }))

    const response = await POST()

    expect(response.status).toBe(500)
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to delete account', details: error },
      { status: 500 }
    )
  })
})
