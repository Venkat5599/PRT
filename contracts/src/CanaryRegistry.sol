// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CanaryRegistry
/// @notice Public record of Portal Canary verdicts. Each attestation pins a report
///         (by its sha256) to the runtime it judged and the verdict counts in it, so
///         anyone can check a runtime upgrade's test result before it ships.
/// @dev Append-only. Nothing can be edited or deleted, by anyone, including the attester.
contract CanaryRegistry {
    struct Attestation {
        bytes32 reportHash; // sha256 of report.json
        bytes32 candidate; // sha256 of the candidate runtime (wasm, or metadata when no wasm)
        uint32 baselineSpec;
        uint32 candidateSpec;
        uint16 regressions;
        uint16 differences;
        uint16 inconclusive;
        uint16 passes;
        address attester;
        uint64 timestamp;
    }

    Attestation[] private _all;
    mapping(bytes32 => uint256[]) private _byCandidate;
    mapping(bytes32 => uint256) private _byReport; // id + 1, 0 = none

    event Attested(
        uint256 indexed id, bytes32 indexed reportHash, bytes32 indexed candidate, address attester, uint16 regressions
    );

    error AlreadyAttested(bytes32 reportHash, uint256 id);
    error EmptyReport();

    function attest(
        bytes32 reportHash,
        bytes32 candidate,
        uint32 baselineSpec,
        uint32 candidateSpec,
        uint16 regressions,
        uint16 differences,
        uint16 inconclusive,
        uint16 passes
    ) external returns (uint256 id) {
        if (reportHash == bytes32(0)) revert EmptyReport();
        uint256 seen = _byReport[reportHash];
        if (seen != 0) revert AlreadyAttested(reportHash, seen - 1);

        id = _all.length;
        _all.push(
            Attestation(
                reportHash,
                candidate,
                baselineSpec,
                candidateSpec,
                regressions,
                differences,
                inconclusive,
                passes,
                msg.sender,
                uint64(block.timestamp)
            )
        );
        _byCandidate[candidate].push(id);
        _byReport[reportHash] = id + 1;
        emit Attested(id, reportHash, candidate, msg.sender, regressions);
    }

    function count() external view returns (uint256) {
        return _all.length;
    }

    function get(uint256 id) external view returns (Attestation memory) {
        return _all[id];
    }

    /// @notice Every attestation, oldest first. Fine for a registry this size; page with `get` beyond that.
    function all() external view returns (Attestation[] memory) {
        return _all;
    }

    function forCandidate(bytes32 candidate) external view returns (uint256[] memory) {
        return _byCandidate[candidate];
    }

    /// @return found whether this report was attested, and its id when it was.
    function forReport(bytes32 reportHash) external view returns (bool found, uint256 id) {
        uint256 v = _byReport[reportHash];
        return (v != 0, v == 0 ? 0 : v - 1);
    }

    /// @notice True when no attested report for this runtime found a regression.
    function clean(bytes32 candidate) external view returns (bool) {
        uint256[] storage ids = _byCandidate[candidate];
        if (ids.length == 0) return false;
        for (uint256 i; i < ids.length; i++) {
            if (_all[ids[i]].regressions != 0) return false;
        }
        return true;
    }
}
