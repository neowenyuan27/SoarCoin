pragma solidity ^0.4.8;

contract Owned {
    address _owner;
    event NotOwner(address from, address expected);

    function Owned(){
        _owner = msg.sender;
    }

    modifier onlyOwner(){
        if (msg.sender == _owner) {
            _;
        }else{
            NotOwner(msg.sender, _owner);
        }

    }

    function owner() constant returns(address) {
        return _owner;
    }

}

