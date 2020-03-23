import * as Web3 from "web3";
import CONVERTER_REGISTRY_ABI from "../contracts/BancorConverterRegistry.json";
import CONTRACT_REGISTRY_ABI from "../contracts/ContractRegistry.json";

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
  let web3 = null;
  try {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      web3 = new Web3(window.ethereum);
      const registry = new web3.eth.Contract(
        CONTRACT_REGISTRY_ABI,
        CONTRACT_REGISTRY_ADDRESS
      );
      const address = await registry.methods
        .addressOf(web3.utils.fromAscii(contractName))
        .call();
      return address;
    } else {
      web3 = new Web3(
        new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
      );
      window.readOnly = true;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getAllBancorLiquidityPoolTokens = async () => {
  let web3 = null;
  try {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      web3 = new Web3(window.ethereum);
      const CONVERTER_REGISTRY_ADDRESS = await getContractAddress(
        "BancorConverterRegistry"
      );
      console.log(CONVERTER_REGISTRY_ADDRESS);
      const contract = new web3.eth.Contract(
        CONVERTER_REGISTRY_ABI,
        CONVERTER_REGISTRY_ADDRESS
      );
      const poolTokens = await contract.methods.getSmartTokens().call();
      console.log(poolTokens);
    } else {
      web3 = new Web3(
        new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
      );
      window.readOnly = true;
    }
  } catch (error) {
    console.log(error);
  }
};
