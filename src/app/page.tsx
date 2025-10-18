"use client";

import { useUser } from "@civic/auth-web3/react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getRegistrationByWallet, saveRegistration } from "@/lib/data";
import { EventRegistration } from "@/lib/types";
import ConnectButton from "@/components/ConnectButton";

export default function Home() {
  const { user, isLoading } = useUser();
  const { address: walletAddress, isConnected } = useAccount();
  const [existingRegistration, setExistingRegistration] =
    useState<EventRegistration | null>(null);
  const [formData, setFormData] = useState({
    name: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for existing registration when user is loaded
  useEffect(() => {
    if (walletAddress) {
      getRegistrationByWallet(walletAddress).then(setExistingRegistration);
    }
  }, [walletAddress]);

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
              ETHRome 2025 Event Registration
            </div>
            <div className="text-lg text-gray-600">
              Please sign in to register for the event
            </div>
          </div>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // User is authenticated and has already registered - show confirmation
  if (existingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-800 mb-4">
            Registration Complete! ✅
          </div>
          <div className="text-lg text-green-700 mb-6">
            Tap chip at the venue to redeem deposit
          </div>
          <div className="text-sm text-green-600 mb-4">
            Your 1 PAS deposit is secured on the blockchain
          </div>
          {existingRegistration.depositTxHash && (
            <div className="bg-white p-3 rounded border mb-4">
              <p className="text-xs text-gray-600 mb-1">Transaction Hash:</p>
              <a
                href={`https://blockscout-passet-hub.parity-testnet.parity.io/tx/${existingRegistration.depositTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-mono break-all"
              >
                {existingRegistration.depositTxHash}
              </a>
            </div>
          )}
          <div className="flex items-center justify-center">
            <div className="text-6xl">📱</div>
            <div className="mx-4 text-2xl">→</div>
            <div className="text-6xl">🏷️</div>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            Registered as: {existingRegistration.name}
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated but hasn't registered - show form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;

    setIsSubmitting(true);
    try {
      // Import contract functions
      const { makeDeposit } = await import("@/lib/contract");

      // Make the deposit on-chain
      const depositResult = await makeDeposit();

      if (!depositResult.success) {
        throw new Error("Deposit transaction failed");
      }

      // Only save to storage.json after successful deposit
      const registration: EventRegistration = {
        ...formData,
        walletAddress: walletAddress,
        depositPaid: true,
        depositTxHash: depositResult.txHash,
      };

      await saveRegistration(registration);
      setExistingRegistration(registration);
    } catch (error) {
      console.error("Error submitting registration:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error submitting registration. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTechnologyChange = (
    tech: keyof typeof formData.technologiesUsed
  ) => {
    setFormData((prev) => ({
      ...prev,
      technologiesUsed: {
        ...prev.technologiesUsed,
        [tech]: !prev.technologiesUsed[tech],
      },
    }));
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold mb-2">
              ETHRome 2025 Event Registration
            </h1>
            <p className="text-gray-600">
              Complete your registration and pay 1 PAS deposit
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Connected as: {user.name || user.email}
            </p>
          </div>
          <div className="flex-shrink-0">
            <ConnectButton />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-lg shadow-lg"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
            />
          </div>

          {/* Portfolio Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub / GitLab / Dev Portfolio Link *
            </label>
            <input
              type="url"
              required
              value={formData.portfolioLink}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  portfolioLink: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/yourusername"
            />
          </div>

          {/* Substrate/Polkadot Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have you used Substrate or Polkadot before? *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasUsedSubstratePolkadot"
                  checked={formData.hasUsedSubstratePolkadot === true}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      hasUsedSubstratePolkadot: true,
                    }))
                  }
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasUsedSubstratePolkadot"
                  checked={formData.hasUsedSubstratePolkadot === false}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      hasUsedSubstratePolkadot: false,
                    }))
                  }
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* Technologies Used */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which of these have you used? (Select all that apply)
            </label>
            <div className="space-y-2">
              {Object.entries(formData.technologiesUsed).map(
                ([tech, checked]) => (
                  <label key={tech} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        handleTechnologyChange(
                          tech as keyof typeof formData.technologiesUsed
                        )
                      }
                      className="mr-2"
                    />
                    {tech === "evmSolidity"
                      ? "EVM / Solidity"
                      : tech === "polkadotJsApi"
                      ? "Polkadot.js API"
                      : tech
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                  </label>
                )
              )}
            </div>
          </div>

          {/* Precompiles Familiarity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How familiar are you with precompiles on Polkadot? (1-5 scale) *
            </label>
            <select
              value={formData.precompilesFamiliarity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  precompilesFamiliarity: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 - Not familiar at all</option>
              <option value={2}>2 - Slightly familiar</option>
              <option value={3}>3 - Moderately familiar</option>
              <option value={4}>4 - Very familiar</option>
              <option value={5}>5 - Expert level</option>
            </select>
          </div>

          {/* Deposit Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">
              Deposit Information
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              A 1 DOT deposit will be required to complete registration. This
              deposit will be returned when you attend the event.
            </p>
            <p className="text-xs text-blue-600">
              Your wallet: {walletAddress}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting
              ? "Processing Deposit..."
              : "Complete Registration & Pay 1 PAS Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
}
