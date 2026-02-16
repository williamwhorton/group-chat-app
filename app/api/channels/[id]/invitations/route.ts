import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createClient(cookies())
  const { id: channelId } = await params

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify channel ownership
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, creator_id')
      .eq('id', channelId)
      .single()

    if (channelError || !channel || channel.creator_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('channel_invitations')
      .select('token, expires_at')
      .eq('channel_id', channelId)
      .eq('invited_email', normalizedEmail)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingInvite) {
      // Check if expired
      if (new Date(existingInvite.expires_at) > new Date()) {
        const inviteUrl = `${req.nextUrl.origin}/invite/${existingInvite.token}`
        return NextResponse.json({
          inviteUrl,
          expiresAt: existingInvite.expires_at,
          message: 'Existing pending invitation found',
        })
      }
      // If expired, we could revoke it or just create a new one.
      // The unique index handles 'pending', so if it's expired but pending,
      // we should probably mark it revoked or update it.
      await supabase
        .from('channel_invitations')
        .update({ status: 'revoked' })
        .eq('token', existingInvite.token)
    }

    // Create new invitation
    const { data: newInvite, error: inviteError } = await supabase
      .from('channel_invitations')
      .insert({
        channel_id: channelId,
        invited_email: normalizedEmail,
        invited_by_user_id: user.id,
        token: crypto.randomBytes(32).toString('hex'),
      })
      .select('token, expires_at')
      .single()

    if (inviteError) throw inviteError

    const inviteUrl = `${req.nextUrl.origin}/invite/${newInvite.token}`

    return NextResponse.json(
      {
        inviteUrl,
        expiresAt: newInvite.expires_at,
        message: 'Invitation created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Invitation creation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createClient(cookies())
  const { id: channelId } = await params

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify channel ownership
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, creator_id')
      .eq('id', channelId)
      .single()

    if (channelError || !channel || channel.creator_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { data: invitations, error: invitationsError } = await supabase
      .from('channel_invitations')
      .select('*')
      .eq('channel_id', channelId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (invitationsError) throw invitationsError

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Fetch invitations error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
