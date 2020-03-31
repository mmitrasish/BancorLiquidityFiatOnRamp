import React from "react";
import "./App.scss";
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
import { appConfig, setAppConfig } from "./config";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: undefined,
      allPoolTokens: [],
      filteredPoolTokens: [],
      page: "home",
      liquidityPageConfig: undefined
    };
  }

  changeAddress = address => {
    this.setState({ address });
  };

  changePage = page => {
    this.setState({ page });
  };

  addLiquidityPageConfig = config => {
    this.setState({ liquidityPageConfig: config });
  };

  checkEthereumChange = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accounts => {
        if (this.state.address !== undefined) {
          this.setState({ address: accounts[0] });
        }
      });

      window.ethereum.on("networkChanged", async changedChainId => {
        if (
          this.state.address &&
          Number.parseInt(changedChainId) !==
            Number.parseInt(appConfig.networkId)
        ) {
          // console.log(
          //   "Entered",
          //   changedChainId,
          //   appConfig.networkId,
          //   this.state.address
          // );
          setAppConfig(changedChainId);
          this.getAllPoolItems();
          this.setState({ page: "home" });
        }
      });
    }
  };

  componentDidMount() {
    this.startProcess();
  }

  startProcess = async () => {
    if (window.ethereum.networkVersion) {
      setAppConfig(window.ethereum.networkVersion);
    } else {
      setAppConfig(1);
    }
    const address = await getAccount();
    console.log(address);
    this.changeAddress(address);
    this.getAllPoolItems();
  };

  getAllPoolItems = async pValue => {
    this.setState({ allPoolTokens: [], filteredPoolTokens: [] });
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
    this.setState({
      allPoolTokens: allTokenDetails,
      filteredPoolTokens: allTokenDetails
    });
  };

  filterPoolTokens = searchTokenSymbol => {
    const { allPoolTokens } = this.state;
    const filteredPoolTokens = allPoolTokens.filter(token => {
      if (
        token.symbol.toLowerCase().indexOf(searchTokenSymbol.toLowerCase()) !==
        -1
      )
        return true;
      if (
        token.connectorTokens[0].info.symbol
          .toLowerCase()
          .indexOf(searchTokenSymbol.toLowerCase()) !== -1
      )
        return true;

      if (
        token.connectorTokens[1].info.symbol
          .toLowerCase()
          .indexOf(searchTokenSymbol.toLowerCase()) !== -1
      )
        return true;
      return false;
    });
    console.log(filteredPoolTokens);
    this.setState({ filteredPoolTokens });
  };

  render() {
    this.checkEthereumChange();
    return (
      <div className="App">
        <Header setAddress={this.changeAddress} address={this.state.address} />
        {this.state.page === "home" ? (
          <Pools
            allPoolTokens={this.state.filteredPoolTokens}
            changePage={this.changePage}
            setLiquidityPageConfig={this.addLiquidityPageConfig}
            filterPoolTokens={this.filterPoolTokens}
          />
        ) : null}
        {this.state.page === "liquidity" ? (
          <PoolLiquidityWidget
            config={this.state.liquidityPageConfig}
            changePage={this.changePage}
            userAddress={this.state.address}
          />
        ) : null}
        {/* <Widget /> */}
      </div>
    );
  }
}

export default App;
