import React, { useState, useEffect } from "react";
import axios from "axios";
import ToolTip from "./ToolTip";
import OutsideClickHandler from "react-outside-click-handler";
import passiveUpvote from './assets/passiveUpvote.svg'
import passiveDownvote from './assets/passiveDownvote.svg'
import activeUpvote from './assets/activeUpvote.svg'
import activeDownvote from './assets/activeDownvote.svg'
import calendar from '../newsCard/assets/calendar.svg'

const PressRealease = ({
  title,
  image,
  date,
  link,
  onSinglePressHighlightClick,
  isPremium,
  newsId,
  upvotes,
  downvotes,
  isConnected,
  onDownVoteClick,
  onUpVoteClick,
onVotesFetch,
votes,
coinbase, bal1, bal2, bal3
}) => {
  const [likeIndicator, setLikeIndicator] = useState(false);
  const [dislikeIndicator, setDislikeIndicator] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [alreadyVoted, setalreadyVoted] = useState(true);
  const [canVote, setCanVote] = useState(false);
  const [upvote, setUpvote] = useState(upvotes);
  const [downvote, setDownvote] = useState(downvotes);
  // const [votes, setVotes] = useState([])

  const logout = localStorage.getItem("logout");

  useEffect(() => {
    if (bal1 === '0' && bal2 === '0' && bal3 === '0' && isPremium === true) {
      setCanVote(true);
    } else if (bal1 !== '0' && bal2 !== '0'  && bal3 !== '0' && isPremium === true) {
      setCanVote(true);
    } else if ((bal1 !== '0' || bal2 !== '0' || bal3 !== '0') && isPremium === false) {
      setCanVote(true);
    } else if (bal1 === '0' && bal2 === '0' && bal3 === '0' && isPremium === false) {
      setCanVote(false);
    } else if (logout === "true") {
      setCanVote(false);
    }
  }, [alreadyVoted, bal1, bal2, bal3, isPremium, logout, coinbase]);


  const handleLikeStates = () => {
    if (logout === "false" && (bal1 !== '0' || bal2 !== '0' || bal3 !== '0' || isPremium !== false)) {
      checkUpVoting(newsId);
    }
    else {setShowTooltip(true);}
    if (
      (bal1 === '0' && bal2 === '0' && bal3 === '0' && isPremium === false) ||
      logout === "true" || alreadyVoted === false
    ) {
      setLikeIndicator(false);
      setShowTooltip(true);
      setDislikeIndicator(false);

    } else {
      if (likeIndicator === true) {
        setLikeIndicator(false);
        // onDownVoteClick(newsId);
      } else if (likeIndicator === false) {
        setLikeIndicator(true);
        setDislikeIndicator(false);
        // onUpVoteClick(newsId);
      }
    }
  };

  const handleDisLikeStates = () => {
    if (logout === "false" && (bal1 !== '0' || bal2 !== '0' || bal3 !== '0' || isPremium !== false)) {
      checkDownVoting(newsId);
    }
    else {setShowTooltip(true);}
    if (
      (bal1 === '0' && bal2 === '0'  && bal3 === '0' && isPremium === false) ||
      logout === "true" || alreadyVoted === false
    ) {
      setLikeIndicator(false);
      setShowTooltip(true);
    } else {
      if (dislikeIndicator === true) {
        setDislikeIndicator(false);
        // onUpVoteClick(newsId);
      } else if (dislikeIndicator === false) {
        // onDownVoteClick(newsId);
        setLikeIndicator(false);
        setDislikeIndicator(true);
      }
    }
  };



  const checkUpVoting = async (itemId) => {

    return await axios
      .get(
        `https://news-manage.dyp.finance/api/v1/vote/${itemId}/${coinbase}/up`
      )
      .then((data) => {

        if (data.data.status === "success") {

          // onVotesFetch()

          setUpvote(upvote + 1)

        } else {
          setalreadyVoted(false);
          setShowTooltip(true)
          setLikeIndicator(false)
        }
      })
      .catch(console.error);
  };

  const checkDownVoting = async (itemId) => {

    return await axios
      .get(
        `https://news-manage.dyp.finance/api/v1/vote/${itemId}/${coinbase}/down`
      )
      .then((data) => {

        if (data.data.status === "success") {
          // onVotesFetch()

            setDownvote(downvote + 1)

        } else {
          setalreadyVoted(false);
          setShowTooltip(true)
          setLikeIndicator(false)
          setDislikeIndicator(false)

        }
      })
      .catch(console.error);
  };

  // const fetchVotingdata = async () => {
  //   const result = await fetch(
  //     `https://news-manage.dyp.finance/api/v1/votes/all`
  //   )
  //     .then((res) => {
  //       return res.json();
  //     })
  //     .then((data) => {
  //       setVotes(data.Data);
  //     })
  //     .catch(console.error);

  //   return result;
  // };

  // useEffect(() => {
  //   fetchVotingdata();
  // }, []);

  var options = { year: "numeric", month: "short", day: "numeric" };

  const formattedDate = new Date(date)

  return (
    <div className="single-press-wrapper" onClick={onSinglePressHighlightClick}>
      <div
        className="d-flex justify-content-center flex-column flex-lg-row gap-3"
        // style={{ gap: 20, height: "100%", width: "100%" }}
      >
        <img src={image} alt="" className="press-image" />
        <div className="date-wrapper-press">
          {/* <a href={link} target="_blank"> */}
          <h6 className="press-title">{title?.slice(0,50) + '...'}</h6>
          {/* </a> */}

          <div
            className="d-flex align-items-center gap-3 position-relative"
          >
            <div className="d-flex align-items-center justify-content-center gap-2 ">
              <img
                src={
                  likeIndicator === false && dislikeIndicator === false
                  ? passiveUpvote
                  : likeIndicator === true
                  ? activeUpvote
                  : passiveUpvote
                }
                alt=""
                className="like-indicator"
                onClick={(e) => {
                  handleLikeStates();
                  e.stopPropagation();
                }}
              />

              <span className="votes-amount">
                {Number(upvote) - Number(downvote)}
              </span>
              <img
              style={{transform: 'rotate(0deg)'}}
                src={
                  likeIndicator === false && dislikeIndicator === false
                    ? passiveDownvote
                    : dislikeIndicator === true
                    ? activeDownvote
                    : passiveDownvote
                }
                alt=""
                className="like-indicator"
                id="dislike"
                onClick={(e) => {
                  handleDisLikeStates();
                  e.stopPropagation();
                }}
              />

            </div>
            {/* <img
              src={theme === "theme-dark" ? WhiteDots : Dots}
              alt=""
              style={{ width: "auto" }}
            /> */}
            <div className="date-wrapper">
              <img src={calendar} alt="calendar"  />
              <span className="news-date-text">
              {formattedDate.toLocaleDateString("en-US", options)}
              </span>
            </div>
            {showTooltip === true ? (
                <OutsideClickHandler
                  onOutsideClick={() => {
                    setShowTooltip(false);
                  }}
                >
                  <ToolTip
                    status={
                      logout === "false" && canVote === false
                          ? "You need to be holding DYP to vote"
                          : logout === 'true'
                         ? "Please connect your wallet"
                         :   alreadyVoted === true && canVote === true
                         ? "You have already voted"
                         : "You have already voted"
                    }
                    style={{ width: 195 }}
                  />
                </OutsideClickHandler>
              ) : (
                <></>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressRealease;
