import Modal from "../../../../../Modal/Modal";
import axios from "axios";
import _ from "lodash";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import NftPlaceHolder from "../../General/NftPlaceHolder/NftPlaceHolder";
import NftStakingCawChecklist from "../../General/NftStakingCawChecklist/NftStakingCawChecklist";
import { formattedNum } from "../../../../../../functions/formatUSD";
import getFormattedNumber from "../../../../../../functions/get-formatted-number";
import "./_nftStakeChecklistModal.scss";
import CountDownTimerUnstake from "../../../../../locker/Countdown";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import LandNftChecklist from "../../General/NftStakingCawChecklist/LandNftChecklist";
import LandNFTPlaceHolder from "../../../../../LandNFTModal/LandNFTPlaceHolder";
import CawsWodNftChecklist from "../../General/NftStakingCawChecklist/CawsWodNftChecklist";
import CawsWodNftPlaceHolder from "../../../../../LandNFTModal/CawsWodNftPlaceHolder";

const NftCawsWodChecklistModal = ({
  nftItem,
  landItems,
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
  onShowNextScreen,
  onShowBackScreen,
  coinbase,
  isConnected,
  getApprovedNfts,
  getApprovedLandNfts,
  hideItem,
  onDepositComplete,
  screenName,
  cawsStakes,
  landStakes,
  cawsItems,
}) => {
  const [active, setActive] = useState(true);
  const [showToStake, setshowToStake] = useState(false);
  const [showStaked, setshowStaked] = useState(false);
  const [checkbtn, setCheckBtn] = useState(false);

  const [checkLandbtn, setCheckLandBtn] = useState(false);

  const [checkUnstakebtn, setCheckUnstakeBtn] = useState(false);

  const [status, setStatus] = useState("");
  const [loading, setloading] = useState(false);
  const [loadingdeposit, setloadingdeposit] = useState(false);
  const [showClaim, setshowClaim] = useState(false);
  const [loadingClaim, setloadingClaim] = useState(false);
  const [loadingWithdraw, setloadingWithdraw] = useState(false);
  const [checknft, setchecknft] = useState(false);

  const [apr, setapr] = useState(50);
  const [showCawsApprove, setshowCawsApprove] = useState(true);
  const [showLandApprove, setshowLandApprove] = useState(true);

  const [val, setVal] = useState("");
  const [color, setColor] = useState("#F13227");

  //Array of selected NFTs
  const [selectNftIds, setSelectedNftIds] = useState([]);
  const [selectNftLandIds, setSelectedNftLandIds] = useState([]);

  const [ethToUSD, setethToUSD] = useState(0);
  let nftIds = [];
  let nftLandIds = [];

  const handleClearStatus = () => {
    const interval = setInterval(async () => {
      setStatus("");
      setloadingWithdraw(false);
      setloadingdeposit(false);
      setloadingClaim(false);
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

    const stakeApr50 = await window.config.wod_caws_address;
    if (address !== null && address !== undefined) {
      if (apr == 50) {
        const result = await window.nft
          .checkapproveStake(address, stakeApr50)
          .then((data) => {
            return data;
          });

        if (result === true && nftItem.length !== 0) {
          setshowCawsApprove(false);
          setStatus("");
          setColor("#939393");
        } else if (result === true && nftItem.length == 0) {
          setStatus("");
        } else if (result === false) {
          setStatus("");
          setshowCawsApprove(true);
        }
      }
    }
  };

  const checkApprovalLand = async () => {
    const address = coinbase;
    const stake25 = await window.config.wod_caws_address;
    if (address !== null && address !== undefined) {
      const result = await window.landnft
        .checkapproveStake(address, stake25)
        .then((data) => {
          return data;
        });

      if (result === true && nftItem.length !== 0) {
        setshowLandApprove(false);
        setStatus("");
        setColor("#939393");
      } else if (result === true && nftItem.length === 0) {
        setStatus("");
      } else if (result === false) {
        setStatus("");
        setshowLandApprove(true);
      }
    }
  };

  // console.log(getApprovedLandNfts(selectNftLandIds), getApprovedNfts(selectNftIds))

  const handleApprove = async () => {
    const stakeApr50 = await window.config.wod_caws_address;

    setloading(true);
    setStatus("*Waiting for approval");
    await window.nft
      .approveStake(stakeApr50)
      .then(() => {
        setActive(false);
        setloading(false);
        setColor("#52A8A4");
        setStatus("*Caws approved successfully");
        checkApproval();
      })
      .catch((err) => {
        window.alertify.error(err?.message);
        setloading(false);
        setColor("#F13227");
        setStatus("*An error occurred. Please try again");
        handleClearStatus();
      });
  };

  const handleApproveWod = async () => {
    const caws_land_nft = await window.config.wod_caws_address;

    setloading(true);
    setStatus("*Waiting for approval");
    await window.landnft
      .approveStake(caws_land_nft)
      .then(() => {
        setActive(false);
        setloading(false);
        setColor("#52A8A4");
        setStatus("*WoD approved successfully");
        checkApprovalLand();
      })
      .catch((err) => {
        setloading(false);
        setColor("#F13227");
        window.alertify.error(err?.message);
        setStatus("*An error occurred. Please try again");
        handleClearStatus();
      });
  };

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

  const handleSelectAllLand = () => {
    setCheckLandBtn(!checkLandbtn);
    if (checkLandbtn === false) {
      if (nftLandIds.length > 50) {
        setSelectedNftLandIds(nftLandIds.slice(0, 50));
      } else if (nftLandIds.length <= 50) {
        setSelectedNftLandIds(nftLandIds);
      }
    } else if (checkLandbtn === true) {
      setSelectedNftIds([]);
      setSelectedNftLandIds([]);
    }

    setCheckUnstakeBtn(false);
  };

  const handleSelectAllToUnstake = () => {
    let cawsIdArray = [];
    let landIdArray = [];

    if (cawsStakes && cawsStakes.length > 0) {
      for (let i = 0; i < cawsStakes.length; i++) {
        let cawsId = cawsStakes[i].name?.slice(6, cawsStakes[i].name.length);
        cawsIdArray.push(cawsId);

        let WodId = landStakes[i].name?.slice(1, landStakes[i].name.length);
        landIdArray.push(WodId);
      }

      setCheckUnstakeBtn(!checkUnstakebtn);
      if (checkUnstakebtn === false) {
        if (cawsIdArray.length > 50) {
          setSelectedNftIds(cawsIdArray.slice(0, 50));
          getApprovedNfts(cawsIdArray.slice(0, 50));
        }
        if (landStakes.length > 50) {
          setSelectedNftLandIds(landIdArray.slice(0, 50));
          getApprovedLandNfts(landStakes.slice(0, 50));
        }

        if (cawsStakes.length <= 50) {
          setSelectedNftIds(cawsIdArray);
          getApprovedNfts(cawsIdArray);
        }

        if (landStakes.length <= 50) {
          setSelectedNftLandIds(landIdArray);
          getApprovedLandNfts(landStakes);
        }
      } else if (checkUnstakebtn === true) {
        setSelectedNftIds([]);
        setSelectedNftLandIds([]);
      }
      setCheckBtn(false);
    }
  };

  const handleDeposit = async (value) => {
    // let stake_contract = await window.getContractNFT("NFTSTAKING");
    setloadingdeposit(true);
    setStatus("*Processing deposit");
    setColor("#57AEAA");
    //to do
    // console.log(getApprovedNfts(selectNftIds), getApprovedLandNfts(selectNftLandIds))
    await window.wod_caws
      .depositWodCaws(
        getApprovedNfts(selectNftIds),
        getApprovedLandNfts(selectNftLandIds)
      )
      .then(() => {
        setloadingdeposit(false);
        setshowClaim(true);
        setActive(true);
        setStatus("*Sucessfully deposited");
        setSelectedNftIds([]);
        setSelectedNftLandIds([]);
        onDepositComplete();
        setColor("#57AEAA");
        handleClearStatus();
        onShowBackScreen();
      })
      .catch((err) => {
        console.log(err);
        window.alertify.error(err?.message);
        setloadingdeposit(false);
        setColor("#F13227");
        setStatus("*An error occurred. Please try again");
        setSelectedNftIds([]);
        setSelectedNftLandIds([]);
        handleClearStatus();
        onDepositComplete();
        onShowBackScreen();
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
        setSelectedNftLandIds([]);
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
        setSelectedNftLandIds([]);
        return () => clearInterval(interval);
      }, 500);
    }
  }, [selectNftIds.length, val, checkbtn, checkUnstakebtn]);

  useEffect(() => {
    if (showToStake === true) {
      checkApproval().then();
      checkApprovalLand().then();
    } else {
      setSelectedNftIds([]);
      setSelectedNftLandIds([]);
    }
  }, [showClaim, showToStake, coinbase, screenName, nftItem.length]);

  useEffect(() => {
    if (hideItem === "staked") {
      setshowToStake(true);
      setshowStaked(false);
    }
  }, [hideItem, showStaked, showToStake]);

  const onEmptyState = () => {};

  const handleUnstake = async (value) => {
    setStatus("*Processing unstake");
    setColor("#57AEAA");
    setloadingWithdraw(true);
    await window.wod_caws
      .withdrawWodCaws(
        getApprovedNfts(selectNftIds),
        getApprovedLandNfts(selectNftLandIds)
      )
      .then(() => {
        onDepositComplete();
        setloadingWithdraw(false);
        setStatus("*Unstaked successfully");
        setColor("#57AEAA");
        handleClearStatus();
        setSelectedNftIds([]);
        setSelectedNftLandIds([]);
      })
      .catch((err) => {
        setloadingWithdraw(false);
        window.alertify.error(err?.message);
        setStatus("An error occurred, please try again");
        setColor("#F13227");
        setSelectedNftIds([]);
        setSelectedNftLandIds([]);
        handleClearStatus();
      });
  };

  const handleClaim = async (itemId) => {
    setloadingClaim(true);
    setActive(false);
    setStatus("*Claiming rewards...");
    setColor("#57AEAA");
    await window.wod_caws
      .claimRewardsWodCaws(getApprovedNfts(selectNftIds))
      .then(() => {
        setloadingClaim(false);
        setStatus("*Claimed successfully");
        handleClearStatus();
        setColor("#57AEAA");
        setSelectedNftIds([]);
        setSelectedNftLandIds([]);
      })
      .catch((err) => {
        window.alertify.error(err?.message);
        setloadingClaim(false);
        setColor("#F13227");
        setStatus("An error occurred, please try again");
        setSelectedNftIds([]);
        setSelectedNftLandIds([]);
      });
  };

  const devicewidth = window.innerWidth;

  useEffect(() => {
    if (
      getApprovedLandNfts(selectNftLandIds).length > 0 &&
      getApprovedNfts(selectNftIds).length > 0
    ) {
      if (
        getApprovedLandNfts(selectNftLandIds).length !==
        getApprovedNfts(selectNftIds).length
      ) {
        setStatus("You must select the same amount of NFTs!");
        setColor("#F13227");
      }
      if (
        getApprovedLandNfts(selectNftLandIds).length ===
        getApprovedNfts(selectNftIds).length
      ) {
        setStatus("");
      }
    }
  }, [
    getApprovedNfts(selectNftIds).length,
    getApprovedLandNfts(selectNftLandIds).length,
    selectNftLandIds.length,
    selectNftIds.length,
    checknft,
  ]);

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
      maxHeight={devicewidth < 500 ? "600" : "90%"}
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
                  // onshowToStake();
                  // setshowToStake(true);
                  // setshowStaked(false);
                  //Make selectedNfts empty []
                  // setSelectedNftIds([]);
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
                  // onshowStaked();
                  // setshowStaked(true);
                  // setshowToStake(false);
                  //Make selectedNfts empty []
                  // setSelectedNftIds([]);
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
          <div
            className="d-flex gap-4 justify-content-between align-items-baseline"
            style={{ flexWrap: "wrap" }}
          >
            {showStaked === true && (
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
            {/*   {showToStake === true && (
              <>
                <Timeline
                  sx={{
                    [`& .${timelineItemClasses.root}:before`]: {
                      flex: 0,
                      padding: 0,
                    },
                  }}
                  className="col-12 col-lg-7 order-3 order-lg-2"
                >
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot
                        className={
                          getApprovedLandNfts(selectNftLandIds).length > 0
                            ? "greendot"
                            : "passivedot"
                        }
                      />
                      <TimelineConnector
                        className={
                          getApprovedLandNfts(selectNftLandIds).length > 0
                            ? "greenline"
                            : "passiveline"
                        }
                      />
                    </TimelineSeparator>
                    <TimelineContent>
                      <h6 className="content-text">
                        Select the WoD Land NFTs for pairing, then click “Next”.
                      </h6>
                    </TimelineContent>
                  </TimelineItem>
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot
                        className={
                          getApprovedNfts(selectNftIds).length > 0
                            ? "greendot"
                            : "passivedot"
                        }
                      />
                    </TimelineSeparator>
                    <TimelineContent>
                      <h6 className="content-text">
                        Select CAWS NFTs for pairing, approve WoD Land & CAWS
                        NFTs, then click 'Deposit'
                      </h6>
                    </TimelineContent>
                  </TimelineItem>
                </Timeline> 
                 <div
                  className={
                    getApprovedLandNfts(selectNftLandIds).length > 0
                      ? "optionbtn-active order-2 order-lg-3"
                      : "optionbtn-passive order-2 order-lg-3"
                  }
                  onClick={() => {
                    screenName === "land"
                      ? onShowNextScreen()
                      : onShowBackScreen();
                  }}
                  style={{
                    display: hideItem === "tostake" ? "none" : "block",
                    pointerEvents:
                      (getApprovedLandNfts(selectNftLandIds).length === 0 ||
                        nftItem.length === 0) &&
                      screenName === "land"
                        ? "none"
                        : "auto",
                  }}
                >
                  <h5 className="optiontext" style={{ fontSize: 14 }}>
                    {screenName === "land" ? "Next" : "Back"}
                  </h5>
                </div> 
              </>
            )}*/}
          </div>
        </div>
        <div className="">
          <div className={`${ showToStake === true ? 'caw-card3' : 'caw-card6'} overflow-auto`}>
            {showToStake === true &&
            <div className="d-flex flex-column gap-2">
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
                  alignSelf: "flex-start",
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
              <div className="caw-card4">
                {cawsItems.length === 0 && showToStake === true ? (
                  [...Array(devicewidth < 500 ? 1 : 8)].map((item, id) => {
                    return (
                      <NftPlaceHolder
                        key={id}
                        width={155}
                        onMintClick={() => {
                          onClose();
                          setCheckUnstakeBtn(false);
                          setCheckBtn(false);
                        }}
                      />
                    );
                  })
                ) : cawsItems.length <= 4 && showToStake === true ? (
                  <>
                    {cawsItems.map((item, id) => {
                      let nftId = item.name?.slice(6, cawsItems.name?.length);

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
                            width={155}
                            height={'fit-content'}
                            modalId="#newNftchecklist"
                            isStake={showStaked}
                            countDownLeft={countDownLeft}
                            checked={
                              ((showToStake === true && checkbtn === true) ||
                                getApprovedNfts(selectNftIds).includes(
                                  item.name?.slice(6, cawsItems.name?.length)
                                ) ||
                                (showStaked === true &&
                                  checkUnstakebtn === true)) &&
                              getApprovedNfts(selectNftIds).length <= 50
                            }
                            checked2={
                              getApprovedNfts(selectNftIds).length <= 50
                                ? true
                                : false
                            }
                            checklistItemID={nftId}
                            onChange={(value) => {
                              selectNftIds.indexOf(value) === -1
                                ? selectNftIds.push(value)
                                : selectNftIds.splice(
                                    selectNftIds.indexOf(value),
                                    1
                                  );
                              setchecknft(!checknft);
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
                          : Math.abs(8 - parseInt(cawsItems.length))
                      ),
                    ].map((item, id) => {
                      return (
                        <NftPlaceHolder
                          key={id}
                          width={155}
                          onMintClick={() => {
                            onClose();
                            setCheckUnstakeBtn(false);
                            setCheckBtn(false);
                          }}
                        />
                      );
                    })}
                  </>
                ) : cawsItems.length > 4 && showToStake === true ? (
                  cawsItems.map((item, id) => {
                    let nftId = item.name?.slice(6, cawsItems.name?.length);
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
                          width={155}
                          height={'fit-content'}
                          modalId="#newNftchecklist"
                          isStake={showStaked}
                          countDownLeft={countDownLeft}
                          checked={
                            ((showToStake === true && checkbtn === true) ||
                              getApprovedNfts(selectNftIds).includes(
                                item.name?.slice(6, cawsItems.name?.length)
                              ) ||
                              (showStaked === true &&
                                checkUnstakebtn === true)) &&
                            getApprovedNfts(selectNftIds).length <= 50
                          }
                          checked2={
                            getApprovedNfts(selectNftIds).length <= 50
                              ? true
                              : false
                          }
                          checklistItemID={nftId}
                          onChange={(value) => {
                            selectNftIds.indexOf(value) === -1
                              ? selectNftIds.push(value)
                              : selectNftIds.splice(
                                  selectNftIds.indexOf(value),
                                  1
                                );
                            setchecknft(!checknft);
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
                ) : (
                  <></>
                )}
              </div>
            </div>}
            {showToStake === true && 
            <div className="d-flex flex-column gap-2">
              <button
                onClick={() => {
                  handleSelectAllLand();
                }}
                className="select-all-btn"
                style={{
                  display: "flex",
                  pointerEvents: nftItem.length !== 0 ? "auto" : "none",
                  opacity: nftItem.length !== 0 ? "1" : "0.4",
                  color: checkLandbtn === true ? "#4ED5D2" : "#8E97CD",
                  alignSelf: "flex-end",
                }}
              >
                <input
                  type="checkbox"
                  id="add-to-stake"
                  name="checkbtn"
                  checked={checkLandbtn}
                  onChange={() => {}}
                />
                {checkLandbtn ? "Unselect All" : "Select All"}
              </button>

              <div className="caw-card5">
                {landItems.length === 0 && showToStake === true ? (
                  [...Array(devicewidth < 500 ? 1 : 8)].map((item, id) => {
                    return (
                      <LandNFTPlaceHolder
                        key={id}
                        onMintClick={() => {
                          onClose();
                          setCheckUnstakeBtn(false);
                          setCheckBtn(false);
                        }}
                      />
                    );
                  })
                ) : landItems.length <= 4 && showToStake === true ? (
                  <>
                    {landItems.map((item, id) => {
                      let nftLandId = item.name?.slice(
                        1,
                        landItems[id].name?.length
                      );

                      if (showToStake) {
                        // selectNftIds.push(nftId);
                        nftLandIds.push(nftLandId);
                      }
                      if (showStaked) {
                        nftLandIds.push(nftLandId);

                        // selectNftIds.push(nftId)
                      }
                      return (
                        <>
                          <LandNftChecklist
                            key={id}
                            nft={item}
                            modalId="#newNftchecklist"
                            isStake={showStaked}
                            countDownLeft={countDownLeft}
                            checked={
                              ((showToStake === true &&
                                checkLandbtn === true) ||
                                getApprovedLandNfts(selectNftLandIds).includes(
                                  item.name?.slice(1, landItems.name?.length)
                                ) ||
                                (showStaked === true &&
                                  checkUnstakebtn === true)) &&
                              selectNftLandIds.length <= 50
                            }
                            checked2={
                              selectNftLandIds.length <= 50 ? true : false
                            }
                            checklistItemID={nftLandId}
                            onChange={(value) => {
                              selectNftLandIds.indexOf(value) === -1
                                ? selectNftLandIds.push(value)
                                : selectNftLandIds.splice(
                                    selectNftLandIds.indexOf(value),
                                    1
                                  );
                              setchecknft(!checknft);

                              setSelectedNftLandIds(selectNftLandIds);
                              getApprovedLandNfts(selectNftLandIds);
                              console.log(selectNftLandIds);
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
                          : Math.abs(8 - parseInt(landItems.length))
                      ),
                    ].map((item, id) => {
                      return (
                        <LandNFTPlaceHolder
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
                ) : landItems.length > 4 && showToStake === true ? (
                  landItems.map((item, id) => {
                    let nftLandId = item.name?.slice(1, landItems.name?.length);
                    if (showToStake) {
                      // selectNftIds.push(nftId);
                      nftLandIds.push(nftLandId);
                    }
                    if (showStaked) {
                      nftLandIds.push(nftLandId);

                      // selectNftIds.push(nftId)
                    }
                    return (
                      <>
                        <LandNftChecklist
                          key={id}
                          nft={item}
                          modalId="#newNftchecklist"
                          isStake={showStaked}
                          countDownLeft={countDownLeft}
                          checked={
                            ((showToStake === true && checkLandbtn === true) ||
                              getApprovedLandNfts(selectNftLandIds).includes(
                                item.name?.slice(1, landItems.name?.length)
                              ) ||
                              (showStaked === true &&
                                checkUnstakebtn === true)) &&
                            selectNftLandIds.length <= 50
                          }
                          checked2={
                            selectNftLandIds.length <= 50 ? true : false
                          }
                          checklistItemID={nftLandId}
                          onChange={(value) => {
                            selectNftLandIds.indexOf(value) === -1
                              ? selectNftLandIds.push(value)
                              : selectNftLandIds.splice(
                                  selectNftLandIds.indexOf(value),
                                  1
                                );
                            setchecknft(!checknft);

                            setSelectedNftLandIds(selectNftLandIds);
                            getApprovedLandNfts(selectNftLandIds);
                            console.log(selectNftLandIds);
                            setVal(value);
                          }}
                          coinbase={coinbase}
                          isConnected={isConnected}
                        />
                      </>
                    );
                  })
                ) : (
                  <></>
                )}
              </div>
            </div>}

            {cawsStakes.length === 0 && showStaked === true ? (
              [...Array(devicewidth < 500 ? 1 : 8)].map((item, id) => {
                return (
                  <CawsWodNftPlaceHolder
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
            ) : cawsStakes.length <= 4 && showStaked === true ? (
              <>
                {cawsStakes.map((item, id) => {
                  let cawsId = item.name?.slice(6, item.name.length);
                  let WodId = landStakes[id]?.name?.slice(
                    1,
                    landStakes[id]?.name?.length
                  );

                  if (showStaked) {
                    nftLandIds.push(cawsId);
                  }
                  return (
                    <>
                      <CawsWodNftChecklist
                        key={id}
                        nft={item}
                        landNft={landStakes[id]}
                        modalId="#newNftchecklist"
                        isStake={true}
                        countDownLeft={countDownLeft}
                        checked={
                          showStaked === true &&
                          checkUnstakebtn === true &&
                          selectNftIds.length <= 50
                        }
                        checked2={selectNftIds.length <= 50 ? true : false}
                        checklistItemID={cawsId}
                        landlistItemID={WodId}
                        onChange={(value) => {
                          selectNftIds.indexOf(value) === -1
                            ? selectNftIds.push(value)
                            : selectNftIds.splice(
                                selectNftIds.indexOf(value),
                                1
                              );
                          setchecknft(!checknft);

                          setSelectedNftIds(selectNftIds);
                          getApprovedNfts(selectNftIds);
                          console.log(selectNftIds);
                          setVal(value);
                        }}
                        onChangeLand={(value) => {
                          selectNftLandIds.indexOf(value) === -1
                            ? selectNftLandIds.push(value)
                            : selectNftLandIds.splice(
                                selectNftLandIds.indexOf(value),
                                1
                              );

                          setSelectedNftLandIds(selectNftLandIds);
                          getApprovedLandNfts(selectNftLandIds);
                          console.log(selectNftLandIds);
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
                      : Math.abs(8 - parseInt(cawsStakes.length))
                  ),
                ].map((item, id) => {
                  return (
                    <CawsWodNftPlaceHolder
                      key={id}
                    width={195}
                      onMintClick={() => {
                        onClose();
                        setCheckUnstakeBtn(false);
                        setCheckBtn(false);
                      }}
                    />
                  );
                })}
              </>
            ) : cawsStakes.length > 4 && showStaked === true ? (
              cawsStakes.map((item, id) => {
                let cawsId = item.name?.slice(6, item.name.length);

                let WodId = landStakes[id]?.name?.slice(
                  1,
                  landStakes[id]?.name.length
                );

                if (showStaked) {
                  nftLandIds.push(cawsId);
                }
                return (
                  <>
                    <CawsWodNftChecklist
                      key={id}
                      nft={item}
                      landNft={landStakes[id]}
                      modalId="#newNftchecklist"
                      isStake={true}
                      countDownLeft={countDownLeft}
                      checked={
                        showStaked === true &&
                        checkUnstakebtn === true &&
                        selectNftIds.length <= 50
                      }
                      checked2={selectNftIds.length <= 50 ? true : false}
                      checklistItemID={cawsId}
                      landlistItemID={WodId}
                      onChange={(value) => {
                        selectNftIds.indexOf(value) === -1
                          ? selectNftIds.push(value)
                          : selectNftIds.splice(selectNftIds.indexOf(value), 1);

                        setSelectedNftIds(selectNftIds);
                        getApprovedNfts(selectNftIds);
                        console.log(selectNftIds);
                        setVal(value);
                      }}
                      onChangeLand={(value) => {
                        selectNftLandIds.indexOf(value) === -1
                          ? selectNftLandIds.push(value)
                          : selectNftLandIds.splice(
                              selectNftLandIds.indexOf(value),
                              1
                            );

                        setSelectedNftLandIds(selectNftLandIds);
                        getApprovedLandNfts(selectNftLandIds);
                        console.log(selectNftLandIds);
                        setVal(value);
                      }}
                      coinbase={coinbase}
                      isConnected={isConnected}
                    />
                  </>
                );
              })
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>{" "}
      <div style={{ display: "block" }} className="bottom-static-wrapper">
        <p className="d-flex info-text align-items-start gap-3">
          <img src={require("./more-info.svg").default} alt="" />
          {!showStaked
            ? "Please choose the NFTs that you wish to stake. Once you have made your selection, you will be required to approve the process before depositing the NFTs.            "
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
                  Stake your NFT to earn ETH rewards (no lock time)
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
                  {getApprovedLandNfts(selectNftLandIds).length}
                </span>
                <span
                  id="ethPrice"
                  className="mb-0"
                  style={{
                    display: "flex",
                    color: "#4CD0CD",
                    fontWeight: 600,
                    alignItems: "center",
                  }}
                >
                  WoD &
                </span>
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
                  {getApprovedNfts(selectNftIds).length}
                </span>
                <span
                  id="ethPrice"
                  className="mb-0"
                  style={{
                    display: "flex",
                    color: "#4CD0CD",
                    fontWeight: 600,
                    alignItems: "center",
                  }}
                >
                  CAWS /50
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
                <img
                  src={require("./landplaceholder.svg").default}
                  alt=""
                  style={{ width: 24, height: 24 }}
                />
              </div>
            </div>

            <div
              className="mt-4 row mx-0 justify-content-xxl-between justify-content-lg-between justify-content-md-between justify-content-sm-between justify-content-center gap-3"
              style={{
                gap: 20,
                display:
                  showStaked === false &&
                  getApprovedLandNfts(selectNftLandIds).length > 0 &&
                  getApprovedNfts(selectNftIds).length > 0
                    ? ""
                    : "none",
              }}
            >
              {showCawsApprove === true && showLandApprove === true && (
                <button
                  className="btn activebtn"
                  onClick={() => {
                    handleApproveWod();
                  }}
                  style={{
                    background:
                      "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border " role="status"></div>
                    </>
                  ) : (
                    "Approve WoD"
                  )}
                </button>
              )}
              {showCawsApprove === true && showLandApprove === false && (
                <button
                  className="btn activebtn"
                  onClick={() => {
                    handleApprove();
                  }}
                  style={{
                    background:
                      "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border " role="status"></div>
                    </>
                  ) : (
                    "Approve CAWS"
                  )}
                </button>
              )}
              <button
                className={`btn m-auto ${
                  showCawsApprove === false &&
                  showLandApprove === false &&
                  getApprovedNfts(selectNftIds).length > 0 &&
                  getApprovedLandNfts(selectNftLandIds).length > 0 &&
                  getApprovedNfts(selectNftIds).length ===
                    getApprovedLandNfts(selectNftLandIds).length &&
                  getApprovedNfts(selectNftIds).length < 51 &&
                  getApprovedLandNfts(selectNftLandIds).length < 51
                    ? "purplebtn"
                    : "passivebtn"
                }`}
                style={{
                  pointerEvents:
                    showCawsApprove === false &&
                    showLandApprove === false &&
                    getApprovedNfts(selectNftIds).length ===
                      getApprovedLandNfts(selectNftLandIds).length
                      ? "auto"
                      : "none",
                }}
                onClick={() =>
                  (checkbtn === true &&
                    (getApprovedNfts(selectNftIds).length === 0 ||
                      getApprovedLandNfts(selectNftLandIds).length === 0)) ||
                  (checkbtn === false &&
                    (getApprovedNfts(selectNftIds).length === 0 ||
                      getApprovedLandNfts(selectNftLandIds).length === 0)) ||
                  getApprovedNfts(selectNftIds).length > 50
                    ? onEmptyState()
                    : handleDeposit()
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
                    width: devicewidth < 500 ? "100%" : "50%",
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
                      </div>
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
                            display: "flex",
                            color: "#4CD0CD",
                            fontWeight: 700,
                            alignItems: "center",
                          }}
                        >
                          {selectNftLandIds.length}
                        </span>
                        <span
                          id="ethPrice"
                          className="mb-0"
                          style={{
                            display: "flex",
                            color: "#4CD0CD",
                            fontWeight: 600,
                            alignItems: "center",
                          }}
                        >
                          WoD &
                        </span>
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
                          {getApprovedNfts(selectNftIds).length}
                        </span>
                        <span
                          id="ethPrice"
                          className="mb-0"
                          style={{
                            display: "flex",
                            color: "#4CD0CD",
                            fontWeight: 600,
                            alignItems: "center",
                          }}
                        >
                          CAWS /50
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
                        <img
                          src={require("./landplaceholder.svg").default}
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
                    getApprovedNfts(selectNftIds).length === nftItem.length &&
                    getApprovedNfts(selectNftIds).length < 51
                      ? handleUnstake()
                      : (checkUnstakebtn === true &&
                          getApprovedNfts(selectNftIds).length === 0) ||
                        getApprovedNfts(selectNftIds).length > 50
                      ? onEmptyState()
                      : getApprovedNfts(selectNftIds).length !== 0 &&
                        getApprovedNfts(selectNftIds).length < nftItem.length
                      ? handleUnstake()
                      : handleUnstake();
                  }}
                  style={{
                    background:
                      getApprovedNfts(selectNftIds).length !== 0 &&
                      countDownLeft < 0 &&
                      getApprovedNfts(selectNftIds).length < 51
                        ? "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)"
                        : nftItem.length !== 0 &&
                          getApprovedNfts(selectNftIds).length !== 0 &&
                          getApprovedNfts(selectNftIds).length < 51 &&
                          countDownLeft < 0
                        ? "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)"
                        : "#14142A",
                    pointerEvents:
                      getApprovedNfts(selectNftIds).length !== 0
                        ? "auto"
                        : nftItem.length !== 0 &&
                          checkUnstakebtn === true &&
                          getApprovedNfts(selectNftIds).length === 0
                        ? "auto"
                        : "none",
                    width: devicewidth < 500 ? "100%" : "50%",
                    borderRadius: "8px",
                    color: ETHrewards != 0 ? "#FFFFFF" : "#C0C9FF",
                    margin: "auto",
                  }}
                >
                  {loadingWithdraw ? (
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
            <p className="mt-1" style={{ color: color, textAlign: "center" }}>
              {showCawsApprove === false ? "" : status}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
NftCawsWodChecklistModal.propTypes = {
  nftItem: PropTypes.array,
  landItems: PropTypes.array,
  landStakes: PropTypes.array,
  cawsStakes: PropTypes.array,
  cawsItems: PropTypes.array,
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
  onShowNextScreen: PropTypes.func,
  getApprovedLandNfts: PropTypes.func,
  onShowBackScreen: PropTypes.func,
  screenName: PropTypes.string,
};

export default NftCawsWodChecklistModal;
