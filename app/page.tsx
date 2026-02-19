'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { MessageSquare, Users, Zap, Shield, Search, Bell } from 'lucide-react'

export default function Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Treehouse</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="shadow-sm">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pb-24 md:pt-32">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            <span>Real-time collaboration made simple</span>
          </div>
          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            Team chat that brings everyone together
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Connect your team with powerful channels, instant messaging, and
            seamless collaboration. Work happens faster when everyone stays in
            sync.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/sign-up">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg">
                Get started for free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
              >
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Free forever for small teams. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              Organized Conversations
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Create dedicated channels for projects, teams, or topics. Keep
              discussions focused and easy to find.
            </p>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Real-time Messaging</h3>
            <p className="leading-relaxed text-muted-foreground">
              Messages appear instantly. No delays, no refresh needed. Stay
              connected with your team in real-time.
            </p>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Team Invitations</h3>
            <p className="leading-relaxed text-muted-foreground">
              Easily invite team members to join channels. Share invitation
              links and grow your workspace effortlessly.
            </p>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Powerful Search</h3>
            <p className="leading-relaxed text-muted-foreground">
              Find any message, file, or conversation instantly. Your entire
              team history is searchable and organized.
            </p>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
            <p className="leading-relaxed text-muted-foreground">
              Your data is encrypted and secure. Control who has access to your
              channels and conversations.
            </p>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Smart Notifications</h3>
            <p className="leading-relaxed text-muted-foreground">
              Stay informed without being overwhelmed. Customize notifications
              to match your workflow and focus.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="px-6 py-12 text-center md:px-12 md:py-16">
            <h2 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Ready to transform how your team communicates?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Join thousands of teams already using Treehouse to collaborate
              better and move faster.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg">
                  Start for free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                >
                  Sign in to your account
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="font-semibold">Treehouse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Treehouse. Built for teams that move fast.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
