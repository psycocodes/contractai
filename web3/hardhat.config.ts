import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    hardhat: {},
    sepolia: {
       url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org", // Default or env
       accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
    }
  }
};

export default config;
