import Modal from "../../../../../Modal/Modal";
import React from 'react'
import PropTypes from "prop-types"

const NftLoadingModal = ({ visible, onSuccessClick, onCancelClick, setIsVisible }) => {
    return (
        <Modal visible={visible} modalId='formModal' setIsVisible={setIsVisible}>
            <div className="loading-modal-content">
                <div className="spinner-border " role="status">
                    {/* <img src={require("../../../../../assets/General/spinner-img.png")} alt="" /> */}
                    <span className="sr-only">Loading...</span>
                </div>
                <h1 className="loading-modal-content-title">
                    MINTING...
                </h1>
                <p className="loading-modal-content-text">
                    We are currently minting your CAW(s). This modal can be closed once minting is complete.

                    Please DO NOT refresh the page in the meantime!
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

NftLoadingModal.propTypes = {
    visible: PropTypes.bool,
    onSuccessClick: PropTypes.func,
    onCancelClick: PropTypes.func,
}

export default NftLoadingModal