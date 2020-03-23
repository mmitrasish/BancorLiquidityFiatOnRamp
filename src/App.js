import React from "react";
import logo from "./logo.svg";
import "./App.scss";
import Widget from "./components/Widget";
import Header from "./components/Header";
import { getAllBancorLiquidityPoolTokens } from "./services/Web3Service";

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
  componentDidMount() {
    getAllBancorLiquidityPoolTokens();
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
