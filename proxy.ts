import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Affiliate attribution: an influencer shares talkcanvas.com/?ref=TOYE10.
 * We drop the code in a cookie so it survives browsing and pre-fills at
 * checkout. The cookie is a convenience only — the code is re-validated and
 * the discount recomputed server-side when the order is placed.
 */
const REF_COOKIE = "tc_ref";
const REF_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function isValidToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/** Capture ?ref=CODE onto any response leaving this proxy. */
function captureRef(req: NextRequest, res: NextResponse): NextResponse {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return res;

  const code = ref.trim().toUpperCase().slice(0, 50);
  if (!/^[A-Z0-9_-]+$/.test(code)) return res;

  res.cookies.set(REF_COOKIE, code, {
    maxAge: REF_MAX_AGE,
    path: "/",
    sameSite: "lax",
    // Readable by the checkout page to pre-fill the code field.
    httpOnly: false,
  });
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin auth ────────────────────────────────────────────────
  // The matcher now covers the whole site (so ?ref= is caught anywhere), so
  // the auth gate must be scoped to /admin explicitly rather than relying on
  // the matcher to scope it.
  if (pathname.startsWith("/admin")) {
    // Login page is public so we don't infinite-redirect
    if (pathname === "/admin/login") return NextResponse.next();

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token || !(await isValidToken(token))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ── Public pages: capture affiliate referrals ─────────────────
  return captureRef(req, NextResponse.next());
}

export const config = {
  // Everything except API routes, Next internals, and static files — the
  // ?ref= link can land on any public page, not just the homepage.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|usdz|glb)$).*)",
  ],
};
