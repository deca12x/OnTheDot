"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@civic/auth-web3/react";
import { clans } from "@/lib/data";
import { use } from "react";

interface ClanPageProps {
  params: Promise<{
    clanId: string;
  }>;
}

export default function ClanPage({ params }: ClanPageProps) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const resolvedParams = use(params);
  const clan = clans.find((c) => c.id === resolvedParams.clanId);

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
        <div className="flex flex-col items-center gap-4">
          <div className="text-lg">Please log in to access clan pages</div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Clan not found</h1>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to {clan.name}</h1>
      <p className="text-gray-600 mb-8">Clan ID: {clan.id}</p>
      <p className="text-gray-600 mb-8">
        Logged in as: {user.name || user.email}
      </p>
      <button
        onClick={() => router.push("/")}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
