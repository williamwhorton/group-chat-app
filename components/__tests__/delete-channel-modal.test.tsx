import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import DeleteChannelModal from '@/components/delete-channel-modal'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

const mockSupabase = {
  from: jest.fn(),
}

describe('DeleteChannelModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  it('does not render when open is false', () => {
    render(
      <DeleteChannelModal
        channelId="channel-123"
        open={false}
        onOpenChange={jest.fn()}
      />
    )

    expect(screen.queryByText(/delete channel/i)).not.toBeInTheDocument()
  })

  it('renders modal when open is true', () => {
    render(
      <DeleteChannelModal
        channelId="channel-123"
        open={true}
        onOpenChange={jest.fn()}
      />
    )

    expect(screen.getByText(/delete channel/i)).toBeInTheDocument()
    expect(
      screen.getByText(/this action cannot be undone/i)
    ).toBeInTheDocument()
  })

  it('calls onOpenChange when cancel is clicked', () => {
    const onOpenChange = jest.fn()

    render(
      <DeleteChannelModal
        channelId="channel-123"
        open={true}
        onOpenChange={onOpenChange}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('deletes channel successfully', async () => {
    const mockDelete = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null })

    mockSupabase.from.mockReturnValue({
      delete: mockDelete,
    } as any)

    mockDelete.mockReturnValue({
      eq: mockEq,
    })

    const onDeleted = jest.fn()
    const onOpenChange = jest.fn()

    render(
      <DeleteChannelModal
        channelId="channel-123"
        open={true}
        onOpenChange={onOpenChange}
        onDeleted={onDeleted}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /^delete$/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('channels')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'channel-123')
      expect(onDeleted).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows loading state while deleting', async () => {
    const mockDelete = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ data: null, error: null }), 100)
      })
    })

    mockSupabase.from.mockReturnValue({
      delete: mockDelete,
    } as any)

    mockDelete.mockReturnValue({
      eq: mockEq,
    })

    render(
      <DeleteChannelModal
        channelId="channel-123"
        open={true}
        onOpenChange={jest.fn()}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /^delete$/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText(/deleting/i)).toBeInTheDocument()
    })
  })

  it('handles deletion error', async () => {
    const mockDelete = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Failed to delete' },
    })

    mockSupabase.from.mockReturnValue({
      delete: mockDelete,
    } as any)

    mockDelete.mockReturnValue({
      eq: mockEq,
    })

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <DeleteChannelModal
        channelId="channel-123"
        open={true}
        onOpenChange={jest.fn()}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /^delete$/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to delete channel')
    })

    alertMock.mockRestore()
  })
})
