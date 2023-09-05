import React from "react";
import DypLogo from "./assets/dyp-logo.svg";

const ToolTip = ({bottom, left, status}) => {
  return (
    // <div className="tooltip-wrapper">
    //   <div className="d-flex" style={{gap: 10, background: 'rgba(219, 39, 40, 0.1)', borderRadius: 8, padding: 10}}><img src={DypLogo} alt='' style={{width: 16}}/><h6 className="tooltip-text">You need to be holding DYP to vote</h6></div>
    // </div>

    <div className="tooltip" style={{opacity: 1, bottom: bottom, left: left, background: 'white'}}>
      <div className={`tooltiptext`}>
        <div
          className="d-flex"
          style={{
            gap: 10,
            borderRadius: 8,
            padding: 10,
          }}
        >
          <h6 className="tooltip-text">{status}</h6>
        </div>
      </div>
    </div>
  );
};

export default ToolTip;
