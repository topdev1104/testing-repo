import React, { useEffect, useState } from "react";
import "./top-pools.css";
import greenArrow from "./assets/greenarrow.svg";
import orangeArrow from "./assets/orangearrow.svg";
import newPool from "./assets/newPool.png";
import cawsLogo from "./assets/newCawsLogo.png";
import staked from "./assets/staked.svg";
import topPick from "./assets/cawsbanner.svg";
import purpleArrow from "./assets/purpleArrow.svg";


const CawsCard = ({
  cardId,
  onShowDetailsClick,
  onHideDetailsClick,
  cardType,
  renderedPage,
  details,
  listType,
  tvl,
  network,
  expired,
  // showDetails,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [mystakes, setMystakes] = useState([]);

  const myStakes = async () => {
    let staking_contract = await new window.infuraWeb3.eth.Contract(
      window.NFT_ABI,
      window.config.nft_address,
      { from: undefined }
    );

    await staking_contract.methods
      .balanceOf(window.config.nftstaking_address)
      .call()
      .then((data) => {
        setMystakes(data);
      });
  };

  useEffect(() => {
    myStakes().then();
  }, []);

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
        } ${
          expired === true
            ? "poolscardwrapperexpired"
            : network === "0"
            ? "blurryCard"
            : "poolscardwrapper"
        }`}
        onClick={() => handleDetails()}
      >
        <img src={topPick} className="cawstoppick" alt="top pick" />
        <div
          className="purplediv"
          style={{ background: details ? "#7770e0" : "#8890C4", top: "12px" }}
        ></div>
        <div className="d-flex flex-column gap-0">
          <div
            className="d-flex m-0 justify-content between gap-2 align-items-center justify-content-between"
            style={{ padding: "0px 16px" }}
          >
            <h6 className="token-name d-flex align-items-center gap-2">
              <img
                src={cawsLogo}
                alt=""
                className="tokenlogo"
                style={{ height: 32, width: 32 }}
              />{" "}
              CAWS
            </h6>

            <div className="d-flex align-items-baseline gap-1">
              <h6 className="apr-amount">50%</h6>
              <h6 className="apr-title">APR</h6>
            </div>
          </div>
          <div
            className={`d-flex m-0 justify-content between gap-2 align-items-center justify-content-between ${
              expired === true ? "bottomwrapperExpired" : "bottomwrapper"
            }`}
          >
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

              <h6 className="locktime-amount">30 days</h6>
            </div>
          </div>
          <div
            className={
              expired === true ? "details-wrapperexpired" : "details-wrapper"
            }
            onClick={() => {
              handleDetails();
            }}
          >
            <h6
              className="details-text gap-1 d-flex align-items-center"
              style={{
                color:
                  details === false && expired === false
                    ? "#75CAC2"
                    : details === false && expired === true
                    ? "#C1CCF8"
                    : "#C0C9FF",
              }}
            >
              {details === false && expired === false
                ? "Deposit"
                : details === false && expired === true
                ? "Details"
                : "Close"}
              <img
                src={
                  details === false && expired === false
                     ? greenArrow :
                     details === false && expired === true
                      ? purpleArrow
                      : details === true && expired === true
                      ? orangeArrow
                      : orangeArrow
                 
                }
                alt=""
              />
            </h6>
          </div>
        </div>
      </div>
    </>
  );
};

export default CawsCard;
