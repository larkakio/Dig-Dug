// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract DeployCheckIn is Script {
    function run() external {
        vm.startBroadcast();
        CheckIn checkIn = new CheckIn();
        vm.stopBroadcast();
        console.log("CheckIn deployed at:", address(checkIn));
    }
}
