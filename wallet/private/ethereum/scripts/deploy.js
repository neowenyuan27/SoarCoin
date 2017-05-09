var tokenAbi = [{
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "bytes8"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
        "name": "_value",
        "type": "uint256"
    }],
    "name": "transferFrom",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "bytes4"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_value", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getImplementation",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_implementation", "type": "address"}],
    "name": "setImplementation",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "remaining", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_newOnwer", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "inputs": [{"name": "_implementation", "type": "address"}],
    "payable": false,
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "_owner", "type": "address"}, {
        "indexed": true,
        "name": "_spender",
        "type": "address"
    }, {"indexed": false, "name": "_value", "type": "uint256"}],
    "name": "Approval",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "from", "type": "address"}, {
        "indexed": false,
        "name": "expected",
        "type": "address"
    }],
    "name": "NotOwner",
    "type": "event"
}];
var tokenAddress = "0x124c91eF50dD9F1bCE5a84451C8b8ac393427887";

var previousAbi = [{
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "bytes8"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
        "name": "_value",
        "type": "uint256"
    }],
    "name": "transferFrom",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "trustedContract",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "bytes4"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_value", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_contractAddress", "type": "address"}],
    "name": "setTrustedContract",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
        "name": "_value",
        "type": "uint256"
    }],
    "name": "transfer",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "stopMint",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "remaining", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "inputs": [{"name": "initialMint", "type": "uint256"}],
    "payable": false,
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "from", "type": "address"}],
    "name": "UnauthorizedCall",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "from", "type": "address"}, {
        "indexed": true,
        "name": "to",
        "type": "address"
    }, {"indexed": false, "name": "value", "type": "uint256"}],
    "name": "Transfer",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "from", "type": "address"}, {
        "indexed": false,
        "name": "expected",
        "type": "address"
    }],
    "name": "NotOwner",
    "type": "event"
}];

