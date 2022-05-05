pragma solidity >=0.5.0;

interface IHexaFinityV1Factory {
    function getExchange(address) external view returns (address);
}
