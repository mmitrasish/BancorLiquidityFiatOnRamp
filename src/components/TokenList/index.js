import React from "react";
import "./token_list.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faChevronRight } from "@fortawesome/free-solid-svg-icons";

function TokenList(props) {
  const [searchText, setSearchText] = React.useState("");
  const [filteredPoolTokens, setFilteredPoolTokens] = React.useState(
    props.tokensUniqueList
  );
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        props.toggleTokens(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const getTokenIcon = (tokenAddress) => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };

  const searchTextChange = (pValue) => {
    setSearchText(pValue);
    let filteredList = [];
    if (props.isSmartTokensList) {
      filteredList = props.tokensUniqueList.filter((token) => {
        // console.log(token.symbol, pValue);
        return token.symbol.toLowerCase().indexOf(pValue.toLowerCase()) !== -1;
      });
      setFilteredPoolTokens(filteredList);
    } else {
      filteredList = props.tokensUniqueList.filter((token) => {
        return (
          token.info.symbol.toLowerCase().indexOf(pValue.toLowerCase()) !== -1
        );
      });
      setFilteredPoolTokens(filteredList);
    }

    // console.log(props.isSmartTokensList, pValue, filteredList);
  };

  return (
    <div ref={wrapperRef} className="token-list-wrapper">
      <div
        className={`widget-select-token-container ${
          props.openTokensList ? "selected" : "dismiss"
        }`}
      >
        <div className="widget-header">
          <h3 className="widget-header-title">Select Token</h3>
          <div
            className="select-token-close"
            onClick={(e) => props.toggleTokens(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </div>
        </div>
        <div className="token-search-container">
          <img
            src={require("../../assets/icons/search.svg")}
            alt="search"
            className="search-icon"
          />
          <input
            type="text"
            placeholder="Search Token"
            className="header-search-token"
            value={searchText}
            onChange={(e) => searchTextChange(e.target.value)}
          />
        </div>
        <div className="tokens-list-container">
          {filteredPoolTokens.map((token, i) => (
            <div
              className="token-item-container"
              key={i}
              onClick={(e) => props.selectToken(token)}
            >
              <div className="token-item">
                <div className="tokens-icon-container">
                  {props.isSmartTokensList ? (
                    <div className="smart-token-connectors-container">
                      <img
                        src={getTokenIcon(token.connectorTokens[0].address)}
                        alt="token logo"
                        className="token-logo"
                      />
                      <img
                        src={getTokenIcon(token.connectorTokens[1].address)}
                        alt="token logo"
                        className="token-logo"
                      />
                    </div>
                  ) : (
                    <img
                      src={getTokenIcon(token.address)}
                      alt="token logo"
                      className="token-logo"
                    />
                  )}

                  <label>
                    {props.isSmartTokensList ? token.symbol : token.info.symbol}
                  </label>
                </div>
                <div className="next-icon">
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TokenList;
