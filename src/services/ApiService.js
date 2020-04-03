export const getEthExchangeRate = () => {
  return fetch(
    "https://api.moonpay.io/v3/currencies/eth/price?apiKey=pk_test_U3wU9qqx87F9EbTVKEnLIIWrhtkeekT"
  ).then(res => res.json());
};
