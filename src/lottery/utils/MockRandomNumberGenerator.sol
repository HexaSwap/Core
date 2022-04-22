//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IRandomNumberGenerator.sol";
import "../interfaces/IHexaFinitySwapLottery.sol";

contract MockRandomNumberGenerator is IRandomNumberGenerator, Ownable {
    address public hexaFinitySwapLottery;
    uint32 public randomResult;
    uint256 public nextRandomResult;
    uint256 public latestLotteryId;

    /**
     * @notice Constructor
     * @dev MockRandomNumberGenerator must be deployed before the lottery.
     */
    constructor() {}

    /**
     * @notice Set the address for the HexaFinitySwapLottery
     * @param _hexaFinitySwapLottery: address of the HexaFinitySwap lottery
     */
    function setLotteryAddress(address _hexaFinitySwapLottery) external onlyOwner {
        hexaFinitySwapLottery = _hexaFinitySwapLottery;
    }

    /**
     * @notice Set the address for the HexaFinitySwapLottery
     * @param _nextRandomResult: next random result
     */
    function setNextRandomResult(uint256 _nextRandomResult) external onlyOwner {
        nextRandomResult = _nextRandomResult;
    }

    /**
     * @notice Request randomness from a user-provided seed
     * @param _seed: seed provided by the HexaFinitySwap lottery
     */
    function getRandomNumber(uint256 _seed) external override {
        require(msg.sender == hexaFinitySwapLottery, "Only HexaFinitySwapLottery");
        fulfillRandomness(0, nextRandomResult);
    }

    /**
     * @notice Change latest lotteryId to currentLotteryId
     */
    function changeLatestLotteryId() external {
        latestLotteryId = IHexaFinitySwapLottery(hexaFinitySwapLottery).viewCurrentLotteryId();
    }

    /**
     * @notice View latestLotteryId
     */
    function viewLatestLotteryId() external view override returns (uint256) {
        return latestLotteryId;
    }

    /**
     * @notice View random result
     */
    function viewRandomResult() external view override returns (uint32) {
        return randomResult;
    }

    /**
     * @notice Callback function used by ChainLink's VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal {
        randomResult = uint32(1000000 + (randomness % 1000000));
    }
}
