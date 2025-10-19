import { ethers, Eip1193Provider } from "ethers";

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void
      ) => void;
    };
  }
}

// Contract configuration
export const CONTRACT_ADDRESS = "0x81481f719A69a564A05c588260A37805e091fd67";
export const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
export const CHAIN_ID = 420420422;
export const BLOCK_EXPLORER =
  "https://blockscout-passet-hub.parity-testnet.parity.io";

// Contract ABI - only the functions we need
const EVENT_DEPOSIT_ABI = [
  "function deposit() external payable",
  "function redeem() external",
  "function hasDeposited(address _user) external view returns (bool)",
  "function admin() external view returns (address)",
  "function DEPOSIT_AMOUNT() external view returns (uint256)",
  "function REDEMPTION_DEADLINE() external view returns (uint256)",
  "function depositors(uint256) external view returns (address)",
];

// Get provider for read-only operations
export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

// Get contract instance for read-only operations
export function getContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, EVENT_DEPOSIT_ABI, provider);
}

// Get signer from Privy embedded wallet provider
export async function getSigner(walletProvider?: Eip1193Provider) {
  let provider: ethers.BrowserProvider;

  if (walletProvider) {
    console.log("🔐 [Contract] Using Privy embedded wallet provider");
    // Use Privy's embedded wallet provider
    provider = new ethers.BrowserProvider(walletProvider);
  } else {
    console.log("🔐 [Contract] Falling back to window.ethereum");
    // Fallback to window.ethereum for backwards compatibility
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Please install MetaMask or a compatible wallet");
    }
    provider = new ethers.BrowserProvider(window.ethereum);
    // Request accounts for external wallets
    await provider.send("eth_requestAccounts", []);
  }

  // Check if on correct network
  const network = await provider.getNetwork();
  console.log("🌐 [Contract] Current network:", {
    name: network.name,
    chainId: Number(network.chainId),
    expectedChainId: CHAIN_ID,
  });

  if (Number(network.chainId) !== CHAIN_ID) {
    console.log(
      "🔄 [Contract] Wrong network detected, attempting to switch..."
    );
    try {
      await switchToPolkadotHubTestNet(walletProvider);
      // Re-create provider after network switch to get updated network
      if (walletProvider) {
        provider = new ethers.BrowserProvider(walletProvider);
      }
      // Re-check network after switching
      const newNetwork = await provider.getNetwork();
      if (Number(newNetwork.chainId) !== CHAIN_ID) {
        throw new Error(
          `Failed to switch to Polkadot Hub TestNet. Please manually switch to Chain ID: ${CHAIN_ID}`
        );
      }
      console.log("✅ [Contract] Successfully switched to Polkadot Hub TestNet");
    } catch (switchError) {
      console.error("❌ [Contract] Failed to switch network:", switchError);
      throw new Error(
        `Please switch to Polkadot Hub TestNet (Chain ID: ${CHAIN_ID}). Current network: ${
          network.name
        } (Chain ID: ${Number(network.chainId)})`
      );
    }
  }

  return await provider.getSigner();
}

// Check if user has deposited
export async function checkHasDeposited(userAddress: string): Promise<boolean> {
  console.log("🔍 [Contract] Checking deposit status for:", userAddress);
  try {
    const contract = getContract();
    const hasDeposited = await contract.hasDeposited(userAddress);
    console.log("✅ [Contract] Has deposited:", hasDeposited);
    return hasDeposited;
  } catch (error) {
    console.error("❌ [Contract] Error checking deposit status:", error);
    throw error;
  }
}

// Make a deposit
export async function makeDeposit(walletProvider?: Eip1193Provider) {
  console.log("💰 [Contract] Starting deposit process...");
  try {
    console.log("🔐 [Contract] Getting signer from wallet...");
    const signer = await getSigner(walletProvider);
    const signerAddress = await signer.getAddress();
    console.log("✅ [Contract] Signer address:", signerAddress);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      EVENT_DEPOSIT_ABI,
      signer
    );

    // Get deposit amount from contract
    console.log("📋 [Contract] Fetching required deposit amount...");
    const depositAmount = await contract.DEPOSIT_AMOUNT();
    console.log(
      "✅ [Contract] Deposit amount:",
      ethers.formatEther(depositAmount),
      "PAS"
    );

    // Send transaction
    console.log("📤 [Contract] Sending deposit transaction...");
    const tx = await contract.deposit({
      value: depositAmount, // 1 PAS
    });

    console.log("✅ [Contract] Transaction sent! Hash:", tx.hash);
    console.log("⏳ [Contract] Waiting for confirmation...");

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ [Contract] Transaction confirmed!");
    console.log("📊 [Contract] Gas used:", receipt?.gasUsed.toString());
    console.log("🔗 [Contract] Block:", receipt?.blockNumber);

    return {
      success: true,
      txHash: tx.hash,
      receipt,
    };
  } catch (error) {
    console.error("❌ [Contract] Deposit failed:", error);

    // Handle user rejection
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        console.log("🚫 [Contract] User rejected transaction");
        throw new Error("Transaction rejected by user");
      }

      // Handle insufficient funds
      if (error.code === "INSUFFICIENT_FUNDS") {
        console.log("💸 [Contract] Insufficient funds");
        throw new Error("Insufficient PAS balance for deposit");
      }
    }

    throw new Error(
      error instanceof Error ? error.message : "Deposit transaction failed"
    );
  }
}

