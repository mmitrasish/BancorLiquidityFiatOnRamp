import React from "react";
import "./header.scss";
import { getAccount } from "../../services/Web3Service";
import { shortenAddress } from "../../utils";
import makeBlockie from "ethereum-blockies-base64";

function Header(props) {
  const handleConnect = async () => {
    const address = await getAccount();
    props.setAddress(address[0]);
  };
  const getAddressTemplate = address => {
    if (address) {
      return (
        <div className="address-container">
          <span>{shortenAddress(address)}</span>
          <img
            src={makeBlockie(address)}
            alt="address blockie"
            className="address-blockie"
          />
        </div>
      );
    } else {
      return <div>Connect to Wallet</div>;
    }
  };
  return (
    <div className="header">
      <div>Bancor Logo</div>
      <div
        className={"wallet-container " + (props.address ? "connected" : null)}
        onClick={handleConnect}
      >
        {getAddressTemplate(props.address)}
      </div>
    </div>
  );
}

export default Header;
