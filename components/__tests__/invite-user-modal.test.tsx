import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import InviteUserModal from '@/components/invite-user-modal'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('InviteUserModal', () => {
  const channelId = 'channel-123'

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockImplementation((url) => {
      if (
        typeof url === 'string' &&
        url.includes('/invitations') &&
        !url.includes('revoke')
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    })
  })

  it('does not render when open is false', () => {
    render(
      <InviteUserModal
        channelId={channelId}
        open={false}
        onOpenChange={jest.fn()}
      />
    )

    expect(screen.queryByText(/channel invitations/i)).not.toBeInTheDocument()
  })

  it('renders modal when open is true', async () => {
    render(
      <InviteUserModal
        channelId={channelId}
        open={true}
        onOpenChange={jest.fn()}
      />
    )

    expect(screen.getByText(/channel invitations/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/invite by email/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/channels/${channelId}/invitations`
      )
    })
  })

  it('allows user to input email', () => {
    render(
      <InviteUserModal
        channelId={channelId}
        open={true}
        onOpenChange={jest.fn()}
      />
    )

    const emailInput = screen.getByLabelText(/invite by email/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('creates an invitation on submit', async () => {
    mockFetch.mockImplementation((url, init) => {
      if (
        typeof url === 'string' &&
        init?.method === 'POST' &&
        url.includes('/invitations')
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ inviteUrl: 'http://localhost/invite/token123' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      })
    })

    render(
      <InviteUserModal
        channelId={channelId}
        open={true}
        onOpenChange={jest.fn()}
      />
    )

    const emailInput = screen.getByLabelText(/invite by email/i)
    const inviteButton = screen.getByRole('button', { name: /invite/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(inviteButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/channels/${channelId}/invitations`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      )
      expect(
        screen.getByDisplayValue('http://localhost/invite/token123')
      ).toBeInTheDocument()
    })
  })

  it('shows pending invitations', async () => {
    const mockInvites = [
      {
        id: '1',
        invited_email: 'pending@example.com',
        token: 'token1',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockInvites,
    })

    render(
      <InviteUserModal
        channelId={channelId}
        open={true}
        onOpenChange={jest.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('pending@example.com')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /revoke/i })
      ).toBeInTheDocument()
    })
  })

  it('revokes an invitation', async () => {
    const mockInvites = [
      {
        id: '1',
        invited_email: 'pending@example.com',
        token: 'token1',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
    ]

    mockFetch.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('token1/revoke')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockInvites,
      })
    })

    render(
      <InviteUserModal
        channelId={channelId}
        open={true}
        onOpenChange={jest.fn()}
      />
    )

    await waitFor(() => {
      const revokeButton = screen.getByRole('button', { name: /revoke/i })
      fireEvent.click(revokeButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/invitations/token1/revoke',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })
})
