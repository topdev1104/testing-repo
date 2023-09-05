import React from "react";
import filledArrow from "./assets/filledarrow.svg";
import zoom from "./assets/zoom.svg";
import swapIcon from '../../assets/sidebarIcons/swapIcon.svg'
import explorerChart from './assets/explorerChart.webp'
import swapBanner from './assets/swapBanner.png'
import "./explorer-card.css";
import { NavLink } from "react-router-dom";

const ExplorerCard = () => {
  return (
    <a href="https://swap.dypius.com/" className="explorercard-wrapper d-flex position-relative">
      <div className="purplediv" style={{background: '#8890C4', top: '15px'}}></div>
      <div className="col-12 col-lg-6 d-flex flex-column gap-3 justify-content-between">
        <div className=" d-flex justify-content-between gap-2 align-items-center">
          <h6 className="explorercard-title d-flex gap-2 align-items-center">
            <img src={swapIcon} alt="" /> Swap
          </h6>
          <div className="d-flex flex-column gap-0">
            {/* <h6 className="topapr-title">Top APR</h6> */}
            {/* <h6 className="topapr-amount">1.09%</h6> */}
          </div>
        </div>
        <div>
          <h6 className="explorercard-desc">
          Swap your tokens with lightning speed and minimal fees, across multiple blockchain networks with ease
          </h6>
        </div>
        <div className="">
          <h6 className="explorercard-btntext d-flex gap-2 align-items-center">
            Explore more <img src={filledArrow} alt="" />
          </h6>
        </div>
      </div>
      <div className="col-6 d-flex justify-content-center align-items-center">
        {/* <img src={swapBanner} className="explorer-chart d-none d-lg-flex" alt="" /> */}
      </div>
    </a>
  );
};

export default ExplorerCard;
