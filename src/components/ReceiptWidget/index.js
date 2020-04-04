import React from "react";
import "./receipt_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  calculateFundCost,
  getAmountInEth,
  checkDeposit,
  getUserBalance,
  checkEthForTopUp
} from "../../services/Web3Service";
import { useHistory } from "react-router-dom";
import Loader from "../Loader";

function PoolLiquidityWidget(props) {
  let history = useHistory();
  const [loading, setLoading] = React.useState(true);
  const [firstTokenBalance, setFirstTokenBalance] = React.useState(0);
  const [secondTokenBalance, setSecondTokenBalance] = React.useState(0);

  const [firstTokenConfig, setFirstTokenConfig] = React.useState(0);
  const [secondTokenConfig, setSecondTokenConfig] = React.useState(0);

  const [firstTokenAmount, setFirstTokenAmount] = React.useState(0);
  const [secondTokenAmount, setSecondTokenAmount] = React.useState(0);

  const [note, setNote] = React.useState("");

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
    const firstTokenValueEth = getAmountInEth(firstTokenValue);
    setFirstTokenAmount(Number.parseFloat(firstTokenValueEth));
    let secondTokenValue = await calculateFundCost(
      props.receiptConfig.smartTokenDetails.token.smartTokenAddress,
      props.receiptConfig.smartTokenDetails.token.connectorTokens[1].address,
      props.receiptConfig.smartTokenDetails.token.ownerAddress,
      props.receiptConfig.smartTokenDetails.amount
    );
    const secondTokenValueEth = getAmountInEth(secondTokenValue);
    setSecondTokenAmount(Number.parseFloat(secondTokenValueEth));

    let ethAddress = "";
    const firstTokenAddress =
      props.receiptConfig.smartTokenDetails.token.connectorTokens[0].address;
    const secondTokenAddress =
      props.receiptConfig.smartTokenDetails.token.connectorTokens[1].address;
    let isEthTokenFir = false;
    let isEthTokenSec = false;
    props.allPoolTokens.forEach(poolToken => {
      poolToken.connectorTokens.forEach(token => {
        if (token.info.symbol.toLowerCase() === "eth") {
          ethAddress = token.address;
          if (ethAddress === firstTokenAddress) isEthTokenFir = true;
          if (ethAddress === secondTokenAddress) isEthTokenSec = true;
          console.log(ethAddress);
        }
      });
    });

    let firstTokenBalance = await getUserBalance(firstTokenAddress, props.userAddress, isEthTokenFir)
    firstTokenBalance = getAmountInEth(firstTokenBalance)
    let secondTokenBalance = await getUserBalance(secondTokenAddress, props.userAddress, isEthTokenSec)
    secondTokenBalance = getAmountInEth(secondTokenBalance)
    setFirstTokenBalance(firstTokenBalance)
    setSecondTokenBalance(secondTokenBalance)
    const firstTokenConfig = await checkDeposit(
      firstTokenValue,
      firstTokenAddress,
      ethAddress,
      props.userAddress,
      isEthTokenFir
    );
    const secondTokenConfig = await checkDeposit(
      secondTokenValue,
      secondTokenAddress,
      ethAddress,
      props.userAddress,
      isEthTokenSec
    );

    setFirstTokenConfig(firstTokenConfig)
    setSecondTokenConfig(secondTokenConfig)

    const checkTokenTopup = firstTokenConfig.check && secondTokenConfig.check;
    const topupValue = firstTokenConfig.topup + secondTokenConfig.topup;
    const checkEthTopup = await checkEthForTopUp(topupValue, props.userAddress)
    if(!checkTokenTopup){
      if(checkEthTopup)
      setNote(`Note: Topup with Fiat onRamp for this much ${topupValue} Eth`);
      else
      setNote(`Note: Topup your reserve tokens`);
    }


    console.log(firstTokenConfig);
    console.log(secondTokenConfig);

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
                        {firstTokenBalance}{" "}
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
                      {secondTokenBalance}{" "}
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
               {note}
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
