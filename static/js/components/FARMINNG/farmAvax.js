import React from "react";
import moment from "moment";
import getFormattedNumber from "../../functions/get-formatted-number";
import Modal from "../Modal/Modal";
import Address from "./address";
import WalletModal from "../WalletModal";
import "./top-pools.css";
import ellipse from "./assets/ellipse.svg";
import empty from "./assets/empty.svg";
import check from "./assets/check.svg";
import failMark from "../../assets/failMark.svg";
import arrowup from "./assets/arrow-up.svg";
import moreinfo from "./assets/more-info.svg";
import stats from "./assets/stats.svg";
import purplestats from "./assets/purpleStat.svg";
import wallet from "./assets/wallet.svg";
import Tooltip from "@material-ui/core/Tooltip";
import Countdown from "react-countdown";
import whiteArrowUp from "./assets/whiteArrowUp.svg";
import dropdownVector from "./assets/dropdownVector.svg";
import calculatorIcon from "../calculator/assets/calculator.svg";
import xMark from "../calculator/assets/xMark.svg";
import statsLinkIcon from "./assets/statsLinkIcon.svg";
import { shortAddress } from "../../functions/shortAddress";
import axios from "axios";
import poolStatsIcon from "./assets/poolStatsIcon.svg";
import poolsCalculatorIcon from "./assets/poolsCalculatorIcon.svg";
import { ClickAwayListener } from "@material-ui/core";
import { handleSwitchNetworkhook } from "../../functions/hooks";

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

