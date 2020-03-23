import React from "react";
import "./widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChevronDown } from "@fortawesome/free-solid-svg-icons";

function Widget() {
  return (
    <div className="widget">
      <div className="widget-header">
        <h3 className="widget-header-title">Buy token using fiat</h3>
        <div className="widget-menu">
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>
      <div className="widget-tabs">
        <div className="tab-item">
          <div className="active tab-link">Deposit</div>
        </div>
        <div className="tab-item">
          <div className=" tab-link">Withdraw</div>
        </div>
      </div>
      <div className="pay-container">
        <div className="pay-label">
          <label>Pay</label>
        </div>
        <div className="pay-input-container">
          <input
            type="number"
            name="payAmount"
            id="payAmount"
            className="pay-input"
            placeholder="0.0"
          />
          <div className="pay-currency-container">
            <div className="pay-currency">GBP</div>
            <div className="pay-currency-dropdown">
              <FontAwesomeIcon icon={faChevronDown} />
            </div>
          </div>
        </div>
      </div>
      <div className="pay-container">
        <div className="pay-label">
          <label>Receive</label>
        </div>
        <div className="pay-input-container">
          <input
            type="number"
            name="payAmount"
            id="payAmount"
            className="pay-input"
            placeholder="0.0"
          />
          <div className="pay-currency-container">
            <div className="pay-currency">Dai</div>
            <div className="pay-currency-dropdown">
              <FontAwesomeIcon icon={faChevronDown} />
            </div>
          </div>
        </div>
      </div>
      <div className="buy-container">
        <button type="button" className="buy-button">
          Buy
        </button>
      </div>
    </div>
  );
}

export default Widget;
