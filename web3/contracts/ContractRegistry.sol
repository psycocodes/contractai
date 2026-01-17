// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract ContractRegistry {
    // Structure strictly matching user requirement
    // Changed contractHash to bytes32 for on-chain efficiency
    struct ContractRecord {
        string contractId;
        string versionId;
        bytes32 contractHash; 
        string normalizationVersion;
        string hashAlgorithm; // "Keccak-256"
        uint256 timestamp;
    }

    // Mapping from contractId => versionId => ContractRecord
    mapping(string => mapping(string => ContractRecord)) public records;

    // Event emitted when a contract hash is registered
    event ContractRegistered(
        string indexed contractId,
        string indexed versionId,
        bytes32 contractHash,
        string normalizationVersion,
        string hashAlgorithm,
        uint256 timestamp
    );

    /**
     * @dev Register a contract version. HASHER IS NOW ON-CHAIN.
     * Takes the full canonical content, hashes it, and stores the hash.
     */
    function registerContract(
        string memory _contractId,
        string memory _versionId,
        string memory _canonicalContent,
        string memory _normalizationVersion,
        string memory _hashAlgorithm
    ) public {
        require(bytes(_contractId).length > 0, "Contract ID cannot be empty");
        require(bytes(_versionId).length > 0, "Version ID cannot be empty");
        require(bytes(_canonicalContent).length > 0, "Content cannot be empty");
        
        // 1. COMPUTE HASH ON-CHAIN
        bytes32 computedHash = keccak256(bytes(_canonicalContent));

        // Prevent overwriting existing version? 
        require(records[_contractId][_versionId].contractHash == bytes32(0), "Version already registered");

        ContractRecord memory newRecord = ContractRecord({
            contractId: _contractId,
            versionId: _versionId,
            contractHash: computedHash,
            normalizationVersion: _normalizationVersion,
            hashAlgorithm: _hashAlgorithm,
            timestamp: block.timestamp
        });

        records[_contractId][_versionId] = newRecord;

        emit ContractRegistered(
            _contractId,
            _versionId,
            computedHash,
            _normalizationVersion,
            _hashAlgorithm,
            block.timestamp
        );
    }

    /**
     * @dev Get the record of a specific contract version
     */
    function getRecord(string memory _contractId, string memory _versionId) public view returns (ContractRecord memory) {
        return records[_contractId][_versionId];
    }

    /**
     * @dev Get just the hash directly (helper)
     */
    function getHash(string memory _contractId, string memory _versionId) public view returns (bytes32) {
        return records[_contractId][_versionId].contractHash;
    }

    /**
     * @dev Verify if a submitted content matches the stored hash
     */
    function verifyContent(
        string memory _contractId, 
        string memory _versionId, 
        string memory _canonicalContent
    ) public view returns (bool) {
        bytes32 storedHash = records[_contractId][_versionId].contractHash;
        if (storedHash == bytes32(0)) return false;

        bytes32 submittedHash = keccak256(bytes(_canonicalContent));
        return storedHash == submittedHash;
    }
}
