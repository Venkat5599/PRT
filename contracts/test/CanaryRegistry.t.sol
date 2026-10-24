// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CanaryRegistry} from "../src/CanaryRegistry.sol";

interface Vm {
    function expectRevert(bytes calldata) external;
    function prank(address) external;
    function warp(uint256) external;
}

contract CanaryRegistryTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    CanaryRegistry reg;

    bytes32 constant R1 = keccak256("report-1");
    bytes32 constant R2 = keccak256("report-2");
    bytes32 constant WASM = keccak256("candidate.wasm");

    function setUp() public {
        reg = new CanaryRegistry();
    }

    function testAttestStoresEverything() public {
        vm.warp(1_792_000_000);
        vm.prank(address(0xBEEF));
        uint256 id = reg.attest(R1, WASM, 1002, 1006, 1, 0, 0, 0);
        require(id == 0 && reg.count() == 1, "id/count");
        CanaryRegistry.Attestation memory a = reg.get(0);
        require(a.reportHash == R1 && a.candidate == WASM, "hashes");
        require(a.baselineSpec == 1002 && a.candidateSpec == 1006, "specs");
        require(a.regressions == 1 && a.passes == 0, "counts");
        require(a.attester == address(0xBEEF) && a.timestamp == 1_792_000_000, "who/when");
        (bool found, uint256 rid) = reg.forReport(R1);
        require(found && rid == 0, "forReport");
    }

    function testSameReportTwiceReverts() public {
        reg.attest(R1, WASM, 1, 2, 0, 0, 0, 4);
        vm.expectRevert(abi.encodeWithSelector(CanaryRegistry.AlreadyAttested.selector, R1, uint256(0)));
        reg.attest(R1, WASM, 1, 2, 0, 0, 0, 4);
    }

    function testEmptyReportReverts() public {
        vm.expectRevert(abi.encodeWithSelector(CanaryRegistry.EmptyReport.selector));
        reg.attest(bytes32(0), WASM, 1, 2, 0, 0, 0, 4);
    }

    function testCleanNeedsAttestationsAndNoRegressions() public {
        require(!reg.clean(WASM), "unknown runtime is not clean");
        reg.attest(R1, WASM, 1, 2, 0, 3, 0, 4);
        require(reg.clean(WASM), "differences alone are clean");
        reg.attest(R2, WASM, 1, 2, 1, 0, 0, 3);
        require(!reg.clean(WASM), "one regression taints it");
        uint256[] memory ids = reg.forCandidate(WASM);
        require(ids.length == 2 && ids[1] == 1, "forCandidate");
        require(reg.all().length == 2, "all");
    }
}
