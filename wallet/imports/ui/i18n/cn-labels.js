export default {
    general: {
        copyAddress: "Copy Address"
    },
    appBar: {
        dismiss: "dissmiss",
        title: "飙升币",
        send: "发送飙升币",
        receive: "接收飙升币",
        history: "交易",
        toggleCurrency: "切换货币",
        settings: "设置",
        amountOut: "转移账户",
        amountIn: "接收账户",
        menu: {
            value: "价值1飙升币",
            edit: "编辑个人资料",
            userWarning: "您需要重复认证",
            pin: "修改密码",
            current: "现在的密码",
            newPin: "新的密码",
            repeatPin: "重复新密码",
            mnemonic: "显示助记符",
            currency: "优先选择的货币"
        }
    },
    drawer: {
        title: "Menu",
        english: "English",
        chinese: "Chinese",
        french: "Français",
        german: "Deutsch",
        password: "Change password"
    },
    login: {
        user: "电子邮件",
        name: "全名",
        password: "个人识别号码",
        login: "登录",
        register: "注册",
        loginTitle: "请输入您的登录数据",
        registerTitle: "感谢您的注册",
        registerMessage: "创建一个新账户",
        msgs: {
            wrong: "密码错误",
            noMatch: "the two PINs do not match",
            duplicate: "该邮箱已被注册，直接登录",
            incorrect: "this e-mail is not valid"
        },
        waiting: "请等待邮件认证"
    },
    transactions: {
        address: "地址",
        out: "支出",
        in: "收入",
        from: (amount, address) => "Received " + amount + " SOAR from " + address,
        to: (amount, address) => "Sent " + amount + " SOAR to " + address,
        invalidAddress: "The address is invalid",
        unknownAddress: "Unkown address",
        amountError: "please check the amount",
        soar: "飙升币",
        chf: "法郎",
        usd: "美元",
        renminbi: "人民币",
        yuan: "元"
    }
}