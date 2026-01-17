import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ContractRegistry...");

  const contractRegistry = await ethers.deployContract("ContractRegistry");

  await contractRegistry.waitForDeployment();

  const address = await contractRegistry.getAddress();

  console.log(`ContractRegistry deployed to: ${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
