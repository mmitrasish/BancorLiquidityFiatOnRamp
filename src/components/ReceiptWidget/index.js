import React from "react";
import "./receipt_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  calculateFundCost,
  getAmountInEth,
  checkDeposit,
  getUserBalance,
  checkEthForTopUp,
  swapTokens,
  addLiquidity,
  withdrawLiquidity
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

  const [firstTokenTopupConfig, setFirstTokenTopupConfig] = React.useState({});
  const [secondTokenTopupConfig, setSecondTokenTopupConfig] = React.useState(
    {}
  );

  const [note, setNote] = React.useState("");
  const [ethTopup, setEthTopup] = React.useState(0);

  const [button, setButton] = React.useState("");

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

    let firstTokenUserBalance = await getUserBalance(
      firstTokenAddress,
      props.userAddress,
      isEthTokenFir
    );
    firstTokenUserBalance = getAmountInEth(firstTokenUserBalance);
    firstTokenUserBalance = Number.parseFloat(firstTokenUserBalance);
    let secondTokenUserBalance = await getUserBalance(
      secondTokenAddress,
      props.userAddress,
      isEthTokenSec
    );
    secondTokenUserBalance = getAmountInEth(secondTokenUserBalance);
    secondTokenUserBalance = Number.parseFloat(secondTokenUserBalance);

    setFirstTokenBalance(firstTokenUserBalance);
    setSecondTokenBalance(secondTokenUserBalance);
    const firstTokenUserConfig = await checkDeposit(
      firstTokenValue,
      firstTokenAddress,
      ethAddress,
      props.userAddress,
      isEthTokenFir
    );
    const secondTokenUserConfig = await checkDeposit(
      secondTokenValue,
      secondTokenAddress,
      ethAddress,
      props.userAddress,
      isEthTokenSec
    );

    setFirstTokenConfig(firstTokenUserConfig);
    setSecondTokenConfig(secondTokenUserConfig);
    setButton("Add Liquidity");
    setFirstTokenTopupConfig({
      ethAddress,
      firstTokenAddress,
      isEthTokenFir
    });

    setSecondTokenTopupConfig({
      ethAddress,
      secondTokenAddress,
      isEthTokenSec
    });

    console.log(firstTokenUserConfig, secondTokenUserConfig);
    const checkTokenTopup =
      firstTokenUserConfig.check && secondTokenUserConfig.check;
    const topupValue = firstTokenUserConfig.topup + secondTokenUserConfig.topup;
    const checkEthTopup = await checkEthForTopUp(topupValue, props.userAddress);
    const firstTokenSymbol =
      props.receiptConfig.smartTokenDetails.token.connectorTokens[0].info
        .symbol;
    const secondTokenSymbol =
      props.receiptConfig.smartTokenDetails.token.connectorTokens[1].info
        .symbol;
    if (!checkTokenTopup) {
      if (checkEthTopup) {
        setNote(`Note: Topup with Fiat onRamp for this much ${Number.parseFloat(topupValue).toFixed(2)} ETH`);
        setButton("TopUp ETH");
      } else {
        let msg = `Note: Topup your `;
        if (!firstTokenUserConfig.check) {
          msg =
            msg +
            `${firstTokenSymbol}: ${Number.parseFloat(
              getAmountInEth(firstTokenUserConfig.diff)
            ).toFixed(3)} `;
        }
        if (!secondTokenUserConfig.check) {
          msg =
            msg +
            `${secondTokenSymbol}: ${Number.parseFloat(
              getAmountInEth(secondTokenUserConfig.diff)
            ).toFixed(3)}`;
        }
        setNote(msg);
        setButton("TopUp Tokens");
      }
    }
    if (loading) {
      setLoading(false);
    }
  };

  const sendToMoonpay = () => {
    props.setMoonpayAmount(ethTopup);
    history.push("/moonpay");
  };

  const topupReserveTokenAmount = async () => {
    if (!firstTokenConfig.check) {
      console.log(firstTokenConfig.topup);
      await swapTokens(
        firstTokenConfig.topup,
        firstTokenTopupConfig.ethAddress,
        firstTokenTopupConfig.firstTokenAddress,
        true,
        props.userAddress
      );
    }
    if (!secondTokenConfig.check) {
      console.log(secondTokenConfig.topup);
      await swapTokens(
        secondTokenConfig.topup,
        secondTokenTopupConfig.ethAddress,
        secondTokenTopupConfig.secondTokenAddress,
        true,
        props.userAddress
      );
    }
    setButton("Add Liquidity")
  };

  const liquidityCall = () => {
    const pTokenDetails = [
      {
        address: firstTokenTopupConfig.firstTokenAddress,
        amount: firstTokenAmount
      },
      {
        address: secondTokenTopupConfig.secondTokenAddress,
        amount: secondTokenAmount
      }
    ];
    if (props.receiptConfig.type.toLowerCase() === "add") {
      addLiquidity(
        props.receiptConfig.smartTokenDetails.token.smartTokenAddress,
        props.receiptConfig.smartTokenDetails.amount,
        props.receiptConfig.smartTokenDetails.token.ownerAddress,
        pTokenDetails,
        props.userAddress
      );
    } else if (props.receiptConfig.type.toLowerCase() === "withdraw") {
      withdrawLiquidity(
        props.receiptConfig.smartTokenDetails.amount,
        props.receiptConfig.smartTokenDetails.token.ownerAddress,
        props.userAddress
      );
    }
  };


  const liquidityAction = async() => {
    const checkTokenTopup =
      firstTokenConfig.check && secondTokenConfig.check;
      const topupValue = firstTokenConfig.topup + secondTokenConfig.topup;
      const checkEthTopup = await checkEthForTopUp(topupValue, props.userAddress);
    if(!checkTokenTopup){
      if(!checkEthTopup){
        topupReserveTokenAmount()
      }
    }
    else{
      liquidityCall()
    }
  }

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
                <label>
                {props.receiptConfig.type === "Add" ? "On Ramp Options" : "Off Ramp Options"}
                </label>
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
                onClick={e => sendToMoonpay()}
              >
                <span>Top up with Moonpay</span>
                <span className="right-icon">
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </button>
            </div>
            <div className="deposit-summary-container">
              <div className="deposit-summary-title">
              {props.receiptConfig.type === "Add" ? "Deposit Summary" : "Withdraw Summary"}
              </div>
              <div className="deposit-summary">
                <div
                  className={`token-container ${
                    !firstTokenConfig.check ? "de-active" : null
                  }`}
                >
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
                        {Number.parseFloat(firstTokenBalance).toFixed(3)}{" "}
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
                <div
                  className={`token-container ${
                    !secondTokenConfig.check ? "de-active" : null
                  }`}
                >
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
                        {Number.parseFloat(secondTokenBalance).toFixed(3)}{" "}
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
              <div className="note">{note}</div>
              <div className="buy-container">
                <button
                  type="button"
                  className="buy-button"
                  onClick={e => liquidityAction()}
                >
                  {button}
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
