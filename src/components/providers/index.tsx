"use client";
import * as React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// Define login methods array outside to prevent recreation
const loginMethodsArray: ("wallet" | "google")[] = ["wallet", "google"];

// Simple Privy config - no wagmi, no viem
const privyConfig = {
  appearance: {
    theme: "light" as const,
    accentColor: "#676FFF" as const,
  },
  loginMethods: loginMethodsArray,
  embeddedWallets: {
    createOnLogin: "users-without-wallets" as const,
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    throw new Error(
      "NEXT_PUBLIC_PRIVY_APP_ID is not set. Please add it to your environment variables in Vercel."
    );
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </PrivyProvider>
  );
}
