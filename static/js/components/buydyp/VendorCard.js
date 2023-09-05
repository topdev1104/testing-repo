import React from 'react'

const VendorCard = ({videoAmount, logo, title, onSelect, active, link}) => {
  return (
    <div className={`vendor-card p-3 ${active && 'selected-vendor-card'}`} onClick={onSelect}>
    <div className="d-flex align-items-start justify-content-between gap-2 gap-lg-0">
        <a href={link} target={"_blank"} className="vendor-image-wrapper">
            <img src={require(`./assets/${logo}`).default} width={64} height={64} alt="" />
        </a>
        <span className="video-amount">{videoAmount}</span>
    </div>
    <h6 className="vendor-title mt-2">{title}</h6>
    <hr className="form-divider my-2" style={{height: '2px'}} />
    <div className="d-flex align-items-center justify-content-between">
        <span className="tutorial-text">View video tutorials</span>
        <img src={require('../newsCard/assets/filledArrow.svg').default} alt="" />
    </div>
</div>
  )
}

export default VendorCard