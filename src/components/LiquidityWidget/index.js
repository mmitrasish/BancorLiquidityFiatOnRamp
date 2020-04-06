import React from "react";
import "./liquidity_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faTimes,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { calculateFundCost, getAmountInEth } from "../../services/Web3Service";
import { useHistory } from "react-router-dom";
import Loader from "../Loader";
import TokenList from "../TokenList";

function LiquidityWidget(props) {
  let history = useHistory();
  const [tab, setTab] = React.useState(props.config.type);
  const [loading, setLoading] = React.useState(true);
  const [resAmountLoading, setResAmountLoading] = React.useState(false);
  const [openSmartTokensList, setOpenSmartTokensList] = React.useState(false);
  const [selectedSmartToken, setSelectedSmartToken] = React.useState(
    props.config.token
  );
  const [smartTokenAmount, setSmartTokenAmount] = React.useState(0);
  const [firTokenRate, setFirTokenRate] = React.useState(0);
  const [secTokenRate, setSecTokenRate] = React.useState(0);
  const [firTokenAmount, setFirTokenAmount] = React.useState(0);
  const [secTokenAmount, setSecTokenAmount] = React.useState(0);

  const getTokenIcon = (tokenAddress) => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };

  React.useEffect(() => {
    getReserveTokenAmt();
  }, []);

  const toggleSmartTokensList = (pFlag) => {
    setOpenSmartTokensList(pFlag);
  };

  const sendToReceipt = () => {
    const liquidityWidgetConfig = {
      type: tab,
      token: selectedSmartToken,
    };
    props.setLiquidityPageConfig(liquidityWidgetConfig);
    const receiptConfig = {
      type: tab,
      smartTokenDetails: {
        token: selectedSmartToken,
        amount: Number.parseFloat(smartTokenAmount),
      },
    };
    props.setReceiptConfig(receiptConfig);
    history.push("/receipt");
    // props.changePage("receipt");
  };

  const selectSmartToken = (pToken) => {
    setSelectedSmartToken(pToken);
    getReserveTokenAmt();
    setSmartTokenAmount(0);
    setOpenSmartTokensList(false);
  };

  const getReserveTokenAmt = async () => {
    if (!loading) {
      setLoading(true);
    }
    let firstTokenRate = await calculateFundCost(
      selectedSmartToken.smartTokenAddress,
      selectedSmartToken.connectorTokens[0].address,
      selectedSmartToken.ownerAddress,
      1
    );
    firstTokenRate = getAmountInEth(firstTokenRate);
    setFirTokenRate(Number.parseFloat(firstTokenRate));
    let secondTokenRate = await calculateFundCost(
      selectedSmartToken.smartTokenAddress,
      selectedSmartToken.connectorTokens[1].address,
      selectedSmartToken.ownerAddress,
      1
    );
    secondTokenRate = getAmountInEth(secondTokenRate);
    setSecTokenRate(Number.parseFloat(secondTokenRate));

    setLoading(false);
  };

  const changeSmartTokenAmount = async (pValue) => {
    setSmartTokenAmount(pValue);
    const firstTokenAmount = Number.parseFloat(pValue) * firTokenRate;
    setFirTokenAmount(firstTokenAmount);
    const secondTokenAmount = Number.parseFloat(pValue) * secTokenRate;
    setSecTokenAmount(secondTokenAmount);
  };

  return (
    <div className="liquidity-widget">
      {openSmartTokensList ? (
        <TokenList
          openTokensList={openSmartTokensList}
          tokensUniqueList={props.allPoolTokens}
          toggleTokens={toggleSmartTokensList}
          selectToken={selectSmartToken}
          isSmartTokensList={true}
        />
      ) : null}
      {!openSmartTokensList ? (
        <div className="widget-main-container">
          <div className="widget-header">
            <div
              className="back-button-container"
              onClick={(e) => history.push("/pools")}
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
            <Loader loaderType="box" />
          ) : (
            <div>
              <div className="widget-tabs">
                <div className="tab-item" onClick={(e) => setTab("Add")}>
                  <div
                    className={"tab-link " + (tab === "Add" ? "active" : null)}
                  >
                    Add
                  </div>
                </div>
                <div className="tab-item" onClick={(e) => setTab("Withdraw")}>
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
                    onChange={(e) => changeSmartTokenAmount(e.target.value)}
                  />
                  <div
                    className="pay-currency-container"
                    onClick={(e) => toggleSmartTokensList(true)}
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
                    <div className="full-summary-title">
                      You {tab === "Add" ? "Deposit" : "Withdraw"}
                    </div>
                    <div className="summary-total-amount">
                      {resAmountLoading ? (
                        <Loader loaderType="circle" />
                      ) : (
                        <div className="res-amount">
                          <div className="full-summary-tilda">~</div>
                          <div className="full-summary-item">
                            <div>
                              <label>{firTokenAmount.toFixed(2)}</label>{" "}
                              {
                                selectedSmartToken.connectorTokens[0].info
                                  .symbol
                              }
                            </div>
                            <div>
                              <label>{secTokenAmount.toFixed(2)}</label>{" "}
                              {
                                selectedSmartToken.connectorTokens[1].info
                                  .symbol
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="full-summary-title">
                      You {tab === "Add" ? "Withdraw" : "Deposit"}
                    </div>
                    <div className="summary-total-amount">
                      <div className="res-amount">
                        <div className="full-summary-item">
                          <label>
                            {Number.parseFloat(smartTokenAmount).toFixed(2)}
                          </label>{" "}
                          {selectedSmartToken.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="buy-container">
                <button
                  type="button"
                  className="buy-button"
                  onClick={(e) => sendToReceipt()}
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
