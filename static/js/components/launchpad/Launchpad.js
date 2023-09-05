import React from 'react'
import Benefits from './Benefits'
import './launchpad.css'
import LaunchpadHero from './launchpadhero/LaunchpadHero'
import LaunchpadProjects from './launchpadprojects/LaunchpadProjects'

const Launchpad = () => {
  return (
    <div className="container-lg launchpad-screen-wrapper p-0">
      <LaunchpadHero />
      <LaunchpadProjects />
      <Benefits />
    </div>
  )
}

export default Launchpad