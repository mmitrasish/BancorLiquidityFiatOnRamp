import { changeNetwork } from "../services/Web3Service";
const process = require("dotenv").config();

const networkConfig = {
  "1": {
    networkId: 1,
    onboardId: process.env.ONBOARD_ID,
    ethereumNodeEndpoint: process.env.ETHEREUM_NODE_ENDPOINT_MAINNET,
    contractRegistryAddress: process.env.CONTRACT_REGISTRY_ADDRESS_MAINNET,
  },
  "3": {
    networkId: 3,
    onboardId: process.env.ONBOARD_ID,
    ethereumNodeEndpoint: process.env.ETHEREUM_NODE_ENDPOINT_ROPSTEN,
    contractRegistryAddress: process.env.CONTRACT_REGISTRY_ADDRESS_ROPSTEN,
  },
};

export let appConfig = networkConfig["1"];

export const setAppConfig = (networkId) => {
  // console.log(networkId);
  appConfig = networkConfig[networkId + ""];
  changeNetwork(appConfig);
};
