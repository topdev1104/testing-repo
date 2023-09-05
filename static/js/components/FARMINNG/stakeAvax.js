import React, { useState, useEffect } from "react";
import moment from "moment";
import getFormattedNumber from "../../functions/getFormattedNumber2";
import Modal from "../Modal/Modal";
import Address from "./address";
import WalletModal from "../WalletModal";
import "./top-pools.css";
import { shortAddress } from "../../functions/shortAddress";
import ellipse from "./assets/ellipse.svg";
import Clipboard from "react-clipboard.js";
import failMark from "../../assets/failMark.svg";
import ReactTooltip from "react-tooltip";
import arrowup from "./assets/arrow-up.svg";
import moreinfo from "./assets/more-info.svg";
import purplestats from "./assets/purpleStat.svg";
import referralimg from "./assets/referral.svg";
import copy from "./assets/copy.svg";
import wallet from "./assets/wallet.svg";
import Tooltip from "@material-ui/core/Tooltip";
import Countdown from "react-countdown";
import statsLinkIcon from "./assets/statsLinkIcon.svg";
import poolsCalculatorIcon from "./assets/poolsCalculatorIcon.svg";
import { ClickAwayListener } from "@material-ui/core";
import { handleSwitchNetworkhook } from "../../functions/hooks";
import axios from "axios";

const renderer = ({ days, hours, minutes, seconds }) => {
  return (
    <div className="d-flex gap-3 justify-content-center align-items-center">
      <div className="d-flex gap-1 align-items-baseline">
        <span>{days < 10 ? "0" + days : days}</span>
        <span style={{ fontSize: "13px" }}>days</span>
      </div>
      <div className="d-flex gap-1 align-items-baseline">
        <span>{hours < 10 ? "0" + hours : hours}</span>
        <span style={{ fontSize: "13px" }}>hours</span>
      </div>
      <div className="d-flex gap-1 align-items-baseline">
        <span>{minutes < 10 ? "0" + minutes : minutes}</span>
        <span style={{ fontSize: "13px" }}>minutes</span>
      </div>
      <span className="d-none">{seconds < 10 ? "0" + seconds : seconds}</span>
      <span className="d-none">seconds</span>
    </div>
  );
};

