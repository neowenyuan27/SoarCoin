export default {
    general: {
        copyAddress: "Adresse kopieren"
    },
    appBar: {
        dismiss: "schliessen",
        title: "SOAR",
        send: "Ausgeben",
        receive: "Einnehmen",
        history: "Transaktionen",
        toggleCurrency: "Währung ändern",
        settings: "Einstellungen",
        amountOut: "Betrag zu versenden",
        amountIn: "Betrag zu bekommen",
        menu: {
            value: "1 SOAR ist",
            edit: "Profil bearbeiten",
            userWarning: "Sie müssen die Verifizierung erneut machen",
            pin: "PIN ändern",
            current: "gültiger PIN",
            newPin: "neuer PIN",
            repeatPin: "neuen PIN wiederholen",
            mnemonic: "mnemonic anzeigen",
            currency: "Bevorzugte Währung"
        }
    },
    drawer: {
        title: "Menu",
        english: "English",
        chinese: "Chinese",
        french: "Français",
        german: "Deutsch",
        password: "Passwort ändern"
    },
    login: {
        user: "e-mail",
        name: "Ganzer Name",
        password: "Persönliche Identifikations-Nummer",
        login: "Login",
        register: "Anmelden",
        loginTitle: "Geben Sie Ihre Login Daten ein",
        registerTitle: "Danke für Ihre Anmeldung",
        registerMessage: "Konto erstellen",
        msgs: {
            wrong: "Falsches Passwort",
            noMatch: "die beiden PINs sind ungleich",
            duplicate: "diese e-mail ist bereits angemeldet loggen Sie sich ein",
            incorrect: "diese e-mail ist ungültig"
        },
        waiting: "Warten auf e-mail Verifizierung"
    },
    transactions: {
        address: "Adddresse",
        out: "Ausgehend",
        in: "Einkommend",
        from: (amount, address) => amount + " SOAR von " + address + " bekommen",
        to: (amount, address) => amount + " SOAR an " + address + " gesendet",
        invalidAddress: "Die Adresse ist ungültig",
        unknownAddress: "Unbekannte Address",
        amountError: "Überprüfen Sie bitte den Betrag",
        soar: "SOAR",
        chf: "CHF",
        usd: "USD",
        renminbi: "RMB",
        yuan: "CNY"
    }
}