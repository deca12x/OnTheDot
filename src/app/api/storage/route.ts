import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { EventRegistration } from "@/lib/types";

const STORAGE_FILE = path.join(process.cwd(), "storage.json");

// GET - Read all registrations from storage.json
export async function GET() {
  try {
    const fileContent = await fs.readFile(STORAGE_FILE, "utf-8");
    const registrations: EventRegistration[] = JSON.parse(fileContent);
    return NextResponse.json(registrations);
  } catch {
    // If file doesn't exist or is empty, return empty array
    console.log("Storage file not found or empty, returning empty array");
    return NextResponse.json([]);
  }
}

// POST - Add a new registration to storage.json
export async function POST(request: NextRequest) {
  try {
    const newRegistration: EventRegistration = await request.json();

    // Read existing registrations
    let registrations: EventRegistration[] = [];
    try {
      const fileContent = await fs.readFile(STORAGE_FILE, "utf-8");
      registrations = JSON.parse(fileContent);
    } catch {
      // File doesn't exist yet, start with empty array
      registrations = [];
    }

    // Remove any existing registration for this wallet address
    registrations = registrations.filter(
      (r) => r.walletAddress !== newRegistration.walletAddress
    );

    // Add the new registration
    registrations.push(newRegistration);

    // Write back to file
    await fs.writeFile(STORAGE_FILE, JSON.stringify(registrations, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving registration:", error);
    return NextResponse.json(
      { error: "Failed to save registration" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a registration from storage.json
export async function DELETE(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Read existing registrations
    let registrations: EventRegistration[] = [];
    try {
      const fileContent = await fs.readFile(STORAGE_FILE, "utf-8");
      registrations = JSON.parse(fileContent);
    } catch {
      // File doesn't exist, nothing to delete
      return NextResponse.json({ success: true });
    }

    // Remove the registration for this wallet address
    registrations = registrations.filter(
      (r) => r.walletAddress !== walletAddress
    );

    // Write back to file
    await fs.writeFile(STORAGE_FILE, JSON.stringify(registrations, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { error: "Failed to delete registration" },
      { status: 500 }
    );
  }
}
