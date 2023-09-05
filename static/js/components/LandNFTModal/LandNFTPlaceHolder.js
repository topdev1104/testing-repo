import React from "react";
import "../caws/NftMinting/components/General/NftPlaceHolder/_nftPlaceHolder.scss";

const NftPlaceHolder = ({ onMintClick }) => {
  return (
    <div className="placeholder-wrapper nft-caw-card" style={{ width: 155 }}>
      <a
        href="https://opensea.io/collection/worldofdypians"
        target="_blank"
        className="placeholder-button"
        rel="noreferrer"
      >
        <div className="placeholder-content">
          <div
            className="d-flex align-items-center justify-content-center p-0"
            style={{ border: "1px grey dashed", borderRadius: "8px" }}
          >
            <img
              src={require("./landplaceholder.svg").default}
              alt=""
              className="placeholder-content-img"
              style={{width: 135,
                height: 110, scale: '0.8'
            }}
            />
          </div>
          <p className="placeholder-content-text">
            You can view all your NFTs to manage them
          </p>
          <a
            href="https://opensea.io/collection/worldofdypians"
            target="_blank"
            className="placeholder-button"
            rel="noreferrer"
          >
            Buy on Opensea
          </a>
        </div>
      </a>
    </div>
  );
};

export default NftPlaceHolder;
