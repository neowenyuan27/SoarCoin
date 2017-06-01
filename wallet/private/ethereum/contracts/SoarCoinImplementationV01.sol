pragma solidity ^0.4.8;

import "./Owned.sol";

contract SoarCoinImplementationV01 is Owned {
    address public trustedContract;
    mapping (address => uint256) balances;         // each address in this contract may have tokens.
    bytes8 _name = "Soarcoin";                     // name of this contract and investment fund
    bytes4 _symbol = "SOAR";                       // token symbol
    uint8 _decimals = 6;                           // decimals (for humans)
    uint256 _totalSupply;

    uint8 flag = 0;

    event UnauthorizedCall(address from);

    modifier contractOnly(address caller) {
        if(caller == trustedContract) {
            _;
        } else {
            UnauthorizedCall(caller);
        }
    }

    function SoarCoinImplementationV01(uint256 initialMint) {
        _totalSupply = initialMint;
        balances[msg.sender] = initialMint;
    }

    function setTrustedContract(address _contractAddress) onlyOwner {
        trustedContract = _contractAddress;
    }

    function totalSupply() constant returns (uint256) {
        return _totalSupply;
    }

    function name() constant returns (bytes8) {
        return _name;
    }

    function symbol() constant returns (bytes4) {
        return _symbol;
    }

    function decimals() constant returns (uint8) {
        return _decimals;
    }

// This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);

// query balance
    function balanceOf(address _owner) constant returns (uint256 balance)
    {
        return balances[_owner];
    }

// transfer tokens from one address to another
    function transfer(address _from, address _to, uint256 _value) contractOnly(msg.sender) returns (bool success)
    {
        if (_value <= 0) throw;
    // Check send token value > 0;
        if (balances[_from] < _value) return true;
    // Check if the sender has enough
        if (balances[_from] < _value) return false;
    // Check for overflows
        balances[_from] -= _value;
    // Subtract from the sender
        balances[_to] += _value;
    // Add the same to the recipient, if it's the contact itself then it signals a sell order of those tokens
        Transfer(_from, _to, _value);
    // Notify anyone listening that this transfer took place
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        return false;
    }

    function approve(address _spender, uint256 _value) returns (bool success) {
        return false;
    }

    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
        return 0;
    }

    function stopMint() onlyOwner {
        flag = 1;
    }

    function mint(uint256 _value) onlyOwner
    {
        if (_value <= 0 && flag == 0) throw;
        balances[msg.sender] += _value;
        _totalSupply += _value;
    }
}

