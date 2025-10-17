"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import { createConfig, WagmiProvider } from "wagmi";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { http } from "wagmi";
import { defineChain } from "viem";

const mantleMainnet = defineChain({
  id: 5000,
  name: "Mantle Mainnet",
  network: "mantle",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mantle.xyz"] },
  },
});

const mantleTestnet = defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  network: "mantle-sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
});

const wagmiConfig = createConfig({
  chains: [mantleMainnet, mantleTestnet],
  transports: {
    [mantleMainnet.id]: http(),
    [mantleTestnet.id]: http(),
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
