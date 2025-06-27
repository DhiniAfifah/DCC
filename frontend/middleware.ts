import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const protectedRoutes = ["/main", "/dashboard", "/create", "/load-dcc"]; //  rute yang dilindungi

  // Jika mencoba mengakses rute yang dilindungi tanpa token
  if (protectedRoutes.includes(request.nextUrl.pathname) && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/main", "/dashboard", "/create", "/load-dcc"],
};
