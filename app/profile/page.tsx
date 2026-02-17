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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, MessageCircle, Settings, Hash } from 'lucide-react'
import Navigation from '@/components/navigation'

interface Channel {
  id: string
  name: string
  description?: string
  creator_id: string
  created_at: string
}

interface Profile {
  id: string
  username: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [createdChannels, setCreatedChannels] = useState<Channel[]>([])
  const [memberChannels, setMemberChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        setUser(user)

        // Load profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error loading profile:', profileError)
        } else {
          setProfile(profileData)
        }

        // Load channels created by the user
        const { data: channelsData, error: channelsError } = await supabase
          .from('channels')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })

        if (channelsError) {
          console.error('Error loading created channels:', channelsError)
        } else {
          setCreatedChannels(channelsData || [])
        }

        // Load channels where the user is a member (but not the creator)
        const { data: memberData, error: memberError } = await supabase
          .from('channel_members')
          .select('channels(*)')
          .eq('user_id', user.id)

        if (memberError) {
          console.error('Error loading member channels:', memberError)
        } else {
          // Filter out channels where user is the creator to avoid duplication
          const membersList = memberData
            ?.map((item: any) => item.channels)
            .filter((channel: Channel) => channel && channel.creator_id !== user.id) || []
          setMemberChannels(membersList)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const getInitials = (email: string, username?: string | null) => {
    if (username) {
      return username.substring(0, 2).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <div className="container px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8 border-2 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                      {getInitials(user.email, profile?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-display text-2xl">
                      {profile?.username || 'Anonymous User'}
                    </CardTitle>
                    <CardDescription className="mt-1 text-base">
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {createdChannels.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Channels Created
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {memberChannels.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Channels Joined
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {createdChannels.length + memberChannels.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Channels
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Created Channels */}
          <Card className="mb-8 border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                <CardTitle className="font-display">Channels I Created</CardTitle>
              </div>
              <CardDescription>
                Channels you own and manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createdChannels.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">
                    You haven't created any channels yet
                  </p>
                  <Link href="/channels">
                    <Button variant="link" className="mt-2">
                      Create your first channel
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {createdChannels.map((channel) => (
                    <Link key={channel.id} href={`/channels/${channel.id}`}>
                      <div className="group flex items-center justify-between rounded-lg border-2 p-4 transition-all hover:border-primary/50 hover:bg-accent">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold group-hover:text-primary">
                              {channel.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              Owner
                            </Badge>
                          </div>
                          {channel.description && (
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {channel.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Channels */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="font-display">Channels I Joined</CardTitle>
              </div>
              <CardDescription>
                Channels where you're a member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memberChannels.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">
                    You haven't joined any channels yet
                  </p>
                  <Link href="/channels">
                    <Button variant="link" className="mt-2">
                      Browse channels
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberChannels.map((channel) => (
                    <Link key={channel.id} href={`/channels/${channel.id}`}>
                      <div className="group flex items-center justify-between rounded-lg border-2 p-4 transition-all hover:border-primary/50 hover:bg-accent">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold group-hover:text-primary">
                              {channel.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              Member
                            </Badge>
                          </div>
                          {channel.description && (
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {channel.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
