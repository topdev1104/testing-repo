import React, { useState, useEffect } from "react";
import moment from "moment";
import getFormattedNumber from "../../functions/get-formatted-number";
import Modal from "../Modal/Modal";
import Address from "./address";
import WalletModal from "../WalletModal";
import "./top-pools.css";
import ellipse from "./assets/ellipse.svg";
import failMark from "../../assets/failMark.svg";
import Clipboard from "react-clipboard.js";
import ReactTooltip from "react-tooltip";
import arrowup from "./assets/arrow-up.svg";
import moreinfo from "./assets/more-info.svg";
import stats from "./assets/stats.svg";
import purplestats from "./assets/purpleStat.svg";
import referralimg from "./assets/referral.svg";
import copy from "./assets/copy.svg";
import wallet from "./assets/wallet.svg";
import Tooltip from "@material-ui/core/Tooltip";
import Countdown from "react-countdown";
import poolsCalculatorIcon from "./assets/poolsCalculatorIcon.svg";
import statsLinkIcon from "./assets/statsLinkIcon.svg";
import CountDownTimer from "../locker/Countdown";
import { shortAddress } from "../../functions/shortAddress";
import calculatorIcon from "../calculator/assets/calculator.svg";
import xMark from "../calculator/assets/xMark.svg";
import { handleSwitchNetworkhook } from "../../functions/hooks";
import { ClickAwayListener } from "@material-ui/core";
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

