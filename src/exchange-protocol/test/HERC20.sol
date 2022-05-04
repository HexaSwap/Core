pragma solidity =0.5.16;

import '../HexaFinityERC20.sol';

contract HERC20 is HexaFinityERC20 {
    constructor(uint _totalSupply) public {
        _mint(msg.sender, _totalSupply);
    }
}