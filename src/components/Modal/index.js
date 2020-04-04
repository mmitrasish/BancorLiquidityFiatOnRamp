import React from "react";
import "./modal.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  faCheckCircle,
  faTimesCircle
} from "@fortawesome/free-regular-svg-icons";
import Loader from "../Loader";
function Modal(props) {
  return (
    <div>
      <div
        class={`modal-overlay ${!props.openModal ? "closed" : null}`}
        id="modal-overlay"
        onClick={e => props.setOpenModal(false)}
      ></div>

      <div class={`modal ${!props.openModal ? "closed" : null}`} id="modal">
        <button
          class="close-button"
          id="close-button"
          onClick={e => props.setOpenModal(false)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div class="modal-guts">
          <div class="modal-loader">
            {props.config.status === "pending" ? (
              <Loader loaderType="circle" />
            ) : null}
            {props.config.status === "success" ? (
              <div className="icon-container">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="success-icon"
                />
              </div>
            ) : null}
            {props.config.status === "fail" ? (
              <div className="icon-container">
                <FontAwesomeIcon icon={faTimesCircle} className="fail-icon" />
              </div>
            ) : null}
          </div>
          <div className="modal-title success">{props.config.title}</div>
          <div className="modal-message">{props.config.message}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
