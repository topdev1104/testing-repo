import React, { useState, useEffect } from "react";
import axios from "axios";
import ToolTip from "./ToolTip";
import OutsideClickHandler from "react-outside-click-handler";
import passiveUpvote from "./assets/passiveUpvote.svg";
import passiveDownvote from "./assets/passiveDownvote.svg";
import activeUpvote from "./assets/activeUpvote.svg";
import activeDownvote from "./assets/activeDownvote.svg";
import calendar from "../newsCard/assets/calendar.svg";

const SingleNews = ({
  title,
  image,
  link,
  month,
  day,
  year,
  onNewsClick,
  theme,
  upvotes,
  downvotes,
  isConnected,
  onSingleUpVoteClick,
  onSingleDownVoteClick,
  fullDate,
  isPremium,
  newsId,
  onVotesFetch,
  coinbase,
  bal1,
  bal2,
  bal3,
  votes
}) => {
  const [likeIndicator, setLikeIndicator] = useState(false);
  const [dislikeIndicator, setDislikeIndicator] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [alreadyVoted, setalreadyVoted] = useState(true);
  const [canVote, setCanVote] = useState(false);
  const [upvote, setUpvote] = useState(upvotes);
  const [downvote, setDownvote] = useState(downvotes);
  // const [votes, setVotes] = useState([]);

  const logout = localStorage.getItem("logout");

  useEffect(() => {
    if (bal1 === '0' && bal2 === '0' && bal3 === '0' && isPremium === true) {
      setCanVote(true);
    } else if (bal1 !== '0' && bal2 !== '0' && bal3 !== '0' && isPremium === true) {
      setCanVote(true);
    } else if (
      (bal1 !== '0' || bal2 !== '0' || bal3 !== '0') &&
      isPremium === false
    ) {
      setCanVote(true);
    } else if (bal1 === '0' && bal2 === '0' && bal3 === '0' && isPremium === false) {
      setCanVote(false);
    } else if (logout === "true") {
      setCanVote(false);
    }
  }, [alreadyVoted, bal1, bal2, bal3, isPremium, logout, coinbase]);

  const handleLikeStates = () => {
    if (
      logout === "false" &&
      (bal1 !== '0' || bal2 !== '0'  || bal3 !== '0' || isPremium !== false)
    ) {
      checkUpVoting(newsId);
    } else {
      setShowTooltip(true);
    }
    if (
      (bal1 === '0' && bal2 === '0'  && bal3 === '0' && isPremium === false) ||
      logout === "true" ||
      alreadyVoted === false
    ) {
      setLikeIndicator(false);
      setDislikeIndicator(false);
      setShowTooltip(true);
    } else {
      if (likeIndicator === true) {
        setLikeIndicator(false);
        // onSingleDownVoteClick();
      } else if (likeIndicator === false) {
        setLikeIndicator(true);
        setDislikeIndicator(false);
        // onSingleUpVoteClick();
      }
    }
  };

  const handleDisLikeStates = () => {
    if (
      logout === "false" &&
      (bal1 !== '0' || bal2 !== '0' || bal3 !== '0' || isPremium !== false)
    ) {
      checkDownVoting(newsId);
    } else {
      setShowTooltip(true);
    }
    if (
      (bal1 === '0' && bal2 === '0' && bal3 === '0' && isPremium === false) ||
      logout === "true" ||
      alreadyVoted === false
    ) {
      setLikeIndicator(false);
      setDislikeIndicator(false);

      setShowTooltip(true);
    } else {
      if (dislikeIndicator === true) {
        setDislikeIndicator(false);
        // onSingleUpVoteClick();
      } else if (dislikeIndicator === false) {
        // onSingleDownVoteClick();
        setDislikeIndicator(true);
        setLikeIndicator(false);
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
          setUpvote(upvote + 1);
        } else {
          setalreadyVoted(false);
          setShowTooltip(true);
          setLikeIndicator(false);
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
          setDownvote(downvote + 1);
        } else {
          setalreadyVoted(false);
          setShowTooltip(true);
          setLikeIndicator(false);
          setDislikeIndicator(false);
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

  const formattedDate = new Date(fullDate);

  return (
    <div className="singlenews-body">
      <div className="row m-0 justify-content-between" style={{ gap: 20 }}>
        <div className="singlenews-wrapper px-0">
          {/* <a href={link} target={"_blank"}> */}
          <h4 className="rightside-news-title" onClick={onNewsClick}>
            {title}
          </h4>
          {/* </a> */}

          {/* <div className="news-bottom-wrapper justify-content-between">
            <div className="like-wrapper">
              <img
                src={
                  likeIndicator === false && dislikeIndicator === false
                  ? VotePassive
                  : likeIndicator === true
                  ? Upvote
                  : VotePassive
                }
                alt=""
                className="like-indicator"
                onClick={(e) => {
                  handleLikeStates();
                  e.stopPropagation();
                }}
              />
              {showTooltip === true ? (
                <OutsideClickHandler
                  onOutsideClick={() => {
                    setShowTooltip(false);
                  }}
                >
                  <ToolTip status={
                    logout === "false" && canVote === false
                          ? "You need to be holding DYP to vote"
                          : logout === 'true'
                         ? "Please connect your wallet"
                         :   alreadyVoted === true && canVote === true
                         ? "You have already voted"
                         : "You have already voted"
                  }/>
                </OutsideClickHandler>
              ) : (
                <></>
              )}
            <span> {Number(upvotes) - Number(downvotes)}</span>

              <img
                src={
                  likeIndicator === false && dislikeIndicator === false
                  ? VotePassive
                  : dislikeIndicator === true
                  ? Downvote
                  : VotePassive
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

            <div className="date-wrapper">
              <img src={Clock} alt="" style={{ width: "auto" }} />
              <h6 className="date-content">
                {month} {day} {year}
              </h6>
            </div>
          </div> */}
          <div
            className="news-bottom-wrapper"
            style={{ justifyContent: "space-between" }}
          >
            <div className="d-flex align-items-center justify-content-center gap-2 position-relative">
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
                {" "}
                {Number(upvote) - Number(downvote)}
              </span>
              <img
                style={{ transform: "rotate(0deg)" }}
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
                        : logout === "true"
                        ? "Please connect your wallet"
                        : alreadyVoted === true && canVote === true
                        ? "You have already voted"
                        : "You have already voted"
                    }
                  />
                </OutsideClickHandler>
              ) : (
                <></>
              )}
            </div>
            {/* <img
              src={theme === "theme-dark" ? WhiteDots : Dots}
              alt=""
              style={{ width: "auto" }}
            /> */}
            <div className="date-wrapper">
              <img src={calendar} alt="calendar" />
              <span className="news-date-text">
                {formattedDate.toLocaleDateString("en-US", options)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleNews;
