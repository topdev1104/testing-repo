import React from "react";
import "./launchpad.css";
import whiteArrow from './assets/whiteArrow.svg'
import BenefitsCard from "./BenefitsCard";
import { NavLink } from "react-router-dom";

const Benefits = () => {

  const benefits = [
    {
      icon: 'benefitsExposure',
      title: 'Exposure to Dypius community around the world'
    },
    {
      icon: 'benefitsCustomer',
      title: 'Real-time token distribution to all token user holders'
    },
    {
      icon: 'benefitsContact',
      title: 'Team tokens locked on vesting contracts'
    },
    {
      icon: 'benefitsLocker',
      title: 'Outstanding liquidity lock solution via DYP Locker'
    },
  ]

  return (
    <div className="row gap-4 gap-lg-0 px-3 mt-5">
      <div className="col-12 col-lg-6 d-flex flex-column launch-project justify-content-start justify-content-xl-end align-items-end p-4 gap-5">
        <h6 className="launch-project-title">
          Launch your project with Dypius now!
        </h6>
        <NavLink to='/launchpad/form'  className="btn success-button d-flex align-items-center gap-2" style={{fontWeight: '500', fontSize: '12px', lineHeight: '18px'}}>
          Apply Now
          <img src={whiteArrow} alt="" />
        </NavLink >
      </div>
      <div className="col-12 col-lg-6 benefits px-0 px-lg-4">
        <div className="d-flex align-items-center justify-content-end">
          <h6 className="launchpad-hero-title">Benefits</h6>
        </div>
        <div className="benefits-card-container mt-0 mt-xxl-5">
        {benefits.map((item) => (
          <BenefitsCard title={item.title} icon={item.icon} />
        ))}
        </div>
      </div>
    </div>
  );
};

export default Benefits;
