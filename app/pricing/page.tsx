'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import Navigation from '@/components/navigation'

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [])

  const handlePlanClick = (planType: 'free' | 'premium') => {
    if (!user) {
      // Non-user -> go to sign up
      router.push('/auth/sign-up')
    } else {
      // Logged in user -> go to profile with plan section
      router.push('/profile#plan')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Plans and Pricing
          </h1>
          <p className="text-pretty text-lg text-muted-foreground md:text-xl">
            Get started immediately for free. Upgrade for more channels, advanced features, and priority support.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="relative flex flex-col border-2 shadow-lg transition-all hover:shadow-xl">
            <CardHeader className="pb-8">
              <div className="mb-2">
                <CardTitle className="font-display text-2xl font-bold">
                  Free
                </CardTitle>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold tracking-tight">
                    $0
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <CardDescription className="text-base">
                For individuals and small teams getting started.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 pb-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm leading-relaxed text-foreground">
                    Up to 5 active channels
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm leading-relaxed text-foreground">
                    All core features included
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm leading-relaxed text-foreground">
                    Real-time messaging
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm leading-relaxed text-foreground">
                    Channel invitations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm leading-relaxed text-foreground">
                    Upcoming mobile app access
                  </span>
                </li>
              </ul>
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button
                onClick={() => handlePlanClick('free')}
                variant="outline"
                size="lg"
                className="w-full border-2 font-semibold"
                disabled={loading}
              >
                {user ? 'Current Plan' : 'Get Started'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="relative flex flex-col border-2 border-primary shadow-xl transition-all hover:shadow-2xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="border-2 border-primary/20 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="pb-8">
              <div className="mb-2">
                <CardTitle className="font-display text-2xl font-bold">
                  Premium
                </CardTitle>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold tracking-tight text-primary">
                    $1.99
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <CardDescription className="text-base">
                For power users and teams that need unlimited channels.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 pb-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    Unlimited active channels
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    All Free plan features
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    90-day channel restore
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    Restore deleted channels
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    Priority access to new features
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    Priority support
                  </span>
                </li>
              </ul>
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button
                onClick={() => handlePlanClick('premium')}
                size="lg"
                className="w-full border-2 border-primary/20 font-semibold shadow-lg"
                disabled={loading}
              >
                Upgrade to Premium
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ or Additional Info Section */}
        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="text-sm text-muted-foreground">
            All plans include secure authentication, real-time synchronization, and unlimited messages. No credit card required for Free plan.
          </p>
        </div>
      </div>
    </div>
  )
}
