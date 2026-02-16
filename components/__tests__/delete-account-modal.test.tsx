import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import DeleteAccountModal from '@/components/delete-account-modal'
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
  global.fetch = jest.fn()
  global.alert = jest.fn()
})

describe('DeleteAccountModal', () => {
  it('renders modal when open', () => {
    render(<DeleteAccountModal open={true} onOpenChange={jest.fn()} />)

    expect(screen.getByText('Delete Account?')).toBeInTheDocument()
    expect(
      screen.getByText(/this action cannot be undone/i)
    ).toBeInTheDocument()
  })

  it('does not render modal when closed', () => {
    render(<DeleteAccountModal open={false} onOpenChange={jest.fn()} />)

    expect(screen.queryByText('Delete Account?')).not.toBeInTheDocument()
  })

  it('requires DELETE confirmation text', async () => {
    render(<DeleteAccountModal open={true} onOpenChange={jest.fn()} />)

    const confirmInput = screen.getByLabelText(/type delete to confirm/i)
    expect(confirmInput).toBeInTheDocument()

    const deleteButton = screen.getByRole('button', { name: /delete account/i })
    expect(deleteButton).toBeDisabled()

    fireEvent.change(confirmInput, { target: { value: 'DELETE' } })

    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled()
    })
  })

  it('shows alert if confirmation does not match', async () => {
    render(<DeleteAccountModal open={true} onOpenChange={jest.fn()} />)

    const confirmInput = screen.getByLabelText(/type delete to confirm/i)
    fireEvent.change(confirmInput, { target: { value: 'WRONG' } })

    const deleteButton = screen.getByRole('button', { name: /delete account/i })
    expect(deleteButton).toBeDisabled()
  })

  it('successfully deletes account', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockSupabase.auth.signOut.mockResolvedValue({ error: null } as any)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    })

    const onOpenChange = jest.fn()
    render(<DeleteAccountModal open={true} onOpenChange={onOpenChange} />)

    const confirmInput = screen.getByLabelText(/type delete to confirm/i)
    fireEvent.change(confirmInput, { target: { value: 'DELETE' } })

    const deleteButton = screen.getByRole('button', { name: /delete account/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/account/delete', {
        method: 'POST',
      })
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('handles delete error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    })

    render(<DeleteAccountModal open={true} onOpenChange={jest.fn()} />)

    const confirmInput = screen.getByLabelText(/type delete to confirm/i)
    fireEvent.change(confirmInput, { target: { value: 'DELETE' } })

    const deleteButton = screen.getByRole('button', { name: /delete account/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to delete account')
    })
  })

  it('displays loading state during deletion', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    )

    render(<DeleteAccountModal open={true} onOpenChange={jest.fn()} />)

    const confirmInput = screen.getByLabelText(/type delete to confirm/i)
    fireEvent.change(confirmInput, { target: { value: 'DELETE' } })

    const deleteButton = screen.getByRole('button', { name: /delete account/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
    })
  })
})
