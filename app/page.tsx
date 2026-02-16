'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        router.push('/channels')
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Treehouse</h1>
          <p className="text-lg text-muted-foreground">
            Create channels and chat in real-time
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/auth/sign-up" className="block">
            <Button size="lg" className="w-full">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login" className="block">
            <Button size="lg" variant="outline" className="w-full">
              Login
            </Button>
          </Link>
        </div>

        <div className="space-y-3 pt-8 text-sm text-muted-foreground">
          <p>✓ Create and join channels</p>
          <p>✓ Real-time messaging</p>
          <p>✓ Invite friends to chat</p>
        </div>
      </div>
    </div>
  )
}
