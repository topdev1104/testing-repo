import React from "react";
import filledArrow from "./assets/filledarrow.svg";
import bridgeLogo from "./assets/bridge-logo.svg";
import './bridgecard.css'
import { NavLink } from "react-router-dom";

const BridgeCard = () => {
  return (
    <NavLink to="/bridge" className="bridgecard-wrapper">
      <div className="purplediv" style={{background: '#8890C4', top: '23px'}}></div>
      <div className="d-flex flex-column gap-2 justify-content-between">
        <div className="">
          <h6 className="bridgecard-title d-flex justify-content-between gap-2 align-items-center">
          Bridge <img src={bridgeLogo} alt="" />
          </h6>
        </div>
       <div>
       <div>
          <h6 className="bridgecard-desc">
          Bridge tokens between supported chains instantly and securely. 
          </h6>
        </div>
        <div className="">
          <h6 className="bridgecard-btntext d-flex justify-content-end gap-2 align-items-center">
            <img src={filledArrow} alt="" />
          </h6>
        </div>
       </div>
      </div>
    </NavLink>
  );
};

export default BridgeCard;
