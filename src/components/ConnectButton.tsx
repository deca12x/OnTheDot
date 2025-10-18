"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";

const ConnectButton: React.FC = () => {
  const { login, logout, ready, user } = usePrivy();

  if (!ready) {
    return (
      <div className="flex justify-center items-center h-max">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <button
        className="flex items-center justify-center bg-blue-600 py-3 px-10 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
        onClick={!user ? login : logout}
      >
        {!user ? "Connect Wallet" : "Disconnect"}
      </button>
    </div>
  );
};

export default ConnectButton;
