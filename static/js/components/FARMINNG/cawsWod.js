import React, { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import moment from "moment";
import getFormattedNumber from "../../functions/get-formatted-number";
import { formattedNum } from "../../functions/formatUSD";

import Address from "./address";
import WalletModal from "../WalletModal";
import "./top-pools.css";
import ellipse from "./assets/ellipse.svg";
import arrowup from "./assets/arrow-up.svg";
import moreinfo from "./assets/more-info.svg";
import wallet from "./assets/wallet.svg";
import Tooltip from "@material-ui/core/Tooltip";

import { shortAddress } from "../../functions/shortAddress";
import xMark from "../calculator/assets/xMark.svg";
import weth from "./assets/weth.svg";
import { handleSwitchNetworkhook } from "../../functions/hooks";
import useWindowSize from "../../functions/useWindowSize";
import NftCawsWodChecklistModal from "../caws/NftMinting/components/NftMinting/NftStakeChecklistModal/NftCawsWodChecklistModal";
import OutsideClickHandler from "react-outside-click-handler";

const CawsWodDetails = ({
  coinbase,
  isConnected,
  listType,
  handleSwitchNetwork,
  chainId,
  handleConnection,
  renderedPage,
}) => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [myLandNFTs, setMyLandNFTs] = useState([]);

  const [amountToStake, setamountToStake] = useState("");
  const [mystakes, setMystakes] = useState([]);
  const [myLandstakes, setMyLandstakes] = useState([]);
  const [active, setActive] = useState(true);

  const [color, setColor] = useState("#F13227");
  const [status, setStatus] = useState("");
  const [showApprove, setshowApprove] = useState(true);
  const [showChecklistModal, setshowChecklistModal] = useState(false);
  const [EthRewards, setEthRewards] = useState(0);
  const [showStaked, setshowStaked] = useState(true);
  const [showToStake, setshowToStake] = useState(false);
  const [ethToUSD, setethToUSD] = useState(0);
  const [openStakeChecklist, setOpenStakeChecklist] = useState(false);
  const [showUnstakeModal, setShowUnstakeModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countDownLeft, setCountDownLeft] = useState(59000);

  const [approvedNfts, setApprovedNfts] = useState([]);
  const [approvedLandNfts, setApprovedLandNfts] = useState([]);

  const [loadingdeposit, setloadingdeposit] = useState(false);
  const [newStakes, setnewStakes] = useState(0);
  const [loading, setloading] = useState(false);
  const [showClaim, setshowClaim] = useState(false);
  const [hide, setHide] = useState("");
  const [screenName, setScreenName] = useState("land");
  const [cawspopup, setCawspopup] = useState(false);
  const [landpopup, setLandpopup] = useState(false);

  const windowSize = useWindowSize();

  const checkApproval = async () => {
    const address = coinbase;
    const stakeApr50 = await window.config.nftstaking_address50;

    if (address !== null) {
      const result = await window.nft
        .checkapproveStake(address, stakeApr50)
        .then((data) => {
          return data;
        });

      if (result === true) {
        setshowApprove(false);
        setStatus("");
        setColor("#939393");
      } else if (result === false) {
        setStatus(" *Please approve before deposit");
        setshowApprove(true);
      }
    }
  };

  const myNft = async () => {
    let myNft = await window.myNftListContract(coinbase);
    if (myNft && myNft.length > 0) {
      let nfts = myNft.map((nft) => window.getNft(nft));

      nfts = await Promise.all(nfts);

      nfts.reverse();

      setMyNFTs(nfts);
    } else setMyNFTs([]);
  };

  const getStakesIds = async () => {
    const address = coinbase;
    let stakenft = [];
    const allCawsStakes = await window.wod_caws
      .depositsOf(address)
      .then((result) => {
        if (result.length > 0) {
          for (let i = 0; i < result.length; i++)
            stakenft.push(parseInt(result[i]));
          return stakenft;
        }
      });

    return allCawsStakes;
  };

  const myStakes = async () => {
    let myStakes = await getStakesIds();
    if (myStakes && myStakes.length > 0) {
      let stakes = myStakes.map((stake) => window.getNft(stake));

      stakes = await Promise.all(stakes);
      stakes.reverse();
      setMystakes(stakes);
    } else setMystakes([]);
  };

  const myLandNft = async () => {
    let myNft = await window.myNftLandListContract(coinbase);

    if (myNft && myNft.length > 0) {
      let nfts = myNft.map((nft) => window.getLandNft(nft));
      nfts = await Promise.all(nfts);

      nfts.reverse();

      setMyLandNFTs(nfts);
    } else setMyLandNFTs([]);
  };

  const getLandStakesIds = async () => {
    const address = coinbase;
    let stakenft = [];
    const allLandStakes = await window.wod_caws
      .depositsOfWod(address)
      .then((result) => {
        if (result.length > 0) {
          for (let i = 0; i < result.length; i++)
            stakenft.push(parseInt(result[i]));
          return stakenft;
        }
      });

    return allLandStakes;
  };

  const myLandStakes = async () => {
    let myStakes = await getLandStakesIds();
    if (myStakes && myStakes.length > 0) {
      let stakes = myStakes.map((stake) => window.getLandNft(stake));
      stakes = await Promise.all(stakes);
      stakes.reverse();
      setMyLandstakes(stakes);
    } else setMyLandstakes([]);
  };

  const setUSDPrice = async () => {
    const ethprice = await convertEthToUsd();
    setethToUSD(Number(ethprice) * Number(EthRewards));
  };

  const calculateAllRewards = async () => {
    let myStakes = await getStakesIds();
    let result = 0;

    if (coinbase !== null) {
      if (myStakes.length > 0) {
        let rewards = await window.wod_caws
          .calculateRewardsWodCaws(coinbase, myStakes)
          .then((data) => {
            return data;
          })
          .catch((err) => {
            console.log(err);
          });
        let finalReward = 0;
        for (let i = 0; i < rewards.length; i++) {
          finalReward = rewards[i] / 1e18;
          result = result + Number(finalReward);
        }
      }
    }
    setEthRewards(result);
  };

  const claimRewards = async () => {
    let myStakes = await getStakesIds();
    // setclaimAllStatus("Claiming all rewards, please wait...");
    await window.wod_caws
      .claimRewardsWodCaws(myStakes)
      .then(() => {
        setEthRewards(0);
      })
      .catch((err) => {});
  };

  const convertEthToUsd = async () => {
    const res = axios
      .get("https://api.coinbase.com/v2/prices/ETH-USD/spot")
      .then((data) => {
        return data.data.data.amount;
      });
    return res;
  };

  const refreshStakes = () => {
    setnewStakes(newStakes + 1);
  };

  const calculateCountdown = async () => {
    const address = coinbase;
    let finalDay = await window.wod_caws
      .checkStakingTimeWodCaws(address)
      .then((data) => {
        return data;
      });

    let lockup_time = await window.wod_caws
      .checkLockupTimeWodCaws()
      .then((data) => {
        return data;
      });

    finalDay = parseInt(finalDay) + parseInt(lockup_time);
    setCountDownLeft(parseInt(finalDay * 1000) - Date.now());
  };

  const handleUnstakeAll = async () => {
    // setunstakeAllStatus("Unstaking all please wait...");
    await window.wod_caws
      .withdrawWodCaws()
      .then(() => {
        refreshStakes();
        // setunstakeAllStatus("Successfully unstaked all!");
      })
      .catch((err) => {
        window.alertify.error(err?.message);
        // setunstakeAllStatus("An error occurred, please try again");
        setShowUnstakeModal(false);
      });
  };

  const handleEthPool = async () => {
    await handleSwitchNetworkhook("0x1")
      .then(() => {
        handleSwitchNetwork("1");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    if (coinbase) {
      getStakesIds();
      getLandStakesIds();
      myNft();
      myStakes();
      myLandNft();
      myLandStakes();
      checkApproval();
      calculateAllRewards();
      calculateCountdown();
    }
  }, [isConnected, coinbase, screenName, newStakes]);

  const getApprovedNfts = (data) => {
    setApprovedNfts(data);
    return data;
  };

  const getApprovedLandNfts = (data) => {
    setApprovedLandNfts(data);
    return data;
  };

  const showCawsPopup = () => {
    setCawspopup(true);
  };

  const showLandPopup = () => {
    setLandpopup(true);
  };

  useEffect(() => {
    if (isConnected) {
      setUSDPrice();
    }
  }, [isConnected, EthRewards]);

  return (
    <div className="container-lg p-0">
      <div
        className={`allwrappercaws ${windowSize.width > 786 && "my-4"}`}
        style={{
          border: listType !== "table" && "none",
          borderRadius: listType !== "table" && "0px",
        }}
      >
        <div className="leftside2 w-100">
          <div className="activewrapper position-relative flex-row-reverse flex-lg-row align-items-end align-items-lg-center">
            <div className="d-flex flex-column flex-lg-row align-items-end align-items-lg-center justify-content-between gap-3 gap-lg-5">
              <h6 className="activetxt caws-active-txt">
                <img
                  src={ellipse}
                  alt=""
                  className="position-relative"
                  style={{ top: "-1px" }}
                />
                Active Pool
              </h6>
              {/* <div className="d-flex align-items-center justify-content-between gap-2">
                    <h6 className="earnrewards-text">Earn rewards in:</h6>
                    <h6 className="earnrewards-token d-flex align-items-center gap-1">
                      DYP
                    </h6>
                  </div> */}

              <div className="d-flex align-items-center justify-content-between gap-2">
                <h6 className="earnrewards-text">APR:</h6>
                <h6 className="earnrewards-token d-flex align-items-center gap-1">
                  50%
                  <Tooltip
                    placement="top"
                    title={
                      <div className="tooltip-text">
                        {
                          "APR reflects the interest rate of earnings on an account over the course of one year. "
                        }
                      </div>
                    }
                  >
                    <img src={moreinfo} alt="" />
                  </Tooltip>
                </h6>
              </div>
              <div className="d-flex align-items-center justify-content-between gap-2">
                <h6 className="earnrewards-text">Lock time:</h6>
                <h6 className="earnrewards-token d-flex align-items-center gap-1">
                  No Lock
                  <Tooltip
                    placement="top"
                    title={
                      <div className="tooltip-text">
                        {
                          "The amount of time your deposited assets will be locked."
                        }
                      </div>
                    }
                  >
                    <img src={moreinfo} alt="" />
                  </Tooltip>
                </h6>
              </div>
              {/* <div className="d-flex align-items-center justify-content-between gap-2">
                <h6 className="earnrewards-text">Total NFTs staked</h6>
                <h6 className="earnrewards-token d-flex align-items-center gap-1">
                  {totalStakes}/10000
                </h6>
              </div> */}
            </div>
            <div className="d-flex align-items-center justify-content-between gap-3 position-relative">
              <div
                className="d-flex align-items-center justify-content-between gap-3 cursor-pointer"
                onClick={showCawsPopup}
              >
                <h6 className="bottomitems">Get CAWS</h6>
              </div>
              {cawspopup === true && (
                <div className="position-absolute">
                  <OutsideClickHandler
                    onOutsideClick={() => {
                      setCawspopup(false);
                    }}
                  >
                    <div
                      className="tooltip d-flex justify-content-center"
                      style={{ opacity: 1, width: 100 }}
                    >
                      <div className="d-flex flex-column gap-2 align-items-center">
                        <a
                          href="https://nft.coinbase.com/collection/catsandwatches"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setCawspopup(false);
                          }}
                        >
                          <h6 className="bottomitems">
                            <img src={arrowup} alt="" />
                            Coinbase
                          </h6>
                        </a>

                        <a
                          href="https://opensea.io/collection/catsandwatchessocietycaws"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setCawspopup(false);
                          }}
                        >
                          <h6 className="bottomitems">
                            <img src={arrowup} alt="" />
                            OpenSea
                          </h6>
                        </a>
                      </div>
                    </div>
                  </OutsideClickHandler>
                </div>
              )}
              <div
                className="d-flex align-items-center justify-content-between gap-3 cursor pointer"
                onClick={showLandPopup}
              >
                <h6 className="bottomitems">Get WOD</h6>
              </div>
              {landpopup === true && (
                <div className="position-absolute">
                  <OutsideClickHandler
                    onOutsideClick={() => {
                      setLandpopup(false);
                    }}
                  >
                    <div
                      className="tooltip d-flex justify-content-center"
                      style={{ opacity: 1, width: 100, left: 90 }}
                    >
                      <div className="d-flex flex-column gap-2 align-items-center">
                        <a
                          href="https://nft.coinbase.com/collection/worldofdypians"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setLandpopup(false);
                          }}
                        >
                          <h6 className="bottomitems">
                            <img src={arrowup} alt="" />
                            Coinbase
                          </h6>
                        </a>

                        <a
                          href="https://opensea.io/collection/worldofdypians"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setLandpopup(false);
                          }}
                        >
                          <h6 className="bottomitems">
                            <img src={arrowup} alt="" />
                            OpenSea
                          </h6>
                        </a>
                      </div>
                    </div>
                  </OutsideClickHandler>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="pools-details-wrapper d-flex m-0 container-lg border-0 ">
          <div className="row w-100 justify-content-between gap-4 gap-lg-0">
            <div className="firstblockwrapper col-12 col-md-6 col-lg-2">
              <div
                className="d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between  gap-4"
                style={{ height: "100%" }}
              >
                <h6 className="start-title">Start Staking</h6>

                {coinbase === null ||
                coinbase === undefined ||
                isConnected === false ? (
                  <button
                    className="connectbtn btn"
                    onClick={() => {
                      setShowModal(true);
                    }}
                  >
                    <img src={wallet} alt="" /> Connect wallet
                  </button>
                ) : chainId === "1" ? (
                  <div className="addressbtn btn">
                    <Address a={coinbase} chainId={1} />
                  </div>
                ) : (
                  <button
                    className="connectbtn btn"
                    onClick={() => {
                      handleEthPool();
                    }}
                  >
                    Change Network
                  </button>
                )}
              </div>
            </div>
            <div
              className={`otherside-border col-12 col-md-6 col-lg-4 ${
                chainId !== "1" && "blurrypool"
              }`}
            >
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-3">
                  <h6 className="deposit-txt">Stake</h6>

                  <h6 className="mybalance-text">
                    Avaliable NFTs:{" "}
                    <b>
                      {isConnected === false ? 0 : myNFTs.length} CAWS &{" "}
                      {isConnected === false ? 0 : myLandNFTs.length} WOD
                    </b>
                  </h6>
                </div>
                <Tooltip
                  placement="top"
                  title={
                    <div className="tooltip-text">
                      {"Deposit your CAWS NFTs to the staking smart contract."}
                    </div>
                  }
                >
                  <img src={moreinfo} alt="" />
                </Tooltip>
              </div>
              <div className="d-flex flex-column gap-2 justify-content-between">
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <button
                    className="btn filledbtn"
                    onClick={() => {
                      setshowChecklistModal(true);
                      setOpenStakeChecklist(true);
                      setApprovedNfts([]);
                      setHide("staked");
                    }}
                  >
                    Select NFTs
                  </button>
                  <div className="available-nfts">
                    Selected NFTs:{" "}
                    <b>{isConnected === false ? 0 : approvedNfts.length}</b>
                  </div>
                </div>
                {/* {this.state.errorMsg && (
                  <h6 className="errormsg">{this.state.errorMsg}</h6>
                )} */}
              </div>
            </div>
            <div
              className={`otherside-border col-12 col-md-6
                col-lg-4  ${chainId !== "1" && "blurrypool"}`}
            >
              <div className="d-flex justify-content-between gap-2 flex-column flex-lg-row">
                <h6 className="withdraw-txt d-flex gap-2 align-items-center">
                  REWARDS
                  <h6
                    className="mybalance-text"
                    style={{ textTransform: "capitalize" }}
                  >
                    Staked:{""}
                    <b>
                      {isConnected === false ? 0 : mystakes.length} CAWS &{" "}
                      {isConnected === false ? 0 : myLandstakes.length} WOD
                    </b>
                  </h6>
                </h6>
                <h6 className="withdraw-littletxt d-flex align-items-center gap-2">
                  <Tooltip
                    placement="top"
                    title={
                      <div className="tooltip-text">
                        {
                          "Rewards earned by your CAWS NFTs deposit to the staking smart contract are displayed in real-time."
                        }
                      </div>
                    }
                  >
                    <img src={moreinfo} alt="" />
                  </Tooltip>
                </h6>
              </div>
              <div className="d-flex flex-column gap-2 justify-content-between">
                <div className="d-flex align-items-center justify-content-between gap-2"></div>
                <div className="form-row d-flex gap-2 align-items-end justify-content-between">
                  <h6 className="rewardstxtCaws d-flex align-items-center gap-2">
                    <img src={weth} alt="" />{" "}
                    {getFormattedNumber(EthRewards, 6)} WETH ($
                    {getFormattedNumber(ethToUSD, 6)})
                  </h6>
                  <button
                    className={`btn ${
                      EthRewards === 0 ? "disabled-btn" : "filledbtn"
                    } d-flex justify-content-center align-items-center`}
                    style={{ height: "fit-content" }}
                    onClick={claimRewards}
                    disabled={EthRewards === 0 ? true : false}
                  >
                    <>Claim</>
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`otherside-border col-12 col-md-6 col-lg-2 ${
                chainId !== "1" && "blurrypool"
              }`}
            >
              <h6 className="deposit-txt d-flex align-items-center gap-2 justify-content-between">
                Unstake
                <Tooltip
                  placement="top"
                  title={
                    <div className="tooltip-text">
                      {
                        "Withdraw your deposited NFTs from the staking smart contract."
                      }
                    </div>
                  }
                >
                  <img src={moreinfo} alt="" />
                </Tooltip>
              </h6>

              <button
                className="btn outline-btn"
                onClick={() => {
                  setshowChecklistModal(true);
                  setOpenStakeChecklist(true);
                  setHide("tostake");
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
      {showChecklistModal === true && (
        <NftCawsWodChecklistModal
          onClose={() => {
            setshowChecklistModal(false);
            setamountToStake("");
          }}
          getApprovedNfts={getApprovedNfts}
          getApprovedLandNfts={getApprovedLandNfts}
          // nftItem={showStaked ? mystakes : showToStake ? myNFTs : showStaked}
          nftItem={
            hide === "" || hide === "tostake" || hide === "mystakes2"
              ? screenName === "caws"
                ? mystakes
                : myLandstakes
              : screenName === "caws"
              ? myNFTs
              : myLandNFTs
          }
          landItems={myLandNFTs}
          cawsItems={myNFTs}
          cawsStakes={mystakes}
          landStakes={myLandstakes}
          onShowNextScreen={() => {
            setScreenName("caws");
          }}
          onShowBackScreen={() => {
            setScreenName("land");
          }}
          onshowStaked={() => {
            setshowStaked(true);
            setshowToStake(false);
            setHide("mystakes2");
          }}
          screenName={screenName}
          onshowToStake={() => {
            setshowStaked(false);
            setshowToStake(true);
            setHide("tostake2");
          }}
          onClaimAll={() => {
            claimRewards();
          }}
          onUnstake={() => handleUnstakeAll()}
          isConnected={isConnected}
          coinbase={coinbase}
          ETHrewards={EthRewards}
          countDownLeft={countDownLeft}
          open={openStakeChecklist ? true : false}
          hideItem={hide}
          onDepositComplete={() => refreshStakes()}
        />
      )}

      {showModal === true && (
        <WalletModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
          }}
          handleConnection={() => {
            handleConnection();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CawsWodDetails;
