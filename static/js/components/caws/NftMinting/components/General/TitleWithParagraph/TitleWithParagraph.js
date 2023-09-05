import React from 'react'
import PropTypes from 'prop-types'
import './_titleWithParagraph.scss'

const TitleWithParagraph = ({ children, isMain, isCenter }) => {
    return (
        <div className={` ${isMain ? 'common-title-main' : ""} 
        ${isCenter ? "center-text" : ""} common-title-text`}>
            {children}
        </div>
    )
}
TitleWithParagraph.propTypes = {
    children: PropTypes.node,
    isMain: PropTypes.bool,
    isCenter: PropTypes.bool

}

export default TitleWithParagraph