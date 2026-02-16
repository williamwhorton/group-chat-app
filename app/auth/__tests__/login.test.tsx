import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import LoginPage from '@/app/auth/login/page'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Mock the modules
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')

describe('Login Page', () => {
  const mockPush = jest.fn()
  const mockCreateClient = createClient as jest.MockedFunction<
    typeof createClient
  >

  const mockSupabase = {
    auth: {
      signInWithPassword: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  it('renders login form with email and password fields', () => {
    render(<LoginPage />)

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /login/i })
    ).toBeInTheDocument()
  })

  it('allows user to enter email and password', () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('displays loading state while logging in', async () => {
    mockSupabase.auth.signInWithPassword.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ error: null })
        }, 100)
      })
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
    })
  })

  it('displays error message on login failure', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: new Error('Invalid credentials'),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('redirects to channels page on successful login', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: null,
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/channels')
    })
  })

  it('displays sign up link', () => {
    render(<LoginPage />)

    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toHaveAttribute('href', '/auth/sign-up')
  })
})
