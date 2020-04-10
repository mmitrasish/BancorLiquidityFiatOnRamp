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
  getConversionFees,
} from "./services/Web3Service";
import Pools from "./components/Pools";
import SwapWidget from "./components/SwapWidget";
import ReceiptWidget from "./components/ReceiptWidget";
import MoonpayWidget from "./components/MoonpayWidget";
import LiquidityWidget from "./components/LiquidityWidget";
import { appConfig, setAppConfig } from "./config";
import { withRouter } from "react-router";
import Modal from "./components/Modal";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: undefined,
      allPoolTokens: [],
      filteredPoolTokens: [],
      page: "pools",
      liquidityPageConfig: undefined,
      receiptConfig: undefined,
      moonpayAmount: 3,
      openModal: false,
      modalConfig: {
        status: "pending",
        title: "Pending",
        message: "Working",
      },
    };
  }

  changeAddress = (address) => {
    this.setState({ address });
  };

  changePage = (page) => {
    this.setState({ page });
  };

  setOpenModal = (pFlag) => {
    this.setState({ openModal: pFlag });
  };

  setModalConfig = (pConfig) => {
    this.setState({ modalConfig: pConfig });
  };

  setMoonpayAmount = (amount) => {
    this.setState({ moonpayAmount: amount });
  };

  addLiquidityPageConfig = (config) => {
    this.setState({ liquidityPageConfig: config });
  };

  addReceiptConfig = (config) => {
    this.setState({ receiptConfig: config });
  };

  checkEthereumChange = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (this.state.address !== undefined) {
          this.setState({ address: accounts[0] });
        }
      });

      window.ethereum.on("networkChanged", async (changedChainId) => {
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
    this.routeAction();
    this.startProcess();
  }

  routeAction = () => {
    this.props.history.listen((location, action) => {
      const page = location.pathname.split("/");
      // console.log(page[page.length - 1]);
      this.setState({ page: page[page.length - 1] });
    });
    if (this.props.location.pathname === "/swap") {
      this.props.history.push("/swap");
    } else {
      this.props.history.push("/pools");
    }
  };

  startProcess = async () => {
    if (window.ethereum.networkVersion) {
      setAppConfig(window.ethereum.networkVersion);
    } else {
      setAppConfig(1);
    }
    const address = await getAccount();
    this.changeAddress(address);
    this.getAllPoolItems();
  };

  getAllPoolItems = async (pValue) => {
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
                info: tokenInfo,
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
      (token) => Number.parseInt(token.connectorTokenCount) === 2
    );
    allTokenDetails = allTokenDetails.sort((a, b) => {
      return a.symbol.toLowerCase().localeCompare(b.symbol.toLowerCase());
    });
    // console.log(allTokenDetails.length);
    this.setState({
      allPoolTokens: allTokenDetails,
      filteredPoolTokens: allTokenDetails,
    });
  };

  filterPoolTokens = (searchTokenSymbol) => {
    const { allPoolTokens } = this.state;
    const filteredPoolTokens = allPoolTokens.filter((token) => {
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
    this.setState({ filteredPoolTokens });
  };

  render() {
    this.checkEthereumChange();
    return (
      <div className="App">
        <Modal
          setOpenModal={this.setOpenModal}
          openModal={this.state.openModal}
          config={this.state.modalConfig}
        />
        <Header
          setAddress={this.changeAddress}
          address={this.state.address}
          page={this.state.page}
          changePage={this.changePage}
        />
        {this.state.page === "pools" ? (
          <Pools
            allPoolTokens={this.state.filteredPoolTokens}
            changePage={this.changePage}
            setLiquidityPageConfig={this.addLiquidityPageConfig}
            filterPoolTokens={this.filterPoolTokens}
          />
        ) : null}
        {this.state.page === "liquidity" ? (
          <LiquidityWidget
            config={this.state.liquidityPageConfig}
            changePage={this.changePage}
            userAddress={this.state.address}
            allPoolTokens={this.state.allPoolTokens}
            setReceiptConfig={this.addReceiptConfig}
            setLiquidityPageConfig={this.addLiquidityPageConfig}
          />
        ) : null}
        {this.state.page === "swap" ? (
          <SwapWidget
            userAddress={this.state.address}
            allPoolTokens={this.state.allPoolTokens}
            setModalConfig={this.setModalConfig}
            setOpenModal={this.setOpenModal}
          />
        ) : null}
        {this.state.page === "receipt" ? (
          <ReceiptWidget
            userAddress={this.state.address}
            receiptConfig={this.state.receiptConfig}
            allPoolTokens={this.state.allPoolTokens}
            changePage={this.changePage}
            setMoonpayAmount={this.setMoonpayAmount}
            setModalConfig={this.setModalConfig}
            setOpenModal={this.setOpenModal}
          />
        ) : null}
        {this.state.page === "moonpay" ? (
          <MoonpayWidget
            userAddress={this.state.address}
            ethAmount={this.state.moonpayAmount}
          />
        ) : null}
        {/* <Widget /> */}
      </div>
    );
  }
}

export default withRouter(App);