const StakeAvax = ({
  staking,
  is_wallet_connected,
  apr,
  liquidity = "ETH",
  lock,
  expiration_time,
  other_info,
  fee_s,
  fee_u,
  chainId,
  handleConnection,
  lockTime,
  listType,
  handleSwitchNetwork,
  expired,
  finalApr,
  the_graph_result,
  lp_id,
  coinbase,
  referrer,
}) => {
  let {
    reward_token,
    BigNumber,
    alertify,
    reward_token_idyp,
    reward_token_daiavax,
    token_dypsavax,
  } = window;
  let token_symbol = "DYP";
  let reward_tokenn = reward_token;
  // token, staking

  const TOKEN_DECIMALS = window.config.token_decimals;

  function download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  function jsonToCsv(items) {
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(items[0]);
    let csv = items.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    );
    csv.unshift(header.join(","));
    csv = csv.join("\r\n");
    return csv;
  }

  window.handleDownload = ({
    stakers,
    stakingTimes,
    lastClaimedTimes,
    stakedTokens,
  }) => {
    let list = [];
    stakers.forEach((staker, index) => {
      list.push({
        staker_address: staker,
        staking_timestamp_unix: stakingTimes[index],
        lastclaimed_timestamp_unix: lastClaimedTimes[index],
        staking_time: getDate(stakingTimes[index] * 1e3),
        lastclaimed_time: getDate(lastClaimedTimes[index] * 1e3),
        staked_tokens: stakedTokens[index],
      });
    });
    download("stakers-list.csv", jsonToCsv(list));

    function getDate(timestamp) {
      let a = new Date(timestamp);
      return a.toUTCString();
    }
  };

  const [token_balance, settoken_balance] = useState("...");
  const [pendingDivs, setpendingDivs] = useState("");
  const [totalEarnedTokens, settotalEarnedTokens] = useState("");
  const [cliffTime, setcliffTime] = useState("");
  const [stakingTime, setstakingTime] = useState("");
  const [depositedTokens, setdepositedTokens] = useState("");
  const [lastClaimedTime, setlastClaimedTime] = useState("");
  const [reInvestLoading, setreInvestLoading] = useState(false);
  const [reInvestStatus, setreInvestStatus] = useState("initial");
  const [depositAmount, setdepositAmount] = useState("");
  const [withdrawAmount, setwithdrawAmount] = useState("");
  const [depositLoading, setdepositLoading] = useState(false);
  const [depositStatus, setdepositStatus] = useState("initial");
  const [claimLoading, setclaimLoading] = useState(false);
  const [claimStatus, setclaimStatus] = useState("initial");
  const [withdrawLoading, setwithdrawLoading] = useState(false);
  const [withdrawStatus, setwithdrawStatus] = useState("initial");
  const [coinbase2, setcoinbase] = useState(
    "0x0000000000000000000000000000000000000111"
  );
  const [tvl, settvl] = useState("");
  const [referralFeeEarned, setreferralFeeEarned] = useState("");
  const [stakingOwner, setstakingOwner] = useState(null);
  const [approxDeposit, setapproxDeposit] = useState(100);
  const [approxDays, setapproxDays] = useState(365);
  const [showCalculator, setshowCalculator] = useState(false);
  const [usdPerToken, setusdPerToken] = useState("");
  const [errorMsg, seterrorMsg] = useState("");
  const [errorMsg2, seterrorMsg2] = useState("");
  const [errorMsg3, seterrorMsg3] = useState("");
  const [contractDeployTime, setcontractDeployTime] = useState("");
  const [disburseDuration, setdisburseDuration] = useState("");
  const [tvlDyps, setsettvlDyps] = useState(0);
  const [settotal_stakers, setsettotal_stakers] = useState("");

  const [show, setshow] = useState(false);
  const [showWithdrawModal, setshowWithdrawModal] = useState(false);
  const [popup, setpopup] = useState(false);
  const [apy1, setapy1] = useState(false);
  const [apy2, setapy2] = useState(false);
  const [performanceTooltip, setperformanceTooltip] = useState(false);
  const [aprTooltip, setaprTooltip] = useState(false);
  const [lockTooltip, setlockTooltip] = useState(false);
  const [depositTooltip, setdepositTooltip] = useState(false);
  const [rewardsTooltip, setrewardsTooltip] = useState(false);
  const [withdrawTooltip, setwithdrawTooltip] = useState(false);
  const [tokendata, settokendata] = useState();
  const [tvlUSD, settvlUSD] = useState(0)
  const [passivePool, setPassivePool] = useState(false);

  const showModal = () => {
    setshow(true);
  };

  const hideModal = () => {
    setshow(true);
  };

  const showPopup = () => {
    setpopup(true);
  };

  const hidePopup = () => {
    setpopup(false);
  };

 const refreshBalance = async () => {
    let coinbase = coinbase2;

    if (window.coinbase_address) {
      coinbase = window.coinbase_address;
      setcoinbase(coinbase) 
    }

    let lp_data =  the_graph_result.token_data;
    //console.log({lp_data})

    //Calculate APY
  

    try {
      let _bal = reward_token.balanceOf(coinbase);
      let _pDivs = staking.getTotalPendingDivs(coinbase);

      let _tEarned = staking.totalEarnedTokens(coinbase);

      let _stakingTime = staking.stakingTime(coinbase);

      let _dTokens = staking.depositedTokens(coinbase);

      let _lClaimTime = staking.lastClaimedTime(coinbase);

      let _tvl = reward_token.balanceOf(staking._address);

      let _rFeeEarned = staking.totalReferralFeeEarned(coinbase);

      let tStakers = staking.getNumberOfHolders();
      
      //Take DAI Balance on Staking
      let _tvlConstantDAI = reward_token_daiavax.balanceOf(
        staking._address
      ); /* TVL of DAI on Staking */

      //Take DYPS Balance
      let _tvlDYPS = token_dypsavax.balanceOf(
        staking._address
      ); /* TVL of DYPS */

      let [
        token_balance,
        pendingDivs,
        totalEarnedTokens,
        stakingTime,
        depositedTokens,
        lastClaimedTime,
        tvl,
        referralFeeEarned,
        total_stakers,
        tvlConstantDAI,
        tvlDYPS,
      ] = await Promise.all([
        _bal,
        _pDivs,
        _tEarned,
        _stakingTime,
        _dTokens,
        _lClaimTime,
        _tvl,
        _rFeeEarned,
        tStakers,
        _tvlConstantDAI,
        _tvlDYPS,
      ]);

      //console.log({tvl, tvlConstantiDYP, _amountOutMin})

      let usdValueDAI = new BigNumber(tvlConstantDAI).toFixed(18);
      let usd_per_lp = lp_data
        ? lp_data[window.reward_token["_address"]].token_price_usd
        : 0;

      let tvlUSD = new BigNumber(tvl)
        .times(usd_per_lp)
        .plus(usdValueDAI)
        .toFixed(18);
settvlUSD(tvlUSD)
      //console.log({tvlUSD}) 
      let tvlDyps = new BigNumber(tvlDYPS).times(tokendata).toFixed(18);
      
      setsettvlDyps(tvlDyps)
      let balance_formatted = new BigNumber(token_balance ).div(1e18).toString(10)
      settoken_balance(balance_formatted) ;

      let divs_formatted = new BigNumber(pendingDivs).div(1e18).toFixed(6);
      setpendingDivs(divs_formatted);

      let earnedTokens_formatted = new BigNumber(totalEarnedTokens)
        .div(1e18)
        .toFixed(6);
      settotalEarnedTokens(earnedTokens_formatted);

      setstakingTime(stakingTime);

      let depositedTokens_formatted = new BigNumber(depositedTokens).div(1e18).toString(10)

      setdepositedTokens(depositedTokens_formatted);

    setlastClaimedTime(lastClaimedTime);
    let tvl_formatted =  new BigNumber(tvl).div(1e18)
    settvl(tvl_formatted)

    setreferralFeeEarned(referralFeeEarned);
    setsettotal_stakers(total_stakers);

      let stakingOwner = await staking.owner();
      setstakingOwner(stakingOwner) 
    } catch (e) {
      console.error(e);
    }

    staking
      .LOCKUP_TIME()
      .then((cliffTime) => {
        setcliffTime(Number(cliffTime)) 
      })
      .catch(console.error);

    staking.contractStartTime().then((contractDeployTime) => {
      setcontractDeployTime(contractDeployTime) 
    });

    staking.REWARD_INTERVAL().then((disburseDuration) => {
      setdisburseDuration(disburseDuration)
      
    });
  };



  useEffect(() => {
    if (coinbase !== coinbase2 && coinbase !== null && coinbase !== undefined) {
      setcoinbase(coinbase);
    }
    if (
      staking &&
      staking._address === "0x6eb643813f0b4351b993f98bdeaef6e0f79573e9"
    ) {
      setPassivePool(true);
    }
    getTotalTvl();
  }, [coinbase, coinbase2]);

  useEffect(() => {
    refreshBalance();
    if (depositAmount !== "") {
      checkApproval(depositAmount);

    }
  }, [coinbase, coinbase2, staking]);

  useEffect(() => {
      setdepositAmount('');
      setdepositStatus('initial')

  }, [ staking]);

  const getTotalTvl = async () => {
    let apy1 = 15;

    let apy2 = 30;
    setapy1(apy1);
    setapy2(apy2);
  };

  const handleApprove = async (e) => {
    if (passivePool === false) {
    setdepositLoading(true);

    if (other_info) {
      window.$.alert("This pool no longer accepts deposits!");
      setdepositLoading(false);
      return;
    }

    let amount = depositAmount;
    amount = new BigNumber(amount).times(1e18).toFixed(0);
    await reward_tokenn
      .approve(staking._address, amount)
      .then(() => {
        setdepositLoading(false);
        setdepositStatus("deposit");
        refreshBalance();
      })
      .catch((e) => {
        setdepositLoading(false);
        setdepositStatus("fail");
        seterrorMsg(e?.message);
        setTimeout(() => {
          depositAmount("");
          setdepositStatus("initial");
          seterrorMsg("");
        }, 2000);
      });
    }
    else if (passivePool === true) {
      window.$.alert("This pool no longer accepts deposits!");
      return;
    }
  };

  const handleStake = async (e) => {
    if (passivePool === false) {
    setdepositLoading(true);
    if (other_info) {
      window.$.alert("This pool no longer accepts deposits!");
      setdepositLoading(false);

      return;
    }

    let amount = depositAmount;
    amount = new BigNumber(amount).times(1e18).toFixed(0);
    let referrer = window.config.ZERO_ADDRESS;
 
    await staking
      .stake(amount, referrer)
      .then(() => {
        setdepositLoading(false);
        setdepositStatus("success");
        refreshBalance();
      })
      .catch((e) => {
        setdepositLoading(false);
        setdepositStatus("fail");
        seterrorMsg(e?.message);
        setTimeout(() => {
          depositAmount("");
          setdepositStatus("fail");
          seterrorMsg("");
        }, 10000);
      });
    }
    else if (passivePool === true) {
      window.$.alert("This pool no longer accepts deposits!");
      return;
    }
  };

  const handleWithdraw = async (e) => {
    // e.preventDefault();
    setwithdrawLoading(true);

    let amount = new BigNumber(withdrawAmount).times(1e18).toFixed(0)
    
    await staking
      .unstake(amount)
      .then(() => {
        setwithdrawLoading(false);
        setwithdrawStatus("success");
        refreshBalance();
      })
      .catch((e) => {
        setwithdrawLoading(false);
        setwithdrawStatus("failed");
        seterrorMsg3(e?.message);

        setTimeout(() => {
          setwithdrawStatus("initial");
          seterrorMsg3("");
          setwithdrawAmount("");
        }, 10000);
      });
  };

  const handleClaimDivs = () => {
    setclaimLoading(true);

    staking
      .claim()
      .then(() => {
        setclaimStatus("success");
        setclaimLoading(false);
        setpendingDivs(getFormattedNumber(0, 6));
        refreshBalance();
        setTimeout(() => {
          setclaimStatus("initial");
        }, 2000);

      })
      
      .catch((e) => {
        setclaimStatus("failed");
        setclaimLoading(false);
        seterrorMsg2(e?.message);

        setTimeout(() => {
          setclaimStatus("initial");
          seterrorMsg2("");
        }, 2000);
      });
  };

  const handleSetMaxDeposit = () => {
    const depositAmount = token_balance;
    checkApproval(token_balance);

    setdepositAmount(depositAmount);
  };

  const handleSetMaxWithdraw = async (e) => {
    // e.preventDefault();
    let amount;
    await staking.depositedTokens(coinbase).then((data)=>{
      amount = data
    })

    let depositedTokens_formatted = new BigNumber(amount).div(1e18).toString(10)
    setwithdrawAmount(depositedTokens_formatted);
  };
  const getAPY = () => {
    return apr;
  };

  const getUsdPerETH = () => {
    return the_graph_result.usd_per_eth || 0;
  };

  const getApproxReturn = () => {
    let APY = getAPY() - fee_s;

    return ((approxDeposit * APY) / 100 / 365) * approxDays;
  };

  const getReferralLink = () => {
    return window.location.origin + window.location.pathname + "?r=" + coinbase;
  };

 const handleAvaxPool = async () => {
    await handleSwitchNetworkhook("0xa86a")
      .then(() => {
        this.props.handleSwitchNetwork("43114");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleReinvest = () => {
    setreInvestStatus("invest");
    setreInvestLoading(true);

    staking
      .reInvest()
      .then(() => {
        setreInvestStatus("success");
        setreInvestLoading(false);
        setpendingDivs(getFormattedNumber(0, 6));
        refreshBalance();
      })
      .catch((e) => {
        setreInvestStatus("failed");
        setreInvestLoading(false);
        seterrorMsg2(e?.message);

        setTimeout(() => {
          setreInvestStatus("initial");
          seterrorMsg2("");
        }, 2000);
      });
  };

  const convertTimestampToDate = (timestamp) => {
    const result = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(timestamp);
    return result;
  };

  let id = Math.random().toString(36);

  const performanceOpen = () => {
    setperformanceTooltip(true);
  };
  const performanceClose = () => {
    setperformanceTooltip(false);
  };
  const aprOpen = () => {
    setaprTooltip(true);
  };
  const aprClose = () => {
    setaprTooltip(false);
  };
  const lockOpen = () => {
    setlockTooltip(true);
  };
  const lockClose = () => {
    setlockTooltip(false);
  };
  const depositOpen = () => {
    setdepositTooltip(true);
  };
  const depositClose = () => {
    setdepositTooltip(false);
  };
  const rewardsOpen = () => {
    setrewardsTooltip(true);
  };
  const rewardsClose = () => {
    setrewardsTooltip(false);
  };
  const withdrawOpen = () => {
    setwithdrawTooltip(true);
  };
  const withdrawClose = () => {
    setwithdrawTooltip(false);
  };

  const focusInput = (field) => {
    document.getElementById(field).focus();
  };

  let showDeposit = true;

  if (!isNaN(disburseDuration) && !isNaN(contractDeployTime)) {
    let lastDay = parseInt(disburseDuration) + parseInt(contractDeployTime);
    let lockTimeExpire = parseInt(Date.now()) + parseInt(cliffTime);
    lockTimeExpire = lockTimeExpire.toString().substr(0, 10);
    //console.log("now " + lockTimeExpire)
    //console.log('last ' + lastDay)
    if (lockTimeExpire > lastDay) {
      showDeposit = false;
    }
  }

  let cliffTimeInWords = "lockup period";

  let canWithdraw = true;
  if (lockTime === "No Lock") {
    canWithdraw = true;
  }
  if (!isNaN(cliffTime) && !isNaN(stakingTime)) {
    if (
      (Number(stakingTime) + Number(cliffTime) >= Date.now()/1000) &&
      lockTime !== "No Lock"
    ) {
      canWithdraw = false;
      cliffTimeInWords = moment
        .duration(cliffTime - (Date.now() - stakingTime))
        .humanize(true);
    }
  }
  // console.log(convertTimestampToDate((Number(stakingTime) + Number(cliffTime)) * 1000), convertTimestampToDate(Date.now()));
  // let tvl_usd = tvl * tokendata;

  // let tvlDYPS = tvlDyps / 1e18;

  // tvl_usd = tvl_usd + tvlDYPS;

  // tvl_usd = getFormattedNumber(tvl_usd, 2);
 
  //let tvl_usd = this.state.tvl / 1e18 * this.state.usdPerToken
  let tvl_usd =  tvlUSD / 1e18;
  const first = getFormattedNumber(tvl,6).replace(',','')
  const finalTvlUsd = Number(first) * usdPerToken

  // let tvlDYPS2 = tvlDyps / 1e18;
  // tvl_usd = tvl_usd + tvlDYPS2;
  
  // tvl_usd = getFormattedNumber(tvl_usd, 2); 

  const checkApproval = async (amount) => {
    const result = await window
      .checkapproveStakePool(coinbase, reward_tokenn._address, staking._address)
      .then((data) => {
        console.log(data);
        return data;
      });

      let result_formatted = new BigNumber(result)
      .div(1e18)
      .toFixed(6);


    if (Number(result_formatted) >= Number(amount) && Number(result_formatted) !== 0) {
      setdepositStatus("deposit");
    } else {
      setdepositStatus("initial");
    }
  };

  const getUsdPerDyp = async () => {
    await axios
      .get("https://api.dyp.finance/api/the_graph_eth_v2")
      .then((data) => {
        const propertyiDyp = Object.entries(
          data.data.the_graph_eth_v2.token_data
        );
        settokendata(propertyiDyp[0][1].token_price_usd);
        return propertyiDyp[0][1].token_price_usd;
      });
  };

  const getPriceDYP = async () => {
    let usdPerToken = await window.getPrice("defi-yield-protocol");
    setusdPerToken(usdPerToken)
  };


  useEffect(() => {
      getUsdPerDyp()
      getPriceDYP();
  }, [coinbase, popup, show]);

  return (
    <div className="container-lg p-0">
      <div
        className={`allwrapper ${listType === "table" && "my-4"}`}
        style={{
          border: listType !== "table" && "none",
          borderRadius: listType !== "table" && "0px",
        }}
      >
        <div className="leftside2 w-100">
          <div className="activewrapper">
            <div className="d-flex flex-column flex-lg-row w-100 align-items-start align-items-lg-center justify-content-between gap-3 gap-lg-5">
              <h6 className="activetxt">
                <img
                  src={ellipse}
                  alt=""
                  className="position-relative"
                  style={{ top: "-1px" }}
                />
                Active status
              </h6>

              <div className="d-flex flex-row-reverse flex-lg-row align-items-center justify-content-between earnrewards-container">
                <div className="d-flex flex-column flex-lg-row align-items-end align-items-lg-center gap-3 gap-lg-5">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <h6 className="earnrewards-text">Performance fee:</h6>
                    <h6 className="earnrewards-token d-flex align-items-center gap-1">
                      {fee_s}%
                      <ClickAwayListener onClickAway={performanceClose}>
                        <Tooltip
                          open={performanceTooltip}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          placement="top"
                          title={
                            <div className="tooltip-text">
                              {
                                "Performance fee is subtracted from the displayed APR."
                              }
                            </div>
                          }
                        >
                          <img
                            src={moreinfo}
                            alt=""
                            onClick={performanceOpen}
                          />
                        </Tooltip>
                      </ClickAwayListener>
                    </h6>
                  </div>

                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <h6 className="earnrewards-text">APR:</h6>
                    <h6 className="earnrewards-token d-flex align-items-center gap-1">
                      {finalApr}%
                      <ClickAwayListener onClickAway={aprClose}>
                        <Tooltip
                          open={aprTooltip}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          placement="top"
                          title={
                            <div className="tooltip-text">
                              {
                                "APR reflects the interest rate of earnings on an account over the course of one year. "
                              }
                            </div>
                          }
                        >
                          <img src={moreinfo} alt="" onClick={aprOpen} />
                        </Tooltip>
                      </ClickAwayListener>
                    </h6>
                  </div>
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <h6 className="earnrewards-text">Lock time:</h6>
                    <h6 className="earnrewards-token d-flex align-items-center gap-1">
                      {lockTime} {lockTime !== "No Lock" ? "Days" : ""}
                      <ClickAwayListener onClickAway={lockClose}>
                        <Tooltip
                          open={lockTooltip}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          placement="top"
                          title={
                            <div className="tooltip-text">
                              {
                                "The amount of time your deposited assets will be locked."
                              }
                            </div>
                          }
                        >
                          <img src={moreinfo} alt="" onClick={lockOpen} />
                        </Tooltip>
                      </ClickAwayListener>
                    </h6>
                  </div>
                </div>
                <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
                  <h6
                    className="bottomitems"
                    onClick={() => setshowCalculator(true)}
                  >
                    <img src={poolsCalculatorIcon} alt="" />
                    Calculator
                  </h6>
                  <a
                    href={
                      "https://app.pangolin.exchange/#/swap?&outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
                    }
                    target={"_blank"}
                    rel="noreferrer"
                  >
                    <h6 className="bottomitems">
                      <img src={arrowup} alt="" />
                      Get DYP
                    </h6>
                  </a>
                  <div
                    onClick={() => {
                      showPopup();
                    }}
                  >
                    <h6 className="bottomitems">
                      <img src={purplestats} alt="" />
                      Stats
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pools-details-wrapper d-flex m-0 container-lg border-0">
          <div className="row gap-4 gap-lg-0 w-100 justify-content-between">
            <div className="firstblockwrapper col-12 col-md-6 col-lg-2">
              <div
                className="d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between gap-4"
                style={{ height: "100%" }}
              >
                <h6 className="start-title">Start Staking</h6>

                {coinbase === null ||
                coinbase === undefined ||
                is_wallet_connected === false ? (
                  <button className="connectbtn btn" onClick={showModal}>
                    <img src={wallet} alt="" /> Connect wallet
                  </button>
                ) : chainId === "43114" ? (
                  <div className="addressbtn btn">
                    <Address a={coinbase} chainId={43114} />
                  </div>
                ) : (
                  <button
                    className="connectbtn btn"
                    onClick={() => {
                      handleAvaxPool();
                    }}
                  >
                    Change Network
                  </button>
                )}
              </div>
            </div>

            <div
              className={`otherside-border col-12 col-md-12 col-lg-4  ${
                chainId !== "43114" || expired === true ? "blurrypool" : ""
              }`}
            >
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <h6 className="deposit-txt">Deposit</h6>

                  <h6 className="mybalance-text">
                    Balance:
                    <b>
                      {token_balance !== "..."
                        ? getFormattedNumber(token_balance, 6)
                        : getFormattedNumber(0, 6)}{" "}
                      {token_symbol}
                    </b>
                  </h6>
                </div>
                <ClickAwayListener onClickAway={depositClose}>
                  <Tooltip
                    open={depositTooltip}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    placement="top"
                    title={
                      <div className="tooltip-text">
                        { lockTime === 'No Lock' ? 'The initial pool size is capped at 2.5M DYP. Additional opportunities to stake DYP are planned to be introduced over time.' :
                          "Deposit your assets to the staking smart contract. For lock time pools, the lock time resets if you add more deposits after making one previously."
                        }
                      </div>
                    }
                  >
                    <img src={moreinfo} alt="" onClick={depositOpen} />
                  </Tooltip>
                </ClickAwayListener>
              </div>
              <div className="d-flex flex-column gap-2 justify-content-between">
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="input-container px-0">
                    <input
                      type="number"
                      autoComplete="off"
                      value={
                        Number(depositAmount) > 0
                          ? depositAmount
                          : depositAmount
                      }
                      onChange={(e) => {
                        setdepositAmount(e.target.value);
                        checkApproval(e.target.value);
                      }}
                      placeholder=" "
                      className="text-input"
                      style={{ width: "100%" }}
                      name="amount_deposit"
                      id="amount_deposit"
                      key="amount_deposit"
                    />
                    <label
                      className="label"
                      onClick={() => {
                        focusInput("amount_deposit");
                      }}
                    >
                      Amount
                    </label>
                  </div>

                  <button className="btn maxbtn" onClick={handleSetMaxDeposit}>
                    Max
                  </button>

                  <button
                    disabled={
                      depositAmount === "" ||
                      depositLoading === true ||
                      depositStatus === "success"
                        ? true
                        : false
                    }
                    className={`btn filledbtn ${
                      depositAmount === "" &&
                      depositStatus === "initial" &&
                      "disabled-btn"
                    } ${
                      depositStatus === "deposit" || depositStatus === "success"
                        ? "success-button"
                        : depositStatus === "fail"
                        ? "fail-button"
                        : null
                    } d-flex justify-content-center align-items-center gap-2`}
                    onClick={() => {
                      depositStatus === "deposit"
                        ? handleStake()
                        : depositStatus === "initial" && depositAmount !== ""
                        ? handleApprove()
                        : console.log("");
                    }}
                  >
                    {depositLoading ? (
                      <div
                        class="spinner-border spinner-border-sm text-light"
                        role="status"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    ) : depositStatus === "initial" ? (
                      <>Approve</>
                    ) : depositStatus === "deposit" ? (
                      <>Deposit</>
                    ) : depositStatus === "success" ? (
                      <>Success</>
                    ) : (
                      <>
                        <img src={failMark} alt="" />
                        Failed
                      </>
                    )}
                  </button>
                </div>
                {errorMsg && <h6 className="errormsg">{errorMsg}</h6>}
              </div>
            </div>
            <div
              className={`otherside-border col-12 col-md-12 col-lg-4 ${
                chainId !== "43114" && "blurrypool"
              }`}
            >
              <div className="d-flex justify-content-between gap-2">
                <h6 className="withdraw-txt">Rewards</h6>
                <h6 className="withdraw-littletxt d-flex align-items-center gap-2">
                  Rewards are displayed in real-time
                  <ClickAwayListener onClickAway={rewardsClose}>
                    <Tooltip
                      open={rewardsTooltip}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      placement="top"
                      title={
                        <div className="tooltip-text">
                          {
                            "Rewards earned by your deposit to the staking smart contract are displayed in real-time. The reinvest function does not reset the lock-in period."
                          }
                        </div>
                      }
                    >
                      <img src={moreinfo} alt="" onClick={rewardsOpen} />
                    </Tooltip>
                  </ClickAwayListener>
                </h6>
              </div>

              <div className="form-row flex-column flex-lg-row d-flex gap-2 align-item-start align-items-lg-center justify-content-between">
                <div className="d-flex flex-column">
                  <span
                    style={{
                      fontWeight: "500",
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#c0c9ff",
                    }}
                  >
                    DYP
                  </span>
                  <span>{pendingDivs}</span>
                </div>
                <div className="claim-reinvest-container d-flex justify-content-between align-items-center gap-3">
                  <button
                    disabled={
                      claimStatus === "claimed" ||
                      claimStatus === "success" ||
                      pendingDivs <= 0
                        ? true
                        : false
                    }
                    className={`btn filledbtn ${
                      (claimStatus === "claimed" &&
                        claimStatus === "initial") ||
                      pendingDivs <= 0
                        ? "disabled-btn"
                        : claimStatus === "failed"
                        ? "fail-button"
                        : claimStatus === "success"
                        ? "success-button"
                        : null
                    } d-flex justify-content-center align-items-center gap-2`}
                    style={{ height: "fit-content" }}
                    onClick={handleClaimDivs}
                  >
                    {claimLoading ? (
                      <div
                        class="spinner-border spinner-border-sm text-light"
                        role="status"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    ) : claimStatus === "failed" ? (
                      <>
                        <img src={failMark} alt="" />
                        Failed
                      </>
                    ) : claimStatus === "success" ? (
                      <>Success</>
                    ) : (
                      <>Claim</>
                    )}
                  </button>
                  {expired === false && (
                    <button
                      disabled={pendingDivs > 0 ? false : true}
                      className={`btn outline-btn ${
                        reInvestStatus === "invest" || pendingDivs <= 0
                          ? "disabled-btn"
                          : reInvestStatus === "failed"
                          ? "fail-button"
                          : reInvestStatus === "success"
                          ? "success-button"
                          : null
                      } d-flex justify-content-center align-items-center gap-2`}
                      style={{ height: "fit-content" }}
                      onClick={handleReinvest}
                    >
                      {reInvestLoading ? (
                        <div
                          class="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      ) : reInvestStatus === "failed" ? (
                        <>
                          <img src={failMark} alt="" />
                          Failed
                        </>
                      ) : reInvestStatus === "success" ? (
                        <>Success</>
                      ) : (
                        <>Reinvest</>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {errorMsg2 && <h6 className="errormsg">{errorMsg2}</h6>}
            </div>
            <div
              className={`otherside-border col-12 col-md-12 col-lg-2 ${
                chainId !== "43114" && "blurrypool"
              }`}
            >
              <h6 className="deposit-txt d-flex align-items-center gap-2 justify-content-between">
                WITHDRAW
                <ClickAwayListener onClickAway={withdrawClose}>
                  <Tooltip
                    open={withdrawTooltip}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    placement="top"
                    title={
                      <div className="tooltip-text">
                        {
                          "Withdraw your deposited assets from the staking smart contract."
                        }
                      </div>
                    }
                  >
                    <img src={moreinfo} alt="" onClick={withdrawOpen} />
                  </Tooltip>
                </ClickAwayListener>
              </h6>

              <button
                disabled={Number(depositedTokens) > 0 ? false : true}
                className="btn outline-btn"
                onClick={() => {
                  setshowWithdrawModal(true);
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
      {popup && (
        <Modal
          visible={popup}
          modalId="tymodal"
          icon="stats"
          title="stats"
          setIsVisible={() => {
            setpopup(false);
          }}
          width="fit-content"
        >
          <div className="earn-hero-content p4token-wrapper">
            <div className="l-box pl-3 pr-3">
              <div className="container px-0">
                <div className="stats-container my-4">
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">My DYP Deposit</span>
                    <h6 className="stats-card-content">
                      {getFormattedNumber(depositedTokens,6) } DYP
                    </h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">My DYP Balance</span>
                    <h6 className="stats-card-content">
                      {getFormattedNumber(token_balance,6) } {token_symbol}
                    </h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">
                      Referral Fee Earned
                    </span>
                    <h6 className="stats-card-content">
                      {referralFeeEarned} DYP
                    </h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">Total DYP Locked</span>
                    <h6 className="stats-card-content">
                      {getFormattedNumber(tvl,6) } {token_symbol}
                    </h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">TVL USD</span>
                    <h6 className="stats-card-content">${getFormattedNumber(finalTvlUsd,4) } USD</h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">
                      Contract Expiration
                    </span>
                    <h6 className="stats-card-content">{expiration_time}</h6>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="referralwrapper col-8">
                    <div className="d-flex gap-2 align-items-start justify-content-between">
                      <img src={referralimg} alt="" />
                      <div
                        className="d-flex gap-2 flex-column"
                        style={{ width: "60%" }}
                      >
                        <div>
                          <span style={{ fontSize: ".8rem" }}>
                            <h6
                              className="referraltitle"
                              style={{ cursor: "pointer" }}
                            >
                              <Clipboard
                                component="h6"
                                onSuccess={(e) => {
                                  setTimeout(() => ReactTooltip.hide(), 2000);
                                }}
                                data-event="click"
                                data-for={id}
                                data-tip="Copied To Clipboard!"
                                data-clipboard-text={getReferralLink}
                                className="referraltitle"
                              >
                                Referral Link:
                                <span
                                  title="Copy link to clipboard"
                                  style={{
                                    cursor: "pointer",
                                  }}
                                ></span>
                              </Clipboard>
                              <ReactTooltip id={id} effect="solid" />
                            </h6>
                            <br />
                          </span>
                        </div>

                        <h6 className="referraldesc">
                          Refferal link gives you 5% for each invite friend you
                          bring to buy DYP example
                        </h6>
                      </div>
                      <Clipboard
                        component="div"
                        onSuccess={(e) => {
                          setTimeout(() => ReactTooltip.hide(), 2000);
                        }}
                        data-event="click"
                        data-for={id}
                        data-tip="Copied To Clipboard!"
                        data-clipboard-text={getReferralLink}
                        className=""
                      >
                        <button className="copybtn btn">
                          <img src={copy} alt="" /> Copy{" "}
                        </button>{" "}
                      </Clipboard>
                      <ReactTooltip id={id} effect="solid" />
                      &nbsp;{" "}
                    </div>
                  </div>
                  <div className="col-3 d-flex flex-column gap-1">
                    <span
                      style={{
                        fontWeight: "400",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#C0C9FF",
                      }}
                    >
                      My address
                    </span>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${window.config.snowtrace_baseURL}/address/${coinbase}`}
                      className="stats-link"
                    >
                      {shortAddress(coinbase)}{" "}
                      <img src={statsLinkIcon} alt="" />
                    </a>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://github.com/dypfinance/staking-governance-security-audits`}
                      className="stats-link"
                    >
                      Audit <img src={statsLinkIcon} alt="" />
                    </a>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${window.config.snowtrace_baseURL}/token/${reward_tokenn._address}?a=${coinbase}`}
                      className="stats-link"
                    >
                      View transaction <img src={statsLinkIcon} alt="" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showWithdrawModal && (
        <Modal
          visible={showWithdrawModal}
          modalId="withdrawmodal"
          title="withdraw"
          setIsVisible={() => {
            setshowWithdrawModal(false);
          }}
          width="fit-content"
        >
          <div className="earn-hero-content p4token-wrapper">
            <div className="l-box pl-3 pr-3">
              <div className="container px-0">
                <div className="row" style={{ marginLeft: "0px" }}>
                  <h6 className="withdrawdesc mt-2 p-0">
                    {lockTime === "No Lock"
                      ? "Your deposit has no lock-in period. You can withdraw your assets anytime, or continue to earn rewards every day."
                      : `The pool has a lock time. You can withdraw your deposited assets after the lock time expires.`}
                  </h6>
                </div>

                <div className="d-flex flex-column mt-2">
                  <div className="d-flex  gap-2 justify-content-between align-items-center mt-2">
                    <div className="d-flex flex-column gap-1">
                      <h6 className="withsubtitle mt-3">Timer</h6>
                      <h6 className="withtitle" style={{ fontWeight: 300 }}>
                        {lockTime === "No Lock" ? (
                          "No Lock"
                        ) : (
                          <Countdown
                          date={
                            (Number(stakingTime) + Number(cliffTime)) *
                            1000
                          }
                            renderer={renderer}
                          />
                        )}
                      </h6>
                    </div>
                  </div>
                  <div className="separator"></div>
                  <div className="d-flex  gap-2 justify-content-between align-items-center mb-4">
                    <div className="d-flex flex-column gap-1">
                      <h6 className="withsubtitle">Balance</h6>
                      <h6 className="withtitle">
                      {getFormattedNumber(depositedTokens,6)} {token_symbol}
                      </h6>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <div className="input-container px-0">
                      <input
                        type="number"
                        autoComplete="off"
                        value={withdrawAmount}
                        onChange={(e) => setwithdrawAmount(e.target.value)}
                        placeholder=" "
                        className="text-input"
                        style={{ width: "100%" }}
                        name="amount_withdraw"
                        id="amount_withdraw"
                        key="amount_withdraw"
                      />
                      <label
                        className="label"
                        onClick={() => focusInput("amount_withdraw")}
                      >
                        Withdraw Amount
                      </label>
                    </div>

                    <button
                      className="btn maxbtn"
                      onClick={handleSetMaxWithdraw}
                    >
                      Max
                    </button>
                  </div>

                  <div className="d-flex flex-column align-items-start justify-content-between gap-2 mt-4">
                    <button
                      disabled={
                        withdrawAmount === "" ||
                        withdrawStatus === "failed" ||
                        withdrawStatus === "success" ||
                        canWithdraw === false
                          ? true
                          : false
                      }
                      className={` w-100 btn filledbtn ${
                        (withdrawAmount === "" &&
                          withdrawStatus === "initial") ||
                        canWithdraw === false
                          ? "disabled-btn"
                          : withdrawStatus === "failed"
                          ? "fail-button"
                          : withdrawStatus === "success"
                          ? "success-button"
                          : null
                      } d-flex justify-content-center align-items-center`}
                      style={{ height: "fit-content" }}
                      onClick={() => handleWithdraw()}
                    >
                      {withdrawLoading ? (
                        <div
                          class="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      ) : withdrawStatus === "failed" ? (
                        <>
                          <img src={failMark} alt="" />
                          Failed
                        </>
                      ) : withdrawStatus === "success" ? (
                        <>Success</>
                      ) : (
                        <>Withdraw</>
                      )}
                    </button>
                    {/* <span
                      className="mt-2"
                      style={{
                        fontWeight: "400",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#C0C9FF",
                      }}
                    >
                      *No withdrawal fee
                    </span> */}
                    {/* <div className="form-row">
                            <div className="col-6">
                              <button
                                title={
                                  canWithdraw
                                    ? ""
                                    : `You recently staked, you can unstake ${cliffTimeInWords}`
                                }
                                disabled={!canWithdraw || !is_connected}
                                className="btn  btn-primary btn-block l-outline-btn"
                                type="submit"
                              >
                                WITHDRAW
                              </button>
                            </div>
                            <div className="col-6">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  this.handleWithdrawDyp();
                                }}
                                title={
                                  canWithdraw
                                    ? ""
                                    : `You recently staked, you can unstake ${cliffTimeInWords}`
                                }
                                disabled={!canWithdraw || !is_connected}
                                className="btn  btn-primary btn-block l-outline-btn"
                                type="submit"
                              >
                                WITHDRAW
                              </button>
                            </div>
                          </div> */}
                  </div>
                  {errorMsg3 && <h6 className="errormsg">{errorMsg3}</h6>}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {show === true && (
        <WalletModal
          show={show}
          handleClose={hideModal}
          handleConnection={()=>{handleConnection(); setshow(false)}}
        />
      )}

      {showCalculator === true && (
        <Modal
          visible={showCalculator}
          title="calculator"
          modalId="calculatormodal"
          setIsVisible={() => setshowCalculator(false)}
        >
          <div className="pools-calculator">
            <hr />
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex flex-column gap-3 w-50 me-5">
                <span style={{ fontSize: "15px", fontWeight: "500" }}>
                  Days to stake
                </span>
                <input
                  style={{ height: "40px" }}
                  type="number"
                  className="form-control calcinput w-100"
                  id="days"
                  name="days"
                  placeholder="Days*"
                  value={approxDays}
                  onChange={(e) => setapproxDays(e.target.value)}
                />
              </div>
              <div className="d-flex flex-column gap-3 w-50 me-5">
                <span style={{ fontSize: "15px", fontWeight: "500" }}>
                  DYP to Deposit
                </span>
                <input
                  style={{ height: "40px" }}
                  type="number"
                  className="form-control calcinput w-100"
                  id="days"
                  name="days"
                  placeholder="Value of deposit in USD"
                  value={approxDeposit}
                  onChange={(e) => setapproxDeposit(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex flex-column gap-2 mt-4">
              <h3 style={{ fontWeight: "500", fontSize: "39px" }}>
                $ {getFormattedNumber(getApproxReturn() * tokendata, 6)} USD
              </h3>
              <h6
                style={{
                  fontWeight: "300",
                  fontSize: "15px",
                  color: "#f7f7fc",
                }}
              >
                Approx {getFormattedNumber(getApproxReturn(), 2)} DYP
              </h6>
            </div>
            <div className="mt-4">
              <p
                style={{
                  fontWeight: "400",
                  fontSize: "13px",
                  color: "#f7f7fc",
                }}
              >
                *This calculator is for informational purposes only. Calculated
                yields assume that prices of the deposited assets don't change.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>

    // <div>
    //   <div className="row">
    //     <div className="col-12 header-image-staking-new">
    //       <div className="container">
    //         <Modal show={popup} handleClose={this.hidePopup}>
    //           <div className="earn-hero-content p4token-wrapper">
    //             <p className="h3">
    //               <b>iDYP Staking</b>
    //             </p>
    //             <p>
    //               Stake your iDYP tokens and earn{" "}
    //               {apr == 0 ? '...' : getFormattedNumber(apr - fee_s, 0)}
    //               % APR with no Impermanent Loss.
    //             </p>
    //             <p>
    //               To start earning, all you need is to deposit iDYP tokens
    //               into the Staking contract. You can choose from two
    //               different staking options, with rewards starting from{" "}
    //               {apy1 == 0 ? (
    //                 '...'
    //               ) : (
    //                 getFormattedNumber(apy1, 0)
    //               )}
    //               % APR up to{" "}
    //               {this.state.apy2 == 0 ? (
    //                 '...'
    //               ) : (
    //                 getFormattedNumber(this.state.apy2, 0)
    //               )}
    //               % APR, depending on the lock time from a minimum of
    //               zero-days up to a maximum of 90 days.
    //             </p>
    //             <p>
    //               The staking pools have the REINVEST function integrated,
    //               meaning that you can automatically add your daily rewards
    //               to the staking pool. Moreover, the iDYP Referral is
    //               available. If you refer iDYP to your friends, 5% of your
    //               friends’ rewards will automatically be sent to you
    //               whenever they stake iDYP.
    //             </p>
    //           </div>
    //         </Modal>
    //         <Modal
    //           show={this.state.show}
    //           handleConnection={this.props.handleConnection}
    //           handleConnectionWalletConnect={
    //             this.props.handleConnectionWalletConnect
    //           }
    //           handleClose={this.hideModal}
    //         />
    //         <div className="row">
    //           <div className="col-12">
    //             <p className="header-title-text">iDYP Staking</p>
    //           </div>
    //           <div className="col-7 col-md-7 col-lg-6 col-xl-5">
    //             <div className="row">
    //               <div className="col-9 col-md-5 mb-4">
    //                 <button
    //                   onClick={this.showPopup}
    //                   className="btn  btn-block btn-primary button"
    //                   type="button"
    //                   style={{ maxWidth: "100%", width: "100%" }}
    //                 >
    //                   <img
    //                     src="img/icon/bulb.svg"
    //                     style={{ float: "left" }}
    //                     alt="wallet"
    //                   />
    //                   More info
    //                 </button>
    //               </div>
    //               <div className="col-11 col-md-5 mb-4">
    //                 <button
    //                   className
    //                   onClick={() =>
    //                     window.open(
    //                       "https://www.youtube.com/watch?v=D5g19SuQlcI&t=2s",
    //                       "_blank"
    //                     )
    //                   }
    //                   className="btn  btn-block btn-primary l-outline-btn button"
    //                   type="submit"
    //                   style={{ maxWidth: "100%", width: "100%" }}
    //                 >
    //                   <img
    //                     src="img/icon/video.svg"
    //                     style={{ float: "left" }}
    //                     alt="wallet"
    //                   />
    //                   Video tutorial
    //                 </button>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="container">
    //       <div className="token-staking mt-4">
    //         <div className="row p-3 p-sm-0 p-md-0">
    //           <div className="col-12">
    //             <div className="row">
    //               <div className="col-lg-6 col-xs-12">
    //                 <div className="row token-staking-form">
    //                   <div className="col-12">
    //                     <div
    //                       className="l-box"
    //                       style={{ padding: "0.5rem" }}
    //                     >
    //                       {is_connected ? (
    //                         <div className="row justify-content-center">
    //                           <div
    //                             className="col-9 col-sm-8 col-md-7 text-center text-md-left"
    //                             style={{ marginTop: "0px" }}
    //                           >
    //                             <img
    //                               src="img/connected.png"
    //                               style={{
    //                                 marginRight: "10px",
    //                                 marginTop: "3px",
    //                               }}
    //                               alt="wallet"
    //                             />
    //                             <span
    //                               htmlFor="deposit-amount"
    //                               style={{
    //                                 margin: "0",
    //                                 top: "3px",
    //                                 position: "relative",
    //                               }}
    //                             >
    //                               Wallet has been connected
    //                             </span>
    //                           </div>
    //                           <div className="col-8 col-sm-6 col-md-5 text-center">
    //                             <div
    //                               style={{
    //                                 marginTop: "5px",
    //                                 paddingRight: "15px",
    //                               }}
    //                             >
    //                               <Address
    //                                 style={{ fontFamily: "monospace" }}
    //                                 a={coinbase}
    //                               />
    //                             </div>
    //                           </div>
    //                         </div>
    //                       ) : (
    //                         <div className="row justify-content-center">
    //                           <div
    //                             className="col-11 col-sm-8 col-md-8 text-center text-md-left mb-3 mb-md-0"
    //                             style={{ marginTop: "0px" }}
    //                           >
    //                             <img
    //                               src="img/icon/wallet.svg"
    //                               style={{
    //                                 marginRight: "10px",
    //                                 marginTop: "3px",
    //                               }}
    //                               alt="wallet"
    //                             />
    //                             <label
    //                               htmlFor="deposit-amount"
    //                               style={{
    //                                 margin: "0",
    //                                 top: "3px",
    //                                 position: "relative",
    //                               }}
    //                             >
    //                               Please connect wallet to use this dApp
    //                             </label>
    //                           </div>
    //                           <div className="col-10 col-md-4 mb-3 mb-md-0">
    //                             <button
    //                               type="submit"
    //                               onClick={this.showModal}
    //                               className="btn  btn-block btn-primary l-outline-btn"
    //                             >
    //                               Connect Wallet
    //                             </button>
    //                           </div>
    //                         </div>
    //                       )}
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //               <div className="col-lg-6 col-xs-12">
    //                 <div className="row token-staking-form">
    //                   <div className="col-12 padding-mobile">
    //                     <div
    //                       className=""
    //                       style={{
    //                         background:
    //                           "linear-gradient(257.76deg, #32B1F7 6.29%, #1D91D0 93.71%)",
    //                         boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.06)",
    //                         borderRadius: "6px",
    //                         paddingLeft: "5px",
    //                         padding: "10px",
    //                       }}
    //                     >
    //                       <div className="row">
    //                         <div
    //                           style={{ marginTop: "0px", paddingLeft: "" }}
    //                           className="col-4 col-sm-4 col-md-3 mb-3 mb-md-0 pr-0"
    //                         >
    //                           <img
    //                             src="img/icon/eth.svg"
    //                             style={{
    //                               marginRight: "4px",
    //                               marginTop: "5px",
    //                             }}
    //                             alt="wallet"
    //                           />
    //                           <label
    //                             htmlFor="deposit-amount"
    //                             style={{
    //                               margin: "0px",
    //                               top: "3px",
    //                               position: "relative",
    //                               color: "white",
    //                             }}
    //                           >
    //                             Ethereum
    //                           </label>
    //                         </div>
    //                         <div className="col-8 col-sm-6 col-md-5 mb-3 mb-md-0 pr-2">
    //                           <div className="test">
    //                             <div className="tvl_test">
    //                               TVL USD{" "}
    //                               <span className="testNumber">
    //                                 $ {tvl_usd}{" "}
    //                               </span>
    //                             </div>
    //                           </div>
    //                         </div>
    //                         <div className="col-7 col-sm-4 col-md-4 mb-1 mb-md-0">
    //                           <div className="test">
    //                             <div className="tvl_test">
    //                               APR{" "}
    //                               <span className="testNumber">
    //                                 {" "}
    //                                 <img src="img/icon/vector.svg" />{" "}
    //                                 {getFormattedNumber(apr - fee_s, 2)}%{" "}
    //                               </span>
    //                             </div>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>

    //           <div className="col-lg-6">
    //             <div className="row token-staking-form">
    //               <div className="col-12">
    //                 <div className="l-box">
    //                   {showDeposit == true ? (
    //                     <form onSubmit={(e) => e.preventDefault()}>
    //                       <div className="form-group">
    //                         <div className="row">
    //                           <label
    //                             htmlFor="deposit-amount"
    //                             className="col-md-8 d-block text-left"
    //                           >
    //                             DEPOSIT
    //                           </label>
    //                           <div className="col-4">
    //                             <a
    //                               target="_blank"
    //                               rel="noopener noreferrer"
    //                               href={`https://app.uniswap.org/#/swap?use=V2&inputCurrency=${liquidity}&outputCurrency=0xbd100d061e120b2c67a24453cf6368e63f1be056`}
    //                             >
    //                               <button
    //                                 className="btn btn-sm btn-block btn-primary l-outline-btn"
    //                                 type="button"
    //                               >
    //                                 GET iDYP
    //                               </button>
    //                             </a>
    //                           </div>
    //                         </div>
    //                         <div className="input-group ">
    //                           <input
    //                             disabled={!is_connected}
    //                             value={
    //                               Number(this.state.depositAmount) > 0
    //                                 ? this.state.depositAmount
    //                                 : this.state.depositAmount
    //                             }
    //                             onChange={(e) =>
    //                               this.setState({
    //                                 depositAmount: e.target.value,
    //                               })
    //                             }
    //                             className="form-control left-radius"
    //                             placeholder="0"
    //                             type="text"
    //                           />
    //                           <div className="input-group-append">
    //                             <button
    //                               disabled={!is_connected}
    //                               className="btn  btn-primary right-radius btn-max l-light-btn"
    //                               style={{ cursor: "pointer" }}
    //                               onClick={this.handleSetMaxDeposit}
    //                             >
    //                               MAX
    //                             </button>
    //                           </div>
    //                         </div>
    //                       </div>
    //                       <div className="row">
    //                         <div
    //                           style={{ paddingRight: "0.3rem" }}
    //                           className="col-6"
    //                         >
    //                           <button
    //                             disabled={!is_connected}
    //                             onClick={this.handleApprove}
    //                             className="btn  btn-block btn-primary "
    //                             type="button"
    //                           >
    //                             APPROVE
    //                           </button>
    //                         </div>
    //                         <div
    //                           style={{ paddingLeft: "0.3rem" }}
    //                           className="col-6"
    //                         >
    //                           <button
    //                             disabled={!is_connected}
    //                             onClick={this.handleStake}
    //                             className="btn  btn-block btn-primary l-outline-btn"
    //                             type="submit"
    //                           >
    //                             DEPOSIT
    //                           </button>
    //                         </div>
    //                       </div>
    //                       <p
    //                         style={{ fontSize: ".8rem" }}
    //                         className="mt-1 text-center mb-0 text-muted mt-3"
    //                       >

    //                         Please approve before staking. PERFORMANCE FEE{" "}
    //                         {fee_s}%<br />
    //                         Performance fees are already subtracted from the
    //                         displayed APR.
    //                       </p>
    //                     </form>
    //                   ) : (
    //                     <div className="row">
    //                       <div
    //                         className="col-md-12 d-block text-muted small"
    //                         style={{ fontSize: "15px" }}
    //                       >
    //                         <b>NOTE:</b>
    //                       </div>
    //                       <div
    //                         className="col-md-12 d-block text-muted small"
    //                         style={{ fontSize: "15px" }}
    //                       >
    //                         Deposit not available because the contract
    //                         expires faster than the pool lock time.
    //                       </div>
    //                       <div
    //                         className="col-md-12 d-block mb-0 text-muted small"
    //                         style={{ fontSize: "15px" }}
    //                       >
    //                         New contracts with improved strategies are
    //                         coming soon, waiting for security audit results.
    //                       </div>
    //                     </div>
    //                   )}
    //                 </div>
    //               </div>
    //               <div className="col-12">
    //                 <div className="l-box">
    //                   <form onSubmit={this.handleWithdraw}>
    //                     <div className="form-group">
    //                       <label
    //                         htmlFor="deposit-amount"
    //                         className="d-block text-left"
    //                       >
    //                         WITHDRAW
    //                       </label>
    //                       <div className="input-group ">
    //                         <input
    //                           disabled={!is_connected}
    //                           value={this.state.withdrawAmount}
    //                           onChange={(e) =>
    //                             this.setState({
    //                               withdrawAmount: e.target.value,
    //                             })
    //                           }
    //                           className="form-control left-radius"
    //                           placeholder="0"
    //                           type="text"
    //                         />
    //                         <div className="input-group-append">
    //                           <button
    //                             disabled={!is_connected}
    //                             className="btn  btn-primary right-radius btn-max l-light-btn"
    //                             style={{ cursor: "pointer" }}
    //                             onClick={this.handleSetMaxWithdraw}
    //                           >
    //                             MAX
    //                           </button>
    //                         </div>
    //                       </div>
    //                     </div>
    //                     <button
    //                       title={
    //                         canWithdraw
    //                           ? ""
    //                           : `You recently staked, you can unstake ${cliffTimeInWords}`
    //                       }
    //                       disabled={!canWithdraw || !is_connected}
    //                       className="btn  btn-primary btn-block l-outline-btn"
    //                       type="submit"
    //                     >
    //                       WITHDRAW
    //                     </button>
    //                     <p
    //                       style={{ fontSize: ".8rem" }}
    //                       className="mt-1 text-center text-muted mt-3"
    //                     >
    //                       {fee_u}% fee for withdraw
    //                     </p>
    //                   </form>
    //                 </div>
    //               </div>
    //               <div className="col-12">
    //                 <div className="l-box">
    //                   <form onSubmit={this.handleClaimDivs}>
    //                     <div className="form-group">
    //                       <label
    //                         htmlFor="deposit-amount"
    //                         className="text-left d-block"
    //                       >
    //                         REWARDS
    //                       </label>
    //                       <div className="form-row">

    //                         <div className="col-md-12">
    //                           <p
    //                             className="form-control  text-right"
    //                             style={{
    //                               border: "none",
    //                               marginBottom: 0,
    //                               paddingLeft: 0,
    //                               background: "transparent",
    //                               color: "var(--text-color)",
    //                             }}
    //                           >
    //                             <span
    //                               style={{
    //                                 fontSize: "1.2rem",
    //                                 color: "var(--text-color)",
    //                               }}
    //                             >
    //                               {pendingDivs}
    //                             </span>{" "}
    //                             <small className="text-bold">iDYP</small>
    //                           </p>
    //                         </div>
    //                       </div>
    //                     </div>
    //                     <div className="form-row">
    //                       <div className="col-md-6 mb-2">
    //                         <button
    //                           disabled={!is_connected}
    //                           className="btn  btn-primary btn-block "
    //                           type="submit"
    //                         >
    //                           CLAIM
    //                         </button>
    //                       </div>
    //                       <div className="col-md-6 mb-2">
    //                         <button
    //                           disabled={!is_connected}
    //                           className="btn  btn-primary btn-block l-outline-btn"
    //                           type="button"
    //                           onClick={this.handleReinvest}
    //                         >
    //                           REINVEST
    //                         </button>
    //                       </div>
    //                     </div>
    //                   </form>
    //                 </div>
    //               </div>
    //               <div className="col-12">
    //                 <div className="l-box">
    //                   <form onSubmit={(e) => e.preventDefault()}>
    //                     <div className="form-group">
    //                       <label
    //                         htmlFor="deposit-amount"
    //                         className="d-block text-left"
    //                       >
    //                         RETURN CALCULATOR
    //                       </label>
    //                       <div className="row">
    //                         <div className="col">
    //                           <label
    //                             style={{
    //                               fontSize: "1rem",
    //                               fontWeight: "normal",
    //                             }}
    //                           >
    //                             iDYP to Deposit
    //                           </label>
    //                           <input
    //                             className="form-control "
    //                             value={this.state.approxDeposit}
    //                             onChange={(e) =>
    //                               this.setState({
    //                                 approxDeposit: e.target.value,
    //                               })
    //                             }
    //                             placeholder="0"
    //                             type="text"
    //                           />
    //                         </div>
    //                         <div className="col">
    //                           <label
    //                             style={{
    //                               fontSize: "1rem",
    //                               fontWeight: "normal",
    //                             }}
    //                           >
    //                             Days
    //                           </label>
    //                           <input
    //                             className="form-control "
    //                             value={this.state.approxDays}
    //                             onChange={(e) =>
    //                               this.setState({
    //                                 approxDays: e.target.value,
    //                               })
    //                             }
    //                             type="text"
    //                           />
    //                         </div>
    //                       </div>
    //                     </div>
    //                     <p>
    //                       Approx.{" "}
    //                       {getFormattedNumber(this.getApproxReturn(), 6)}{" "}
    //                       iDYP
    //                     </p>
    //                       </form>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //           <div className="col-lg-6">
    //             <div className="l-box">
    //               <div className="table-responsive">
    //                 <h3
    //                   style={{
    //                     fontSize: "1.1rem",
    //                     fontWeight: "600",
    //                     padding: ".3rem",
    //                   }}
    //                 >
    //                   STATS
    //                 </h3>
    //                 <table className="table-stats table table-sm table-borderless">
    //                   <tbody>

    //                     <tr>
    //                       <th>Contract Expiration</th>
    //                       <td className="text-right">
    //                         <strong>{expiration_time}</strong>
    //                       </td>
    //                     </tr>

    //                     <tr>
    //                       <th>My iDYP Balance</th>
    //                       <td className="text-right">
    //                         <strong>{token_balance}</strong>{" "}
    //                         <small>{token_symbol}</small>
    //                       </td>
    //                     </tr>

    //                     <tr>
    //                       <th>MY iDYP Deposit</th>
    //                       <td className="text-right">
    //                         <strong>{depositedTokens}</strong>{" "}
    //                         <small>{token_symbol}</small>
    //                       </td>
    //                     </tr>
    //                     <tr>
    //                       <th>Total iDYP Locked</th>
    //                       <td className="text-right">
    //                         <strong>{tvl}</strong>{" "}
    //                         <small>{token_symbol}</small>
    //                       </td>
    //                     </tr>

    //                     <tr>
    //                       <th>Total Earned iDYP</th>
    //                       <td className="text-right">
    //                         <strong>{totalEarnedTokens}</strong>{" "}
    //                         <small>iDYP</small>
    //                       </td>
    //                     </tr>
    //                     <tr>
    //                       <th>Referral Fee Earned</th>
    //                       <td className="text-right">
    //                         <strong>{referralFeeEarned}</strong>{" "}
    //                         <small>iDYP</small>
    //                       </td>
    //                     </tr>
    //                     <tr>
    //                       <th>TVL USD</th>
    //                       <td className="text-right">
    //                         <strong>${tvl_usd}</strong> <small>USD</small>
    //                       </td>
    //                     </tr>

    //                     {is_connected ? (
    //                       <tr>
    //                         <td
    //                           style={{
    //                             fontSize: "1rem",
    //                             paddingTop: "2rem",
    //                           }}
    //                           colSpan="2"
    //                           className="text-center"
    //                         >
    //                           <a
    //                             target="_blank"
    //                             rel="noopener noreferrer"
    //                             href={`${window.config.etherscan_baseURL}/token/${reward_token._address}?a=${coinbase}`}
    //                           >
    //                             View Transaction History on Etherscan
    //                           </a>{" "}
    //                           &nbsp;{" "}
    //                           <i
    //                             style={{ fontSize: ".8rem" }}
    //                             className="fas fa-external-link-alt"
    //                           ></i>
    //                         </td>
    //                       </tr>
    //                     ) : (
    //                       ""
    //                     )}

    //                     {is_connected ? (
    //                       <tr>
    //                         <td colSpan="2">
    //                           <div>
    //                             <span style={{ fontSize: ".8rem" }}>
    //                               <span style={{ cursor: "pointer" }}>
    //                                 <Clipboard
    //                                   component="span"
    //                                   onSuccess={(e) => {
    //                                     setTimeout(
    //                                       () => ReactTooltip.hide(),
    //                                       2000
    //                                     );
    //                                   }}
    //                                   data-event="click"
    //                                   data-for={id}
    //                                   data-tip="Copied To Clipboard!"
    //                                   data-clipboard-text={this.getReferralLink()}
    //                                 >
    //                                   Referral Link: &nbsp;{" "}
    //                                   <span
    //                                     title="Copy link to clipboard"
    //                                     style={{
    //                                       cursor: "pointer",
    //                                     }}
    //                                     className="fas fa-paste"
    //                                   ></span>
    //                                 </Clipboard>
    //                                 <ReactTooltip id={id} effect="solid" />
    //                               </span>

    //                               <br />
    //                               <a
    //                                 className="text-muted small"
    //                                 href={this.getReferralLink()}
    //                               >
    //                                 {" "}
    //                                 {this.getReferralLink()}{" "}
    //                               </a>
    //                             </span>
    //                           </div>
    //                         </td>
    //                       </tr>
    //                     ) : (
    //                       ""
    //                     )}

    //                     <tr></tr>
    //                     {isOwner && (
    //                       <tr>
    //                         <td
    //                           style={{ fontSize: "1rem" }}
    //                           colSpan="2"
    //                           className="text-center"
    //                         >
    //                           <a
    //                             onClick={this.handleListDownload}
    //                             target="_blank"
    //                             rel="noopener noreferrer"
    //                             href="#"
    //                           >
    //                             <i
    //                               style={{ fontSize: ".8rem" }}
    //                               className="fas fa-download"
    //                             ></i>{" "}
    //                             Download Stakers List{" "}
    //                           </a>
    //                         </td>
    //                       </tr>
    //                     )}
    //                   </tbody>
    //                 </table>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default StakeAvax;
