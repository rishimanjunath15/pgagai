// ============================================
// MIDDLEWARE - Route protection and authentication
// ============================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/features/auth/auth";

// Routes that require authentication
const protectedPaths = ["/", "/settings", "/profile"];

// Public routes that don't require authentication
const publicPaths = ["/login", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and API routes
  if (publicPaths.some(path => pathname.startsWith(path)) || 
      pathname.startsWith("/_next") || 
      pathname.startsWith("/favicon") ||
      pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected paths
  const session = await auth();

  // If accessing a protected path without authentication, redirect to login
  if (protectedPaths.includes(pathname) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user tries to access login page, redirect to home
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api/auth (NextAuth.js)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};