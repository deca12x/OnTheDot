"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useEffect, useCallback } from "react";
import { getRegistrationByWallet } from "@/lib/data";
import { EventRegistration } from "@/lib/types";
import ConnectButton from "@/components/ConnectButton";
import Link from "next/link";

export default function RedeemPage() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0]; // Get the first connected wallet
  const walletAddress = wallet?.address;
  const [registration, setRegistration] = useState<EventRegistration | null>(
    null
  );
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemComplete, setRedeemComplete] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  // Check if user has deposited on-chain
  useEffect(() => {
    async function checkDeposit() {
      if (!walletAddress) return;

      try {
        // Check both local storage and on-chain
        const [localReg, { checkHasDeposited }] = await Promise.all([
          getRegistrationByWallet(walletAddress),
          import("@/lib/contract"),
        ]);

        const hasDepositedOnChain = await checkHasDeposited(walletAddress);

        // Only set registration if user has actually deposited on-chain
        if (hasDepositedOnChain && localReg) {
          setRegistration(localReg);
        } else if (hasDepositedOnChain) {
          // Has deposit on-chain but no local record - still allow redemption
          setRegistration({
            name: "Anonymous",
            walletAddress,
            depositPaid: true,
            depositTxHash: "",
            portfolioLink: "",
            hasUsedSubstratePolkadot: false,
            technologiesUsed: {
              ink: false,
              evmSolidity: false,
              polkaVM: false,
              xcm: false,
              polkadotJsApi: false,
            },
            precompilesFamiliarity: 1,
          });
        }
      } catch (error) {
        console.error("Error checking deposit:", error);
      }
    }

    checkDeposit();
  }, [walletAddress]);

  const handleRedeem = useCallback(async () => {
    if (!walletAddress || !registration || !wallet) return;

    setIsRedeeming(true);
    try {
      // Get the wallet provider from Privy
      const provider = await wallet.getEthereumProvider();

      if (!provider) {
        throw new Error(
          "Wallet provider not available. Please ensure you're logged in with Privy."
        );
      }

      // Import contract functions
      const { redeemDeposit } = await import("@/lib/contract");

      // Call the redeem function on-chain using Privy's embedded wallet
      const redeemResult = await redeemDeposit(provider);

      if (!redeemResult.success) {
        throw new Error("Redeem transaction failed");
      }

      setTxHash(redeemResult.txHash);
      setRedeemComplete(true);
    } catch (error) {
      console.error("Error redeeming deposit:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error redeeming deposit. Please try again.";
      alert(errorMessage);
      setIsRedeeming(false);
    }
  }, [walletAddress, registration, wallet]);

  // Auto-start redemption if user has a valid registration
  useEffect(() => {
    if (registration && !redeemComplete && !isRedeeming) {
      handleRedeem();
    }
  }, [registration, redeemComplete, isRedeeming, handleRedeem]);

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show login button
  if (!authenticated || !walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              ETHRome 2025 Deposit Redemption
            </div>
            <div className="text-lg text-gray-600">
              Please sign in to redeem your deposit
            </div>
          </div>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // User is authenticated but has no registration
  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-800 mb-4">
            No Deposit to Withdraw
          </div>
          <div className="text-lg text-red-700 mb-6">
            You haven&apos;t registered for the event or paid a deposit.
          </div>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Register for Event
          </Link>
        </div>
      </div>
    );
  }

  // Redemption complete - show success
  if (redeemComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-800 mb-4">
            Deposit Successfully Redeemed! 🎉
          </div>
          <div className="text-lg text-green-700 mb-6">
            Your 1 DOT deposit has been returned to your wallet
          </div>
          <div className="text-sm text-green-600 mb-4">
            Welcome to ETHRome 2025, {registration.name}!
          </div>
          {txHash && (
            <div className="bg-white p-3 rounded border mb-4">
              <p className="text-xs text-gray-600 mb-1">Transaction Hash:</p>
              <a
                href={`https://blockscout-passet-hub.parity-testnet.parity.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-mono break-all"
              >
                {txHash}
              </a>
            </div>
          )}
          <div className="text-6xl mb-4">✅</div>
          <p className="text-sm text-gray-600">Enjoy the event!</p>
        </div>
      </div>
    );
  }

  // Redemption in progress
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-800 mb-4">
          Redeeming your deposit...
        </div>
        <div className="text-lg text-blue-700 mb-6">
          Please wait while we process your redemption
        </div>
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <div className="text-sm text-blue-600">
          Processing transaction on Polkadot Asset Hub...
        </div>
      </div>
    </div>
  );
}
