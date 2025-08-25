require('dotenv').config();
const { ethers } = require('ethers');
const abi = require('./abi.json'); // Make sure ABI is accurate

const TOKEN_CONTRACT = process.env.TOKEN_CONTRACT;
const AMOY_RPC = process.env.AMOY_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!TOKEN_CONTRACT || !AMOY_RPC || !PRIVATE_KEY) {
  throw new Error("❌ Missing environment variables (TOKEN_CONTRACT, AMOY_RPC, PRIVATE_KEY)");
}

const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(TOKEN_CONTRACT, abi, wallet);

/**
 * Sends tokens to a wallet address.
 * @param {string} to - Recipient wallet address.
 * @param {number|string} amount - Amount of tokens to send (in human-readable units).
 * @returns {Promise<{ success: boolean, hash?: string, error?: string }>}
 */
async function sendToken(to, amount) {
  try {
    const decimals = await contract.decimals(); // Dynamically fetch token decimals
    const value = ethers.parseUnits(amount.toString(), decimals);

    const tx = await contract.transfer(to, value);
    console.log("📤 Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Tokens transferred successfully.");

    return { success: true, hash: tx.hash };
  } catch (err) {
    console.error("❌ Transfer failed:", err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

module.exports = { sendToken };

