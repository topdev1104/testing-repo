import React from 'react'

const VideoCard = ({title, onSelect, thumbnail, walletName, walletImage, active}) => {
  return (
    <div className={`video-card p-2 ${active && 'selected-video-card'}`} onClick={onSelect}>
    <div className="video-card-image-wrapper">
        <img src={require(`./assets/vids/${thumbnail}`).default} width={140} height={80}  alt="" />
    </div>
    <div className="d-flex flex-column gap-2 mt-2">
        <span className="video-card-title">{title.length < 15 ? title : title.slice(0,15) + "..."}</span>
        <div className="d-flex align-items-center gap-2">
            <img src={require(`./assets/buydypItems/${walletImage}`).default} height={15} width={15} alt="" className="" />
            <span className="video-card-time">{walletName}</span>
        </div>
    </div>
</div>
  )
}

export default VideoCard