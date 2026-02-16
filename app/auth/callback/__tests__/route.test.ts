/**
 * @jest-environment node
 */
import { GET } from '../route'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

jest.mock('@/lib/supabase/server')
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url) => ({
      url,
      status: 307,
    })),
  },
}))

describe('Auth Callback API route', () => {
  const mockSupabase = {
    auth: {
      exchangeCodeForSession: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('redirects to next param when code is valid', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-code&next=/settings'
    )
    request.headers.set('origin', 'http://localhost:3000')

    const response = await GET(request)

    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      'test-code'
    )
    expect(response.url).toBe('http://localhost:3000/settings')
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/settings'
    )
  })

  it('redirects to /channels by default when code is valid', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-code'
    )
    request.headers.set('origin', 'http://localhost:3000')

    const response = await GET(request)

    expect(response.url).toBe('http://localhost:3000/channels')
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/channels'
    )
  })

  it('redirects to error page when code is missing', async () => {
    const request = new Request('http://localhost:3000/auth/callback')
    request.headers.set('origin', 'http://localhost:3000')

    const response = await GET(request)

    expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled()
    expect(response.url).toBe('http://localhost:3000/auth/auth-code-error')
  })

  it('redirects to error page when exchange fails', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
      error: { message: 'Invalid code' },
    })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=invalid-code'
    )
    request.headers.set('origin', 'http://localhost:3000')

    const response = await GET(request)

    expect(response.url).toBe('http://localhost:3000/auth/auth-code-error')
  })
})
