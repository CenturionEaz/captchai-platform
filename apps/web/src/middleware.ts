import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ─── Route Definitions ────────────────────────────────────────────────────────

/** Routes that require authentication — any prefix match */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/api/v1",
];

/** Routes that are public (no auth needed) */
const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/ethics",
  "/acceptable-use",
  "/docs",
]);

/** Routes that authenticated users should NOT see (redirect to dashboard) */
const AUTH_ROUTES = new Set(["/login", "/signup"]);

// ─── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Build Supabase SSR client — reads/writes session cookies
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run logic between createServerClient and getUser()
  // that depends on Supabase auth, as it may not be synced yet.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // ── Route guard logic ────────────────────────────────────────────────────

  // 1. If trying to access protected route without auth → redirect to /login
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname); // preserve intended destination
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If authenticated user visits /login or /signup → redirect to /dashboard
  if (isAuthenticated && AUTH_ROUTES.has(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    // Honor ?next= param if present
    const next = searchParams.get("next");
    redirectUrl.pathname = next && next.startsWith("/dashboard") ? next : "/dashboard";
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  // ── Security headers ──────────────────────────────────────────────────────
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  supabaseResponse.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  supabaseResponse.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      `connect-src 'self' https://wwaghdhnkrzmihcpdklv.supabase.co wss://wwaghdhnkrzmihcpdklv.supabase.co ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`,
      "frame-ancestors 'none'",
    ].join("; ")
  );
  supabaseResponse.headers.set("X-Research-Platform", "CaptchaIQ/2.0");

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$).*)",
  ],
};
