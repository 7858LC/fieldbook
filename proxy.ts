import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: { signIn: "/login", error: "/login" },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/quotes/:path*",
    "/jobs/:path*",
    "/invoices/:path*",
    "/customers/:path*",
    "/templates/:path*",
  ],
}
