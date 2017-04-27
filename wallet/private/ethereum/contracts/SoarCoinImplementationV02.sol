pragma solidity ^0.4.8;

import "./Owned.sol";
import "./SoarCoinImplementationV01.sol";

contract SoarCoinImplementationV02 is Owned {
    address public trustedContract;
    address oracle;
    SoarCoinImplementationV01 public previousImplementation;

    mapping (address => uint256) balances;         // each address in this contract may have tokens.
    mapping (address => bool) public migrated;     // addresses from the previous contract which have been migrated
    bytes8 _name = "Soarcoin";                     // name of this contract and investment fund
    bytes4 _symbol = "SOAR";                       // token symbol
    uint8 _decimals = 6;                           // decimals (for humans)
    uint256 _totalSupply;

    uint8 flag = 0;

    event UnauthorizedCall(address from);

    modifier contractOnly(address caller) {
        if(caller == trustedContract || caller == oracle) {
            _;
        } else {
            UnauthorizedCall(caller);
        }
    }

    //this contract must be created by the same owner as the previous implementation or it will fail
    function SoarCoinImplementationV02(SoarCoinImplementationV01 _previousImplementation, address _oracle) {
        _totalSupply = _previousImplementation.totalSupply();
        trustedContract = _previousImplementation.trustedContract();
        previousImplementation = _previousImplementation;
    }

    event Migration(address accountHolder, uint256 value);
    function migration(address _toMigrate) private {
        uint256 prevBalance = previousImplementation.balanceOf(_toMigrate);
        if( prevBalance > 0){
    //the migration constitutes in a transfer of the whole balance to the new contract address
            bool res = previousImplementation.transfer(_toMigrate, this, prevBalance);
            balances[_toMigrate] += prevBalance;
            Migration(_toMigrate, prevBalance);
        }

        migrated[_toMigrate] = true;
    }

    function setTrustedContract(address _contractAddress) onlyOwner {
        trustedContract = _contractAddress;
    }

    event OracleSet(address newOracle, address setter);
    function setOracle(address _oracle) onlyOwner {
        oracle = _oracle;
        OracleSet(_oracle, tx.origin);
    }

    event EthForToken(address from, address to, uint256 tokenAmount, uint256 ethAmount);
    /*the oracle can send ETH and request tokens from a participant. there is a cap of 0.1 ETH per transaction*/
    function ethForToken(address _participant, uint256 _amount) payable {
        bool res;
        //the oracle is not a contract, therefor it is safe to use tx.origin and it thwarts reentrancy attacks
        if(tx.origin != oracle) {
            res = tx.origin.send(msg.value);
            return;
        }

        if(transfer(_participant, oracle, _amount)) {
            res = _participant.send(msg.value);
            EthForToken(oracle, _participant, _amount, msg.value);
        }
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
    function balanceOf(address _owner) constant returns (uint256 balance) {
        balance = balances[_owner];
        if(!migrated[_owner]) balance += previousImplementation.balanceOf(_owner);

        return balance;
    }

// transfer tokens from one address to another
    function transfer(address _from, address _to, uint256 _value) contractOnly(msg.sender) returns (bool success) {
        if (_value <= 0) return false;
    // Check send token value > 0;
        if(!migrated[_from]) migration(_from);
    // if not allready happened, migrate the address from previous contract
        if (balances[_from] < _value) return false;
    // Check if the sender has enough
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

    event Minted(uint256 newCoins);
    function mint(uint256 _value) onlyOwner
    {
        if (_value <= 0 && flag == 0) throw;
        balances[msg.sender] += _value;
        _totalSupply += _value;
        Minted(_value);
    }
}

