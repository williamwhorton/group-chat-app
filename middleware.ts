// This file is intentionally minimal
// Authentication is handled client-side in page components
// No middleware is needed for this simplified setup

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: []
}
