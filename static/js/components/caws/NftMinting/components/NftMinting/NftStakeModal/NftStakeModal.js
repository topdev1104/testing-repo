import Modal from "../../../../../Modal/Modal";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";
// import showToast from "../../../../../Utils/toast";
import { shortAddress } from "../../../../../../functions/shortAddress";
// import EthLogo from "../../../../../assets/General/eth-create-nft.png";
// import CountDownTimerUnstake from "../../../../elements/CountDownUnstake";
import OutsideClickHandler from "react-outside-click-handler";
import { formattedNum } from "../../../../../../functions/formatUSD";
import getFormattedNumber from "../../../../../../functions/get-formatted-number";
// import ToolTip from "../../../../elements/ToolTip";
import Web3 from "web3";
import CountDownTimerUnstake from '../../../../../locker/Countdown'

const NftStakeModal = ({
  nftItem,
  modalId,
  onShareClick,
  visible,
  link,
  itemId,
  score,
  rarity,
  countDownLeft,
  coinbase,
  isConnected,
}) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(nftItem.address);
    // showToast("Address copied to clipboard!", undefined, { autoClose: 2000 });
  };

  const [active, setActive] = useState(false);
  const [loading, setloading] = useState(false);
  const [loadingdeposit, setloadingdeposit] = useState(false);
  const [showApprove, setshowApprove] = useState(true);

  const [showClaim, setshowClaim] = useState(false);
  const [loadingClaim, setloadingClaim] = useState(false);
  const [status, setStatus] = useState(" *Please approve before deposit");
  const [apr, setapr] = useState(50);
  const [EthRewards, setEthRewards] = useState(0);
  const [ethToUSD, setethToUSD] = useState(0);

  const [unstake, setunstake] = useState(false);
  const [isconnectedWallet, setisConnectedWallet] = useState(false);
  const [color, setColor] = useState("#F13227");

  const checkApproval = async () => {
    const address = coinbase;

    if (address !== null) {
      const stakeApr50 = await window.config.nftstaking_address50;
      if (apr == 50) {
        const result = await window.nft
          .checkapproveStake(address, stakeApr50)
          .then((data) => {
            return data;
          });

        if (result === true) {
          setshowApprove(false);
          setActive(true);
        } else {
          setshowApprove(true);
          setActive(false);
        }
      }
    }
  };

  const handleClearStatus = () => {
    const interval = setInterval(async () => {
      setStatus("");
    }, 5000);
    return () => clearInterval(interval);
  };

  const handleApprove = async () => {
    const stakeApr50 = await window.config.nftstaking_address50;

    setloading(true);
    setStatus("*Waiting for approval");
    await window.nft
      .approveStake(stakeApr50)
      .then(() => {
        setActive(true);
        setloading(false);
        setColor("#52A8A4");
        setStatus("*Now you can deposit");
      })
      .catch((err) => {
        setloading(false);
        setColor("#F13227");
        setStatus("*An error occurred. Please try again");
      });
  };

  const handleDeposit = async (currentId) => {
    let stake_contract = await window.getContractNFT("NFTSTAKING");
    setloadingdeposit(true);

    setStatus("*Processing deposit");
    setColor("#F13227");

    await stake_contract.methods
      .deposit([currentId])
      .send()
      .then(() => {
        setloadingdeposit(false);
        setshowClaim(true);
        setColor("#57AEAA");
        setActive(true);
        setStatus("*Sucessful deposit");
        handleClearStatus();
      })
      .catch((err) => {
        setloadingdeposit(false);
        setColor("#F13227");
        setStatus("*An error occurred. Please try again");
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

  const calculateReward = async (currentId) => {
    const address = coinbase;

    if (address !== null && currentId) {
      let calculateRewards;
      let staking_contract = await window.getContractNFT("NFTSTAKING");
      calculateRewards = await staking_contract.methods
        .calculateReward(address, parseInt(currentId))
        .call()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          // window.alertify.error(err?.message);
        });
      const infuraWeb3 = new Web3(window.config.infura_endpoint);
      let a = infuraWeb3.utils.fromWei(calculateRewards, "ether");
      const ethprice = await convertEthToUsd();
      setethToUSD(Number(ethprice) * Number(a));
      setEthRewards(Number(a));
    }
  };

  const handleClaim = async (itemId) => {
    let staking_contract = await window.getContractNFT("NFTSTAKING");

    setloadingClaim(true);
    setActive(false);

    await staking_contract.methods
      .claimRewards([itemId])
      .send()
      .then(() => {
        setloadingClaim(false);
        setEthRewards(0);
        setStatus("*Claimed successfully");
        handleClearStatus();
        setColor("#57AEAA");
      })
      .catch((err) => {
        window.alertify.error(err?.message);
        setloadingClaim(false);
        setStatus("*An error occurred. Please try again");
        handleClearStatus();
      });
  };

  const handleUnstake = async (itemId) => {
    let stake_contract = await window.getContractNFT("NFTSTAKING");
    setloading(true);
    setStatus("*Processing unstake");
    setColor("#F13227");

    await stake_contract.methods
      .withdraw([itemId])
      .send()
      .then(() => {
        setStatus("*Unstaked successfully");
        handleClearStatus();
        setActive(false);
        setColor("#57AEAA");
        setloading(false);
      })
      .catch((err) => {
        console.log(err);
        setloading(false);
        setColor("#F13227");
        setStatus("*An error occurred. Please try again");
      });
  };

  useEffect(() => {
    checkApproval().then();

    const interval = setInterval(async () => {
      if (isConnected && itemId) {
        calculateReward(itemId).then();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [apr, EthRewards, itemId, isConnected]);

  const devicewidth = window.innerWidth;

  return (
    <Modal visible={visible} modalId={modalId}>
      <OutsideClickHandler
        onOutsideClick={() => {
          setshowClaim(false);
          setActive(false);
          setStatus("");
        }}
      >
        <div>
          <div className="details-modal-content pb-0">
            <div className="left-col">
              <div className="rarity-rank">
                {/* <img
                  src={
                    require("../../../../../assets/General/star-circle-icon.svg")
                      .default
                  }
                  alt=""
                /> */}
                <h3 className="red-text">Rarity rank</h3>
                <h3 className="gray-text">
                  {rarity ? rarity : "Coming soon..."}
                </h3>
              </div>
              <div className="ownerId-section">
                <p>Owner</p>
                <span>{shortAddress(nftItem.address)}</span>
                <div className="cursor-pointer" onClick={copyAddress}>
                  <p>Copy</p>
                  <span className="m-0">
                    <svg
                      width="19"
                      height="22"
                      viewBox="0 0 19 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 0H2C0.895 0 0 0.895 0 2V16H2V2H14V0ZM17 4H6C4.895 4 4 4.895 4 6V20C4 21.105 4.895 22 6 22H17C18.105 22 19 21.105 19 20V6C19 4.895 18.105 4 17 4ZM17 20H6V6H17V20Z"
                        fill="#E30613"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="caw-card">
                {nftItem.image && (
                  <img src={nftItem.image} alt="" className="nft-img" />
                )}
                <div className="id">
                  <h1>{nftItem?.name}</h1>
                  <p>ID {nftItem?.nftId}</p>
                </div>
                <a
                  href="https://opensea.io/collection/catsandwatchessocietycaws"
                  target="_blank"
                  rel="noreferrer"
                  className="view-link"
                >
                  {/* <img
                    src={require("../../../../../assets/Nft/NftMintinglist/opensea-icon.png")}
                    alt=""
                  /> */}
                  <p>View on Opensea</p>
                </a>
              </div>
              <a
                onClick={() => onShareClick(nftItem)}
                href={`https://twitter.com/intent/tweet/?text=Check out my recently minted ${encodeURIComponent(
                  nftItem?.name
                )} NFT on&url=${link}`}
                className="share-link"
                target="_blank"
                rel="noopener"
              >
                {/* <img
                  src={
                    require("../../../../../assets/General/share-icon.svg")
                      .default
                  }
                  alt=""
                /> */}
                <p>Share your NFT online</p>
              </a>
              <div>
                <div>
                  <div>
                    <h3 className="stakeNft-Title d-flex" style={{ gap: 12 }}>
                      Stake NFT
                      <h3
                        className="stakeNft-Title aprText "
                        style={{ color: "#e30613", gap: 12 }}
                      >
                        50% APR
                      </h3>
                    </h3>
                    <p className="stakeNft-subtitle">
                      Stake your NFT to earn rewards (30 days lock time)
                    </p>
                  </div>
                  <div>
                    <div>
                      <form className="d-flex flex-column" style={{ gap: 5 }}>
                        <input
                          type="radio"
                          id="50APR"
                          name="locktime"
                          value="50"
                          checked={true}
                          className="d-none"
                        />{" "}
                        <span className="radioDesc"></span>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="right-col">
              <div className="rarity-score">
                <h1>Rarity Score</h1>
                <span>{score ? score : "??????"}</span>
              </div>
              <p>Rarity...</p>
              {nftItem?.attributes?.map((item, id) => (
                <div className="progress-bar-wrapper" key={id}>
                  <p className="property-name">{item.name}</p>
                  <div className="progress">
                    {" "}
                    {/* width: `${item.percentage}%` */}
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: "100%" }}
                      aria-valuenow="25"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <p className="property-value">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className={
              !showClaim
                ? "mt-0 row justify-content-center"
                : "mt-0 row ml-0 justify-content-between"
            }
            style={{
              gap: 20,
              padding: devicewidth < 767 ? "10px" : "10px 40px 10px 40px",
            }}
          >
            {showClaim === false ? (
              <>
                <button
                  className={
                    showApprove === true ? "btn activebtn" : "btn passivebtn"
                  }
                  onClick={() => {
                    handleApprove();
                  }}
                  style={{
                    background:
                      active === false && showApprove === true
                        ? "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)"
                        : "#C4C4C4",
                    pointerEvents: active === false ? "auto" : "none",
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
                      active === true || showApprove === false
                        ? "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)"
                        : "#C4C4C4",
                    pointerEvents:
                      active === true || showApprove === false
                        ? "auto"
                        : "none",
                  }}
                  onClick={() => {
                    handleDeposit(itemId);
                  }}
                >
                  {loadingdeposit ? (
                    <>
                      <div className="spinner-border " role="status"></div>
                    </>
                  ) : (
                    "Deposit"
                  )}
                </button>
              </>
            ) : (
              <>
                <div
                  className="row claimAll-wrapper m-0"
                  style={{ maxWidth: devicewidth < 567 ? "95%" : "48%" }}
                >
                  <button
                    className="btn claim-reward-button"
                    onClick={() => {
                      handleClaim(itemId);
                      // setCheckUnstakeBtn(false);
                    }}
                    style={{
                      background:
                        EthRewards != 0
                          ? "linear-gradient(51.32deg, #57aeaa -12.3%, #94e0dc 50.14%)"
                          : "#C4C4C4",
                      pointerEvents: EthRewards != 0 ? "auto" : "none",
                    }}
                  >
                    {loadingClaim ? (
                      <>
                        <div
                          className="spinner-border "
                          style={{ height: "1rem", width: "1rem" }}
                          role="status"
                        ></div>
                      </>
                    ) : (
                      "Claim Rewards"
                    )}
                  </button>
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
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                        Pending
                      </p>
                      <div className="d-flex justify-content-between">
                        <div>
                          <p id="ethPrice" className="mb-0">
                            {getFormattedNumber(EthRewards, 2)} WETH
                          </p>
                          <p id="fiatPrice" className="mb-0">
                            {formattedNum(ethToUSD, true)}
                          </p>
                        </div>
                        {/* <img
                          src={EthLogo}
                          alt=""
                          style={{ width: 24, height: 24 }}
                        /> */}
                      </div>
                    </div>
                  </div>{" "}
                </div>

                <div
                  className="row claimAll-wrapper m-0"
                  style={{
                    background: "rgba(153, 153, 153, 0.1)",
                    maxWidth: devicewidth < 567 ? "95%" : "48%",
                  }}
                >
                  <button
                    className="btn claim-reward-button"
                    onClick={() => {
                      handleUnstake(itemId);
                    }}
                    style={{
                      background:
                        unstake === true
                          ? "linear-gradient(51.32deg, #57aeaa -12.3%, #94e0dc 50.14%)"
                          : "#C4C4C4",

                      pointerEvents: EthRewards == 0 ? "auto" : "none",
                      maxWidth: "none",
                    }}
                  >
                    {loading ? (
                      <>
                        <div
                          className="spinner-border "
                          style={{ height: "1rem", width: "1rem" }}
                          role="status"
                        ></div>
                      </>
                    ) : (
                      "Unstake"
                    )}
                  </button>
                  <div
                    className="earn-checklist-container d-block mb-0 w-100"
                    style={{
                      boxShadow: "none",
                      borderTop: "none",
                      paddingLeft: 18,
                      paddingRight: 18,
                    }}
                  >
                    <div
                      className="row"
                      style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 20,
                        }}
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
                            padding={"0px 0px 0px 0px"}
                          /> */}
                          <p className="claim-timer-subtitle m-0">Cooldown</p>
                        </div>
                        <CountDownTimerUnstake
                          date={Date.now() + countDownLeft}
                          onComplete={() => {
                            setunstake(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <p
            className="mt-1"
            style={{
              color: color,
              padding: devicewidth < 767 ? "10px" : "10px 40px 10px 40px",
              textAlign: "center",
            }}
          >
            {status}
          </p>
        </div>
      </OutsideClickHandler>
    </Modal>
  );
};
NftStakeModal.propTypes = {
  nftItem: PropTypes.any,
  modalId: PropTypes.string,
  onShareClick: PropTypes.func,
  visible: PropTypes.bool,
  itemId: PropTypes.number,
  countDownLeft: PropTypes.any,
};

export default NftStakeModal;
