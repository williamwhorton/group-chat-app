import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import SettingsPage from '@/app/settings/page'
import { useRouter } from 'next/navigation'
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

beforeEach(() => {
  jest.clearAllMocks()
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  mockUseRouter.mockReturnValue({
    push: mockPush,
  } as any)
})

describe('SettingsPage', () => {
  it('redirects to login if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    render(<SettingsPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('displays loading state initially', () => {
    mockSupabase.auth.getUser.mockImplementation(() => new Promise(() => {}))

    render(<SettingsPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders settings page for authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('Account')).toBeInTheDocument()
    })
  })

  it('displays user email', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
    })

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
    })
  })

  it('handles logout successfully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
    mockSupabase.auth.signOut.mockResolvedValue({ error: null } as any)

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('shows danger zone section', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Danger Zone')).toBeInTheDocument()
      expect(screen.getAllByText('Delete Account').length).toBeGreaterThan(0)
    })
  })

  it('opens delete account modal when button clicked', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /delete account/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Delete Account?')).toBeInTheDocument()
    })
  })
})
