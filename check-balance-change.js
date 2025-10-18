const { ethers } = require('ethers');

const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const USER_ADDRESS = "0xa1D959dB1c4E63b083903aEcF7e52Cb0A3fEb46D";

async function checkBalanceChange() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Get redeem transaction
  const redeemTx = await provider.getTransaction("0xaebfcaae0d21feb37008cac3213cd67d9bf8c729a59df2ce8d22de0e277caddc");
  const redeemReceipt = await provider.getTransactionReceipt("0xaebfcaae0d21feb37008cac3213cd67d9bf8c729a59df2ce8d22de0e277caddc");
  
  console.log("\n=== Redeem Transaction ===");
  console.log("Block Number:", redeemReceipt.blockNumber);
  console.log("Gas Used:", ethers.formatEther(redeemReceipt.gasUsed * redeemTx.gasPrice), "PAS");
  
  // Get balance at block before redeem
  const balanceBefore = await provider.getBalance(USER_ADDRESS, redeemReceipt.blockNumber - 1);
  console.log("\n=== User Balance ===");
  console.log("Before (block", redeemReceipt.blockNumber - 1 + "):", ethers.formatEther(balanceBefore), "PAS");
  
  // Get balance at block after redeem
  const balanceAfter = await provider.getBalance(USER_ADDRESS, redeemReceipt.blockNumber);
  console.log("After  (block", redeemReceipt.blockNumber + "):", ethers.formatEther(balanceAfter), "PAS");
  
  const change = balanceAfter - balanceBefore;
  const gasCost = redeemReceipt.gasUsed * redeemTx.gasPrice;
  const netChange = change + gasCost;
  
  console.log("\nBalance Change:", ethers.formatEther(change), "PAS");
  console.log("Gas Cost:", ethers.formatEther(gasCost), "PAS");
  console.log("Net Change (excluding gas):", ethers.formatEther(netChange), "PAS");
  
  if (netChange > 0n) {
    console.log("\n✅ User RECEIVED:", ethers.formatEther(netChange), "PAS");
  } else {
    console.log("\n❌ User DID NOT receive PAS back!");
  }
}

checkBalanceChange().catch(console.error);
