import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Route protection (Prompt 4).
 *  - /login and /portal/login are public.
 *  - /admin: SUPER_ADMIN only.
 *  - /site-management, /facilities, /security, /cases: STAFF or SUPER_ADMIN.
 *  - /portal/* and /api/portal/*: RESIDENT only.
 *  - Everything else (including /): any signed-in user.
 * Server components and route handlers re-check roles; this is the first gate.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname === "/portal/login") {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as string | undefined;
  const isApi = pathname.startsWith("/api/");
  const isPortal = pathname === "/portal" || pathname.startsWith("/portal/") || pathname.startsWith("/api/portal");

  if (!token) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL(isPortal ? "/portal/login" : "/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const needsAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const needsStaff = ["/site-management", "/facilities", "/security", "/cases"].some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (needsAdmin && role !== "SUPER_ADMIN") return deny(req, isApi, role);
  if (needsStaff && role !== "STAFF" && role !== "SUPER_ADMIN") return deny(req, isApi, role);
  if (isPortal && role !== "RESIDENT") return deny(req, isApi, role);

  return NextResponse.next();
}

function deny(req: NextRequest, isApi: boolean, role?: string) {
  if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // Residents land in their portal; staff land on the Home page.
  const target = role === "RESIDENT" ? "/portal" : "/";
  return NextResponse.redirect(new URL(target, req.url));
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/portal/:path*",
    "/admin/:path*",
    "/site-management/:path*",
    "/facilities/:path*",
    "/security/:path*",
    "/cases/:path*",
    "/account/:path*",
    "/api/portal/:path*",
  ],
};
