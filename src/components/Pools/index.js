import React from "react";
import "./pools.scss";
import { shortenAddress } from "../../utils";
import Loader from "../Loader";

function Pools(props) {
  const [loading, setLoading] = React.useState(true);
  const getTokenIcon = tokenAddress => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };
  const poolAction = (pFlag, pToken) => {
    const config = {};
    if (pFlag) {
      config.type = "Add";
    } else {
      config.type = "Withdraw";
    }
    config.token = pToken;
    props.setLiquidityPageConfig(config);
    props.changePage("liquidity");
  };

  React.useEffect(() => {
    if (props.allPoolTokens.length) {
      if (loading) {
        setLoading(false);
      }
    } else {
      if (!loading) {
        setLoading(true);
      }
    }
  }, [props.allPoolTokens]);

  return (
    <div className="pools">
      {loading ? (
        <Loader />
      ) : (
        <div className="pools-container">
          <div className="pools-header">
            <label className="header-title">Eth Pools</label>
            <input
              type="text"
              placeholder="Search Token"
              className="header-search-token"
            />
          </div>
          <div className="pools-table">
            <div className="thead">
              <div className="tr">
                <div className="td">#</div>
                <div className="td">Tokens</div>
                <div className="td">Smart Token Symbol</div>
                <div className="td">Owner</div>
                <div className="td">Ratio</div>
                <div className="td">Liquidity Depth</div>
                <div className="td">Fee</div>
                <div className="td">Actions</div>
              </div>
            </div>
            <div className="tbody">
              {props.allPoolTokens.map((token, index) => (
                <div className="tr" key={index}>
                  <div className="td">{index + 1}</div>
                  <div className="td">
                    {token.connectorTokens.map((connectorToken, i) => (
                      <div className="connector-tokens-container" key={i}>
                        <img
                          src={getTokenIcon(connectorToken.address)}
                          alt="token logo"
                          className="connector-token-logo"
                        />
                        <label>{connectorToken.info.symbol}</label>
                      </div>
                    ))}
                  </div>
                  <div className="td">{token.symbol}</div>
                  <div className="td">{shortenAddress(token.ownerAddress)}</div>
                  <div className="td">50 - 50</div>
                  <div className="td">$2,922,330.26</div>
                  <div className="td">{token.conversionFeePercent}%</div>
                  <div className="td">
                    <span
                      className="action-button withdraw-button"
                      onClick={e => poolAction(false, token)}
                    >
                      <span className="action-icon">-</span>Withdraw
                    </span>
                    <span
                      className="action-button add-button"
                      onClick={e => poolAction(true, token)}
                    >
                      <span className="action-icon">+</span>Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pools;
