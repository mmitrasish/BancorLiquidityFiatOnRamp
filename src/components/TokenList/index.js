import React from "react";
import "./token_list.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { getTokenIcon } from "../../utils";
function TokenList({
  toggleTokens,
  openTokensList,
  tokensUniqueList,
  selectToken,
  isSmartTokensList,
}) {
  const [searchText, setSearchText] = React.useState("");
  const [filteredPoolTokens, setFilteredPoolTokens] = React.useState(
    tokensUniqueList
  );
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        toggleTokens(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, toggleTokens]);

  const searchTextChange = (pValue) => {
    setSearchText(pValue);
    let filteredList = [];
    if (isSmartTokensList) {
      filteredList = tokensUniqueList.filter((token) => {
        // console.log(token.symbol, pValue);
        return token.symbol.toLowerCase().indexOf(pValue.toLowerCase()) !== -1;
      });
      setFilteredPoolTokens(filteredList);
    } else {
      filteredList = tokensUniqueList.filter((token) => {
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
          openTokensList ? "selected" : "dismiss"
        }`}
      >
        <div className="widget-header">
          <h3 className="widget-header-title">Select Token</h3>
          <div
            className="select-token-close"
            onClick={(e) => toggleTokens(false)}
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
            autoFocus
          />
        </div>
        <div className="tokens-list-container">
          {filteredPoolTokens.map((token, i) => (
            <div
              className="token-item-container"
              key={i}
              onClick={(e) => selectToken(token)}
            >
              <div className="token-item">
                <div className="tokens-icon-container">
                  {isSmartTokensList ? (
                    <div className="smart-token-connectors-container">
                      <img
                        src={getTokenIcon(token.connectorTokens[0].info.symbol)}
                        alt="token logo"
                        className="token-logo"
                      />
                      <img
                        src={getTokenIcon(token.connectorTokens[1].info.symbol)}
                        alt="token logo"
                        className="token-logo"
                      />
                    </div>
                  ) : (
                    <img
                      src={getTokenIcon(token.info.symbol)}
                      alt="token logo"
                      className="token-logo"
                    />
                  )}

                  <label>
                    {isSmartTokensList ? token.symbol : token.info.symbol}
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
