'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Trash2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import DeleteAccountModal from '@/components/delete-account-modal'
import Navigation from '@/components/navigation'

interface Profile {
  id: string
  username: string | null
  created_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
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
          setUsername(profileData?.username || '')
        }
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()
  }, [])

  const handleSaveProfile = async () => {
    if (!user) return

    // Trim whitespace from username
    const trimmedUsername = username.trim()

    // Validate username
    if (!trimmedUsername) {
      toast({
        title: 'Error',
        description: 'Username cannot be empty.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      // Check if username is already taken by another user
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', trimmedUsername)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is what we want
        throw checkError
      }

      // If a profile exists with this username and it's not the current user
      if (existingProfile && existingProfile.id !== user.id) {
        toast({
          title: 'Error',
          description: 'This username is already taken. Please choose another.',
          variant: 'destructive',
        })
        setSaving(false)
        return
      }

      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update({ username: trimmedUsername })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      })

      // Update local profile state
      setProfile((prev) => prev ? { ...prev, username: trimmedUsername } : null)
      setUsername(trimmedUsername)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Settings</h1>

        <div className="max-w-2xl space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium">Delete Account</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  This will permanently delete your account and all channels you
                  created. Messages you posted in other channels will remain.
                </p>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DeleteAccountModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
        />
      </div>
    </div>
  )
}
