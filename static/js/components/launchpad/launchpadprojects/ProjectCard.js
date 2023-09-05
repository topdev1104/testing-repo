import React from 'react'
import './launchpadprojects.css'
import rocketIcon from '../assets/rocketIcon.svg'
import lockIcon from '../assets/lockIcon.svg'
import rightArrow from '../../dashboard/assets/right-arrow.svg'
import expiredTag from '../assets/expiredTag.svg'
import { NavLink } from 'react-router-dom'

const ProjectCard = ({upcoming, expired, id}) => {

  return (
    // <NavLink to={`launchpad/details/${id}`}>
      <div className={`launchpad-project-card d-flex flex-column p-0  ${upcoming === true && 'upcoming-project'}`}>
        <div className="project-header d-flex flex-column justify-content-center gap-5 p-3">
          <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <img src={rocketIcon} alt="" />
            <div className="d-flex flex-column gap-1">
              <div className="ido-goal">IDO Goal</div>
              <div className="ido-amount">100K</div>
            </div>
          </div>
          {expired === true && <img src={expiredTag} alt='expired' className='expired-tag' /> }
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex flex-column gap-1">
              <span className="ido-start">Start</span>
              <span className="green-underline"></span>
              <span className="ido-date">TBA</span>
            </div>
            <img src={lockIcon} alt="" />
            <div className="d-flex flex-column gap-1">
              <span className="ido-end">End</span>
              <span className="orange-underline"></span>
              <span className="ido-date">TBA</span>
            </div>
          </div>
        </div>
        <div className="project-card-footer d-flex justify-content-between align-items-end p-3">
          <p className="time-left">Dypius Launchpad
Project coming soon</p>
          <div className="d-flex align-items-center justify-content-center arrow-wrapper">
            <img src={rightArrow} alt="" />
          </div>
        </div>
    </div>
    // </NavLink>
  )
}

export default ProjectCard