import '@testing-library/jest-dom'

// Global stub for Supabase browser client to stabilize tests that involve realtime subscriptions
jest.mock('@/lib/supabase/client', () => {
  const channelStub = () => ({
    on: () => channelStub(),
    subscribe: () => ({ unsubscribe: jest.fn() }),
  })
  const client = {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
    channel: jest.fn(channelStub),
    removeChannel: jest.fn(),
  }
  return { createClient: jest.fn(() => client) }
})
