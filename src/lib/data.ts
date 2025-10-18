import { EventRegistration } from "@/lib/types";

// Storage functions that use the storage.json file via API routes
export const getStoredRegistrations = async (): Promise<
  EventRegistration[]
> => {
  try {
    const response = await fetch("/api/storage");
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return [];
  }
};

export const saveRegistration = async (
  registration: EventRegistration
): Promise<void> => {
  try {
    const response = await fetch("/api/storage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registration),
    });
    if (!response.ok) {
      throw new Error("Failed to save registration");
    }
  } catch (error) {
    console.error("Error saving registration:", error);
    throw error;
  }
};

export const getRegistrationByWallet = async (
  walletAddress: string
): Promise<EventRegistration | null> => {
  const registrations = await getStoredRegistrations();
  return registrations.find((r) => r.walletAddress === walletAddress) || null;
};
