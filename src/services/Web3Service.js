import * as Web3 from "web3";
import Onboard from "bnc-onboard";
import BigNumber from "bignumber.js";
import { getAddressBalances } from "eth-balance-checker/lib/web3";
import BANCOR_CONVERTER_REGISTRY_ABI from "../contracts/BancorConverterRegistry.json";
import BANCOR_CONVERTER_ABI from "../contracts/BancorConverter.json";
import BANCOR_FORMULA_ABI from "../contracts/BancorFormula.json";
import BANCOR_NETWORK_ABI from "../contracts/BancorNetwork.json";
import CONTRACT_REGISTRY_ABI from "../contracts/ContractRegistry.json";
import SMART_TOKEN_ABI from "../contracts/SmartToken.json";
import ERC20_TOKEN_ABI from "../contracts/ERC20Token.json";
import { appConfig } from "../config";

const BancorSDK = require("bancor-sdk").SDK;

let CONTRACT_REGISTRY_ADDRESS = appConfig.contractRegistryAddress;

let web3 = new Web3(Web3.givenProvider);

const onboard = Onboard({
  dappId: appConfig.onboardId, // [String] The API key created by step one above
  networkId: appConfig.networkId, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: (wallet) => {
      web3 = new Web3(wallet.provider);
    },
  },
  darkMode: true,
});

export const changeNetwork = (config) => {
  onboard.config({ networkId: config.networkId });
  CONTRACT_REGISTRY_ADDRESS = config.contractRegistryAddress;
};

export const getWalletBalance = async () => {
  const currentState = onboard.getState();
  const balance = currentState.balance;
  console.log(balance);
  let userBalance = "0";
  if (balance) {
    userBalance = web3.utils.fromWei(balance);
  }
  return userBalance;
};

export const getAccount = async () => {
  await onboard.walletSelect();
  await onboard.walletCheck();
  const currentState = onboard.getState();

  return currentState.address;
};

export const getContractAddress = async (contractName) => {
  const registry = new web3.eth.Contract(
    CONTRACT_REGISTRY_ABI,
    CONTRACT_REGISTRY_ADDRESS
  );
  const address = await registry.methods
    .addressOf(web3.utils.fromAscii(contractName))
    .call();
  return address;
};

export const contractERC20 = async (address) => {
  const erc20TokenContract = new web3.eth.Contract(ERC20_TOKEN_ABI, address);
  return erc20TokenContract;
};

