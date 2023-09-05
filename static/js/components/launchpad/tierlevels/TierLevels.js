import React from "react";
import "./tierlevels.css";
import stakingIcon from "../assets/stakingIcon.svg";
import dypLogo from "../../top-pools-card/assets/dyplogo.svg";
import timerIcon from "../assets/timerIcon.svg";
import Slider from "react-slick";
import LaunchPoolsCard from "./LaunchPoolsCard";
import { useState } from "react";
import initConstantStakingNew from "../../FARMINNG/constant-staking-new-front";
import getFormattedNumber from "../../../functions/get-formatted-number";
import customSliderArrow from '../assets/customSliderArrow.svg'
import { useRef } from "react";
import { NavLink } from "react-router-dom";

const TierLevels = ({
  coinbase,
  chainId,
  handleConnection,
  the_graph_result,
  isConnected,
  lp_id,
  display,
  infoDisplay
}) => {
  const stake = [
    {
      icon: "dyplogo.svg",
      top_pick: true,
      tokenName: "DYP",
      apy: "1.08",
      tvl_usd: "48543.20",
      lockTime: "No lock",
    },
    {
      icon: "dyplogo.svg",
      top_pick: false,
      tokenName: "DYP",
      apy: "1.08",
      tvl_usd: "48543.20",
      lockTime: "90 Days",
    },
    {
      icon: "idypius.svg",
      top_pick: false,
      tokenName: "iDYP",
      apy: "1.08",
      tvl_usd: "48543.20",
      lockTime: "No lock",
    },
    // {
    //   icon: "idypius.svg",
    //   top_pick: false,
    //   tokenName: "iDYP",
    //   apy: "1.08",
    //   tvl_usd: "48543.20",
    //   lockTime: "90 days",
    // },
    // {
    //   icon: "idypius.svg",
    //   top_pick: false,
    //   tokenName: "iDYP",
    //   apy: "1.08",
    //   tvl_usd: "48543.20",
    //   lockTime: "No lock",
    // },
    // {
    //   icon: "idypius.svg",
    //   top_pick: false,
    //   tokenName: "iDYP",
    //   apy: "1.08",
    //   tvl_usd: "48543.20",
    //   lockTime: "90 days",
    // },
  ];

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1138,
        settings: {
          arrows: false,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: false,
          arrows: false,
        },
      },
    ],
  };


  const [showdetails, setShowdetails] = useState(false);
  const [activeCard, setActiveCard] = useState();
  const [cardIndex, setCardIndex] = useState();
  const [details, setDetails] = useState();
  const slider = useRef()

  const next = () => {
    slider.current.slickNext();
  };
  const previous = () => {
    slider.current.slickPrev();
  };




  const stakeArrayStakeNew = [
    window.constant_staking_new1,
    window.constant_staking_new2,
  ];

  const aprArrayStake = [25, 50];
  const eth_address = "ETH";
  const feeArrayStake = [0.25, 0.5];
  const lockarray = ["No Lock", 90];

  const ConstantStaking1 = initConstantStakingNew({
    staking: stakeArrayStakeNew[cardIndex],
    apr: aprArrayStake[cardIndex],
    liquidity: eth_address,
    expiration_time: "14 December 2022",
    other_info: false,
    fee: feeArrayStake[cardIndex],
    coinbase: coinbase,
    handleConnection: handleConnection,
    chainId: chainId,
    lockTime: lockarray[cardIndex],
    listType: "table",
  });

  return (
    <div className="container-lg px-0">
      <div className="d-flex flex-column gap-3">
        <h6 className="launchpad-hero-title">My tier level</h6>
        <span className="launchpad-hero-desc tier-level-title"  style={{display: display}}>
          Discover your Launchpad tier and check how much you are eligible to
          benefit. Increase your tier by depositing assets to Launchpools.
        </span>
      </div>
      <div className="active-projects-container px-3 px-lg-5 pb-5 pb-lg-0 pt-5 mt-4">
      <div className={`tier-info-wrapper ${infoDisplay === 'flex' ? 'd-flex' : 'd-none'} flex-column flex-lg-row align-items-center justify-content-between p-2 p-lg-3 gap-2 gap-lg-0 mx-0 mx-lg-3`} >
          <span className="tier-info-text">In order to increase the current tier and benefit more of the Launchpad projects, participants need to stake DYP in a staking pool.</span>
          <NavLink to='/launchpad/tiers'>
            <button className="btn filledbtn px-4" style={{whiteSpace: 'pre'}}>View</button>
          </NavLink>
        </div>
      <div
        className=" d-flex justify-content-start justify-content-lg-center mt-4  position-relative tiers-container px-3 px-lg-0"
        style={{ gap: "100px", paddingBottom: "170px" }}
      >

        <hr className="tier-divider d-none d-lg-flex" />
        <div
          className="current-tier-wrapper selected-tier-wrapper d-flex flex-column align-items-center justify-content-start gap-2 position-relative p-3"
        >
          <span className="current-tier">Current tier</span>
          <h6 className="current-tier-title">Bronze</h6>
          {/* <h6 className="tier-title">2</h6> */}
          <img
            src={require(`../assets/bronzeBadge.svg`).default}
            alt=""
            className="tier-medal"
          />
          <h6 className="tier-dyp-amount">5,000 DYP</h6>
        </div>
        <div
          className="next-tier-wrapper d-flex flex-column align-items-center justify-content-start gap-2 position-relative p-3"
        >
          <span className="next-tier">Next tier</span>
          <h6 className="tier-title">Silver</h6>
          {/* <h6 className="tier-title">2</h6> */}
          <img
            src={require(`../assets/silverBadge.svg`).default}
            alt=""
            className="tier-medal"
          />
          <h6 className="tier-dyp-amount">10,000 DYP</h6>
        </div>
        <div
          className="next-tier-wrapper d-flex flex-column align-items-center justify-content-start gap-2 position-relative p-3"
        >
          <span className="next-tier">Next tier</span>
          <h6 className="tier-title">Gold</h6>
          {/* <h6 className="tier-title">2</h6> */}
          <img
            src={require(`../assets/goldBadge.svg`).default}
            alt=""
            className="tier-medal"
          />
          <h6 className="tier-dyp-amount">25,000 DYP</h6>
        </div>
        <div
          className="next-tier-wrapper d-flex flex-column align-items-center justify-content-start gap-2 position-relative p-3"
        >
          <span className="next-tier">Next tier</span>
          <h6 className="tier-title">Platinum</h6>
          {/* <h6 className="tier-title">2</h6> */}
          <img
            src={require(`../assets/platinumBadge.svg`).default}
            alt=""
            className="tier-medal"
          />
          <h6 className="tier-dyp-amount">50,000 DYP</h6>
        </div>
        <div
          className="next-tier-wrapper d-flex flex-column align-items-center justify-content-start gap-2 position-relative p-3"
        >
          <span className="next-tier">Next tier</span>
          <h6 className="tier-title">Diamond</h6>
          {/* <h6 className="tier-title">2</h6> */}
          <img
            src={require(`../assets/diamondBadge.svg`).default}
            alt=""
            className="tier-medal"
          />
          <h6 className="tier-dyp-amount">100,000 DYP</h6>
        </div>
      </div>
      </div>
      <div style={{display: display}}>
      <h6 className="launchpad-hero-title mt-5">Launchpools</h6>
      <div className="row w-100 gap-4 gap-lg-0 mx-0 flex-column flex-lg-row active-projects-container d-flex align-items-center justify-content-between mt-4 p-3">
        <div className="col-12 col-lg-4 d-flex flex-column gap-5">
          <div className="d-flex flex-column gap-3">
            <p
              className="d-flex align-items-center gap-2 staking-pill py-2 px-3"
              style={{ border: "none" }}
            >
              <img src={stakingIcon} alt="" height={24} width={24} />
              Staking
            </p>
            <div className="d-flex align-items-center gap-2">
              <img src={dypLogo} alt="" />
              <h6
                style={{
                  fontWeight: "600",
                  fontSize: "20px",
                  lineHeight: "18px",
                  color: "#f7f7fc",
                }}
              >
                DYP
              </h6>
            </div>
            <p className="launchpad-hero-desc">
              Dypius is a powerful, decentralized ecosystem build on next-gen
              infrastructure.
            </p>
            <div className="d-flex flex-column flex-lg-row align-items-center gap-4 gap-lg-5" >
              <div className="d-flex flex-row flex-lg-column align-items-center justify-content-between w-100 gap-1">
                <span className="time-left">Total rewards</span>
                <div className="date-content">0.00</div>
              </div>
              <div className="d-flex flex-row flex-lg-column align-items-center justify-content-between w-100 gap-1">
                <span className="time-left">Lock time</span>
                <div className="date-content">90-days</div>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column gap-1">
            <div className="time-left">Time until staking ends</div>
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-start justify-content-start position-relative"
                style={{ right: "1rem", width: "fit-content" }}
              >
                <div
                  className="d-flex flex-column align-items-center gap-2"
                  style={{ width: "65px" }}
                >
                  <div className="timer-text">00</div>
                  <div className="details-warning">days</div>
                </div>
                <div className="timer-text d-none d-lg-flex"> : </div>
                <div
                  className="d-flex flex-column align-items-center gap-2"
                  style={{ width: "65px" }}
                >
                  <div className="timer-text">00</div>
                  <div className="details-warning">hours</div>
                </div>
                <div className="timer-text d-none d-lg-flex"> : </div>
                <div
                  className="d-flex flex-column align-items-center gap-2"
                  style={{ width: "65px" }}
                >
                  <div className="timer-text">00</div>
                  <div className="details-warning">minutes</div>
                </div>
                <div className="timer-text d-none d-lg-flex"> : </div>
                <div
                  className="d-flex flex-column align-items-center gap-2"
                  style={{ width: "65px" }}
                >
                  <div className="timer-text">00</div>
                  <div className="details-warning">seconds</div>
                </div>
              </div>
              <img src={timerIcon} width={56} height={56} className="d-none d-lg-flex" alt="" />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-7">
          <div className="row flex-column-reverse flex-lg-row">
            <div className="col-12 col-lg-8">
              <Slider ref={(c) => (slider.current = c)} {...settings}>
                {/* <LaunchPoolsCard />
                    <LaunchPoolsCard />
                    <LaunchPoolsCard />
                    <LaunchPoolsCard /> */}
                {stake.map((pool, index) => (
                  <LaunchPoolsCard
                    key={index}
                    chain={"eth"}
                    top_pick={pool.top_pick}
                    tokenName={pool.tokenName}
                    apr={pool.apy + "%"}
                    tvl={"$" + getFormattedNumber(pool.tvl_usd)}
                    lockTime={pool.lockTime}
                    onShowDetailsClick={() => {
                      setActiveCard(stake[index]);
                      setCardIndex(index);
                      setDetails(index);
                    }}
                    onHideDetailsClick={() => {
                      setActiveCard(null);
                      setDetails();
                    }}
                    details={details === index ? true : false}
                  />
                ))}
              </Slider>
            </div>
            <div className="col-12 col-lg-4 d-flex flex-column justify-content-between">
              <h6 className="time-left d-flex justify-content-center">
                Tier progress
              </h6>
              <div className="d-flex flex-column gap-2 mt-2 position-relative">
               <div className="d-flex align-items-center gap-2">
               <div className="tier-roadmap-number p-1 d-flex align-items-center justify-content-center">
                    <span className="roadmap-number">1</span>
                </div>
                <span className="launch-pool-value">Need to buy DYP</span>
               </div>
              <div className="roadmap-line"></div>
               <div className="d-flex align-items-center gap-2">
               <div className="tier-roadmap-number p-1 d-flex align-items-center justify-content-center">
                    <span className="roadmap-number">2</span>
                </div>
                <span className="launch-pool-value">Need to hold DYP</span>
               </div>
              <div className="roadmap-line"></div>
              <div className="d-flex align-items-center gap-2">
               <div className="tier-roadmap-number p-1 d-flex align-items-center justify-content-center">
                    <span className="roadmap-number">3</span>
                </div>
                <span className="launch-pool-value">Need to stake DYP</span>
               </div>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-4">
                <div className="p-3 d-flex justify-content-center align-items-center cursor-pointer" onClick={() => previous()}>
                    <img src={customSliderArrow} alt="" className="prev-arrow" />
                </div>
                <div className="p-3 d-flex justify-content-center align-items-center cursor-pointer" onClick={() => next()}>
                    <img src={customSliderArrow} alt=""  className="next-arrow"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></div>
      {activeCard && (
        <ConstantStaking1
          is_wallet_connected={isConnected}
          coinbase={coinbase}
          the_graph_result={the_graph_result}
          lp_id={lp_id[cardIndex]}
          chainId={chainId}
          handleConnection={handleConnection}
        />
      )}
    </div>
  );
};

export default TierLevels;
