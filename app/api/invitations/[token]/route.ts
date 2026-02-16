import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = createClient(cookies())
  const { token } = await params

  try {
    const { data, error } = await supabase.rpc(
      'get_channel_invitation_by_token',
      {
        p_token: token,
      }
    )

    if (error) {
      console.error('Fetch invitation error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const invitation = data[0]
    const isExpired = new Date(invitation.expires_at) < new Date()

    return NextResponse.json({
      ...invitation,
      isExpired,
    })
  } catch (error) {
    console.error('Fetch invitation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
