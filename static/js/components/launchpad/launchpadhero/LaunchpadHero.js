import React from 'react'
import './launchpadhero.css'
import gotoIndicator from '../assets/gotoIndicator.svg'
import medalIcon from '../assets/medalIcon.svg'
import rightArrow from '../../dashboard/assets/right-arrow.svg'
import goldMedal from '../assets/goldMedal.svg'
import { NavLink } from 'react-router-dom'
import firstKeyIcon from '../assets/firstKeyIcon.svg'
import KeyFeaturesCard from './KeyFeaturesCard'


const LaunchpadHero = () => {

  const keyFeatures = [
    {
      icon: 'firstKeyIcon',
      content: 'Project mission, outline, detailed reports and more'
    },
    {
      icon: 'secondKeyIcon',
      content: 'Multiple tiers depending on the amount of locked DYP'
    },
    {
      icon: 'thirdKeyIcon',
      content: 'Varied max token buy available at different tiers'
    },
    {
      icon: 'fourthKeyIcon',
      content: 'Increase tier by depositing assets to Launchpools'
    },
  ]

  
  return (
    <>
    <div className="row gap-4 gap-lg-0 align-items-center justify-content-between">
        <div className="col-12 col-lg-5 d-flex flex-column gap-5">
            <div className="d-flex flex-column gap-3">
            <h6 className="launchpad-hero-title">Dypius Launchpad</h6>
            <p className="launchpad-hero-desc">Join Dypius, a powerful, decentralized ecosystem with a focus on scalability, security, and global adoption through next-gen infrastructure. The Launchpad enables projects to raise capital in a decentralized environment per DYP Tools to deliver the highest security for users.</p>
            </div>
            {/* <div className="d-flex justify-content-start align-items-center gap-5">
                <a className="goto-button d-flex align-items-center gap-2">Projects  <img src={gotoIndicator} alt="" /></a>
                <a className="goto-button d-flex align-items-center gap-2">Launch Form <img src={gotoIndicator} alt="" /></a>
            </div> */}
        </div>
        <div className="col-12 col-lg-6 tier-level-wrapper p-3">
        <div className="row gap-3 gap-lg-0 align-items-center">
          <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          <div className="d-flex align-items-center gap-2">
            <img src={medalIcon} alt="" />
            <h6 className="launchpad-hero-title">
              My Tier Level
            </h6>
          </div>
          <p className="launchpad-hero-desc">
          Discover your Launchpad tier and check how much you are eligible to benefit. Increase your tier by depositing assets to Launchpools.
          </p>
          <NavLink to="/launchpad/tiers" className="view-more-title d-flex justify-content-center align-items-center gap-1">
            View all
            <img src={rightArrow} alt="" />
          </NavLink>
          </div>
          <div className="col-12 col-lg-3 current-tier-wrapper current-tier-hero-wrapper selected-tier-wrapper d-flex flex-column align-items-center justify-content-start gap-2 position-relative p-3">
            <span className="current-tier">Tier</span>
            <h6 className="current-tier-title">Gold</h6>
            {/* <h6 className="tier-title">2</h6> */}
            <img src={require(`../assets/goldBadge.svg`).default} alt="" className='tier-medal' />
          </div>
        </div>
        </div>
    </div>
    <h6 className="launchpad-hero-title" style={{marginTop: '85px'}}>Key features</h6>
    <div className="features-wrapper d-flex align-items-center justify-content-between my-5 flex-column flex-lg-row gap-3 gap-lg-0">
     {keyFeatures.map((item) => (
      <KeyFeaturesCard icon={item.icon} content={item.content} /> 
     ))}
    </div>
    </>
  )
}

export default LaunchpadHero