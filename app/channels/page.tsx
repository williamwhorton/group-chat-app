'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const supabase = createClient()

  useEffect(() => {
    loadChannels()
  }, [])

  const loadChannels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get channels the user is a member of
      const { data, error } = await supabase
        .from('channel_members')
        .select('channels(*)')
        .eq('user_id', user.id)

      if (error) throw error

      const channelsList = data?.map((item: any) => item.channels).filter(Boolean) || []
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
            <p className="text-muted-foreground mt-2">Join or create a channel to start chatting</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Channel
          </Button>
        </div>

        {channels.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No channels yet. Create one to get started!</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Channel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <Link key={channel.id} href={`/channels/${channel.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{channel.name}</CardTitle>
                    {channel.description && (
                      <CardDescription className="line-clamp-2">{channel.description}</CardDescription>
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
