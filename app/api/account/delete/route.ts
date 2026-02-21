import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 1. Delete all messages sent by this user (must happen first while
    //    the user is still a channel_member, since the messages DELETE
    //    RLS policy checks channel membership)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('user_id', user.id)

    if (messagesError) throw messagesError

    // 2. Remove user from all channels
    const { error: leaveError } = await supabase
      .from('channel_members')
      .delete()
      .eq('user_id', user.id)

    if (leaveError) throw leaveError

    // 3. Delete all channels created by this user (remaining messages
    //    from other users cascade-delete with the channel)
    const { error: channelsError } = await supabase
      .from('channels')
      .delete()
      .eq('creator_id', user.id)

    if (channelsError) throw channelsError

    // 4. Delete user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) throw profileError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account', details: error },
      { status: 500 }
    )
  }
}
