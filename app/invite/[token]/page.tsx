'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Navigation from '@/components/navigation'

interface InvitationDetails {
  id: string
  channel_id: string
  channel_name: string
  invited_email: string
  expires_at: string
  status: string
  inviter_name: string
  isExpired: boolean
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
    fetchInvitation()
  }, [token])

  const fetchInvitation = async () => {
    try {
      const res = await fetch(`/api/invitations/${token}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invitation not found')
      } else {
        setInvitation(data)
      }
    } catch (err) {
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!user) {
      router.push(`/login?returnTo=/invite/${token}`)
      return
    }

    setAccepting(true)
    setError(null)

    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to join channel')
      } else {
        router.push(`/channels/${data.channelId}`)
      }
    } catch (err) {
      setError('An error occurred while joining the channel')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto flex max-w-lg justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-lg px-4 pt-20">
        <Card>
          <CardHeader>
            <CardTitle>Channel Invitation</CardTitle>
            <CardDescription>
              You've been invited to join a channel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            ) : invitation ? (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4 text-center">
                  <h2 className="text-2xl font-bold">
                    {invitation.channel_name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Invited by {invitation.inviter_name}
                  </p>
                </div>

                {invitation.isExpired ? (
                  <p className="text-center text-sm text-destructive">
                    This invitation has expired.
                  </p>
                ) : invitation.status !== 'pending' ? (
                  <p className="text-center text-sm text-amber-600">
                    This invitation has already been {invitation.status}.
                  </p>
                ) : (
                  <p className="text-center text-sm">
                    Click below to join the channel and start chatting.
                  </p>
                )}
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {!error && invitation && (
              <Button
                className="w-full"
                size="lg"
                onClick={handleJoin}
                disabled={
                  accepting ||
                  invitation.isExpired ||
                  invitation.status !== 'pending'
                }
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : !user ? (
                  'Sign in to Join'
                ) : (
                  'Join Channel'
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/channels')}
            >
              Back to Channels
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
