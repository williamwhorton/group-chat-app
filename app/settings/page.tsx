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
import { LogOut, Trash2 } from 'lucide-react'
import DeleteAccountModal from '@/components/delete-account-modal'
import Navigation from '@/components/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()
  }, [])

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
