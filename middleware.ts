
import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";


export default withAuth(
    async function middleware(req) {
        const pathUrl = req.nextUrl.pathname;
        const isAuth = await getToken({ req });
        const isLoginPage = pathUrl === "/login";
        const isRoot = pathUrl === "/";
        const isDashboard = pathUrl.startsWith("/dashboard");

        // Redirect authenticated users away from /login
        if (isLoginPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
            return NextResponse.next();
        }

        // Protect /dashboard routes
        if (isDashboard && !isAuth) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Redirect root to dashboard or login
        if (isRoot) {
            return NextResponse.redirect(new URL(isAuth ? "/dashboard" : "/login", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            async authorized() {
                return true;
            },
        },
    }
);

export const config = { matcher: ["/", "/login", "/dashboard/:path*"] };