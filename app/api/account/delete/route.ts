import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get all channels created by this user
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('id')
      .eq('creator_id', user.id)

    if (channelsError) throw channelsError

    // Delete all channels (messages will cascade delete)
    if (channels && channels.length > 0) {
      const { error: deleteError } = await supabase
        .from('channels')
        .delete()
        .eq('creator_id', user.id)

      if (deleteError) throw deleteError
    }

    // Remove user from all channels
    const { error: leaveError } = await supabase
      .from('channel_members')
      .delete()
      .eq('user_id', user.id)

    if (leaveError) throw leaveError

    // Delete user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) throw profileError

    // Delete auth user (this requires admin access via service role)
    // For now, we'll just let the cascade delete from auth.users handle it
    // In production, you'd use supabase-admin or a backend function

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account', details: error },
      { status: 500 }
    )
  }
}
