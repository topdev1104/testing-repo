import NftCawCard from "../../General/NftCawCard/NftCawCard";
import TitleWithParagraph from "../../General/TitleWithParagraph";
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import PropTypes from "prop-types";
import SvgTimesIcon from "./SvgTimesIcon";
import Info from "../MyStakes/info.svg";
import "./_myNfts.scss";

let settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 4,
  nextArrow: (
    <div>
      <img
        src={require("../../../../../../assets/ArrowIcons/arrow.svg").default}
        alt=""
      />
    </div>
  ),
  prevArrow: (
    <div>
      <img
        src={require("../../../../../../assets/ArrowIcons/arrow.svg").default}
        alt=""
      />
    </div>
  ),

  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
  ],
};

const MyNfts = ({
  items,
  numberOfNfts,
  onItemClick,
  label,
  smallTitle,
  bigTitle,
  isConnected,
  coinbase,
}) => {
  const [showAll, setsShowAll] = useState(false);

  if (window.innerWidth < 768 && showAll) {
    settings = { ...settings, rows: 2, slidesPerRow: 2, slidesToShow: 1 };
  }

  const renderCards = () => {
    return (
      items.length > 0 &&
      items.map((item, id) => {
        return (
          <NftCawCard
            key={id}
            nft={item}
            action={onItemClick}
            modalId="#newNftStake"
            coinbase={coinbase}
          />
        );
      })
    );
  };

  return (
    <div className="my-nfts">
      <div className="container-fluid padding-inline">
        <div className="row">
          <div className="col">
            <TitleWithParagraph>
              <h1>
                <small>{smallTitle}</small> <br />
                {bigTitle}
              </h1>
            </TitleWithParagraph>
          </div>
        </div>
        <div className="row mints-container ">
          <div className="graphic-container d-flex d-sm-none">
            {/* <img
              src={require("../../../../../assets/Nft/NftMintinglist/collection-graphic.png")}
              alt=""
            /> */}
            <p>{label}</p>
            {numberOfNfts > 4 && (
              <button
                onClick={() => setsShowAll(!showAll)}
                className={`${showAll && "open-button"} view-all`}
              >
                {showAll && <SvgTimesIcon />} {showAll ? "Close" : "View all"}
              </button>
            )}
          </div>
          <div className="row justify-content-center">
            <div className="graphic-container d-none d-sm-flex">
              {/* <img
                src={require("../../../../../assets/Nft/NftMintinglist/collection-graphic.png")}
                alt=""
              /> */}

              <p>{label}</p>
              {numberOfNfts > 4 && (
                <button
                  onClick={() => setsShowAll(!showAll)}
                  className={`${showAll && "open-button"}`}
                >
                  {" "}
                  {showAll && <SvgTimesIcon />} {showAll ? "Close" : "View all"}
                </button>
              )}
            </div>
            <div
              className="myCaws-info-text"
              style={{
                display: isConnected && numberOfNfts >= 1 ? "none" : "flex",
              }}
            >
              <p
                className="mycaws-status-text"
                style={{ pointerEvents: "none" }}
              >
                {/* <Tooltip icon={'i'} color={'#939393'} borderColor={'#939393'} />
                 */}
                <img src={Info} alt="" />

                {isConnected === true && numberOfNfts < 1
                  ? "Your minted NFTs will be available here."
                  : isConnected === false
                  ? "Please connect your wallet in order to see your NFTs"
                  : isConnected === true && numberOfNfts > 1
                  ? ""
                  : ""}
              </p>
            </div>
            {showAll && renderCards()}
            {!showAll && (
              <div className={["slider", showAll ? "d-none" : ""].join(" ")}>
                <div className="row justify-content-center">{renderCards()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
MyNfts.propTypes = {
  items: PropTypes.array,
  numberOfNfts: PropTypes.number,
  onItemClick: PropTypes.func,
  label: PropTypes.string,
  smallTitle: PropTypes.string,
  bigTitle: PropTypes.string,
  coinbase: PropTypes.string,
  isConnected: PropTypes.bool,
};

export default MyNfts;
