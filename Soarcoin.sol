pragma solidity ^0.4.8;


/**
 * ERC 20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 */
contract Token {

/// @return total amount of tokens
    function totalSupply() constant returns (uint256);

    function name() constant returns (bytes8);

    function symbol() constant returns (bytes4);

    function decimals() constant returns (uint8);

/// @param _owner The address from which the balance will be retrieved
/// @return The balance
    function balanceOf(address _owner) constant returns (uint256 balance);

/// @notice send `_value` token to `_to` from `msg.sender`
/// @param _to The address of the recipient
/// @param _value The amount of token to be transferred
/// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) returns (bool success);

/// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
/// @param _from The address of the sender
/// @param _to The address of the recipient
/// @param _value The amount of token to be transferred
/// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success);

/// @notice `msg.sender` approves `_addr` to spend `_value` tokens
/// @param _spender The address of the account able to transfer the tokens
/// @param _value The amount of wei to be approved for transfer
/// @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value) returns (bool success);

/// @param _owner The address of the account owning tokens
/// @param _spender The address of the account able to transfer the tokens
/// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) constant returns (uint256 remaining);

    function mint(uint256 _value);

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

}


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


contract SoarCoinImplementation is Owned {
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

    function SoarCoinImplementation(uint256 initialMint) {
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


contract SoarCoin is Owned, Token {

    SoarCoinImplementation implementation;

    function SoarCoin(SoarCoinImplementation _implementation) {
        implementation = _implementation;
    }

    function transferOwnership(address _newOnwer) onlyOwner {
        implementation.transfer(_owner, _newOnwer, balanceOf(_owner));
        _owner = _newOnwer;        
    }

    function setImplementation(SoarCoinImplementation _implementation) onlyOwner {
        implementation = _implementation;
    }

    function getImplementation() constant returns (address) {
        return implementation;
    }

    function totalSupply() constant returns (uint256) {
        return implementation.totalSupply();
    }

    function name() constant returns (bytes8) {
        return implementation.name();
    }

    function symbol() constant returns (bytes4) {
        return implementation.symbol();
    }

    function decimals() constant returns (uint8) {
        return implementation.decimals();
    }

    function mint(uint256 _value) onlyOwner {
        implementation.mint(_value);
    }

/// @param _owner The address from which the balance will be retrieved
/// @return The balance
    function balanceOf(address _owner) constant returns (uint256 balance) {
        return implementation.balanceOf(_owner);
    }

/// @notice send `_value` token to `_to` from `msg.sender`
/// @param _to The address of the recipient
/// @param _value The amount of token to be transferred
/// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) returns (bool success) {
        return implementation.transfer(msg.sender, _to, _value);
    }

/// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
/// @param _from The address of the sender
/// @param _to The address of the recipient
/// @param _value The amount of token to be transferred
/// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        return implementation.transferFrom(_from, _to, _value);
    }

/// @notice `msg.sender` approves `_addr` to spend `_value` tokens
/// @param _spender The address of the account able to transfer the tokens
/// @param _value The amount of wei to be approved for transfer
/// @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value) returns (bool success) {
        return implementation.approve(_spender, _value);
    }

/// @param _owner The address of the account owning tokens
/// @param _spender The address of the account able to transfer the tokens
/// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
        return implementation.allowance(_owner, _spender);
    }

}

}
