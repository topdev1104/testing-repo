import Modal from "../../../../../Modal/Modal";
import React from "react";
import PropTypes from "prop-types";
// import showToast from '../../../../../Utils/toast';
import { shortAddress } from "../../../../../../functions/shortAddress";
import "./_nftCardModal.scss";

const NftCardModal = ({
  nftItem,
  modalId,
  onShareClick,
  visible,
  link,
  score,
  rarity,
}) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(nftItem.address);
    // showToast('Address copied to clipboard!', undefined, { autoClose: 2000 });
  };

  return (
    <Modal visible={visible} modalId={modalId}>
      <div className="details-modal-content">
        <div className="left-col">
          <div className="rarity-rank">
            {/* <img src={require("../../../../../assets/General/star-circle-icon.svg").default} alt="" /> */}
            <h3 className="red-text">Rarity rank</h3>
            <h3 className="gray-text">{rarity ? rarity : "Coming soon..."}</h3>
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
              {/* <img src={require("../../../../../assets/Nft/NftMintinglist/opensea-icon.png")} alt="" /> */}
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
            {/* <img src={require("../../../../../assets/General/share-icon.svg").default} alt="" /> */}
            <p>Share your NFT online</p>
          </a>
        </div>
        <div className="right-col">
          <div className="rarity-score">
            <h1>Rarity Score</h1>
            <span>{score ? score : "??????"}</span>
          </div>
          <p>Rarity...</p>
          {nftItem?.attributes?.map((item, id) => (
            <div
              className="progress-bar-wrapper"
              key={id}
              style={{ marginBottom: 0 }}
            >
              <p className="property-name">{item.trait_type}</p>
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
    </Modal>
  );
};
NftCardModal.propTypes = {
  nftItem: PropTypes.any,
  modalId: PropTypes.string,
  onShareClick: PropTypes.func,
  visible: PropTypes.bool,
};

export default NftCardModal;
