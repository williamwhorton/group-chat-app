import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import SignUpPage from '@/app/auth/sign-up/page'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

const mockSupabase = {
  auth: {
    signUp: jest.fn(),
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
  delete (window as any).location
  ;(window as any).location = { origin: 'http://localhost:3000' }
})

describe('SignUpPage', () => {
  it('renders sign up form with all fields', () => {
    render(<SignUpPage />)

    expect(screen.getAllByText(/sign up/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/repeat password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('allows user to enter credentials', () => {
    render(<SignUpPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const usernameInput = screen.getByLabelText(/^username$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const repeatPasswordInput = screen.getByLabelText(/repeat password/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(repeatPasswordInput, { target: { value: 'password123' } })

    expect(emailInput).toHaveValue('test@example.com')
    expect(usernameInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('password123')
    expect(repeatPasswordInput).toHaveValue('password123')
  })

  it('shows error when passwords do not match', async () => {
    render(<SignUpPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const usernameInput = screen.getByLabelText(/^username$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const repeatPasswordInput = screen.getByLabelText(/repeat password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(repeatPasswordInput, {
      target: { value: 'differentpassword' },
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('successfully signs up user with matching passwords', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-123' }, session: {} },
      error: null,
    } as any)

    render(<SignUpPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const usernameInput = screen.getByLabelText(/^username$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const repeatPasswordInput = screen.getByLabelText(/repeat password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(repeatPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: expect.objectContaining({
          data: { username: 'testuser' },
        }),
      })
      expect(mockPush).toHaveBeenCalledWith('/auth/sign-up-success')
    })
  })

  it('displays error message on sign up failure', async () => {
    const error = new Error('Email already registered')
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error,
    } as any)

    render(<SignUpPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const usernameInput = screen.getByLabelText(/^username$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const repeatPasswordInput = screen.getByLabelText(/repeat password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(repeatPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
    })
  })

  it('displays loading state while signing up', async () => {
    mockSupabase.auth.signUp.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { user: { id: 'user-123' }, session: {} },
            error: null,
          } as any)
        }, 100)
      })
    })

    render(<SignUpPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const usernameInput = screen.getByLabelText(/^username$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const repeatPasswordInput = screen.getByLabelText(/repeat password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(repeatPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /creating an account/i })
      ).toBeDisabled()
    })
  })

  it('has link to login page', () => {
    render(<SignUpPage />)

    const loginLink = screen.getByRole('link', { name: /login/i })
    expect(loginLink).toHaveAttribute('href', '/auth/login')
  })
})
