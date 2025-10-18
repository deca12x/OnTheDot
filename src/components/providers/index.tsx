"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import { createConfig, WagmiProvider } from "wagmi";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { http } from "wagmi";
import { defineChain } from "viem";

const polkadotAssetHub = defineChain({
  id: 1000, // Asset Hub parachain ID
  name: "Polkadot Asset Hub",
  network: "polkadot-asset-hub",
  nativeCurrency: { name: "DOT", symbol: "DOT", decimals: 10 },
  rpcUrls: {
    default: { http: ["https://polkadot-asset-hub-rpc.polkadot.io"] },
  },
});

const polkadotAssetHubTestnet = defineChain({
  id: 1001, // Asset Hub testnet parachain ID
  name: "Polkadot Asset Hub Testnet",
  network: "polkadot-asset-hub-testnet",
  nativeCurrency: { name: "DOT", symbol: "DOT", decimals: 10 },
  rpcUrls: {
    default: { http: ["https://polkadot-asset-hub-testnet-rpc.polkadot.io"] },
  },
});

const wagmiConfig = createConfig({
  chains: [polkadotAssetHub, polkadotAssetHubTestnet],
  transports: {
    [polkadotAssetHub.id]: http(),
    [polkadotAssetHubTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CivicAuthProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </WagmiProvider>
      </QueryClientProvider>
    </CivicAuthProvider>
  );
}
