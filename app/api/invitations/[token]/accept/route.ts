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

    const { data, error } = await supabase.rpc(
      'accept_channel_invitation_by_token',
      {
        p_token: token,
      }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.success) {
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