const StakeEthDai = ({
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
  renderedPage,
  fee,
}) => {
  let {
    reward_token,
    BigNumber,
    alertify,
    reward_token_idyp,
    token_dyps,
    reward_token_daieth,
  } = window;
  let token_symbol = "DYP";

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
  const [tvlDyps, setsettvlDyps] = useState("");
  const [total_stakers, settotal_stakers] = useState("");

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

  const getPriceDYP = async () => {
    let usdPerToken = await window.getPrice("defi-yield-protocol");
    setusdPerToken(usdPerToken);
  };

  const refreshBalance = async () => {
    let coinbase = coinbase2;

    if (window.coinbase_address) {
      coinbase = window.coinbase_address;
      setcoinbase(coinbase);
    }
    let lp_data;
    let usd_per_dyps;
    if (the_graph_result) {
      lp_data = the_graph_result.token_data;

      //Calculate APY

      // let usd_per_idyp = the_graph_result.token_data ? the_graph_result.token_data["0xbd100d061e120b2c67a24453cf6368e63f1be056"].token_price_usd : 1
      // let apy = apr;
      // setap
      // this.setState({ apy });

      usd_per_dyps = the_graph_result.price_DYPS
        ? the_graph_result.price_DYPS
        : 1;
    }
    try {
      let _bal = reward_token.balanceOf(coinbase);
      if (staking) {
        let _pDivs = staking.getTotalPendingDivs(coinbase);
        let _tEarned = staking.totalEarnedTokens(coinbase);
        let _stakingTime = staking.stakingTime(coinbase);
        let _dTokens = staking.depositedTokens(coinbase);
        let _lClaimTime = staking.lastClaimedTime(coinbase);
        let _tvl = reward_token.balanceOf(staking._address);
        let _rFeeEarned = staking.totalReferralFeeEarned(coinbase);
        let tStakers = staking.getNumberOfHolders();

        //Take DAI Balance on Staking
        let _tvlConstantDAI = reward_token_daieth.balanceOf(
          staking._address
        ); /* TVL of DAI on Staking */

        //Take DYPS Balance
        let _tvlDYPS = token_dyps.balanceOf(staking._address); /* TVL of DYPS */

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
        //console.log({tvlUSD})

        let tvlDyps = new BigNumber(tvlDYPS).times(usd_per_dyps).toFixed(18);

        let balance_formatted = new BigNumber(token_balance ).div(1e18).toString(10)
        settoken_balance(balance_formatted) ;

        let usd_per_bnb = the_graph_result.token_data ? the_graph_result.usd_per_eth : 1
        let divs_formatted = new BigNumber(pendingDivs).div(10 ** TOKEN_DECIMALS).div(usd_per_bnb).toString(10);
        setpendingDivs(getFormattedNumber(divs_formatted,6));

        let earnedTokens_formatted = new BigNumber(totalEarnedTokens).div(10 ** TOKEN_DECIMALS).toString(10);
        settotalEarnedTokens( getFormattedNumber(earnedTokens_formatted,6) );

        setstakingTime(stakingTime);

        let depositedTokens_formatted = new BigNumber(depositedTokens).div(1e18).toString(10)

        setdepositedTokens(depositedTokens_formatted);

        setlastClaimedTime(lastClaimedTime);

        let tvl_formatted = new BigNumber(tvl ).div(1e18).toString(10);
        settvl(tvl_formatted);

        setsettvlDyps(tvlDyps);
        setreferralFeeEarned(referralFeeEarned);
        settotal_stakers(total_stakers);

        let stakingOwner = await staking.owner();
        setstakingOwner(stakingOwner);
      }
    } catch (e) {
      console.error(e);
    }
    if (staking) {
      staking
        .LOCKUP_TIME()
        .then((cliffTime) => {
          setcliffTime(Number(cliffTime));
        })
        .catch(console.error);

      staking.contractStartTime().then((contractDeployTime) => {
        setcontractDeployTime(contractDeployTime);
      });

      staking.REWARD_INTERVAL().then((disburseDuration) => {
        setdisburseDuration(disburseDuration);
      });
    }
  };

  useEffect(() => {
    if (coinbase !== coinbase2 && coinbase !== null && coinbase !== undefined) {
      setcoinbase(coinbase);
    }
  }, [coinbase, coinbase2]);

  useEffect(() => {
    getPriceDYP();
  }, []);

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

  const handleApprove = (e) => {
    setdepositLoading(true);

    if (other_info) {
      window.$.alert("This pool no longer accepts deposits!");
      setdepositLoading(false);

      return;
    }

    let amount = depositAmount;
    amount = new BigNumber(amount).times(1e18).toFixed(0);
    reward_token
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
  };

  const handleStake = async (e) => {
    //   e.preventDefault();
    setdepositLoading(true);

    if (other_info) {
      window.$.alert("This pool no longer accepts deposits!");
      setdepositLoading(false);

      return;
    }

    let amount = depositAmount;
    amount = new BigNumber(amount).times(1e18).toFixed(0);
    let referrer = window.config.ZERO_ADDRESS;

    let deadline = Math.floor(
      Date.now() / 1e3 + window.config.tx_max_wait_seconds
    );

    //NO REFERRER HERE

    staking
      .stake(amount, referrer, 0, deadline)
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
          setdepositStatus("initial");
          seterrorMsg("");
        }, 10000);
      });
  };

  const handleWithdraw = async (e) => {
    //   e.preventDefault();
    setwithdrawLoading(true);

    let amount = new BigNumber(withdrawAmount).times(1e18).toFixed(0)

    let deadline = Math.floor(
      Date.now() / 1e3 + window.config.tx_max_wait_seconds
    );

    staking
      .unstake(amount, 0, deadline)
      .then(() => {
        setwithdrawStatus("success");
        setwithdrawLoading(false);
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

  const handleClaimDivs = (e) => {
    window.$.alert(
      "Contract Expired! Your lock time ended so please withdraw your funds and move to a new pool."
    );
  };

  const handleSetMaxDeposit = () => {
    const depositAmountFormatted = token_balance;
    checkApproval(token_balance);

    setdepositAmount(depositAmountFormatted);
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
    if (the_graph_result) {
      let usd_per_token = the_graph_result.token_data
        ? the_graph_result.token_data[
            "0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
          ].token_price_usd
        : 1;
      let usd_per_eth = the_graph_result.token_data
        ? the_graph_result.usd_per_eth
        : 1;

      return (
        ((approxDeposit * usd_per_token * apr) / usd_per_eth / 100 / 365) *
        approxDays
      );
    }
  };

  const getReferralLink = () => {
    return window.location.origin + window.location.pathname + "?r=" + coinbase;
  };

  const handleReinvest = async (e) => {
    //   e.preventDefault();
    setreInvestStatus("invest");
    setreInvestLoading(true);

    if (stakingTime != 0 && Date.now() - stakingTime >= cliffTime) {
      window.$.alert(
        "Contract Expired! Your lock time ended so please withdraw your funds and move " +
          "to a new pool. Any unclaimed rewards will be automatically distributed to your wallet within 24 hours!"
      );
      setreInvestLoading(false);

      return;
    }

    let address = coinbase;
    let amount = await staking.getTotalPendingDivs(address);

    let router = await window.getPancakeswapRouterContract();
    let WETH = await router.methods.WETH().call();
    // let platformTokenAddress = window.config.reward_token_address
    let rewardTokenAddress = window.config.reward_token_daieth_address;
    let path = [
      ...new Set([rewardTokenAddress, WETH].map((a) => a.toLowerCase())),
    ];
    let _amountOutMin = await router.methods
      .getAmountsOut(amount, path)
      .call()
      .catch((e) => {
        setreInvestStatus("failed");
        setreInvestLoading(false);
        seterrorMsg2(e?.message);

        setTimeout(() => {
          setreInvestStatus("initial");
          seterrorMsg2("");
        }, 10000);
      });
    _amountOutMin = _amountOutMin[_amountOutMin.length - 1];
    _amountOutMin = new BigNumber(_amountOutMin)
      .times(100 - window.config.slippage_tolerance_percent)
      .div(100)
      .toFixed(0);

    let referralFee = new BigNumber(_amountOutMin)
      .times(500)
      .div(1e4)
      .toFixed(0);
    referralFee = referralFee.toString();

    // _amountOutMin = _amountOutMin - referralFee
    // _amountOutMin = _amountOutMin.toString()

    let deadline = Math.floor(
      Date.now() / 1e3 + window.config.tx_max_wait_seconds
    );

    console.log({ amount, _amountOutMin, deadline });

    staking
      .reInvest(0, _amountOutMin, deadline)
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
        }, 10000);
      });
  };

  const convertTimestampToDate = (timestamp) => {
    const result = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(timestamp * 1000);
    return result;
  };

  const handleBnbPool = async () => {
    await handleSwitchNetworkhook("0x38")
      .then(() => {
        handleSwitchNetwork("56");
      })
      .catch((e) => {
        console.log(e);
      });
  };

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

  // const token_balance2 = new BigNumber(token_balance).div(1e18).toString(10);
  // settoken_balance(getFormattedNumber(token_balance2, 6))
  //   let usd_per_bnb;
  // if(the_graph_result)
  //   { usd_per_bnb = the_graph_result.token_data
  //     ? the_graph_result.usd_per_eth
  //     : 1;}

  //   const pendingDivs2 = new BigNumber(pendingDivs)
  //     .div(10 ** TOKEN_DECIMALS)
  //     .div(usd_per_bnb)
  //     .toString(10);
  //     setpendingDivs(getFormattedNumber(pendingDivs2, 6))

  //   const totalEarnedTokens2 = new BigNumber(totalEarnedTokens)
  //     .div(10 ** TOKEN_DECIMALS)
  //     .toString(10);
  //     settotalEarnedTokens(getFormattedNumber(totalEarnedTokens2, 6))

  //   setreferralFeeEarned(getFormattedNumber(referralFeeEarned / 1e18, 6));

  //   const depositedTokens2 = new BigNumber(depositedTokens).div(1e18).toString(10);
  //   setdepositedTokens(getFormattedNumber(depositedTokens2, 6))

  //   const tvl2 = new BigNumber(tvl).div(1e18).toString(10);
  //   settvl(getFormattedNumber(tvl2, 6))

  //   setstakingTime(stakingTime * 1e3)

  //   setcliffTime(cliffTime * 1e3)

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
    ){
      canWithdraw = false;
      cliffTimeInWords = moment
        .duration(cliffTime - (Date.now() - stakingTime))
        .humanize(true);
    }
  }

  let tvl_usd = tvl * tokendata;

  let tvlDYPS = tvlDyps / 1e18;

  tvl_usd = tvl_usd + tvlDYPS;

  tvl_usd = getFormattedNumber(tvl_usd, 2);

  let id = Math.random().toString(36);

  const focusInput = (field) => {
    document.getElementById(field).focus();
  };

  const checkApproval = async (amount) => {
    const result = await window
      .checkapproveStakePool(coinbase, reward_token._address, staking._address)
      .then((data) => {
        console.log(data);
        return data;
      });
    let result_formatted = new BigNumber(result).div(1e18).toFixed(6);

    if (
      Number(result_formatted) >= Number(amount) &&
      Number(result_formatted) !== 0
    ) {
      setdepositStatus("deposit");
    } else {
      setdepositStatus("initial");
    }
  };

  const getUsdPerDyp = async () => {
    await axios
      .get("https://api.dyp.finance/api/the_graph_eth_v2")
      .then((data) => {
        const propertyDyp = Object.entries(
          data.data.the_graph_eth_v2.token_data
        );
        settokendata(propertyDyp[0][1].token_price_usd);
        return propertyDyp[0][1].token_price_usd;
      });
  };

  useEffect(() => {
    getUsdPerDyp();
  }, []);

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
            <div
              className={`d-flex flex-column flex-lg-row w-100 align-items-start align-items-lg-center justify-content-between ${
                renderedPage === "dashboard"
                  ? "gap-3 gap-lg-4"
                  : "gap-3 gap-lg-5"
              }`}
            >
              <h6 className="activetxt">
                <img
                  src={ellipse}
                  alt=""
                  className="position-relative"
                  style={{ top: "-1px" }}
                />
                Active status
              </h6>
              {/* <div className="d-flex align-items-center justify-content-between gap-2">
            <h6 className="earnrewards-text">Earn rewards in:</h6>
            <h6 className="earnrewards-token d-flex align-items-center gap-1">
              DYP
            </h6>
          </div> */}
              <div className="d-flex flex-row-reverse flex-lg-row align-items-center justify-content-between earnrewards-container">
                <div className="d-flex flex-column flex-lg-row align-items-end align-items-lg-center gap-3 gap-lg-5">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <h6 className="earnrewards-text">Performance fee:</h6>
                    <h6 className="earnrewards-token d-flex align-items-center gap-1">
                      {fee}%
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
                      "https://app.uniswap.org/#/swap?outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
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
        <div className="pools-details-wrapper d-flex m-0  container-lg border-0">
          <div className="row w-100 flex-column flex-lg-row gap-4 gap-lg-0 justify-content-between">
            <div className="firstblockwrapper col-12 col-md-6 col-lg-2">
              <div
                className="d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between gap-4"
                style={{ height: "100%" }}
              >
                <h6 className="start-title">Start Staking</h6>
                {/* <h6 className="start-desc">
              {this.props.coinbase === null
                ? "Connect wallet to view and interact with deposits and withdraws"
                : "Interact with deposits and withdraws"}
            </h6> */}
                {coinbase === null ||
                coinbase === undefined ||
                is_wallet_connected === false ? (
                  <button
                    className="connectbtn btn"
                    onClick={showModal}
                    style={{
                      width: renderedPage === "dashboard" && "100%",
                      fontSize: renderedPage === "dashboard" && "10px",
                    }}
                  >
                    <img src={wallet} alt="" /> Connect wallet
                  </button>
                ) : chainId === "1" ? (
                  <div className="addressbtn btn">
                    <Address a={coinbase} chainId={1} />
                  </div>
                ) : (
                  <button
                    className="connectbtn btn"
                    onClick={() => {
                      handleBnbPool();
                    }}
                  >
                    Change Network
                  </button>
                )}
              </div>
            </div>
            {/* <div className="otherside">
      <button className="btn green-btn">
        TBD Claim reward 0.01 ETH
      </button>
    </div> */}
            <div
              className={`otherside-border col-12 col-md-12 col-lg-4  ${
                chainId !== "1" || expired === true ? "blurrypool" : ""
              }`}
            >
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <h6 className="deposit-txt">Deposit</h6>
                  {/* <div className="d-flex gap-2 align-items-center">
                <img
                  src={require(`./assets/dyp.svg`).default}
                  alt=""
                  style={{ width: 15, height: 15 }}
                />
                <h6
                  className="text-white"
                  style={{ fontSize: "11px", fontWeight: "600" }}
                >
                  DYP
                </h6>
              </div> */}
                  <h6 className="mybalance-text">
                    Balance:
                    <b>
                      {token_balance !== "..."
                        ?  getFormattedNumber(token_balance, 6)
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
                        {
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
                <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center justify-content-between justify-content-lg-start w-100 gap-2">
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
                        htmlFor="usd"
                        className="label"
                        onClick={() => {
                          focusInput("amount_deposit");
                        }}
                      >
                        Amount
                      </label>
                    </div>

                    {/* <div
                className="input-container px-0"
                style={{ width: "32%" }}
              >
                <input
                  type="number"
                  min={1}
                  id="amount"
                  name="amount"
                  value={ Number(this.state.depositAmount) > 0
                    ? this.state.depositAmount
                    : this.state.depositAmount
                  }
                  placeholder=" "
                  className="text-input"
                  onChange={(e) => this.setState({depositAmount: e.target.value})}
                  style={{ width: "100%" }}
                />
                <label
                  htmlFor="usd"
                  className="label"
                  onClick={() => focusInput("amount")}
                >
                  DYP Amount
                </label>
              </div> */}
                    <button
                      className="btn maxbtn"
                      onClick={handleSetMaxDeposit}
                    >
                      Max
                    </button>
                  </div>
                  {/* <button
              className="btn filledbtn"
              onClick={this.handleApprove}
            >
              Approve
            </button> */}
                  <button
                    disabled={
                      depositAmount === "" || depositLoading === true
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
                chainId !== "1" && "blurrypool"
              }`}
            >
              <div className="d-flex justify-content-between gap-2 ">
                <h6 className="withdraw-txt">Rewards</h6>
                <h6
                  className="withdraw-littletxt d-flex align-items-center gap-2"
                  style={{
                    fontSize: renderedPage === "dashboard" && "9px",
                  }}
                >
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
              <div className="d-flex flex-column gap-2 justify-content-between">
                {/* <div className="d-flex align-items-center justify-content-between gap-2"></div> */}
                <div className="form-row flex-column flex-lg-row gap-2 d-flex  align-items-start align-items-lg-center justify-content-between">
                  <div className="position-relative d-flex flex-column">
                    <span
                      style={{
                        fontWeight: "500",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#c0c9ff",
                      }}
                    >
                      DAI
                    </span>
                    <span>{pendingDivs}</span>
                    {/* <input
                  disabled
                  value={
                    Number(pendingDivs) > 0
                      ? `${pendingDivs}`
                      : `${pendingDivs}`
                  }
                  onChange={(e) =>
                    this.setState({
                      pendingDivs:
                        Number(e.target.value) > 0
                          ? e.target.value
                          : e.target.value,
                    })
                  }
                  className=" left-radius inputfarming styledinput2"
                  placeholder="0"
                  type="text"
                  style={{ fontSize: "14px", width: renderedPage === "dashboard" && '120px', padding: 0 }}
                /> */}
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
                      className={`btn disabled-btn`}
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
            </div>

            <div
              className={`otherside-border col-12 col-md-12 col-lg-2 ${
                chainId !== "1" && "blurrypool"
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
                disabled={false}
                className={"outline-btn btn"}
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
          title="stats"
          setIsVisible={() => {
            hidePopup();
          }}
          width="fit-content"
        >
          <div className="earn-hero-content p4token-wrapper">
            <div className="l-box pl-3 pr-3">
              <div className="container px-0">
                {/* <div className="row" style={{ marginLeft: "0px" }}>
        <div className="d-flex justify-content-between gap-2 align-items-center p-0">
          <h6 className="d-flex gap-2 align-items-center statstext">
            <img src={stats} alt="" />
            Stats
          </h6>
          <h6 className="d-flex gap-2 align-items-center myaddrtext">
            My address
            <a
              href={`${window.config.etherscan_baseURL}/address/${this.props.coinbase}`}
              target={"_blank"}
              rel="noreferrer"
            >
              <h6 className="addresstxt">
                {this.props.coinbase?.slice(0, 10) + "..."}
              </h6>
            </a>
            <img src={arrowup} alt="" />
          </h6>
        </div>
      </div> */}
                {/* <table className="table-stats table table-sm table-borderless mt-2">
        <tbody>
          <tr>
            <td className="text-right">
              <th>My DYP Deposit</th>
              <div>
                <strong>{depositedTokens}</strong>{" "}
                <small>DYP</small>
              </div>
            </td>

            <td className="text-right">
              <th>My DYP Balance</th>
              <div>
                <strong>{token_balance}</strong>{" "}
                <small>DYP</small>
              </div>
            </td>
            <td className="text-right">
              <th>Referral Fee Earned</th>
              <div>
                <strong>{referralFeeEarned}</strong>{" "}
                <small>DYP</small>
              </div>
            </td>

          
          </tr>

          <tr>
            <td className="text-right">
              <th>Total DYP Locked</th>
              <div>
                <strong>{tvl}</strong> <small>DYP</small>
              </div>
            </td>
            <td className="text-right">
              <th>TVL USD</th>
              <div>
                <strong>${tvl_usd}</strong> <small>USD</small>
              </div>
            </td>

            <td className="text-right">
              <th>Contract Expiration</th>
              <small>{expiration_time}</small>
            </td>
          </tr>
        </tbody>
      </table> */}
                <div className="stats-container my-4">
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">My DYP Deposit</span>
                    <h6 className="stats-card-content">
                    {getFormattedNumber(depositedTokens,6)} DYP
                    </h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">My DYP Balance</span>
                    <h6 className="stats-card-content">{token_balance} DYP</h6>
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
                      {getFormattedNumber(tvl, 6)} DYP
                    </h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">TVL USD</span>
                    <h6 className="stats-card-content">${tvl_usd} USD</h6>
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
                                data-clipboard-text={getReferralLink()}
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
                            {/* <a
                  className="text-muted small"
                  href={this.getReferralLink()}
                >
                  {" "}
                  {this.getReferralLink()}{" "}
                </a> */}
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
                        data-clipboard-text={getReferralLink()}
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
                      href={`${window.config.etherscan_baseURL}/address/${coinbase}`}
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
                      href={`${window.config.etherscan_baseURL}/token/${reward_token._address}?a=${coinbase}`}
                      className="stats-link"
                    >
                      View transaction <img src={statsLinkIcon} alt="" />
                    </a>
                  </div>
                </div>
                {/* <div className="mt-4">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`${window.config.etherscan_baseURL}/token/${reward_token._address}?a=${coinbase}`}
          className="maxbtn"
          style={{ color: "#7770e0" }}
        >
          Etherscan
          <img src={arrowup} alt="" />
        </a>
      </div> */}
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
                  {/* <div className="d-flex justify-content-between gap-2 align-items-center p-0">
          <h6 className="d-flex gap-2 align-items-center statstext">
            <img src={stats} alt="" />
            Withdraw
          </h6>
        </div> */}
                  <h6 className="withdrawdesc mt-2 p-0">
                    {lockTime === "No Lock"
                      ? "Your deposit has no lock-in period. You can withdraw your assets anytime, or continue to earn rewards every day."
                      : `The pool has a lock time. You can withdraw your deposited assets after the lock time expires.`}
                  </h6>
                </div>

                <div className="d-flex flex-column mt-2">
                  <div className="d-flex  gap-2 justify-content-between align-items-center">
                    <div className="d-flex flex-column gap-1">
                      <h6 className="withsubtitle mt-3">Timer</h6>
                      <h6 className="withtitle" style={{ fontWeight: 300 }}>
                        {lockTime === "No Lock" ? (
                          "No Lock"
                        ) : (
                          <Countdown
                            date={
                              (Number(stakingTime) + Number(cliffTime)) * 1000
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
                        htmlFor="usd"
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
                        withdrawStatus === "failed" ||
                        withdrawStatus === "success" ||
                        withdrawAmount === "" ||
                        canWithdraw === false
                          ? true
                          : false
                      }
                      className={` w-100 btn filledbtn ${
                        withdrawStatus === "failed"
                          ? "fail-button"
                          : withdrawStatus === "success"
                          ? "success-button"
                          : (withdrawAmount === "" &&
                              withdrawStatus === "initial") ||
                            canWithdraw === false
                          ? "disabled-btn"
                          : null
                      } d-flex justify-content-center align-items-center`}
                      style={{ height: "fit-content" }}
                      onClick={() => {
                        handleWithdraw();
                      }}
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
                    {/* <button
            className="btn filledbtn w-100"
            onClick={(e) => {
              // e.preventDefault();
              this.handleWithdraw();
            }}
            title={
              canWithdraw
                ? ""
                : `You recently staked, you can unstake ${cliffTimeInWords}`
            }
          >
            Withdraw
          </button> */}

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

      {show && (
        <WalletModal
          show={show}
          handleClose={hideModal}
          handleConnection={()=>{handleConnection(); setshow(false)}}
        />
      )}
      {/* <div
className="calculator-btn d-flex justify-content-center align-items-center gap-2 text-white"
onClick={() => this.setState({ showCalculator: true })}
>
<img
src={calculatorIcon}
alt=""
style={{ width: 30, height: 30 }}
/>{" "}
Calculator
</div> */}

      {showCalculator && (
        <Modal
          visible={showCalculator}
          title="calculator"
          modalId="calculatormodal"
          setIsVisible={() => setshowCalculator(false)}
        >
          <div className="pools-calculator">
            {/* <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <img src={calculatorIcon} alt="" />
          <h5
            style={{
              fontSize: "23px",
              fontWeight: "500",
              color: "#f7f7fc",
            }}
          >
            Calculator
          </h5>
        </div>
        <img
          src={xMark}
          alt=""
          onClick={() => {
            this.setState({ showCalculator: false });
          }}
          className="cursor-pointer"
        />
      </div> */}
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
                  Amount to stake
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
                $ {getFormattedNumber(getApproxReturn() * getUsdPerETH(), 6)} USD
              </h3>
              <h6
                style={{
                  fontWeight: "300",
                  fontSize: "15px",
                  color: "#f7f7fc",
                }}
              >
                Approx {getFormattedNumber(getApproxReturn(), 6)}{" "}
                WETH
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
  );

  // <div>
  //   <div className="row">
  //     <div className="col-12 header-image-staking-new">
  //       <div className="container">
  //         <Popup show={this.state.popup} handleClose={this.hidePopup}>
  //           <div className="earn-hero-content p4token-wrapper">
  //             <p className="h3">
  //               <b>DYP Staking</b>
  //             </p>
  //             <p>
  //               Stake your DYP tokens and earn 25% APR in BNB with no
  //               Impermanent Loss.
  //             </p>
  //             <p>
  //               To start earning, all you need is to deposit DYP tokens
  //               into the Staking contract and earn BNB as rewards.
  //             </p>
  //             <p>
  //               The staking pools have the REINVEST function integrated,
  //               meaning that you can automatically add your daily rewards
  //               to the staking pool. Moreover, the DYP Referral is
  //               available. If you refer DYP to your friends, 5% of your
  //               friends’ rewards will automatically be sent to you
  //               whenever they stake DYP.
  //             </p>
  //           </div>
  //         </Popup>
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
  //             <p className="header-title-text">DYP Staking</p>
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
  //                       "https://www.youtube.com/watch?v=sYkoxGbpBi4",
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
  //                           "linear-gradient(257.76deg, #FFD962 6.29%, #F0BB1D 93.71%)",
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
  //                             src="img/icon/bsc.svg"
  //                             style={{
  //                               marginRight: "4px",
  //                               marginTop: "3px",
  //                             }}
  //                             alt="wallet"
  //                           />
  //                           <label
  //                             htmlFor="deposit-amount"
  //                             style={{
  //                               margin: "0px",
  //                               top: "4px",
  //                               position: "relative",
  //                               color: "white",
  //                             }}
  //                           >
  //                             BNB Chain
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
  //                         <div className="col-6 col-sm-4 col-md-4 mb-1 mb-md-0">
  //                           <div className="test">
  //                             <div className="tvl_test">
  //                               APR{" "}
  //                               <span className="testNumber">
  //                                 {" "}
  //                                 <img src="img/icon/vector.svg" />{" "}
  //                                 {getFormattedNumber(this.state.apy, 2)}%{" "}
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
  //                               href={`https://pancakeswap.finance/swap?inputCurrency=${liquidity}&outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17`}
  //                             >
  //                               <button
  //                                 className="btn btn-sm btn-block btn-primary l-outline-btn"
  //                                 type="button"
  //                               >
  //                                 GET DYP
  //                               </button>
  //                             </a>
  //                           </div>
  //                         </div>
  //                         <div className="input-group ">
  //                           <input
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
  //                         {/* Some info text here.<br /> */}
  //                         Please approve before staking. 0% fee for
  //                         deposit.
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
  //                       0% fee for withdraw
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

  //                           <input
  //                             value={
  //                               Number(pendingDivs) > 0
  //                                 ? `${pendingDivs} WBNB`
  //                                 : `${pendingDivs} WBNB`
  //                             }
  //                             onChange={(e) =>
  //                               this.setState({
  //                                 pendingDivs:
  //                                   Number(e.target.value) > 0
  //                                     ? e.target.value
  //                                     : e.target.value,
  //                               })
  //                             }
  //                             className="form-control left-radius"
  //                             placeholder="0"
  //                             type="text"
  //                             disabled
  //                           />
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
  //                             DYP to Deposit
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
  //                       WBNB
  //                     </p>
  //                    </form>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //           <div className="col-lg-6">
  //             <Boxes
  //               items={[
  //                 {
  //                   title: "TVL USD",
  //                   number: "$" + tvl_usd,
  //                 },
  //                 {
  //                   title: `APR`,
  //                   number: getFormattedNumber(this.state.apy, 2) + "%",
  //                 },
  //               ]}
  //             />
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
  //                       <th>My DYP Balance</th>
  //                       <td className="text-right">
  //                         <strong>{token_balance}</strong>{" "}
  //                         <small>{token_symbol}</small>
  //                       </td>
  //                     </tr>

  //                     <tr>
  //                       <th>MY DYP Deposit</th>
  //                       <td className="text-right">
  //                         <strong>{depositedTokens}</strong>{" "}
  //                         <small>{token_symbol}</small>
  //                       </td>
  //                     </tr>
  //                     <tr>
  //                       <th>Total DYP Locked</th>
  //                       <td className="text-right">
  //                         <strong>{tvl}</strong>{" "}
  //                         <small>{token_symbol}</small>
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
  //                             View Transaction History on BscScan
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
};
export default StakeEthDai;