export default function initFarmAvax({
  token,
  staking,
  constant,
  liquidity,
  lp_symbol,
  reward,
  lock,
  rebase_factor,
  expiration_time,
  fee,
  coinbase,
  chainId,
  lockTime,
  listType,
  handleSwitchNetwork,
  expired,
  finalApr

}) {
  let { reward_token, BigNumber, alertify, reward_token_idyp, token_dypsavax } =
    window;

  // token, staking

  const LP_AMPLIFY_FACTOR = rebase_factor || window.config.lp_amplify_factor;

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

  class FarmAvax extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        token_balance: "",
        reward_token_balance: "",
        pendingDivs: "",
        totalEarnedTokens: "",
        cliffTime: "",
        stakingTime: "",
        depositedTokens: "",
        lastClaimedTime: "",
        depositAmount: "",
        withdrawAmount: 0,
        totalEarnedEth: "",
        pendingDivsEth: "",
        showCalculator: false,
        iDypUSD: 0,
        dypUSD: 0,
        usdPerToken: 0,
        dypPerAvaxPrice: 0,
        tokensToBeSwapped: "",
        tokensToBeDisbursedOrBurnt: "",

        coinbase: "0x0000000000000000000000000000000000000111",
        tvl: "",
        stakingOwner: null,
        approxDeposit: 100 / LP_AMPLIFY_FACTOR,
        approxDays: 365,
        selectedTokenLogo: "wavax",
        selectedRewardTokenLogo1: "wavax",
        selectedRewardTokenLogo2: "dyp",
        showWithdrawModal: false,
        selectedPool: "",
        depositLoading: false,
        depositStatus: "initial",
        withdrawLoading: false,
        withdrawStatus: "initial",
        claimLoading: false,
        claimStatus: "initial",
        lastSwapExecutionTime: "",
        swapAttemptPeriod: "",
        errorMsg: "",
        errorMsg2: "",
        errorMsg3: "",
        contractDeployTime: "",
        disburseDuration: "",
        selectedBuybackToken: Object.keys(window.buyback_tokens_farmingavax)[0],
        selectedTokenDecimals:
          window.buyback_tokens_farmingavax[
            Object.keys(window.buyback_tokens_farmingavax)[0]
          ].decimals,
        selectedTokenBalance: "",
        selectedTokenSymbol:
          window.buyback_tokens_farmingavax[
            Object.keys(window.buyback_tokens_farmingavax)[0]
          ].symbol,

        selectedBuybackTokenWithdraw: Object.keys(
          window.buyback_tokens_farmingavax
        )[0],
        selectedClaimToken: 0,
        show: false,
        popup: false,
        is_wallet_connected: false,
        performanceTooltip: false,
        aprTooltip: false,
        lockTooltip: false,
        depositTooltip: false,
        rewardsTooltip: false,
        withdrawTooltip: false,
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
          let array = await staking.getDepositorsList(
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

    componentDidMount() {
      this.refreshBalance();

      // if (this.props.coinbase !== this.state.coinbase) {
        this.setState({ coinbase: coinbase });
      // }

      window._refreshBalInterval = setInterval(this.refreshBalance, 3000);

      this.getPriceDYP();
      this.getTokenData();
    }

    componentWillUnmount() {
      clearInterval(window._refreshBalInterval);
    }

    getTokenData = async () => {
      await axios
        .get("https://api.dyp.finance/api/the_graph_avax_v2")
        .then((data) => {
          const propertyDyp = Object.entries(
            data.data.the_graph_avax_v2.token_data
          );
          this.setState({ dypUSD: propertyDyp[0][1].token_price_usd });

          const propertyIDyp = Object.entries(
            data.data.the_graph_avax_v2.token_data
          );

          const dypPerAvax = data.data.the_graph_avax_v2.price_DYPS
          this.setState({dypPerAvaxPrice: dypPerAvax})
          
          this.setState({ iDypUSD: propertyIDyp[1][1].token_price_usd });
        });
    };

    getPriceDYP = async () => {
      let usdPerToken = await window.getPrice("defi-yield-protocol");
      this.setState({ usdPerToken });
    };

    handleDeposit = (e) => {
      //   e.preventDefault();
      let amount = this.state.depositAmount;
      amount = new BigNumber(amount).times(1e18).toFixed(0);
      staking.depositTOKEN(amount);
    };

    handleApprove = (e) => {
      //   e.preventDefault();
      this.setState({ depositLoading: true });

      let amount = this.state.depositAmount;
      amount = new BigNumber(amount)
        .times(10 ** this.state.selectedTokenDecimals)
        .toFixed(0);
      window
        .approveToken(this.state.selectedBuybackToken, staking._address, amount)
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

    handleSelectedTokenChange = async (tokenAddress) => {
      let tokenDecimals =
        window.buyback_tokens_farmingavax[tokenAddress].decimals;
      let selectedTokenSymbol =
        window.buyback_tokens_farmingavax[tokenAddress].symbol;
      this.setState({
        selectedBuybackToken: tokenAddress,
        selectedTokenBalance: "",
        selectedTokenDecimals: tokenDecimals,
        selectedTokenSymbol,
      });

      this.setState({
        selectedTokenLogo:
          window.buyback_tokens_farmingavax[tokenAddress].symbol,
      });
      let selectedTokenBalance = await window.getTokenHolderBalance(
        tokenAddress,
        coinbase
      );
      this.setState({ selectedTokenBalance });
    };

    handleSelectedTokenChangeWithdraw = async (tokenAddress) => {
      this.setState({ selectedBuybackTokenWithdraw: tokenAddress });
    };

    handleClaimToken = async (token) => {
      this.setState({ selectedClaimToken: token });
    };

    handleStake = async (e) => {
      let selectedBuybackToken = this.state.selectedBuybackToken;
      let amount = this.state.depositAmount;
      this.setState({ depositLoading: true });

      amount = new BigNumber(amount)
        .times(10 ** this.state.selectedTokenDecimals)
        .toFixed(0);

      let _75Percent = new BigNumber(amount).times(75e2).div(100e2).toFixed(0);
      let _25Percent = new BigNumber(amount).minus(_75Percent).toFixed(0);

      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      ).toFixed(0);
      let router = await window.getPangolinRouterContract();
      let WETH = await router.methods.WAVAX().call();
      let platformTokenAddress = window.config.reward_token_idyp_address;
      let platformTokenAddress_25Percent = window.config.reward_token_address;

      let path = [
        ...new Set(
          [selectedBuybackToken, WETH, platformTokenAddress].map((a) =>
            a.toLowerCase()
          )
        ),
      ];
      let _amountOutMin_75Percent = await router.methods
        .getAmountsOut(_75Percent, path)
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
      _amountOutMin_75Percent =
        _amountOutMin_75Percent[_amountOutMin_75Percent.length - 1];
      _amountOutMin_75Percent = new BigNumber(_amountOutMin_75Percent)
        .times(100 - window.config.slippage_tolerance_percent)
        .div(100)
        .toFixed(0);

      let path_25Percent = [
        ...new Set(
          [selectedBuybackToken, WETH, platformTokenAddress_25Percent].map(
            (a) => a.toLowerCase()
          )
        ),
      ];
      let _amountOutMin_25Percent = await router.methods
        .getAmountsOut(_25Percent, path_25Percent)
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
      _amountOutMin_25Percent =
        _amountOutMin_25Percent[_amountOutMin_25Percent.length - 1];
      _amountOutMin_25Percent = new BigNumber(_amountOutMin_25Percent)
        .times(100 - window.config.slippage_tolerance_percent)
        .div(100)
        .toFixed(0);

      let _amountOutMin_stakingReferralFee = new BigNumber(0).toFixed(0);

      //Deposit Parameters of Farm Contract
      /*
                depositToken,
                amountToStake,
                uint[] memory minAmounts,
                // uint _amountOutMin_25Percent, // 0
                // uint _amountOutMin_stakingReferralFee, // 1
                // uint amountLiquidityMin_rewardTokenReceived, // 2
                // uint amountLiquidityMin_baseTokenReceived, // 3
                // uint _amountOutMin_rewardTokenReceived, // 4
                // uint _amountOutMin_baseTokenReceived, // 5
                // uint _amountOutMin_claimAsToken_dyp, // 6
                // uint _amountOutMin_attemptSwap, // 7
                uint _deadline
            */
      let minAmounts = [0, 0, 0, 0, 0, 0, 0, 0];

      console.log({ selectedBuybackToken, amount, minAmounts, deadline });

      staking
        .deposit(selectedBuybackToken, amount, minAmounts, deadline)
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

    handleWithdrawDyp = async () => {
      let amountConstant = await constant.depositedTokens(coinbase);
      amountConstant = new BigNumber(amountConstant).toFixed(0);
      this.setState({ withdrawLoading: true });

      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      );

      //console.log({withdrawAsToken, amountBuyback, deadline})

      try {
        constant
          .unstake(amountConstant, 0, deadline)
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
                selectedPool: "",
                errorMsg3: "",
              });
            }, 10000);
          });
      } catch (e) {
        console.error(e);
        this.setState({ errorMsg3: e });
        setTimeout(() => {
          this.setState({
            withdrawStatus: "initial",
            selectedPool: "",
            errorMsg3: "",
          });
        }, 10000);
        return;
      }
    };

    handleWithdraw = async (e) => {
      // e.preventDefault();
      this.setState({ withdrawLoading: true });

      let amountConstant = await constant.depositedTokens(coinbase);
      amountConstant = new BigNumber(amountConstant).toFixed(0);

      let withdrawAsToken = this.state.selectedBuybackTokenWithdraw;

      let amountBuyback = await staking.depositedTokens(coinbase);

      // let router = await window.getPancakeswapRouterContract()
      // let WETH = await router.methods.WETH().call()
      // let platformTokenAddress = window.config.reward_token_address
      // let rewardTokenAddress = window.config.reward_token_address2
      // let path = [...new Set([rewardTokenAddress, WETH, platformTokenAddress].map(a => a.toLowerCase()))]
      // let _amountOutMin = await router.methods.getAmountsOut(amountBuyback, path).call()
      // _amountOutMin = _amountOutMin[_amountOutMin.length - 1]
      // _amountOutMin = new BigNumber(_amountOutMin).times(100 - window.config.slippage_tolerance_percent).div(100).toFixed(0)

      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      );

      //Withdraw Parameters of Farm Contract
      /*
                withdrawAsToken,
                amountToWithdraw,
                uint[] memory minAmounts,
                // uint _amountLiquidityMin_rewardToken, // 0
                // uint _amountLiquidityMin_baseToken, // 1
                // uint _amountOutMin_withdrawAsToken_rewardTokenReceived, // 2
                // uint _amountOutMin_withdrawAsToken_baseTokenReceived, // 3
                // uint _amountOutMin_claimAsToken_dyp,  // 4
                // uint _amountOutMin_attemptSwap, // 5
                _deadline
             */

      let minAmounts = [0, 0, 0, 0, 0, 0];

      console.log({ withdrawAsToken, amountBuyback, minAmounts, deadline });

      // try {
      //     setTimeout(() => constant.unstake(amountConstant, 0, deadline), 10e3)
      // }  catch(e) {
      //     console.error(e)
      //     return;
      // }

      try {
        staking
          .withdraw(withdrawAsToken, amountBuyback, minAmounts, deadline)
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
                selectedPool: "",
                errorMsg3: "",
              });
            }, 10000);
          });
      } catch (e) {
        console.error(e);
        this.setState({ errorMsg3: e?.message });
        setTimeout(() => {
          this.setState({
            withdrawStatus: "initial",
            selectedPool: "",
            errorMsg3: "",
          });
        }, 10000);
        return;
      }
    };

    handleClaimDivs = async (e) => {
      // e.preventDefault();

      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      );

      // console.log(this.state.selectedClaimToken)
      let selectedToken = this.state.selectedClaimToken;

      this.setState({ claimLoading: true });

      if (selectedToken == 0) {
        try {
          staking
            .claim(0, 0, deadline)
            .then(() => {
              this.setState({ claimStatus: "success" });
              this.setState({ claimLoading: false, pendingDivs: getFormattedNumber(0, 6) });
            })
            .catch((e) => {
              this.setState({ claimStatus: "failed" });
              this.setState({ claimLoading: false });
              this.setState({ errorMsg2: e?.message });
              setTimeout(() => {
                this.setState({
                  claimStatus: "initial",
                  selectedPool: "",
                  errorMsg2: "",
                });
              }, 10000);
            });
        } catch (e) {
          this.setState({ claimStatus: "failed" });
          this.setState({ claimLoading: false });
          this.setState({ errorMsg2: e?.message });
          setTimeout(() => {
            this.setState({
              claimStatus: "initial",
              selectedPool: "",
              errorMsg2: "",
            });
          }, 10000);

          console.error(e);
          return;
        }
      } else {
        try {
          staking
            .claimAs(window.config.claim_as_ethavax_address, 0, 0, 0, deadline)
            .then(() => {
              this.setState({ claimStatus: "success" });
              this.setState({ claimLoading: false });
            })
            .catch((e) => {
              this.setState({ claimStatus: "failed" });
              this.setState({ claimLoading: false });
              this.setState({ errorMsg2: e?.message });
              setTimeout(() => {
                this.setState({
                  claimStatus: "initial",
                  selectedPool: "",
                  errorMsg2: "",
                });
              }, 10000);
            });
        } catch (e) {
          this.setState({ claimStatus: "failed" });
          this.setState({ claimLoading: false });
          this.setState({ errorMsg2: e?.message });
          setTimeout(() => {
            this.setState({
              claimStatus: "initial",
              selectedPool: "",
              errorMsg2: "",
            });
          }, 10000);

          console.error(e);
          return;
        }
      }
    };

    handleClaimAsDivs = async (token) => {
      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      );

      try {
        staking.claimAs(
          window.config.claim_as_ethavax_address,
          0,
          0,
          0,
          deadline
        );
      } catch (e) {
        console.error(e);
        return;
      }
    };

    handleClaimDyp = async () => {
      let deadline = Math.floor(
        Date.now() / 1e3 + window.config.tx_max_wait_seconds
      );
      this.setState({ claimLoading: true });

      let address = coinbase;

      let amount = await constant.getTotalPendingDivs(address);
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
      let _amountOutMinConstant = await router.methods
        .getAmountsOut(amount, path)
        .call()
        .catch((e) => {
          this.setState({ claimStatus: "failed" });
          this.setState({ claimLoading: false });
          this.setState({ errorMsg2: e?.message });
          setTimeout(() => {
            this.setState({
              claimStatus: "initial",
              selectedPool: "",
              errorMsg2: "",
            });
          }, 10000);
        });
      _amountOutMinConstant =
        _amountOutMinConstant[_amountOutMinConstant.length - 1];
      _amountOutMinConstant = new BigNumber(_amountOutMinConstant)
        .times(100 - window.config.slippage_tolerance_percent)
        .div(100)
        .toFixed(0);

      let referralFee = new BigNumber(_amountOutMinConstant)
        .times(500)
        .div(1e4)
        .toFixed(0);
      referralFee = referralFee.toString();

      try {
        constant
          .claim(referralFee, _amountOutMinConstant, deadline)
          .then(() => {
            this.setState({ claimStatus: "success" });
            this.setState({ claimLoading: false });
          })
          .catch((e) => {
            this.setState({ claimStatus: "failed" });
            this.setState({ claimLoading: false });
            this.setState({ errorMsg2: e?.message });
            setTimeout(() => {
              this.setState({
                claimStatus: "initial",
                selectedPool: "",
                errorMsg2: "",
              });
            }, 10000);
          });
      } catch (e) {
        console.error(e);
        return;
      }
    };

    handleSetMaxDeposit = (e) => {
      e.preventDefault();
      this.setState({
        depositAmount: new BigNumber(this.state.selectedTokenBalance)
          .div(10 ** this.state.selectedTokenDecimals)
          .toFixed(this.state.selectedTokenDecimals),
      });
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
      let lp_data = this.props.the_graph_result.lp_data;
      let apy = lp_data ? lp_data[this.props.lp_id].apy : 0;
      return Number(apy) || 0;
    };

    refreshBalance = async () => {
      let coinbase = coinbase;


      if (window.coinbase_address) {
        coinbase = window.coinbase_address;
        this.setState({ coinbase });
      }

      let lp_data = this.props.the_graph_result.lp_data;

      // let usd_per_dyps = this.props.the_graph_result.price_DYPS ? this.props.the_graph_result.price_DYPS : 1
      let usd_per_dyps = 0.00001;

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

        let _bal = token.balanceOf(coinbase);

        let _rBal = reward_token.balanceOf(coinbase);

        let _pDivs = staking.getPendingDivs(coinbase);

        let _pDivsEth = staking.getPendingDivsEth(coinbase);

        let _tEarned = staking.totalEarnedTokens(coinbase);

        let _tEarnedEth = staking.totalEarnedEth(coinbase);

        let _stakingTime = staking.depositTime(coinbase);

        let _dTokens = staking.depositedTokens(coinbase);

        let _lClaimTime = staking.lastClaimedTime(coinbase);

        let _tvl = token.balanceOf(staking._address); //not zero

        //Take iDYP Balance on Staking & Farming
        let _tvlConstantiDYP = reward_token_idyp.balanceOf(
          constant._address
        ); /* TVL of iDYP on Staking */

        let _tvlConstantDYP = reward_token.balanceOf(
          constant._address
        ); /* TVL of iDYP on Staking */

        //not zero
        let _tvliDYP = reward_token_idyp.balanceOf(
          staking._address
        ); /* TVL of iDYP on Farming */

        let _dTokensDYP = constant.depositedTokens(coinbase);

        let _pendingDivsStaking = constant.getTotalPendingDivs(
          coinbase
        );

        //Take DYPS Balance
        let _tvlDYPS = token_dypsavax.balanceOf(
          staking._address
        ); /* TVL of DYPS */

        let [
          token_balance,
          reward_token_balance,
          pendingDivs,
          totalEarnedTokens,
          stakingTime,
          depositedTokens,
          lastClaimedTime,
          tvl,
          totalEarnedEth,
          pendingDivsEth,
          tvlConstantiDYP,
          tvlConstantDYP,
          tvliDYP,
          depositedTokensDYP,
          pendingDivsStaking,
          tvlDYPS,
        ] = await Promise.all([
          _bal,
          _rBal,
          _pDivs,
          _tEarned,
          _stakingTime,
          _dTokens,
          _lClaimTime,
          _tvl,
          _tEarnedEth,
          _pDivsEth,
          _tvlConstantiDYP,
          _tvlConstantDYP,
          _tvliDYP,
          _dTokensDYP,
          _pendingDivsStaking,
          _tvlDYPS,
        ]);

        let tvlValueConstantDYP = new BigNumber(tvlConstantDYP)
          .times(this.state.usdPerToken)
          .toFixed(18);
        let tvlValueiDYP = new BigNumber(tvlConstantiDYP)
          .times(_amountOutMin)
          .toFixed(18);
        let tvlValueiDYPFarming = new BigNumber(tvliDYP)
          .times(_amountOutMin)
          .toFixed(18);
        let usd_per_lp = lp_data ? lp_data[this.props.lp_id].usd_per_lp : 0;

        /* USD VALUE OF MY LP DEPOSITED */
        // let myDepositedLpTokens = new BigNumber(depositedTokens).times(usd_per_lp).toFixed(18)
        let myDepositedLpTokens = new BigNumber(depositedTokens).toFixed(18);

        /* USD VALUE OF WITHDRAW OF LP + iDYP */
        // let depositedTokensUSD = new BigNumber(depositedTokens).times(usd_per_lp).plus(tvlValueConstantDYP).toFixed(18)
        let depositedTokensUSD = new BigNumber(depositedTokens).toFixed(18);
        // let tvlUSD = new BigNumber(tvl).times(usd_per_lp).plus(tvlValueiDYP).toFixed(18)

        /* USD VALUE OF TOTAL LP DEPOSITED */
        let tvlUSD = new BigNumber(tvl).times(usd_per_lp).toFixed(18);
        // let tvlUSD = new BigNumber(tvl).toFixed(18)

        let totalValueLocked = new BigNumber(tvlUSD)
          .plus(tvlValueiDYP)
          .plus(tvlValueiDYPFarming)
          .plus(tvlValueConstantDYP)
          .toFixed(18);
        //console.log({tvlValueConstantDYP})

        let tvlDyps = new BigNumber(tvlDYPS).times(usd_per_dyps).toFixed(18);

        this.setState({
          token_balance,
          reward_token_balance,
          pendingDivs,
          totalEarnedTokens,
          stakingTime,
          depositedTokens,
          lastClaimedTime,
          tvl,
          tvlDyps,
          totalEarnedEth,
          pendingDivsEth,
          myDepositedLpTokens,
          depositedTokensUSD,
          tvlUSD,
          totalValueLocked,
          depositedTokensDYP,
          tvlConstantDYP /* DYP DEPOSITED ON STAKING */,
          pendingDivsStaking,
        });
        let stakingOwner = await staking.owner();
        this.setState({ stakingOwner });
      } catch (e) {
        console.error(e);
      }

      staking
        .cliffTime()
        .then((cliffTime) => {
          this.setState({ cliffTime: Number(cliffTime) });
        })
        .catch(console.error);

      staking
        .tokensToBeDisbursedOrBurnt()
        .then((tokensToBeDisbursedOrBurnt) => {
          this.setState({ tokensToBeDisbursedOrBurnt });
        })
        .catch(console.error);

      staking.tokensToBeSwapped().then((tokensToBeSwapped) => {
        this.setState({ tokensToBeSwapped });
      });

      staking.lastSwapExecutionTime().then((lastSwapExecutionTime) => {
        this.setState({ lastSwapExecutionTime });
      });

      staking.swapAttemptPeriod().then((swapAttemptPeriod) => {
        this.setState({ swapAttemptPeriod });
      });

      staking.contractDeployTime().then((contractDeployTime) => {
        this.setState({ contractDeployTime });
      });

      staking.disburseDuration().then((disburseDuration) => {
        this.setState({ disburseDuration });
      });

      //Set Value $ of iDYP & DYP for Withdraw Input
      this.setState({
        withdrawAmount: new BigNumber(this.state.depositedTokensUSD)
          .div(1e18)
          .toFixed(2),
      });

      //console.log(this.state.disburseDuration)
      //console.log(this.state.contractDeployTime)

      try {
        let selectedTokenBalance = await window.getTokenHolderBalance(
          this.state.selectedBuybackToken,
          coinbase
        );
        this.setState({ selectedTokenBalance });
      } catch (e) {
        console.warn(e);
      }
    };

    getUsdPerETH = () => {
      return this.props.the_graph_result.usd_per_eth || 0;
    };

    getApproxReturnUSD = () => {
      let APY = this.getAPY();
      let approxDays = this.state.approxDays;
      let approxDeposit = this.state.approxDeposit;
      //let lp_data = this.props.the_graph_result.lp_data
      //let usd_per_lp = lp_data ? lp_data[this.props.lp_id].usd_per_lp : 0

      return ((approxDeposit * APY) / 100 / 365) * approxDays;
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
      await handleSwitchNetworkhook("0xa86a").then(() => {
        this.props.handleSwitchNetwork('43114')

      }).catch((e) => {
        console.log(e)
      })

    };


    render() {
      let {
        disburseDuration,
        contractDeployTime,
        cliffTime,
        swapAttemptPeriod,
        lastSwapExecutionTime,
        tokensToBeDisbursedOrBurnt,
        tokensToBeSwapped,
        pendingDivsEth,
        totalEarnedEth,
        token_balance,
        reward_token_balance,
        pendingDivs,
        totalEarnedTokens,
        depositedTokens,
        stakingTime,
        coinbase,
        tvl,
        depositedTokensDYP,
        tvlConstantDYP,
        myDepositedLpTokens,
        pendingDivsStaking,
      } = this.state;

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

      let myShare = ((depositedTokens / tvl) * 100).toFixed(2);
      myShare = getFormattedNumber(myShare, 2);

      token_balance = new BigNumber(token_balance * LP_AMPLIFY_FACTOR)
        .div(1e18)
        .toString(10);
      token_balance = getFormattedNumber(token_balance, 2);

      tokensToBeSwapped = new BigNumber(tokensToBeSwapped)
        .div(1e18)
        .toString(10);
      tokensToBeSwapped = getFormattedNumber(tokensToBeSwapped, 6);

      tokensToBeDisbursedOrBurnt = new BigNumber(tokensToBeDisbursedOrBurnt)
        .div(1e18)
        .toString(10);
      tokensToBeDisbursedOrBurnt = getFormattedNumber(
        tokensToBeDisbursedOrBurnt,
        6
      );

      pendingDivsEth = new BigNumber(pendingDivsEth).div(1e18).toString(10);
      pendingDivsEth = getFormattedNumber(pendingDivsEth, 3);

      totalEarnedEth = new BigNumber(totalEarnedEth).div(1e18).toString(10);
      totalEarnedEth = getFormattedNumber(totalEarnedEth, 6);

      reward_token_balance = new BigNumber(reward_token_balance)
        .div(10 ** TOKEN_DECIMALS)
        .toString(10);
      reward_token_balance = getFormattedNumber(reward_token_balance, 6);

      pendingDivs = new BigNumber(pendingDivsStaking)
        .div(10 ** TOKEN_DECIMALS)
        .times(usd_per_idyp)
        .div(usd_per_token)
        .toString(10);
      pendingDivs = getFormattedNumber(pendingDivs, 3);

      totalEarnedTokens = new BigNumber(totalEarnedTokens)
        .div(10 ** TOKEN_DECIMALS)
        .toString(10);
      totalEarnedTokens = getFormattedNumber(totalEarnedTokens, 6);

      depositedTokens = new BigNumber(
        this.state.depositedTokensUSD * LP_AMPLIFY_FACTOR
      )
        .div(1e18)
        .toString(10);
      depositedTokens = getFormattedNumber(depositedTokens, 2);

      myDepositedLpTokens = new BigNumber(
        this.state.myDepositedLpTokens * LP_AMPLIFY_FACTOR
      )
        .div(1e18)
        .toString(10);
      myDepositedLpTokens = getFormattedNumber(myDepositedLpTokens, 2);

      depositedTokensDYP = new BigNumber(this.state.depositedTokensDYP)
        .div(1e18)
        .toString(10);
      depositedTokensDYP = getFormattedNumber(depositedTokensDYP, 2);

      tvlConstantDYP = new BigNumber(this.state.tvlConstantDYP)
        .div(1e18)
        .toString(10);
      tvlConstantDYP = getFormattedNumber(tvlConstantDYP, 2);

      tvl = new BigNumber(this.state.tvlUSD * LP_AMPLIFY_FACTOR)
        .div(1e18)
        .toString(10);
      tvl = getFormattedNumber(tvl, 2);

      stakingTime = stakingTime * 1e3;
      cliffTime = cliffTime * 1e3;
      swapAttemptPeriod = swapAttemptPeriod * 1e3;
      lastSwapExecutionTime = lastSwapExecutionTime * 1e3;

      let showDeposit = true;

      if (!isNaN(disburseDuration) && !isNaN(contractDeployTime)) {
        let lastDay = parseInt(disburseDuration) + parseInt(contractDeployTime);
        let lockTimeExpire = parseInt(Date.now()) + parseInt(cliffTime);
        lockTimeExpire = lockTimeExpire.toString().substr(0, 10);
        if (lockTimeExpire > lastDay) {
          showDeposit = false;
        }
      }

      let cliffTimeInWords = "lockup period";

      let claimTitle = "Feel free to execute claim";

      if (!isNaN(swapAttemptPeriod) && !isNaN(lastSwapExecutionTime)) {
        if (Date.now() - lastSwapExecutionTime <= swapAttemptPeriod) {
          claimTitle = `You can execute claim for the latest rewards ${moment
            .duration(swapAttemptPeriod - (Date.now() - lastSwapExecutionTime))
            .humanize(true)}`;
        }
      }


      let canWithdraw = true
      if (lockTime === "No Lock") {
        canWithdraw = true;
      }
      if (!isNaN(cliffTime) && !isNaN(stakingTime)) {
          if ((this.convertTimestampToDate((Number(stakingTime) + Number(cliffTime))) >= this.convertTimestampToDate(Date.now()))&& lockTime !== "No Lock") {
              canWithdraw = false
              cliffTimeInWords = moment.duration((cliffTime - (Date.now() - stakingTime))).humanize(true)
          }
      }
      let lp_data = this.props.the_graph_result.lp_data;
      let apy = lp_data ? lp_data[this.props.lp_id].apy : 0;

      let total_stakers = lp_data ? lp_data[this.props.lp_id].stakers_num : 0;
      // let tvl_usd = lp_data ? lp_data[this.props.lp_id].tvl_usd : 0
      let tvl_usd = this.state.totalValueLocked / 1e18;

      apy = getFormattedNumber(apy, 2);
      total_stakers = getFormattedNumber(total_stakers, 0);

      let tvlDYPS = this.state.tvlDyps / 1e18;
      tvl_usd = tvl_usd + tvlDYPS;
      tvl_usd = getFormattedNumber(tvl_usd, 2);

      //console.log(total_stakers)

      let isOwner =
        String(coinbase).toLowerCase() ===
        String(window.config.admin_address).toLowerCase();

      let is_connected = this.props.is_wallet_connected;

      let apr2 = 50;

      let apy2 = new BigNumber(apr2)
        .div(1e2)
        .times(usd_per_idyp)
        .div(usd_per_token)
        .times(1e2)
        .toFixed(2);
      let infoItems = [
        "75% from your deposit is added to Pangolin AVAX/iDYP LP",
        "25% from your deposit is sent to DYP Staking with " + apy2 + "% APR",
      ];
      let tooltip1 = infoItems.join("\n");

      let infoItems2 = ["75% WAVAX/ETH rewards", "25% DYP rewards"];
      let tooltip2 = infoItems2.join("\n");

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
              <div className="activewrapper activewrapper-vault">
                <div className="d-flex flex-column flex-lg-row w-100 align-items-start align-items-lg-center justify-content-between">
                  <h6 className="activetxt position-relative activetxt-vault">
                    <img
                      src={ellipse}
                      alt=""
                      className="position-relative"
                      style={{ top: '-1px' }}

                    />
                    Active status
                  </h6>
                  {/* <div className="d-flex align-items-center justify-content-between gap-2">
                    <h6 className="earnrewards-text">Earn rewards in:</h6>
                    <h6 className="earnrewards-token d-flex align-items-center gap-1">
                      {token_symbol}
                    </h6>
                  </div> */}
                  <div className="d-flex flex-row-reverse flex-lg-row align-items-end justify-content-between earnrewards-container">
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
                      {/* <a
                    href={
                      chainId === 1
                        ? "https://app.uniswap.org/#/swap?outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
                        : "https://app.pangolin.exchange/#/swap?outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
                    }
                    target={"_blank"}
                    rel="noreferrer"
                  >
                    <h6 className="bottomitems">
                      <img src={arrowup} alt="" />
                      Get DYP
                    </h6>
                  </a> */}
                      <h6
                        className="bottomitems"
                        onClick={() => this.setState({ showCalculator: true })}
                      >
                        <img src={poolsCalculatorIcon} alt="" />
                        Calculator
                      </h6>
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
            <div className="pools-details-wrapper d-flex m-0 container-lg border-0">
              <div className="row w-100 gap-4 gap-lg-0 justify-content-between">
                <div className="firstblockwrapper col-12 col-md-6 col-lg-2">
                  <div
                    className="d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between gap-4"
                    style={{ height: "100%" }}
                  >
                    <h6 className="start-title">Start Farming</h6>
                    {/* <h6 className="start-desc">
                      {this.props.coinbase === null
                        ? "Connect wallet to view and interact with deposits and withdraws"
                        : "Interact with deposits and withdraws"}
                    </h6> */}
                    {this.props.coinbase === null || this.props.coinbase === undefined || this.props.isConnected === false ? (
                      <button
                        className="connectbtn btn"
                        onClick={this.showModal}
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
                <div className={`otherside-border col-12 col-md-12 col-lg-4  ${chainId !== '43114' || this.props.expired === true ? "blurrypool" : ''}`}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="d-flex flex-column flex-lg-row align-items-start gap-3">
                      <div className="d-flex align-items-start gap-3">
                        <h6 className="deposit-txt">Deposit</h6>
                        <div className="d-flex justify-content-center align-items-center">
                          <div className="dropdown">
                            <button
                              class="btn farming-dropdown inputfarming d-flex align-items-center justify-content-center gap-1"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              style={{ position: "relative", bottom: "4px" }}
                            >
                              <img
                                src={
                                  require(`./assets/avax/${this.state.selectedTokenLogo.toLowerCase()}.svg`)
                                    .default
                                }
                                alt=""
                                style={{ width: 14, height: 14 }}
                              />
                              {this.state.selectedTokenLogo.toUpperCase()}
                              <img
                                src={dropdownVector}
                                alt=""
                                style={{ width: 10, height: 10 }}
                              />
                            </button>
                            <ul
                              className="dropdown-menu"
                              style={{ minWidth: "100%" }}
                            >
                              {Object.keys(
                                window.buyback_tokens_farmingavax
                              ).map((t) => (
                                <span
                                  className="d-flex align-items-center justify-content-start ps-2 gap-1 inputfarming farming-dropdown-item py-1 w-100"
                                  onClick={() =>
                                    this.handleSelectedTokenChange(t)
                                  }
                                >
                                  <img
                                    src={
                                      require(`./assets/avax/${window.buyback_tokens_farmingavax[
                                        t
                                      ].symbol.toLowerCase()}.svg`).default
                                    }
                                    alt=""
                                    style={{ width: 14, height: 14 }}
                                  />
                                  {window.buyback_tokens_farmingavax[t].symbol}
                                </span>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <h6 className="mybalance-text">
                        Balance:
                        <b>
                          {getFormattedNumber(
                            this.state.selectedTokenBalance /
                            10 ** this.state.selectedTokenDecimals,
                            6
                          )}{" "}
                          {this.state.selectedTokenSymbol}
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
                              "Deposit your assets to the farming smart contract. 75% of your assets goes for creation of LP tokens and 25% goes for buying DYP and depositing to staking smart contract to generate rewards."
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
                      <div className="d-flex align-items-center justify-content-between justify-content-lg-start gap-2 w-100">
                        <div className="input-container px-0">
                        <input
                          type="number"
                          autoComplete="off"
                          value={
                            Number(this.state.depositAmount) > 0
                              ? this.state.depositAmount
                              : this.state.depositAmount
                          }
                          onChange={(e) =>
                            this.setState({
                              depositAmount: e.target.value,
                            })
                          }
                          placeholder=" "
                          className="text-input"
                          style={{ width: "100%" }}
                          name="amount_deposit"
                          id="amount_deposit"
                          key="amount_deposit"
                        />
                        <label htmlFor="usd" className="label"
                         onClick={() => focusInput("amount_deposit")}>
                         Amount
                        </label>
                      </div>
                        <button
                          className="btn maxbtn"
                          onClick={this.handleSetMaxDeposit}
                        >
                          Max
                        </button>
                      </div>

                      <button
                        disabled={
                          this.state.depositAmount === "" ||
                            this.state.depositLoading === true ||
                            this.state.depositStatus === "success"
                            ? true
                            : false
                        }
                        className={`btn filledbtn ${this.state.depositAmount === "" &&
                          this.state.depositStatus === "initial" &&
                          "disabled-btn"
                          } ${this.state.depositStatus === "deposit" ||
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
                <div className={`otherside-border col-12 col-md-12 col-lg-4 ${chainId !== '43114' && "blurrypool"}`}>
                  <div className="d-flex justify-content-between gap-2 ">
                    <h6 className="withdraw-txt">Rewards</h6>
                    <h6 className="withdraw-littletxt d-flex align-items-center gap-2">
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
                                "Rewards earned by your deposit to the farming smart contract are distributed automatically and can be claimed every day. You need to select assets individually and claim them to your wallet."
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
                    <div className="d-flex align-items-center justify-content-between gap-2"></div>
                    <div className="form-row d-flex flex-column flex-lg-row gap-2 align-items-center align-items-lg-end justify-content-between">
                      <div className="d-flex align-items-center justify-content-between justify-content-lg-center gap-5">
                        <div
                          className="gap-1 claimreward-wrapper"
                          onClick={() => {
                            this.setState({ selectedPool: "wavax" });
                          }}
                          style={{
                            // padding: '3px',
                            background:
                              this.state.selectedPool === "wavax"
                                ? "#141333"
                                : "#26264F",
                            border:
                              this.state.selectedPool === "wavax"
                                ? "1px solid #57B6AB"
                                : "1px solid #8E97CD",
                          }}
                        >
                          <img
                            src={
                              this.state.selectedPool === "wavax"
                                ? check
                                : empty
                            }
                            alt=""
                            className="activestate"
                          />
                          <div className="position-relative">
                            <input
                              disabled
                              value={
                                Number(pendingDivsEth) > 0
                                  ? `${pendingDivsEth} WAVAX`
                                  : `${getFormattedNumber(0, 2)} WAVAX`
                              }
                              onChange={(e) =>
                                this.setState({
                                  pendingDivsEth:
                                    Number(e.target.value) > 0
                                      ? e.target.value
                                      : e.target.value,
                                })
                              }
                              className=" left-radius inputfarming styledinput2"
                              placeholder="0"
                              type="text"
                              style={{
                                width: "120px",
                                padding: "0px 15px 0px 15px",
                                height: 35,
                              }}
                            />
                          </div>
                          <div
                            className="d-flex align-items-center justify-content-center w-100 claimreward-header"
                          // style={{ paddingLeft: "10px" }}
                          >
                            {/* <img
                            src={
                              require(`./assets/avax/${this.state.selectedRewardTokenLogo1.toLowerCase()}.svg`)
                                .default
                            }
                            alt=""
                            style={{ width: 14, height: 14 }}
                          />
                          <select
                            disabled={!is_connected}
                            value={this.state.selectedClaimToken}
                            onChange={(e) => {
                              this.handleClaimToken(e.target.value);
                              this.setState({
                                selectedRewardTokenLogo1:
                                  e.target.value === "1" ? "usdt" : "weth",
                              });
                            }}
                            className=" inputfarming"
                            style={{ border: "none" }}
                          >
                            <option value="0"> WAVAX </option>
                            <option value="1"> WETH.e </option>
                          </select> */}
                            <div class="dropdown">
                              <button
                                class="btn reward-dropdown inputfarming d-flex align-items-center justify-content-center gap-1"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <img
                                  src={
                                    require(`./assets/avax/${this.state.selectedRewardTokenLogo1.toLowerCase()}.svg`)
                                      .default
                                  }
                                  alt=""
                                  style={{ width: 14, height: 14 }}
                                />
                                {this.state.selectedRewardTokenLogo1.toUpperCase()}
                                <img
                                  src={dropdownVector}
                                  alt=""
                                  style={{ width: 10, height: 10 }}
                                />
                              </button>
                              <ul
                                class="dropdown-menu"
                                style={{ minWidth: "100%" }}
                              >
                                <span
                                  className="d-flex align-items-center justify-content-center  gap-1 inputfarming farming-dropdown-item py-1 w-100"
                                  onClick={() => {
                                    this.handleClaimToken("1");
                                    this.setState({
                                      selectedRewardTokenLogo1: "wavax",
                                    });
                                  }}
                                >
                                  <img
                                    src={
                                      require(`./assets/avax/wavax.svg`).default
                                    }
                                    alt=""
                                    style={{ width: 14, height: 14 }}
                                  />
                                  WAVAX
                                </span>
                                <span
                                  className="d-flex align-items-center justify-content-center  gap-1 inputfarming farming-dropdown-item py-1 w-100"
                                  onClick={() => {
                                    this.handleClaimToken("2");
                                    this.setState({
                                      selectedRewardTokenLogo1: "weth.e",
                                    });
                                  }}
                                >
                                  <img
                                    src={
                                      require(`./assets/avax/weth.e.svg`)
                                        .default
                                    }
                                    alt=""
                                    style={{ width: 14, height: 14 }}
                                  />
                                  WETH.e
                                </span>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div
                          className="gap-1 claimreward-wrapper"
                          style={{
                            // padding: '3px',
                            background:
                              this.state.selectedPool === "dyp"
                                ? "#141333"
                                : "#26264F",
                            border:
                              this.state.selectedPool === "dyp"
                                ? "1px solid #57B6AB"
                                : "1px solid #8E97CD",
                          }}
                          onClick={() => {
                            this.setState({ selectedPool: "dyp" });
                          }}
                        >
                          <img
                            src={
                              this.state.selectedPool === "dyp" ? check : empty
                            }
                            alt=""
                            className="activestate"
                          />

                          <div className="position-relative">
                            <input
                              disabled
                              value={
                                Number(pendingDivs) > 0
                                  ? `${pendingDivs} DYP`
                                  : `${getFormattedNumber(0, 2)} DYP`
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
                              style={{
                                width: "120px",
                                padding: "0px 15px 0px 15px",
                                height: 35,
                              }}
                            />
                          </div>

                          <div
                            className="d-flex align-items-center justify-content-center w-100 claimreward-header "
                          // style={{ paddingLeft: "10px" }}
                          >
                            <img
                              src={
                                require(`./assets/avax/${this.state.selectedRewardTokenLogo2.toLowerCase()}.svg`)
                                  .default
                              }
                              alt=""
                              style={{ width: 14, height: 14 }}
                            />
                            <select
                              disabled
                              defaultValue="DYP"
                              className="form-control inputfarming"
                              style={{ border: "none", padding: "0 0 0 3px" }}
                            >
                              <option value="DYP"> DYP </option>
                            </select>
                            {/* <div class="dropdown">
                            <button
                              class="btn reward-dropdown inputfarming d-flex align-items-center justify-content-center gap-1"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <img
                                src={
                                  require(`./assets/avax/dyp.svg`)
                                    .default
                                }
                                alt=""
                                style={{ width: 14, height: 14 }}
                              />
                             DYP
                              <img
                                src={dropdownVector}
                                alt=""
                                style={{ width: 10, height: 10 }}
                              />
                            </button>
                            <ul
                              class="dropdown-menu"
                              style={{ minWidth: "100%" }}
                            >
                              <span
                                className="d-flex align-items-center justify-content-center  gap-1 inputfarming farming-dropdown-item py-1 w-100"
                                onClick={() => {
                                  this.handleClaimToken("0");
                                  this.setState({
                                    selectedRewardTokenLogo1: "dyp",
                                  });
                                }}
                              >
                                <img
                                  src={
                                    require(`./assets/avax/dyp.svg`).default
                                  }
                                  alt=""
                                  style={{ width: 14, height: 14 }}
                                />
                                DYP
                              </span>
                            </ul>
                          </div> */}
                          </div>
                        </div>
                      </div>
                      <button
                        disabled={
                          this.state.selectedPool === "" ||
                            this.state.claimStatus === "claimed" ||
                            this.state.claimStatus === "failed" ||
                            this.state.claimStatus === "success" || pendingDivs <= 0
                            ? true
                            : false
                        }
                        className={`btn filledbtn ${this.state.claimStatus === "claimed" ||
                            this.state.selectedPool === "" ||
                            this.state.selectedPool === "wavax2" ||
                            this.state.selectedPool === "dyp2" || pendingDivs <= 0
                            ? "disabled-btn"
                            : this.state.claimStatus === "failed"
                              ? "fail-button"
                              : this.state.claimStatus === "success"
                                ? "success-button"
                                : null
                          } d-flex justify-content-center align-items-center`}
                        style={{ height: "fit-content" }}
                        onClick={() => {
                          this.state.selectedPool === "wavax"
                            ? this.handleClaimDivs()
                            : this.handleClaimDyp();
                        }}
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
                    </div>
                    {this.state.errorMsg2 && (
                      <h6 className="errormsg">{this.state.errorMsg2}</h6>
                    )}
                    {/* <button
                    title={claimTitle}
                    disabled={!is_connected}
                    className="btn  btn-primary btn-block l-outline-btn"
                    type="submit"
                    onClick={this.handleClaimDivs}
                  >
                    CLAIM
                  </button> */}
                    {/* <button
                  onClick={(e) => {
                    e.preventDefault();
                    this.handleClaimDyp();
                  }}
                  title={claimTitle}
                  disabled={!is_connected}
                  className="btn  btn-primary btn-block l-outline-btn"
                  type="submit"
                >
                  CLAIM
                </button> */}
                  </div>
                </div>

                <div className={`otherside-border col-12 col-md-12 col-lg-2 ${chainId !== '43114' && "blurrypool"}`}>
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
                              "Withdraw your deposited assets from the farming smart contract."
                            }
                          </div>
                        }
                      >
                        <img src={moreinfo} alt="" onClick={withdrawOpen} />
                      </Tooltip>
                    </ClickAwayListener>
                  </h6>

                  <button
                   disabled={Number(this.state.depositedTokens) > 0 ? false : true}
                    className={
                      // this.state.depositStatus === "success" ?
                      "outline-btn btn"
                      // :
                      //  "btn disabled-btn"
                    }
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
                  {/* <div className="container">
                    <div className="row" style={{ marginLeft: "0px" }}>
                      <div className="d-flex justify-content-between gap-2 align-items-center p-0">
                        <h6 className="d-flex gap-2 align-items-center statstext">
                          <img src={stats} alt="" />
                          My Stats
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
                    </div>
                    <table className="table-stats table table-sm table-borderless mt-2">
                      <tbody>
                        <tr>
                          <td className="text-right">
                            <th>MY LP Deposit</th>
                            <div>
                              <strong>{myDepositedLpTokens}</strong>{" "}
                              <small>iDYP/WAVAX</small>
                            </div>
                          </td>

                          <td className="text-right">
                            <th>Total LP Deposited</th>
                            <div>
                              <strong style={{ fontSize: 9 }}>{tvl}</strong>{" "}
                              <small>iDYP/WAVAX</small>
                            </div>
                          </td>
                          <td className="text-right">
                            <th>My DYP Stake</th>
                            <div>
                              <strong>{reward_token_balance}</strong>{" "}
                              <small>DYP</small>
                            </div>
                          </td>
                          
                        </tr>

                        <tr>
                          <td className="text-right">
                            <th>Total Earned DYP</th>
                            <div>
                              <strong>{totalEarnedTokens}</strong>{" "}
                              <small>DYP</small>
                            </div>
                          </td>

                          <td className="text-right">
                            <th>Total Earned WAVAX</th>
                            <div>
                              <strong>{totalEarnedEth}</strong>{" "}
                              <small>WAVAX</small>
                            </div>
                          </td>
                          <td className="text-right">
                            <th>My Share</th>
                            <div>
                              <strong>{myShare}</strong> <small>%</small>
                            </div>
                          </td>
                        </tr>
                        <tr></tr>
                      </tbody>
                    </table>
                  </div> */}
                  <div className="stats-container my-4">
                    <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                      <span className="stats-card-title">My LP Deposit</span>
                      <h6 className="stats-card-content">
                        {myDepositedLpTokens} iDYP/WAVAX
                      </h6>
                      <span className="stats-usd-value">
                        $
                        {getFormattedNumber(
                          myDepositedLpTokens * this.state.iDypUSD
                        )}
                      </span>
                    </div>
                    <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                      <span className="stats-card-title">
                        Total LP Deposited
                      </span>
                      <h6 className="stats-card-content">{tvl} iDYP/WAVAX</h6>
                      <span className="stats-usd-value">
                        ${getFormattedNumber(tvl * this.state.iDypUSD)}
                      </span>
                    </div>
                    <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                      <span className="stats-card-title">My DYP Stake</span>
                      <h6 className="stats-card-content">
                        {reward_token_balance} DYP
                      </h6>
                      <span className="stats-usd-value">
                        $
                        {getFormattedNumber(
                          reward_token_balance * this.state.dypUSD
                        )}
                      </span>
                    </div>
                    <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                      <span className="stats-card-title">Total Earned DYP</span>
                      <h6 className="stats-card-content">
                        {totalEarnedTokens} DYP
                      </h6>
                      <span className="stats-usd-value">
                        $
                        {getFormattedNumber(
                          totalEarnedTokens * this.state.dypUSD
                        )}
                      </span>
                    </div>
                    <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                      <span className="stats-card-title">
                        Total Earned WAVAX
                      </span>
                      <h6 className="stats-card-content">
                        {totalEarnedEth} WAVAX
                      </h6>
                      <span className="stats-usd-value">$23,674,64</span>
                    </div>
                    <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                      <span className="stats-card-title">My Share</span>
                      <h6 className="stats-card-content">{myShare}%</h6>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end align-items-center gap-2">
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
                  </div>
                  <hr />
                  <div className="container">
                    <div className="row" style={{ marginLeft: "0px" }}>
                      <div className="d-flex justify-content-between gap-2 align-items-center p-0">
                        <h6
                          className="d-flex gap-2 align-items-center statstext"
                          style={{
                            fontWeight: "500",
                            fontSize: "20px",
                            lineHeight: "28px",
                            color: "#f7f7fc",
                          }}
                        >
                          <img src={poolStatsIcon} alt="" />
                          Pool stats
                        </h6>
                        {/* <h6 className="d-flex gap-2 align-items-center myaddrtext">
                          My address
                          <a
                            href={`${window.config.etherscan_baseURL}/token/${reward_token._address}?a=${this.props.coinbase}`}
                            target={"_blank"}
                            rel="noreferrer"
                          >
                            <h6 className="addresstxt">
                              {this.props.coinbase?.slice(0, 10) + "..."}
                            </h6>
                          </a>
                          <img src={arrowup} alt="" />
                        </h6> */}
                      </div>
                    </div>
                    {/* <table className="table-stats table table-sm table-borderless mt-2">
                      <tbody>
                        <tr>
                          <td className="text-right">
                            <th>TVL USD</th>
                            <div>
                              <strong>${tvl_usd}</strong> <small>USD</small>
                            </div>
                          </td>

                          <td className="text-right">
                            <th>Total LP deposited</th>
                            <div>
                              <strong style={{ fontSize: 11 }}>{tvl}</strong>{" "}
                              <small>iDYP/WAVAX</small>
                            </div>
                          </td>

                          <td className="text-right">
                            <th>To be swapped</th>
                            <div>
                              <strong>{tokensToBeSwapped}</strong>{" "}
                              <small>iDYP</small>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td className="text-right">
                            <th>To be burnt / disbursed</th>
                            <div>
                              <strong>{tokensToBeDisbursedOrBurnt}</strong>{" "}
                              <small>iDYP</small>
                            </div>
                          </td>

                          <td className="text-right">
                            <th>Contract Expiration</th>
                            <small>{expiration_time}</small>
                          </td>
                          <td
                            style={{
                              background: "transparent",
                              border: "none",
                              gap: 5,
                            }}
                          >
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://github.com/dypfinance/Buyback-Farm-Stake-Governance-V2/tree/main/Audit`}
                              className="maxbtn d-flex align-items-center"
                              style={{ height: "25px" }}
                            >
                              Audit
                              <img src={arrowup} alt="" />
                            </a>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`${window.config.etherscan_baseURL}/token/${reward_token._address}?a=${this.props.coinbase}`}
                              className="text-white mt-2"
                              style={{
                                height: "25px",
                                textDecoration: "underline",
                                fontSize: "9px",
                              }}
                            >
                              View on Etherscan
                              <img src={whiteArrowUp} alt="" className="ms-1" />
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table> */}
                    <div className="stats-container my-4">
                      <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                        <span className="stats-card-title">TVL USD</span>
                        <h6 className="stats-card-content">{tvl_usd} USD</h6>
                      </div>
                      <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                        <span className="stats-card-title">
                          Total LP Deposited
                        </span>
                        <h6 className="stats-card-content">{tvl} iDYP/WAVAX</h6>
                      </div>
                      <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                        <span className="stats-card-title">To be swapped</span>
                        <h6 className="stats-card-content">
                          {tokensToBeSwapped} DYP
                        </h6>
                      </div>
                      <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                        <span className="stats-card-title">To be burnt</span>
                        <h6 className="stats-card-content">
                          {tokensToBeDisbursedOrBurnt} iDYP
                        </h6>
                      </div>
                      <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                        <span className="stats-card-title">
                          Contract Expiration
                        </span>
                        <h6 className="stats-card-content">
                          {expiration_time}
                        </h6>
                      </div>
                      <div className="d-flex flex-column align-items-start justify-content-center gap-2">
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
                  <div className="container">
                    <div className="row" style={{ marginLeft: "0px" }}>
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
                                date={Number(stakingTime) + Number(cliffTime)}
                                renderer={renderer}
                              />
                            )}
                          </h6>
                        </div>
                      </div>
                      <div className="separator"></div>

                      <div className="d-flex flex-column gap-1 mt-2">
                        <h6
                          className="withsubtitle mb-2"
                          style={{ color: "#4ED5D2" }}
                        >
                          Select assets
                        </h6>
                        <div className="row d-flex align-items-start justify-content-between gap-1 ">
                          <div className="col-5 d-flex flex-column gap-1">
                            <div
                              className="gap-1 claimreward-wrapper w-100"
                              onClick={() => {
                                this.setState({ selectedPool: "wavax2" });
                              }}
                              style={{
                                background:
                                  this.state.selectedPool === "wavax2"
                                    ? "#141333"
                                    : "#26264F",
                                border:
                                  this.state.selectedPool === "wavax2"
                                    ? "1px solid #57B6AB"
                                    : "1px solid #8E97CD",
                              }}
                            >
                              <img
                                src={
                                  this.state.selectedPool === "wavax2"
                                    ? check
                                    : empty
                                }
                                alt=""
                                className="activestate"
                                style={{ top: "65px" }}
                              />
                              <div className="d-flex flex-column align-items-center gap-2 justify-content-between w-100">
                                <div className="position-relative">
                                  <h6
                                    className="withsubtitle"
                                    style={{ padding: "5px 0 0 15px" }}
                                  >
                                    Value
                                  </h6>

                                  <input
                                    disabled
                                    value={
                                      Number(this.state.withdrawAmount) > 0
                                        ? `${this.state.withdrawAmount *
                                          LP_AMPLIFY_FACTOR
                                        } LP`
                                        : `${this.state.withdrawAmount} LP`
                                    }
                                    onChange={(e) =>
                                      this.setState({
                                        withdrawAmount:
                                          Number(e.target.value) > 0
                                            ? e.target.value / LP_AMPLIFY_FACTOR
                                            : e.target.value,
                                      })
                                    }
                                    className=" left-radius inputfarming styledinput2"
                                    placeholder="0"
                                    type="text"
                                    style={{
                                      width: "165px",
                                      padding: "0px 15px 0px 15px",
                                      height: 35,
                                      fontSize: 20,
                                      fontWeight: 300,
                                    }}
                                  />
                                </div>
                                {/* <div
                                className="d-flex flex-column gap-1"
                                style={{ paddingRight: "15px" }}
                              >
                                <h6 className="withsubtitle"></h6>
                                <h6
                                  className="withtitle"
                                  style={{ color: "#C0CBF7" }}
                                >
                                  $200
                                </h6>
                              </div> */}
                                <div className="d-flex flex-column align-items-center gap-2 justify-content-between w-100">
                                  <div className="position-relative">
                                    <h6
                                      className="withsubtitle"
                                      style={{ padding: "5px 0 0 15px" }}
                                    >
                                      LP balance
                                    </h6>

                                    <input
                                      disabled
                                      value={
                                        Number(this.state.withdrawAmount) > 0
                                          ? `${this.state.withdrawAmount *
                                            LP_AMPLIFY_FACTOR
                                          } LP`
                                          : `${this.state.withdrawAmount} LP`
                                      }
                                      onChange={(e) =>
                                        this.setState({
                                          withdrawAmount:
                                            Number(e.target.value) > 0
                                              ? e.target.value /
                                              LP_AMPLIFY_FACTOR
                                              : e.target.value,
                                        })
                                      }
                                      className=" left-radius inputfarming styledinput2"
                                      placeholder="0"
                                      type="text"
                                      style={{
                                        width: "165px",
                                        padding: "0px 15px 0px 15px",
                                        height: 35,
                                        fontSize: 20,
                                        fontWeight: 300,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div
                                className="d-flex align-items-center justify-content-center w-100 claimreward-header"
                              // style={{ padding: "10px 0 0 10px" }}
                              >
                                {/* <img
                                src={
                                  require(`./assets/avax/${this.state.selectedRewardTokenLogo1.toLowerCase()}.svg`)
                                    .default
                                }
                                alt=""
                                style={{ width: 14, height: 14 }}
                              />
                              <select
                                disabled={!is_connected}
                                value={this.state.selectedClaimToken}
                                onChange={(e) => {
                                  this.handleClaimToken(e.target.value);
                                  this.setState({
                                    selectedRewardTokenLogo1:
                                      e.target.value === "0"
                                        ? "wavax"
                                        : "weth.e",
                                  });
                                }}
                                className=" inputfarming"
                                style={{ border: "none" }}
                              >
                                <option value="0"> WAVAX </option>
                                <option value="1"> WETH.e </option>
                              </select> */}
                                <div class="dropdown">
                                  <button
                                    class="btn reward-dropdown inputfarming d-flex align-items-center justify-content-center gap-1"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <img
                                      src={
                                        require(`./assets/${this.state.selectedRewardTokenLogo1.toLowerCase()}.svg`)
                                          .default
                                      }
                                      alt=""
                                      style={{ width: 14, height: 14 }}
                                    />
                                    {this.state.selectedRewardTokenLogo1.toUpperCase()}
                                    <img
                                      src={dropdownVector}
                                      alt=""
                                      style={{ width: 10, height: 10 }}
                                    />
                                  </button>
                                  <ul
                                    class="dropdown-menu"
                                    style={{ minWidth: "100%" }}
                                  >
                                    <span
                                      className="d-flex align-items-center justify-content-center  gap-1 inputfarming farming-dropdown-item py-1 w-100"
                                      onClick={() => {
                                        this.handleClaimToken("1");
                                        this.setState({
                                          selectedRewardTokenLogo1: "wavax",
                                        });
                                      }}
                                    >
                                      <img
                                        src={
                                          require(`./assets/wavax.svg`).default
                                        }
                                        alt=""
                                        style={{ width: 14, height: 14 }}
                                      />
                                      WAVAX
                                    </span>
                                    <span
                                      className="d-flex align-items-center justify-content-center  gap-1 inputfarming farming-dropdown-item py-1 w-100"
                                      onClick={() => {
                                        this.handleClaimToken("2");
                                        this.setState({
                                          selectedRewardTokenLogo1: "usdt",
                                        });
                                      }}
                                    >
                                      <img
                                        src={
                                          require(`./assets/usdt.svg`).default
                                        }
                                        alt=""
                                        style={{ width: 14, height: 14 }}
                                      />
                                      USDT
                                    </span>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <h6 className="withsubtitle d-flex justify-content-start w-100 mb-2">
                              Total LP deposited{" "}
                            </h6>
                          </div>
                          <div className="col-5 d-flex flex-column gap-1">
                            <div
                              className="gap-1 claimreward-wrapper w-100"
                              style={{
                                background:
                                  this.state.selectedPool === "dyp2"
                                    ? "#141333"
                                    : "#26264F",
                                border:
                                  this.state.selectedPool === "dyp2"
                                    ? "1px solid #57B6AB"
                                    : "1px solid #8E97CD",
                              }}
                              onClick={() => {
                                this.setState({ selectedPool: "dyp2" });
                              }}
                            >
                              <img
                                src={
                                  this.state.selectedPool === "dyp2"
                                    ? check
                                    : empty
                                }
                                alt=""
                                className="activestate"
                              />

                              <div className="d-flex flex-column align-items-center gap-2 justify-content-between w-100 position-relative">
                                <div className="position-relative">
                                  <h6
                                    className="withsubtitle"
                                    style={{ padding: "0px 15px 0px 15px" }}
                                  >
                                    DYP Balance
                                  </h6>

                                  <input
                                    disabled
                                    value={`${depositedTokensDYP} DYP`}
                                    onChange={(e) =>
                                      this.setState({
                                        withdrawAmount:
                                          Number(e.target.value) > 0
                                            ? e.target.value / LP_AMPLIFY_FACTOR
                                            : e.target.value,
                                      })
                                    }
                                    className=" left-radius inputfarming styledinput2"
                                    placeholder="0"
                                    type="text"
                                    style={{
                                      width: "150px",
                                      padding: "0px 15px 0px 15px",
                                      height: 35,
                                      fontSize: 20,
                                      fontWeight: 300,
                                    }}
                                  />
                                </div>
                                <div className="position-relative">
                                  <h6
                                    className="withsubtitle"
                                    style={{ padding: "0px 15px 0px 15px" }}
                                  >
                                    Value
                                  </h6>

                                  <input
                                    disabled
                                    value={`${depositedTokensDYP} DYP`}
                                    onChange={(e) =>
                                      this.setState({
                                        withdrawAmount:
                                          Number(e.target.value) > 0
                                            ? e.target.value / LP_AMPLIFY_FACTOR
                                            : e.target.value,
                                      })
                                    }
                                    className=" left-radius inputfarming styledinput2"
                                    placeholder="0"
                                    type="text"
                                    style={{
                                      width: "150px",
                                      padding: "0px 15px 0px 15px",
                                      height: 35,
                                      fontSize: 20,
                                      fontWeight: 300,
                                    }}
                                  />
                                </div>
                                {/* <div
                                className="d-flex flex-column gap-1 position-relative"
                                style={{ paddingRight: "15px", top: "-8px" }}
                              >
                                <h6 className="withsubtitle" >Value</h6>
                                <h6
                                  className="withtitle"
                                  style={{ color: "#C0CBF7" }}
                                >
                                  $200
                                </h6>
                              </div> */}
                              </div>
                              <div
                                className="d-flex align-items-center justify-content-center w-100 claimreward-header"
                              // style={{ padding: "10px 0 0 10px" }}
                              >
                                <img
                                  src={
                                    require(`./assets/avax/${this.state.selectedRewardTokenLogo2.toLowerCase()}.svg`)
                                      .default
                                  }
                                  alt=""
                                  style={{ width: 14, height: 14 }}
                                />
                                <select
                                  disabled
                                  defaultValue="DYP"
                                  className="form-control inputfarming"
                                  style={{
                                    border: "none",
                                    padding: "0 0 0 3px",
                                  }}
                                >
                                  <option value="DYP"> DYP </option>
                                </select>
                              </div>
                            </div>
                            <h6 className="withsubtitle d-flex justify-content-start w-100 ">
                              Total DYP deposited{" "}
                            </h6>
                          </div>
                        </div>
                      </div>

                      <div className="separator"></div>
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        {/* <button
                        className="btn filledbtn w-100"
                        onClick={(e) => {
                          this.handleWithdrawDyp();
                        }}
                        title={
                          canWithdraw
                            ? ""
                            : `You recently staked, you can unstake ${cliffTimeInWords}`
                        }
                      >
                        Withdraw
                      </button> */}

                        <button
                          disabled={
                            this.state.selectedPool === "" ||
                              this.state.withdrawStatus === "failed" ||
                              this.state.withdrawStatus === "success" 
                              ? true
                              : false
                          }
                          className={` w-100 btn filledbtn ${this.state.selectedPool === "" 
                              ? "disabled-btn"
                              : this.state.withdrawStatus === "failed"
                                ? "fail-button"
                                : this.state.withdrawStatus === "success"
                                  ? "success-button"
                                  : null
                            } d-flex justify-content-center align-items-center`}
                          style={{ height: "fit-content" }}
                          onClick={() => {
                            this.state.selectedPool === "wavax2"
                              ? this.handleWithdraw()
                              : this.handleWithdrawDyp();
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
                      {/* <h6 className="withsubtitle d-flex justify-content-start w-100 mt-1">
                        *No withdrawal fee
                      </h6> */}
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
              title="calculator"
              modalId="calculatormodal"
              setIsVisible={() => this.setState({ showCalculator: false })}
              visible={this.state.showCalculator}
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
                      value={
                        Number(this.state.approxDeposit) > 0
                          ? this.state.approxDeposit * LP_AMPLIFY_FACTOR
                          : this.state.approxDeposit
                      }
                      onChange={(e) =>
                        this.setState({
                          approxDeposit:
                            Number(e.target.value) > 0
                              ? e.target.value / LP_AMPLIFY_FACTOR
                              : e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="d-flex flex-column gap-2 mt-4">
                  <h3 style={{ fontWeight: "500", fontSize: "39px" }}>
                    $ {getFormattedNumber(
                      this.getApproxReturnUSD() / this.getUsdPerETH(),
                      6
                    )}
                     USD
                  </h3>
                  <h6
                    style={{
                      fontWeight: "300",
                      fontSize: "15px",
                      color: "#f7f7fc",
                    }}
                  >
                Approx {" "}{getFormattedNumber(this.getApproxReturnUSD(), 2)}{" "}
                    WAVAX
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
        //     <div className="col-12 header-image-farming-new">
        //       <div className="container">
        //         <Modal show={this.state.popup} handleClose={this.hidePopup}>
        //           <div className="earn-hero-content p4token-wrapper">
        //             <p className="h3">
        //               <b>Maximize your Yield Farming Rewards</b>
        //             </p>
        //             <p>
        //               Automatically adds liquidity to
        //               <Tooltip
        //                 placement="top"
        //                 title={
        //                   <div className="tooltip-text">
        //                     {tooltip1}
        //                   </div>
        //                 }
        //               >
        //                 <Button
        //                   style={{
        //                     fontSize: "70%",
        //                     textDecoration: "underline",
        //                     color: "var(--color_white)",
        //                   }}
        //                 >
        //                   Pangolin & deposit to Staking{" "}
        //                 </Button>
        //               </Tooltip>
        //               contract using one asset. To start earning, all you need
        //               is to deposit one of the supported assets (WAVAX, USDC.e,
        //               USDT.e, WETH.e, PNG, QI, DAI.e, XAVA, WBTC.e, LINK.e, or
        //               iDYP) and earn
        //               <Tooltip
        //                 placement="top"
        //                 title={
        //                   <div className="tooltip-text">
        //                     {tooltip2}
        //                   </div>
        //                 }
        //               >
        //                 <Button
        //                   style={{
        //                     fontSize: "70%",
        //                     textDecoration: "underline",
        //                     color: "var(--color_white)",
        //                     padding: "4px 0px 2px 5px",
        //                   }}
        //                 >
        //                   WAVAX/ETH/DYP as rewards.
        //                 </Button>
        //               </Tooltip>
        //             </p>
        //             <p>
        //               All pool rewards are automatically converted from iDYP to
        //               WAVAX by the smart contract, decreasing the risk of iDYP
        //               price volatility.
        //               <Tooltip
        //                 placement="top"
        //                 title={
        //                   <div className="tooltip-text">
        //                     {tooltip2}
        //                   </div>
        //                 }
        //               >
        //                 <Button
        //                   style={{
        //                     fontSize: "70%",
        //                     textDecoration: "underline",
        //                     color: "var(--color_white)",
        //                   }}
        //                 >
        //                   WAVAX/ETH + DYP{" "}
        //                 </Button>
        //               </Tooltip>
        //               is a double reward to the liquidity providers. The users
        //               can choose between two different types of rewards: WAVAX
        //               or ETH. Maintaining token price stability — every 24
        //               hours, the smart contract will automatically try
        //               converting the iDYP rewards to WAVAX. If the iDYP price is
        //               affected by more than
        //               <img src="/img/icon/arrow.svg" alt="images not found" />
        //               2.5%, then the maximum iDYP amount not influencing the
        //               price will be swapped to WAVAX, with the remaining amount
        //               distributed in the next day’s rewards. After seven days,
        //               if we still have undistributed iDYP rewards, the DeFi
        //               Yield Protocol governance will vote on whether the
        //               remaining iDYP will be distributed to the token holders or
        //               burned (all burned tokens are out of circulation).
        //             </p>
        //             <p>
        //               You will receive the total amount in the initial deposit
        //               asset with withdrawal by burning LP tokens when you
        //               unstake.
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
        //             <p className="header-title-text">DYP Farming</p>
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
        //                   onClick={() =>
        //                     window.open(
        //                       "https://www.youtube.com/watch?v=b-WHRSgFn-k&t=1s",
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
        //                                 <img src="img/icon/vector.svg" /> {apy}%{" "}
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
        //                             className="col-7 d-block text-left"
        //                           >
        //                             DEPOSIT
        //                           </label>

        //                         </div>

        //                         <div>
        //                           <p>
        //                             Balance:{" "}
        //                             {getFormattedNumber(
        //                               this.state.selectedTokenBalance /
        //                                 10 ** this.state.selectedTokenDecimals,
        //                               6
        //                             )}{" "}
        //                             {this.state.selectedTokenSymbol}
        //                           </p>
        //                           <select
        //                             disabled={!is_connected}
        //                             value={this.state.selectedBuybackToken}
        //                             onChange={(e) =>
        //                               this.handleSelectedTokenChange(
        //                                 e.target.value
        //                               )
        //                             }
        //                             className="form-control"
        //                           >
        //                             {Object.keys(
        //                               window.buyback_tokens_farmingavax
        //                             ).map((t) => (
        //                               <option key={t} value={t}>
        //                                 {" "}
        //                                 {
        //                                   window.buyback_tokens_farmingavax[t]
        //                                     .symbol
        //                                 }{" "}
        //                               </option>
        //                             ))}
        //                           </select>
        //                           <br />
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

        //                         Please approve before deposit. PERFORMANCE FEE{" "}
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
        //                       <div
        //                         className="form-row "
        //                         style={{ paddingBottom: "20px" }}
        //                       >
        //                         <div className="col-6">
        //                           <input
        //                             value={
        //                               Number(this.state.withdrawAmount) > 0
        //                                 ? `${
        //                                     this.state.withdrawAmount *
        //                                     LP_AMPLIFY_FACTOR
        //                                   } LP`
        //                                 : `${this.state.withdrawAmount} LP`
        //                             }
        //                             onChange={(e) =>
        //                               this.setState({
        //                                 withdrawAmount:
        //                                   Number(e.target.value) > 0
        //                                     ? e.target.value / LP_AMPLIFY_FACTOR
        //                                     : e.target.value,
        //                               })
        //                             }
        //                             className="form-control left-radius"
        //                             placeholder="0"
        //                             type="text"
        //                             disabled
        //                           />

        //                         </div>
        //                         <div className="col-6">
        //                           <input
        //                             value={`${depositedTokensDYP} DYP`}
        //                             onChange={(e) =>
        //                               this.setState({
        //                                 withdrawAmount:
        //                                   Number(e.target.value) > 0
        //                                     ? e.target.value / LP_AMPLIFY_FACTOR
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
        //                       <div className="form-row">
        //                         <div className="col-6">
        //                           <select
        //                             disabled={!is_connected}
        //                             value={
        //                               this.state.selectedBuybackTokenWithdraw
        //                             }
        //                             onChange={(e) =>
        //                               this.handleSelectedTokenChangeWithdraw(
        //                                 e.target.value
        //                               )
        //                             }
        //                             className="form-control"
        //                           >
        //                             {Object.keys(
        //                               window.buyback_tokens_farmingavax
        //                             ).map((t) => (
        //                               <option key={t} value={t}>
        //                                 {" "}
        //                                 {
        //                                   window.buyback_tokens_farmingavax[t]
        //                                     .symbol
        //                                 }{" "}
        //                               </option>
        //                             ))}
        //                           </select>
        //                         </div>
        //                         <div className="col-6">
        //                           <select
        //                             disabled={!is_connected}
        //                             defaultValue="DYP"
        //                             className="form-control"
        //                           >
        //                             <option value="DYP"> DYP </option>
        //                           </select>
        //                         </div>
        //                       </div>
        //                     </div>
        //                     {/*<br />*/}
        //                     <div className="form-row">
        //                       <div className="col-6">
        //                         <button
        //                           title={
        //                             canWithdraw
        //                               ? ""
        //                               : `You recently staked, you can unstake ${cliffTimeInWords}`
        //                           }
        //                           disabled={!canWithdraw || !is_connected}
        //                           className="btn  btn-primary btn-block l-outline-btn"
        //                           type="submit"
        //                         >
        //                           WITHDRAW
        //                         </button>
        //                       </div>
        //                       <div className="col-6">
        //                         <button
        //                           onClick={(e) => {
        //                             e.preventDefault();
        //                             this.handleWithdrawDyp();
        //                           }}
        //                           title={
        //                             canWithdraw
        //                               ? ""
        //                               : `You recently staked, you can unstake ${cliffTimeInWords}`
        //                           }
        //                           disabled={!canWithdraw || !is_connected}
        //                           className="btn  btn-primary btn-block l-outline-btn"
        //                           type="submit"
        //                         >
        //                           WITHDRAW
        //                         </button>
        //                       </div>
        //                     </div>

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
        //                       <div className="form-row mb-3">
        //                         <div className="col-6">
        //                           <input
        //                             value={
        //                               Number(pendingDivsEth) > 0
        //                                 ? `${pendingDivsEth} WAVAX`
        //                                 : `${pendingDivsEth} WAVAX`
        //                             }
        //                             onChange={(e) =>
        //                               this.setState({
        //                                 pendingDivsEth:
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
        //                         <div className="col-6">
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
        //                       <div className="form-row">
        //                         <div className="col-6">
        //                           <select
        //                             disabled={!is_connected}
        //                             value={this.state.selectedClaimToken}
        //                             onChange={(e) =>
        //                               this.handleClaimToken(e.target.value)
        //                             }
        //                             className="form-control"
        //                           >
        //                             <option value="0"> WAVAX </option>
        //                             <option value="1"> WETH.e </option>
        //                           </select>
        //                         </div>
        //                         <div className="col-6">
        //                           <select
        //                             disabled={!is_connected}
        //                             defaultValue="DYP"
        //                             className="form-control"
        //                           >
        //                             <option value="DYP"> DYP </option>
        //                           </select>
        //                         </div>
        //                       </div>
        //                     </div>

        //                     <div className="form-row">
        //                       <div className="col-6">
        //                         <button
        //                           disabled={!is_connected}
        //                           title={claimTitle}
        //                           className="btn  btn-primary btn-block l-outline-btn"
        //                           type="submit"
        //                         >
        //                           CLAIM
        //                         </button>
        //                       </div>
        //                       <div className="col-6">
        //                         <button
        //                           disabled={!is_connected}
        //                           onClick={(e) => {
        //                             e.preventDefault();
        //                             this.handleClaimDyp();
        //                           }}
        //                           title={claimTitle}
        //                           className="btn  btn-primary btn-block l-outline-btn"
        //                           type="submit"
        //                         >
        //                           CLAIM
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
        //                             USD to Deposit
        //                           </label>
        //                           <input
        //                             className="form-control "
        //                             value={
        //                               Number(this.state.approxDeposit) > 0
        //                                 ? this.state.approxDeposit *
        //                                   LP_AMPLIFY_FACTOR
        //                                 : this.state.approxDeposit
        //                             }
        //                             onChange={(e) =>
        //                               this.setState({
        //                                 approxDeposit:
        //                                   Number(e.target.value) > 0
        //                                     ? e.target.value / LP_AMPLIFY_FACTOR
        //                                     : e.target.value,
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
        //                       Approx. $
        //                       {getFormattedNumber(this.getApproxReturnUSD(), 2)}{" "}
        //                       USD (
        //                       {getFormattedNumber(
        //                         this.getApproxReturnUSD() / this.getUsdPerETH(),
        //                         6
        //                       )}{" "}
        //                       WAVAX)
        //                     </p>
        //                   </form>
        //                 </div>
        //               </div>
        //             </div>
        //           </div>
        //           <div className="col-lg-6">
        //             <div className="l-box pl-3 pr-3">
        //               <div className="table-responsive container">
        //                 <div className="row" style={{ marginLeft: "0px" }}>
        //                   <label
        //                     className="col-md-8 d-block text-left"
        //                     style={{
        //                       fontSize: "1.1rem",
        //                       fontWeight: "600",
        //                       padding: ".3rem",
        //                     }}
        //                   >
        //                     MY STATS
        //                   </label>
        //                   <div className="col-4">
        //                     <NavLink
        //                       rel="noopener noreferrer"
        //                       to={"/staking-stats"}
        //                     >
        //                       {is_connected && (
        //                         <button
        //                           className="btn btn-sm btn-block btn-primary l-outline-btn"
        //                           type="button"
        //                         >
        //                           VIEW ALL
        //                         </button>
        //                       )}
        //                     </NavLink>
        //                   </div>
        //                 </div>
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
        //                         <strong>{reward_token_balance}</strong>{" "}
        //                         <small>DYP</small>
        //                       </td>
        //                     </tr>

        //                     <tr>
        //                       <th>MY LP Deposit</th>
        //                       <td className="text-right">
        //                         <strong>{myDepositedLpTokens}</strong>{" "}
        //                         <small>iDYP/WAVAX</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>Total LP Deposited</th>
        //                       <td className="text-right">
        //                         <strong>{tvl}</strong> <small>iDYP/WAVAX</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>My DYP Deposit</th>
        //                       <td className="text-right">
        //                         <strong>{depositedTokensDYP}</strong>{" "}
        //                         <small>DYP</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>Total DYP Deposited</th>
        //                       <td className="text-right">
        //                         <strong>{tvlConstantDYP}</strong>{" "}
        //                         <small>DYP</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>My Share</th>
        //                       <td className="text-right">
        //                         <strong>{myShare}</strong> <small>%</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>Total Earned DYP</th>
        //                       <td className="text-right">
        //                         <strong>{totalEarnedTokens}</strong>{" "}
        //                         <small>DYP</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>Total Earned WAVAX</th>
        //                       <td className="text-right">
        //                         <strong>{totalEarnedEth}</strong>{" "}
        //                         <small>WAVAX</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>To be Swapped</th>
        //                       <td className="text-right">
        //                         <strong>{tokensToBeSwapped}</strong>{" "}
        //                         <small>iDYP</small>
        //                       </td>
        //                     </tr>
        //                     <tr>
        //                       <th>To be burnt / disbursed</th>
        //                       <td className="text-right">
        //                         <strong>{tokensToBeDisbursedOrBurnt}</strong>{" "}
        //                         <small>iDYP</small>
        //                       </td>
        //                     </tr>

        //                     <tr>
        //                       <th>TVL USD</th>
        //                       <td className="text-right">
        //                         <strong>${tvl_usd}</strong> <small>USD</small>
        //                       </td>
        //                     </tr>
        //                     {isOwner && (
        //                       <tr>
        //                         <th>Total Stakers</th>
        //                         <td className="text-right">
        //                           <strong>{total_stakers}</strong>{" "}
        //                           <small></small>
        //                         </td>
        //                       </tr>
        //                     )}

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
        //                            <a
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             href={`${window.config.etherscan_baseURL}/address/${staking._address}`}
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

  return FarmAvax;
}
