import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorPage from '@/app/auth/error/page'

describe('ErrorPage', () => {
  it('renders error heading', async () => {
    const searchParams = Promise.resolve({})
    render(await ErrorPage({ searchParams }))

    expect(screen.getByText(/sorry, something went wrong/i)).toBeInTheDocument()
  })

  it('displays error code when provided', async () => {
    const searchParams = Promise.resolve({ error: 'access_denied' })
    render(await ErrorPage({ searchParams }))

    expect(screen.getByText(/code error: access_denied/i)).toBeInTheDocument()
  })

  it('displays generic message when no error code provided', async () => {
    const searchParams = Promise.resolve({})
    render(await ErrorPage({ searchParams }))

    expect(
      screen.getByText(/an unspecified error occurred/i)
    ).toBeInTheDocument()
  })
})
