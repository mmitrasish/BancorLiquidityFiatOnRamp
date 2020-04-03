import React from "react";
import "./liquidity_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faTimes,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import {
  calculateFundCostRate,
  getBalances,
  addLiquidity,
  withdrawLiquidity,
  calculateFundCost,
  getAmountInEth
} from "../../services/Web3Service";
import { showError } from "../../utils/index";
import Loader from "../Loader";

function LiquidityWidget(props) {
  const [tab, setTab] = React.useState(props.config.type);
  const [loading, setLoading] = React.useState(true);
  const [openSmartTokensList, setOpenSmartTokensList] = React.useState(false);
  const [selectedSmartToken, setSelectedSmartToken] = React.useState(
    props.config.token
  );
  const [smartTokenAmount, setSmartTokenAmount] = React.useState(0);
  const [firTokenAmount, setFirTokenAmount] = React.useState(0);
  const [secTokenAmount, setSecTokenAmount] = React.useState(0);

  const getTokenIcon = tokenAddress => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };

  React.useEffect(() => {
    if (loading) {
      setLoading(false);
    }
  }, [props.config.token]);

  const toggleSmartTokensList = pFlag => {
    setOpenSmartTokensList(pFlag);
  };

  const sendToReceipt = () => {
    const liquidityWidgetConfig = {
      type: tab,
      token: selectedSmartToken
    };
    props.setLiquidityPageConfig(liquidityWidgetConfig);
    const receiptConfig = {
      type: tab,
      smartTokenDetails: {
        token: selectedSmartToken,
        amount: smartTokenAmount
      }
    };
    props.setReceiptConfig(receiptConfig);
    props.changePage("receipt");
  };

  const selectSmartToken = pToken => {
    setSelectedSmartToken(pToken);
    setOpenSmartTokensList(false);
  };

  React.useEffect(() => {
    getReserveTokenAmt(smartTokenAmount);
  }, [smartTokenAmount]);

  const getReserveTokenAmt = async pValue => {
    if (pValue) {
      let firstTokenValue = await calculateFundCost(
        selectedSmartToken.smartTokenAddress,
        selectedSmartToken.connectorTokens[0].address,
        selectedSmartToken.ownerAddress,
        pValue
      );
      firstTokenValue = getAmountInEth(firstTokenValue);
      setFirTokenAmount(Number.parseFloat(firstTokenValue));
      let secondTokenValue = await calculateFundCost(
        selectedSmartToken.smartTokenAddress,
        selectedSmartToken.connectorTokens[1].address,
        selectedSmartToken.ownerAddress,
        pValue
      );
      secondTokenValue = getAmountInEth(secondTokenValue);
      setSecTokenAmount(Number.parseFloat(secondTokenValue));
    }
  };

  const changeSmartTokenAmount = async pValue => {
    setSmartTokenAmount(Number.parseFloat(pValue));
  };

  return (
    <div className="liquidity-widget">
      {openSmartTokensList ? (
        <div
          className={`widget-select-token-container ${
            openSmartTokensList ? "selected" : "dismiss"
          }`}
        >
          <div className="widget-header">
            <h3 className="widget-header-title">Select Token</h3>
            <div
              className="select-token-close"
              onClick={e => toggleSmartTokensList(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
          <div className="tokens-list-container">
            {props.allPoolTokens.map((token, i) => (
              <div
                className="token-item-container"
                key={i}
                onClick={e => selectSmartToken(token)}
              >
                <div className="token-item">
                  <div className="tokens-icon-container">
                    <img
                      src={getTokenIcon(token.address)}
                      alt="token logo"
                      className="token-logo"
                    />
                    <label>{token.symbol}</label>
                  </div>
                  <div className="next-icon">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {!openSmartTokensList ? (
        <div className="widget-main-container">
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
              Pool Liquidity @ {selectedSmartToken.symbol}
            </h3>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div>
              <div className="widget-tabs">
                <div className="tab-item" onClick={e => setTab("Add")}>
                  <div
                    className={"tab-link " + (tab === "Add" ? "active" : null)}
                  >
                    Add
                  </div>
                </div>
                <div className="tab-item" onClick={e => setTab("Withdraw")}>
                  <div
                    className={
                      "tab-link " + (tab === "Withdraw" ? "active" : null)
                    }
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
                    value={smartTokenAmount || ""}
                    onChange={e => changeSmartTokenAmount(e.target.value)}
                  />
                  <div
                    className="pay-currency-container"
                    onClick={e => toggleSmartTokensList(true)}
                  >
                    <div className="pay-currency">
                      <img
                        src={getTokenIcon(selectedSmartToken.smartTokenAddress)}
                        alt="token logo"
                        className="connector-token-logo"
                      />
                      {selectedSmartToken.symbol}
                    </div>
                    <div className="pay-currency-dropdown">
                      <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                  </div>
                </div>
              </div>
              {smartTokenAmount ? (
                <div className="summary-container">
                  <label className="summary-title">Summary</label>
                  <div className="summary-item">
                    <div className="full-summary">
                      <div className="full-summary-tilda">~</div>
                      <div className="full-summary-item">
                        <div>
                          <label>{firTokenAmount.toFixed(2)}</label>{" "}
                          {selectedSmartToken.connectorTokens[0].info.symbol}
                        </div>
                        <div>
                          <label>{secTokenAmount.toFixed(2)}</label>{" "}
                          {selectedSmartToken.connectorTokens[1].info.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="summary-total-amount">
                      {selectedSmartToken.symbol} {smartTokenAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="buy-container">
                <button
                  type="button"
                  className="buy-button"
                  onClick={e => sendToReceipt()}
                >
                  {tab} Liquidity
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default LiquidityWidget;
