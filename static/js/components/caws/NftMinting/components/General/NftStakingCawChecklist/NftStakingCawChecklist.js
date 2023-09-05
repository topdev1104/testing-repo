import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import PropTypes from "prop-types";
// import SvgEyeIcon from "../NftCawCard/SvgEyeIcon";
// import EthLogo from "../../../../../assets/General/eth-create-nft.png";
import { formattedNum } from "../../../../../../functions/formatUSD";
import getFormattedNumber from "../../../../../../functions/get-formatted-number";

const NftStakingCawChecklist = ({
  modalId,
  nft,
  isStake,
  checked,
  checklistItemID,
  onChange,
  countDownLeft,
  checked2,
  coinbase,
  isConnected,
  width,
  height
}) => {
  const [checkbtn, setCheckBtn] = useState(false);
  const [Unstakebtn, setUnstakeBtn] = useState(false);
  const [checkPassiveBtn, setcheckPassiveBtn] = useState(false);

  const [EthRewards, setEthRewards] = useState(0);

  const [ethToUSD, setethToUSD] = useState(0);
  const [loading, setloading] = useState(false);

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

    let calculateRewards;
    let staking_contract = await window.getContractNFT("NFTSTAKING");
    if (address !== null && currentId) {
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

    await staking_contract.methods
      .claimRewards([itemId])
      .send()
      .then(() => {
        // setethToUSD(0);
        setEthRewards(0);
      })
      .catch((err) => {
        window.alertify.error(err?.message);
      });
  };

  const handleUnstake = async (itemId) => {
    let stake_contract = await window.getContractNFT("NFTSTAKING");
    setloading(true);

    await stake_contract.methods
      .withdraw([itemId])
      .send()
      .then(() => {
        setcheckPassiveBtn(false);
        setloading(false);
      })
      .catch((err) => {
        console.log(err);
        setloading(false);
      });
  };

  useEffect(() => {
    if (isConnected) {
      getStakesIds().then();
      calculateReward(checklistItemID).then();

      if (countDownLeft <= 0 && countDownLeft !== undefined) {
        setcheckPassiveBtn(true);
      }
    }
  }, [EthRewards, checklistItemID, isConnected, countDownLeft]);

  useEffect(() => {
    setCheckBtn(checked);
    setUnstakeBtn(checked);
  }, [checked, isStake]);

  if (!nft) {
    return null;
  }

  const getStakesIds = async () => {
    const address = coinbase;
    let staking_contract = await window.getContractNFT("NFTSTAKING");
    let stakenft = [];
    if (address !== null) {
      let myStakes = await staking_contract.methods
        .depositsOf(address)
        .call()
        .then((result) => {
          for (let i = 0; i < result.length; i++)
            stakenft.push(parseInt(result[i]));
          return stakenft;
        });
      return myStakes;
    }
  };

  const handleCawClick = () => {
    if (isStake === false) {
      if (checked2 === true) {
        setCheckBtn(!checkbtn);
        onChange(checklistItemID);
      } else if (checked2 === false) {
        setCheckBtn(!checkbtn);
        onChange(checklistItemID);
      }
    } else if (isStake === true) {
      if (checked2 === true) {
        setUnstakeBtn(!Unstakebtn);
        onChange(checklistItemID);
      } else if (checked2 === false) {
        setUnstakeBtn(!Unstakebtn);
        onChange(checklistItemID);
      }
    }
  };
  return (
    <>
      <div
        className="nft-caw-card sub-container p-0"
        data-toggle="modal"
        data-target={modalId}
        onClick={() => {
          handleCawClick(checklistItemID);
        }}
        style={{
          width: width,
          height: height,
          border: isStake
            ? checked === true
              ? Unstakebtn === true
                ? "2px solid #4ED5D2"
                : "none"
              : Unstakebtn === true
              ? "2px solid #4ED5D2"
              : "none"
            : checked === false && checkbtn === true && checked2 === true
            ? "2px solid #4ED5D2"
            : checked === true && checkbtn === true && checked2 === true
            ? "2px solid #4ED5D2"
            : "none",
        }}
      >
        <div
          className="elevated-stake-container"
          style={{
            background: "transparent",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <div className="sub-container p-0" style={{ boxShadow: "none" }}>
            <img
              src={nft.image.replace("images", "thumbs")}
              className="nft-img"
              alt=""
              // onClick={() => {
              //   onNftCheckListClick(nft);
              // }}
              // style={{ cursor: "pointer" }}
            />
            <p
              style={{
                color: "var(--light-gray-99-nft)",
              }}
            >
              CAWS {checklistItemID}
            </p>
            <div className="d-flex" style={{ flexDirection: "column" }}>
              <div className="d-flex w-100 justify-content-between align-baseline">
                <p
                  className="nft-id"
                  style={{
                    color: "var(--black-nft)",
                  }}
                >
                  #{String(nft.name).replace("CAWS #", "")}
                </p>
                {isStake ? (
                  <>
                    <input
                      type="checkbox"
                      id={checklistItemID}
                      name="AddtoUnstake"
                      checked={Unstakebtn && checked2 === true}
                      onClick={() => {
                        setUnstakeBtn(!Unstakebtn);
                        // onChange(checklistItemID);
                      }}
                      // style={{
                      //   pointerEvents:
                      //     checkPassiveBtn === true ? "auto" : "none",
                      // }}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      id={checklistItemID}
                      name="checkbtn"
                      checked={checkbtn && isStake === false && checked2 === true}
                      onChange={(e) => {
                        setCheckBtn(!checkbtn);
                      }}
                    />
                  </>
                )}
              </div>
              {/* <div className="img">
              <SvgEyeIcon />
            </div> */}
              {isStake && (
                <>
                  <div
                    className="earn-checklist-container d-block mb-0 p-0 w-100"
                    style={{ boxShadow: "none", borderTop: "none" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexDirection: "column",
                      }}
                    >
                      <p id="earnedText" color="#C0C9FF">
                        Earned
                      </p>
                      <h6
                        className="rewardstxtCaws d-flex align-items-center gap-2 mb-2"
                        style={{ fontSize: 16 }}
                      >
                        <img
                          src={require("./weth.svg").default}
                          alt=""
                          style={{ height: 20, width: 20 }}
                        />{" "}
                        {getFormattedNumber(EthRewards, 6)} WETH
                      </h6>

                      {/* <div>
                        <p id="ethPrice">
                          {getFormattedNumber(EthRewards, 2)}ETH
                        </p>
                        <p id="fiatPrice">{formattedNum(ethToUSD, true)}</p>
                      </div> */}
                      {/* <img
                        src={EthLogo}
                        alt=""
                        style={{ width: 24, height: 24 }}
                      /> */}
                    </div>{" "}
                  </div>
                  <button
                    className="claim-rewards-btn-countdown mb-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaim(checklistItemID);
                    }}
                    style={{
                      pointerEvents: EthRewards == 0 ? "none" : "auto",
                      borderColor: EthRewards == 0 ? "#14142A" : "#857DFA",
                      color: EthRewards == 0 ? "#C0C9FF" : "#857DFA",
                      background: EthRewards == 0 ? "#14142A" : "#312F69",
                      padding: 5,
                      borderRadius: 8,
                      width: "100%",
                    }}
                  >
                    Claim reward
                  </button>
                </>
              )}
            </div>
          </div>
          {isStake ? (
            <>
              <button
                className="checkbox-button"
                onClick={() => {
                  handleUnstake(checklistItemID);
                }}
                style={{
                  background:
                    checkPassiveBtn === true
                      ? "linear-gradient(90.74deg, #7770E0 0%, #554FD8 100%)"
                      : "#14142A",
                  pointerEvents: checkPassiveBtn === true ? "auto" : "none",
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="spinner-border "
                      role="status"
                      style={{ height: "1.5rem", width: "1.5rem" }}
                    ></div>
                  </>
                ) : (
                  "Unstake"
                )}
              </button>
            </>
          ) : (
            <>
              {/* <button
                className="checkbox-button"
                // onClick={() => {
                //   setCheckBtn(!checkbtn);
                //   onChange(checklistItemID);
                // }}
                style={{
                  background:
                    (!checked && !checkbtn) || (checked && !checkbtn)
                      ? "linear-gradient(51.32deg, #e30613 -12.3%, #fa4a33 50.14%)"
                      : "#C4C4C4",
                }}
              >
                
                {(!checked && !checkbtn) || (checked && !checkbtn && !isStake)
                  ? "Add to Stake"
                  : "Remove Stake"}
              </button> */}
            </>
          )}
        </div>
      </div>
    </>
  );
};
NftStakingCawChecklist.propTypes = {
  modalId: PropTypes.string,
  nft: PropTypes.object,
  isStake: PropTypes.bool,
  checked: PropTypes.bool,
  checklistItemID: PropTypes.number,
  onChange: PropTypes.func,
  // onNftCheckListClick: PropTypes.func,
  countDownLeft: PropTypes.any,
  coinbase: PropTypes.string,
  isConnected: PropTypes.bool,
  width: PropTypes.any,
  height: PropTypes.any
};

export default NftStakingCawChecklist;
