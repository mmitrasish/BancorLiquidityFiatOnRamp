import React from "react";
import "./loader.scss";

function Loader(props) {
  return (
    <div>
      {props.loaderType === "box" ? (
        <div className="loader">
          <div className="boxes">
            <div className="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      ) : null}
      {props.loaderType === "circle" ? (
        <div className="circle-loader"></div>
      ) : null}
    </div>
  );
}

export default Loader;
