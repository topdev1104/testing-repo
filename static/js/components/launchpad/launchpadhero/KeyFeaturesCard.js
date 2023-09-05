import React from 'react'
import firstKeyIcon from '../assets/firstKeyIcon.svg'


const KeyFeaturesCard = ({icon, content, plansClass}) => {
  return (
    <div className={`key-features-card ${plansClass} p-3 d-flex flex-column gap-1`}>
    <div className="key-icon-container d-flex align-items-center justify-content-center">
      <img src={require(`../assets/${icon}.svg`).default} alt="" />
    </div>
    <span className="key-features-content">{content}</span>
</div>
  )
}

export default KeyFeaturesCard