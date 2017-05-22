pragma solidity ^0.4.8;

contract Utils {

    function getGasCounter() returns(uint gasCounter) {
        assembly { gasCounter := gas }
        return gasCounter;
    }


}