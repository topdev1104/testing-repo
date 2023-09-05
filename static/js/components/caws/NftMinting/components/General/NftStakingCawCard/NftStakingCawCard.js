import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Web3 from "web3";
// import EthLogo from "../../../../../assets/General/eth-create-nft.png";
import SvgEyeIcon from "../NftCawCard/SvgEyeIcon";
import { formattedNum } from "../../../../../../functions/formatUSD";
import getFormattedNumber from "../../../../../../functions/get-formatted-number";
import "./_nftStakeCawCard.scss";

const NftStakingCawCard = ({
  modalId,
  action,
  nft,
  id,
  isconnectedWallet,
  coinbase,
}) => {
  const [EthRewards, setEthRewards] = useState(0);
  const [ethToUSD, setethToUSD] = useState(0);

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

      // console.log(calculateRewards)
      const infuraWeb3 = new Web3(window.config.infura_endpoint);
      let a = infuraWeb3.utils.fromWei(calculateRewards, "ether");
      const ethprice = await convertEthToUsd();
      setethToUSD(Number(ethprice) * Number(a));

      setEthRewards(Number(a));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isconnectedWallet) {
        calculateReward(id).then();
        convertEthToUsd().then();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [EthRewards, isconnectedWallet]);

  const handleClaim = async (id) => {
    let staking_contract = await window.getContractNFT("NFTSTAKING");

    await staking_contract.methods
      .claimRewards([id])
      .send()
      .then(() => {
        setEthRewards(0);
      })
      .catch((err) => {
        window.alertify.error(err?.message);
        // setloadingClaim(false);
      });
  };

  if (!nft) {
    return null;
  }

  return (
    <>
      <div
        className="nft-caw-card"
        data-toggle="modal"
        style={{ margin: "auto" }}
        data-target={modalId}
        onClick={() => {
          action(nft);
        }}
      >
        <div className="elevated-stake-container">
          <img
            src={nft.image.replace("images", "thumbs")}
            className="nft-img"
            alt=""
          />
          <p>CAWS</p>
          <div className="footer">
            <p className="nft-id">#{String(nft.name).replace("CAWS #", "")}</p>
            <div className="img">
              <SvgEyeIcon />
            </div>
          </div>{" "}
        </div>
      </div>
      <div className="earnwrapper" style={{ margin: "auto" }}>
        <p style={{ color: "#999999", fontSize: 12 }}>Pending</p>
        <div>
          <p id="ethPrice">{getFormattedNumber(EthRewards, 2)} WETH</p>
          <p id="fiatPrice">{formattedNum(ethToUSD, true)}</p>
        </div>
        {/* <img src={EthLogo} alt="" style={{ width: 24, height: 24 }} /> */}
      </div>
      <div style={{ paddingBottom: 10 }}>
        <div className="earnwrapper justify-content-center">
          <button
            className="claim-rewards-btn-countdown"
            onClick={(e) => {
              e.stopPropagation();
              handleClaim(id);
            }}
            style={{
              pointerEvents: EthRewards == 0 ? "none" : "auto",
              borderColor: EthRewards == 0 ? "#C4C4C4" : "#FF0000",
              color: EthRewards == 0 ? "#fff" : "#FF0000",
              background: EthRewards == 0 ? "#C4C4C4" : "#fff",
            }}
          >
            Claim reward
          </button>
        </div>
      </div>
    </>
  );
};
NftStakingCawCard.propTypes = {
  modalId: PropTypes.string,
  action: PropTypes.func,
  nft: PropTypes.object,
  id: PropTypes.number,
  isconnectedWallet: PropTypes.bool,
  coinbase: PropTypes.string,
};

export default NftStakingCawCard;
