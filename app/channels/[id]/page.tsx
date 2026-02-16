'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Users, Trash2, ArrowLeft } from 'lucide-react'
import InviteUserModal from '@/components/invite-user-modal'
import DeleteChannelModal from '@/components/delete-channel-modal'
import Navigation from '@/components/navigation'

interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  profiles?: {
    username: string
  }
}

interface Channel {
  id: string
  name: string
  description?: string
  creator_id: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const channelId = params.id as string

  const [channel, setChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadChannel()
    loadMessages()
    subscribeToMessages()
    getCurrentUser()
  }, [channelId])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const loadChannel = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single()

      if (error) throw error
      setChannel(data)
    } catch (error) {
      console.error('Error loading channel:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(username)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`channel:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newMessage } = await supabase
              .from('messages')
              .select('*, profiles(username)')
              .eq('id', payload.new.id)
              .single()

            if (newMessage) {
              setMessages((prev) => [...prev, newMessage])
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !currentUser) return

    try {
      const { error } = await supabase.from('messages').insert({
        channel_id: channelId,
        user_id: currentUser.id,
        content: messageInput,
      })

      if (error) throw error
      setMessageInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading chat...</p>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Channel not found</p>
      </div>
    )
  }

  const isChannelCreator = currentUser?.id === channel.creator_id

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navigation />
      {/* Header */}
      <div className="sticky top-16 z-10 border-b bg-white p-4">
        <div className="container flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{channel.name}</h1>
            {channel.description && (
              <p className="text-sm text-muted-foreground">
                {channel.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
            >
              <Users className="mr-2 h-4 w-4" />
              Invite
            </Button>
            {isChannelCreator && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">
                      {message.profiles?.username || 'Unknown user'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="container">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              disabled={!currentUser}
            />
            <Button
              type="submit"
              disabled={!messageInput.trim() || !currentUser}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <InviteUserModal
        channelId={channelId}
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
      />

      <DeleteChannelModal
        channelId={channelId}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onDeleted={() => router.push('/channels')}
      />
    </div>
  )
}
