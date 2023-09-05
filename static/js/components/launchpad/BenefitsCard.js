import React from 'react'
import benefitsAudit from './assets/benefitsAudit.svg'

const BenefitsCard = ({title, icon}) => {
  return (
    <div className="benefits-card d-flex align-items-center gap-2 p-2">
        <div className="icon-wrapper d-flex align-items-center justify-content-center">
            <img src={require(`./assets/${icon}.svg`).default} alt="" />
        </div>
        <span className="benefits-desc">{title}</span>
    </div>
  )
}

export default BenefitsCard