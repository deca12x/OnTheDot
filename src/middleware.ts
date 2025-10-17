import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";

export default authMiddleware();

export const config = {
  // Only protect routes that need authentication, exclude API routes
  matcher: [
    /*
     * Match all request paths except:
     * - /api (API routes should not be protected by auth middleware)
     * - _next directory (Next.js static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     */
    "/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif).*)",
  ],
};
