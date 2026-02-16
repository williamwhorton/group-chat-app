import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import CreateChannelModal from '@/components/create-channel-modal'
import { createClient } from '@/lib/supabase/client'

// Mock the Supabase client
jest.mock('@/lib/supabase/client')

describe('CreateChannelModal', () => {
  const mockCreateClient = createClient as jest.MockedFunction<
    typeof createClient
  >
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  it('renders the modal when open prop is true', () => {
    render(
      <CreateChannelModal open={true} onOpenChange={jest.fn()} />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Create a New Channel')).toBeInTheDocument()
  })

  it('does not render the modal when open prop is false', () => {
    const { container } = render(
      <CreateChannelModal open={false} onOpenChange={jest.fn()} />
    )

    // Dialog should not be visible
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).not.toBeVisible()
  })

  it('allows user to enter channel name and description', async () => {
    render(
      <CreateChannelModal open={true} onOpenChange={jest.fn()} />
    )

    const nameInput = screen.getByLabelText(/channel name/i) as HTMLInputElement
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement

    fireEvent.change(nameInput, { target: { value: 'general' } })
    fireEvent.change(descriptionInput, { target: { value: 'General discussion' } })

    expect(nameInput.value).toBe('general')
    expect(descriptionInput.value).toBe('General discussion')
  })

  it('disables submit button while loading', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    const mockInsert = jest
      .fn()
      .mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue(
            new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  data: { id: 'channel-123' },
                  error: null,
                })
              }, 100)
            })
          ),
        }),
      })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    })

    const { rerender } = render(
      <CreateChannelModal open={true} onOpenChange={jest.fn()} />
    )

    const nameInput = screen.getByLabelText(/channel name/i)
    fireEvent.change(nameInput, { target: { value: 'general' } })

    const submitButton = screen.getByRole('button', { name: /create channel/i })
    fireEvent.click(submitButton)

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
    })
  })

  it('closes modal when cancel button is clicked', () => {
    const mockOnOpenChange = jest.fn()
    render(
      <CreateChannelModal
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('displays error message on failed creation', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Channel name already exists' },
          }),
        }),
      }),
    })

    render(
      <CreateChannelModal open={true} onOpenChange={jest.fn()} />
    )

    const nameInput = screen.getByLabelText(/channel name/i)
    fireEvent.change(nameInput, { target: { value: 'general' } })

    const submitButton = screen.getByRole('button', { name: /create channel/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Channel name already exists')).toBeInTheDocument()
    })
  })

  it('calls onChannelCreated callback on successful creation', async () => {
    const mockOnChannelCreated = jest.fn()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'channel-123' },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

    render(
      <CreateChannelModal
        open={true}
        onOpenChange={jest.fn()}
        onChannelCreated={mockOnChannelCreated}
      />
    )

    const nameInput = screen.getByLabelText(/channel name/i)
    fireEvent.change(nameInput, { target: { value: 'general' } })

    const submitButton = screen.getByRole('button', { name: /create channel/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnChannelCreated).toHaveBeenCalled()
    })
  })
})
