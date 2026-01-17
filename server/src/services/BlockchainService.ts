import { ethers } from 'ethers';
import { logger, AppError } from '../utils';
import ContractRegistryABI from '../contracts/ContractRegistryABI.json';

// REAL BLOCKCHAIN SERVICE WITH ON-CHAIN HASHING
export class BlockchainService {
  private static provider: ethers.JsonRpcProvider;
  private static wallet: ethers.Wallet;
  private static contract: ethers.Contract;
  private static isInitialized = false;

  private static initialize() {
    if (this.isInitialized) return;

    const rpcUrl = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'; // Public Sepolia RPC fallback
    const privateKey = process.env.PRIVATE_KEY || process.env.SEPOLIA_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat Account 0
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
        logger.warn('Contract Address missing in .env. Service will fail.');
        return;
    }

    try {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers.Contract(contractAddress, ContractRegistryABI, this.wallet);
        this.isInitialized = true;
        logger.info(`Blockchain Service Initialized. Connected to ${contractAddress}`);
    } catch (error) {
        logger.error('Failed to initialize blockchain service:', error);
    }
  }

  /**
   * Registers a contract with ON-CHAIN HASHING.
   * Sends the canonical content to the blockchain, which hashes and stores it.
   */
  static async registerContract(
    contractId: string,
    versionId: string,
    canonicalContent: string,
    normalizationVersion: string = "1.0",
    hashAlgorithm: string = "Keccak-256"
  ): Promise<string> {
    this.initialize();
    if (!this.isInitialized) {
        throw new AppError('Blockchain service not configured', 500);
    }

    try {
        // NOTE: Sending full content is expensive!
        const tx = await this.contract.registerContract(
            contractId, 
            versionId, 
            canonicalContent, 
            normalizationVersion, 
            hashAlgorithm
        );
        logger.info(`Transaction sent: ${tx.hash}`);
        await tx.wait(); 
        logger.info(`Transaction confirmed: ${tx.hash}`);
        return tx.hash;
    } catch (error) {
        logger.error('Blockchain registration failed:', error);
        throw new AppError('Failed to register contract on-chain', 500);
    }
  }

  /**
   * Retrieves the stored hash from the blockchain (bytes32)
   */
  static async getHash(
    contractId: string,
    versionId: string
  ): Promise<string | null> {
    this.initialize();
    if (!this.isInitialized) {
        logger.warn('Blockchain service not configured properly for read.');
        return null;
    }

    try {
        const hash = await this.contract.getHash(contractId, versionId);
        // bytes32(0) check
        if (!hash || hash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
             return null;
        }
        return hash;
    } catch (error) {
        logger.error('Blockchain fetch failed:', error);
        return null;
    }
  }

  /**
   * Verifies content directly against the smart contract
   */
  static async verifyContent(
    contractId: string,
    versionId: string,
    canonicalContent: string
  ): Promise<boolean> {
      this.initialize();
      if (!this.isInitialized) return false;

      try {
          return await this.contract.verifyContent(contractId, versionId, canonicalContent);
      } catch (error) {
          logger.error('Blockchain verification failed:', error);
          return false;
      }
  }
}
