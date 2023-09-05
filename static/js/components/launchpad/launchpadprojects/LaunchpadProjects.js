import React from "react";
import "./launchpadprojects.css";
import timerIcon from "../assets/timerIcon.svg";
import projectBanner from "../assets/activeProjectBanner.webp";
import UpcomingProjects from "./UpcomingProjects";
import commingSoon from '../assets/commingSoonTag.svg'
import ProjectsLaunched from "./ProjectsLaunched";

const LaunchpadProjects = () => {
  return (
    <div className="projects-container d-flex flex-column gap-5">
      <div className="active-projects d-none">
        
        <h6 className="launchpad-hero-title mb-4">Active Projects</h6>
        <div className="row align-items-center justify-content-end">
          <div className="col-12 col-lg-11 active-projects-container p-3 position-relative">
            <img src={projectBanner} alt="" className="project-banner " />
            <img src={commingSoon} alt="" className="comming-soon " />
            <div className="row align-items-center justify-content-end">
              <div className="col-12 col-lg-9 ps-lg-5 d-flex flex-column gap-3">
                <div className="d-flex gap-3 flex-column flex-lg-row align-items-start justify-content-between">
                  <div className="d-flex flex-column gap-3">
                     <h6 className="active-projects-title">Dypius</h6>
                     <p className="launchpad-hero-desc">
                  Dypius is a powerful, decentralized ecosystem build on
                  next-gen infrastructure.
                </p>
                  </div>
                  <div className="project-timer-wrapper ms-5 ms-lg-0 d-flex align-items-center gap-3 position-relative">
                    <img src={timerIcon} alt="" className="timer-icon" />
                    <span className="time-left">Time left:</span>
                    <span className="project-timer">00:00:00</span>
                  </div>
                </div>
                
                <div className="d-flex flex-column flex-lg-row align-items-center gap-3 gap-lg-5">
                  <div className="d-flex align-items-center gap-2">
                    <span className="time-left">Start time:</span>
                    <span className="project-date">12.06.2022</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="time-left">End time:</span>
                    <span className="project-date">12.06.2022</span>
                  </div>
                </div>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center align-items-lg-end gap-3 gap-lg-0">
                <div className="active-project-info p-3">
                  <div className="d-flex flex-column flex-lg-row align-items-start gap-3 gap-lg-5">
                    <div className="d-flex flex-column gap-2">
                      <span className="time-left">Tokens offered</span>
                      <span className="project-date">420,000,000.0000 DYP</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <span className="time-left">Sale price</span>
                      <span className="project-date">1 DYP = 0.18 USDT</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <span className="time-left">Toal commited</span>
                      <span className="project-date">7,534,403.5465 DYP</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <span className="time-left">Participants</span>
                      <span className="project-date">260,343</span>
                    </div>
                  </div>
                </div>
                <button className="btn filledbtn">View More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UpcomingProjects />
      {/* <ProjectsLaunched /> */}
    </div>
  );
};

export default LaunchpadProjects;
