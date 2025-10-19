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
        className={`relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${
          !user
            ? "w-64 h-13 md:w-80 md:h-17 lg:w-96 lg:h-21"
            : "w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
        }`}
        onClick={!user ? login : logout}
      >
        {/* Custom Background Image */}
        <img
          src={!user ? "/DOT_Background SIGN IN .svg" : "/Magenta2.png"}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={
            !user
              ? {
                  // MANUAL ADJUSTMENT CONTROLS for Sign In SVG:
                  transform: "scale(2.5) translate(0px, 10px)", // scale(zoom) translate(x, y)
                  transformOrigin: "center center", // 'top left', 'center center', 'bottom right', etc.
                  filter: "brightness(1) contrast(1)", // Adjust brightness/contrast if needed
                }
              : {
                  filter: "brightness(1) contrast(1)",
                }
          }
        />

        {/* Text Overlay - only show for sign in */}
        {!user && (
          <span className="relative z-10 text-white font-semibold text-lg md:text-xl drop-shadow-lg">
            {/* Empty for sign in SVG */}
          </span>
        )}
      </button>
    </div>
  );
};

export default ConnectButton;
