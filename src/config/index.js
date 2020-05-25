import { changeNetwork } from "../services/Web3Service";
const POOL_TOKENS_ROPSTEN = [
  {
    smartTokenAddress: "0xFa04B3fEBC392F943B52348F7D50fa6894BCE877",
    ownerAddress: "0x7cF7a9ED8Af13BF13384dD408653454BF3E9574F",
    symbol: "DAIBNC",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x62bd9D98d4E188e281D7B78e29334969bbE1053c",
        info: { symbol: "BNT" },
      },
      {
        address: "0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd",
        info: { symbol: "DAI" },
      },
    ],
  },
  {
    smartTokenAddress: "0xAE2c9E926310D266eBF267293f3e6F47D6f5D764",
    ownerAddress: "0x4cc6a2cad23f348e1198AD365818FdeFbae425Ac",
    symbol: "BATBNT",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x62bd9D98d4E188e281D7B78e29334969bbE1053c",
        info: { symbol: "BNT" },
      },
      {
        address: "0x85B24b3517E3aC7bf72a14516160541A60cFF19d",
        info: { symbol: "BAT" },
      },
    ],
  },
  {
    smartTokenAddress: "0xDD78D22F53441b6B6216cE69E6dCAe6F7c9252b6",
    ownerAddress: "0xF5fe6280db283ba6975d72A3bD39bF57840433F7",
    symbol: "ETHBNT",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x62bd9D98d4E188e281D7B78e29334969bbE1053c",
        info: { symbol: "BNT" },
      },
      {
        address: "0xD368b98d03855835E2923Dc000b3f9c2EBF1b27b",
        info: { symbol: "ETH" },
      },
    ],
  },
  {
    smartTokenAddress: "0x9FbD5cdD251260B5f242CbEBf2B0A96A1209beC2",
    ownerAddress: "0xc3BC3db307b07Dd88bb31AE95d3217DaC97b7f16",
    symbol: "DAIBNT",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x62bd9D98d4E188e281D7B78e29334969bbE1053c",
        info: { symbol: "BNT" },
      },
      {
        address: "0x6CE27497A64fFFb5517AA4aeE908b1E7EB63B9fF",
        info: { symbol: "cDAI" },
      },
    ],
  },
];
const POOL_TOKENS_MAINNET = [
  {
    smartTokenAddress: "0xE5Df055773Bf9710053923599504831c7DBdD697",
    ownerAddress: "0xd99b0EFeeA095b87C5aD8BCc8B955eD5Ca5Ba146",
    symbol: "DAIBNT",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
        info: { symbol: "BNT" },
      },
      {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        info: { symbol: "DAI" },
      },
    ],
  },
  {
    smartTokenAddress: "0xcb913ED43e43cc7Cec1D77243bA381615101E7E4",
    ownerAddress: "0x06f7Bf937Dec0C413a2E0464Bb300C4d464bb891",
    symbol: "DAIUSDB",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x309627af60F0926daa6041B8279484312f2bf060",
        info: { symbol: "USDB" },
      },
      {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        info: { symbol: "DAI" },
      },
    ],
  },
  {
    smartTokenAddress: "0xb1CD6e4153B2a390Cf00A6556b0fC1458C4A5533",
    ownerAddress: "0xd3ec78814966Ca1Eb4c923aF4Da86BF7e6c743bA",
    symbol: "ETHBNT",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
        info: { symbol: "BNT" },
      },
      {
        address: "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315",
        info: { symbol: "ETH" },
      },
    ],
  },
  {
    smartTokenAddress: "0x482c31355F4f7966fFcD38eC5c9635ACAe5F4D4F",
    ownerAddress: "0x886f00Bc5FeB7EC1B1c18441c4DC6dcd341d0E69",
    symbol: "ETHUSDB",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x309627af60F0926daa6041B8279484312f2bf060",
        info: { symbol: "USDB" },
      },
      {
        address: "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315",
        info: { symbol: "ETH" },
      },
    ],
  },
  {
    smartTokenAddress: "0x038869E70E0f927EaA42F75d1E3bF83008e4c88E",
    ownerAddress: "0x1adD247e9a3E63490e1935AF8ef361505A285F77",
    symbol: "USDCBNT",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
        info: { symbol: "BNT" },
      },
      {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        info: { symbol: "USDC" },
      },
    ],
  },
  {
    smartTokenAddress: "0x71c414DaCe65ABff9351E215d25f17F675241c0A",
    ownerAddress: "0x868229B43a8BCBDFfb244DDE874f52Ade0B1c132",
    symbol: "USDCUSDB",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x309627af60F0926daa6041B8279484312f2bf060",
        info: { symbol: "USDB" },
      },
      {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        info: { symbol: "USDC" },
      },
    ],
  },
  {
    smartTokenAddress: "0xEC25A08C05Ba76fD8C743A1F47d9876ea3659BBE",
    ownerAddress: "0x30ab146C0D877Ff32F44591c09e8aC3eb9955C5f",
    symbol: "USDTBNT",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
        info: { symbol: "BNT" },
      },
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        info: { symbol: "USDT" },
      },
    ],
  },
  {
    smartTokenAddress: "0xF2ff22976B973d6bcC17a7dC93B719162ADA2045",
    ownerAddress: "0x39e5AAE547752c1239b4738e75cDF705c25adeA6",
    symbol: "USDTUSDB",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x309627af60F0926daa6041B8279484312f2bf060",
        info: { symbol: "USDB" },
      },
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        info: { symbol: "USDT" },
      },
    ],
  },
  {
    smartTokenAddress: "0x131da075a2832549128e93AcC2b54174045232Cf",
    ownerAddress: "0xBd19F30adDE367Fe06c0076D690d434bF945A8Fc",
    symbol: "BATBNT",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
        info: { symbol: "BNT" },
      },
      {
        address: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
        info: { symbol: "BAT" },
      },
    ],
  },
  {
    smartTokenAddress: "0x7FfE011B93e06FA14CE5A6E00320937652664366",
    ownerAddress: "0xD6DD7d29EcAB65D092942d42c4F360Fde41693Dc",
    symbol: "BATUSDB",
    conversionFeePercent: 0,
    connectorTokenCount: "2",
    connectorTokens: [
      {
        address: "0x309627af60F0926daa6041B8279484312f2bf060",
        info: { symbol: "USDB" },
      },
      {
        address: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
        info: { symbol: "BAT" },
      },
    ],
  },
];

const networkConfig = {
  "1": {
    networkId: 1,
    onboardId: "052b3fe9-87d5-4614-b2e9-6dd81115979a",
    ethereumNodeEndpoint:
      "https://mainnet.infura.io/v3/55b4d27b09d64c4c8a6d9e381a51455d",
    contractRegistryAddress: "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4",
    poolTokens: POOL_TOKENS_MAINNET,
  },
  "3": {
    networkId: 3,
    onboardId: "052b3fe9-87d5-4614-b2e9-6dd81115979a",
    ethereumNodeEndpoint:
      "https://ropsten.infura.io/v3/55b4d27b09d64c4c8a6d9e381a51455d",
    contractRegistryAddress: "0xFD95E724962fCfC269010A0c6700Aa09D5de3074",
    poolTokens: POOL_TOKENS_ROPSTEN,
  },
};

export let appConfig = networkConfig["3"];

export const setAppConfig = (networkId) => {
  // console.log(networkId);
  appConfig = networkConfig[networkId + ""];
  changeNetwork(appConfig);
};
