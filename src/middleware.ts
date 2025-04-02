import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is for the admin dashboard
  const isAdminPath = pathname.startsWith('/admin');
  
  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // If trying to access admin pages without being logged in or without admin role
  if (isAdminPath) {
    if (!token) {
      // Redirect to login page if not logged in
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    if (token.role !== 'admin') {
      // Redirect to home page if not an admin
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all admin routes
    '/admin/:path*',
    // Exclude API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
