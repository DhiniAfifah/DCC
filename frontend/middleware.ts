import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("🛡️ Middleware: Checking route:", request.nextUrl.pathname);
  
  // Get token from cookies
  const cookieToken = request.cookies.get("access_token")?.value;
  
  // Also check if the token is actually valid (not empty, not expired placeholder)
  const hasValidToken = cookieToken && 
                       cookieToken.trim() !== "" && 
                       cookieToken !== "undefined" && 
                       cookieToken !== "null" &&
                       !cookieToken.includes("expires=Thu, 01 Jan 1970"); // Check if it's an expired cookie
  
  console.log("🍪 Middleware: Cookie token present:", cookieToken ? "YES" : "NO");
  console.log("🍪 Middleware: Cookie token valid:", hasValidToken ? "YES" : "NO");
  
  if (cookieToken && !hasValidToken) {
    console.log("🧹 Middleware: Found invalid/expired token, treating as no token");
  }
  
  if (hasValidToken) {
    console.log("🍪 Middleware: Valid token value:", `${cookieToken.substring(0, 20)}...`);
  }
  
  const protectedRoutes = ["/main", "/dashboard", "/create", "/load-dcc"];
  const publicRoutes = ["/", "/register"];

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route
  );

  console.log("🛡️ Middleware: Is protected route:", isProtectedRoute);
  console.log("🌍 Middleware: Is public route:", isPublicRoute);

  // If accessing protected route without VALID token
  if (isProtectedRoute && !hasValidToken) {
    console.log("❌ Middleware: Redirecting to login - no valid token for protected route");
    
    // Create response that clears any invalid cookies
    const response = NextResponse.redirect(new URL("/", request.url));
    
    // Clear the invalid cookie
    response.cookies.delete("access_token");
    response.cookies.set("access_token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "lax"
    });
    
    return response;
  }

  // If accessing login/register with valid token, redirect to main
  if (isPublicRoute && hasValidToken) {
    console.log("⚠️ Middleware: Has valid token on public route");
    console.log("🔄 Middleware: Redirecting to main (valid token present)");
    return NextResponse.redirect(new URL("/main", request.url));
  }

  // If on public route with invalid token, clear the cookie and allow
  if (isPublicRoute && cookieToken && !hasValidToken) {
    console.log("🧹 Middleware: Clearing invalid token on public route");
    const response = NextResponse.next();
    response.cookies.delete("access_token");
    response.cookies.set("access_token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "lax"
    });
    return response;
  }

  console.log("✅ Middleware: Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};