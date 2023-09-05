import React from "react";
import PropTypes from "prop-types";
import SvgEyeIcon from "./SvgEyeIcon";
import "./_nftCawCard.scss";

const NftCawCard = ({ modalId, action, nft, coinbase }) => {
  if (!nft) {
    return null;
  }
  return (
    <>
      <div
        className="nft-caw-card"
        data-toggle="modal"
        data-target={modalId}
        onClick={() => {
          action(nft);
        }}
      >
        <div className="elevated-container">
          <img
            src={nft.image.replace("images", "thumbs")}
            className="nft-img"
            alt=""
          />
          <p>{String(nft.name).includes('CAWS') ? 'CAWS' : 'WOD GENESIS'}</p>
          <div className="d-flex w-100 justify-content-between align-items-center">
            <p className="nft-id">{String(nft.name).includes('CAWS') ? String(nft.name).replace("CAWS ", "") : nft.name}</p>
            {/* <div className="img">
              <SvgEyeIcon />
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};
NftCawCard.propTypes = {
  modalId: PropTypes.string,
  action: PropTypes.func,
  nft: PropTypes.object,
  coinbase: PropTypes.string,
};

export default NftCawCard;
