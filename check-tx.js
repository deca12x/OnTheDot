const { ethers } = require('ethers');

const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const TX_HASH = "0xaebfcaae0d21feb37008cac3213cd67d9bf8c729a59df2ce8d22de0e277caddc";

async function checkTransaction() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log("\n=== Transaction Details ===");
  console.log("TX Hash:", TX_HASH);
  
  const tx = await provider.getTransaction(TX_HASH);
  console.log("\nFrom:", tx.from);
  console.log("To:", tx.to);
  console.log("Value:", ethers.formatEther(tx.value), "PAS");
  console.log("Data:", tx.data);
  
  const receipt = await provider.getTransactionReceipt(TX_HASH);
  console.log("\nStatus:", receipt.status === 1 ? "Success" : "Failed");
  console.log("Logs Count:", receipt.logs.length);
  
  // Parse logs
  const iface = new ethers.Interface([
    "event DepositRedeemed(address indexed user, uint256 amount, uint256 timestamp)",
    "event AdminWithdrawal(address indexed admin, uint256 amount, uint256 timestamp)"
  ]);
  
  console.log("\n=== Events ===");
  receipt.logs.forEach((log, index) => {
    try {
      const parsed = iface.parseLog(log);
      console.log(`\nEvent ${index}:`, parsed.name);
      console.log("Args:", parsed.args);
    } catch (e) {
      console.log(`\nEvent ${index}: Could not parse (${log.topics[0]})`);
    }
  });
}

checkTransaction().catch(console.error);
