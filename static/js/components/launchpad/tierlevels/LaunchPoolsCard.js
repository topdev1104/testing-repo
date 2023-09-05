import React, { useState } from "react";
import stakingIcon from "../assets/stakingIcon.svg";
import dypLogo from "../../top-pools-card/assets/dyplogo.svg";

const LaunchPoolsCard = ({
  onShowDetailsClick,
  onHideDetailsClick,
  details,
  chain,
  tvl,
  lockTime,
  apr,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleDetails = () => {
    if (details === false) {
      setShowDetails(true);
      onShowDetailsClick();
    } else if (details === true) {
      setShowDetails(false);
      onHideDetailsClick();
    }
  };

  return (
    <div className={`launch-pool-card p-3 flex-column gap-3 d-flex  justify-content-center ${details && 'selected-launch-card'}`}>
      <div className="d-flex flex-column gap-3 align-items-center">
        <div className="d-flex align-items-center gap-2">
          <img src={dypLogo} alt="" />
          <h6 className="launch-pool-title">DYP Pools</h6>
        </div>
        <span className="launchpad-hero-desc">Stake DYP</span>
        <div className="stake-icon-wrapper p-2">
          <img src={stakingIcon} alt="" />
        </div>
        <hr className="form-divider" />
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <span className="launch-pool-placeholder">APR:</span>
        <div className="span launch-pool-value" style={{filter: 'blur(5px)'}}>{apr}</div>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <span className="launch-pool-placeholder">Total staked:</span>
        <div className="span launch-pool-value" style={{filter: 'blur(5px)'}}>{tvl}</div>
      </div>
      <div className="d-flex align-items-center justify-content-center">
        <button
        disabled
          className={`btn disabled-btn
          
          `}
          // onClick={() => handleDetails()}
        >
          {details === false ? "Stake now" : "Close"}
        </button>
      </div>
    </div>
  );
};

export default LaunchPoolsCard;
