import React from "react";
import "./App.scss";
import Onboard from "bnc-onboard";
import Widget from "./components/Widget";
import Header from "./components/Header";
import {
  getAllBancorLiquidityPoolTokens,
  getConnectorTokenCount,
  getConnectorTokens,
  getSmartTokensOwner,
  getErc20TokensInfo,
  getSmartTokensSymbol,
  getAccount,
  getConversionFees
} from "./services/Web3Service";
import Pools from "./components/Pools";
import PoolLiquidityWidget from "./components/PoolLiquidityWidget";

const onboard = Onboard({
  dappId: "052b3fe9-87d5-4614-b2e9-6dd81115979a", // [String] The API key created by step one above
  networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    address: address => {
      walletAddress = address;
    }
  }
});

let walletAddress;

const App = props => {
  const [address, setAddress] = React.useState();
  const [allPoolTokens, setAllPoolTokens] = React.useState([]);
  const [page, setPage] = React.useState("home");
  const [liquidityPageConfig, setLiquidityPageConfig] = React.useState();

  const changeAddress = address => {
    setAddress(address);
  };

  const changePage = page => {
    setPage(page);
  };

  const addLiquidityPageConfig = config => {
    setLiquidityPageConfig(config);
  };
  // checkAddressChange = () => {
  //   if (window.ethereum) {
  //     window.ethereum.on("accountsChanged", accounts => {
  //       if (this.state.address !== undefined) {
  //         this.setAddress(accounts[0]);
  //       }
  //     });
  //   }
  // };
  React.useEffect(() => {
    getAllPoolItems();
  }, []);

  React.useEffect(() => {
    console.log("Entered");
    setAddress(walletAddress);
  }, [walletAddress]);

  const getAllPoolItems = async () => {
    const address = await getAccount();
    changeAddress(address);
    const allTokens = await getAllBancorLiquidityPoolTokens();
    let allTokenDetails = await Promise.all(
      allTokens.map(async (token, index) => {
        if (token) {
          let tokenDetail = {};
          const ownerAddress = await getSmartTokensOwner(token);
          const tokenSymbol = await getSmartTokensSymbol(token);
          tokenDetail.smartTokenAddress = token;
          tokenDetail.ownerAddress = ownerAddress;
          tokenDetail.symbol = tokenSymbol;
          if (ownerAddress) {
            // const conversionFeePercent = await getConversionFees(ownerAddress);
            tokenDetail.conversionFeePercent = 0;
            const connectorTokenCount = await getConnectorTokenCount(
              ownerAddress
            );
            tokenDetail.connectorTokenCount = connectorTokenCount;
            const connectorTokens = [];
            for (let i = 0; i < connectorTokenCount; i++) {
              const tokenAddress = await getConnectorTokens(ownerAddress, i);
              const tokenInfo = await getErc20TokensInfo(tokenAddress);
              connectorTokens.push({
                address: tokenAddress,
                info: tokenInfo
              });
            }
            tokenDetail.connectorTokens = connectorTokens;
          }
          // console.log(tokenDetail);
          return tokenDetail;
        }
      })
    );
    allTokenDetails = allTokenDetails.filter(
      token => Number.parseInt(token.connectorTokenCount) === 2
    );
    // console.log(allTokenDetails.length);
    setAllPoolTokens(allTokenDetails);
  };

  return (
    <div className="App">
      <Header setAddress={changeAddress} address={address} />
      {page === "home" ? (
        <Pools
          allPoolTokens={allPoolTokens}
          changePage={changePage}
          setLiquidityPageConfig={addLiquidityPageConfig}
        />
      ) : null}
      {page === "liquidity" ? (
        <PoolLiquidityWidget config={liquidityPageConfig} />
      ) : null}
      {/* <Widget /> */}
    </div>
  );
};

export default App;
