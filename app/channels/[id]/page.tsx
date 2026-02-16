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
    const init = async () => {
      const user = await getCurrentUser()
      await loadChannel()
      if (user) {
        const hasAccess = await checkUserAccess(user.id)
        if (!hasAccess) {
          router.push('/channels')
          return
        }
      }
      await loadMessages()
    }
    init()
  }, [channelId])

  useEffect(() => {
    const unsubscribe = subscribeToMessages()
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [channelId])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
    return user
  }

  const checkUserAccess = async (userId: string) => {
    try {
      // Check if user is the creator
      const { data: channel, error } = await supabase
        .from('channels')
        .select('creator_id')
        .eq('id', channelId)
        .single()

      if (error || !channel) {
        // If channel doesn't exist, we let loadChannel handle it (not found)
        return true
      }

      if (channel.creator_id === userId) {
        return true
      }

      // Check if user is a member
      const { data: membership } = await supabase
        .from('channel_members')
        .select('*')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .single()

      return !!membership
    } catch (error) {
      console.error('Error checking user access:', error)
      return false
    }
  }

  const loadChannel = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single()

      if (error) {
        setLoading(false)
        return
      }
      setChannel(data)
    } catch (error) {
      console.error('Error loading channel:', error)
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      if (!messagesData || messagesData.length === 0) {
        setMessages([])
        return
      }

      // Get unique user IDs from messages
      const userIds = [...new Set(messagesData.map(msg => msg.user_id))]

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)

      if (profilesError) throw profilesError

      // Create a map of user_id to profile
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      )

      // Combine messages with profiles
      const messagesWithProfiles = messagesData.map(msg => ({
        ...msg,
        profiles: profilesMap.get(msg.user_id) 
          ? { username: profilesMap.get(msg.user_id)!.username }
          : undefined
      }))

      setMessages(messagesWithProfiles)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    console.log('[v0] Setting up subscription for channel:', channelId)
    
    // Set up realtime subscription
    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          console.log('[v0] Received INSERT event:', payload)
          const newMessage = payload.new as Message

          if (newMessage) {
            // Fetch the profile for the message author
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', newMessage.user_id)
              .single()

            const messageWithProfile: Message = {
              ...newMessage,
              profiles: profile ? { username: profile.username } : undefined
            }

            console.log('[v0] Adding message to state:', messageWithProfile)
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some(m => m.id === messageWithProfile.id)) {
                console.log('[v0] Message already exists, skipping')
                return prev
              }
              return [...prev, messageWithProfile]
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('[v0] Subscription status changed to:', status)
      })

    // Fallback: Poll for new messages every 3 seconds as a safety net
    const pollInterval = setInterval(async () => {
      console.log('[v0] Polling for messages...')
      const lastMessage = messages[messages.length - 1]
      const lastCreatedAt = lastMessage?.created_at || new Date(0).toISOString()

      const { data: newMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .gt('created_at', lastCreatedAt)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[v0] Error polling messages:', error)
        return
      }

      if (newMessages && newMessages.length > 0) {
        console.log('[v0] Polling found new messages:', newMessages)

        // Fetch profiles for new messages
        const userIds = [...new Set(newMessages.map(msg => msg.user_id))]
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds)

        const profilesMap = new Map(
          (profilesData || []).map(profile => [profile.id, profile])
        )

        const messagesWithProfiles = newMessages.map(msg => ({
          ...msg,
          profiles: profilesMap.get(msg.user_id)
            ? { username: profilesMap.get(msg.user_id)!.username }
            : undefined
        }))

        setMessages((prev) => {
          const combined = [...prev, ...messagesWithProfiles]
          // Remove duplicates based on id
          const unique = Array.from(
            new Map(combined.map(m => [m.id, m])).values()
          )
          return unique
        })
      }
    }, 3000)

    return () => {
      console.log('[v0] Cleaning up subscription and poll for channel:', channelId)
      supabase.removeChannel(subscription)
      clearInterval(pollInterval)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !currentUser) return

    console.log('[v0] Sending message:', messageInput)
    try {
      const { data, error } = await supabase.from('messages').insert({
        channel_id: channelId,
        user_id: currentUser.id,
        content: messageInput,
      }).select()

      if (error) {
        console.error('[v0] Error sending message:', error)
        throw error
      }
      
      console.log('[v0] Message inserted successfully:', data)
      setMessageInput('')
    } catch (error) {
      console.error('[v0] Error sending message:', error)
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
        <div className="flex items-center justify-between px-4">
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
        <div className="container mx-auto max-w-4xl space-y-3 px-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.user_id === currentUser?.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[75%] rounded-lg p-3 shadow-md sm:max-w-md ${isCurrentUser ? 'bg-primary/10' : 'bg-card'}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">
                        {message.profiles?.username ||
                          `User ${message.user_id.slice(0, 8)}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      {message.content}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="container px-4">
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
