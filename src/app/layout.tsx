import { Providers } from "../components/providers";
import "./globals.css";

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
