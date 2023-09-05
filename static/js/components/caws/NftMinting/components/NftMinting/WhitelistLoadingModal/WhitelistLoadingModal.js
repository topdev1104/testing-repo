import Modal from "../../../../../Modal/Modal";
import React from 'react'
import PropTypes from "prop-types"

const WhitelistLoadingModal = ({ visible, onSuccessClick, onCancelClick, setIsVisible }) => {
    return (
        <Modal visible={visible} modalId='whitelistFormModal' setIsVisible={setIsVisible}>
            <div className="loading-modal-content">
                <div className="spinner-border " role="status">
                    {/* <img src={require("../../../../../assets/General/spinner-img.png")} alt="" /> */}
                    <span className="sr-only">Loading...</span>
                </div>
                <h1 className="loading-modal-content-title">
                    COME BACK LATER...
                </h1>
                <p className="loading-modal-content-text">
                    We are currently minting for the whitelisted members. Please COME BACK in 4 hours if you would like to mint!
                </p>
                <div className="loading-modal-content-buttons">
                    <button onClick={onSuccessClick} className="btn btn-primary" data-dismiss="modal">
                        Ok
                    </button>
                    <button onClick={onCancelClick} className="btn btn-outline-primary" data-dismiss="modal">
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    )


}

WhitelistLoadingModal.propTypes = {
    visible: PropTypes.bool,
    onSuccessClick: PropTypes.func,
    onCancelClick: PropTypes.func,
}

export default WhitelistLoadingModal