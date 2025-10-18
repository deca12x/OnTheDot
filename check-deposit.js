const { ethers } = require('ethers');

const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const CONTRACT_ADDRESS = "0xd2BF62cCA0b8330c50ee87342C4aAcc3664E4D43";
const USER_ADDRESS = "0xa1D959dB1c4E63b083903aEcF7e52Cb0A3fEb46D";

const EVENT_DEPOSIT_ABI = [
  "event DepositMade(address indexed user, uint256 amount, uint256 timestamp)",
  "event DepositRedeemed(address indexed user, uint256 amount, uint256 timestamp)"
];

async function checkDeposits() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const iface = new ethers.Interface(EVENT_DEPOSIT_ABI);
  
  console.log("\n=== Checking Deposit History for User ===");
  console.log("User:", USER_ADDRESS);
  
  // Get all DepositMade events for this user
  const depositFilter = {
    address: CONTRACT_ADDRESS,
    topics: [
      ethers.id("DepositMade(address,uint256,uint256)"),
      ethers.zeroPadValue(USER_ADDRESS, 32)
    ],
    fromBlock: 0,
    toBlock: 'latest'
  };
  
  const depositLogs = await provider.getLogs(depositFilter);
  console.log("\n=== DepositMade Events ===");
  console.log("Count:", depositLogs.length);
  depositLogs.forEach((log, i) => {
    const parsed = iface.parseLog(log);
    console.log(`\nDeposit ${i}:`);
    console.log("  TX:", log.transactionHash);
    console.log("  User:", parsed.args[0]);
    console.log("  Amount:", ethers.formatEther(parsed.args[1]), "PAS");
    console.log("  Timestamp:", new Date(Number(parsed.args[2]) * 1000).toISOString());
  });
  
  // Get all DepositRedeemed events for this user
  const redeemFilter = {
    address: CONTRACT_ADDRESS,
    topics: [
      ethers.id("DepositRedeemed(address,uint256,uint256)"),
      ethers.zeroPadValue(USER_ADDRESS, 32)
    ],
    fromBlock: 0,
    toBlock: 'latest'
  };
  
  const redeemLogs = await provider.getLogs(redeemFilter);
  console.log("\n=== DepositRedeemed Events ===");
  console.log("Count:", redeemLogs.length);
  redeemLogs.forEach((log, i) => {
    const parsed = iface.parseLog(log);
    console.log(`\nRedeem ${i}:`);
    console.log("  TX:", log.transactionHash);
    console.log("  User:", parsed.args[0]);
    console.log("  Amount:", ethers.formatEther(parsed.args[1]), "PAS");
    console.log("  Timestamp:", new Date(Number(parsed.args[2]) * 1000).toISOString());
  });
}

checkDeposits().catch(console.error);
