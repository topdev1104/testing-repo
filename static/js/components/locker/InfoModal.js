import React from "react";
import BadgeYellow from "../../assets/badge-yellow.svg";
import BadgeGray from "../../assets/badge-gray.svg";
import Badge from "../../assets/badge.svg";
import Modal from "../general/Modal";
import OutsideClickHandler from "react-outside-click-handler";
import pairOrange from "./assets/pairOrange.svg";
import pairPurple from "./assets/pairPurple.svg";
import pairGrey from "./assets/pairGrey.svg";
import greySecurityIcon from "./assets/greySecurityIcon.svg";
import "./newlocker.css";

const InfoModal = ({ modalId, visible, onModalClose }) => {
  return (
    <Modal
      visible={visible}
      modalId={modalId}
      onModalClose={onModalClose}
      maxWidth={1000}
    >
      <OutsideClickHandler
        onOutsideClick={() => {
          onModalClose();
        }}
      >
        <div>
          <div style={{ padding: "30px" }}>
            <div className="d-flex align-items-center gap-2">
              <img src={greySecurityIcon} alt="" />
              <span className="locker-function-title">Dyp Locker</span>
            </div>
            <p className="locker-modal-desc" style={{ marginBottom: 20 }}>
            A liquidity pool is a crowdsourced pool of cryptocurrencies or tokens locked in a smart contract that is used to facilitate trades between the assets on a decentralized exchange (DEX).
            </p>
            <div className="d-flex flex-column gap-4">
              <div className="d-flex p-3 locker-modal-item justify-content-center gap-2 align-items-start">
                <img src={pairPurple} className="locker-modal-icon" alt="" />
                <div className="d-flex flex-column align-items-start gap-2">
                  <span className="modal-locker-active-tag">Active</span>
                  <h6 className="modal-locker-liquidity">Liquidity Locked</h6>
                  <p className="modal-locker-paragraph">
                  A liquidity pool is a crowdsourced pool of cryptocurrencies or tokens locked in a smart contract that is used to facilitate trades between the assets on a decentralized exchange (DEX).
                  </p>
                </div>
              </div>
              <div className="d-flex p-3 locker-modal-item justify-content-center gap-2 align-items-start">
                <img src={pairOrange} className="locker-modal-icon" alt="" />
                <div className="d-flex flex-column align-items-start gap-2">
                  <span className="modal-locker-active-tag">Active</span>
                  <h6 className="modal-locker-liquidity">
                    Potential Liquidity Unlock
                  </h6>
                  <p className="modal-locker-paragraph">
                    This badge means that the liquidity pool lockin time has
                    ended, and the owner have the possibility to withdraw locked
                    liquidity at any moment in time. Note that unlocked
                    liquidity means that you cannot sell the coin or token and
                    will experience <b>Impermanent Loss (IL).</b>
                  </p>
                </div>
              </div>
              <div className="d-flex p-3 locker-modal-item justify-content-center gap-2 align-items-start">
                <img src={pairGrey} className="locker-modal-icon" alt="" />
                <div className="d-flex flex-column align-items-start gap-2">
                  <span className="modal-locker-active-tag">Inactive</span>
                  <h6 className="modal-locker-liquidity">Liquidity Unlocked</h6>
                  <p className="modal-locker-paragraph">
                    This badge means that lockin time ended and liquidity pool
                    has been withdrawn. Note that unlocked liquidity means that
                    you cannot sell the coin or token and will experience{" "}
                    <b>Impermanent Loss (IL).</b>
                  </p>
                </div>
              </div>
              {/* <div
                className="row m-0 justify-content-center m-4"
                style={{ gap: 100, alignItems: "flex-start" }}
              >
                <div>
                  <h6 className="info-title">Active – Liquidity Locked</h6>
                  <br />
                  <p className="info-text">
                    This badge means that the liquidity pool is locked and safe.
                    Owner of the pool cannot withdraw the liquidity until the
                    locking time ends.
                  </p>
                </div>
              </div>
              <hr />
              <div
                className="row m-0 justify-content-center m-4"
                style={{ gap: 100, alignItems: "flex-start" }}
              >
                <img
                  src={pairOrange}
                  className="locker-modal-icon"
                  alt=""
                  style={{ width: 112, height: "115" }}
                />
                <div>
                  <h6 className="info-title">
                    Active – Potential Liquidity Unlock
                  </h6>
                  <br />
                  <p className="info-text">
                    This badge means that the liquidity pool locking time has
                    ended, and the owner have the possibility to withdraw locked
                    liquidity at any moment in time. Note that unlocked
                    liquidity means that you cannot sell the coin or token and
                    will experience Impermanent Loss (IL).
                  </p>
                </div>
              </div>
              <hr />
              <div
                className="row m-0 justify-content-center m-4"
                style={{ gap: 100, alignItems: "flex-start" }}
              >
                <img
                  src={pairGrey}
                  className="locker-modal-icon"
                  alt=""
                  style={{ width: 112, height: "115" }}
                />
                <div>
                  <h6 className="info-title">Inactive – Liquidity Unlocked</h6>
                  <br />
                  <p className="info-text">
                    This badge means that locking time ended and liquidity pool
                    has been withdrawn. Note that unlocked liquidity means that
                    you cannot sell the coin or token and will experience
                    Impermanent Loss (IL).
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </OutsideClickHandler>
    </Modal>
  );
};

export default InfoModal;
