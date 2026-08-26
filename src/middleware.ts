import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("jwt_token")?.value ||
    request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  const { pathname } = request.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!token || role !== "ADMIN") {
      // Redirect to login if not authenticated or not an admin
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect User Dashboard & Checkout Routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/checkout/:path*"],
};
