// Auth related types
export interface User {
  id?: string;
  email?: string;
  name?: string;
  walletAddress?: string;
  // Add user properties as needed
}

// Event registration form data
export interface EventRegistration {
  name: string;
  portfolioLink: string;
  hasUsedSubstratePolkadot: boolean;
  technologiesUsed: {
    ink: boolean;
    evmSolidity: boolean;
    polkaVM: boolean;
    xcm: boolean;
    polkadotJsApi: boolean;
  };
  precompilesFamiliarity: number; // 1-5 scale
  walletAddress: string;
  depositPaid: boolean;
  depositTxHash?: string;
}
