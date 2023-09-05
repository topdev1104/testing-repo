import React, { useState } from "react";
import "./top-pools.css";
import greenArrow from "./assets/greenarrow.svg";
import orangeArrow from "./assets/orangearrow.svg";
import newPool from "./assets/newPool.png";
// import staked from "./assets/staked.svg";
// import topPick from "./assets/cawsbanner.svg";

const CawsWodCard = ({
  cardId,
  onShowDetailsClick,
  onHideDetailsClick,
  cardType,
  renderedPage,
  details,
  listType,
  tvl,
  network,
  // showDetails,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const coins = ["newCawsLogo", "lanft-poolicon"];

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
    <>
      <div
        className={`poolscardwrapper cursor-pointer position-relative ${
          details && "pools-cardcaws-open"
        }  ${
          renderedPage === "dashboard" && !details ? "pools-cardcaws-hover" : ""
        } ${network === "0" ? "blurryCard" : "poolscardwrapper"}`}
        onClick={() => handleDetails()}
      >
        <img src={newPool} className="new-pool" alt="top pick" />

        <div
          className="purplediv"
          style={{ background: details ? "#7770e0" : "#8890C4", top: "12px" }}
        ></div>
        <div className="d-flex flex-column gap-0">
          <div
            className="d-flex m-0 justify-content between gap-2 align-items-center justify-content-between"
            style={{ padding: "0px 16px" }}
          >
            <div className="d-flex align-items-center">
              {coins.length > 0 &&
                coins.map((coin, index) => (
                  <img
                    key={index}
                    src={require(`./assets/${coin}.png`).default}
                    alt=""
                    className="pool-coins"
                  />
                ))}
              <h6 className="token-name d-flex align-items-center gap-2">
                CAWS + WOD
              </h6>
            </div>

            <div className="d-flex align-items-baseline gap-1">
              <h6 className="apr-amount">50%</h6>
              <h6 className="apr-title">APR</h6>
            </div>
          </div>
          <div className="d-flex m-0 justify-content between gap-2 align-items-center justify-content-between bottomwrapper">
            {cardType !== "Vault" && (
              <div className="d-flex flex-column">
                <h6 className="tvl-text">Total Value Locked</h6>
                <h6 className="tvl-amount">{tvl}</h6>
              </div>
            )}
            <div
              className={`d-flex flex-column ${
                cardType !== "Vault" && "align-items-end"
              }`}
            >
              <h6 className="tvl-text">Lock Time</h6>

              <h6 className="locktime-amount">No Lock</h6>
            </div>
          </div>
          <div
            className="details-wrapper"
            onClick={() => {
              handleDetails();
            }}
          >
            <h6
              className="details-text gap-1 d-flex align-items-center"
              style={{ color: details === false ? "#75CAC2" : "#C0C9FF" }}
            >
              {details === false ? "Deposit" : "Close"}
              <img src={details === false ? greenArrow : orangeArrow} />
            </h6>
          </div>
        </div>
      </div>
    </>
  );
};

export default CawsWodCard;
