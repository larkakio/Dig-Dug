// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CheckIn {
    event CheckedIn(address indexed user, uint256 day, uint256 streak);

    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    function _today() internal view returns (uint256) {
        return (block.timestamp / 1 days) + 1;
    }

    function checkIn() external payable {
        require(msg.value == 0, "CheckIn: no ETH");

        uint256 today = _today();
        require(lastCheckInDay[msg.sender] != today, "CheckIn: already today");

        uint256 prev = lastCheckInDay[msg.sender];
        if (prev > 0 && prev == today - 1) {
            streak[msg.sender] += 1;
        } else {
            streak[msg.sender] = 1;
        }

        lastCheckInDay[msg.sender] = today;
        emit CheckedIn(msg.sender, today, streak[msg.sender]);
    }

    function canCheckIn(address user) external view returns (bool) {
        return lastCheckInDay[user] != _today();
    }
}
