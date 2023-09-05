import React from "react";
import moreInfo from "../FARMINNG/assets/more-info.svg";
import topLockedImage from './assets/topLocked.svg'



const PairLockerCard = ({ completed, active, topLocked, id, pair_address, lpAmount, dyp, recipent, unlock, endsIn, startsIn }) => {
  return (
    <div className="pair-locker-card d-flex position-relative">
      {topLocked && <img src={topLockedImage} alt='top locked' className="top-locked-locker" />}
      <div className="col-7 pair-locker-left p-2 d-flex flex-column gap-2 position-relative">
        <div className="d-flex justify-content-between align-items-center">
          <span className="pair-indicator">ID</span>
          <span className="pair-value">{id}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="pair-indicator">Pair address</span>
          <span className="pair-value">...{pair_address}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="pair-indicator">LP Amount</span>
          <span className="pair-value">{lpAmount}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="pair-indicator">DYP</span>
          <span className="pair-value">{dyp}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="pair-indicator">Recipent</span>
          <span className="pair-value">{recipent}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="pair-indicator">Unlock</span>
          <span className="pair-value">{unlock}</span>
        </div>
        <img
          src={require(`./assets/${
            completed === true && active === true
              ? "pairPurple"
              : completed === false && active === true
              ? "pairOrange"
              : "pairGrey"
          }.svg`).default}
          className="pairlocker-badge"
          width={58}
          height={64}
          alt=""
        />
      </div>
      <div
        className={`col-5 pair-locker-right p-2 d-flex flex-column justify-content-between ${
          completed === true && active === true
            ? "active-pair-completed"
            : completed === false && active === true
            ? "active-pair"
            : "inactive-pair"
        }`}
      >
        <div className="d-flex flex-column" style={{ gap: "37px" }}>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-start justify-content-between position-relative">
              <span className="pair-indicator">Status</span>
                {active === true &&  
              <img src={moreInfo} alt="" className="more-info-tag" />
                
                }             
              {active === true ? 
                <div
                className="active-tag d-flex align-items-center gap-2"
                style={{ position: "absolute", right: "0" }}
              >
                <img src={require("./assets/activeMark.svg").default} alt="" />
                <span className="active-tag-text">Active</span>
              </div>
              :
              <div
              className="inactive-tag d-flex align-items-center gap-2"
              style={{ position: "absolute", right: "0" }}
            >
              <img src={require("./assets/inactiveMark.svg").default} alt="" />
              <span className="inactive-tag-text">Inactive</span>
            </div>
            }
            </div>
          </div>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex flex-column gap-2">
              <span className="pair-indicator">Ends in</span>
              <span className="pair-value">{endsIn}</span>
            </div>
            <div className="d-flex flex-column gap-2">
              <span className="pair-indicator">Created</span>
              <span className="pair-value">{startsIn}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 d-flex w-100">
          <button className={`btn filledbtn w-100 ${completed === false && 'hide-btn'}`}>Claim</button>
        </div>
      </div>
    </div>
  );
};

export default PairLockerCard;
