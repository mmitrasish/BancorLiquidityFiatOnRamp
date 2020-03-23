import * as Web3 from "web3";
import BANCOR_CONVERTER_REGISTRY_ABI from "../contracts/BancorConverterRegistry.json";
import BANCOR_CONVERTER_ABI from "../contracts/BancorConverter.json";
import CONTRACT_REGISTRY_ABI from "../contracts/ContractRegistry.json";
import SMART_TOKEN_ABI from "../contracts/SmartToken.json";
import ERC20_TOKEN_ABI from "../contracts/ERC20Token.json";

const CONTRACT_REGISTRY_ADDRESS = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";

export const getAccount = async () => {
  let account = null;
  try {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      account = await window.ethereum.enable();
      window.web3 = new Web3(window.ethereum);
      window.readOnly = false;
    } else {
      window.web3 = new Web3(
        new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
      );
      window.readOnly = true;
    }
  } catch (error) {
    console.log(error);
  }
  return account;
};

export const getContractAddress = async contractName => {
  let web3 = web3Connector();
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
  let web3 = web3Connector();
  const BANCOR_CONVERTER_REGISTRY_ADDRESS = await getContractAddress(
    "BancorConverterRegistry"
  );
  console.log(BANCOR_CONVERTER_REGISTRY_ADDRESS);
  const contract = new web3.eth.Contract(
    BANCOR_CONVERTER_REGISTRY_ABI,
    BANCOR_CONVERTER_REGISTRY_ADDRESS
  );
  const poolTokens = await contract.methods.getSmartTokens().call();
  return poolTokens;
};

export const getSmartTokensOwner = async smartTokenAddress => {
  let web3 = web3Connector();
  const contract = new web3.eth.Contract(SMART_TOKEN_ABI, smartTokenAddress);
  const ownerAddress = await contract.methods.owner().call();
  return ownerAddress;
};

export const getConnectorTokenCount = async tokenAddress => {
  if (tokenAddress) {
    let web3 = web3Connector();
    const contract = new web3.eth.Contract(BANCOR_CONVERTER_ABI, tokenAddress);
    const connectorTokenCount = await contract.methods
      .connectorTokenCount()
      .call();
    return connectorTokenCount;
  }
};

export const getConnectorTokens = async (tokenAddress, index) => {
  if (tokenAddress) {
    let web3 = web3Connector();
    const contract = new web3.eth.Contract(BANCOR_CONVERTER_ABI, tokenAddress);
    const connectorToken = await contract.methods.connectorTokens(index).call();
    return connectorToken;
  }
};

export const getErc20TokensInfo = async tokenAddress => {
  if (tokenAddress) {
    try {
      let web3 = web3Connector();
      const contract = new web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress);
      const name = await contract.methods.name().call();
      const symbol = await contract.methods.symbol().call();
      return { name, symbol };
    } catch (error) {
      console.log(error);
    }
  }
};

const web3Connector = () => {
  let web3 = null;
  try {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      web3 = new Web3(window.ethereum);
    } else {
      web3 = new Web3(
        new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
      );
      window.readOnly = true;
    }
  } catch (error) {
    console.log(error);
  }
  return web3;
};
