pragma solidity ^0.4.8;

import "./Owned.sol";
import "./Token.sol";

contract SoarCoinImplementation is Owned {
    address public trustedContract;
    address txAccount;                     // an account to hold the SOAR paid for transactions
    address oracleAccount;                 // an account used by the oracle to register users
    mapping (address => uint256) balances; // each address in this contract may have tokens.
    mapping (address => bool) registered;    // each address whose tokens have been migrated is registered here in order to avoid someone emptying their account and being migrated again
    mapping (address => bool) ethless;     // the addresses registered to get a refund on their TX costs
    bytes8 _name = "Soarcoin";             // name of this contract and investment fund
    bytes4 _symbol = "SOAR";               // token symbol
    uint8 _decimals = 24;                  // decimals (for humans) must be smaller than Wei because the value of SOAR might be lower than ETH
    uint256 _totalSupply;
    uint256 wei4soar;
    Token previousVersion;

    uint8 flag = 0;

    event UnauthorizedCall(address from, address axpected);

    modifier contractOnly(address caller) {
        if(caller == trustedContract) {
            _;
        } else {
            UnauthorizedCall(caller, trustedContract);
        }
    }

    modifier oracleOnly(address caller) {
        if(caller == oracleAccount) {
            _;
        } else {
            UnauthorizedCall(caller, oracleAccount);
        }
    }

    /**
        previousVersion is the address of the previous implementation of the contract
        txAccount is the account to which SOAR paid for transactions will be sent
        wei4soar is the initial exchange rate
    */
    function SoarCoinImplementation(Token _previousVersion, address _txAccount, address _oracleAccount, uint _wei4soar) {
        previousVersion = _previousVersion;
        txAccount = _txAccount;
        wei4soar = _wei4soar; //set the price of SOAR in WEI
        _totalSupply = _previousVersion.totalSupply() * 1000000000000000000;
    }

    function setTrustedContract(address _contractAddress) onlyOwner {
        trustedContract = _contractAddress;
    }

    function setWei4Soar(uint _wei4soar) onlyOwner {
        wei4soar = _wei4soar;
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
    event Transfer(address indexed from, address indexed to, uint256 value, uint gasUsed);
    event InsufficientFunds(address from, address to, uint balance, uint value, uint gasPrice);
    event InsufficientContractFunds(uint required, uint available);

// query balance
    function balanceOf(address _owner) constant returns (uint256 balance)
    {
        uint balance = balances[_owner];
        if(!registered[_owner]){
            if (balance == 0) {
                balance = previousVersion.balanceOf(_owner) * 1000000000000000000;
            }
        }
        return balance;
    }



    function _transfer(address _from, address _to, uint256 _value) internal returns(bool) {
    // Check send token value > 0;
        if (_value <= 0) return false;
//TODO: optimize gas usage for migration
        if (!registered[_owner]) {
            if (previousVersion.balanceOf(_from) > 0) {
                registered[_from] = true;
                balances[_from] = previousVersion.balanceOf(_owner) * 1000000000000000000;
            }
        }
    // Check if the sender has enough
        if (balanceOf(_from) < _value) return false;
    // Subtract from the sender
        balances[_from] -= _value;
    // Add the same to the recipient, if it's the contact itself then it signals a sell order of those tokens
        balances[_to] += _value;

        return true;
    }

// transfer tokens from one address to another
    function transfer(address _from, address _to, uint256 _value) contractOnly(msg.sender) returns (bool success) {
        uint gasAmount;
        //assembly { gasAmount := gas }

        if(_transfer(_from, _to, _value)) {
        // Notify anyone listening that this transfer took place
        //assembly { gasAmount := gasAmount - gas }
            Transfer(_from, _to, _value, gasAmount);
            return true;
        }
        return false;
    }

    function transferWithSoar(address _to, uint256 _value) returns (bool success) {
        uint gasAmount;
    //assembly { gasAmount := gas }
    //check if the contract has enoug funds to refund the gas at the end and stop if it does not
        if (this.balance < gasAmount) {
            InsufficientContractFunds(gasAmount, this.balance);
            return false;
        }
        //compute the gas price in SOAR and stop if these are insufficient
        uint gasPrice = gasAmount * tx.gasprice * wei4soar;
        if(balanceOf(_from) < _value + gasPrice) {
            InsufficientFunds(_from, _to, balanceOf(_from), _value, gasPrice);
            return false;
        }
        if(_transfer(_from, _to, _value)) {
        //assembly { gasAmount := gasAmount - gas }
            gasPrice = gasAmount * tx.gasprice * wei4soar;
            balances[_from] -= gasPrice;
            balances[txAccount] += gasPrice;
        //refund the price of the transaction + the price of the SOAR gas transfer
            this.send(tx.origin, gasPrice + 0 * tx.gasprice);
        // Notify anyone listening that this transfer took place
            Transfer(_from, _to, _value, gasAmount);
            return true;
        }
        return false;

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

