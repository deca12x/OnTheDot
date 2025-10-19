const { ethers } = require('ethers');

const CONTRACT_ADDRESS = "0x105eEc6d6f673FD8e0493efc0E599101D524aB07";
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";

const EVENT_DEPOSIT_ABI = [
  "function deposit() external payable",
  "function redeem() external",
  "function hasDeposited(address _user) external view returns (bool)",
  "function admin() external view returns (address)",
  "function DEPOSIT_AMOUNT() external view returns (uint256)",
  "function REDEMPTION_DEADLINE() external view returns (uint256)",
  "function depositors(uint256) external view returns (address)",
];

async function checkContract() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, EVENT_DEPOSIT_ABI, provider);

  console.log("\n=== Contract State ===");
  console.log("Contract Address:", CONTRACT_ADDRESS);

  // Get contract balance
  const balance = await provider.getBalance(CONTRACT_ADDRESS);
  console.log("Contract Balance:", ethers.formatEther(balance), "PAS");

  // Get admin
  const admin = await contract.admin();
  console.log("Admin:", admin);

  // Get deposit amount
  const depositAmount = await contract.DEPOSIT_AMOUNT();
  console.log("Deposit Amount:", ethers.formatEther(depositAmount), "PAS");

  // Get redemption deadline
  const deadline = await contract.REDEMPTION_DEADLINE();
  const deadlineDate = new Date(Number(deadline) * 1000);
  const now = new Date();
  console.log("Redemption Deadline:", deadlineDate.toISOString());
  console.log("Current Time:", now.toISOString());
  console.log("Before Deadline?", now < deadlineDate);

  // Check specific user
  const userAddress = "0xa1D959dB1c4E63b083903aEcF7e52Cb0A3fEb46D";
  const hasDeposited = await contract.hasDeposited(userAddress);
  console.log("\nUser:", userAddress);
  console.log("Has Deposited?", hasDeposited);

  // Get user balance
  const userBalance = await provider.getBalance(userAddress);
  console.log("User Balance:", ethers.formatEther(userBalance), "PAS");
}

checkContract().catch(console.error);
