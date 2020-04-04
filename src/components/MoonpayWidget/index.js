import React from "react";
import "./moonpay_widget.scss";
import { getEthExchangeRate } from "../../services/ApiService";
import Loader from "../Loader";

function MoonpayWidget(props) {
  const [loading, setLoading] = React.useState(true);
  const [baseAmount, setBaseAmount] = React.useState(0);
  React.useEffect(() => {
    getBaseAmount();
  }, []);
  const getBaseAmount = async () => {
    const ethRate = await getEthExchangeRate();
    console.log(ethRate);
    const ethGBPRate = ethRate["GBP"];
    console.log(ethGBPRate);
    const gbpAmount = Number.parseFloat(props.ethAmount) * ethGBPRate;
    console.log(gbpAmount);
    setBaseAmount(gbpAmount);
    if (loading) {
      setLoading(false);
    }
  };
  return (
    <div className="moonpay-widget">
      {loading ? (
        <Loader loaderType="box" />
      ) : (
        <div className="moonpay-container" tabIndex="-1" role="group">
          <iframe
            title="moonpay-widget"
            allow="accelerometer; autoplay; camera; gyroscope; payment"
            frameBorder="0"
            height="100%"
            src={`https://buy-staging.moonpay.io?apiKey=pk_test_U3wU9qqx87F9EbTVKEnLIIWrhtkeekT&currencyCode=eth&walletAddress=${props.userAddress}&baseCurrencyAmount=${baseAmount}`}
            width="100%"
          >
            <p>Your browser does not support iframes.</p>
          </iframe>
        </div>
      )}
    </div>
  );
}

export default MoonpayWidget;
