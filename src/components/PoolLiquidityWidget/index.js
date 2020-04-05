import React from "react";
import "./pool_liquidity_widget.scss";
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

function PoolLiquidityWidget(props) {
  const [tab, setTab] = React.useState(props.config.type);
  const [loading, setLoading] = React.useState(true);
  // const [rate, setRate] = React.useState(0);
  const [smartTokenRate1, setSmartTokenRate1] = React.useState(0);
  const [smartTokenRate2, setSmartTokenRate2] = React.useState(0);
  const [token1Amount, setToken1Amount] = React.useState();
  const [token2Amount, setToken2Amount] = React.useState();
  const [firstTokensUniqueList, setFirstTokensUniqueList] = React.useState([]);
  const [secondTokensUniqueList, setSecondTokensUniqueList] = React.useState(
    []
  );
  const [openFirstTokensList, setOpenFirstTokensList] = React.useState(false);
  const [openSecondTokensList, setOpenSecondTokensList] = React.useState(false);
  const [selectedFirstToken, setSelectedFirstToken] = React.useState(
    props.config.token.connectorTokens[0]
  );
  const [selectedSecondToken, setSelectedSecondToken] = React.useState(
    props.config.token.connectorTokens[1]
  );
  const [selectedSmartToken, setSelectedSmartToken] = React.useState(
    props.config.token
  );
  const [smartTokenAmount, setSmartTokenAmount] = React.useState(0);

  const getTokenIcon = tokenAddress => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };

  React.useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    try {
      getRate();
      getReserveTokenBalances();
      getFirstTokensList();
      getSecondTokensList();
    } catch (e) {
      if (!signal?.aborted) {
        console.error(e);
      }
    }

    return () => {
      abortController.abort();
    };
  }, [props.config.token]);

  React.useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    try {
      // setParentToken()
      getRate();
      getReserveTokenBalances();
    } catch (e) {
      if (!signal?.aborted) {
        console.error(e);
      }
    }

    return () => {
      abortController.abort();
    };
  }, [selectedFirstToken]);

  React.useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    try {
      // setParentToken()
      getRate();
      getReserveTokenBalances();
    } catch (e) {
      if (!signal?.aborted) {
        console.error(e);
      }
    }

    return () => {
      abortController.abort();
    };
  }, [selectedSecondToken]);

  const getRate = async () => {
    if (selectedSmartToken) {
      const rate1 = await calculateFundCostRate(
        selectedSmartToken.smartTokenAddress,
        selectedFirstToken.address,
        selectedSmartToken.ownerAddress,
        1
      );
      // console.log(rate1);
      setSmartTokenRate1(Number.parseFloat(rate1));
      const rate2 = await calculateFundCostRate(
        selectedSmartToken.smartTokenAddress,
        selectedSecondToken.address,
        selectedSmartToken.ownerAddress,
        1
      );
      // console.log(rate2);
      setSmartTokenRate2(Number.parseFloat(rate2));
      if (loading) {
        setLoading(false);
      }
    }
  };

  const getReserveTokenBalances = async () => {
    await getBalances([
      selectedFirstToken.address,
      selectedSecondToken.address
    ]);
  };

  const changeToken1Amount = async pValue => {
    setToken1Amount(pValue);
    const smartTokenVal = Number.parseFloat(smartTokenRate1) * pValue * 2;
    setSmartTokenAmount(smartTokenVal);
    let secTokenValue = await calculateFundCost(
      selectedSmartToken.smartTokenAddress,
      selectedSecondToken.address,
      selectedSmartToken.ownerAddress,
      smartTokenVal
    );
    secTokenValue = getAmountInEth(secTokenValue);
    // console.log(secTokenValue);
    setToken2Amount(secTokenValue);
  };

  const changeToken2Amount = async pValue => {
    setToken2Amount(pValue);
    const smartTokenVal = Number.parseFloat(smartTokenRate2) * pValue * 2;
    setSmartTokenAmount(smartTokenVal);
    let firTokenValue = await calculateFundCost(
      selectedSmartToken.smartTokenAddress,
      selectedFirstToken.address,
      selectedSmartToken.ownerAddress,
      smartTokenVal
    );
    firTokenValue = getAmountInEth(firTokenValue);
    // console.log(firTokenValue);
    setToken1Amount(firTokenValue);
  };

  const getFirstTokensList = () => {
    const firstTokensList = props.allPoolTokens.map(
      token => token.connectorTokens[0]
    );
    const firstTokensUniqueList = [];
    firstTokensList.forEach(token => {
      if (
        !firstTokensUniqueList
          .map(token => token.address)
          .includes(token.address)
      ) {
        firstTokensUniqueList.push(token);
      }
    });
    setFirstTokensUniqueList(firstTokensUniqueList);
  };

  const getSecondTokensList = () => {
    // console.log(props.allPoolTokens);
    const secondTokensList = props.allPoolTokens.map(
      token => token.connectorTokens[1]
    );
    const secondTokensUniqueList = [];
    secondTokensList.forEach(token => {
      if (
        !secondTokensUniqueList
          .map(token => token.address)
          .includes(token.address)
      ) {
        secondTokensUniqueList.push(token);
      }
    });
    setSecondTokensUniqueList(secondTokensUniqueList);
  };

  const toggleFirstTokens = pFlag => {
    setOpenFirstTokensList(pFlag);
  };

  const toggleSecondTokens = pFlag => {
    setOpenSecondTokensList(pFlag);
  };

  const liquidityAction = pTab => {
    const pTokenDetails = [
      {
        address: selectedFirstToken.address,
        amount: token1Amount
      },
      {
        address: selectedSecondToken.address,
        amount: token2Amount
      }
    ];
    if (pTab.toLowerCase() === "add") {
      addLiquidity(
        selectedSmartToken.smartTokenAddress,
        smartTokenAmount,
        selectedSmartToken.ownerAddress,
        pTokenDetails,
        props.userAddress
      );
    } else if (pTab.toLowerCase() === "withdraw") {
      withdrawLiquidity(
        selectedSmartToken.smartTokenAddress,
        smartTokenAmount,
        selectedSmartToken.ownerAddress,
        pTokenDetails,
        props.userAddress
      );
    }
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

  const selectFirstToken = pToken => {
    let flag = false;
    props.allPoolTokens.forEach(token => {
      if (
        token.connectorTokens[0].address === pToken.address &&
        token.connectorTokens[1].address === selectedSecondToken.address
      ) {
        flag = true;
        setSelectedSmartToken(token);
      }
    });
    if (flag) {
      setSelectedFirstToken(pToken);
      toggleFirstTokens(false);
    } else {
      showError("Selected tokens doesnot have a pool");
    }
  };

  const selectSecondToken = pToken => {
    let flag = false;
    props.allPoolTokens.forEach(token => {
      if (
        token.connectorTokens[0].address === selectedFirstToken.address &&
        token.connectorTokens[1].address === pToken.address
      ) {
        flag = true;
        setSelectedSmartToken(token);
      }
    });

    if (flag) {
      setSelectedSecondToken(pToken);
      toggleSecondTokens(false);
    } else {
      showError("Selected tokens doesnot have a pool");
    }
  };

  return (
    <div className="pool-liquidity-widget">
      {openFirstTokensList ? (
        <div
          className={`widget-select-token-container ${
            openFirstTokensList ? "selected" : "dismiss"
          }`}
        >
          <div className="widget-header">
            <h3 className="widget-header-title">Select Token</h3>
            <div
              className="select-token-close"
              onClick={e => toggleFirstTokens(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
          <div className="tokens-list-container">
            {firstTokensUniqueList.map((token, i) => (
              <div
                className="token-item-container"
                key={i}
                onClick={e => selectFirstToken(token)}
              >
                <div className="token-item">
                  <div className="tokens-icon-container">
                    <img
                      src={getTokenIcon(token.address)}
                      alt="token logo"
                      className="token-logo"
                    />
                    <label>{token.info.symbol}</label>
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
      {openSecondTokensList ? (
        <div
          className={`widget-select-token-container ${
            openSecondTokensList ? "selected" : "dismiss"
          }`}
        >
          <div className="widget-header">
            <h3 className="widget-header-title">Select Token</h3>
            <div
              className="select-token-close"
              onClick={e => toggleSecondTokens(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
          <div className="tokens-list-container">
            {secondTokensUniqueList.map((token, i) => (
              <div
                className="token-item-container"
                key={i}
                onClick={e => selectSecondToken(token)}
              >
                <div className="token-item">
                  <div className="tokens-icon-container">
                    <img
                      src={getTokenIcon(token.address)}
                      alt="token logo"
                      className="token-logo"
                    />
                    <label>{token.info.symbol}</label>
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
      {!(openFirstTokensList || openSecondTokensList) ? (
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
            <Loader loaderType="box" />
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
                    value={token1Amount || ""}
                    onChange={e => changeToken1Amount(e.target.value)}
                  />
                  <div
                    className="pay-currency-container"
                    onClick={e => toggleFirstTokens(true)}
                  >
                    <div className="pay-currency">
                      <img
                        src={getTokenIcon(selectedFirstToken.address)}
                        alt="token logo"
                        className="connector-token-logo"
                      />
                      {selectedFirstToken.info.symbol}
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
                  <div
                    className="pay-currency-container"
                    onClick={e => toggleSecondTokens(true)}
                  >
                    <div className="pay-currency">
                      <img
                        src={getTokenIcon(selectedSecondToken.address)}
                        alt="token logo"
                        className="connector-token-logo"
                      />
                      {selectedSecondToken.info.symbol}
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
                          {token1Amount} {selectedFirstToken.info.symbol} @{" "}
                          {Number.parseFloat(smartTokenRate1).toFixed(2)}{" "}
                          {selectedSmartToken.symbol}
                        </div>
                        <div>
                          {token2Amount} {selectedSecondToken.info.symbol} @{" "}
                          {Number.parseFloat(smartTokenRate2).toFixed(2)}{" "}
                          {selectedSmartToken.symbol}
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

export default PoolLiquidityWidget;
