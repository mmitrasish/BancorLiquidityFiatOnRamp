import { changeNetwork } from "../services/Web3Service";

const networkConfig = {
  "1": {
    networkId: 1,
    onboardId: "052b3fe9-87d5-4614-b2e9-6dd81115979a",
    ethereumNodeEndpoint:
      "https://mainnet.infura.io/v3/55b4d27b09d64c4c8a6d9e381a51455d",
    contractRegistryAddress: "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4",
  },
  "3": {
    networkId: 3,
    onboardId: "052b3fe9-87d5-4614-b2e9-6dd81115979a",
    ethereumNodeEndpoint:
      "https://ropsten.infura.io/v3/55b4d27b09d64c4c8a6d9e381a51455d",
    contractRegistryAddress: "0xFD95E724962fCfC269010A0c6700Aa09D5de3074",
  },
};

export let appConfig = networkConfig["3"];

export const setAppConfig = (networkId) => {
  // console.log(networkId);
  appConfig = networkConfig[networkId + ""];
  changeNetwork(appConfig);
};
