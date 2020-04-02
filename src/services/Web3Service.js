import * as Web3 from "web3";
import Onboard from "bnc-onboard";
import BigNumber from "bignumber.js";
import { getAddressBalances } from "eth-balance-checker/lib/web3";
import BANCOR_CONVERTER_REGISTRY_ABI from "../contracts/BancorConverterRegistry.json";
import BANCOR_CONVERTER_ABI from "../contracts/BancorConverter.json";
import BANCOR_FORMULA_ABI from "../contracts/BancorFormula.json";
import BANCOR_NETWORK_ABI from "../contracts/BancorNetwork.json";
import BANCOR_NETWORK_PATH_FINDER_ABI from "../contracts/BancorNetworkPathFinder.json";
import CONTRACT_REGISTRY_ABI from "../contracts/ContractRegistry.json";
import SMART_TOKEN_ABI from "../contracts/SmartToken.json";
import ERC20_TOKEN_ABI from "../contracts/ERC20Token.json";
import { appConfig } from "../config";

const SDK = require("bancor-sdk").SDK;

let CONTRACT_REGISTRY_ADDRESS = appConfig.contractRegistryAddress;

let web3;

const onboard = Onboard({
  dappId: appConfig.onboardId, // [String] The API key created by step one above
  networkId: appConfig.networkId, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: wallet => {
      web3 = new Web3(wallet.provider);
    }
  }
});