var abi = [{
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "bytes8"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
        "name": "_value",
        "type": "uint256"
    }],
    "name": "transferFrom",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "", "type": "address"}],
    "name": "migrated",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "trustedContract",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_participant", "type": "address"}, {"name": "_amount", "type": "uint256"}],
    "name": "ethForToken",
    "outputs": [],
    "payable": true,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_oracle", "type": "address"}],
    "name": "setOracle",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "oracle",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "bytes4"}],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "previousImplementation",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_value", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_contractAddress", "type": "address"}],
    "name": "setTrustedContract",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
        "name": "_value",
        "type": "uint256"
    }],
    "name": "transfer",
    "outputs": [{"name": "success", "type": "bool"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "stopMint",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "remaining", "type": "uint256"}],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "getContractEther",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "inputs": [{"name": "_previousImplementation", "type": "address"}, {"name": "_oracle", "type": "address"}],
    "payable": false,
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "from", "type": "address"}],
    "name": "UnauthorizedCall",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "accountHolder", "type": "address"}, {
        "indexed": false,
        "name": "value",
        "type": "uint256"
    }],
    "name": "Migration",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "newOracle", "type": "address"}, {
        "indexed": false,
        "name": "setter",
        "type": "address"
    }],
    "name": "OracleSet",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "from", "type": "address"}, {
        "indexed": false,
        "name": "to",
        "type": "address"
    }, {"indexed": false, "name": "tokenAmount", "type": "uint256"}, {
        "indexed": false,
        "name": "ethAmount",
        "type": "uint256"
    }],
    "name": "EthForToken",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "from", "type": "address"}, {
        "indexed": true,
        "name": "to",
        "type": "address"
    }, {"indexed": false, "name": "value", "type": "uint256"}, {
        "indexed": false,
        "name": "gasPrice",
        "type": "uint256"
    }],
    "name": "Transfer",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "newCoins", "type": "uint256"}],
    "name": "Minted",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "from", "type": "address"}, {
        "indexed": false,
        "name": "expected",
        "type": "address"
    }],
    "name": "NotOwner",
    "type": "event"
}];
var binary = "0x6060604052600680546001604060020a03191667536f6172636f696e17604060020a63ffffffff0219166b534f4152000000000000000017606060020a60ff0219166c060000000000000000000000001790556008805460ff19169055341561006457fe5b604051604080610f6d8339810160405280516020909101515b5b60008054600160a060020a03191633600160a060020a03161790555b81600160a060020a03166318160ddd6000604051602001526040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401809050602060405180830381600087803b15156100f957fe5b60325a03f1151561010657fe5b50506040805180516007556000602091820181905282517f59138d130000000000000000000000000000000000000000000000000000000081529251600160a060020a03871694506359138d139360048082019493918390030190829087803b151561016e57fe5b60325a03f1151561017b57fe5b50506040515160018054600160a060020a0319908116600160a060020a039384161790915560038054821686841617905560028054909116918416919091179055505b50505b610d9d806101d06000396000f300606060405236156101015763ffffffff60e060020a60003504166306fdde038114610103578063095ea7b31461014157806318160ddd1461017457806323b872dd14610196578063313ce567146101cf5780634ba0a5ee146101f557806359138d1314610225578063618d7ae41461025157806370a082311461026a5780637adbf973146102985780637dc0d1d0146102b65780638da5cb5b146102e257806395d89b411461030e5780639d0bcca014610353578063a0712d681461037f578063aaf5029214610394578063beabacc8146103b2578063d5582965146103eb578063dd62ed3e146103fd578063eeeb702e14610431578063f2fde38b14610443575bfe5b341561010b57fe5b610113610461565b6040805177ffffffffffffffffffffffffffffffffffffffffffffffff199092168252519081900360200190f35b341561014957fe5b610160600160a060020a0360043516602435610483565b604080519115158252519081900360200190f35b341561017c57fe5b61018461048c565b60408051918252519081900360200190f35b341561019e57fe5b610160600160a060020a0360043581169060243516604435610493565b604080519115158252519081900360200190f35b34156101d757fe5b6101df61049d565b6040805160ff9092168252519081900360200190f35b34156101fd57fe5b610160600160a060020a03600435166104b7565b604080519115158252519081900360200190f35b341561022d57fe5b6102356104cc565b60408051600160a060020a039092168252519081900360200190f35b610268600160a060020a03600435166024356104db565b005b341561027257fe5b610184600160a060020a0360043516610628565b60408051918252519081900360200190f35b34156102a057fe5b610268600160a060020a03600435166106ce565b005b34156102be57fe5b610235610782565b60408051600160a060020a039092168252519081900360200190f35b34156102ea57fe5b610235610791565b60408051600160a060020a039092168252519081900360200190f35b341561031657fe5b61031e6107a1565b604080517fffffffff000000000000000000000000000000000000000000000000000000009092168252519081900360200190f35b341561035b57fe5b6102356107ba565b60408051600160a060020a039092168252519081900360200190f35b341561038757fe5b6102686004356107c9565b005b341561039c57fe5b610268600160a060020a036004351661089b565b005b34156103ba57fe5b610160600160a060020a036004358116906024351660443561090e565b604080519115158252519081900360200190f35b34156103f357fe5b610268610a65565b005b341561040557fe5b610184600160a060020a0360043581169060243516610483565b60408051918252519081900360200190f35b341561043957fe5b610268610ad2565b005b341561044b57fe5b610268600160a060020a0360043516610b55565b005b6006547801000000000000000000000000000000000000000000000000025b90565b60005b92915050565b6007545b90565b60005b9392505050565b6006546c01000000000000000000000000900460ff165b90565b60056020526000908152604090205460ff1681565b600154600160a060020a031681565b60025460009033600160a060020a0390811691161461055c57604051600160a060020a033316903480156108fc02916000818181858888f160408051600160a060020a033316815290519196507fda30cab8fb2c28848455e55d70c72edb9e639f97a81d6ec4b9bde452f277f0e695508190036020019350915050a1610622565b600254610574908490600160a060020a03168461090e565b156105f857604051600160a060020a038416903480156108fc02916000818181858888f160025460408051600160a060020a039283168152918a166020830152818101899052346060830152519196507f6218e45d791556fd6296d210adbe9de8687e40a2d9053158e22b1e3e9b8e20a795508190036080019350915050a1610622565b600254604051600160a060020a03909116903480156108fc02916000818181858888f19450505050505b5b505050565b600160a060020a03811660009081526004602090815260408083205460059092529091205460ff1615156106c8576003546040805160006020918201819052825160e060020a6370a08231028152600160a060020a038781166004830152935193909416936370a08231936024808301949391928390030190829087803b15156106ae57fe5b60325a03f115156106bb57fe5b5050604051519190910190505b5b919050565b60005433600160a060020a03908116911614156107475760028054600160a060020a031916600160a060020a038381169182179092556040805191825232909216602082015281517fc1d3048301c0d23629a2532c8defa6d68f8e1a0e4157918769e9fb1b2eeb888e929181900390910190a15b61077e565b60005460408051600160a060020a03338116825290921660208301528051600080516020610d528339815191529281900390910190a15b5b50565b600254600160a060020a031681565b600054600160a060020a03165b90565b60065468010000000000000000900460e060020a025b90565b600354600160a060020a031681565b60005433600160a060020a039081169116141561074757600081111580156107f4575060085460ff16155b156107ff5760006000fd5b600160a060020a0333166000908152600460209081526040918290208054840190556007805484019055815183815291517f176b02bb2d12439ff7a20b59f402cca16c76f50508b13ef3166a600eb719354a9281900390910190a15b61077e565b60005460408051600160a060020a03338116825290921660208301528051600080516020610d528339815191529281900390910190a15b5b50565b60005433600160a060020a03908116911614156107475760018054600160a060020a031916600160a060020a0383161790555b61077e565b60005460408051600160a060020a03338116825290921660208301528051600080516020610d528339815191529281900390910190a15b5b50565b6001546000903390600160a060020a038083169116148061093c5750600254600160a060020a038281169116145b15610a1f57600083116109525760009150610a1a565b600160a060020a03851660009081526005602052604090205460ff16151561097d5761097d85610bc8565b5b600160a060020a038516600090815260046020526040902054839010156109a85760009150610a1a565b600160a060020a038086166000818152600460209081526040808320805489900390559388168083529184902080548801905583518781523a91810191909152835191937f9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc4492918290030190a3600191505b610a5c565b60408051600160a060020a038316815290517fda30cab8fb2c28848455e55d70c72edb9e639f97a81d6ec4b9bde452f277f0e69181900360200190a15b5b509392505050565b60005433600160a060020a0390811691161415610a8f576008805460ff191660011790555b610ac6565b60005460408051600160a060020a03338116825290921660208301528051600080516020610d528339815191529281900390910190a15b5b565b60005b92915050565b6000805433600160a060020a039081169116141561074757604051600160a060020a0333811691309091163180156108fc02916000818181858888f19450505050505b61077e565b60005460408051600160a060020a03338116825290921660208301528051600080516020610d528339815191529281900390910190a15b5b50565b60005433600160a060020a03908116911614156107475760008054600160a060020a031916600160a060020a0383161790555b61077e565b60005460408051600160a060020a03338116825290921660208301528051600080516020610d528339815191529281900390910190a15b5b50565b6003546040805160006020918201819052825160e060020a6370a08231028152600160a060020a03868116600483015293519194859416926370a082319260248084019382900301818787803b1515610c1d57fe5b60325a03f11515610c2a57fe5b5050604051519250506000821115610d2857600354604080516000602091820181905282517fbeabacc8000000000000000000000000000000000000000000000000000000008152600160a060020a0388811660048301523081166024830152604482018890529351939094169363beabacc8936064808301949391928390030190829087803b1515610cb957fe5b60325a03f11515610cc657fe5b5050604080518051600160a060020a03871660008181526004602090815290859020805489019055908352820186905282519094507f5c2da67751b5c2b8ffb1579ea16e70cf01e4b94068f0d42369de650adc07f61393509081900390910190a15b600160a060020a0383166000908152600560205260409020805460ff191660011790555b505050560023295f0e104d137d137555eb51dbe25a9e6827007f9feb6ae8bb562312e3e202a165627a7a723058208526b3d0c9c3461dac4bcbcef5c29b80be77dfb248de7b1bd77e97dff2c0a76a0029";
var oracle = "0xF42756721ddA2c66EF4fF38c93C87002b6fDe88f";

function deployV2(sender) {
    console.log("deployment started");
    var tokenContract = web3.eth.contract(abi);
    console.log("contract initialized");
    tokenContract.new(prevAddress, oracle, {from: sender, data: binary, gas: 1365532}, function (error, contract) {
        console.log("contract creation callback");
        if (!error) {
            if (!contract.address) {
                console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
            } else {
                console.log("Contract mined! Address: " + contract.address);
                console.log(contract);
                soar.setImplementation(contract.address);
                previous.setTrustedContract(contract.address);
            }
        } else {
            throw new Error("something went wrong ", error);
        }
    })
}

var soar = web3.eth.contract(tokenAbi).at(tokenAddress);
var prevAddress = "0xA049978DE304Dc9b72e95323830c9F01E6CF4927";
var previous = web3.eth.contract(previousAbi).at(prevAddress);
