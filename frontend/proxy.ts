import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume-analyzer/:path*",
    "/ats-checker/:path*",
    "/mock-interview/:path*",
    "/coding-practice/:path*",
    "/performance-history/:path*",
    "/settings/:path*",
  ],
};