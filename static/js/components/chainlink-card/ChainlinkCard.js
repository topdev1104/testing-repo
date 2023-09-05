import React, { useState, useEffect } from "react";
import axios from "axios";
import chainlinkLogo from "./assets/chainlinkLogo.svg";
import eth from "../../assets/earnAssets/ethereumIcon.svg";
import bnb from "../../assets/earnAssets/bnbIcon.svg";
import avax from "../../assets/earnAssets/avaxIcon.svg";
import "./chainlink.css";
import getFormattedNumber from "../../functions/get-formatted-number";
import CountUp from "react-countup";

const ChainlinkCard = () => {
  const [totalpaid, setTotalPaid] = useState();

  const getTotalPaidData = async () => {
    await axios.get("https://api.dyp.finance/api/totalpaid").then((data) => {
      setTotalPaid(data.data);
    });
  };

  useEffect(() => {
    getTotalPaidData();
  }, []);

  return (
    <div className="chainlink-wrapper">
      <div className="d-flex flex-column gap-2 justify-content-between">
        <div>
          <h6 className="chainlinktitle">
            <a
              href="https://data.chain.link/"
              target={"_blank"}
              rel="noreferrer"
            >
              <img
                src={chainlinkLogo}
                className="pe-1"
                alt=""
                style={{ width: 20, height: 20 }}
              />
              Data Feed by Chainlink
            </a>
          </h6>
        </div>
        <div className="chbottomwrapper">
          {/* <span style={{fontSize: '10px', fontWeight: '400', lineHeight: '14px', color: '#857DFA'}}>Earned by users</span> */}
          <div>
            <h6 className="d-flex align-items-center gap-2 totalpaidtxt text-white">
              <img src={eth} alt="" />
              {getFormattedNumber(totalpaid?.ethTotal.wethPaiOutTotals, 0)} ETH
            </h6>
          </div>
          <div>
            <h6 className="d-flex align-items-center gap-2 totalpaidtxt text-white">
              <img src={bnb} alt="" />
              {getFormattedNumber(totalpaid?.bnbTotal.wbnbPaidOutTotals, 0)} BNB
            </h6>
          </div>
          <div>
            <h6 className="d-flex align-items-center gap-2 totalpaidtxt text-white">
              <img src={avax} alt="" />
              {getFormattedNumber(
                totalpaid?.avaxTotal.avaxPaidOutTotals,
                0
              )}{" "}
              AVAX
            </h6>
          </div>
        </div>
        <div>
          <span
            style={{
              fontWeight: "400",
              fontSize: "10px",
              lineHeight: "15px",
              color: "#c0c9ff",
            }}
          >
            Total rewards paid to users
          </span>
          <h6
            style={{
              fontWeight: "300",
              fontSize: "18px",
              lineHeight: "27px",
              color: "#f7f7fc",
              letterSpacing: '0.05em'
            }}
          >
            {/* ${getFormattedNumber(totalpaid?.totalPaidInUsd)} */}
            <CountUp
              className="count-up"
              style={{
                fontWeight: "300",
              fontSize: "18px",
              lineHeight: "27px",
              color: "#f7f7fc",
              letterSpacing: '0.05em'
              }}
              start={totalpaid?.totalPaidInUsd - 400.0}
              end={totalpaid?.totalPaidInUsd}
              duration={120}
              separator=","
              decimals={2}
              prefix="$"
            />
          </h6>
        </div>
      </div>
    </div>
  );
};

export default ChainlinkCard;
