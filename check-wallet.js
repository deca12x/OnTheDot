const { ethers } = require('ethers');

const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const USER_ADDRESS = "0xa1D959dB1c4E63b083903aEcF7e52Cb0A3fEb46D";

async function checkWallet() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  const code = await provider.getCode(USER_ADDRESS);
  console.log("\nWallet Address:", USER_ADDRESS);
  console.log("Is Contract:", code !== '0x');
  console.log("Code length:", code.length);
  
  if (code !== '0x') {
    console.log("\n⚠️  This is a smart contract wallet!");
    console.log("Contract code:", code.substring(0, 100) + "...");
  } else {
    console.log("\n✅ This is an EOA (Externally Owned Account)");
  }
}

checkWallet().catch(console.error);
