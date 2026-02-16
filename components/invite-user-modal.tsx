'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Invitation {
  id: string
  invited_email: string
  token: string
  expires_at: string
}

interface InviteUserModalProps {
  channelId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InviteUserModal({
  channelId,
  open,
  onOpenChange,
}: InviteUserModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([])

  const fetchPendingInvites = async () => {
    try {
      const res = await fetch(`/api/channels/${channelId}/invitations`)
      if (res.ok) {
        const data = await res.json()
        setPendingInvites(data)
      }
    } catch (err) {
      console.error('Failed to fetch invites', err)
    }
  }

  useState(() => {
    if (open) {
      fetchPendingInvites()
    }
  })

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInviteUrl(null)

    try {
      const res = await fetch(`/api/channels/${channelId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create invitation')
      } else {
        setInviteUrl(data.inviteUrl)
        fetchPendingInvites()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to invite user')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (token: string) => {
    try {
      const res = await fetch(`/api/invitations/${token}/revoke`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchPendingInvites()
      }
    } catch (err) {
      console.error('Failed to revoke', err)
    }
  }

  const copyToClipboard = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Channel Invitations</DialogTitle>
          <DialogDescription>
            Invite someone to join this channel by their email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Invite by Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? '...' : 'Invite'}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {inviteUrl && (
            <div className="space-y-2 rounded-md bg-muted p-3">
              <p className="text-xs font-medium">Invitation Link:</p>
              <div className="flex gap-2">
                <Input value={inviteUrl} readOnly className="text-xs" />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold">Pending Invitations</h4>
          {pendingInvites.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No pending invitations
            </p>
          ) : (
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-md border p-2 text-xs"
                >
                  <div>
                    <p className="font-medium">{invite.invited_email}</p>
                    <p className="text-muted-foreground">
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setInviteUrl(
                          `${window.location.origin}/invite/${invite.token}`
                        )
                        setEmail(invite.invited_email)
                      }}
                    >
                      Link
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleRevoke(invite.token)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
