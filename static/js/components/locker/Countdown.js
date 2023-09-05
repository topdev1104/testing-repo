import React from "react";
import Countdown from "react-countdown";
import { PropTypes } from "prop-types";

const renderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}) => {
  if (completed) {
    return <span style={{color: '#4ED5D2'}}>00:00:00:00</span>;
  } else
    return (
      <div className="d-flex justify-content-between flex-column">
        <div className="countdown-indicators">
          <span style={{color: '#F36D46'}}>{days < 10 ? "0" + days : days}</span>
          <span style={{color: '#F36D46'}}>:</span>
          <span style={{color: '#F36D46'}}>{hours < 10 ? "0" + hours : hours}</span>
          <span style={{color: '#F36D46'}}>:</span>
          <span style={{color: '#F36D46'}}>{minutes < 10 ? "0" + minutes : minutes}</span>
          <span style={{color: '#F36D46'}}>:</span>
          <span style={{color: '#F36D46'}}>{seconds < 10 ? "0" + seconds : seconds}</span>
        </div>
      </div>
    );
};

const CountDownTimer = ({ date }) => {
  return <Countdown date={date} renderer={renderer} />;
};

CountDownTimer.propTypes = {
  date: PropTypes.any,
};

export default CountDownTimer;
