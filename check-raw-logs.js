const { ethers } = require('ethers');

const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const TX_HASH = "0xaebfcaae0d21feb37008cac3213cd67d9bf8c729a59df2ce8d22de0e277caddc";

async function checkRawLogs() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  const receipt = await provider.getTransactionReceipt(TX_HASH);
  
  console.log("\n=== Raw Transaction Receipt ===");
  console.log("Status:", receipt.status);
  console.log("Logs Count:", receipt.logs.length);
  console.log("\n=== All Logs ===");
  
  receipt.logs.forEach((log, i) => {
    console.log(`\nLog ${i}:`);
    console.log("  Address:", log.address);
    console.log("  Topics:", log.topics);
    console.log("  Data:", log.data);
    console.log("  Log Index:", log.index);
  });
}

checkRawLogs().catch(console.error);
