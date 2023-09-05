import Modal from "../general/Modal";
import axios from "axios";
import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import RelatedNews from "./RelatedNews";
import OutsideClickHandler from "react-outside-click-handler";
import VotePassive from "./assets/votepassive.svg";
import Upvote from "./assets/upvote.svg";
import Downvote from "./assets/downvote.svg";
import Clock from "./assets/clock.svg";
import ToolTip from "./ToolTip";
import goBackArrow from "./assets/goBackArrow.svg";
import passiveUpvote from "./assets/passiveUpvote.svg";
import passiveDownvote from "./assets/passiveDownvote.svg";
import activeUpvote from "./assets/activeUpvote.svg";
import activeDownvote from "./assets/activeDownvote.svg";
import calendar from "../newsCard/assets/calendar.svg";
import newsReddit from "./assets/newsReddit.svg";
import newsShare from "./assets/newsShare.svg";
import newsTelegram from "./assets/newsTelegram.svg";
import newsTwitter from "./assets/newsTwitter.svg";
import sourceLinkIcon from "./assets/sourceLinkIcon.svg";

import { useState } from "react";

const NewsModal = ({
  title,
  image,
  content,
  newsId,
  latestNewsData,
  pressData,
  theme,
  onHandleUpvote,
  onHandleDownvote,
  onSelectOtherNews,
  onHandlePressDownvote,
  onHandlePressUpvote,
  isConnected,
  upvotes,
  downvotes,
  month,
  day,
  year,
  link,
  onModalClose,
  isPremium,
  coinbase,
  fullDate,
  bal1,
  bal2,
  bal3,
}) => {
  const getItemsWithoutCurrentItem = (currentItemId, arrayOfItems) => {
    return arrayOfItems.filter((item) => item?.id !== currentItemId);
  };
  const elementRef = useRef();
  const [height, setHeight] = useState(0);
  const [likeIndicator, setLikeIndicator] = useState(false);
  const [dislikeIndicator, setDislikeIndicator] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [votes, setVotes] = useState([]);

  const [alreadyVoted, setalreadyVoted] = useState(true);
  const [canVote, setCanVote] = useState(false);
  const [newContent, setnewContent] = useState(content);

  useEffect(() => {
    if (elementRef.current.clientHeight !== 0) {
      setHeight(elementRef.current.clientHeight);
      setDislikeIndicator(false);
      setLikeIndicator(false);
    }

    if (content !== undefined && content.includes("&nbsp")) {
      setnewContent(content.replace(/&nbsp;/g, " "));
    } else setnewContent(content);
  }, [newsId, content, elementRef.current?.clientHeight]);

  const logout = localStorage.getItem("logout");

  useEffect(() => {
    if (bal1 === "0" && bal2 === "0" && bal3 === "0" && isPremium === true) {
      setCanVote(true);
    } else if (
      bal1 !== "0" &&
      bal2 !== "0" &&
      bal3 !== "0" &&
      isPremium === true
    ) {
      setCanVote(true);
    } else if (
      (bal1 !== "0" || bal2 !== "0" || bal3 !== "0") &&
      isPremium === false
    ) {
      setCanVote(true);
    } else if (
      bal1 === "0" &&
      bal2 === "0" &&
      bal3 === "0" &&
      isPremium === false
    ) {
      setCanVote(false);
    } else if (logout === "true") {
      setCanVote(false);
    }
  }, [alreadyVoted, bal1, bal2, bal3, isPremium, logout, coinbase]);

  const handleLikeStates = () => {
    if (
      logout === "false" &&
      (bal1 !== "0" || bal2 !== "0" || bal3 !== "0" || isPremium !== false)
    ) {
      checkUpVoting(newsId);
    } else {
      setShowTooltip(true);
    }
    if (
      (bal1 === "0" && bal2 === "0" && bal3 === "0" && isPremium === false) ||
      logout === "true" ||
      alreadyVoted === false
    ) {
      setLikeIndicator(false);
      setDislikeIndicator(false);
      setShowTooltip(true);
    } else {
      if (likeIndicator === true) {
        setLikeIndicator(false);
        // onHandlePressDownvote(newsId);
      } else if (likeIndicator === false) {
        setLikeIndicator(true);
        setDislikeIndicator(false);
        // onHandlePressUpvote(newsId);
      }
    }
  };

  const handleDisLikeStates = () => {
    if (
      logout === "false" &&
      (bal1 !== "0" || bal2 !== "0" || isPremium !== false)
    ) {
      checkDownVoting(newsId);
    } else {
      setShowTooltip(true);
    }
    if (
      (bal1 === "0" && bal2 === "0" && isPremium === false) ||
      logout === "true" ||
      alreadyVoted === false
    ) {
      setLikeIndicator(false);
      setShowTooltip(true);
    } else {
      if (dislikeIndicator === true) {
        setDislikeIndicator(false);
        // onHandlePressUpvote(newsId);
      } else if (dislikeIndicator === false) {
        // onHandlePressDownvote(newsId);
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
          fetchVotingdata().then();
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
          fetchVotingdata();
        } else {
          setalreadyVoted(false);
          setShowTooltip(true);
          setLikeIndicator(false);
          setDislikeIndicator(false);
        }
      })
      .catch(console.error);
  };

  const fetchVotingdata = async () => {
    const result = await fetch(
      `https://news-manage.dyp.finance/api/v1/votes/all`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setVotes(data.Data);
      })
      .catch(console.error);

    return result;
  };

  useEffect(() => {
    fetchVotingdata();
  }, [newsId]);

  var options = { year: "numeric", month: "short", day: "numeric" };

  const formattedDate = new Date(fullDate);

  return (
    <>
      <div className="newmodal col-8 ps-0">
        <div className="news-modal">
          <div className="details-modal-content">
            <div className="left-col" ref={elementRef}>
              <div className="d-flex flex-column justify-content-start align-items-start gap-3">
                {/* <div className="backbtn" onClick={onModalClose}>
                <i className="fas fa-arrow-left" style={{ color: "white" }}></i>
              </div> */}
                <div className="d-flex align-items-center justify-content-between w-100">
                  <button
                    className="btn go-back-btn d-flex align-items-center gap-2"
                    onClick={onModalClose}
                  >
                    <img src={goBackArrow} alt="goback" />
                    <span className="go-back-text">Go Back</span>
                  </button>
                  <div className="date-wrapper">
                    <img src={calendar} alt="calendar" />
                    <span className="news-date-text">
                      {formattedDate.toLocaleDateString("en-US", options)}
                    </span>
                  </div>
                </div>
                <h2 className="left-col-title" style={{ fontSize: 20 }}>
                  {title}
                </h2>
                {/* <div
                className="social-share-parent"
                style={{
                  display: "inline-block",
                  position: "relative",
                }}
              >

                <button
                  className="btn v3"
                  style={{
                    background: "linear-gradient(to right, #ee0979, #ff6a00)",
                    padding: '1px 10px',
                    height: 30
                  }}
                >
                  <i className="fas fa-share-alt"></i>
                </button>
                 */}

                {/* </div> */}
              </div>
              <img
                src={image}
                alt=""
                className="left-col-image"
                style={{ padding: "20px 0" }}
              />
              <div className="news-bottom-wrapper mb-3 justify-content-between">
                <div className="d-flex">
                  <a
                    className="resp-sharing-button__link"
                    href={`https://twitter.com/intent/tweet/?text=${title}&url=${`https://app.dypius.com/news/${newsId}`}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label=""
                  >
                    <img src={newsTwitter} alt="twitter share" />
                  </a>

                  <a
                    className="resp-sharing-button__link"
                    href={`https://reddit.com/submit/?&url=${`https://app.dypius.com/news/${newsId}`}&resubmit=true&title=${title}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label=""
                  >
                    {/* <div className="resp-sharing-button resp-sharing-button--reddit resp-sharing-button--small">
                    <div
                      aria-hidden="true"
                      className="resp-sharing-button__icon resp-sharing-button__icon--solid"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-6.07-1.72.08-1.1.4-3.05 1.52-3.7.72-.4 1.73-.24 3 .5C17.2 6.3 18.46 7.5 20 7.5c1.65 0 3-1.35 3-3s-1.35-3-3-3c-1.38 0-2.54.94-2.88 2.22-1.43-.72-2.64-.8-3.6-.25-1.64.94-1.95 3.47-2 4.55-2.33.08-4.45.7-6.1 1.72C4.86 8.98 3.96 8.5 3 8.5c-1.65 0-3 1.35-3 3 0 1.32.84 2.44 2.05 2.84-.03.22-.05.44-.05.66 0 3.86 4.5 7 10 7s10-3.14 10-7c0-.22-.02-.44-.05-.66 1.2-.4 2.05-1.54 2.05-2.84zM2.3 13.37C1.5 13.07 1 12.35 1 11.5c0-1.1.9-2 2-2 .64 0 1.22.32 1.6.82-1.1.85-1.92 1.9-2.3 3.05zm3.7.13c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9.8 4.8c-1.08.63-2.42.96-3.8.96-1.4 0-2.74-.34-3.8-.95-.24-.13-.32-.44-.2-.68.15-.24.46-.32.7-.18 1.83 1.06 4.76 1.06 6.6 0 .23-.13.53-.05.67.2.14.23.06.54-.18.67zm.2-2.8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5.7-2.13c-.38-1.16-1.2-2.2-2.3-3.05.38-.5.97-.82 1.6-.82 1.1 0 2 .9 2 2 0 .84-.53 1.57-1.3 1.87z" />
                      </svg>
                    </div>
                  </div> */}
                    <img src={newsReddit} alt="reddit share" />
                  </a>

                  <a
                    className="resp-sharing-button__link"
                    href={`https://telegram.me/share/url?url=${`https://app.dypius.com/news/${newsId}&text=${title}`}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label=""
                  >
                    {/* <div className="resp-sharing-button resp-sharing-button--telegram resp-sharing-button--small">
                    <div
                      aria-hidden="true"
                      className="resp-sharing-button__icon resp-sharing-button__icon--solid"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M.707 8.475C.275 8.64 0 9.508 0 9.508s.284.867.718 1.03l5.09 1.897 1.986 6.38a1.102 1.102 0 0 0 1.75.527l2.96-2.41a.405.405 0 0 1 .494-.013l5.34 3.87a1.1 1.1 0 0 0 1.046.135 1.1 1.1 0 0 0 .682-.803l3.91-18.795A1.102 1.102 0 0 0 22.5.075L.706 8.475z" />
                      </svg>
                    </div>
                  </div> */}
                    <img src={newsTelegram} alt="telegram share" />
                  </a>
                  <img
                    src={newsShare}
                    alt="share news"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `https://app.dypius.com/news/${newsId}`
                      )
                    }
                    style={{ margin: "0.5em" }}
                  />
                </div>
              </div>

              <p
                // style={{ maxWidth: 520 }}
                className="left-col-content"
                dangerouslySetInnerHTML={{ __html: newContent }}
              ></p>
              {/* <div
                className="d-flex w-100 align-items-center"
                style={{ gap: 20 }}
              >
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
                  <span>
                    {Number(votes.find((obj) => obj.id === newsId)?.up) -
                      Number(votes.find((obj) => obj.id === newsId)?.down)}
                  </span>

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
                    onClick={() => {
                      handleDisLikeStates();
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

              <div className="d-flex align-items-center justify-content-between mt-5">
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
                    {/* {Number(upvotes) - Number(downvotes)} */}
                    {Number(votes.find((obj) => obj.id === newsId)?.up) -
                      Number(votes.find((obj) => obj.id === newsId)?.down)}
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
                {/* <p>
              Source:{" "}
              <a href={link} target="_blank">
                <u>click here</u>
              </a>
            </p> */}
                <div className="d-flex align-items-center gap-2">
                  <img src={sourceLinkIcon} alt="source link" />
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="source-link"
                  >
                    Source link
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-4 pe-0">
        <div className="right-col position-relative w-100">
          <div
            className="purplediv"
            style={{ left: "0px", top: "20px", background: "#8E97CD" }}
          ></div>
          <div className="d-flex align-items-center gap-2 mt-2">
            <img src={require(`./assets/relatedNewsIcon.svg`).default} alt="" />
            <h3 className="related-news-side-title">Top voted news</h3>
          </div>
          <div className="related-news-wrapper">
            {latestNewsData.length > 0 &&
              getItemsWithoutCurrentItem(newsId, latestNewsData)
                .slice(0, parseInt(height / 127))
                .map((item, key) => {
                  if (item !== undefined) {
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          window.scrollTo(0, 0);
                        }}
                      >
                        <RelatedNews
                          newsId={item.id}
                          theme={theme}
                          title={item.title}
                          date={item.date}
                          month={item.month}
                          year={item.year}
                          link={item.link}
                          bal1={bal1}
                          bal2={bal2}
                          bal3={bal3}
                          upvotes={
                            votes.length !== 0
                              ? votes.find((obj) => obj.id === item.id)?.up !==
                                undefined
                                ? votes.find((obj) => obj.id === item.id)?.up
                                : 0
                              : 0
                          }
                          downvotes={
                            votes.length !== 0
                              ? votes.find((obj) => obj.id === item.id)
                                  ?.down !== undefined
                                ? votes.find((obj) => obj.id === item.id)?.down
                                : 0
                              : 0
                          }
                          image={item.image}
                          onSelectOtherNews={onSelectOtherNews}
                          onHandleDownvote={onHandleDownvote}
                          onHandleUpvote={onHandleUpvote}
                          isConnected={isConnected}
                          isPremium={isPremium}
                          onVotesFetch={fetchVotingdata}
                          coinbase={coinbase}
                        />
                      </div>
                    );
                  }
                })}
          </div>
        </div>
      </div>
    </>
  );
};
NewsModal.propTypes = {
  modalId: PropTypes.string,
  visible: PropTypes.bool,
  onModalClose: PropTypes.func,
  onSelectOtherNews: PropTypes.func,
};

export default NewsModal;
