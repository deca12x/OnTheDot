"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { getRegistrationByWallet, saveRegistration } from "@/lib/data";
import { EventRegistration } from "@/lib/types";
import ConnectButton from "@/components/ConnectButton";
import { ethers } from "ethers";

export default function Home() {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0]; // Get the first connected wallet
  const walletAddress = wallet?.address;
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
  const [pasBalance, setPasBalance] = useState<string>("0.0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Function to fetch PAS balance
  const fetchPasBalance = async (address: string) => {
    setIsLoadingBalance(true);
    try {
      // Connect to the Passet Hub testnet
      const provider = new ethers.JsonRpcProvider(
        "https://testnet-passet-hub-eth-rpc.polkadot.io"
      );
      const balance = await provider.getBalance(address);
      const balanceInPas = ethers.formatEther(balance);
      setPasBalance(parseFloat(balanceInPas).toFixed(4));
    } catch (error) {
      console.error("Error fetching PAS balance:", error);
      setPasBalance("Error");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Check for existing registration and fetch balance when user is loaded
  useEffect(() => {
    if (walletAddress) {
      getRegistrationByWallet(walletAddress).then(setExistingRegistration);
      fetchPasBalance(walletAddress);
    }
  }, [walletAddress]);

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
              On The Dot
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

  // User is authenticated and has already registered - show confirmation
  if (existingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        {/* ConnectButton in top right corner */}
        <div className="absolute top-6 right-9 z-20">
          <ConnectButton />
        </div>

        <div className="max-w-md mx-auto text-center p-6 md:p-8">
          {existingRegistration.depositTxHash && (
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-lg border border-white/20 mb-4">
              <div className="text-2xl font-bold text-white mb-4 font-pacifico text-center">
                Registration Complete!
              </div>
              <div className="flex items-center gap-4 justify-center">
                <p className="text-sm font-medium text-white/90">
                  Transaction:
                </p>
                <a
                  href={`https://blockscout-passet-hub.parity-testnet.parity.io/tx/${existingRegistration.depositTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/70 font-mono hover:text-white/90 transition-colors duration-200 underline"
                >
                  {existingRegistration.depositTxHash
                    ? `${existingRegistration.depositTxHash.slice(
                        0,
                        5
                      )}...${existingRegistration.depositTxHash.slice(-5)}`
                    : ""}
                </a>
              </div>
            </div>
          )}

          {/* ARM SVG below transaction */}
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

          <div className="text-lg text-white/90 mb-2">
            Tap the NFC sticker at the venue
          </div>
          <div className="text-sm text-white/70 mb-4">
            to redeem your 1 PAS deposit
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
      console.log("🚀 [Page] Starting deposit");
      console.log("🚀 [Page] Wallet address:", walletAddress);
      console.log("🚀 [Page] Wallet:", wallet);

      if (!wallet) {
        throw new Error(
          "Wallet not available. Please ensure you're logged in with Privy."
        );
      }

      // Get the wallet provider from Privy
      const provider = await wallet.getEthereumProvider();
      console.log("🚀 [Page] Got wallet provider:", !!provider);

      if (!provider) {
        throw new Error("Could not get wallet provider from Privy");
      }

      // Import contract functions
      const { makeDeposit } = await import("@/lib/contract");

      // Make the deposit on-chain using Privy's embedded wallet
      const depositResult = await makeDeposit(provider);

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
        error instanceof Error
          ? error.message
          : "Error submitting registration. Please try again.";
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
    <div className="min-h-screen py-6 md:py-8 px-4 content-overlay relative">
      {/* ConnectButton in top right corner */}
      <div className="absolute top-6 right-9 z-20">
        <ConnectButton />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6 md:mb-8 mt-2">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white font-pacifico">
              Polkadot Workshop
            </h1>
            <p className="text-gray-200 text-base md:text-lg mt-4">
              Complete your registration and pay 1 PAS deposit.
            </p>
            <p className="text-gray-200 text-base md:text-lg">
              Redeem the deposit when you attend the event.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 backdrop-blur-md bg-white/10 border border-white/20 p-6 md:p-8 rounded-xl shadow-2xl"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 backdrop-blur-sm"
              placeholder="Your full name"
            />
          </div>

          {/* Portfolio Link */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
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
              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 backdrop-blur-sm"
              placeholder="https://github.com/yourusername"
            />
          </div>

          {/* Substrate/Polkadot Experience */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Have you used Substrate or Polkadot before? *
            </label>
            <div className="space-y-2">
              <label className="flex items-center text-white/80">
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
              <label className="flex items-center text-white/80">
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
            <label className="block text-sm font-medium text-white/90 mb-2">
              Which of these have you used? (Select all that apply)
            </label>
            <div className="space-y-2">
              {Object.entries(formData.technologiesUsed).map(
                ([tech, checked]) => (
                  <label key={tech} className="flex items-center text-white/80">
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
            <label className="block text-sm font-medium text-white/90 mb-2">
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
              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white backdrop-blur-sm"
            >
              <option key={1} value={1}>
                1 - Not familiar at all
              </option>
              <option key={2} value={2}>
                2 - Slightly familiar
              </option>
              <option key={3} value={3}>
                3 - Moderately familiar
              </option>
              <option key={4} value={4}>
                4 - Very familiar
              </option>
              <option key={5} value={5}>
                5 - Expert level
              </option>
            </select>
          </div>

          {/* Wallet and Funds Information */}
          <div className="backdrop-blur-sm bg-white/5 p-4 rounded-lg border border-white/20">
            <div className="space-y-3">
              {/* Your Wallet */}
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-white/90">
                  Your Wallet:
                </p>
                <a
                  href={`https://blockscout-passet-hub.parity-testnet.parity.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/70 font-mono hover:text-white/90 transition-colors duration-200 underline"
                >
                  {walletAddress
                    ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(
                        -5
                      )}`
                    : ""}
                </a>
              </div>

              {/* Your Balance */}
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-white/90">
                  Your Balance:
                </p>
                <p className="text-sm text-white/80 font-mono">
                  {isLoadingBalance ? "Loading..." : `${pasBalance} PAS`}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full backdrop-blur-md bg-white/10 border border-white/40 py-3 px-4 rounded-md hover:bg-white/40 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
            style={{ color: "#FFB0CB" }}
          >
            {isSubmitting
              ? "Processing Deposit..."
              : "Submit & Pay 1 PAS Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
}
