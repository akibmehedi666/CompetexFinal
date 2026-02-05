import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('competex_token')?.value
    const role = request.cookies.get('competex_role')?.value || 'Participant'

    const { pathname } = request.nextUrl

    // 1. Protected Routes: If NOT logged in, redirect to login
    const protectedPaths = ['/dashboard', '/organizer', '/mentor', '/sponsor', '/recruiter']
    const isProtected = protectedPaths.some(path => pathname.startsWith(path))

    if (isProtected && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Public Routes (Auth pages): If logged in, redirect to respective dashboard
    const authPaths = ['/login', '/signup']
    const isAuthPage = authPaths.some(path => pathname.startsWith(path)) || pathname === '/'

    if (isAuthPage && token) {
        let dashboardUrl = '/dashboard'

        // Determine dashboard based on role
        // Normalize role check to handle case variations just in case
        const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()

        switch (normalizedRole) {
            case 'Organizer':
                dashboardUrl = '/organizer/dashboard'
                break
            case 'Mentor':
                dashboardUrl = '/mentor/dashboard'
                break
            case 'Sponsor':
            case 'Recruiter':
            case 'Participant':
            default:
                dashboardUrl = '/dashboard' // These roles share the main dashboard route for now or have routing handled within it
                break
        }

        return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
