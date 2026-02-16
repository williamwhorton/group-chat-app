'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { MessageCircle, Settings, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return null

  const isChannelsPage = pathname.startsWith('/channels')
  const isSettingsPage = pathname.startsWith('/settings')

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link
          href="/channels"
          className="flex items-center gap-2 font-display text-lg font-bold transition-colors hover:text-primary"
        >
          <MessageCircle className="h-5 w-5 text-primary" />
          Treehouse
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/channels">
            <Button variant={isChannelsPage ? 'default' : 'ghost'} size="sm" className={isChannelsPage ? 'shadow-md shadow-primary/20' : ''}>
              Channels
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant={isSettingsPage ? 'default' : 'ghost'} size="sm" className={isSettingsPage ? 'shadow-md shadow-primary/20' : ''}>
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
