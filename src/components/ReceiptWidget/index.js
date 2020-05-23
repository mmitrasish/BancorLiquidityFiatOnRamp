import React from "react";
import "./receipt_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getEthExchangeRate } from "../../services/ApiService";
import { faChevronRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  calculateFundCost,
  getAmountInEth,
  checkDeposit,
  checkWithdraw,
  getUserBalance,
  checkEthForTopUp,
  swapTokens,
  addLiquidity,
  withdrawLiquidity,
  getRemainingEthAmount,
} from "../../services/Web3Service";
import { useHistory } from "react-router-dom";
import Loader from "../Loader";
import { getTokenIcon } from "../../utils";

function PoolLiquidityWidget(props) {
  let history = useHistory();
  const [loading, setLoading] = React.useState(true);
  const [firstTokenBalance, setFirstTokenBalance] = React.useState(0);
  const [secondTokenBalance, setSecondTokenBalance] = React.useState(0);
  const [smartTokenBalance, setSmartTokenBalance] = React.useState(0);

  const [firstTokenConfig, setFirstTokenConfig] = React.useState();
  const [secondTokenConfig, setSecondTokenConfig] = React.useState();
  const [smartTokenConfig, setSmartTokenConfig] = React.useState();

  const [firstTokenAmount, setFirstTokenAmount] = React.useState(0);
  const [secondTokenAmount, setSecondTokenAmount] = React.useState(0);
  const [firstTokenEthAmount, setFirstTokenEthAmount] = React.useState(0);
  const [secondTokenEthAmount, setSecondTokenEthAmount] = React.useState(0);

  const [firstTokenTopupConfig, setFirstTokenTopupConfig] = React.useState({});
  const [secondTokenTopupConfig, setSecondTokenTopupConfig] = React.useState(
    {}
  );

  const [note, setNote] = React.useState("");
  const [ethTopup, setEthTopup] = React.useState(0);
  const [button, setButton] = React.useState("");

  const [liquidityDisabled, setLiquidityDisabled] = React.useState(false);

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
    setFirstTokenAmount(firstTokenValue);
    const firstTokenValueEth = getAmountInEth(firstTokenValue);
    setFirstTokenEthAmount(Number.parseFloat(firstTokenValueEth));
    let secondTokenValue = await calculateFundCost(
      props.receiptConfig.smartTokenDetails.token.smartTokenAddress,
      props.receiptConfig.smartTokenDetails.token.connectorTokens[1].address,
      props.receiptConfig.smartTokenDetails.token.ownerAddress,
      props.receiptConfig.smartTokenDetails.amount
    );
    setSecondTokenAmount(secondTokenValue);
    const secondTokenValueEth = getAmountInEth(secondTokenValue);
    setSecondTokenEthAmount(Number.parseFloat(secondTokenValueEth));

    if (props.receiptConfig.type === "Add") {
      await checkAddLiquidityDetails(firstTokenValue, secondTokenValue);
    } else {
      let smartTokenUserBalance = await getUserBalance(
        props.receiptConfig.smartTokenDetails.token.smartTokenAddress,
        props.userAddress,
        false
      );
      // console.log(smartTokenUserBalance);
      smartTokenUserBalance = getAmountInEth(smartTokenUserBalance);
      setSmartTokenBalance(smartTokenUserBalance);
      const amount =
        props.receiptConfig.smartTokenDetails.amount * Math.pow(10, 18);
      const smartTokenUserConfig = await checkWithdraw(
        amount,
        props.receiptConfig.smartTokenDetails.token.smartTokenAddress,
        props.userAddress
      );
      // console.log(smartTokenUserConfig.check)
      if (!smartTokenUserConfig.check) {
        setLiquidityDisabled(true);
        setNote(`You don't have enough Smart Token`);
      }
      // console.log(smartTokenUserConfig);
      setSmartTokenConfig(smartTokenUserConfig);
      setButton("Withdraw Liquidity");
    }

    if (loading) {
      setLoading(false);
    }
  };

  const checkAddLiquidityDetails = async (
    firstTokenValue,
    secondTokenValue
  ) => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      let ethAddress = "";
      const firstTokenAddress =
        props.receiptConfig.smartTokenDetails.token.connectorTokens[0].address;
      const secondTokenAddress =
        props.receiptConfig.smartTokenDetails.token.connectorTokens[1].address;
      let isEthTokenFir = false;
      let isEthTokenSec = false;
      // console.log(firstTokenAddress, secondTokenAddress);
      props.allPoolTokens.forEach((poolToken) => {
        poolToken.connectorTokens.forEach((token) => {
          if (token.info.symbol.toLowerCase() === "eth") {
            ethAddress = token.address;
            if (ethAddress === firstTokenAddress) isEthTokenFir = true;
            if (ethAddress === secondTokenAddress) isEthTokenSec = true;
            // console.log(ethAddress);
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
      // console.log(firstTokenUserBalance, secondTokenUserBalance);
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
      setNote("");
      setButton("Add Liquidity");
      setFirstTokenTopupConfig({
        ethAddress,
        firstTokenAddress,
        isEthTokenFir,
      });

      setSecondTokenTopupConfig({
        ethAddress,
        secondTokenAddress,
        isEthTokenSec,
      });

      // console.log(firstTokenUserConfig, secondTokenUserConfig);
      const checkTokenTopup =
        firstTokenUserConfig.check && secondTokenUserConfig.check;
      const topupValue =
        (firstTokenUserConfig.topup ? firstTokenUserConfig.topup : 0) +
        (secondTokenUserConfig.topup ? secondTokenUserConfig.topup : 0);
      const checkEthTopup = await checkEthForTopUp(
        topupValue,
        props.userAddress
      );
      // console.log(topupValue, checkEthTopup);
      const firstTokenSymbol =
        props.receiptConfig.smartTokenDetails.token.connectorTokens[0].info
          .symbol;
      const secondTokenSymbol =
        props.receiptConfig.smartTokenDetails.token.connectorTokens[1].info
          .symbol;
      if (!checkTokenTopup) {
        if (checkEthTopup) {
          setNote(
            `Note: Topup with Fiat onRamp for this much ${Number.parseFloat(
              topupValue
            ).toFixed(2)} ETH`
          );
          setEthTopup(topupValue);
          setButton("TopUp ETH");
          setLiquidityDisabled(true);
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
      setLoading(false);
      resolve();
    });
  };

  const sendToMoonpay = async () => {
    const remEthAmt = await getRemainingEthAmount(ethTopup, props.userAddress);
    // props.setMoonpayAmount(remEthAmt);
    const ethRate = await getEthExchangeRate();
    // console.log(ethRate);
    const ethGBPRate = ethRate["GBP"];
    // console.log(ethGBPRate, props.ethAmount);
    const gbpAmount = Number.parseFloat(remEthAmt) * ethGBPRate;
    // console.log(gbpAmount, ethGBPRate, remEthAmt);
    const url = `https://buy-staging.moonpay.io?apiKey=pk_test_U3wU9qqx87F9EbTVKEnLIIWrhtkeekT&currencyCode=eth&walletAddress=${props.userAddress}&baseCurrencyAmount=${gbpAmount}`;
    window.open(url, "_blank");

    // history.push("/moonpay");
  };

  const sendToWyre = async () => {
    try {
      let wyreUrlPrefix = "sendwyre";
      // if (process.env.WYRE_ENV === "dev") {
      //   wyreUrlPrefix = "testwyre";
      // }
      const widgetRedirectUrl = `${window.location.origin}/?isWaitingForPurchase=true`;

      // Define and temporarily save off options used to load the widget
      const widgetOptions = {
        dest: `ethereum:${this.proxyAddress}`,
        destCurrency: "ETH",
        sourceAmount: this.depositAmount,
        paymentMethod: "debit-card",
        redirectUrl: widgetRedirectUrl,
        accountId: "something",
      };

      localStorage.setItem("widgetDepositOptions", widgetOptions);

      const url = `https://pay.${wyreUrlPrefix}.com/purchase?dest=${widgetOptions.dest}&destCurrency=${widgetOptions.destCurrency}&sourceAmount=${widgetOptions.sourceAmount}&paymentMethod=${widgetOptions.paymentMethod}&redirectUrl=${widgetOptions.redirectUrl}&accountId=${widgetOptions.accountId}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      // this.notifyUser("negative", err.message);
    }
  };

  const topupReserveTokenAmount = async () => {
    let isErr = false;
    try {
      if (!firstTokenConfig.check) {
        // console.log(firstTokenConfig.topup);
        await swapTokens(
          firstTokenConfig.topup,
          firstTokenTopupConfig.ethAddress,
          firstTokenTopupConfig.firstTokenAddress,
          true,
          props.userAddress
        );
      }
      if (!secondTokenConfig.check) {
        // console.log(secondTokenConfig.topup);
        await swapTokens(
          secondTokenConfig.topup,
          secondTokenTopupConfig.ethAddress,
          secondTokenTopupConfig.secondTokenAddress,
          true,
          props.userAddress
        );
      }
    } catch (err) {
      isErr = true;
      props.setModalConfig({
        status: "fail",
        title: "Transaction Failed",
        message: err.message,
      });
      props.setOpenModal(true);
      setTimeout(() => {
        props.setOpenModal(false);
      }, 5000);
      console.log(err);
    }
    if (!isErr) {
      props.setModalConfig({
        status: "success",
        title: "Transaction Success",
        message:
          "Your transaction is successfully completed. Please check you account to see your token balance.",
      });
      props.setOpenModal(true);
      setTimeout(async () => {
        props.setOpenModal(false);
        await checkAddLiquidityDetails(firstTokenAmount, secondTokenAmount);
      }, 5000);
    }
  };

  const liquidityCall = async () => {
    let isErr = false;
    try {
      const pTokenDetails = [
        {
          address: firstTokenTopupConfig.firstTokenAddress,
          amount: firstTokenEthAmount,
        },
        {
          address: secondTokenTopupConfig.secondTokenAddress,
          amount: secondTokenEthAmount,
        },
      ];
      if (props.receiptConfig.type.toLowerCase() === "add") {
        await addLiquidity(
          props.receiptConfig.smartTokenDetails.token.smartTokenAddress,
          props.receiptConfig.smartTokenDetails.amount,
          props.receiptConfig.smartTokenDetails.token.ownerAddress,
          pTokenDetails,
          props.userAddress
        );
      } else if (props.receiptConfig.type.toLowerCase() === "withdraw") {
        await withdrawLiquidity(
          props.receiptConfig.smartTokenDetails.amount,
          props.receiptConfig.smartTokenDetails.token.ownerAddress,
          props.userAddress
        );
      }
    } catch (err) {
      isErr = true;
      props.setModalConfig({
        status: "fail",
        title: "Transaction Failed",
        message: err.message,
      });
      props.setOpenModal(true);
      setTimeout(() => {
        props.setOpenModal(false);
      }, 5000);
      console.log(err);
    }
    if (!isErr) {
      props.setModalConfig({
        status: "success",
        title: "Transaction Success",
        message:
          "Your transaction is successfully completed. Please check you account to see your token balance.",
      });
      props.setOpenModal(true);
      setTimeout(async () => {
        props.setOpenModal(false);
        history.push("/pools");
      }, 5000);
    }
  };

  const liquidityAction = async () => {
    if (!liquidityDisabled) {
      props.setModalConfig({
        status: "pending",
        title: "Transaction Started",
        message: "Please confirm your transaction to proceed.",
      });
      props.setOpenModal(true);

      if (props.receiptConfig.type.toLowerCase() === "add") {
        const checkTokenTopup =
          firstTokenConfig.check && secondTokenConfig.check;
        const topupValue = firstTokenConfig.topup + secondTokenConfig.topup;
        const checkEthTopup = await checkEthForTopUp(
          topupValue,
          props.userAddress
        );
        if (!checkTokenTopup) {
          if (!checkEthTopup) {
            topupReserveTokenAmount();
          }
        } else {
          liquidityCall();
        }
      } else {
        liquidityCall();
      }
    }
  };

  return (
    <div className="receipt-widget">
      <div className="widget-main-container">
        <div className="widget-header">
          <div
            className="back-button-container"
            onClick={(e) => history.push("/liquidity")}
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
                  {props.receiptConfig.type === "Add"
                    ? "On Ramp Options"
                    : "Off Ramp Options"}
                </label>
              </div>
              {props.receiptConfig.type === "Add" ? (
                <div>
                  <button
                    type="button"
                    className="wyre-option"
                    onClick={(e) => sendToWyre()}
                  >
                    <span>Top up with Wyre</span>
                    <span className="right-icon">
                      <FontAwesomeIcon icon={faChevronRight} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="moonpay-option"
                    onClick={(e) => sendToMoonpay()}
                  >
                    <span>Top up with Moonpay</span>
                    <span className="right-icon">
                      <FontAwesomeIcon icon={faChevronRight} />
                    </span>
                  </button>
                </div>
              ) : (
                <div className="comming-soon">
                  <label>Comming Soon!</label>
                </div>
              )}
            </div>
            <div className="summary-container">
              <div className="summary-title">
                {props.receiptConfig.type === "Add"
                  ? "Deposit Summary"
                  : "Withdraw Summary"}
              </div>
              {props.receiptConfig.type === "Add" ? (
                <div className="add-summary-container">
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
                          {firstTokenEthAmount.toFixed(2)}{" "}
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
                          {secondTokenEthAmount.toFixed(2)}{" "}
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
                    <div className="receive-title">You Receive</div>
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
                      disabled={liquidityDisabled}
                      onClick={(e) => liquidityAction()}
                    >
                      {button}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="withdraw-summary-container">
                  <div className="deposit-summary">
                    <div className="deposit-title">You Deposit</div>
                    <div className="deposit-summary">
                      <div
                        className={`token-container ${
                          !smartTokenConfig.check ? "de-active" : null
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
                            {Number.parseFloat(
                              props.receiptConfig.smartTokenDetails.amount
                            ).toFixed(2)}{" "}
                            {props.receiptConfig.smartTokenDetails.token.symbol}
                          </label>
                        </div>
                        <div className="user-balance">
                          <span>
                            Balance:{" "}
                            <label>
                              {Number.parseFloat(smartTokenBalance).toFixed(3)}{" "}
                              {
                                props.receiptConfig.smartTokenDetails.token
                                  .symbol
                              }
                            </label>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="receive-summary-container">
                    <div className="receive-title">You Receive</div>
                    <div className="res-amount">
                      <div className="full-summary-tilda">~</div>
                      <div className="full-summary-item">
                        <div>
                          <label>{firstTokenEthAmount.toFixed(2)}</label>{" "}
                          {
                            props.receiptConfig.smartTokenDetails.token
                              .connectorTokens[0].info.symbol
                          }
                        </div>
                        <div>
                          <label>{secondTokenEthAmount.toFixed(2)}</label>{" "}
                          {
                            props.receiptConfig.smartTokenDetails.token
                              .connectorTokens[1].info.symbol
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="note">{note}</div>
                  <div
                    className={`buy-container ${
                      props.receiptConfig.type !== "Add" ? "withdraw-buy" : null
                    }`}
                  >
                    <button
                      type="button"
                      className="buy-button"
                      disabled={liquidityDisabled}
                      onClick={(e) => liquidityAction()}
                    >
                      {button}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PoolLiquidityWidget;
