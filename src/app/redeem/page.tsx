"use client";

import { useUser } from "@civic/auth-web3/react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getRegistrationByWallet } from "@/lib/data";
import { EventRegistration } from "@/lib/types";
import ConnectButton from "@/components/ConnectButton";

export default function RedeemPage() {
  const { user, isLoading } = useUser();
  const { address: walletAddress, isConnected } = useAccount();
  const [registration, setRegistration] = useState<EventRegistration | null>(
    null
  );
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemComplete, setRedeemComplete] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  // Check for existing registration when user is loaded
  useEffect(() => {
    if (walletAddress) {
      getRegistrationByWallet(walletAddress).then(setRegistration);
    }
  }, [walletAddress]);

  // Auto-start redemption if user has a valid registration
  useEffect(() => {
    if (registration && !redeemComplete && !isRedeeming) {
      handleRedeem();
    }
  }, [registration, redeemComplete, isRedeeming]);

  // Show loading state while Civic Auth initializes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show login button
  if (!user || !isConnected) {
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
            You haven't registered for the event or paid a deposit.
          </div>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Register for Event
          </a>
        </div>
      </div>
    );
  }

  const handleRedeem = async () => {
    if (!walletAddress || !registration) return;

    setIsRedeeming(true);
    try {
      // TODO: Implement actual smart contract redeem call
      // For now, we'll simulate the redemption
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

      const mockTxHash = "0x" + Math.random().toString(16).substring(2);
      setTxHash(mockTxHash);
      setRedeemComplete(true);
    } catch (error) {
      console.error("Error redeeming deposit:", error);
      alert("Error redeeming deposit. Please try again.");
      setIsRedeeming(false);
    }
  };

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
                href={`https://polkadot.subscan.io/extrinsic/${txHash}`}
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
