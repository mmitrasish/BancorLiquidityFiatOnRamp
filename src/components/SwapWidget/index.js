import React from "react";
import "./swap_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faTimes,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { getTokenRate, swapTokens } from "../../services/Web3Service";
import Loader from "../Loader";

function SwapWidget(props) {
  const [loading, setLoading] = React.useState(true);
  const [rate, setRate] = React.useState(0);
  const [token1Amount, setToken1Amount] = React.useState();
  const [token2Amount, setToken2Amount] = React.useState();
  const [firstTokensUniqueList, setFirstTokensUniqueList] = React.useState([]);
  const [secondTokensUniqueList, setSecondTokensUniqueList] = React.useState(
    []
  );
  const [openFirstTokensList, setOpenFirstTokensList] = React.useState(false);
  const [openSecondTokensList, setOpenSecondTokensList] = React.useState(false);
  const [selectedFirstToken, setSelectedFirstToken] = React.useState({});
  const [selectedSecondToken, setSelectedSecondToken] = React.useState({});

  const getTokenIcon = tokenAddress => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };

  React.useEffect(() => {
    if (props.allPoolTokens.length) {
      getAllTokensList();
    } else {
      if (!loading) {
        setLoading(true);
      }
    }
  }, [props.allPoolTokens]);

  const changeToken1Amount = async pValue => {
    setToken1Amount(pValue);
    if (rate) {
      const secTokenValue = Number.parseFloat(rate) * pValue;
      setToken2Amount(secTokenValue);
    }
  };

  const changeToken2Amount = async pValue => {
    setToken2Amount(pValue);
    if (rate) {
      const firTokenValue = pValue / Number.parseFloat(rate);
      setToken1Amount(firTokenValue);
    }
  };

  const getAllTokensList = () => {
    const firstTokensList = props.allPoolTokens.map(
      token => token.connectorTokens[0]
    );
    const secondTokensList = props.allPoolTokens.map(
      token => token.connectorTokens[1]
    );
    const allTokenList = [...firstTokensList, ...secondTokensList];
    const allTokensUniqueList = [];
    allTokenList.forEach(token => {
      if (
        !allTokensUniqueList.map(token => token.address).includes(token.address)
      ) {
        allTokensUniqueList.push(token);
      }
    });
    setFirstTokensUniqueList(allTokensUniqueList);
    setSecondTokensUniqueList(allTokensUniqueList);
    setSelectedFirstToken(allTokensUniqueList[0]);
    setSelectedSecondToken(allTokensUniqueList[1]);
    getSwapRate(allTokensUniqueList[0], allTokensUniqueList[1]);
  };

  const getSwapRate = async (pSourceToken, pTargetToken) => {
    if (pSourceToken.address !== pTargetToken.address) {
      if (!loading) {
        setLoading(true);
      }
      const rate = await getTokenRate(
        pSourceToken.address,
        pTargetToken.address
      );
      // console.log(rate);
      setRate(rate);
      setLoading(false);
    }
  };

  const toggleFirstTokens = pFlag => {
    setOpenFirstTokensList(pFlag);
  };

  const toggleSecondTokens = pFlag => {
    setOpenSecondTokensList(pFlag);
  };

  const selectFirstToken = pToken => {
    setSelectedFirstToken(pToken);
    getSwapRate(pToken, selectedSecondToken);
    setToken1Amount(0);
    setToken2Amount(0);
    toggleFirstTokens(false);
  };

  const selectSecondToken = pToken => {
    setSelectedSecondToken(pToken);
    getSwapRate(selectedFirstToken, pToken);
    setToken1Amount(0);
    setToken2Amount(0);
    toggleSecondTokens(false);
  };

  const swapResTokens = () => {
    const isEth = selectedFirstToken.info.symbol.toLowerCase() === "eth";
    console.log("Entered");
    swapTokens(
      token1Amount,
      selectedFirstToken.address,
      selectedSecondToken.address,
      isEth,
      props.userAddress
    );
  };

  return (
    <div className="swap-widget">
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
            <h3 className="widget-header-title">Swap Tokens</h3>
          </div>
          {loading ? (
            <Loader loaderType="box" />
          ) : (
            <div>
              <div className="pay-container">
                <div className="pay-label">
                  <label>Deposit</label>
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
                  <label>Get</label>
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
              <div className="buy-container">
                <button
                  type="button"
                  className="buy-button"
                  onClick={e => swapResTokens()}
                  disabled={
                    selectedSecondToken.address === selectedFirstToken.address
                  }
                >
                  Swap
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SwapWidget;
