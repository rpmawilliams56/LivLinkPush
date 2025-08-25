// sendtoken.js
require('dotenv').config();
const { ethers } = require('ethers');

// ============ ⚙️ CONFIG ============
const provider = new ethers.providers.JsonRpcProvider(process.env.AMOY_RPC); // Your RPC URL
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const tokenContractAddress = process.env.TOKEN_CONTRACT;
const tokenDecimals = 18;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not defined in environment variables.");
}


// Minimal ERC-20 ABI (just transfer)
const abi = [
  "function transfer(address to, uint amount) public returns (bool)"
];

const contract = new ethers.Contract(tokenContractAddress, abi, wallet);

// ============ 🚀 FUNCTION ============
async function sendToken(toAddress, amount) {
  try {
    const formattedAmount = ethers.utils.parseUnits(amount.toString(), tokenDecimals);
    console.log(`Sending ${amount} LLNK to ${toAddress}...`);
    const tx = await contract.transfer(toAddress, formattedAmount);
    console.log("Tx sent. Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Confirmed:", receipt.transactionHash);
    return {
      success: true,
      hash: receipt.transactionHash
    };
  } catch (err) {
    console.error("❌ Token send error:", err);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { sendToken };
