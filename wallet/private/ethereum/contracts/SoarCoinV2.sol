pragma solidity ^0.4.8;


import "./Owned.sol";
import "./Token.sol";
import "./SoarCoinImplementationV03.sol";


contract SoarCoin is Owned, Token {

    SoarCoinImplementationV03 implementation;

    function SoarCoin(SoarCoinImplementationV03 _implementation) {
        implementation = _implementation;
    }

    function transferOwnership(address _newOnwer) onlyOwner {
        implementation.transfer(_owner, _newOnwer, balanceOf(_owner));
        _owner = _newOnwer;
    }

    function setImplementation(SoarCoinImplementationV03 _implementation) onlyOwner {
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
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    function transfer(address _to, uint256 _value) returns (bool success) {
        if (implementation.transfer(msg.sender, _to, _value)) {
            Transfer(msg.sender, _to, _value);
            return true;
        }
        else {
            return false;
        }
    }

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        if (implementation.transferFrom(_from, _to, _value)) {
            Transfer(_from, _to, _value);
            return true;
        }
        else {
            return false;
        }
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


