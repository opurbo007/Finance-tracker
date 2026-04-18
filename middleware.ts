import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Public paths that never require authentication
const PUBLIC_PATHS = new Set(["/auth", "/api/auth/register", "/offline"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/icons/")) return true;

  // FIXED
  if (pathname === "/manifest.webmanifest") return true;

  if (pathname === "/sw.js") return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/favicon.svg") return true;

  return false;
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const isAuthed = !!req.nextauth.token;

    // Authenticated user hitting / or /auth → send to dashboard
    if (isAuthed && (pathname === "/" || pathname === "/auth")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        if (isPublicPath(pathname)) return true;
        return !!token;
      },
    },
    pages: { signIn: "/auth" },
  },
);

export const config = {
  // Run on all paths — skip static binary assets only
  matcher: [
    "/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.ico$|.*\\.svg$).*)",
  ],
};
