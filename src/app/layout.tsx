import { Providers } from "../components/providers";
import "./globals.css";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon handled automatically by Next.js App Router from favicon.ico in this directory */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
        {/* Suppress Privy console warnings and block token price requests */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Suppress console warnings
                const originalError = console.error;
                const originalWarn = console.warn;

                console.error = function(...args) {
                  const message = String(args[0] || '');
                  if (message.includes('Unable to fetch token price') ||
                      message.includes('token_price') ||
                      message.includes('404 (Not Found)') ||
                      message.includes('GET https://auth.privy.io/api/v1/token_price') ||
                      (message.includes('React does not recognize') && message.includes('isActive'))) {
                    return;
                  }
                  originalError.apply(console, args);
                };

                console.warn = function(...args) {
                  const message = String(args[0] || '');
                  if (message.includes('styled-components') && message.includes('isActive')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };

                // Block token price API requests
                if (typeof window !== 'undefined' && window.fetch) {
                  const originalFetch = window.fetch;
                  window.fetch = function(...args) {
                    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
                    if (url && (url.includes('token_price') || url.includes('420420422'))) {
                      // Return a mock successful response with null data
                      return Promise.resolve({
                        ok: false,
                        status: 404,
                        statusText: 'Not Found',
                        json: () => Promise.resolve(null)
                      });
                    }
                    return originalFetch.apply(this, args);
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body className="overflow-x-hidden">
        {/* Main Container - Prevents Privy modal from affecting layout */}
        <div className="relative min-h-screen overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: -1 }}
          >
            <source src="/DOT_Background Video.mp4" type="video/mp4" />
          </video>

          {/* Content Overlay */}
          <div className="relative z-10 min-h-screen bg-black/20">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
