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
import OutsideClickHandler from "react-outside-click-handler";

import { shortAddress } from "../../functions/shortAddress";
import xMark from "../calculator/assets/xMark.svg";
import weth from "./assets/weth.svg";
import LandNftStakeCheckListModal from '../LandNFTModal/LandNFTModal'
import { handleSwitchNetworkhook } from "../../functions/hooks";
import useWindowSize from "../../functions/useWindowSize";

const LandDetails = ({
  coinbase,
  isConnected,
  listType,
  handleSwitchNetwork,
  chainId,
  handleConnection,
  renderedPage,
  apr,
  totalNftsLocked
}) => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [amountToStake, setamountToStake] = useState("");
  const [mystakes, setMystakes] = useState([]);
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
  const [totalStakes, settotalStakes] = useState(0);
  const [approvedNfts, setApprovedNfts] = useState([]);
  const [landpopup, setLandpopup] = useState(false);

  const [hide, setHide] = useState("");
  const windowSize = useWindowSize();


  const checkApproval = async () => {
    const address = coinbase;
    const stake25 = await window.config.landnftstake_address;
    if (address) {
     
        const result = await window.landnft
          .checkapproveStake(address, stake25)
          .then((data) => {
            return data;
          });

        if (result === true) {
          setshowApprove(false);
          setStatus("");
          setColor("#939393");
        }  else if (result === false) {
          setStatus(" *Please approve before deposit");
          setshowApprove(true);
        }
      
    }
  };


  const myNft = async () => {
    let myNft = await window.myNftLandListContract(coinbase);
    let nfts = myNft.map((nft) => window.getLandNft(nft));
    nfts = await Promise.all(nfts);

    nfts.reverse();
    setMyNFTs(nfts);
  };


  const getStakesIds = async () => {
    const address = coinbase;
    let staking_contract = await window.getContractLandNFT("LANDNFTSTAKING");
    let stakenft = [];
    let myStakes = await staking_contract.methods
      .depositsOf(address)
      .call()
      .then((result) => {
        for (let i = 0; i < result.length; i++)
          stakenft.push(parseInt(result[i]));
        return stakenft;
      });

    return myStakes;
  };

  const myStakes = async () => {
    let myStakes = await getStakesIds();
    let stakes = myStakes.map((stake) => window.getLandNft(stake));
    stakes = await Promise.all(stakes);
    stakes.reverse();
    setMystakes(stakes);
  };


  const handleClaimAll = async () => {
    const address = coinbase;

    let myStakes = await getStakesIds();
    let calculateRewards = [];
    let result = 0;
    let staking_contract = await window.getContractLandNFT("LANDNFTSTAKING");
    if (myStakes.length > 0) {
      calculateRewards = await staking_contract.methods
        .calculateRewards(address, myStakes)
        .call()
        .then((data) => {
          return data;
        });
    }
    let a = 0;

    for (let i = 0; i < calculateRewards.length; i++) {
      a = await window.infuraWeb3.utils.fromWei(calculateRewards[i], "ether");

      result = result + Number(a);
    }

    setEthRewards(result);
  };
  const claimRewards = async () => {
    let myStakes = await getStakesIds();
    let staking_contract = await window.getContractLandNFT("LANDNFTSTAKING");

    // setclaimAllStatus("Claiming all rewards, please wait...");
    await staking_contract.methods
      .claimRewards(myStakes)
      .send()
      .then(() => {
        setEthRewards(0);
        // setclaimAllStatus("Claimed All Rewards!");
      })
      .catch((err) => {
        // window.alertify.error(err?.message);
        // setclaimAllStatus("An error occurred, please try again");
      });
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
    setethToUSD(Number(ethprice) * Number(EthRewards));
  };

 

  const handleUnstakeAll = async () => {
    let myStakes = await getStakesIds();
    let stake_contract = await window.getContractLandNFT("LANDNFTSTAKING");
    // setunstakeAllStatus("Unstaking all please wait...");

    await stake_contract.methods
      .withdraw(myStakes)
      .send()
      .then(() => {
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

  const getApprovedNfts = (data) => {
    setApprovedNfts(data);
    return data;
  };



  const totalStakedNft = async () => {
    let staking_contract = await new window.infuraWeb3.eth.Contract(
      window.LANDMINTING_ABI,
      window.config.landnft_address,
      { from: undefined }
    );

    await staking_contract.methods
      .balanceOf(window.config.landnftstake_address)
      .call()
      .then((data) => {
        settotalStakes(data);
      });
  };

  const showLandPopup = () => {
    setLandpopup(true);
  };

  useEffect(() => {
    totalStakedNft().then();
  }, []);

  useEffect(() => {
    if (isConnected) {
      myNft().then();
      myStakes().then();
      checkApproval().then();
      handleClaimAll();
    }
  }, [isConnected]);


  useEffect(() => {
    if (isConnected) {
      setUSDPrice().then();
    }
  }, [isConnected,EthRewards]);

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
                  {apr}%
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
              <div className="d-flex align-items-center justify-content-between gap-2">
                <h6 className="earnrewards-text">Total NFTs staked</h6>
                <h6 className="earnrewards-token d-flex align-items-center gap-1">
                  {totalNftsLocked}/1000
                </h6>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between gap-3 position-relative">
            
              <div
                className="d-flex align-items-center justify-content-between gap-3 cursor pointer"
                onClick={showLandPopup}
              >
                <h6 className="bottomitems"> Get Land NFT</h6>
              </div>
              {landpopup === true && (
                <div className='position-absolute'>
                <OutsideClickHandler
                  onOutsideClick={() => {
                    setLandpopup(false);
                  }}
                >
                  <div
                    className="tooltip d-flex justify-content-center"
                    style={{ opacity: 1, width: 100 }}
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
              className={`otherside-border col-12 col-md-6 ${
                renderedPage === "dashboard" ? "col-lg-3" : "col-lg-4"
              } ${chainId !== "1" && "blurrypool"}`}
            >
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-3">
                  <h6 className="deposit-txt">Stake</h6>

                  <h6 className="mybalance-text">
                    Avaliable NFTs:{" "}
                    <b>{isConnected === false ? 0 : myNFTs.length} Genesis NFTs</b>
                  </h6>
                </div>
                <Tooltip
                  placement="top"
                  title={
                    <div className="tooltip-text">
                      {"Deposit your Genesis Land NFTs to the staking smart contract."}
                    </div>
                  }
                >
                  <img src={moreinfo} alt="" />
                </Tooltip>
              </div>
              <div className="d-flex flex-column gap-2 justify-content-between">
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="position-relative">
                    <h6 className="amount-txt">Amount 1/{myNFTs.length}</h6>
                    <input
                      type={"number"}
                      disabled={
                        (myNFTs.length === 0 && mystakes.length === 0) || isConnected === false
                          ? true
                          : false
                      }
                      className="styledinput"
                      placeholder="0.0"
                      style={{ width: "100%" }}
                      value={amountToStake}
                      onChange={(e) => {
                        setamountToStake(e.target.value);
                        setshowChecklistModal(true);
                        setOpenStakeChecklist(true);
                        setHide("staked");
                      }}
                    />
                  </div>

                  <button
                    className={`btn ${
                      amountToStake !== "" && myNFTs.length > 0
                        ? "filledbtn"
                        : "disabled-btn"
                    } d-flex justify-content-center align-items-center gap-2`}
                    disabled={
                      amountToStake !== "" && myNFTs.length > 0 ? false : true
                    }
                    onClick={() => {}}
                  >
                    {showApprove === false ? "Deposit" : "Approve"}
                  </button>
                </div>
                {/* {this.state.errorMsg && (
                  <h6 className="errormsg">{this.state.errorMsg}</h6>
                )} */}
              </div>
            </div>
            <div
              className={`otherside-border col-12 col-md-6 ${
                renderedPage === "dashboard" ? "col-lg-5" : "col-lg-4"
              }  ${chainId !== "1" && "blurrypool"}`}
            >
              <div className="d-flex justify-content-between gap-2 flex-column flex-lg-row">
                <h6 className="withdraw-txt d-flex gap-2 align-items-center">
                  REWARDS
                  <h6
                    className="mybalance-text"
                    style={{ textTransform: "capitalize" }}
                  >
                    Staked:{""}
                    <b>{isConnected === false ? 0 : mystakes.length}</b>
                  </h6>
                </h6>
                <h6 className="withdraw-littletxt d-flex align-items-center gap-2">
                  Rewards are displayed in real-time
                  <Tooltip
                    placement="top"
                    title={
                      <div className="tooltip-text">
                        {
                          "Rewards earned by your Genesis Land NFTs deposit to the staking smart contract are displayed in real-time."
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
                    <img src={weth} alt="" /> {getFormattedNumber(EthRewards, 6) } WETH ($
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
                  setHide("");
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
      {showChecklistModal === true && (
        <LandNftStakeCheckListModal
          onClose={() => {
            setshowChecklistModal(false);
            setamountToStake("");
          }}
          getApprovedNfts={getApprovedNfts}
          nftItem={(hide === "" || hide === "tostake" || hide === "mystakes2") ? mystakes : myNFTs}
          onshowStaked={() => {
            setshowStaked(true);
            setshowToStake(false);
            setHide('mystakes2')
          }}
          onshowToStake={() => {
            setshowStaked(false);
            setshowToStake(true);
            setHide('tostake2')

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
        />
      )}

      {showModal === true && (
        <WalletModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
          }}
          handleConnection={()=>{handleConnection(); setShowModal(false)}}
        />
      )}
    </div>
  );
};

export default LandDetails;
