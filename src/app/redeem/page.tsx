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

      // Delete the user's record from storage.json after successful redemption
      try {
        await fetch("/api/storage", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress }),
        });
      } catch (error) {
        console.error("Error deleting registration from storage:", error);
        // Don't throw here - redemption was successful, storage cleanup is secondary
      }

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
      <div className="min-h-screen flex items-center justify-center content-overlay">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show login button
  if (!authenticated || !walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center content-overlay px-4 relative">
        {/* Corner Logos */}
        <img
          src="/ETHRome1b.png"
          alt="Built at ETHRome"
          className="absolute top-4 left-4 h-19 md:h-24 lg:h-29 w-auto z-20"
        />
        <img
          src="/Polkadot.png"
          alt="Built with Polkadot"
          className="absolute top-4 right-4 h-16 md:h-20 lg:h-24 w-auto z-20"
        />

        <div className="relative flex flex-col items-center gap-6 text-center">
          {/* Floating Smoke Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/DOT_Background SMOKE.svg"
              alt=""
              className="w-96 h-96 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] opacity-20 animate-pulse-slow"
              style={{
                filter: "blur(1px)",
                transform: "scale(3)",
                zIndex: -1,
              }}
            />
          </div>

          <div className="text-center relative z-10">
            <div className="text-5xl md:text-4xl font-bold mb-2 font-pacifico">
              Redeem Deposit
            </div>
            <div className="text-lg text-gray-200 mt-4">
              Please sign in to redeem your deposit
            </div>
          </div>

          {/* ARM SVG between title and button */}
          <div className="relative z-10 my-1 overflow-hidden h-72 md:h-80 lg:h-96 w-64 md:w-80 lg:w-96 mx-auto">
            <img
              src="/DOT_Background ARM.svg"
              alt=""
              className="absolute opacity-80"
              style={{
                // MANUAL ADJUSTMENT CONTROLS:
                transform: "scale(2) translate(0px, -55px)", // scale(zoom) translate(x, y)
                transformOrigin: "center center", // 'top left', 'center center', 'bottom right', etc.
                width: "200px", // Fixed width for consistent cropping
                height: "auto",
                left: "50%",
                top: "50%",
                marginLeft: "-100px", // Half of width to center
                marginTop: "-80px", // Adjust vertical centering
              }}
            />
          </div>

          <ConnectButton />
        </div>
      </div>
    );
  }

  // User is authenticated but has no registration
  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center p-6 md:p-8 bg-red-50 rounded-lg border border-red-200 shadow-lg">
          <div className="text-2xl font-bold text-red-800 mb-4 font-pacifico">
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center p-6 md:p-8 bg-green-50 rounded-lg border border-green-200 shadow-lg">
          <div className="text-2xl font-bold text-green-800 mb-4 font-pacifico">
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center p-6 md:p-8 bg-blue-50 rounded-lg border border-blue-200 shadow-lg">
        <div className="text-2xl font-bold text-blue-800 mb-4 font-pacifico">
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
