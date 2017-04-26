export default {
    "appBar": {
        "title": "SOAR",
        "send": "Send SOAR",
        "receive": "Receive SOAR",
        "history": "Transactions",
        "toggleCurrency": "Toggle Currency",
        "settings": "Settings",
        "amountOut": "Amount to transfer",
        "amountIn": "Amount to receive",
        "menu": {
            "value": "1 SOAR is worth",
            "edit": "Edit profile",
            "userWarning": "You will have to repeat the verification",
            "pin": "Change PIN",
            "current": "current PIN",
            "newPin": "new PIN",
            "repeatPin": "repeat new PIN",
            "mnemonic": "Display mnemonic",
            "currency": "Prefered currency"
        }
    },
    "login": {
        "user": "e-mail",
        "name": "Full Name",
        "password": "Personal Identification Number",
        "login": "Login",
        "register": "Register",
        "loginTitle": "Please enter your login data",
        "registerTitle": "Thank you for your registration",
        "registerMessage": "Create a new account",
        "msgs": {
            "wrong": "Incorrect Password",
            "noMatch": "the two PINs do not match",
            "duplicate": "this e-mail is already registered, login instead",
            "incorrect": "this e-mail is not valid"
        },
        "waiting": "Waiting for e-mail verification"
    },
    "transactions": {
        "address": "Address",
        "out": "Outgoing",
        "in": "Incomming",
        "from": (amount, address ) => "Received " + amount + " SOAR from " + address,
        "to": (amount, address ) => "Sent " + amount + " SOAR to " + address,
        "invalidAddress": "The address is invalid",
        "unknownAddress": "Unkown address",
        "amountError": "please check the amount",
        "soar": "SOAR",
        "chf": "CHF",
        "usd": "USD",
        "renminbi": "RMB",
        "yuan": "CNY"
    }
}