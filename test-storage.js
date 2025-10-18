// Simple test script to verify storage functionality
// Run with: node test-storage.js (after starting the dev server)

const testRegistration = {
  name: "Test User",
  portfolioLink: "https://github.com/testuser",
  hasUsedSubstratePolkadot: true,
  technologiesUsed: {
    ink: false,
    evmSolidity: true,
    polkaVM: false,
    xcm: false,
    polkadotJsApi: true,
  },
  precompilesFamiliarity: 3,
  walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  depositPaid: true,
  depositTxHash:
    "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
};

async function testStorage() {
  const baseUrl = "http://localhost:3000";

  try {
    console.log("Testing storage API...");

    // Test GET (should return empty array initially)
    console.log("\n1. Testing GET /api/storage");
    const getResponse = await fetch(`${baseUrl}/api/storage`);
    const initialData = await getResponse.json();
    console.log("Initial data:", initialData);

    // Test POST (add a registration)
    console.log("\n2. Testing POST /api/storage");
    const postResponse = await fetch(`${baseUrl}/api/storage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testRegistration),
    });
    const postResult = await postResponse.json();
    console.log("POST result:", postResult);

    // Test GET again (should now contain our registration)
    console.log("\n3. Testing GET /api/storage after POST");
    const getResponse2 = await fetch(`${baseUrl}/api/storage`);
    const updatedData = await getResponse2.json();
    console.log("Updated data:", updatedData);

    console.log("\n✅ Storage API test completed successfully!");
  } catch (error) {
    console.error("❌ Error testing storage API:", error);
  }
}

testStorage();
