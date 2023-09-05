import React from "react";
import "./launchpaddetails.css";
import launchpadDetailsIcon from "../assets/launchpadDetailsIcon.svg";
import timerIcon from "../assets/timerIcon.svg";
import coinStack from "../assets/coinStackIcon.svg";
import messageWarningIcon from "../assets/messageWarningIcon.svg";
import { DropdownButton } from "react-bootstrap";
import walletIcon from "../../header/assets/walletIcon.svg";

const LaunchpadDetails = () => {
  return (
    <div className="container-lg">
      <div className="row gap-4 gap-lg-0">
        <div className="col-12 col-lg-7 p-2 p-lg-4 main-details-wrapper position-relative">
          <div
            className="purplediv"
            style={{ left: "0px", background: "#8E97CD" }}
          ></div>
          <div className="d-flex align-items-center gap-2">
            <img src={launchpadDetailsIcon} alt="" />
            <h6 className="launch-details-header">
              iDYP x DeFi Yield Protocol
            </h6>
          </div>
          <p className="mt-3 launch-details-content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            sodales in augue vel sollicitudin. Sed nunc neque, egestas at dictum
            sit amet, pellentesque vitae nulla. Aenean at accumsan nisi, vel
            porta felis. Quisque ut fringilla mi. Aenean eget lectus non augue
            lacinia sagittis non non lectus. Vestibulum eleifend
          </p>
          <h6 className="mt-3 launch-subheader">iDYP x DeFi Yield Protocol</h6>
          <p className="mt-3 launch-details-content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            sodales in augue vel sollicitudin. Sed nunc neque, egestas at dictum
            sit amet, pellentesque vitae nulla. Aenean at accumsan nisi, vel
            porta felis. Quisque ut fringilla mi. Aenean eget lectus non augue
            lacinia sagittis non non lectus.
          </p>
          <p className="launch-details-content mt-3">
            Vestibulum eleifend, odio a consequat gravida, urna metus aliquet
            lacus, placerat consectetur dui ex sed risus. Proin nec dolor
            convallis, auctor nisi eget, pellentesque velit.
          </p>
          <p className="launch-details-content mt-3">
            Aliquam imperdiet risus varius finibus convallis. Nunc ut dictum
            quam. Aenean convallis vitae nunc quis condimentum. Cras dictum
            rhoncus lorem vel ullamcorper. Duis eleifend nec tellus in
            facilisis.
          </p>
          <div className="mt-3">
            <a href="#" className="visit-website">
              Visit website www.loremipsum.com
            </a>
            <div className="mt-4 dates-container d-flex align-items-center justify-content-between p-3">
              <div className="d-flex flex-column gap-1">
                <span className="date-title">Start date</span>
                <h6 className="date-content">12.05.2022</h6>
              </div>
              <img src={timerIcon} alt="" width={75} height={75} />
              <div className="d-flex flex-column gap-1">
                <span className="date-title text-end">End date</span>
                <h6 className="date-content text-end">12.07.2022</h6>
              </div>
            </div>
            <hr className="form-divider my-4" />
            <div className="d-flex align-items center justify-content-between">
              <div className="d-flex align-items center gap-2">
                <img src={coinStack} alt="" />
                <div className="launch-details-header">My tokens</div>
              </div>
              <span className="my-rewards-text">
                My rewards: <b>23.647845 iDYP</b>
              </span>
            </div>
            <div className="tokens-container mt-4">
              <div className="token-card p-3 d-flex flex-column gap-1">
                <span className="date-title">Goal</span>
                <h6 className="date-content">0.00</h6>
              </div>
              <div className="token-card p-3 d-flex flex-column gap-1">
                <span className="date-title">Deposit token</span>
                <h6 className="date-content">0.00</h6>
              </div>
              <div className="token-card p-3 d-flex flex-column gap-1">
                <span className="date-title">Reward token</span>
                <h6 className="date-content">0.00</h6>
              </div>
              <div className="token-card p-3 d-flex flex-column gap-1">
                <span className="date-title">Your deposit</span>
                <h6 className="date-content">0.00</h6>
              </div>
              <div className="token-card p-3 d-flex flex-column gap-1">
                <span className="date-title">Total raised</span>
                <h6 className="date-content">0.00</h6>
              </div>
              <div className="token-card p-3 d-flex flex-column gap-1">
                <span className="date-title">Sale price</span>
                <h6 className="date-content">0.00</h6>
              </div>
            </div>
            <hr className="form-divider my-4" />
            <div className="d-flex align-items-start gap-2">
              <img src={messageWarningIcon} alt="" />
              <div>
                <p className="details-warning" style={{ width: "95%" }}>
                  This form is for project owners to submit their projects for
                  us to review as a potential IDO (Initial DEX Offering).
                </p>
                <p className="details-warning">
                  {" "}
                  <b>DO NOT</b> submit this form if you are looking to
                  participate in an IDO.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5 px-0 px-lg-2">
          <div className="main-details-wrapper p-3 position-relative">
            <div
              className="purplediv"
              style={{ left: "0px", background: "#8E97CD", top: "25px" }}
            ></div>
            <div className="d-flex flex-column flex-lg-row align-items-center align-items-lg-start gap-3 gap-lg-0 justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <img src={coinStack} alt="" />
                <div className="d-flex flex-column gap-1">
                  <h6 className="launch-details-header">Buy iDYP</h6>
                  <span className="details-warning">
                    By depositing one of the supported assets
                  </span>
                </div>
              </div>
              {/* <button id="dropdown-basic-button2">Connect wallet</button> */}
              <DropdownButton
                id="dropdown-basic-button2"
                title={
                  <span
                    className="d-flex align-items-center gap-2 connecttitle position-relative"
                    style={{ bottom: "5px", fontSize: "12px" }}
                  >
                    <img
                      src={walletIcon}
                      alt=""
                      className="position-relative"
                      // style={{ top: 4 }}
                    />
                    Connect Wallet
                  </span>
                }
              ></DropdownButton>
            </div>
            <hr className="form-divider my-4" />
            <span className="my-rewards-text">
              Balance: <b>10000 WETH</b>
            </span>
            <div className="d-flex align-items-center justify-content-between mt-4 gap-2">
             <div className="d-flex align-items-center gap-4">
             <div className="position-relative">
                <h6 className="amount-txt">Amount</h6>
                <input
                  type={"number"}
                  className="styledinput"
                  placeholder="0.0"
                  style={{ width: "100%" }}
                />
              </div>
              <button className="btn maxbtn">Max</button>
             </div>
              <button className="btn filledbtn">Approve</button>
            </div>
          </div>
          <div className="main-details-wrapper p-3 position-relative mt-3">
            <div
              className="purplediv"
              style={{ left: "0px", background: "#8E97CD", top: "25px" }}
            ></div>
            <div className="d-flex align-items-start justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <img src={coinStack} alt="" />
                <div className="d-flex flex-column gap-1">
                  <h6 className="launch-details-header">
                    iDYP token distribution
                  </h6>
                  <span className="details-warning">
                    Tokens will be distributed in approx...
                  </span>
                </div>
              </div>
            </div>
            <hr className="form-divider my-4" />
            <span className="my-rewards-text">
              My rewards: <b>23.647845 iDYP</b>
            </span>
            <div className="d-flex flex-column flex-lg-row gap-4 gap-lg-0 align-items-center justify-content-between mt-3 ">
              <div className="dates-container p-3 me-2 d-flex  align-items-start justify-content-center">
                <div className="d-flex flex-column align-items-center gap-2" style={{width: '65px'}}>
                  <div className="timer-text">00</div>
                  <div className="details-warning">days</div>
                </div>
                <div className="timer-text d-none d-lg-flex"> : </div>
                <div className="d-flex flex-column align-items-center gap-2" style={{width: '65px'}}>
                  <div className="timer-text">00</div>
                  <div className="details-warning">hours</div>
                </div>
                <div className="timer-text d-none d-lg-flex"> : </div>
                <div className="d-flex flex-column align-items-center gap-2" style={{width: '65px'}}>
                  <div className="timer-text">00</div>
                  <div className="details-warning">minutes</div>
                </div>
                <div className="timer-text d-none d-lg-flex"> : </div>
                <div className="d-flex flex-column align-items-center gap-2" style={{width: '65px'}}>
                  <div className="timer-text">00</div>
                  <div className="details-warning">seconds</div>
                </div>
              </div>
              <button className="btn filledbtn" style={{ padding: "9px 30px" }}>
                Claim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchpadDetails;