export const getAmountInEth = (pAmount) => {
  const amount = web3.utils.fromWei(pAmount + "");
  return amount;
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

export const getSmartTokensOwner = async (smartTokenAddress) => {
  const contract = new web3.eth.Contract(SMART_TOKEN_ABI, smartTokenAddress);
  const ownerAddress = await contract.methods.owner().call();
  return ownerAddress;
};

export const getSmartTokensSymbol = async (smartTokenAddress) => {
  const contract = new web3.eth.Contract(SMART_TOKEN_ABI, smartTokenAddress);
  const tokenSymbol = await contract.methods.symbol().call();
  return tokenSymbol;
};

export const getConnectorTokenCount = async (tokenAddress) => {
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

export const getErc20TokensInfo = async (tokenAddress) => {
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

export const getTokenRate = async (
  pSourceTokenAddr,
  pTargetTokenAddr,
  pInputAmount
) => {
  try {
    const bancorSDK = await BancorSDK.create({
      ethereumNodeEndpoint: appConfig.ethereumNodeEndpoint,
    });

    if (pSourceTokenAddr && pTargetTokenAddr) {
      const sourceToken = {
        blockchainType: "ethereum",
        blockchainId: pSourceTokenAddr,
      };
      const targetToken = {
        blockchainType: "ethereum",
        blockchainId: pTargetTokenAddr,
      };
      // const inputAmount = await getAmountInEth(pInputAmount);
      const inputAmount = pInputAmount;
      console.log(inputAmount)
      const paths_rates = await bancorSDK.pricing.getPathAndRate(
        sourceToken,
        targetToken,
        inputAmount
      );
      await BancorSDK.destroy(bancorSDK);
      return paths_rates;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
  }
};

export const estimateSwapTokens = async (
  pSourceTokenAddr,
  pTargetTokenAddr,
  pInputAmount
) => {
  const getPathAndRate = await getTokenRate(
    pSourceTokenAddr,
    pTargetTokenAddr,
    pInputAmount
  );

  console.log(getPathAndRate);

  const bestRate = getPathAndRate.rate;
  // console.log(pSourceTokenAddr, pTargetTokenAddr);
  const bestPath = getPathAndRate.path.map((token) => token.blockchainId);
  const BANCOR_NETWORK_ADDRESS = await getContractAddress("BancorNetwork");
  const bancorNetworkContract = new web3.eth.Contract(
    BANCOR_NETWORK_ABI,
    BANCOR_NETWORK_ADDRESS
  );

  const inputAmount = web3.utils.toWei(pInputAmount + "");
  
  const expectedReturn = await bancorNetworkContract.methods
    .getReturnByPath(bestPath, inputAmount)
    .call();
  console.log(expectedReturn);
  const txfee = expectedReturn[1];
  return { bestRate, bestPath, txfee };
};

export const swapTokens = async (
  pAmount,
  pSourceTokenAddr,
  pTargetTokenAddr,
  pIsEth,
  pUserAddress
) => {
  const amount = web3.utils.toWei(pAmount + "");
  const BANCOR_NETWORK_ADDRESS = await getContractAddress("BancorNetwork");
  const bancorNetworkContract = new web3.eth.Contract(
    BANCOR_NETWORK_ABI,
    BANCOR_NETWORK_ADDRESS
  );
  const getPathAndRate = await getTokenRate(pSourceTokenAddr, pTargetTokenAddr, pAmount);
  // const path = getPathAndRate.path;
  const affiliateAccount = "0xEab48A633Ada8565f2cdeB5cDE162909Fd64b749";
  if (pIsEth) {
    const swapEth = await bancorNetworkContract.methods
      .convert2(getPathAndRate.path, amount, "1", affiliateAccount, "20000")
      .send({ from: pUserAddress, value: amount });
    return swapEth;
  } else {
    const source = await contractERC20(pSourceTokenAddr);
    await source.methods
      .approve(BANCOR_NETWORK_ADDRESS, amount)
      .send({ from: pUserAddress });

    const swapT = await bancorNetworkContract.methods
      .claimAndConvert2(getPathAndRate.path, amount, "1", affiliateAccount, "20000")
      .send({ from: pUserAddress });
    return swapT;
  }
};

export const getConversionFees = async (tokenAddress) => {
  if (tokenAddress) {
    const contract = new web3.eth.Contract(BANCOR_CONVERTER_ABI, tokenAddress);
    const conversionEvents = await contract.getPastEvents("Conversion", {
      fromBlock: 0,
      toBlock: "latest", // You can also specify 'latest'
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
  await Promise.all(
    pReserveTokens.map(async (token) => {
      const reserveBalance = await getReserveBalance(
        token,
        pSmartTokenOwnerAddress
      );
      return reserveBalance;
    })
  );
  // console.log(liquidityDepth);
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

export const getBalances = async (pTokens) => {
  const currentState = onboard.getState();
  const walletAddress = currentState.address;
  await getAddressBalances(web3, walletAddress, pTokens);
  // console.log(balances);
};

export const addLiquidity = async (
  pSmartTokenAddress,
  pAmount,
  pOwnerAddress,
  pResTokensDetail,
  userAddress
) => {
  await Promise.all(
    pResTokensDetail.map((resToken) => {
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
    pResTokensDetail.map(async (resToken) => {
      const erc20TokenContract = new web3.eth.Contract(
        ERC20_TOKEN_ABI,
        resToken.address
      );
      const tokenAmount = await calculateFundCost(
        pSmartTokenAddress,
        resToken.address,
        pOwnerAddress,
        pAmount
      );
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
  return fund;
  // console.log(fund);
};

export const withdrawLiquidity = async (
  pAmount,
  pOwnerAddress,
  userAddress
) => {
  const bancorConverterContract = new web3.eth.Contract(
    BANCOR_CONVERTER_ABI,
    pOwnerAddress
  );
  const liquidateAmount = web3.utils.toWei(pAmount + "");

  const liquidity = await bancorConverterContract.methods
    .liquidate(liquidateAmount)
    .send({ from: userAddress });
  // console.log(fund);
  return liquidity;
};

/**
 * @dev To get the user Balance
 * @param {*} pTokenAddress
 * @param {*} pUserAddress
 * @param {*} pIsEth
 * @returns {balance in wei} balance
 */
export const getUserBalance = async (pTokenAddress, pUserAddress, pIsEth) => {
  let balance;
  if (!pIsEth) {
    const token = await contractERC20(pTokenAddress);
    balance = await token.methods.balanceOf(pUserAddress).call();
  } else {
    balance = await web3.eth.getBalance(pUserAddress);
  }
  return balance;
};

/**
 * @dev Check for the user balance and if not then find the required eth for (topup + 0.1)
 * @param {In wei} amount
 * @param {address of reserve token} pTokenAddress
 * @param {*} pUserAddress
 * @param {*} pIsEth
 */
export const checkDeposit = async (
  amount,
  pTokenAddress,
  pWethAddress,
  pUserAddress,
  pIsEth
) => {
  let topup;
  // console.log(pWethAddress, "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315");
  const balance = await getUserBalance(pTokenAddress, pUserAddress);
  // check = amount < balance;
  const diff = amount - balance;
  const inputAmount = getAmountInEth(diff);
  const check = !(diff > 0);
  if (!check) {
    if (!pIsEth) {
      const getRate = await getTokenRate(
        pTokenAddress,
        pWethAddress,
        inputAmount
      );
      const bestRate = getRate.rate;
      topup = Math.ceil(bestRate * 1.02); // 2% increament for safe transaction.
    }
    topup = Number.parseFloat(getAmountInEth(topup));
    // console.log(topup);
  }
  return { check, topup, diff };
};

export const checkWithdraw = async (amount, pTokenAddress, pUserAddress) => {
  let check;
  let diff;
  const balance = await getUserBalance(pTokenAddress, pUserAddress);
  // check = amount < balance;

  diff = amount - balance;
  // console.log(amount, balance, diff);
  check = !(diff > 0);
  return { check };
};
// To check if eth is enough.
export const checkEthForTopUp = async (amount, pUserAddress) => {
  let balance = await web3.eth.getBalance(pUserAddress);
  balance = Number.parseFloat(web3.utils.fromWei(balance));
  // console.log(amount, balance);
  const check = amount >= balance;
  return check;
};

export const getRemainingEthAmount = async (amount, pUserAddress) => {
  let balance = await web3.eth.getBalance(pUserAddress);
  balance = Number.parseFloat(web3.utils.fromWei(balance));
  const remAmt = amount - balance;
  return remAmt;
};

export const convertTokenDecimals = async (pTokenAddress, pAmount) => {
  const erc20TokenContract = await contractERC20(pTokenAddress);
  const reserveTokenDecimals = await erc20TokenContract.methods
    .decimals()
    .call();
  const reserveAmountParsed = new BigNumber(pAmount).dividedBy(
    new BigNumber(Math.pow(10, Number.parseInt(reserveTokenDecimals)))
  );
  return Number.parseFloat(reserveAmountParsed.toString());
};

// export const liquidityDepth = async (
//   pSmartTokenAddress,
//   pReserveToken,
//   pSmartTokenOwnerAddress,
//   pAmount
// ) => {
//   const reserveTokens = calculateFundCost;
// };
