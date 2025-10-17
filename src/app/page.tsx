"use client";

import { useUser } from "@civic/auth-web3/react";
import { clans } from "@/lib/data";
import ConnectButton from "@/components/ConnectButton";

export default function Home() {
  const { user, isLoading } = useUser();

  // Show loading state while Civic Auth initializes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              Welcome to Civic Auth Webapp
            </div>
            <div className="text-lg text-gray-600">
              Please sign in to continue
            </div>
          </div>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center">
      <div className="text-2xl font-bold">
        Welcome to your Civic Auth Webapp
      </div>
      <div className="text-lg">Hello {user.name || user.email}!</div>

      {/* Clan buttons */}
      <div className="flex flex-col gap-2">
        {clans.map((clan) => (
          <a
            key={clan.id}
            href={`/clans/${clan.id}`}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {clan.name}
          </a>
        ))}
      </div>

      <ConnectButton />
    </div>
  );
}
