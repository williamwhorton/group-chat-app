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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-secondary/20 p-4">
      <div className="max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-bold tracking-tight text-balance">
            Treehouse
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Create channels and chat in real-time
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/auth/sign-up" className="block">
            <Button size="lg" className="w-full shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login" className="block">
            <Button size="lg" variant="outline" className="w-full border-2 hover:border-primary/50 hover:bg-primary/5">
              Login
            </Button>
          </Link>
        </div>

        <div className="space-y-3 pt-8 text-sm text-muted-foreground">
          <p>{'✓ Create and join channels'}</p>
          <p>{'✓ Real-time messaging'}</p>
          <p>{'✓ Invite friends to chat'}</p>
        </div>
      </div>
    </div>
  )
}
