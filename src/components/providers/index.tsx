"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig, WagmiProvider } from "wagmi";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { http } from "wagmi";
import { defineChain } from "viem";

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

// Memoize Privy config to prevent re-renders that might cause key issues
const privyConfig = {
  appearance: {
    theme: "light" as const,
    accentColor: "#676FFF",
  },
  loginMethods: ["wallet", "email"] as const, // Reordered for stability
  embeddedWallets: {
    createOnLogin: "users-without-wallets" as const,
  },
  defaultChain: polkadotAssetHubTestnet,
  supportedChains: [polkadotAssetHubTestnet],
} as const;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
