var Web3 = require("web3");
let url = "https://micharoon.by.ether.camp:8555/sandbox/e6a26c2c95";

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8585,
            network_id: "*" // Match any network id
        },

        camp: {
            provider: new Web3.providers.HttpProvider(url),
            network_id: "*"
        },

        testnet: {
            host: "localhost",
            port: 8545,
            gas: 4612388,
            network_id: "*" // Match any network id
        },

    }
};
