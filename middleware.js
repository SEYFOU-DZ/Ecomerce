import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("token")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    const authPages = ["/signin", "/signup", "/verify-email"];
    const protectedPages = ["/users", "/dashboard"];
    const adminPages = ["/dashboard"];

    // 1. If user is trying to access auth pages but HAS a token -> redirect to home
    if ((token || refreshToken) && authPages.includes(pathname)) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Check if the current path is protected
    const isProtected = protectedPages.some(path => pathname.startsWith(path));
    const isAdminRoute = adminPages.some(path => pathname.startsWith(path));

    if (isProtected) {
        // If they have NO token whatsoever, redirect to signin
        if (!token && !refreshToken) {
            return NextResponse.redirect(new URL("/signin", request.url));
        }

        // 3. Admin protection
        if (isAdminRoute) {
            let activeToken = token || refreshToken;
            if (activeToken) {
                try {
                    const base64Url = activeToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    const payload = JSON.parse(jsonPayload);
                    
                    if (!payload.UserInfo?.isAdmin) {
                        return NextResponse.redirect(new URL("/", request.url));
                    }
                } catch(e) {
                    console.log("Failed decoding token in middleware");
                    return NextResponse.redirect(new URL("/", request.url));
                }
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/users/:path*",
        "/dashboard/:path*",
        "/signin",
        "/signup",
        "/verify-email",
    ]
};