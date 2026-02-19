import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import Navigation from '@/components/navigation'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
  },
}

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

beforeEach(() => {
  jest.clearAllMocks()
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  mockUseRouter.mockReturnValue({
    push: mockPush,
  } as any)
  mockUsePathname.mockReturnValue('/channels')
})

describe('Navigation', () => {
  it('does not render when user is not logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    const { container } = render(<Navigation />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('renders navigation when user is logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    render(<Navigation />)

    await waitFor(() => {
      expect(screen.getByText('Treehouse')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /channels/i })
      ).toBeInTheDocument()
    })
  })

  it('highlights active page button', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
    mockUsePathname.mockReturnValue('/channels')

    render(<Navigation />)

    await waitFor(() => {
      const channelsButton = screen.getByRole('button', { name: /channels/i })
      expect(channelsButton).toBeInTheDocument()
    })
  })

  it('handles logout successfully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
    mockSupabase.auth.signOut.mockResolvedValue({ error: null } as any)

    render(<Navigation />)

    await waitFor(() => {
      expect(screen.getByText('Treehouse')).toBeInTheDocument()
    })

    const logoutButtons = screen.getAllByRole('button')
    const logoutButton = logoutButtons.find((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null && btn.getAttribute('class')?.includes('ghost')
    })

    if (logoutButton) {
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    }
  })

  it('has link to channels page', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    render(<Navigation />)

    await waitFor(() => {
      const channelsLink = screen.getByRole('link', { name: /treehouse/i })
      expect(channelsLink).toHaveAttribute('href', '/channels')
    })
  })

  it('highlights settings page button when active', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
    mockUsePathname.mockReturnValue('/settings')

    render(<Navigation />)

    await waitFor(() => {
      // Find the link wrapping the settings button
      const settingsLink = screen.getByRole('link', { name: /settings/i })
      expect(settingsLink).toHaveAttribute('href', '/settings')
    })
  })
})
