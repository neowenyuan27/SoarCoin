pragma solidity ^0.4.8;

contract Owned {
    address _owner;

    function Owned(){
        _owner = msg.sender;
    }

    modifier onlyOwner(){
        if (msg.sender == _owner) _;
    }

    function owner() constant returns(address) {
        return _owner;
    }

}

