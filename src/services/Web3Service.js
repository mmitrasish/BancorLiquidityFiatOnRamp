import * as Web3 from "web3";
import Onboard from "bnc-onboard";
import BigNumber from "bignumber.js";
import * as bancor from "bancor-sdk";
import BANCOR_CONVERTER_REGISTRY_ABI from "../contracts/BancorConverterRegistry.json";
import BANCOR_CONVERTER_ABI from "../contracts/BancorConverter.json";
import BANCOR_FORMULA_ABI from "../contracts/BancorFormula.json";
import CONTRACT_REGISTRY_ABI from "../contracts/ContractRegistry.json";
import SMART_TOKEN_ABI from "../contracts/SmartToken.json";
import ERC20_TOKEN_ABI from "../contracts/ERC20Token.json";

const CONTRACT_REGISTRY_ADDRESS = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";

let web3;

const onboard = Onboard({
  dappId: "052b3fe9-87d5-4614-b2e9-6dd81115979a", // [String] The API key created by step one above
  networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: wallet => {
      web3 = new Web3(wallet.provider);
    }
  }
});

export const getAccount = async () => {
  await onboard.walletSelect();
  await onboard.walletCheck();
  const currentState = onboard.getState();

  return currentState.address;
};

export const getContractAddress = async contractName => {
  const registry = new web3.eth.Contract(
    CONTRACT_REGISTRY_ABI,
    CONTRACT_REGISTRY_ADDRESS
  );
  const address = await registry.methods
    .addressOf(web3.utils.fromAscii(contractName))
    .call();
  return address;
};

export const getAllBancorLiquidityPoolTokens = async () => {
  const BANCOR_CONVERTER_REGISTRY_ADDRESS = await getContractAddress(
    "BancorConverterRegistry"
  );
  const contract = new web3.eth.Contract(
    BANCOR_CONVERTER_REGISTRY_ABI,
    BANCOR_CONVERTER_REGISTRY_ADDRESS
  );
  const poolTokens = await contract.methods.getSmartTokens().call();
  return poolTokens;
};

export const getSmartTokensOwner = async smartTokenAddress => {
  const contract = new web3.eth.Contract(SMART_TOKEN_ABI, smartTokenAddress);
  const ownerAddress = await contract.methods.owner().call();
  return ownerAddress;
};

export const getSmartTokensSymbol = async smartTokenAddress => {
  const contract = new web3.eth.Contract(SMART_TOKEN_ABI, smartTokenAddress);
  const tokenSymbol = await contract.methods.symbol().call();
  return tokenSymbol;
};

export const getConnectorTokenCount = async tokenAddress => {
  if (tokenAddress) {
    const contract = new web3.eth.Contract(BANCOR_CONVERTER_ABI, tokenAddress);
    const connectorTokenCount = await contract.methods
      .connectorTokenCount()
      .call();
    return connectorTokenCount;
  }
};

export const getConversionFees = async tokenAddress => {
  if (tokenAddress) {
    // console.log("Entered");
    const contract = new web3.eth.Contract(BANCOR_CONVERTER_ABI, tokenAddress);
    const conversionEvents = await contract.getPastEvents("Conversion", {
      fromBlock: 0,
      toBlock: "latest" // You can also specify 'latest'
    });
    if (conversionEvents[conversionEvents.length - 1]) {
      const conversionFee = new BigNumber(
        conversionEvents[
          conversionEvents.length - 1
        ].returnValues._conversionFee
      );
      const amount = new BigNumber(
        conversionEvents[conversionEvents.length - 1].returnValues._amount
      );
      const conversionFeePercent = conversionFee.dividedBy(amount);
      // console.log(
      //   conversionFeePercent.toString(),
      //   conversionFee.toFixed(2),
      //   amount.toFixed(2)
      // );
      return conversionFeePercent.toFixed(2);
    } else {
      return 0;
    }

    // return connectorTokenCount;
  }
};

export const calculateFundCost = async (
  pSmartTokenAddress,
  pReserveToken,
  pSmartTokenOwnerAddress
) => {
  const BANCOR_FORMULA_ADDRESS = await getContractAddress("BancorFormula");
  const smartTokenContract = new web3.eth.Contract(
    SMART_TOKEN_ABI,
    pSmartTokenAddress
  );
  const smartTokenSupply = await smartTokenContract.methods
    .totalSupply()
    .call();
  const erc20TokenContract = new web3.eth.Contract(
    ERC20_TOKEN_ABI,
    pReserveToken
  );
  const reserveBalance = await erc20TokenContract.methods
    .balanceOf(pSmartTokenOwnerAddress)
    .call();

  const bancorFormulaContract = new web3.eth.Contract(
    BANCOR_FORMULA_ABI,
    BANCOR_FORMULA_ADDRESS
  );
  const reserveRate = await bancorFormulaContract.methods
    .calculateFundCost(
      smartTokenSupply,
      reserveBalance,
      "1000000",
      "1000000000000000000"
    )
    .call();
  const reserveTokenDecimals = await erc20TokenContract.methods
    .decimals()
    .call();
  const reserveRateParsed = new BigNumber(reserveRate).dividedBy(
    new BigNumber(Math.pow(10, Number.parseInt(reserveTokenDecimals)))
  );
  return 1 / Number.parseFloat(reserveRateParsed.toString());
};

export const getConnectorTokens = async (tokenAddress, index) => {
  if (tokenAddress) {
    const contract = new web3.eth.Contract(BANCOR_CONVERTER_ABI, tokenAddress);
    const connectorToken = await contract.methods.connectorTokens(index).call();
    return connectorToken;
  }
};

export const getErc20TokensInfo = async tokenAddress => {
  if (tokenAddress) {
    try {
      const symbol = await getSymbol(web3, tokenAddress);
      return { symbol };
    } catch (error) {
      console.log(error);
    }
  }
};

const symbols = {};
async function getSymbol(web3, tokenAddress) {
  if (symbols[tokenAddress]) return symbols[tokenAddress];
  for (const type of ["string", "bytes32"]) {
    try {
      const contract = new web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress);
      const symbol = await rpc(contract.methods.symbol());
      if (type.startsWith("bytes")) {
        const list = [];
        for (let i = 2; i < symbol.length; i += 2) {
          const num = Number("0x" + symbol.slice(i, i + 2));
          if (32 <= num && num <= 126) list.push(num);
          else break;
        }
        symbols[tokenAddress] = String.fromCharCode(...list);
        return symbols[tokenAddress];
      }
      symbols[tokenAddress] = symbol;
      return symbols[tokenAddress];
    } catch (error) {}
  }
  symbols[tokenAddress] = "???";
  return symbols[tokenAddress];
}

async function rpc(func) {
  while (true) {
    try {
      return await func.call();
    } catch (error) {
      if (!error.message.startsWith("Invalid JSON RPC response")) throw error;
    }
  }
}

export const getTokenRate = async (pSourceTokenAddr, pTargetTokenAddr) => {
  await bancor.init({
    ethereumNodeEndpoint:
      "https://mainnet.infura.io/v3/55b4d27b09d64c4c8a6d9e381a51455d",
    ethereumContractRegistryAddress: CONTRACT_REGISTRY_ADDRESS
  });
  if (pSourceTokenAddr && pTargetTokenAddr) {
    const sourceToken = {
      blockchainType: "ethereum",
      blockchainId: pSourceTokenAddr
    };
    const targetToken = {
      blockchainType: "ethereum",
      blockchainId: pTargetTokenAddr
    };
    const rate = await bancor.getRate(sourceToken, targetToken, "1.0");
    return rate;
  } else {
    return 0;
  }
};
