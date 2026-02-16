const MockNextRequest = jest
  .fn()
  .mockImplementation((url: string, init?: any) => ({
    url,
    method: init?.method || 'GET',
    nextUrl: new URL(url),
    json: async () => (init?.body ? JSON.parse(init.body) : null),
  }))

jest.mock('next/server', () => ({
  NextRequest: jest
    .fn()
    .mockImplementation(
      (url: string, init?: any) => new MockNextRequest(url, init)
    ),
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => data,
    }),
  },
}))

import { createClient } from '@/lib/supabase/server'
import * as invitationsRoute from '@/app/api/channels/[id]/invitations/route'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('Invitations API', () => {
  let supabaseMock: any
  let fromMock: any

  beforeEach(() => {
    fromMock = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
    }
    supabaseMock = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => fromMock),
      rpc: jest.fn(),
    }
    ;(createClient as jest.Mock).mockReturnValue(supabaseMock)
  })

  describe('POST /api/channels/[id]/invitations', () => {
    it('returns 401 if not authenticated', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })

      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations',
        {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        }
      ) as any

      const response = await invitationsRoute.POST(req, {
        params: Promise.resolve({ id: '123' }),
      })
      expect(response.status).toBe(401)
    })

    it('returns 403 if not owner', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user1' } },
      })
      supabaseMock
        .from()
        .select()
        .eq()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        })

      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations',
        {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        }
      ) as any

      const response = await invitationsRoute.POST(req, {
        params: Promise.resolve({ id: '123' }),
      })
      expect(response.status).toBe(403)
    })

    it('creates a new invitation if owner', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner1' } },
      })
      // Mock channel ownership check
      supabaseMock.from.mockImplementation((table: string) => {
        if (table === 'channels') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: { id: '123', creator_id: 'owner1' } }),
          }
        }
        if (table === 'channel_invitations') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null }), // No existing pending invite
            insert: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { token: 'token123', expires_at: '2026-02-23T00:00:00Z' },
            }),
          }
        }
        return {}
      })

      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations',
        {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        }
      ) as any

      const response = await invitationsRoute.POST(req, {
        params: Promise.resolve({ id: '123' }),
      })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.inviteUrl).toContain('/invite/')
      // We can't easily check for token123 anymore because crypto generates a random one
      // but we can check if it contains /invite/
    })
  })

  describe('GET /api/channels/[id]/invitations', () => {
    it('returns 401 if not authenticated', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })

      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations'
      ) as any

      const response = await invitationsRoute.GET(req, {
        params: Promise.resolve({ id: '123' }),
      })
      expect(response.status).toBe(401)
    })

    it('returns 403 if not owner', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user1' } },
      })
      supabaseMock
        .from()
        .select()
        .eq()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        })

      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations'
      ) as any

      const response = await invitationsRoute.GET(req, {
        params: Promise.resolve({ id: '123' }),
      })
      expect(response.status).toBe(403)
    })

    it('returns invitations if owner', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner1' } },
      })

      const mockInvites = [{ id: '1', invited_email: 'test@example.com' }]

      supabaseMock.from.mockImplementation((table: string) => {
        if (table === 'channels') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: { id: '123', creator_id: 'owner1' } }),
          }
        }
        if (table === 'channel_invitations') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            order: jest
              .fn()
              .mockResolvedValue({ data: mockInvites, error: null }),
          }
        }
        return {}
      })

      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations'
      ) as any

      const response = await invitationsRoute.GET(req, {
        params: Promise.resolve({ id: '123' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockInvites)
    })
  })

  describe('Additional Edge Cases', () => {
    it('POST returns 400 if email is missing', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner1' } },
      })
      supabaseMock.from.mockImplementation((table: string) => {
        if (table === 'channels') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: { id: '123', creator_id: 'owner1' } }),
          }
        }
        return {}
      })
      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      ) as any
      const response = await invitationsRoute.POST(req, {
        params: Promise.resolve({ id: '123' }),
      })
      expect(response.status).toBe(400)
    })

    it('POST returns existing unexpired invitation', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner1' } },
      })
      const expiresAt = new Date(Date.now() + 86400000).toISOString()
      supabaseMock.from.mockImplementation((table: string) => {
        if (table === 'channels') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: { id: '123', creator_id: 'owner1' } }),
          }
        }
        if (table === 'channel_invitations') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { token: 'token123', expires_at: expiresAt },
            }),
          }
        }
        return {}
      })
      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations',
        {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        }
      ) as any
      const response = await invitationsRoute.POST(req, {
        params: Promise.resolve({ id: '123' }),
      })
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.inviteUrl).toContain('token123')
    })

    it('POST revokes expired invitation', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner1' } },
      })
      const expiredAt = new Date(Date.now() - 86400000).toISOString()
      supabaseMock.from.mockImplementation((table: string) => {
        if (table === 'channels') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: { id: '123', creator_id: 'owner1' } }),
          }
        }
        if (table === 'channel_invitations') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { token: 'old-token', expires_at: expiredAt },
            }),
            update: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                token: 'new-token',
                expires_at: '2026-02-23T00:00:00Z',
              },
            }),
          }
        }
        return {}
      })
      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations',
        {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        }
      ) as any
      const response = await invitationsRoute.POST(req, {
        params: Promise.resolve({ id: '123' }),
      })
      expect(response.status).toBe(201)
    })

    it('GET returns 500 on database error', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner1' } },
      })
      supabaseMock.from.mockImplementation(() => {
        throw new Error('DB Error')
      })
      const req = MockNextRequest(
        'http://localhost/api/channels/123/invitations'
      ) as any
      const response = await invitationsRoute.GET(req, {
        params: Promise.resolve({ id: '123' }),
      })
      expect(response.status).toBe(500)
    })
  })
})
