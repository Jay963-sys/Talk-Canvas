import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const REF_COOKIE = "tc_ref";
const REF_MAX_AGE = 60 * 60 * 24 * 30;

async function isValidToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

function captureRef(req: NextRequest, res: NextResponse): NextResponse {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return res;

  const code = ref.trim().toUpperCase().slice(0, 50);
  if (!/^[A-Z0-9_-]+$/.test(code)) return res;

  res.cookies.set(REF_COOKIE, code, {
    maxAge: REF_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  return captureRef(req, NextResponse.next());
}

export const config = {
  matcher: [
    "/admin/:path*",
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|usdz|glb)$).*)",
      has: [{ type: "query", key: "ref" }],
    },
  ],
};
