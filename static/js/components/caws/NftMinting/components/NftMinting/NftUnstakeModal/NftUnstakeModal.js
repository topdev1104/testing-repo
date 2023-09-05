import Modal from "../../../../../Modal/Modal";
import Web3 from "web3";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
// import showToast from "../../../../../Utils/toast";
import { shortAddress } from "../../../../../../functions/shortAddress";
// import EthLogo from "../../../../../assets/General/eth-create-nft.png";
// import CountDownTimerUnstake from "../../../../elements/CountDownUnstake";
import { formattedNum } from "../../../../../../functions/formatUSD";
import axios from "axios";
import getFormattedNumber from "../../../../../../functions/get-formatted-number";
// import ToolTip from "../../../../elements/ToolTip";
import CountDownTimerUnstake from '../../../../../locker/Countdown'

const NftUnstakeModal = ({
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

  const [active, setActive] = useState(true);

  const [loading, setloading] = useState(false);
  const [loadingdeposit, setloadingdeposit] = useState(false);
  const [status, setStatus] = useState("");
  const [color, setColor] = useState("#F13227");

  const [unstake, setunstake] = useState(false);
  const [EthRewards, setEthRewards] = useState(0);
  const [ethToUSD, setethToUSD] = useState(0);
  const [loadingClaim, setloadingClaim] = useState(false);

  const handleClearStatus = () => {
    const interval = setInterval(async () => {
      setStatus("");
    }, 5000);
    return () => clearInterval(interval);
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
        setColor("#57AEAA");
        setActive(false);
        setloading(false);
        handleClearStatus();
        setunstake(false);
      })

      .catch((err) => {
        console.log(err);
        setloading(false);
        setColor("#F13227");
        setStatus("*An error occurred. Please try again");
        handleClearStatus();
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
      setActive(true);
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
    setStatus("*Claiming rewards...");
    setColor("#F13227");

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
        setStatus("*An error occured. Please try again");
        handleClearStatus();

        setloadingClaim(false);
      });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isConnected && itemId) {
        calculateReward(itemId).then();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [EthRewards, isConnected, itemId, visible]);

  const devicewidth = window.innerWidth;

  return (
    <Modal visible={visible} modalId={modalId}>
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
                className="view-link"
              >
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
                  <h3 className="stakeNft-Title">Stake NFT</h3>
                  <p className="stakeNft-subtitle">
                    Stake your NFT to earn rewards
                  </p>
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
        </div>{" "}
        <div>
          <div
            className="mt-0 row justify-content-between"
            style={{
              gap: 20,
              margin: "auto",
              padding: devicewidth < 767 ? "10px" : "10px 40px 10px 40px",
            }}
          >
            <div
              className="row claimAll-wrapper m-0"
              style={{ maxWidth: devicewidth < 567 ? "100%" : "48%" }}
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
                  maxWidth: "none",
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
                    {/* <ToolTip title="" icon={"i"} /> */}
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
              </div>
            </div>
            <div
              className="row claimAll-wrapper m-0"
              style={{
                background: "rgba(153, 153, 153, 0.1)",
                maxWidth: devicewidth < 567 ? "100%" : "48%",
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
                      ? "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)"
                      : "#C4C4C4",
                  pointerEvents: unstake === true ? "auto" : "none",
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
                      width: "100%",
                      justifyContent: "space-between",
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
          </div>
          <p
            className="mt-1"
            style={{
              color: color,
              padding: devicewidth < 767 ? "10px" : "10px 40px",
              textAlign: "center",
            }}
          >
            {status}
          </p>
        </div>
      </div>
    </Modal>
  );
};
NftUnstakeModal.propTypes = {
  nftItem: PropTypes.any,
  modalId: PropTypes.string,
  onShareClick: PropTypes.func,
  visible: PropTypes.bool,
  itemId: PropTypes.number,
  countDownLeft: PropTypes.any,
  isConnected: PropTypes.bool,
  coinbase: PropTypes.string,
};

export default NftUnstakeModal;
