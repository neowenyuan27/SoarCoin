pragma solidity ^0.4.8;


import "./Owned.sol";
import "./SoarCoinImplementationV02.sol";


contract SoarCoinImplementationV03 is Owned {
    mapping (address => bool) public trustedCallers;

    address public oracle;

    SoarCoinImplementationV02 public previousImplementation;

    mapping (address => uint256) balances;         // each address in this contract may have tokens.
    mapping (address => bool) public migrated;     // addresses from the previous contract which have been migrated
    bytes8 _name = "Soarcoin";                     // name of this contract and investment fund
    bytes4 _symbol = "SOAR";                       // token symbol
    uint8 _decimals = 6;                           // decimals (for humans)
    uint256 _totalSupply;

    uint8 flag = 0;

    event UnauthorizedCall(address from);

    modifier trustedOnly(address caller) {
        if (trustedCallers[caller] || caller == oracle) {
            _;
        }
        else {
            UnauthorizedCall(caller);
        }
    }

    //this contract must be created by the same owner as the previous implementation or it will fail
    function SoarCoinImplementationV03(address _trustedContract, SoarCoinImplementationV02 _previousImplementation, address _oracle) {
        _totalSupply = previousImplementation.totalSupply();
        trustedCallers[_trustedContract] = true;
        trustedCallers[_oracle] = true;
        previousImplementation = _previousImplementation;
        oracle = _oracle;
    }

    event Migration(address accountHolder, uint256 value);

    function migration(address _toMigrate) private {
        uint256 prevBalance = previousImplementation.balanceOf(_toMigrate);
        if (prevBalance > 0) {
            //the migration constitutes in a transfer of the whole balance to the new contract address
            bool res = previousImplementation.transfer(_toMigrate, this, prevBalance);
            balances[_toMigrate] += prevBalance;
            Migration(_toMigrate, prevBalance);
        }

        migrated[_toMigrate] = true;
    }

    function addTrustedCaller(address _address) onlyOwner {
        trustedCallers[_address] = true;
    }

    function removeTrustedCaller(address _address) onlyOwner {
        trustedCallers[_address] = false;
    }

    event OracleSet(address newOracle, address setter);

    function setOracle(address _oracle) onlyOwner {
        oracle = _oracle;
        OracleSet(_oracle, tx.origin);
    }

    function getContractEther() onlyOwner {
        bool res = msg.sender.send(this.balance);
    }

    event EthForToken(address from, address to, uint256 tokenAmount, uint256 ethAmount);
    /*the oracle can send ETH and request tokens from a participant. there is a cap of 0.1 ETH per transaction*/
    function ethForToken(address _participant, uint256 _amount) payable {
        bool res;
        //the oracle is not a contract, therefor it is safe to use tx.origin and it thwarts reentrancy attacks
        if (msg.sender != oracle) {
            res = msg.sender.send(msg.value);
            UnauthorizedCall(msg.sender);
            return;
        }
        //first transfer the tokens, then transfer the ETH
        if (transfer(_participant, oracle, _amount)) {
            res = _participant.send(msg.value);
            EthForToken(oracle, _participant, _amount, msg.value);
        }
        else {
            res = oracle.send(msg.value);
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

    // query balance
    function balanceOf(address _owner) constant returns (uint256 balance) {
        balance = balances[_owner];
        if (!migrated[_owner]) balance += previousImplementation.balanceOf(_owner);

        return balance;
    }

    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value, uint256 gasPrice);

    // transfer tokens from one address to another
    function transfer(address _from, address _to, uint256 _value) trustedOnly(msg.sender) returns (bool success) {
        if (_value <= 0) return false;
        // Check send token value > 0;
        if (!migrated[_to]) migration(_to);
        // if not allready happened, migrate the recipient address from previous contract
        if (balances[_from] < _value) return false;
        // Check if the sender has enough
        balances[_from] -= _value;
        // Subtract from the sender
        balances[_to] += _value;
        // Add the same to the recipient, if it's the contact itself then it signals a sell order of those tokens
        Transfer(_from, _to, _value, tx.gasprice);
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

