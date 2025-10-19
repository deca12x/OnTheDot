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
        className="relative overflow-hidden w-64 h-13 md:w-80 md:h-17 lg:w-96 lg:h-21 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={!user ? login : logout}
      >
        {/* Custom SVG Background */}
        <img
          src="/DOT_Background SIGN IN .svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            // MANUAL ADJUSTMENT CONTROLS:
            transform: "scale(2.5) translate(0px, 10px)", // scale(zoom) translate(x, y)
            transformOrigin: "center center", // 'top left', 'center center', 'bottom right', etc.
            filter: "brightness(1) contrast(1)", // Adjust brightness/contrast if needed
          }}
        />

        {/* Text Overlay (if needed) */}
        <span className="relative z-10 text-white font-semibold text-lg md:text-xl drop-shadow-lg">
          {!user ? "" : "Disconnect"}{" "}
          {/* Empty for sign in, show text for disconnect */}
        </span>
      </button>
    </div>
  );
};

export default ConnectButton;
