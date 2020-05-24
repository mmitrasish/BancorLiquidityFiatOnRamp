const Web3 = require("Web3");
const BancorSDK = require("bancor-sdk").SDK;

const NODE_ADDRESS = "https://mainnet.infura.io/v3/55b4d27b09d64c4c8a6d9e381a51455d";
const SOURCE_TOKEN = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const TARGET_TOKEN = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
const settings = {
    ethereumNodeEndpoint: NODE_ADDRESS
};


async function rpc(func) {
    while (true) {
        try {
            return await func.call();
        }
        catch (error) {
            if (!error.message.startsWith("Invalid JSON RPC response"))
                throw error;
        }
    }
}

const symbols = {};

async function symbol(web3, token) {
    if (symbols[token])
        return symbols[token];
    for (const type of ["string", "bytes32"]) {
        try {
            const contract = new web3.eth.Contract([{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":type}],"payable":false,"stateMutability":"view","type":"function"}], token);
            const symbol = await rpc(contract.methods.symbol());
            if (type.startsWith("bytes")) {
                const list = [];
                for (let i = 2; i < symbol.length; i += 2) {
                    const num = Number("0x" + symbol.slice(i, i + 2));
                    if (32 <= num && num <= 126)
                        list.push(num);
                    else
                        break;
                }
                symbols[token] = String.fromCharCode(...list);
                return symbols[token];
            }
            symbols[token] = symbol;
            return symbols[token];
        }
        catch (error) {
        }
    }
    symbols[token] = token;
    return symbols[token];
}

async function run() {
    const web3 = new Web3(NODE_ADDRESS);
    let bancorSDK = await BancorSDK.create(settings);

    const sourceToken = {blockchainType: "ethereum", blockchainId: SOURCE_TOKEN};
    const targetToken = {blockchainType: "ethereum", blockchainId: TARGET_TOKEN};

    for(let i=1; i<=40;i++)
    {
        let bestRate=web3.utils.toWei(0 + "");
        let bestPath

        console.log(i);
        const paths_rates = await bancorSDK.getAllPathsAndRates(sourceToken, targetToken, i);
        for (const {path, rate} of paths_rates) {
            let amount = Number.parseFloat(web3.utils.toWei(rate + ""));
            if(bestRate<amount){
                // console.log(bestRate, amount)
                bestRate = amount;
                bestPath = path;
                // const symbols = await Promise.all(path.map(token => symbol(web3, token.blockchainId)));
                // console.log(`${symbols}; ${amount}`);
            }
        }
        const symbols = await Promise.all(bestPath.map(token => symbol(web3, token.blockchainId)));
        console.log(`${symbols}; ${bestRate}`);
    }

    await BancorSDK.destroy(bancorSDK);
    if (web3.currentProvider.constructor.name == "WebsocketProvider")
        web3.currentProvider.connection.close();
}

run();