// Redeem deposit
export async function redeemDeposit(walletProvider?: Eip1193Provider) {
  console.log("💸 [Contract] Starting redeem process...");
  try {
    console.log("🔐 [Contract] Getting signer from wallet...");
    const signer = await getSigner(walletProvider);
    const signerAddress = await signer.getAddress();
    console.log("✅ [Contract] Signer address:", signerAddress);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      EVENT_DEPOSIT_ABI,
      signer
    );

    // Check current deadline status
    const deadline = await contract.REDEMPTION_DEADLINE();
    const now = Math.floor(Date.now() / 1000);
    const isBeforeDeadline = now < Number(deadline);
    console.log(
      "⏰ [Contract] Deadline:",
      new Date(Number(deadline) * 1000).toISOString()
    );
    console.log(
      "⏰ [Contract] Current time:",
      new Date(now * 1000).toISOString()
    );
    console.log(
      "⏰ [Contract] Redeeming",
      isBeforeDeadline ? "BEFORE" : "AFTER",
      "deadline"
    );

    // Send transaction
    console.log("📤 [Contract] Sending redeem transaction...");
    const tx = await contract.redeem();

    console.log("✅ [Contract] Transaction sent! Hash:", tx.hash);
    console.log("⏳ [Contract] Waiting for confirmation...");

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ [Contract] Transaction confirmed!");
    console.log("📊 [Contract] Gas used:", receipt?.gasUsed.toString());
    console.log("🔗 [Contract] Block:", receipt?.blockNumber);

    return {
      success: true,
      txHash: tx.hash,
      receipt,
    };
  } catch (error) {
    console.error("❌ [Contract] Redeem failed:", error);

    // Handle user rejection
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        console.log("🚫 [Contract] User rejected transaction");
        throw new Error("Transaction rejected by user");
      }
    }

    throw new Error(
      error instanceof Error ? error.message : "Redeem transaction failed"
    );
  }
}

// Get contract info
export async function getContractInfo() {
  try {
    const contract = getContract();

    const [admin, depositAmount, deadline] = await Promise.all([
      contract.admin(),
      contract.DEPOSIT_AMOUNT(),
      contract.REDEMPTION_DEADLINE(),
    ]);

    return {
      admin,
      depositAmount: ethers.formatEther(depositAmount),
      deadline: Number(deadline),
      deadlineDate: new Date(Number(deadline) * 1000),
    };
  } catch (error) {
    console.error("Error getting contract info:", error);
    throw error;
  }
}

// Format transaction hash for explorer link
export function getExplorerLink(txHash: string): string {
  return `${BLOCK_EXPLORER}/tx/${txHash}`;
}

// Format address for explorer link
export function getAddressExplorerLink(address: string): string {
  return `${BLOCK_EXPLORER}/address/${address}`;
}

// Add Polkadot Hub TestNet to wallet
export async function addPolkadotHubTestNet(provider?: Eip1193Provider) {
  const targetProvider = provider || window.ethereum;

  if (!targetProvider) {
    throw new Error("No wallet provider available");
  }

  try {
    await targetProvider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${CHAIN_ID.toString(16)}`, // Convert to hex
          chainName: "Polkadot Hub TestNet",
          nativeCurrency: {
            name: "PAS",
            symbol: "PAS",
            decimals: 18,
          },
          rpcUrls: [RPC_URL],
          blockExplorerUrls: [BLOCK_EXPLORER],
        },
      ],
    });
    console.log("✅ [Contract] Polkadot Hub TestNet added to wallet");
  } catch (error) {
    console.error("❌ [Contract] Failed to add network:", error);
    throw error;
  }
}

// Switch to Polkadot Hub TestNet
export async function switchToPolkadotHubTestNet(provider?: Eip1193Provider) {
  const targetProvider = provider || window.ethereum;

  if (!targetProvider) {
    throw new Error("No wallet provider available");
  }

  try {
    await targetProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    });
    console.log("✅ [Contract] Switched to Polkadot Hub TestNet");
  } catch (error: unknown) {
    // If the network doesn't exist, add it
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 4902
    ) {
      console.log("🔄 [Contract] Network not found, adding it...");
      await addPolkadotHubTestNet(provider);
    } else {
      console.error("❌ [Contract] Failed to switch network:", error);
      throw error;
    }
  }
}
