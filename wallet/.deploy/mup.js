module.exports = {
    servers: {
        one: {
            host: 'eth.mngn.io',
            username: 'mroon',
            pem: '/Users/mroon/.ssh/id_rsa'
            // password: 'server-password'
            // or neither for authenticate from ssh-agent
        }
    },

    meteor: {
        // TODO: change app name and path
        name: 'soar-test',
        path: '../',

        servers: {
            one: {},
        },

        buildOptions: {
            serverOnly: true,
        },

        env: {
            // If you are using ssl, it needs to start with https://
            ROOT_URL: 'http://soar-test.mngn.io',
            MONGO_URL: 'mongodb://soar-test:G9XiVXZcZeSCFpknRBDs5WH2Eh9c9@ds115511-a0.mlab.com:15511,ds115511-a1.mlab.com:15511/soar-test?replicaSet=rs-ds115511',
        },

        docker: {
            image: 'abernix/meteord:base',
        },

        // This is the maximum time in seconds it will wait
        // for your app to start
        // Add 30 seconds if the server has 512mb of ram
        // And 30 more if you have binary npm dependencies.
        deployCheckWaitTime: 90,

        // Show progress bar while uploading bundle to server
        // You might need to disable it on CI servers
        enableUploadProgressBar: false
    },

    mongo: {
        port: 27017,
        version: '3.4.1',
        servers: {
            one: {}
        }
    }
};
