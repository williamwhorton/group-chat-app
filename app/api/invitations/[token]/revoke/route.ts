import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = createClient(cookies())
  const { token } = await params

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if the user is the owner of the channel for this invitation
    // RLS policy "Channel owners can manage invitations" allows updating
    // We can directly try to update and see if it succeeds
    const { data, error } = await supabase
      .from('channel_invitations')
      .update({ status: 'revoked' })
      .eq('token', token)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Invitation not found or not authorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, message: 'Invitation revoked' })
  } catch (error) {
    console.error('Revoke invitation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
