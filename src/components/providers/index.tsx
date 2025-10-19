"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig, WagmiProvider } from "wagmi";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { http } from "wagmi";
import { defineChain } from "viem";

// Suppress Privy errors immediately
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = String(args[0] || "");
    if (
      message.includes("Unable to fetch token price") ||
      message.includes("token_price") ||
      message.includes("420420422") ||
      (message.includes("React does not recognize") && message.includes("isActive"))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

// Define Polkadot Asset Hub TestNet chain
const polkadotAssetHubTestnet = defineChain({
  id: 420420422,
  name: "Polkadot Asset Hub TestNet",
  network: "polkadot-asset-hub-testnet",
  nativeCurrency: { name: "PAS", symbol: "PAS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-passet-hub-eth-rpc.polkadot.io"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-passet-hub.parity-testnet.parity.io",
    },
  },
});

const wagmiConfig = createConfig({
  chains: [polkadotAssetHubTestnet],
  transports: {
    [polkadotAssetHubTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

// Define login methods array outside to prevent recreation
const loginMethodsArray: ("wallet" | "google")[] = ["wallet", "google"];
const supportedChainsArray = [polkadotAssetHubTestnet];

// Memoize Privy config to prevent re-renders that might cause key issues
const privyConfig = {
  appearance: {
    theme: "light" as const,
    accentColor: "#676FFF" as const,
  },
  loginMethods: loginMethodsArray,
  embeddedWallets: {
    createOnLogin: "users-without-wallets" as const,
  },
  defaultChain: polkadotAssetHubTestnet,
  supportedChains: supportedChainsArray,
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
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
