import React, { useEffect, useState } from "react";
import axios from "axios";
import ToolTip from "./ToolTip";
import OutsideClickHandler from "react-outside-click-handler";
import CircularProgress from "@material-ui/core/CircularProgress";
import passiveUpvote from "./assets/passiveUpvote.svg";
import passiveDownvote from "./assets/passiveDownvote.svg";
import activeUpvote from "./assets/activeUpvote.svg";
import activeDownvote from "./assets/activeDownvote.svg";
import calendar from "../newsCard/assets/calendar.svg";

const RelatedNews = ({
  title,
  month,
  date,
  year,
  link,
  image,
  theme,
  onSelectOtherNews,
  newsId,
  upvotes,
  downvotes,
  isConnected,
  onHandleUpvote,
  onHandleDownvote,
  onDownVoteClick,
  isPremium,
  onVotesFetch,
  coinbase,
  bal1,
  bal2,
  bal3,
}) => {
  const [likeIndicator, setLikeIndicator] = useState(false);
  const [dislikeIndicator, setDislikeIndicator] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [alreadyVoted, setalreadyVoted] = useState(true);
  const [canVote, setCanVote] = useState(false);
  const [upvote, setUpvote] = useState(upvotes);
  const [downvote, setDownvote] = useState(downvotes);

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
      (bal1 !== '0' || bal2 !== '0' || bal3 !== '0' || isPremium !== false)
    ) {
      checkUpVoting(newsId);
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
      if (likeIndicator === true) {
        setLikeIndicator(false);
        onHandleDownvote(newsId);
      } else if (likeIndicator === false) {
        setLikeIndicator(true);
        onHandleUpvote(newsId);
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
      setShowTooltip(true);
    } else {
      if (dislikeIndicator === true) {
        setDislikeIndicator(false);
        // onHandleUpvote(newsId);
      } else if (dislikeIndicator === false) {
        // onHandleDownvote(newsId);
        setLikeIndicator(false);
        setDislikeIndicator(true);
      }
    }
  };

  var options = { year: "numeric", month: "short", day: "numeric" };

  const formattedDate = new Date(date);

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

  if (title === undefined) {
    return (
      <div
        style={{ padding: "60px", display: "flex", justifyContent: "center" }}
      >
        <CircularProgress color="inherit" size={75} />
      </div>
    );
  }
  return (
    <div style={{ display: title?.includes("http") ? "none" : "block" }}>
      <div className="single-related-news-wrapper">
        <div
          className="d-flex  justify-content-center gap-3"
          style={{ gap: 5 }}
        >
          <img
            src={image}
            alt=""
            className="singlenews-image"
            onClick={() => {
              onSelectOtherNews(newsId);
              setLikeIndicator(false);
              setDislikeIndicator(false);
            }}
          />
          <div className="date-wrapper-press" style={{ gap: 15 }}>
            <h6
              className="related-subnews-title"
              onClick={() => {
                onSelectOtherNews(newsId);
                setLikeIndicator(false);
                setDislikeIndicator(false);
              }}
            >
              {title}
            </h6>
            {/* <div className="news-bottom-wrapper">
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
                    />
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
                  {month} {date} {year}
                </h6>
              </div>
            </div> */}
            {/* <div className="d-flex align-items-center justify-content-center gap-2">
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
                  />
                </OutsideClickHandler>
              ) : (
                <></>
              )}
              <span className="votes-amount"> {Number(upvotes) - Number(downvotes)}</span>
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
                  {Number(upvotes) - Number(downvotes)}
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
    </div>
  );
};

export default RelatedNews;
