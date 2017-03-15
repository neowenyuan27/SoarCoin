pragma solidity ^0.4.8;

/**
 * ERC 20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 */
contract Token {

    /// @return total amount of tokens
    function totalSupply() constant returns(uint256);

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
    address owner;

    function Owned(){
        owner = msg.sender;
    }

    modifier onlyOwner(){
        if (msg.sender != owner) throw;
        _;
    }


}

contract SoarcoinImplementation is Owned, Token {

    mapping (address => uint256) balances;               // each address in this contract may have tokens. 
    string public name = "Soarcoin";                     // name of this contract and investment fund
    string public symbol = "SOAR";                       // token symbol
    uint8 public decimals = 6;                           // decimals (for humans)
    uint256 public totalSupply;
    uint flag = 0;
           
    function SoarcoinImplementation(uint256 _totalSupply) { 
        balances[owner] = _totalSupply; 
        totalSupply = _totalSupply;
    }    

    function transferOwnership(address _newOnwer) onlyOwner returns(bool) {
        owner = _newOnwer;
    }

    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);

    // query balance
    function balanceOf(address _owner) constant returns (uint256 balance)
    {
        return balances[_owner];
    }

    // transfer tokens from one address to another
    function transfer(address _to, uint256 _value) returns (bool success)
    {
        if(_value <= 0) throw;                                      // Check send token value > 0;
        if (balances[msg.sender] < _value) return false;                   // Check if the sender has enough
        if (balances[_to] + _value < balances[_to]) return false;          // Check for overflows                          
        balances[msg.sender] -= _value;                             // Subtract from the sender
        balances[_to] += _value;                                    // Add the same to the recipient, if it's the contact itself then it signals a sell order of those tokens                       
        Transfer(msg.sender, _to, _value);                          // Notify anyone listening that this transfer took place
        return true;      
    }

	function stopMint() onlyOwner
	{
		flag = 1;
	}	
	
    function mint(uint256 _value) onlyOwner
    {
        if(_value <= 0 && flag == 0) throw;
    	balances[msg.sender] += _value;
    	totalSupply += _value;
    }
}

contract SoarCoin is Owned, Token {

    Token implementation;

    function SoarCoin(Token _implementation) {
        implementation = _implementation;
    }

    function setImplementation(Token _implementation) onlyOwner {
        implementation = _implementation;
    }

    function totalSupply() constant returns(uint256) {
        return implementation.totalSupply();
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
        return implementation.transfer(_to, _value);
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

