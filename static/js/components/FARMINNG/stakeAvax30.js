import React from "react";
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
import statsLinkIcon from "./assets/statsLinkIcon.svg";
import { shortAddress } from "../../functions/shortAddress";
import calculatorIcon from "../calculator/assets/calculator.svg";
import xMark from "../calculator/assets/xMark.svg";
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

export default function stakeAvax30({
  staking,
  apr,
  liquidity = "ETH",
  lock,
  expiration_time,
  fee,
  chainId,
  coinbase,
  lockTime,
  listType,
  renderedPage,
  handleSwitchNetwork,
  expired,
  finalApr,
}) {
  let { reward_token, BigNumber, alertify, reward_token_idyp, token_dypsavax } =
    window;
  let token_symbol = "DYP";

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

  class StakeAvax30 extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        token_balance: "",
        pendingDivs: "",
        totalEarnedTokens: "",
        cliffTime: "",
        stakingTime: "",
        depositedTokens: "",
        lastClaimedTime: "",
        errorMsg: "",
        errorMsg2: "",
        errorMsg3: "",

        depositAmount: "",
        withdrawAmount: "",
        depositLoading: false,
        depositStatus: "initial",
        claimStatus: "initial",
        claimLoading: false,
        reInvestLoading: false,
        reInvestStatus: "initial",
        selectedTokenLogo: "wavax",
        selectedRewardTokenLogo1: "wavax",
        selectedRewardTokenLogo2: "dyp",
        withdrawLoading: false,
        withdrawStatus: "initial",
        showWithdrawModal: false,
        showCalculator: false,

        coinbase: "0x0000000000000000000000000000000000000111",
        tvl: "",
        referralFeeEarned: "",
        stakingOwner: null,
        approxDeposit: 100,
        approxDays: 365,

        usdPerToken: "",

        contractDeployTime: "",
        disburseDuration: "",

        apy: 0,
        show: false,
        popup: false,
        is_wallet_connected: false,
        apy1: 0,
        apy2: 0,
        performanceTooltip: false,
        aprTooltip: false,
        lockTooltip: false,
        depositTooltip: false,
        rewardsTooltip: false,
        withdrawTooltip: false,
        tokendata: 0,
      };

      this.showModal = this.showModal.bind(this);
      this.hideModal = this.hideModal.bind(this);

      this.showPopup = this.showPopup.bind(this);
      this.hidePopup = this.hidePopup.bind(this);
    }

    showModal = () => {
      this.setState({ show: true });
    };

    hideModal = () => {
      this.setState({ show: false });
    };

    showPopup = () => {
      this.setState({ popup: true });
    };

    hidePopup = () => {
      this.setState({ popup: false });
    };

    handleListDownload = async (e) => {
      e.preventDefault();
      let m = window.alertify.message(`Processing...`);
      m.ondismiss = () => false;
      let step = 100;
      let stakers = [];
      let stakingTimes = [];
      let lastClaimedTimes = [];
      let stakedTokens = [];
      let length = await staking.getNumberOfHolders();
      length = Number(length);
      try {
        for (let startIndex = 0; startIndex < length; startIndex += step) {
          console.log({ startIndex, endIndex: startIndex + step });
          let array = await staking.getStakersList(
            startIndex,
            Math.min(startIndex + step, length)
          );
          console.log(array);
          stakers = stakers.concat(array.stakers);
          stakingTimes = stakingTimes.concat(array.stakingTimestamps);
          lastClaimedTimes = lastClaimedTimes.concat(
            array.lastClaimedTimeStamps
          );
          stakedTokens = stakedTokens.concat(array.stakedTokens);
        }
        let result = { stakers, stakingTimes, lastClaimedTimes, stakedTokens };
        window.handleDownload(result);
      } catch (e) {
        console.error(e);
        alertify.error("Something went wrong while processing!");
      } finally {
        m.ondismiss = (f) => true;
        m.dismiss();
      }
    };

    getUsdPerDyp = async () => {
      await axios
        .get("https://api.dyp.finance/api/the_graph_eth_v2")
        .then((data) => {
          const propertyDyp = Object.entries(
            data.data.the_graph_eth_v2.token_data
          );
          this.setState({ tokendata: propertyDyp[0][1].token_price_usd });
        });
    };

    componentDidMount() {
      if (this.props.coinbase !== this.state.coinbase) {
        this.setState({ coinbase: this.props.coinbase });
      }

      // this.refreshBalance();
      window._refreshBalInterval = setInterval(this.refreshBalance, 3000);
      this.getUsdPerDyp();

      this.getPriceDYP();
    }

    getTotalTvl = async () => {
      let { the_graph_result } = this.props;
      let usd_per_token = the_graph_result.token_data
        ? the_graph_result.token_data[
            "0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
          ].token_price_usd
        : 1;
      let usd_per_idyp = the_graph_result.token_data
        ? the_graph_result.token_data[
            "0xbd100d061e120b2c67a24453cf6368e63f1be056"
          ].token_price_usd
        : 1;

      let apr1 = 25;
      let apr2 = 50;
      let apy1 = new BigNumber(apr1)
        .div(1e2)
        .times(usd_per_idyp)
        .div(usd_per_token)
        .times(1e2)
        .toFixed(2);

      let apy2 = new BigNumber(apr2)
        .div(1e2)
        .times(usd_per_idyp)
        .div(usd_per_token)
        .times(1e2)
        .toFixed(2);

      this.setState({ apy1, apy2 });
    };

    getPriceDYP = async () => {
      let usdPerToken = await window.getPrice("defi-yield-protocol");
      this.setState({ usdPerToken });
    };

    componentWillUnmount() {
      clearInterval(window._refreshBalInterval);
    }

    handleDeposit = (e) => {
      // e.preventDefault();
      let amount = this.state.depositAmount;
      amount = new BigNumber(amount).times(1e18).toFixed(0);
      staking.depositTOKEN(amount);
    };

    handleApprove = (e) => {
      // e.preventDefault();
      this.setState({ depositLoading: true });

      let amount = this.state.depositAmount;
      amount = new BigNumber(amount).times(1e18).toFixed(0);
      reward_token
        .approve(staking._address, amount)
        .then(() => {
          this.setState({ depositLoading: false, depositStatus: "deposit" });
        })
        .catch((e) => {
          this.setState({ depositLoading: false, depositStatus: "fail" });
          this.setState({ errorMsg: e?.message });
          setTimeout(() => {
            this.setState({
              depositStatus: "initial",
              depositAmount: "",
              errorMsg: "",
            });
          }, 2000);
        });
    };
    // handleStake = (e) => {
    //     let amount = this.state.depositAmount
    //     amount = new BigNumber(amount).times(1e18).toFixed(0)
    //     let referrer = this.props.referrer
    //
    //     if (referrer) {
    //         referrer = String(referrer).trim().toLowerCase()
    //     }
    //
    //     if (!window.web3.utils.isAddress(referrer)) {
    //         referrer = window.config.ZERO_ADDRESS
    //     }
    //     staking.stake(amount, referrer)
    // }

    handleStake = async (e) => {
      // e.preventDefault();
      this.setState({ depositLoading: true });

      let amount = this.state.depositAmount;
      amount = new BigNumber(amount).times(1e18).toFixed(0);
      let referrer = this.props.referrer;

      if (referrer) {
        referrer = String(referrer).trim().toLowerCase();
      }

      if (!window.web3.utils.isAddress(referrer)) {
        referrer = window.config.ZERO_ADDRESS;
      }

      let referralFee = new BigNumber(amount).times(500).div(1e4).toFixed(0);
      //console.log({referralFee})
      //let selectedBuybackToken = this.state.selectedBuybackToken

      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      );
      let router = await window.getPangolinRouterContract();
      let WETH = await router.methods.WAVAX().call();
      let platformTokenAddress = window.config.reward_token_address;
      let rewardTokenAddress = window.config.reward_token_idyp_address;
      let path = [
        ...new Set(
          [rewardTokenAddress, WETH, platformTokenAddress].map((a) =>
            a.toLowerCase()
          )
        ),
      ];
      let _amountOutMin_referralFee = await router.methods
        .getAmountsOut(referralFee, path)
        .call()
        .catch((e) => {
          this.setState({ depositLoading: false, depositStatus: "fail" });
          this.setState({ errorMsg: e?.message });
          setTimeout(() => {
            this.setState({
              depositStatus: "initial",
              depositAmount: "",
              errorMsg: "",
            });
          }, 10000);
        });
      //console.log({_amountOutMin_referralFee})
      _amountOutMin_referralFee =
        _amountOutMin_referralFee[_amountOutMin_referralFee.length - 1];
      _amountOutMin_referralFee = new BigNumber(_amountOutMin_referralFee)
        .times(100 - window.config.slippage_tolerance_percent)
        .div(100)
        .toFixed(0);
      referralFee = referralFee - _amountOutMin_referralFee;
      referralFee = referralFee.toString();

      console.log({ amount, referrer, referralFee, deadline });

      staking
        .stake(amount, referrer, 0, deadline)
        .then(() => {
          this.setState({ depositLoading: false, depositStatus: "success" });
        })
        .catch((e) => {
          this.setState({ depositLoading: false, depositStatus: "fail" });
          this.setState({ errorMsg: e?.message });
          setTimeout(() => {
            this.setState({
              depositStatus: "initial",
              depositAmount: "",
              errorMsg: "",
            });
          }, 10000);
        });
    };

    handleWithdraw = async (e) => {
      // e.preventDefault();
      this.setState({ withdrawLoading: true });

      let amount = this.state.withdrawAmount;
      amount = new BigNumber(amount).times(1e18).toFixed(0);

      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      );

      staking
        .unstake(amount, 0, deadline)
        .then(() => {
          this.setState({ withdrawStatus: "success" });
          this.setState({ withdrawLoading: false });
        })
        .catch((e) => {
          this.setState({ withdrawStatus: "failed" });
          this.setState({ withdrawLoading: false });
          this.setState({ errorMsg3: e?.message });
          setTimeout(() => {
            this.setState({
              withdrawStatus: "initial",
              withdrawAmount: "",
              errorMsg3: "",
            });
          }, 10000);
        });
    };

    handleClaimDivs = async (e) => {
      // e.preventDefault();
      this.setState({ claimLoading: true });
      // this.setState({ claimStatus: "claim" });

      let address = this.props.coinbase;
      let amount = await staking.getTotalPendingDivs(address);

      let router = await window.getPangolinRouterContract();
      let WETH = await router.methods.WAVAX().call();
      let platformTokenAddress = window.config.reward_token_address;
      let rewardTokenAddress = window.config.reward_token_idyp_address;
      let path = [
        ...new Set(
          [rewardTokenAddress, WETH, platformTokenAddress].map((a) =>
            a.toLowerCase()
          )
        ),
      ];
      let _amountOutMin = await router.methods
        .getAmountsOut(amount, path)
        .call()
        .catch((e) => {
          this.setState({ claimStatus: "failed" });
          this.setState({ claimLoading: false });
          this.setState({ errorMsg2: e?.message });
          setTimeout(() => {
            this.setState({ claimStatus: "initial", errorMsg2: "" });
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

      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      );

      console.log({ referralFee, _amountOutMin, deadline });

      staking
        .claim(0, _amountOutMin, deadline)
        .then(() => {
          this.setState({ claimStatus: "success" });
          this.setState({
            claimLoading: false,
            pendingDivs: getFormattedNumber(0, 6),
          });
        })
        .catch((e) => {
          this.setState({ claimStatus: "failed" });
          this.setState({ claimLoading: false });
          this.setState({ errorMsg2: e?.message });
          setTimeout(() => {
            this.setState({ claimStatus: "initial", errorMsg2: "" });
          }, 10000);
        });
    };

    handleSetMaxDeposit = (e) => {
      e.preventDefault();
      this.setState({
        depositAmount: new BigNumber(this.state.token_balance)
          .div(1e18)
          .toFixed(18),
      });
      this.checkApproval(this.state.token_balance);
    };
    handleSetMaxWithdraw = (e) => {
      e.preventDefault();
      this.setState({
        withdrawAmount: new BigNumber(this.state.depositedTokens)
          .div(1e18)
          .toFixed(18),
      });
    };

    getAPY = () => {
      return apr;
    };

    refreshBalance = async () => {
      let coinbase = this.state.coinbase;

      if (window.coinbase_address) {
        coinbase = window.coinbase_address;
        this.setState({ coinbase });
      }

      this.getTotalTvl();

      let lp_data = this.props.the_graph_result.token_data;
      //console.log({lp_data})

      //Calculate APY
      let { the_graph_result } = this.props;
      let usd_per_token = the_graph_result.token_data
        ? the_graph_result.token_data[
            "0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
          ].token_price_usd
        : 1;
      let usd_per_idyp = the_graph_result.token_data
        ? the_graph_result.token_data[
            "0xbd100d061e120b2c67a24453cf6368e63f1be056"
          ].token_price_usd
        : 1;
      let apy = new BigNumber(apr)
        .minus(fee)
        .div(1e2)
        .times(usd_per_idyp)
        .div(usd_per_token)
        .times(1e2)
        .toFixed(2);

      this.setState({ apy });

      // let usd_per_dyps = this.props.the_graph_result.price_DYPS ? this.props.the_graph_result.price_DYPS : 1
      let usd_per_dyps = 0;

      try {
        let amount = new BigNumber(1000000000000000000).toFixed(0);
        let router = await window.getPangolinRouterContract();
        let WETH = await router.methods.WAVAX().call();
        let platformTokenAddress = window.config.USDCe_address;
        let rewardTokenAddress = window.config.reward_token_idyp_address;
        let path = [
          ...new Set(
            [rewardTokenAddress, WETH, platformTokenAddress].map((a) =>
              a.toLowerCase()
            )
          ),
        ];
        let _amountOutMin = await router.methods
          .getAmountsOut(amount, path)
          .call();
        _amountOutMin = _amountOutMin[_amountOutMin.length - 1];
        _amountOutMin = new BigNumber(_amountOutMin).div(1e6).toFixed(18);

        let _bal = reward_token.balanceOf(this.state.coinbase);
        let _pDivs = staking.getTotalPendingDivs(this.state.coinbase);

        let _tEarned = staking.totalEarnedTokens(this.state.coinbase);

        let _stakingTime = staking.stakingTime(this.state.coinbase);

        let _dTokens = staking.depositedTokens(this.state.coinbase);

        let _lClaimTime = staking.lastClaimedTime(this.state.coinbase);

        let _tvl = reward_token.balanceOf(staking._address);

        let _rFeeEarned = staking.totalReferralFeeEarned(this.state.coinbase);

        let tStakers = staking.getNumberOfHolders();

        //Take iDYP Balance on Staking
        let _tvlConstantiDYP = reward_token_idyp.balanceOf(
          staking._address
        ); /* TVL of iDYP on Staking */

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
          tvlConstantiDYP,
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
          _tvlConstantiDYP,
          _tvlDYPS,
        ]);

        //console.log({tvl, tvlConstantiDYP, _amountOutMin})

        let usdValueiDYP = new BigNumber(tvlConstantiDYP)
          .times(_amountOutMin)
          .toFixed(18);
        let usd_per_lp = lp_data
          ? lp_data[window.reward_token["_address"]].token_price_usd
          : 0;
        let tvlUSD = new BigNumber(tvl)
          .times(usd_per_lp)
          .plus(usdValueiDYP)
          .toFixed(18);
        //console.log({tvlUSD})

        let tvlDyps = new BigNumber(tvlDYPS).times(usd_per_dyps).toFixed(18);

        this.setState({
          token_balance,
          pendingDivs,
          totalEarnedTokens,
          stakingTime,
          depositedTokens,
          lastClaimedTime,
          tvl,
          tvlDyps,
          referralFeeEarned,
          total_stakers,
          tvlUSD,
        });
        let stakingOwner = await staking.owner();
        this.setState({ stakingOwner });
      } catch (e) {
        console.error(e);
      }

      staking
        .LOCKUP_TIME()
        .then((cliffTime) => {
          this.setState({ cliffTime: Number(cliffTime) });
        })
        .catch(console.error);

      staking.contractStartTime().then((contractDeployTime) => {
        this.setState({ contractDeployTime });
      });

      staking.REWARD_INTERVAL().then((disburseDuration) => {
        this.setState({ disburseDuration });
      });
    };

    getUsdPerETH = () => {
      return this.props.the_graph_result.usd_per_eth || 0;
    };

    getApproxReturn = () => {
      let approxDays = this.state.approxDays;
      let approxDeposit = this.state.approxDeposit;

      return ((approxDeposit * this.state.apy) / 100 / 365) * approxDays;
    };

    getReferralLink = () => {
      return (
        window.location.origin +
        window.location.pathname +
        "?r=" +
        this.state.coinbase
      );
    };

    handleReinvest = async (e) => {
      // e.preventDefault();

      let address = this.state.coinbase;
      let amount = await staking.getTotalPendingDivs(address);

      let router = await window.getPangolinRouterContract();
      let WETH = await router.methods.WAVAX().call();
      let platformTokenAddress = window.config.reward_token_address;
      let rewardTokenAddress = window.config.reward_token_idyp_address;
      let path = [
        ...new Set(
          [rewardTokenAddress, WETH, platformTokenAddress].map((a) =>
            a.toLowerCase()
          )
        ),
      ];
      let _amountOutMin = await router.methods
        .getAmountsOut(amount, path)
        .call()
        .catch((e) => {
          this.setState({ reInvestStatus: "failed" });
          this.setState({ reInvestLoading: false });
          this.setState({ errorMsg2: e?.message });
          setTimeout(() => {
            this.setState({ reInvestStatus: "initial", errorMsg2: "" });
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

      console.log({ referralFee, _amountOutMin, deadline });

      staking
        .reInvest(0, 0, deadline)
        .then(() => {
          this.setState({ reInvestStatus: "success" });
          this.setState({
            reInvestLoading: false,
            pendingDivs: getFormattedNumber(0, 6),
          });
        })
        .catch((e) => {
          this.setState({ reInvestStatus: "failed" });
          this.setState({ reInvestLoading: false });
          this.setState({ errorMsg2: e?.message });
          setTimeout(() => {
            this.setState({ reInvestStatus: "initial", errorMsg2: "" });
          }, 10000);
        });
    };

    convertTimestampToDate = (timestamp) => {
      const result = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(timestamp * 1000);
      return result;
    };

    handleAvaxPool = async () => {
      await handleSwitchNetworkhook("0xa86a")
        .then(() => {
          this.props.handleSwitchNetwork("43114");
        })
        .catch((e) => {
          console.log(e);
        });
    };

    render() {
      let {
        disburseDuration,
        contractDeployTime,
        cliffTime,
        referralFeeEarned,
        token_balance,
        pendingDivs,
        totalEarnedTokens,
        depositedTokens,
        stakingTime,
        coinbase,
        tvl,
      } = this.state;

      token_balance = new BigNumber(token_balance).div(1e18).toString(10);
      token_balance = getFormattedNumber(token_balance, 6);

      let { the_graph_result } = this.props;

      let usd_per_token = the_graph_result.token_data
        ? the_graph_result.token_data[
            "0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
          ].token_price_usd
        : 1;
      let usd_per_idyp = the_graph_result.token_data
        ? the_graph_result.token_data[
            "0xbd100d061e120b2c67a24453cf6368e63f1be056"
          ].token_price_usd
        : 1;

      pendingDivs = new BigNumber(pendingDivs)
        .div(10 ** TOKEN_DECIMALS)
        .times(usd_per_idyp)
        .div(usd_per_token)
        .toString(10);
      pendingDivs = getFormattedNumber(pendingDivs, 6);

      totalEarnedTokens = new BigNumber(totalEarnedTokens)
        .div(10 ** TOKEN_DECIMALS)
        .toString(10);
      totalEarnedTokens = getFormattedNumber(totalEarnedTokens, 6);

      referralFeeEarned = getFormattedNumber(referralFeeEarned / 1e18, 6);

      depositedTokens = new BigNumber(depositedTokens).div(1e18).toString(10);
      depositedTokens = getFormattedNumber(depositedTokens, 6);

      tvl = new BigNumber(tvl).div(1e18).toString(10);
      tvl = getFormattedNumber(tvl, 6);

      stakingTime = stakingTime;
      cliffTime = cliffTime;

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
      // console.log(Number(stakingTime)+ Number(cliffTime))
      let total_stakers = this.state.total_stakers;
      //let tvl_usd = this.state.tvl / 1e18 * this.state.usdPerToken
      let tvl_usd = this.state.tvlUSD / 1e18;

      let tvlDYPS = this.state.tvlDyps / 1e18;
      tvl_usd = tvl_usd + tvlDYPS;
      tvl_usd = getFormattedNumber(tvl_usd, 2);
      total_stakers = getFormattedNumber(total_stakers, 0);

      //console.log(total_stakers)

      let isOwner =
        String(this.state.coinbase).toLowerCase() ===
        String(window.config.admin_address).toLowerCase();

      let id = Math.random().toString(36);

      let is_connected = this.props.is_wallet_connected;

      // let apy = new BigNumber(apr).div(1e2).times(usd_per_idyp).div(usd_per_token).times(1e2).toFixed(2)

      //this.setState({apy})

      const performanceOpen = () => {
        this.setState({ performanceTooltip: true });
      };
      const performanceClose = () => {
        this.setState({ performanceTooltip: false });
      };
      const aprOpen = () => {
        this.setState({ aprTooltip: true });
      };
      const aprClose = () => {
        this.setState({ aprTooltip: false });
      };
      const lockOpen = () => {
        this.setState({ lockTooltip: true });
      };
      const lockClose = () => {
        this.setState({ lockTooltip: false });
      };
      const depositOpen = () => {
        this.setState({ depositTooltip: true });
      };
      const depositClose = () => {
        this.setState({ depositTooltip: false });
      };
      const rewardsOpen = () => {
        this.setState({ rewardsTooltip: true });
      };
      const rewardsClose = () => {
        this.setState({ rewardsTooltip: false });
      };
      const withdrawOpen = () => {
        this.setState({ withdrawTooltip: true });
      };
      const withdrawClose = () => {
        this.setState({ withdrawTooltip: false });
      };

      const focusInput = (field) => {
        document.getElementById(field).focus();
      };

      const checkApproval = async (amount) => {
        const result = await window
          .checkapproveStakePool(
            this.state.coinbase,
            reward_token._address,
            staking._address
          )
          .then((data) => {
            console.log(data);
            return data;
          });

        let result_formatted = new BigNumber(result).div(1e18).toFixed(6);

        if (
          Number(result_formatted) >= Number(amount) &&
          Number(result_formatted) !== 0
        ) {
          this.setState({ depositStatus: "deposit" });
        } else {
          this.setState({ depositStatus: "initial" });
        }
      };

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
                              open={this.state.performanceTooltip}
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
                              open={this.state.aprTooltip}
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
                              open={this.state.lockTooltip}
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
                        onClick={() => this.setState({ showCalculator: true })}
                      >
                        <img src={poolsCalculatorIcon} alt="" />
                        Calculator
                      </h6>
                      <a
                        href={
                          // chainId === 1
                          // ?
                          "https://app.pangolin.exchange/#/swap?&outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
                          // : "https://app.pangolin.exchange/#/swap?outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
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
                          this.showPopup();
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
                    {this.props.coinbase === null ||
                    this.props.coinbase === undefined ||
                    this.props.isConnected === false ? (
                      <button
                        className="connectbtn btn"
                        onClick={this.showModal}
                        style={{
                          width: renderedPage === "dashboard" && "100%",
                          fontSize: renderedPage === "dashboard" && "10px",
                        }}
                      >
                        {" "}
                        <img src={wallet} alt="" /> Connect wallet
                      </button>
                    ) : chainId === "43114" ? (
                      <div className="addressbtn btn">
                        <Address a={this.props.coinbase} chainId={43114} />
                      </div>
                    ) : (
                      <button
                        className="connectbtn btn"
                        onClick={() => {
                          this.handleAvaxPool();
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
                  className={`otherside-border col-12 col-md-12 col-lg-4 ${
                    chainId !== "43114" || this.props.expired === true
                      ? "blurrypool"
                      : ""
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
                            ? token_balance
                            : getFormattedNumber(0, 6)}{" "}
                          {token_symbol}
                        </b>
                      </h6>
                    </div>
                    <ClickAwayListener onClickAway={depositClose}>
                      <Tooltip
                        open={this.state.depositTooltip}
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
                              Number(this.state.depositAmount) > 0
                                ? this.state.depositAmount
                                : this.state.depositAmount
                            }
                            onChange={(e) => {
                              this.setState({
                                depositAmount: e.target.value,
                              });
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
                            onClick={() => focusInput("amount_deposit")}
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
                          onClick={this.handleSetMaxDeposit}
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
                          this.state.depositAmount === "" ||
                          this.state.depositLoading === true
                            ? true
                            : false
                        }
                        className={`btn filledbtn ${
                          this.state.depositAmount === "" &&
                          this.state.depositStatus === "initial" &&
                          "disabled-btn"
                        } ${
                          this.state.depositStatus === "deposit" ||
                          this.state.depositStatus === "success"
                            ? "success-button"
                            : this.state.depositStatus === "fail"
                            ? "fail-button"
                            : null
                        } d-flex justify-content-center align-items-center gap-2`}
                        onClick={() => {
                          this.state.depositStatus === "deposit"
                            ? this.handleStake()
                            : this.state.depositStatus === "initial" &&
                              this.state.depositAmount !== ""
                            ? this.handleApprove()
                            : console.log("");
                        }}
                      >
                        {this.state.depositLoading ? (
                          <div
                            class="spinner-border spinner-border-sm text-light"
                            role="status"
                          >
                            <span class="visually-hidden">Loading...</span>
                          </div>
                        ) : this.state.depositStatus === "initial" ? (
                          <>Approve</>
                        ) : this.state.depositStatus === "deposit" ? (
                          <>Deposit</>
                        ) : this.state.depositStatus === "success" ? (
                          <>Success</>
                        ) : (
                          <>
                            <img src={failMark} alt="" />
                            Failed
                          </>
                        )}
                      </button>
                    </div>
                    {this.state.errorMsg && (
                      <h6 className="errormsg">{this.state.errorMsg}</h6>
                    )}
                  </div>
                </div>
                <div
                  className={`otherside-border col-12 col-md-12 col-lg-4 ${
                    chainId !== "43114" && "blurrypool"
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
                          open={this.state.rewardsTooltip}
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
                          DYP
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
                            this.state.claimStatus === "claimed" ||
                            this.state.claimStatus === "success" ||
                            pendingDivs <= 0
                              ? true
                              : false
                          }
                          className={`btn filledbtn ${
                            (this.state.claimStatus === "claimed" &&
                              this.state.claimStatus === "initial") ||
                            pendingDivs <= 0
                              ? "disabled-btn"
                              : this.state.claimStatus === "failed"
                              ? "fail-button"
                              : this.state.claimStatus === "success"
                              ? "success-button"
                              : null
                          } d-flex justify-content-center align-items-center gap-2`}
                          style={{ height: "fit-content" }}
                          onClick={this.handleClaimDivs}
                        >
                          {this.state.claimLoading ? (
                            <div
                              class="spinner-border spinner-border-sm text-light"
                              role="status"
                            >
                              <span class="visually-hidden">Loading...</span>
                            </div>
                          ) : this.state.claimStatus === "failed" ? (
                            <>
                              <img src={failMark} alt="" />
                              Failed
                            </>
                          ) : this.state.claimStatus === "success" ? (
                            <>Success</>
                          ) : (
                            <>Claim</>
                          )}
                        </button>

                        {this.props.expired === false && (
                          <button
                            disabled={pendingDivs > 0 ? false : true}
                            className={`btn outline-btn ${
                              this.state.reInvestStatus === "invest" ||
                              pendingDivs <= 0
                                ? "disabled-btn"
                                : this.state.reInvestStatus === "failed"
                                ? "fail-button"
                                : this.state.reInvestStatus === "success"
                                ? "success-button"
                                : null
                            } d-flex justify-content-center align-items-center gap-2`}
                            style={{ height: "fit-content" }}
                            onClick={this.handleReinvest}
                          >
                            {this.state.reInvestLoading ? (
                              <div
                                class="spinner-border spinner-border-sm text-light"
                                role="status"
                              >
                                <span class="visually-hidden">Loading...</span>
                              </div>
                            ) : this.state.reInvestStatus === "failed" ? (
                              <>
                                <img src={failMark} alt="" />
                                Failed
                              </>
                            ) : this.state.reInvestStatus === "success" ? (
                              <>Success</>
                            ) : (
                              <>Reinvest</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    {this.state.errorMsg2 && (
                      <h6 className="errormsg">{this.state.errorMsg2}</h6>
                    )}
                  </div>
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
                        open={this.state.withdrawTooltip}
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
                    disabled={
                      Number(this.state.depositedTokens) > 0 ? false : true
                    }
                    className={"outline-btn btn"}
                    onClick={() => {
                      this.setState({ showWithdrawModal: true });
                    }}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
          {this.state.popup && (
            <Modal
              visible={this.state.popup}
              modalId="tymodal"
              title="stats"
              setIsVisible={() => {
                this.setState({ popup: false });
              }}
              width="fit-content"
            >
              <div className="earn-hero-content p4token-wrapper">
                <div className="l-box pl-3 pr-3">
                  <div className="container px-0">
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
                          {depositedTokens} DYP
                        </h6>
                      </div>
                      <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                        <span className="stats-card-title">My DYP Balance</span>
                        <h6 className="stats-card-content">
                          {token_balance} DYP
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
                        <span className="stats-card-title">
                          Total DYP Locked
                        </span>
                        <h6 className="stats-card-content">{tvl} DYP</h6>
                      </div>
                      <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                        <span className="stats-card-title">TVL USD</span>
                        <h6 className="stats-card-content">${tvl_usd} USD</h6>
                      </div>
                      <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                        <span className="stats-card-title">
                          Contract Expiration
                        </span>
                        <h6 className="stats-card-content">
                          {expiration_time}
                        </h6>
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
                                      setTimeout(
                                        () => ReactTooltip.hide(),
                                        2000
                                      );
                                    }}
                                    data-event="click"
                                    data-for={id}
                                    data-tip="Copied To Clipboard!"
                                    data-clipboard-text={this.getReferralLink()}
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
                              Refferal link gives you 5% for each invite friend
                              you bring to buy DYP example
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
                            data-clipboard-text={this.getReferralLink()}
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
                          href={`${window.config.snowtrace_baseURL}/token/${reward_token._address}?a=${coinbase}`}
                          className="stats-link"
                        >
                          View transaction <img src={statsLinkIcon} alt="" />
                        </a>
                      </div>
                    </div>
                    <div className="mt-4">
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
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {this.state.showWithdrawModal && (
            <Modal
              visible={this.state.showWithdrawModal}
              modalId="withdrawmodal"
              title="withdraw"
              setIsVisible={() => {
                this.setState({ showWithdrawModal: false });
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
                                  (Number(stakingTime) + Number(cliffTime))*1000
                                }
                                renderer={renderer}
                                onComplete={() => {
                                  canWithdraw = true;
                                }}
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
                            {depositedTokens} {token_symbol}
                          </h6>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <div className="input-container px-0">
                          <input
                            type="number"
                            autoComplete="off"
                            value={this.state.withdrawAmount}
                            onChange={(e) =>
                              this.setState({
                                withdrawAmount: e.target.value,
                              })
                            }
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
                          onClick={this.handleSetMaxWithdraw}
                        >
                          Max
                        </button>
                      </div>

                      <div className="d-flex flex-column align-items-start justify-content-between gap-2 mt-4">
                        <button
                          disabled={
                            this.state.withdrawStatus === "failed" ||
                            this.state.withdrawStatus === "success" ||
                            this.state.withdrawAmount === "" ||
                            canWithdraw === false
                              ? true
                              : false
                          }
                          className={` w-100 btn filledbtn ${
                            this.state.withdrawStatus === "failed"
                              ? "fail-button"
                              : this.state.withdrawStatus === "success"
                              ? "success-button"
                              : (this.state.withdrawAmount === "" &&
                                  this.state.withdrawStatus === "initial") ||
                                canWithdraw === false
                              ? "disabled-btn"
                              : null
                          } d-flex justify-content-center align-items-center`}
                          style={{ height: "fit-content" }}
                          onClick={() => {
                            this.handleWithdraw();
                          }}
                        >
                          {this.state.withdrawLoading ? (
                            <div
                              class="spinner-border spinner-border-sm text-light"
                              role="status"
                            >
                              <span class="visually-hidden">Loading...</span>
                            </div>
                          ) : this.state.withdrawStatus === "failed" ? (
                            <>
                              <img src={failMark} alt="" />
                              Failed
                            </>
                          ) : this.state.withdrawStatus === "success" ? (
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
                      {this.state.errorMsg3 && (
                        <h6 className="errormsg">{this.state.errorMsg3}</h6>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {this.state.show && (
            <WalletModal
              show={this.state.show}
              handleClose={this.hideModal}
              handleConnection={()=>{this.props.handleConnection(); this.setState({show: false})}}
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
            />
            Calculator
          </div> */}

          {this.state.showCalculator && (
            <Modal
              visible={this.state.showCalculator}
              title="calculator"
              modalId="calculatormodal"
              setIsVisible={() => this.setState({ showCalculator: false })}
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
                      value={this.state.approxDays}
                      onChange={(e) =>
                        this.setState({
                          approxDays: e.target.value,
                        })
                      }
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
                      value={this.state.approxDeposit}
                      onChange={(e) =>
                        this.setState({
                          approxDeposit: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="d-flex flex-column gap-2 mt-4">
                  <h3 style={{ fontWeight: "500", fontSize: "39px" }}>
                    ${" "}
                    {getFormattedNumber(
                      this.getApproxReturn() * this.state.tokendata,
                      6
                    )}{" "}
                    USD
                  </h3>
                  <h6
                    style={{
                      fontWeight: "300",
                      fontSize: "15px",
                      color: "#f7f7fc",
                    }}
                  >
                    Approx {getFormattedNumber(this.getApproxReturn(), 2)} DYP
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
                    *This calculator is for informational purposes only.
                    Calculated yields assume that prices of the deposited assets
                    don't change.
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
        //         <Popup show={this.state.popup} handleClose={this.hidePopup}>
        //           <div className="earn-hero-content p4token-wrapper">
        //             <p className="h3">
        //               <b>DYP Staking</b>
        //             </p>
        //             <p>
        //               Stake your DYP tokens and earn{" "}
        //               {this.state.apy2 == 0 ? (
        //                 <Dots />
        //               ) : (
        //                 getFormattedNumber(this.state.apy2, 0)
        //               )}
        //               % APR with no Impermanent Loss.
        //             </p>
        //             <p>
        //               To start earning, all you need is to deposit DYP tokens
        //               into the Staking contract. You can choose from two
        //               different staking options, with rewards starting from{" "}
        //               {this.state.apy1 == 0 ? (
        //                 <Dots />
        //               ) : (
        //                 getFormattedNumber(this.state.apy1, 0)
        //               )}
        //               % APR up to{" "}
        //               {this.state.apy2 == 0 ? (
        //                 <Dots />
        //               ) : (
        //                 getFormattedNumber(this.state.apy2, 0)
        //               )}
        //               % APR, depending on the lock time from a minimum of
        //               zero-days up to a maximum of 90 days.
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
        //                       "https://www.youtube.com/watch?v=s9gwo3J119U&t=5s",
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
        //               <div className="col-lg-6">
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
        //                           "linear-gradient(257.76deg, #E84142 6.29%, #CB2627 93.71%)",
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
        //                             src="img/icon/avax.svg"
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
        //                             Avalanche
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
        //                               href={`https://app.pangolin.exchange/#/swap?inputCurrency=${liquidity}&outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17`}
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
        //                         {fee}%<br />
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
        //                                 ? `${pendingDivs} DYP`
        //                                 : `${pendingDivs} DYP`
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
        //                       DYP
        //                     </p>
        //                   </form>
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
        //                       <th>Referral Fee Earned</th>
        //                       <td className="text-right">
        //                         <strong>{referralFeeEarned}</strong>{" "}
        //                         <small>DYP</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>TVL USD</th>
        //                       <td className="text-right">
        //                         <strong>${tvl_usd}</strong> <small>USD</small>
        //                       </td>
        //                     </tr>
        //                     {is_connected && (
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
        //                             View Transaction History on SnowTrace
        //                           </a>{" "}
        //                           &nbsp;{" "}
        //                           <i
        //                             style={{ fontSize: ".8rem" }}
        //                             className="fas fa-external-link-alt"
        //                           ></i>
        //                         </td>
        //                       </tr>
        //                     )}

        //                     {is_connected && (
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
    }
  }

  return StakeAvax30;
}
