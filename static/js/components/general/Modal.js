import React from 'react'
import PropTypes from "prop-types"
import Close from './close.svg'

const Modal = ({ modalId, visible, children, setIsVisible, onModalClose, maxWidth }) => {
    let className = 'modal fade ' ;
    let style = {}
    if(visible){
        className += ' show' ;
        style= {display: 'block', }
    }


    

    return (
        <div className={className} id={modalId} style={style} tabIndex="-1" aria-labelledby={`modalLabel` + modalId} aria-hidden="true">
            <div className="modal-dialog"
             style={{maxWidth: maxWidth}}
             >
                <div className="modal-content">
                    {/* <img src={require("../../../Assets/General/times-icon.svg").default} alt="" aria-hidden="true" className="close" data-dismiss="modal" aria-label="Close" /> */}
                    <span onClick={onModalClose} aria-hidden="true" data-dismiss="modal" aria-label="Close" className='close-btn'>
                        <img src={Close} alt='' className='close-icon'/>
                    </span>
                    {children}
                </div>
            </div>
        </div>
    )
}
Modal.defaultProps = {
    setIsVisible: () => {}
}
Modal.propTypes = {
    modalId: PropTypes.string,
    children: PropTypes.element,
    visible: PropTypes.bool,
    onModalClose: PropTypes.func
}


export default Modal