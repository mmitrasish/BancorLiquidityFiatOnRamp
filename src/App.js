import React from "react";
import logo from "./logo.svg";
import "./App.scss";
import Widget from "./components/Widget";
import Header from "./components/Header";
import {
  getAllBancorLiquidityPoolTokens,
  getConnectorTokenCount,
  getConnectorTokens,
  getSmartTokensOwner,
  getErc20TokensInfo
} from "./services/Web3Service";

class App extends React.Component {
  state = {
    address: ""
  };
  setAddress = address => {
    this.setState({ address });
  };
  checkAddressChange = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accounts => {
        if (this.state.address !== undefined) {
          this.setAddress(accounts[0]);
        }
      });
    }
  };
  async componentDidMount() {
    const allTokens = await getAllBancorLiquidityPoolTokens();
    allTokens.forEach(async token => {
      if (token) {
        // console.log("Smart Token: ", token);
        const ownerAddress = await getSmartTokensOwner(token);
        // console.log("Owner Address: ", ownerAddress);
        if (ownerAddress) {
          const connectorTokenCount = await getConnectorTokenCount(
            ownerAddress
          );
          for (let i = 0; i < connectorTokenCount; i++) {
            const tokenAddress = await getConnectorTokens(ownerAddress, i);
            const tokenInfo = await getErc20TokensInfo(tokenAddress);
            console.log(tokenInfo);
            // console.log("Token Address: " + tokenAddress);
          }
        }
      }
    });
    const connectorTokenCount = getConnectorTokenCount();
    for (let i = 0; i < connectorTokenCount; i++) {
      getConnectorTokens(i);
    }
  }
  render() {
    this.checkAddressChange();
    return (
      <div className="App">
        <Header setAddress={this.setAddress} address={this.state.address} />
        <Widget />
      </div>
    );
  }
}

export default App;
