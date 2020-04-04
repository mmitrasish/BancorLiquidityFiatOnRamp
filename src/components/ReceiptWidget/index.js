import React from "react";
import "./receipt_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { calculateFundCost, getAmountInEth } from "../../services/Web3Service";
import { useHistory } from "react-router-dom";
import Loader from "../Loader";

function PoolLiquidityWidget(props) {
  let history = useHistory();
  const [loading, setLoading] = React.useState(true);
  const [firstTokenAmount, setFirstTokenAmount] = React.useState(0);
  const [secondTokenAmount, setSecondTokenAmount] = React.useState(0);

  const getTokenIcon = tokenAddress => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };

  React.useEffect(() => {
    getReserveTokenAmount();
  }, []);

  const getReserveTokenAmount = async () => {
    let firstTokenValue = await calculateFundCost(
      props.receiptConfig.smartTokenDetails.token.smartTokenAddress,
      props.receiptConfig.smartTokenDetails.token.connectorTokens[0].address,
      props.receiptConfig.smartTokenDetails.token.ownerAddress,
      props.receiptConfig.smartTokenDetails.amount
    );
    firstTokenValue = getAmountInEth(firstTokenValue);
    setFirstTokenAmount(Number.parseFloat(firstTokenValue));
    let secondTokenValue = await calculateFundCost(
      props.receiptConfig.smartTokenDetails.token.smartTokenAddress,
      props.receiptConfig.smartTokenDetails.token.connectorTokens[1].address,
      props.receiptConfig.smartTokenDetails.token.ownerAddress,
      props.receiptConfig.smartTokenDetails.amount
    );
    secondTokenValue = getAmountInEth(secondTokenValue);
    setSecondTokenAmount(Number.parseFloat(secondTokenValue));
    if (loading) {
      setLoading(false);
    }
  };

  return (
    <div className="receipt-widget">
      <div className="widget-main-container">
        <div className="widget-header">
          <div
            className="back-button-container"
            onClick={e => props.changePage("liquidity")}
          >
            <img
              src={require("../../assets/icons/back.svg")}
              alt="back"
              className="back-button"
            />
          </div>
          <h3 className="widget-header-title">Receipt</h3>
        </div>
        {loading ? (
          <Loader loaderType="box" />
        ) : (
          <div>
            <div className="on-ramp-options-container">
              <div className="on-ramp-options-header">
                <label>On Ramp Options</label>
              </div>
              <button type="button" className="wyre-option">
                <span>Top up with Wyre</span>
                <span className="right-icon">
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </button>
              <button
                type="button"
                className="moonpay-option"
                onClick={e => history.push("/moonpay")}
              >
                <span>Top up with Moonpay</span>
                <span className="right-icon">
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </button>
            </div>
            <div className="deposit-summary-container">
              <div className="deposit-summary-title">Deposit Summary</div>
              <div className="deposit-summary">
                <div className="token-container">
                  <div>
                    <img
                      src={getTokenIcon("0x000")}
                      alt="token logo"
                      className="token-logo"
                    />
                  </div>
                  <div>
                    <label>
                      {firstTokenAmount.toFixed(2)}{" "}
                      {
                        props.receiptConfig.smartTokenDetails.token
                          .connectorTokens[0].info.symbol
                      }
                    </label>
                  </div>
                  <div className="user-balance">
                    <span>
                      Balance:{" "}
                      <label>
                        5{" "}
                        {
                          props.receiptConfig.smartTokenDetails.token
                            .connectorTokens[0].info.symbol
                        }
                      </label>
                    </span>
                  </div>
                </div>
                <div className="plus-icon">
                  <FontAwesomeIcon icon={faPlus} />
                </div>
                <div className="token-container">
                  <div>
                    <img
                      src={getTokenIcon("0x000")}
                      alt="token logo"
                      className="token-logo"
                    />
                  </div>
                  <div>
                    <label>
                      {secondTokenAmount.toFixed(2)}{" "}
                      {
                        props.receiptConfig.smartTokenDetails.token
                          .connectorTokens[1].info.symbol
                      }
                    </label>
                  </div>
                  <div className="user-balance">
                    <span>
                      Balance:{" "}
                      <label>
                        5{" "}
                        {
                          props.receiptConfig.smartTokenDetails.token
                            .connectorTokens[1].info.symbol
                        }
                      </label>
                    </span>
                  </div>
                </div>
              </div>
              <div className="receive-summary">
                <div className="receive-title">
                  You{" "}
                  {props.receiptConfig.type === "Add" ? "Receive" : "Deposit"}
                </div>
                <div className="receive-amount">
                  {Number.parseFloat(
                    props.receiptConfig.smartTokenDetails.amount
                  ).toFixed(2)}{" "}
                  {props.receiptConfig.smartTokenDetails.token.symbol}
                </div>
              </div>
              <div className="note">
                Note: You don't have enough token balance to add liquidity
              </div>
              <div className="buy-container">
                <button type="button" className="buy-button" disabled>
                  Add Liquidity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PoolLiquidityWidget;
