"use client";
import * as React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// Define Polkadot Asset Hub TestNet chain
const polkadotAssetHubTestnet = {
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
};

// Define login methods array outside to prevent recreation
const loginMethodsArray: ("wallet" | "google")[] = ["wallet", "google"];

// Privy config with custom chain support
const privyConfig = {
  appearance: {
    theme: "light" as const,
    accentColor: "#676FFF" as const,
  },
  loginMethods: loginMethodsArray,
  embeddedWallets: {
    createOnLogin: "users-without-wallets" as const,
    requireUserPasswordOnCreate: false,
    noPromptOnSignature: false,
  },
  defaultChain: polkadotAssetHubTestnet,
  supportedChains: [polkadotAssetHubTestnet],
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
