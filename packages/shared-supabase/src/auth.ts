import type { SupabaseClient } from '@supabase/supabase-js'

export async function signIn(
  client: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUp(
  client: SupabaseClient,
  email: string,
  password: string,
  username: string
) {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })
  if (error) throw error
  return data
}

export async function signOut(client: SupabaseClient) {
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(client: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await client.auth.getUser()
  if (error) throw error
  return user
}
