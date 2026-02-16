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
import * as getInviteRoute from '@/app/api/invitations/[token]/route'
import * as acceptInviteRoute from '@/app/api/invitations/[token]/accept/route'
import * as revokeInviteRoute from '@/app/api/invitations/[token]/revoke/route'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('Invitation Token APIs', () => {
  let supabaseMock: any
  let fromMock: any

  beforeEach(() => {
    fromMock = {
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
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

  describe('GET /api/invitations/[token]', () => {
    it('returns invitation details', async () => {
      const mockData = [
        { channel_name: 'Test Channel', expires_at: '2026-02-23T00:00:00Z' },
      ]
      supabaseMock.rpc.mockResolvedValue({ data: mockData, error: null })

      const req = MockNextRequest(
        'http://localhost/api/invitations/token123'
      ) as any
      const response = await getInviteRoute.GET(req, {
        params: Promise.resolve({ token: 'token123' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.channel_name).toBe('Test Channel')
      expect(data.isExpired).toBe(false)
    })

    it('returns 404 if not found', async () => {
      supabaseMock.rpc.mockResolvedValue({ data: [], error: null })

      const req = MockNextRequest(
        'http://localhost/api/invitations/wrong-token'
      ) as any
      const response = await getInviteRoute.GET(req, {
        params: Promise.resolve({ token: 'wrong-token' }),
      })

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/invitations/[token]/accept', () => {
    it('returns 401 if not authenticated', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })

      const req = MockNextRequest(
        'http://localhost/api/invitations/token123/accept',
        { method: 'POST' }
      ) as any
      const response = await acceptInviteRoute.POST(req, {
        params: Promise.resolve({ token: 'token123' }),
      })

      expect(response.status).toBe(401)
    })

    it('accepts invitation successfully', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user1' } },
      })
      supabaseMock.rpc.mockResolvedValue({
        data: { success: true, channelId: '123' },
        error: null,
      })

      const req = MockNextRequest(
        'http://localhost/api/invitations/token123/accept',
        { method: 'POST' }
      ) as any
      const response = await acceptInviteRoute.POST(req, {
        params: Promise.resolve({ token: 'token123' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('POST /api/invitations/[token]/revoke', () => {
    it('revokes invitation successfully', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner1' } },
      })
      fromMock.select.mockResolvedValue({ data: [{ id: '1' }], error: null })

      const req = MockNextRequest(
        'http://localhost/api/invitations/token123/revoke',
        { method: 'POST' }
      ) as any
      const response = await revokeInviteRoute.POST(req, {
        params: Promise.resolve({ token: 'token123' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Additional Edge Cases', () => {
    it('GET returns 500 on database error', async () => {
      supabaseMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'DB Error' },
      })

      const req = MockNextRequest(
        'http://localhost/api/invitations/token123'
      ) as any
      const response = await getInviteRoute.GET(req, {
        params: Promise.resolve({ token: 'token123' }),
      })

      expect(response.status).toBe(500)
    })

    it('Accept returns 400 on error', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user1' } },
      })
      supabaseMock.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC Error' },
      })

      const req = MockNextRequest(
        'http://localhost/api/invitations/token123/accept',
        { method: 'POST' }
      ) as any
      const response = await acceptInviteRoute.POST(req, {
        params: Promise.resolve({ token: 'token123' }),
      })

      expect(response.status).toBe(400)
    })

    it('Accept returns 400 when success is false', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user1' } },
      })
      supabaseMock.rpc.mockResolvedValue({
        data: { success: false, message: 'Invalid' },
        error: null,
      })

      const req = MockNextRequest(
        'http://localhost/api/invitations/token123/accept',
        { method: 'POST' }
      ) as any
      const response = await acceptInviteRoute.POST(req, {
        params: Promise.resolve({ token: 'token123' }),
      })

      expect(response.status).toBe(400)
    })

    it('Revoke returns 403 if not found or unauthorized', async () => {
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user1' } },
      })
      supabaseMock
        .from()
        .update()
        .eq()
        .select.mockResolvedValue({ data: [], error: null })

      const req = MockNextRequest(
        'http://localhost/api/invitations/token123/revoke',
        { method: 'POST' }
      ) as any
      const response = await revokeInviteRoute.POST(req, {
        params: Promise.resolve({ token: 'token123' }),
      })

      expect(response.status).toBe(403)
    })
  })
})
