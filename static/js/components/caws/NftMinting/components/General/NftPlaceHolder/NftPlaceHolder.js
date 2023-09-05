import React from "react";
import "./_nftPlaceHolder.scss";

const NftPlaceHolder = ({ onMintClick, width }) => {
  return (
    <div className="placeholder-wrapper nft-caw-card" style={{ width: width }}>
      <a
        className="placeholder-button"
        href="https://opensea.io/collection/catsandwatchessocietycaws"
        target={"_blank"}
        rel="noreferrer"
      >
        <div className="placeholder-content">
          <img
            src={require("./cat_desktop.jpeg").default}
            alt=""
            className="placeholder-content-img"
          />
          <p className="placeholder-content-text">
            You can view all your NFTs to manage them
          </p>
          <a
            className="placeholder-button"
            href="https://opensea.io/collection/catsandwatchessocietycaws"
            target={"_blank"}
            rel="noreferrer"
          >
            Buy on OpenSea
          </a>
        </div>
      </a>
    </div>
  );
};

export default NftPlaceHolder;