export const changeNetwork = config => {
  onboard.config({ networkId: config.networkId });
  CONTRACT_REGISTRY_ADDRESS = config.contractRegistryAddress;
};

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
  try {
    const sdk = await SDK.create({
      ethereumNodeEndpoint: appConfig.ethereumNodeEndpoint
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
      const rate = await sdk.getCheapestPathRate(sourceToken, targetToken, "1");
      await SDK.destroy(sdk);
      return rate;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
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

export const getReserveBalance = async (
  pReserveTokenAddr,
  pSmartTokenOwnerAddress
) => {
  const erc20TokenContract = new web3.eth.Contract(
    ERC20_TOKEN_ABI,
    pReserveTokenAddr
  );
  const reserveBalance = await erc20TokenContract.methods
    .balanceOf(pSmartTokenOwnerAddress)
    .call();
  return reserveBalance;
};

export const getLiquidityDepth = async (
  pReserveTokens,
  pSmartTokenOwnerAddress
) => {
  const liquidityDepth = await Promise.all(
    pReserveTokens.map(async token => {
      const reserveBalance = await getReserveBalance(
        token,
        pSmartTokenOwnerAddress
      );
      return reserveBalance;
    })
  );
  console.log(liquidityDepth);
};

export const calculateFundCostRate = async (
  pSmartTokenAddress,
  pReserveToken,
  pSmartTokenOwnerAddress,
  pAmount
) => {
  const BANCOR_FORMULA_ADDRESS = await getContractAddress("BancorFormula");
  const smartTokenContract = new web3.eth.Contract(
    SMART_TOKEN_ABI,
    pSmartTokenAddress
  );
  const smartTokenSupply = await smartTokenContract.methods
    .totalSupply()
    .call();
  const reserveBalance = await getReserveBalance(
    pReserveToken,
    pSmartTokenOwnerAddress
  );

  const bancorFormulaContract = new web3.eth.Contract(
    BANCOR_FORMULA_ABI,
    BANCOR_FORMULA_ADDRESS
  );
  const tokenAmount = web3.utils.toWei(pAmount + "");
  const reserveRate = await bancorFormulaContract.methods
    .calculateFundCost(smartTokenSupply, reserveBalance, "1000000", tokenAmount)
    .call();
  const erc20TokenContract = new web3.eth.Contract(
    ERC20_TOKEN_ABI,
    pReserveToken
  );
  const reserveTokenDecimals = await erc20TokenContract.methods
    .decimals()
    .call();
  const reserveRateParsed = new BigNumber(reserveRate).dividedBy(
    new BigNumber(Math.pow(10, Number.parseInt(reserveTokenDecimals)))
  );
  return 1 / Number.parseFloat(reserveRateParsed.toString());
};

export const calculateFundCost = async (
  pSmartTokenAddress,
  pReserveToken,
  pSmartTokenOwnerAddress,
  pAmount
) => {
  const BANCOR_FORMULA_ADDRESS = await getContractAddress("BancorFormula");
  const smartTokenContract = new web3.eth.Contract(
    SMART_TOKEN_ABI,
    pSmartTokenAddress
  );
  const smartTokenSupply = await smartTokenContract.methods
    .totalSupply()
    .call();
  const reserveBalance = await getReserveBalance(
    pReserveToken,
    pSmartTokenOwnerAddress
  );

  const bancorFormulaContract = new web3.eth.Contract(
    BANCOR_FORMULA_ABI,
    BANCOR_FORMULA_ADDRESS
  );
  const tokenAmount = web3.utils.toWei(pAmount + "");
  const reserveCost = await bancorFormulaContract.methods
    .calculateFundCost(smartTokenSupply, reserveBalance, "1000000", tokenAmount)
    .call();

  return new Promise((resolve, reject) => {
    resolve(reserveCost);
  });
};

export const getBalances = async pTokens => {
  const currentState = onboard.getState();
  const walletAddress = currentState.address;
  const balances = await getAddressBalances(web3, walletAddress, pTokens);
  // console.log(balances);
};

export const addLiquidity = async (
  pAmount,
  pOwnerAddress,
  pResTokensDetail,
  userAddress
) => {
  await Promise.all(
    pResTokensDetail.map(resToken => {
      const erc20TokenContract = new web3.eth.Contract(
        ERC20_TOKEN_ABI,
        resToken.address
      );
      const tokenAmount = web3.utils.toWei("0");
      return erc20TokenContract.methods
        .approve(pOwnerAddress, tokenAmount)
        .send({ from: userAddress });
    })
  );
  await Promise.all(
    pResTokensDetail.map(async resToken => {
      const erc20TokenContract = new web3.eth.Contract(
        ERC20_TOKEN_ABI,
        resToken.address
      );
      const tokenAmount = web3.utils.toWei("1000");
      return erc20TokenContract.methods
        .approve(pOwnerAddress, tokenAmount)
        .send({ from: userAddress });
    })
  );

  const bancorConverterContract = new web3.eth.Contract(
    BANCOR_CONVERTER_ABI,
    pOwnerAddress
  );
  const fundAmount = web3.utils.toWei(pAmount + "");
  const fund = await bancorConverterContract.methods
    .fund(fundAmount)
    .send({ from: userAddress });
  // console.log(fund);
};

export const withdrawLiquidity = async (
  pAmount,
  pOwnerAddress,
  pResTokensDetail,
  userAddress
) => {
  await Promise.all(
    pResTokensDetail.map(resToken => {
      const erc20TokenContract = new web3.eth.Contract(
        ERC20_TOKEN_ABI,
        resToken.address
      );
      const tokenAmount = web3.utils.toWei("0");
      return erc20TokenContract.methods
        .approve(pOwnerAddress, tokenAmount)
        .send({ from: userAddress });
    })
  );
  await Promise.all(
    pResTokensDetail.map(async resToken => {
      const erc20TokenContract = new web3.eth.Contract(
        ERC20_TOKEN_ABI,
        resToken.address
      );
      const tokenAmount = web3.utils.toWei("1000");
      return erc20TokenContract.methods
        .approve(pOwnerAddress, tokenAmount)
        .send({ from: userAddress });
    })
  );

  const bancorConverterContract = new web3.eth.Contract(
    BANCOR_CONVERTER_ABI,
    pOwnerAddress
  );
  const liquidateAmount = web3.utils.toWei(pAmount + "");

  const liquidate = await bancorConverterContract.methods
    .liquidate(liquidateAmount)
    .send({ from: userAddress });
  // console.log(fund);
};

export const contractERC20 = async address => {
  const erc20TokenContract = new web3.eth.Contract(ERC20_TOKEN_ABI, address);
  return erc20TokenContract;
};

export const getAmountInEth = pAmount => {
  const amount = web3.utils.fromWei(pAmount + "");
  return amount;
};

export const swapTokens = async (
  pAmount,
  pTransferAddress,
  pReceiveAddress,
  pIsEth,
  pUserAddress
) => {
  const amount = web3.utils.toWei(pAmount + "");
  const BANCOR_NETWORK_PATH_FINDER_ADDRESS = await getContractAddress(
    "BancorNetworkPathFinder"
  );
  const BANCOR_NETWORK_ADDRESS = await getContractAddress("BancorNetwork");

  const bancorNetworkPathFinderContract = new web3.eth.Contract(
    BANCOR_NETWORK_PATH_FINDER_ABI,
    BANCOR_NETWORK_PATH_FINDER_ADDRESS
  );
  const bancorNetworkContract = new web3.eth.Contract(
    BANCOR_NETWORK_ABI,
    BANCOR_NETWORK_ADDRESS
  );
  const path = await bancorNetworkPathFinderContract.methods
    .generatePath(pTransferAddress, pReceiveAddress)
    .call();

  const from = "0x75e4DD0587663Fce5B2D9aF7fbED3AC54342d3dB";
  // console.log(path);
  if (pIsEth) {
    const swapEth = await bancorNetworkContract.methods
      .convert2(path, amount, "1", from, "10000")
      .send({ from: pUserAddress, value: amount });
    return swapEth;
  } else {
    const transfer = await contractERC20(pTransferAddress);
    await transfer.methods
      .approve(BANCOR_NETWORK_ADDRESS, amount)
      .send({ from: pUserAddress });

    const swapT = await bancorNetworkContract.methods
      .claimAndConvert2(path, amount, "1", from, "10000")
      .send({ from: pUserAddress });
    return swapT;
  }
};

export const getUserTokenBalance = async (pTokenAddress, pUserAddress) => {
  const token = await contractERC20(pTokenAddress);
  const balanceOfToken = await token.methods.balanceOf();
  return balanceOfToken;
};

export const getUserEthBalance = async pUserAddress => {
  const balance = await web3.eth.getBalance(pUserAddress);
  return balance;
};

export const checkDeposit = async (
  amount,
  pTokenAddress,
  pUserAddress,
  pIsEth
) => {
  let check;
  if (!pIsEth) {
    check = amount >= getUserBalance(pTokenAddress, pUserAddress);
  } else {
    check = amount >= getUserEthBalance(pTokenAddress, pUserAddress);
  }
  return check;
};

export const finalizeLiquidity = async() =>{
  // To check the if there is any difference in amount we have
  // prompt for eth topup
  // swap from eth to required tokens.
  // add Liquidity now.
}