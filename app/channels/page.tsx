'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus } from 'lucide-react'
import CreateChannelModal from '@/components/create-channel-modal'
import Navigation from '@/components/navigation'

interface Channel {
  id: string
  name: string
  description?: string
  creator_id: string
  created_at: string
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  const checkAuthAndLoad = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      loadChannels()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/auth/login')
    }
  }

  const loadChannels = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get channels the user is a member of
      const { data, error } = await supabase
        .from('channel_members')
        .select('channels(*)')
        .eq('user_id', user.id)

      if (error) throw error

      const channelsList =
        data?.map((item: any) => item.channels).filter(Boolean) || []
      setChannels(channelsList)
    } catch (error) {
      console.error('Error loading channels:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading channels...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <div className="container px-4 py-8">
        <div className="mb-8 flex w-full items-center justify-between px-0">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Channels</h1>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Join or create a channel to start chatting
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            New Channel
          </Button>
        </div>

        {channels.length === 0 ? (
          <Card className="border-2 py-12 text-center shadow-lg">
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                No channels yet. Create one to get started!
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="shadow-md shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Create Channel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <Link key={channel.id} href={`/channels/${channel.id}`}>
                <Card className="h-full cursor-pointer border-2 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 font-display">
                      {channel.name}
                    </CardTitle>
                    {channel.description && (
                      <CardDescription className="line-clamp-2 leading-relaxed">
                        {channel.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <CreateChannelModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onChannelCreated={() => {
            setShowCreateModal(false)
            loadChannels()
          }}
        />
      </div>
    </div>
  )
}
