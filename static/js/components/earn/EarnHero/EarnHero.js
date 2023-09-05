import React, { useEffect, useState } from "react";
import earnHeroStats from "../../../assets/earnAssets/earnHeroStats.webp";
import coin from "../../../assets/earnAssets/coin.webp";
import coinBackground from "../../../assets/earnAssets/coinBackground.webp";
import eth from "../../../assets/earnAssets/ethereumIcon.svg";
import bnb from "../../../assets/earnAssets/bnbIcon.svg";
import avax from "../../../assets/earnAssets/avaxIcon.svg";
import getFormattedNumber from "../../../functions/get-formatted-number";
import CountUp from "react-countup";
import axios from "axios";
import totalTvlIcon from "../../../assets/earnAssets/totalTvlIcon.svg";


const EarnHero = () => {
  const [totalpaid, setTotalPaid] = useState();
  const [totalTvl, setTotalTvl] = useState()

  const getTotalPaidData = async () => {
    await axios.get("https://api.dyp.finance/api/totalpaid").then((data) => {
      setTotalPaid(data.data);
    });
  };
  const fetchTotalTvl = async () => {
    await axios.get("https://api.dyp.finance/api/totaltvl").then((data) => {
      setTotalTvl(data.data);
    });
  };

  useEffect(() => {
    getTotalPaidData();
    fetchTotalTvl();
  }, []);

  return (
    <div className="row w-100 flex-column flex-lg-row earn-hero gap-4 gap-lg-0 p-3 p-lg-4 justify-content-between">
      <div className="col-12 col-lg-5 px-0 px-lg-2 d-flex flex-column justify-content-center gap-3">
        <h3 className="text-white" style={{whiteSpace: 'pre'}}>Dypius Earn</h3>
        <p className="text-white ">
        Make the most of your assets with Dypius Earn products. Dypius offers three ways to productively use your assets. Participate in Staking, Farming and Vault. Start earning today!
        </p>
      </div>
      <div className="col-12 col-lg-7 px-0 px-lg-2 d-flex gap-3 gap-lg-4 flex-column flex-lg-row">
        <div className="d-flex align-items-start gap-2 p-3 total-tvl-wrapper position-relative">
          <div className="purplediv" style={{left: '1px', top: '10px'}}></div>
          <img src={totalTvlIcon} alt="total-tvl" />
          <div className="d-flex flex-column gap-1 position-relative" style={{top: '5px'}}>
            <span className="total-tvl-title">Total value locked</span>
            <h6 className="total-tvl-content">${getFormattedNumber(totalTvl)}</h6>
          </div>
        </div>
       <div className="d-flex gap-0 gap-lg-4">
       <div className="d-flex flex-column align-items-start">
          <div className="d-flex flex-column paid-rewards">
            <p style={{ fontSize: "9px", color: "#f7f7fc", fontWeight: "300" }}>
              Rewards paid out
            </p>
            <CountUp
              className="count-up"
              style={{
                fontSize: "19px",
                color: "#f7f7fc",
                fontWeight: "600",
                textAlign: "start",
              }}
              start={totalpaid?.totalPaidInUsd - 400.0}
              end={totalpaid?.totalPaidInUsd}
              duration={120}
              separator=","
              decimals={2}
              prefix="$"
            />
          </div>
          <img
            src={earnHeroStats}
            style={{ width: "230px", height: "80px" }}
            alt=""
          />
        </div>
        <div className="d-flex flex-column justify-content-between">
          <div className="d-flex justify-content-start align-items-center gap-2">
            <img src={eth} alt="" />
            <h4 style={{ color: "#f7f7fc", fontWeight: '500' }}>
              {" "}
              {getFormattedNumber(totalpaid?.ethTotal.wethPaiOutTotals, 0)}
            </h4>
          </div>
          <div className="d-flex justify-content-start align-items-center gap-2">
            <img src={bnb} alt="" />
            <h4 style={{ color: "#f7f7fc", fontWeight: '500' }}>
              {getFormattedNumber(totalpaid?.bnbTotal.wbnbPaidOutTotals, 0)}
            </h4>
          </div>
          <div className="d-flex justify-content-start align-items-center gap-2">
            <img src={avax} alt="" />
            <h4 style={{ color: "#f7f7fc", fontWeight: '500' }}>
              {getFormattedNumber(totalpaid?.avaxTotal.avaxPaidOutTotals, 0)}
            </h4>
          </div>
        </div>
       </div>
        <div className="position-relative d-none d-xxl-block">
          <img src={coin} alt="" className="coin" />
          <img src={coinBackground} alt="" className="coin" />
        </div>
      </div>
    </div>
  );
};

export default EarnHero;
