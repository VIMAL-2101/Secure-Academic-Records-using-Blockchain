// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditLog {

    struct LogEntry {
        string logHash;
        string ruleId;
    }

    mapping(string => LogEntry) public logs;

    function storeLog(
        string memory txId,
        string memory logHash,
        string memory ruleId
    ) public {

        logs[txId] = LogEntry(logHash, ruleId);
    }

    function getLog(string memory txId) public view returns (string memory) {
        return logs[txId].logHash;
    }
}
