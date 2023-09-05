import React from "react";
import filledArrow from './assets/filledArrow.svg'
import newsShadow from './assets/newsShadow2.png'
import calendar from './assets/calendar.svg'
import './newscard.css'

const NewsCard = ({image, title, link, date}) => {


  var options = { year: "numeric", month: "short", day: "numeric" };

  const formattedDate = new Date(date)
  return (
    <a href={`https://app.dypius.com/news/${link}`} className="newscard-wrapper d-flex p-0">
      <div className="d-flex flex-column gap-3 position-relative w-100">
        <div className="position-relative">
        <img src={newsShadow} className="news-shadow d-none d-xxl-flex" alt="" />
        <div className="d-flex align-items-center gap-2 news-date">
          <img src={calendar} alt="" />
          <span style={{fontSize: '10px', fontWeight: '400', lineHeight: '15px', color: '#DBD9FF'}}>{formattedDate.toLocaleDateString("en-US", options)}</span>
        </div>
        <img src={image} alt='' className="newsimg"/>
        </div>
        <div className="d-flex justify-content-between align-items-end pb-2 pb-lg-0 px-2 mt-2">
        <h6 className="nc-title">{title?.slice(0, 40) + '...'}</h6>
        <img src={filledArrow} alt=''/>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
