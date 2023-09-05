import Modal from "../../../../../Modal/Modal";
import axios from "axios";
import _ from "lodash";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// import ToolTip from "../../../../elements/ToolTip";
// import X from "../../../../../assets/images/x_close.png";
import NftPlaceHolder from "../../General/NftPlaceHolder/NftPlaceHolder";
import NftStakingCawChecklist from "../../General/NftStakingCawChecklist/NftStakingCawChecklist";
import { formattedNum } from "../../../../../../functions/formatUSD";
import getFormattedNumber from "../../../../../../functions/get-formatted-number";
// import EthLogo from "../../../../../assets/General/eth-create-nft.png";
// import CountDownTimerUnstake from "../../../../elements/CountDownUnstake";
// import CatLogo from "../../../../../assets/General/cat-totalsupply-icon.svg";
import "./_nftStakeChecklistModal.scss";
import CountDownTimerUnstake from "../../../../../locker/Countdown";

const NftStakeCheckListModal = ({
  nftItem,
  open,
  onShareClick,
  onClose,
  onshowToStake,
  onshowStaked,
  onUnstake,
  onClaimAll,
  link,
  countDownLeft,
  ETHrewards,
  // onNftCheckListClick,
  coinbase,
  isConnected,
  getApprovedNfts,
  hideItem,
  onDepositComplete,
}) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: window.innerWidth < 500 ? "77%" : "55%",
    // bgcolor: "var(--black-26-nft)",
    boxShadow: 24,
    p: 4,
    overflow: "scroll",
    height: "80%",
    borderRadius: "8px",
    overflowX: "hidden",
  };

  const [active, setActive] = useState(true);
  const [showToStake, setshowToStake] = useState(false);
  const [showStaked, setshowStaked] = useState(false);
  const [checkbtn, setCheckBtn] = useState(false);
  const [checkUnstakebtn, setCheckUnstakeBtn] = useState(false);

  const [status, setStatus] = useState("");
  const [loading, setloading] = useState(false);
  const [loadingdeposit, setloadingdeposit] = useState(false);
  const [showClaim, setshowClaim] = useState(false);
  const [loadingClaim, setloadingClaim] = useState(false);

  const [apr, setapr] = useState(50);
  const [showApprove, setshowApprove] = useState(true);
  const [val, setVal] = useState("");
  const [color, setColor] = useState("#F13227");

  //Array of selected NFTs
  const [selectNftIds, setSelectedNftIds] = useState([]);

  const [ethToUSD, setethToUSD] = useState(0);
  let nftIds = [];

  const handleClearStatus = () => {
    const interval = setInterval(async () => {
      setStatus("");
    }, 8000);
    return () => clearInterval(interval);
  };

  const convertEthToUsd = async () => {
    const res = axios
      .get("https://api.coinbase.com/v2/prices/ETH-USD/spot")
      .then((data) => {
        return data.data.data.amount;
      });
    return res;
  };

  const setUSDPrice = async () => {
    const ethprice = await convertEthToUsd();
    setethToUSD(Number(ethprice) * Number(ETHrewards));
  };

  // array containing items whether Staked or To Stake

  const checkApproval = async () => {
    const address = coinbase;

    const stakeApr50 = await window.config.nftstaking_address50;
    if (address !== null) {
      if (apr == 50) {
        const result = await window.nft
          .checkapproveStake(address, stakeApr50)
          .then((data) => {
            return data;
          });

        if (result === true && nftItem.length !== 0) {
          setshowApprove(false);
          setStatus("");
          setColor("#939393");
        } else if (result === true && nftItem.length == 0) {
          setStatus("");
        } else if (result === false) {
          setStatus(" *Please approve before deposit");
          setshowApprove(true);
        }
      }
    }
  };

  // console.log(nftItem)

  const handleSelectAll = () => {
    setCheckBtn(!checkbtn);
    if (checkbtn === false) {
      if (nftIds.length > 50) {
        setSelectedNftIds(nftIds.slice(0, 50));
      } else if (nftIds.length <= 50) {
        setSelectedNftIds(nftIds);
      }
    } else if (checkbtn === true) {
      setSelectedNftIds([]);
    }
    setCheckUnstakeBtn(false);
  };

  const handleSelectAllToUnstake = () => {
    setCheckUnstakeBtn(!checkUnstakebtn);
    if (checkUnstakebtn === false) {
      if (nftIds.length > 50) {
        setSelectedNftIds(nftIds.slice(0, 50));
      } else if (nftIds.length <= 50) {
        setSelectedNftIds(nftIds);
      }
    } else if (checkUnstakebtn === true) {
      setSelectedNftIds([]);
    }
    setCheckBtn(false);
  };

  const handleApprove = async () => {
    const stakeApr50 = await window.config.nftstaking_address50;

    setloading(true);
    setStatus("*Waiting for approval");
    await window.nft
      .approveStake(stakeApr50)
      .then(() => {
        setActive(false);
        setloading(false);
        setColor("#52A8A4");
        setStatus("*Now you can deposit");
      })
      .catch((err) => {
        setloading(false);
        setColor("#F13227");
        setStatus("*An error occurred. Please try again");
        handleClearStatus();
      });
  };

  const handleDeposit = async (value) => {
    let stake_contract = await window.getContractNFT("NFTSTAKING");
    setloadingdeposit(true);
    setStatus("*Processing deposit");
    setColor("#F13227");

    await stake_contract.methods
      .deposit(
        checkbtn === true
          ? nftIds.length === selectNftIds.length
            ? nftIds
            : selectNftIds
          : selectNftIds
      )
      .send()
      .then(() => {
        setloadingdeposit(false);
        setshowClaim(true);
        setActive(true);
        setStatus("*Sucessfully deposited");
        setSelectedNftIds([]);
        setColor("#57AEAA");
        handleClearStatus();
        onDepositComplete();
      })
      .catch((err) => {
        setloadingdeposit(false);
        setColor("#F13227");
        setStatus("*An error occurred. Please try again");
        setSelectedNftIds([]);
        handleClearStatus();
      });
  };

  useEffect(() => {
    setshowStaked(true);
  }, []);

  useEffect(() => {
    setUSDPrice().then();
  }, [ETHrewards]);

  useEffect(() => {
    if (
      selectNftIds.length > 50 &&
      checkbtn === false &&
      showToStake === true
    ) {
      window.alertify.error("Limit to Stake/Unstake NFT is 50 NFT's per round");
      const interval = setInterval(async () => {
        setCheckBtn(false);
        setCheckUnstakeBtn(false);
        return () => clearInterval(interval);
      }, 500);
    } else if (
      selectNftIds.length > 50 &&
      checkbtn === true &&
      showToStake === true
    ) {
      window.alertify.error("Limit to Stake/Unstake NFT is 50 NFT's per round");
      const interval = setInterval(async () => {
        setCheckBtn(false);
        setCheckUnstakeBtn(false);
        setSelectedNftIds([]);
        return () => clearInterval(interval);
      }, 500);
    } else if (
      selectNftIds.length > 50 &&
      checkUnstakebtn === false &&
      showToStake === false
    ) {
      window.alertify.error("Limit to Stake/Unstake NFT is 50 NFT's per round");
      const interval = setInterval(async () => {
        setCheckBtn(false);
        setCheckUnstakeBtn(false);
        return () => clearInterval(interval);
      }, 500);
    } else if (
      selectNftIds.length > 50 &&
      checkUnstakebtn === true &&
      showToStake === false
    ) {
      window.alertify.error("Limit to Stake/Unstake NFT is 50 NFT's per round");
      const interval = setInterval(async () => {
        setCheckBtn(false);
        setCheckUnstakeBtn(false);
        setSelectedNftIds([]);
        return () => clearInterval(interval);
      }, 500);
    }
  }, [selectNftIds.length, val, checkbtn, checkUnstakebtn]);

  useEffect(() => {
    if (showToStake === true) {
      checkApproval().then();
    } else setSelectedNftIds([]);
  }, [showClaim, apr, showToStake]);

  useEffect(() => {
    if (hideItem === "staked") {
      setshowToStake(true);
      setshowStaked(false);
    }
  }, [hideItem, showStaked, showToStake]);

  const onEmptyState = () => {};

  const handleUnstake = async (value) => {
    let stake_contract = await window.getContractNFT("NFTSTAKING");
    setStatus("*Processing unstake");
    setColor("#F13227");

    await stake_contract.methods
      .emergencyWithdraw(
        checkUnstakebtn === true
          ? nftIds.length === selectNftIds.length
            ? nftIds
            : selectNftIds
          : selectNftIds
      )
      .send()
      .then(() => {
        setStatus("*Unstaked successfully");
        setColor("#57AEAA");
        handleClearStatus();
        setSelectedNftIds([]);
      })
      .catch((err) => {
        window.alertify.error(err?.message);
        setStatus("An error occurred, please try again");
        setColor("#F13227");
        setSelectedNftIds([]);
        handleClearStatus();
      });
  };

  const handleClaim = async (itemId) => {
    let staking_contract = await window.getContractNFT("NFTSTAKING");

    setloadingClaim(true);
    setActive(false);
    setStatus("*Claiming rewards...");
    setColor("#F13227");

    await staking_contract.methods
      .claimRewards(
        checkUnstakebtn === true
          ? nftIds.length === selectNftIds.length
            ? nftIds
            : selectNftIds
          : selectNftIds
      )
      .send()
      .then(() => {
        setloadingClaim(false);
        setStatus("*Claimed successfully");
        handleClearStatus();
        setColor("#57AEAA");
        setSelectedNftIds([]);
      })
      .catch((err) => {
        window.alertify.error(err?.message);
        setloadingClaim(false);
        setStatus("An error occurred, please try again");
        setSelectedNftIds([]);
      });
  };

  const devicewidth = window.innerWidth;

  return (
    <Modal
      visible={open}
      setIsVisible={() => {
        onClose();
        setCheckUnstakeBtn(false);
        setCheckBtn(false);
        setSelectedNftIds([]);
      }}
      modalId="stakechecklist"
      width="fit-content"
    >
      <div className="left-col">
        <div className="d-flex align-items-center justify-content-between width-100">
          <div
            className="rarity-rank mt-6"
            style={{
              position: "relative",
              background: "#312F69",
            }}
          >
            <h3
              className="mb-2"
              style={{ fontSize: devicewidth < 500 ? 16 : 32 }}
            >
              Stakeable NFTs
            </h3>
            <h6
              className="checklist-subtitle mb-2"
              style={{ color: "#C0CBF7" }}
            >
              A list of your NFT collection that can be added and removed from the staking pools
            </h6>
          </div>
          {/* <img
              src={X}
              alt=""
              className="close-x"
              onClick={() => {
                onClose();
                setCheckUnstakeBtn(false);
                setCheckBtn(false);
                setSelectedNftIds([]);
              }}
            /> */}
        </div>
        <div className="d-flex flex-column gap-3 mt-2">
          <div
            className="d-flex justify-content-center align-items-center gap-5 pb-3"
            style={{ borderBottom: "1px solid #565891" }}
          >
            <div
              className={showToStake ? "optionbtn-active" : "optionbtn-passive"}
              style={{ display: hideItem === "tostake" ? "none" : "block" }}
            >
              <h5
                className="optiontext"
                onClick={() => {
                  onshowToStake();
                  setshowToStake(true);
                  setshowStaked(false);
                  //Make selectedNfts empty []
                  setSelectedNftIds([]);
                }}
                style={{ fontSize: 14 }}
              >
                To Stake
              </h5>
            </div>
            <div
              className={showStaked ? "optionbtn-active" : "optionbtn-passive"}
              style={{ display: hideItem === "staked" ? "none" : "block" }}
            >
              <h5
                className="optiontext"
                onClick={() => {
                  onshowStaked();
                  setshowStaked(true);
                  setshowToStake(false);
                  //Make selectedNfts empty []
                  setSelectedNftIds([]);
                }}
                style={{ fontSize: 14 }}
              >
                Staked
                {/* {showStaked && (
                <sup className="sup-notification">
                  <span>{nftItem.length}</span>
                </sup>
              )} */}
              </h5>
            </div>
          </div>
          {showToStake === true ? (
            <div className="justify-content-start">
              <button
                onClick={() => {
                  handleSelectAll();
                }}
                className="select-all-btn"
                style={{
                  display: "flex",
                  pointerEvents: nftItem.length !== 0 ? "auto" : "none",
                  opacity: nftItem.length !== 0 ? "1" : "0.4",
                  color: checkbtn === true ? "#4ED5D2" : "#8E97CD",
                }}
              >
                <input
                  type="checkbox"
                  id="add-to-stake"
                  name="checkbtn"
                  checked={checkbtn}
                  onChange={() => {}}
                />
                {checkbtn ? "Unselect All" : "Select All"}
              </button>
            </div>
          ) : (
            <div className="d-flex justify-content-start">
              <button
                onClick={() => {
                  handleSelectAllToUnstake();
                  // selectNftIds.push(value)
                }}
                className="select-all-btn"
                style={{
                  display: "flex",
                  pointerEvents: nftItem.length !== 0 ? "auto" : "none",
                  opacity: nftItem.length !== 0 ? "1" : "0.4",
                  color: checkUnstakebtn === true ? "#4ED5D2" : "#8E97CD",
                }}
              >
                <input
                  type="checkbox"
                  id="add-to-stake"
                  name="AddtoUnstake"
                  checked={checkUnstakebtn}
                />
                {checkUnstakebtn ? "Unselect All" : "Select All"}
              </button>
            </div>
          )}
        </div>
        <div className="">
          <div className="caw-card2 align-items-center">
            {nftItem.length == 0 ? (
              [...Array(devicewidth < 500 ? 1 : 8)].map((item, id) => {
                return (
                  <NftPlaceHolder
                    key={id}
                    width={195}
                    onMintClick={() => {
                      onClose();
                      setCheckUnstakeBtn(false);
                      setCheckBtn(false);
                    }}
                  />
                );
              })
            ) : nftItem.length <= 4 ? (
              <>
                {nftItem.map((item, id) => {
                  let nftId = item.name?.slice(6, nftItem.name?.length);

                  if (showToStake) {
                    // selectNftIds.push(nftId);
                    nftIds.push(nftId);
                  }
                  if (showStaked) {
                    nftIds.push(nftId);

                    // selectNftIds.push(nftId)
                  }
                  return (
                    <>
                      <NftStakingCawChecklist
                        key={id}
                        nft={item}
                        width={195}
                        modalId="#newNftchecklist"
                        isStake={showStaked}
                        countDownLeft={countDownLeft}
                        checked={
                        (  (showToStake === true && checkbtn === true) ||
                          (showStaked === true && checkUnstakebtn === true)) && (selectNftIds.length <=50)
                        }
                        checked2 = {selectNftIds.length <=50 ? true : false}
                        checklistItemID={nftId}
                        onChange={(value) => {
                          selectNftIds.indexOf(value) === -1
                            ? selectNftIds.push(value)
                            : selectNftIds.splice(
                                selectNftIds.indexOf(value),
                                1
                              );
                          setSelectedNftIds(selectNftIds);
                          getApprovedNfts(selectNftIds);
                          console.log(selectNftIds);
                          setVal(value);
                        }}
                        coinbase={coinbase}
                        isConnected={isConnected}
                      />
                    </>
                  );
                })}
                {[
                  ...Array(
                    devicewidth < 500
                      ? 1
                      : Math.abs(8 - parseInt(nftItem.length))
                  ),
                ].map((item, id) => {
                  return (
                    <NftPlaceHolder
                    width={195}
                    key={id}
                      onMintClick={() => {
                        onClose();
                        setCheckUnstakeBtn(false);
                        setCheckBtn(false);
                      }}
                    />
                  );
                })}
              </>
            ) : (
              nftItem.map((item, id) => {
                let nftId = item.name?.slice(6, nftItem.name?.length);
                if (showToStake) {
                  // selectNftIds.push(nftId);
                  nftIds.push(nftId);
                }
                if (showStaked) {
                  nftIds.push(nftId);

                  // selectNftIds.push(nftId)
                }
                return (
                  <>
                    <NftStakingCawChecklist
                      key={id}
                      nft={item}
                      width={195}
                      action={onShareClick}
                      modalId="#NftUnstake2"
                      isStake={showStaked}
                      countDownLeft={countDownLeft}
                      checked={
                        (  (showToStake === true && checkbtn === true) ||
                          (showStaked === true && checkUnstakebtn === true)) && (selectNftIds.length <=50)
                        }
                        checked2 = {selectNftIds.length <=50 ? true : false}
                      checklistItemID={nftId}
                      onChange={(value) => {
                        selectNftIds.indexOf(value) === -1
                          ? selectNftIds.push(value)
                          : selectNftIds.splice(selectNftIds.indexOf(value), 1);
                        setSelectedNftIds(selectNftIds);
                        getApprovedNfts(selectNftIds);
                        console.log(selectNftIds);
                        setVal(value);
                      }}
                      coinbase={coinbase}
                      isConnected={isConnected}
                    />
                  </>
                );
              })
            )}
          </div>
        </div>
      </div>{" "}
      <div style={{ display: "block" }} className="bottom-static-wrapper">
        <p className="d-flex info-text align-items-start gap-3">
          <img src={require("./more-info.svg").default} alt="" />
          {!showStaked
            ? "Please select which NFTs to Stake."
            : "Please select your NFTs to Claim or to Unstake"}
        </p>

        <div className="mt-2">
          <div style={{ display: showStaked === false ? "block" : "none" }}>
            <h5
              className="select-apr d-flex"
              style={{ gap: 12, color: "#C0C9FF" }}
            >
              Select Pool <span className="aprText">50% APR</span>
            </h5>

            <div
              className="d-flex justify-content-between flex-column flex-xxl-row flex-lg-row flex-md-row flex-sm-row"
              style={{ gap: 5, margin: "auto" }}
            >
              <form className="d-flex flex-column" style={{ gap: 5 }}>
                <input
                  type="radio"
                  id="50APR"
                  name="locktime"
                  value="50"
                  checked={true}
                  className="d-none"
                />

                <span className="radioDesc" style={{ color: "#F7F7FC" }}>
                  Stake your NFT to earn rewards (30 days lock time)
                </span>
              </form>
              <div
                className="d-flex justify-content-xxl-between justify-content-lg-between justify-content-md-between  justify-content-sm-between align-items-center"
                style={{ gap: 5 }}
              >
                <span
                  id="ethPrice"
                  className="mb-0"
                  style={{
                    display: "flex",
                    color: "#4CD0CD",
                    fontWeight: 700,
                    alignItems: "center",
                  }}
                >
                  {selectNftIds.length}
                  /50
                </span>
                <span
                  style={{
                    color: "#4CD0CD",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  selected
                </span>

                <img
                  src={require("./catlogo.svg").default}
                  alt=""
                  style={{ width: 24, height: 24 }}
                />
              </div>
            </div>

            <div
              className="mt-4 row justify-content-xxl-between justify-content-lg-between justify-content-md-between justify-content-sm-between justify-content-center gap-3"
              style={{
                gap: 20,
                display: showStaked === false ? "" : "none",
              }}
            >
              <button
                className="btn activebtn"
                onClick={() => {
                  handleApprove();
                }}
                style={{
                  background:
                    active && nftItem.length > 0
                      ? "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)"
                      : "#14142A",
                  pointerEvents: active && nftItem.length > 0 ? "auto" : "none",
                  display: showApprove === true ? "block" : "none",
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner-border " role="status"></div>
                  </>
                ) : (
                  "Approve"
                )}
              </button>
              <button
                className="btn passivebtn"
                style={{
                  background:
                    !active ||
                    (!showApprove &&
                      nftItem.length > 0 &&
                      selectNftIds.length != 0 &&
                      selectNftIds.length < 51)
                      ? "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)"
                      : "#14142A",
                  pointerEvents:
                    !active || (!showApprove && nftItem.length > 0)
                      ? "auto"
                      : "none",
                }}
                onClick={() =>
                  (checkbtn === true && selectNftIds.length === 0) ||
                  (checkbtn === false && selectNftIds.length === 0) ||
                  selectNftIds.length > 50
                    ? onEmptyState()
                    : handleDeposit(val)
                }
              >
                {loadingdeposit ? (
                  <>
                    <div
                      className="spinner-border "
                      role="status"
                      style={{ height: "1.5rem", width: "1.5rem" }}
                    ></div>
                  </>
                ) : (
                  "Deposit"
                )}
              </button>
            </div>
            <p className="mt-1" style={{ color: color, textAlign: "center" }}>
              {status}
            </p>
          </div>
        </div>

        <div
          className="mt-2"
          style={{
            display:
              showStaked === true && nftItem.length > 0 ? "block" : "none",
          }}
        >
          <div>
            <div
              className="mt-4 d-flex flex-column flex-xxl-row flex-lg-row flex-md-row align-items-center justify-content-between"
              style={{ gap: 20 }}
            >
              <div className="row m-0 claimAll-wrapper">
                <div
                  className="earn-checklist-container d-flex align-items-start justify-content-between mb-0 w-100"
                  style={{
                    boxShadow: "none",
                    borderTop: "none",
                    paddingLeft: 0,
                    paddingRight: 0,
                  }}
                >
                  <div
                    className="d-flex align-items-start justify-content-between mb-3 w-100"
                    style={{
                      gap: 10,
                    }}
                  >
                    <p
                      id="earnedText"
                      className="mb-0"
                      style={{
                        display: "flex",
                        gap: 5,
                        alignItems: "baseline",
                      }}
                    >
                      {/* <ToolTip
                          title=""
                          icon={"i"}
                          padding={"5px 0px 0px 0px"}
                        /> */}
                      Total earned
                    </p>
                    <div className="d-flex justify-content-between">
                      <h6 className="rewardstxtCaws d-flex align-items-center gap-2">
                        <img src={require("./weth.svg").default} alt="" />{" "}
                        {getFormattedNumber(ETHrewards, 6)} WETH (
                        {formattedNum(ethToUSD, true)})
                      </h6>
                      {/* <img
                          src={EthLogo}
                          alt=""
                          style={{ width: 24, height: 24 }}
                        /> */}
                    </div>
                  </div>
                </div>

                <button
                  className="btn claim-reward-button"
                  onClick={() => {
                    checkUnstakebtn === true &&
                    selectNftIds.length === nftItem.length
                      ? onClaimAll()
                      : checkUnstakebtn === true && selectNftIds.length === 0
                      ? onEmptyState()
                      : selectNftIds.length !== 0 &&
                        selectNftIds.length < nftItem.length
                      ? handleClaim(selectNftIds)
                      : onClaimAll();
                    // setCheckUnstakeBtn(false);
                  }}
                  style={{
                    background:
                      ETHrewards != 0
                        ? "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)"
                        : "#14142A",
                    pointerEvents: ETHrewards != 0 ? "auto" : "none",
                    width: "50%",
                    borderRadius: "8px",
                    color: ETHrewards != 0 ? "#FFFFFF" : "#C0C9FF",
                    margin: "auto",
                  }}
                >
                  {loadingClaim ? (
                    <>
                      <div className="spinner-border " role="status"></div>
                    </>
                  ) : (
                    "Claim All Rewards"
                  )}
                </button>
              </div>
              <div className="row claimAll-wrapper m-0">
                <div
                  className="earn-checklist-container d-block mb-0 w-100"
                  style={{
                    boxShadow: "none",
                    borderTop: "none",
                    paddingLeft: 0,
                    paddingRight: 0,
                  }}
                >
                  <div
                    className="d-flex"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-baseline flex-column"
                      style={{}}
                    >
                      <div
                        className="d-flex align-items-baseline"
                        style={{ gap: 5 }}
                      >
                        {/* <ToolTip
                            title="You will continue to earn rewards even after your lock time expires as long as you don't Unstake your NFTs.

                    *The lock time will reset if you stake more NFTs."
                            icon={"i"}
                            color={"#999999"}
                            borderColor={"#999999"}
                            padding={"5px 1px 0px 0px"}
                          /> */}
                        <p className="claim-timer-subtitle m-0">Cooldown</p>
                      </div>
                      <CountDownTimerUnstake
                        date={Date.now() + countDownLeft}
                        onComplete={() => {}}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div
                        className="d-flex justify-content-end"
                        style={{ gap: 5 }}
                      >
                        <span
                          id="ethPrice"
                          className="mb-0"
                          style={{
                            alignItems: "end",
                            display: "flex",
                            color: "#4CD0CD",
                          }}
                        >
                          {countDownLeft < 0 ? selectNftIds.length : 0}
                          /50
                        </span>
                        <span
                          style={{
                            color: "#4CD0CD",
                            fontWeight: 700,
                            lineHeight: "18px",
                            display: "flex",
                            alignItems: "end",
                          }}
                        >
                          selected
                        </span>

                        <img
                          src={require("./catlogo.svg").default}
                          alt=""
                          style={{ width: 24, height: 24 }}
                        />
                      </div>
                      <span
                        style={{ fontSize: 10, color: "#C0C9FF" }}
                        className="mt-1"
                      >
                        Maximum of 50 NFTs selectable
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn activebtn"
                  onClick={() => {
                    checkUnstakebtn === true &&
                    selectNftIds.length === nftItem.length &&
                    selectNftIds.length < 51
                      ? onUnstake()
                      : (checkUnstakebtn === true &&
                          selectNftIds.length === 0) ||
                        selectNftIds.length > 50
                      ? onEmptyState()
                      : selectNftIds.length !== 0 &&
                        selectNftIds.length < nftItem.length
                      ? handleUnstake(selectNftIds)
                      : onUnstake();
                  }}
                  style={{
                    background:
                      active &&
                      selectNftIds.length !== 0 &&
                      countDownLeft < 0 &&
                      selectNftIds.length < 51
                        ? "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)"
                        : nftItem.length !== 0 &&
                          selectNftIds.length != 0 &&
                          selectNftIds.length < 51 &&
                          countDownLeft < 0
                        ? "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)"
                        : "#14142A",
                    pointerEvents:
                      active && selectNftIds.length !== 0
                        ? "auto"
                        : nftItem.length !== 0 &&
                          checkUnstakebtn === true &&
                          selectNftIds.length == 0
                        ? "auto"
                        : "none",
                    width: "50%",
                    borderRadius: "8px",
                    color: ETHrewards != 0 ? "#FFFFFF" : "#C0C9FF",
                    margin: "auto",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border " role="status"></div>
                    </>
                  ) : (
                    "Unstake Selected"
                  )}
                </button>

                <div></div>
              </div>
            </div>
            <p className="mt-1" style={{ color: color }}>
              {showApprove === false ? "" : status}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
NftStakeCheckListModal.propTypes = {
  nftItem: PropTypes.array,
  open: PropTypes.bool,
  onShareClick: PropTypes.func,
  onClose: PropTypes.func,
  onshowToStake: PropTypes.func,
  onshowStaked: PropTypes.func,
  onClaimAll: PropTypes.func,
  onUnstake: PropTypes.func,
  ETHrewards: PropTypes.number,
  getApprovedNfts: PropTypes.func,
  isConnected: PropTypes.bool,
  coinbase: PropTypes.string,
};

export default NftStakeCheckListModal;
