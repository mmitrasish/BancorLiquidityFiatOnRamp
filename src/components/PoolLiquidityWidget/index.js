import React from "react";
import "./pool_liquidity_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  getTokenRate,
  calculateFundCost,
  getBalances
} from "../../services/Web3Service";
import Loader from "../Loader";

function PoolLiquidityWidget(props) {
  const [tab, setTab] = React.useState(props.config.type);
  const [loading, setLoading] = React.useState(true);
  const [rate, setRate] = React.useState(0);
  const [smartTokenRate1, setSmartTokenRate1] = React.useState(0);
  const [smartTokenRate2, setSmartTokenRate2] = React.useState(0);
  const [token1Amount, setToken1Amount] = React.useState();
  const [token2Amount, setToken2Amount] = React.useState();
  const [totalSmartTokenAmount, setTotalSmartTokenAmount] = React.useState(0);

  const getTokenIcon = tokenAddress => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };

  React.useEffect(() => {
    getRate();
    getReserveTokenBalances();
  }, [props.config.token]);

  const getRate = async () => {
    if (props.config.token.connectorTokens) {
      const rate = await getTokenRate(
        props.config.token.connectorTokens[0].address,
        props.config.token.connectorTokens[1].address
      );
      console.log(rate);
      setRate(rate);
    }
    if (props.config.token) {
      const rate1 = await calculateFundCost(
        props.config.token.smartTokenAddress,
        props.config.token.connectorTokens[0].address,
        props.config.token.ownerAddress
      );
      console.log(rate1);
      setSmartTokenRate1(Number.parseFloat(rate1));
      const rate2 = await calculateFundCost(
        props.config.token.smartTokenAddress,
        props.config.token.connectorTokens[1].address,
        props.config.token.ownerAddress
      );
      console.log(rate2);
      setSmartTokenRate2(Number.parseFloat(rate2));
      if (loading) {
        setLoading(false);
      }
    }
  };

  const getReserveTokenBalances = async () => {
    await getBalances([
      props.config.token.connectorTokens[0].address,
      props.config.token.connectorTokens[1].address
    ]);
  };

  const changeToken1Amount = pValue => {
    setToken1Amount(pValue);
    let token2Amount = 0;
    if (rate) {
      token2Amount = Number.parseFloat(pValue) * Number.parseFloat(rate);
      setToken2Amount(token2Amount.toFixed(2));
    }
  };

  const changeToken2Amount = pValue => {
    setToken2Amount(pValue);
    if (rate) {
      const token1Amount = Number.parseFloat(pValue) / Number.parseFloat(rate);
      setToken1Amount(token1Amount.toFixed(2));
    }
  };

  const getTotalSmartTokenAmount = () => {
    if (smartTokenRate1 && smartTokenRate2) {
      return (
        Number.parseFloat(smartTokenRate1) * token1Amount +
        Number.parseFloat(smartTokenRate2) * token2Amount
      );
    }
  };
  return (
    <div className="pool-liquidity-widget">
      <div className="widget-header">
        <div
          className="back-button-container"
          onClick={e => props.changePage("home")}
        >
          <img
            src={require("../../assets/icons/back.svg")}
            alt="back"
            className="back-button"
          />
        </div>
        <h3 className="widget-header-title">
          Pool Liquidity @ {props.config.token.symbol}
        </h3>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className="widget-tabs">
            <div className="tab-item" onClick={e => setTab("Add")}>
              <div className={"tab-link " + (tab === "Add" ? "active" : null)}>
                Add
              </div>
            </div>
            <div className="tab-item" onClick={e => setTab("Withdraw")}>
              <div
                className={"tab-link " + (tab === "Withdraw" ? "active" : null)}
              >
                Withdraw
              </div>
            </div>
          </div>
          <div className="pay-container">
            <div className="pay-label">
              <label>{tab}</label>
            </div>
            <div className="pay-input-container">
              <input
                type="number"
                name="payAmount"
                id="payAmount"
                className="pay-input"
                placeholder="0.0"
                value={token1Amount || ""}
                onChange={e => changeToken1Amount(e.target.value)}
              />
              <div className="pay-currency-container">
                <div className="pay-currency">
                  <img
                    src={getTokenIcon(
                      props.config.token.connectorTokens[0].address
                    )}
                    alt="token logo"
                    className="connector-token-logo"
                  />
                  {props.config.token.connectorTokens[0].info.symbol}
                </div>
                <div className="pay-currency-dropdown">
                  <FontAwesomeIcon icon={faChevronDown} />
                </div>
              </div>
            </div>
          </div>
          <div className="pay-container">
            <div className="pay-label">
              <label>{tab}</label>
            </div>
            <div className="pay-input-container">
              <input
                type="number"
                name="payAmount"
                id="payAmount"
                className="pay-input"
                placeholder="0.0"
                value={token2Amount || ""}
                onChange={e => changeToken2Amount(e.target.value)}
              />
              <div className="pay-currency-container">
                <div className="pay-currency">
                  <img
                    src={getTokenIcon(
                      props.config.token.connectorTokens[1].address
                    )}
                    alt="token logo"
                    className="connector-token-logo"
                  />
                  {props.config.token.connectorTokens[1].info.symbol}
                </div>
                <div className="pay-currency-dropdown">
                  <FontAwesomeIcon icon={faChevronDown} />
                </div>
              </div>
            </div>
          </div>
          {token1Amount && token1Amount ? (
            <div className="summary-container">
              <label className="summary-title">Summary</label>
              <div className="summary-item">
                <div className="full-summary">
                  <div className="full-summary-tilda">~</div>
                  <div className="full-summary-item">
                    <div>
                      {token1Amount}{" "}
                      {props.config.token.connectorTokens[0].info.symbol} @{" "}
                      {Number.parseFloat(smartTokenRate1).toFixed(2)}{" "}
                      {props.config.token.symbol}
                    </div>
                    <div>
                      {token2Amount}{" "}
                      {props.config.token.connectorTokens[1].info.symbol} @{" "}
                      {Number.parseFloat(smartTokenRate2).toFixed(2)}{" "}
                      {props.config.token.symbol}
                    </div>
                  </div>
                </div>
                <div className="summary-total-amount">
                  {props.config.token.symbol}{" "}
                  {getTotalSmartTokenAmount().toFixed(2)}
                </div>
              </div>
            </div>
          ) : null}
          <div className="buy-container">
            <button type="button" className="buy-button">
              {tab} Liquidity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PoolLiquidityWidget;
