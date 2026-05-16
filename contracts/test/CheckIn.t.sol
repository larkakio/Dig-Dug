// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn checkIn;

    function setUp() public {
        checkIn = new CheckIn();
    }

    function test_checkIn_zeroValue() public {
        checkIn.checkIn();
        assertEq(checkIn.lastCheckInDay(address(this)), (block.timestamp / 1 days) + 1);
        assertEq(checkIn.streak(address(this)), 1);
    }

    function test_checkIn_revertsWithEth() public {
        vm.expectRevert("CheckIn: no ETH");
        checkIn.checkIn{value: 1 wei}();
    }

    function test_checkIn_twiceSameDay_reverts() public {
        checkIn.checkIn();
        vm.expectRevert("CheckIn: already today");
        checkIn.checkIn();
    }

    function test_canCheckIn() public {
        assertTrue(checkIn.canCheckIn(address(this)));
        checkIn.checkIn();
        assertFalse(checkIn.canCheckIn(address(this)));
    }

    function test_streak_consecutiveDays() public {
        checkIn.checkIn();
        vm.warp(block.timestamp + 1 days);
        checkIn.checkIn();
        assertEq(checkIn.streak(address(this)), 2);
    }
}
