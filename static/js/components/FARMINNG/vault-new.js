import React, { useState, useEffect } from "react";
import moment from "moment";
import getFormattedNumber from "../../functions/get-formatted-number";
import Modal from "../Modal/Modal";
import Address from "./address";
import WalletModal from "../WalletModal";
import "./top-pools.css";
import ellipse from "./assets/ellipse.svg";
import failMark from "../../assets/failMark.svg";
import moreinfo from "./assets/more-info.svg";
import purplestats from "./assets/purpleStat.svg";
import wallet from "./assets/wallet.svg";
import Tooltip from "@material-ui/core/Tooltip";
import statsLinkIcon from "./assets/statsLinkIcon.svg";
import { shortAddress } from "../../functions/shortAddress";
import poolStatsIcon from "./assets/poolStatsIcon.svg";
import poolsCalculatorIcon from "./assets/poolsCalculatorIcon.svg";
import { ClickAwayListener } from "@material-ui/core";
import { handleSwitchNetworkhook } from "../../functions/hooks";
import axios from "axios";

const Vault = ({
  vault,
  platformTokenApyPercent,
  apr = 72,
  liquidity = "ETH",
  token,
  UNDERLYING_DECIMALS = 18,
  UNDERLYING_SYMBOL = "DAI",
  expiration_time,
  coinbase,
  chainId,
  lockTime,
  listType,
  handleSwitchNetwork,
  the_graph_result,
  handleConnection,
  expired,
  isConnected,
}) => {
  let { BigNumber, alertify, token_dyps } = window;
  let token_symbol = UNDERLYING_SYMBOL;

  // token, staking

  const TOKEN_DECIMALS = UNDERLYING_DECIMALS;

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
    download("depositors-list.csv", jsonToCsv(list));

    function getDate(timestamp) {
      let a = new Date(timestamp);
      return a.toUTCString();
    }
  };

  const [token_balance, settoken_balance] = useState("...");
  const [pendingDivsEth, setpendingDivsEth] = useState("");
  const [pendingDivsDyp, setpendingDivsDyp] = useState("");
  const [pendingDivsDyp_noFormatted, setpendingDivsDyp_noFormatted] =
    useState("");

  const [pendingDivsToken, setpendingDivsToken] = useState("");
  const [pendingDivsComp, setpendingDivsComp] = useState("");

  const [totalEarnedEth, settotalEarnedEth] = useState("");
  const [totalEarnedDyp, settotalEarnedDyp] = useState("");
  const [totalEarnedToken, settotalEarnedToken] = useState("");
  const [totalEarnedComp, settotalEarnedComp] = useState("");

  const [cliffTime, setcliffTime] = useState("");
  const [stakingTime, setstakingTime] = useState("");
  const [depositedTokens, setdepositedTokens] = useState("");
  const [totaldepositedTokens, setTotaldepositedTokens] = useState("");

  const [lastClaimedTime, setlastClaimedTime] = useState("");
  const [reInvestLoading, setreInvestLoading] = useState(false);
  const [reInvestStatus, setreInvestStatus] = useState("initial");
  const [depositAmount, setdepositAmount] = useState("");
  const [redepositAmount, setRedepositAmount] = useState("");

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

  const [tvl_usd, settvl_usd] = useState("");
  const [tvlUSD, settvlUSD] = useState(1);

  const [referralFeeEarned, setreferralFeeEarned] = useState("");
  const [stakingOwner, setstakingOwner] = useState(null);
  const [approxDeposit, setapproxDeposit] = useState(100);
  const [approxDays, setapproxDays] = useState(365);
  const [showCalculator, setshowCalculator] = useState(false);
  const [usdPerToken, setusdPerToken] = useState("");
  const [usdPerDepositToken, setusdPerDepositToken] = useState("");

  const [errorMsg, seterrorMsg] = useState("");
  const [errorMsg2, seterrorMsg2] = useState("");
  const [errorMsg3, seterrorMsg3] = useState("");
  const [contractDeployTime, setcontractDeployTime] = useState("");
  const [disburseDuration, setdisburseDuration] = useState("");
  const [tvlDyps, setsettvlDyps] = useState("");
  const [total_stakers, settotal_stakers] = useState("");
  const [gasPrice, setgasPrice] = useState("");
  const [platform_token_balance, setplatform_token_balance] = useState("");

  const [show, setshow] = useState(false);
  const [showWithdrawModal, setshowWithdrawModal] = useState(false);
  const [popup, setpopup] = useState(false);
  const [apy_percent, setapy_percent] = useState(false);
  const [owner, setowner] = useState(false);
  const [performanceTooltip, setperformanceTooltip] = useState(false);
  const [aprTooltip, setaprTooltip] = useState(false);
  const [lockTooltip, setlockTooltip] = useState(false);
  const [depositTooltip, setdepositTooltip] = useState(false);
  const [rewardsTooltip, setrewardsTooltip] = useState(false);
  const [withdrawTooltip, setwithdrawTooltip] = useState(false);
  const [vault_contract, setvault_contract] = useState();

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

  const initContract = () => {
    const infura_web3 = window.infuraWeb3;
    let vault_contr = new infura_web3.eth.Contract(
      window.VAULT_ABI,
      vault._address
    );
    setvault_contract(vault_contr);
  };

  const refreshBalance = async () => {
    let coinbase = coinbase2;

    if (window.coinbase_address) {
      coinbase = window.coinbase_address;
      setcoinbase(coinbase);
    }

    let pendingRewardsInToken = 0;

    let usd_per_dyps;
    if (the_graph_result) {
      usd_per_dyps = the_graph_result.price_DYPS
        ? the_graph_result.price_DYPS
        : 1;
    }

    try {
      let _bal = token.balanceOf(coinbase);

      if (vault && vault_contract) {
        let _stakingTime = vault_contract.methods.depositTime(coinbase).call();

        let _dTokens = vault_contract.methods
          .depositTokenBalance(coinbase)
          .call();

        let _lClaimTime = vault_contract.methods
          .lastClaimedTime(coinbase)
          .call();

        let tStakers = vault_contract.methods.getNumberOfHolders().call();

        //Take DYPS Balance

        let _tvlDYPS = token_dyps.balanceOf(vault._address); /* TVL of DYPS */

        let [
          token_balance,
          stakingTime,
          depositedTokens,
          lastClaimedTime,
          total_stakers,
          tvlDYPS,
        ] = await Promise.all([
          _bal,
          _stakingTime,
          _dTokens,
          _lClaimTime,
          tStakers,
          _tvlDYPS,
        ]);

        let usdValueDYPS = new BigNumber(tvlDYPS)
          .times(usd_per_dyps)
          .toFixed(10);

        let tvlUSD2 = new BigNumber(usdValueDYPS).div(1e18).toFixed(0);
        settvlUSD(tvlUSD2);

        let tvlUSD_final = parseInt(tvlUSD) + parseInt(tvl_usd);

        let tvl_usd_final = getFormattedNumber(tvlUSD_final, 2);
        // settvl_usd(tvl_usd_final)

        const balance_formatted = new BigNumber(token_balance)
          .div(10 ** TOKEN_DECIMALS)
          .toString(10);

        settoken_balance(balance_formatted);

        setstakingTime(stakingTime * 1e3);

        let depositedTokens_formatted = new BigNumber(depositedTokens)
          .div(10 ** TOKEN_DECIMALS)
          .toString(10);

        setdepositedTokens(depositedTokens_formatted);

        setlastClaimedTime(lastClaimedTime);
        settotal_stakers(total_stakers);

        let owner2 = await vault_contract.methods.owner().call();
        setowner(owner2);

        let _pDivsToken = vault_contract.methods
          .tokenDivsOwing(coinbase)
          .call();

        let _pDivsComp = vault_contract.methods
          .getEstimatedCompoundDivsOwing(coinbase)
          .call();

        let _pDivsDyp = vault_contract.methods
          .platformTokenDivsOwing(coinbase)
          .call();

        let _pDivsEth = vault_contract.methods.ethDivsOwing(coinbase).call();

        let _pBalToken = vault_contract.methods
          .tokenDivsBalance(coinbase)
          .call();

        let _pBalEth = vault_contract.methods.ethDivsBalance(coinbase).call();

        let _pBalDyp = vault_contract.methods
          .platformTokenDivsBalance(coinbase)
          .call();
        let [
          pendingDivsEth,
          pendingDivsComp,
          pendingDivsDyp,
          pendingDivsToken,
          pendingBalEth,
          pendingBalDyp,
          pendingBalToken,
        ] = await Promise.all([
          _pDivsEth,
          _pDivsComp,
          _pDivsDyp,
          _pDivsToken,
          _pBalEth,
          _pBalDyp,
          _pBalToken,
        ]);

        const pendingDivsEth1 = new BigNumber(pendingDivsEth)
          .plus(pendingBalEth)
          .toFixed(0);

        const pendingDivsEth2 = new BigNumber(pendingDivsEth1)
          .div(10 ** 18)
          .toString(10);
        setpendingDivsEth(getFormattedNumber(pendingDivsEth2, 9));

        let pendingDivsToken1 = new BigNumber(pendingDivsToken)
          .plus(pendingBalToken)
          .toFixed(0);

        const pendingDivsToken2 = new BigNumber(pendingDivsToken1)
          .div(10 ** TOKEN_DECIMALS)
          .toString(10);
        setpendingDivsToken(getFormattedNumber(pendingDivsToken2, 6));

        let pendingDivsDyp1 = new BigNumber(pendingDivsDyp)
          .plus(pendingBalDyp)
          .toFixed(0);
        setpendingDivsDyp_noFormatted(pendingDivsDyp1);
        const pendingDivsDyp2 = new BigNumber(pendingDivsDyp1)
          .div(10 ** TOKEN_DECIMALS)
          .toString(10);
        setpendingDivsDyp(getFormattedNumber(pendingDivsDyp2, 6));

        const pendingDivsComp2 = new BigNumber(pendingDivsComp)
          .div(10 ** TOKEN_DECIMALS)
          .toString(10);
        setpendingDivsComp(getFormattedNumber(pendingDivsComp2, 6));
        pendingRewardsInToken = pendingDivsDyp;
      }
    } catch (e) {
      console.error(e);
    }

    window.reward_token_idyp
      .balanceOf(coinbase)
      .then((platform_token_balance) =>
        setplatform_token_balance(platform_token_balance)
      );
    if (vault && vault_contract) {
      await vault_contract.methods
        .totalDepositedTokens()
        .call()
        .then((totalDepositedTokens) => {
          setTotaldepositedTokens(totalDepositedTokens);
        })
        .catch(console.log);

      await vault_contract.methods
        .totalEarnedCompoundDivs(coinbase)
        .call()
        .then((totalEarnedComp) => {
          let totalEarnedComp2 = new BigNumber(totalEarnedComp)
            .div(10 ** TOKEN_DECIMALS)
            .toString(10);
          settotalEarnedComp(getFormattedNumber(totalEarnedComp2, 6));
        })
        .catch(console.log);
      await vault_contract.methods
        .totalEarnedEthDivs(coinbase)
        .call()
        .then((totalEarnedEth) => {
          let totalEarnedEth2 = new BigNumber(totalEarnedEth)
            .div(10 ** 18)
            .toString(10);
          settotalEarnedEth(getFormattedNumber(totalEarnedEth2, 6));
        })
        .catch(console.log);
      await vault_contract.methods
        .totalEarnedTokenDivs(coinbase)
        .call()
        .then((totalEarnedToken) => {
          let totalEarnedToken2 = new BigNumber(totalEarnedToken)
            .div(10 ** TOKEN_DECIMALS)
            .toString(10);
          settotalEarnedToken(getFormattedNumber(totalEarnedToken2, 6));
        })

        .catch(console.log);
      await vault_contract.methods
        .totalEarnedPlatformTokenDivs(coinbase)
        .call()
        .then((totalEarnedDyp) => {
          let totalEarnedDyp2 = new BigNumber(totalEarnedDyp)
            .div(10 ** 18)
            .toString(10);
          settotalEarnedDyp(getFormattedNumber(totalEarnedDyp2, 6));
        })
        .catch(console.log);

      await vault_contract.methods
        .LOCKUP_DURATION()
        .call()
        .then((cliffTime) => {
          setcliffTime(Number(cliffTime * 1e3));
        })
        .catch(console.error);

      await vault_contract.methods
        .contractStartTime()
        .call()
        .then((contractDeployTime) => {
          setcontractDeployTime(contractDeployTime);
        });

      await vault_contract.methods
        .REWARD_INTERVAL()
        .call()
        .then((disburseDuration) => {
          setdisburseDuration(disburseDuration);
        });
    }
  };

  const getTokenPrice = async () => {
    if (vault && vault_contract) {
      let pDivsDyp = await vault_contract.methods
        .platformTokenDivsOwing(coinbase)
        .call()
        .then((data) => {
          return data;
        });

      let pendingRewardsInToken = pDivsDyp;
      let usdPerToken2 = (await window.getPrices("idefiyieldprotocol"))[
        "idefiyieldprotocol"
      ]["usd"];
      let dId = window.config.cg_ids[vault.tokenAddress.toLowerCase()];
      let usdPerDepositToken2 = (await window.getPrices(dId))[dId]["usd"];
      //console.log({usdPerToken, usdPerDepositToken})
      setusdPerToken(usdPerToken2);
      setusdPerDepositToken(usdPerDepositToken2);

      if (!depositAmount) {
        let usdValueOfPendingDivsInToken =
          (usdPerDepositToken2 * pendingRewardsInToken) / 10 ** TOKEN_DECIMALS;
        let dypAmount = usdValueOfPendingDivsInToken / usdPerToken2;
        //console.log({ usdValueOfPendingDivsInToken, dypAmount })
        setRedepositAmount(dypAmount.toFixed(19));
      }
    }
  };

  const fetchTvl = async () => {
    const pools = await axios.get(
      "https://api.dyp.finance/api/get_vault_info"
    );

    if (vault) {
      const vaultobj = pools.data.VaultTVLs.filter((obj) => {
        return obj.contract_address === vault._address;
      });
      if (vaultobj) {
        settvl_usd(vaultobj[0].tvl);
      }
    }
  };

  useEffect(() => {
    if (coinbase !== coinbase2 && coinbase !== null && coinbase !== undefined) {
      setcoinbase(coinbase);
    }
    getTokenPrice();
    fetchTvl();
    // fetch(
    //   "https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=0cb24df6d59351fdfb85e84c264c1d89dada314bbd85bbb5bea318f7f995"
    // )
    //   .then((res) => res.json())
    //   .then((data) => setgasPrice(data.fast / 10))
    //   .catch(console.error);
  }, [coinbase, coinbase2, vault_contract, vault]);

  useEffect(() => {
    refreshBalance();
  }, [coinbase, coinbase2, vault_contract]);

  useEffect(() => {
    if (vault) {
      initContract();
    }
  }, [vault]);

  const handleApprove = async (e) => {
    // e.preventDefault();
    setdepositLoading(true);

    let amount = depositAmount;
    amount = new BigNumber(amount).times(10 ** UNDERLYING_DECIMALS).toFixed(0);
    await token
      .approve(vault._address, amount)
      .then(() => {
        setdepositLoading(false);
        setdepositStatus("deposit");
      })
      .catch((e) => {
        setdepositLoading(false);
        setdepositStatus("fail");
        seterrorMsg(e?.message);
        setTimeout(() => {
          setdepositAmount("");
          setdepositStatus("initial");
          seterrorMsg("");
        }, 8000);
      });
  };

  const handleWithdraw = async (e) => {
    // e.preventDefault();
    setwithdrawLoading(true);

    let amount = withdrawAmount;
    amount = new BigNumber(amount).times(10 ** UNDERLYING_DECIMALS).toFixed(0);
    let value = await getMinEthFeeInWei();

    let FEE_PERCENT_X_100 = await vault.FEE_PERCENT_X_100();
    let FEE_PERCENT_TO_BUYBACK_X_100 =
      await vault.FEE_PERCENT_TO_BUYBACK_X_100();
    let buyBackFeeAmountEth = new BigNumber(value)
      .times(FEE_PERCENT_TO_BUYBACK_X_100)
      .div(100e2)
      .toFixed(0);
    let feeAmountToken = new BigNumber(amount)
      .times(FEE_PERCENT_X_100)
      .div(100e2)
      .toFixed(0);
    let buyBackFeeAmountToken = new BigNumber(feeAmountToken)
      .times(FEE_PERCENT_TO_BUYBACK_X_100)
      .div(100e2)
      .toFixed(0);

    let deadline = Math.floor(
      Date.now() / 1e3 + window.config.tx_max_wait_seconds
    );
    let router = await window.getUniswapRouterContract();

    let WETH = await router.methods.WETH().call();
    let platformTokenAddress = window.config.reward_token_idyp_address;

    let path = [WETH, platformTokenAddress];

    let _amountOutMin_ethFeeBuyBack = await router.methods
      .getAmountsOut(buyBackFeeAmountEth, path)
      .call()
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
    _amountOutMin_ethFeeBuyBack =
      _amountOutMin_ethFeeBuyBack[_amountOutMin_ethFeeBuyBack.length - 1];
    _amountOutMin_ethFeeBuyBack = new BigNumber(_amountOutMin_ethFeeBuyBack)
      .times(100 - window.config.slippage_tolerance_percent)
      .div(100)
      .toFixed(0);

    let tokenFeePath = [
      ...new Set(
        [token._address, WETH, platformTokenAddress].map((a) => a.toLowerCase())
      ),
    ];

    let _amountOutMin_tokenFeeBuyBack = await router.methods
      .getAmountsOut(buyBackFeeAmountToken, tokenFeePath)
      .call()
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
    _amountOutMin_tokenFeeBuyBack =
      _amountOutMin_tokenFeeBuyBack[_amountOutMin_tokenFeeBuyBack.length - 1];
    _amountOutMin_tokenFeeBuyBack = new BigNumber(_amountOutMin_tokenFeeBuyBack)
      .times(100 - window.config.slippage_tolerance_percent)
      .div(100)
      .toFixed(0);

    //console.log({ _amountOutMin_ethFeeBuyBack, _amountOutMin_tokenFeeBuyBack, deadline, value })

    vault
      .withdraw(
        [
          amount,
          _amountOutMin_ethFeeBuyBack,
          _amountOutMin_tokenFeeBuyBack,
          deadline,
        ],
        value
      )
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

  const handleStake = async (e) => {
    let amount = depositAmount;
    amount = new BigNumber(amount).times(10 ** UNDERLYING_DECIMALS).toFixed(0);
    let value = await getMinEthFeeInWei();
    setdepositLoading(true);

    let FEE_PERCENT_TO_BUYBACK_X_100 =
      await vault.FEE_PERCENT_TO_BUYBACK_X_100();
    let feeAmountEth = new BigNumber(value)
      .times(FEE_PERCENT_TO_BUYBACK_X_100)
      .div(100e2)
      .toFixed(0);

    let deadline = Math.floor(
      Date.now() / 1e3 + window.config.tx_max_wait_seconds
    );
    let router = await window.getUniswapRouterContract();

    let WETH = await router.methods.WETH().call();
    let platformTokenAddress = window.config.reward_token_idyp_address;

    let path = [WETH, platformTokenAddress];

    let _amountOutMin_ethFeeBuyBack = await router.methods
      .getAmountsOut(feeAmountEth, path)
      .call()
      .catch((e) => {
        setdepositLoading(false);
        setdepositStatus("fail");
        seterrorMsg(e?.message);
        setTimeout(() => {
          setdepositAmount("");
          setdepositStatus("initial");
          seterrorMsg("");
        }, 10000);
      });
    _amountOutMin_ethFeeBuyBack =
      _amountOutMin_ethFeeBuyBack[_amountOutMin_ethFeeBuyBack.length - 1];
    _amountOutMin_ethFeeBuyBack = new BigNumber(_amountOutMin_ethFeeBuyBack)
      .times(100 - window.config.slippage_tolerance_percent)
      .div(100)
      .toFixed(0);

    //console.log({ _amountOutMin_ethFeeBuyBack, deadline, value })
    vault
      .deposit([amount, _amountOutMin_ethFeeBuyBack, deadline], value)
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
          setdepositAmount("");
          setdepositStatus("initial");
          seterrorMsg("");
        }, 10000);
      });
  };

  const getMinEthFeeInWei = async () => {
    let minEthFeeInWei = Number(await vault.MIN_ETH_FEE_IN_WEI());
    let calculatedFee = 0;
    if (gasPrice) {
      calculatedFee = 4_000 * 1 * 10 ** 9;
    }
    return Math.max(minEthFeeInWei, calculatedFee);
  };

  const handleClaimDivs = async (e) => {
    // e.preventDefault();
    setclaimLoading(true);

    let router = await window.getUniswapRouterContract();
    let _amountOutMin_platformTokens = [0];
    let depositTokenAddress = token._address;

    let platformToken = window.config.reward_token_idyp_address;

    let WETH = await router.methods.WETH().call();

    let path = [
      ...new Set(
        [depositTokenAddress, WETH, platformToken].map((a) => a.toLowerCase())
      ),
    ];

    //console.log({ path })
    // const pendingDivsDyp2 = new BigNumber(pendingDivsDyp).div(10 ** TOKEN_DECIMALS).toString(10)
    // console.log(pendingDivsDyp)
    try {
      if (Number(pendingDivsDyp_noFormatted)) {
        //alert(this.state.pendingDivsDyp)
        _amountOutMin_platformTokens = await router.methods
          .getAmountsOut(pendingDivsDyp_noFormatted, path)
          .call()
          .catch((e) => {
            setclaimStatus("failed");
            setclaimLoading(false);
            seterrorMsg2(e?.message);
            console.log(e);

            setTimeout(() => {
              setclaimStatus("initial");
              seterrorMsg2("");
            }, 2000);
          });
      }
    } catch (e) {
      seterrorMsg2(e?.message);
      console.log(e);
      // console.warn(e);
    }

    //_amountOutMin_platformTokens = await router.methods.getAmountsOut(this.state.pendingDivsDyp, path).call()

    _amountOutMin_platformTokens =
      _amountOutMin_platformTokens[_amountOutMin_platformTokens.length - 1];
    _amountOutMin_platformTokens = new BigNumber(_amountOutMin_platformTokens)
      .times(100 - window.config.slippage_tolerance_percent)
      .div(100)
      .toFixed(0);

    //console.log({ _amountOutMin_platformTokens })
    //alert("reached here!")
    vault
      .claim([_amountOutMin_platformTokens])
      .then(() => {
        setclaimStatus("success");
        setclaimLoading(false);
        refreshBalance();
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

  const handleSetMaxDeposit = async (e) => {
    let token_balance2 = await token.balanceOf(coinbase);

    const balance_formatted = new BigNumber(token_balance2)
      .div(10 ** TOKEN_DECIMALS)
      .toString(10)

    if (balance_formatted > 0) {
      setdepositAmount(balance_formatted);
    } else setdepositAmount('0');
  };
  const rhandleSetMaxDeposit = (e) => {
    // e.preventDefault();

    let rdepositAmount = new BigNumber(platform_token_balance)
      .div(1e18)
      .toFixed(18);
    setRedepositAmount(rdepositAmount);
  };
  const handleSetMaxWithdraw = (e) => {
    // e.preventDefault();

    const withdrawAmount2 = new BigNumber(depositedTokens)
      .div(10 ** UNDERLYING_DECIMALS)
      .toFixed(UNDERLYING_DECIMALS);
    setwithdrawAmount(withdrawAmount2);
  };

  const checkApproval = async (amount) => {
    const result = await window
      .checkapproveStakePool(coinbase, token._address, vault._address)
      .then((data) => {
        console.log(data);
        return data;
      });

    let result_formatted = new BigNumber(result)
      .div(10 ** UNDERLYING_DECIMALS)
      .toFixed(UNDERLYING_DECIMALS);
console.log(Number(result_formatted),Number(amount))
    if (
      Number(result_formatted) >= Number(amount) &&
      Number(result_formatted) !== 0
    ) {
      setdepositStatus("deposit");
    } else {
      setdepositStatus("initial");
    }
  };

  const getAPY = () => {
    return apr;
  };

  const getUsdPerETH = () => {
    return the_graph_result.usd_per_eth || 0;
  };

  const getApproxReturn = () => {
    let APY = apy_percent;
    return ((approxDeposit * APY) / 100 / 365) * approxDays;
  };

  const handleEthPool = async () => {
    await handleSwitchNetworkhook("0x1")
      .then(() => {
        handleSwitchNetwork("1");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  let APY_TOTAL = apy_percent + platformTokenApyPercent;
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

  let id = Math.random().toString(36);
  let cliffTimeInWords = "lockup period";

  let canWithdraw = true;
  if (!isNaN(cliffTime) && !isNaN(stakingTime)) {
    if (Date.now() - stakingTime <= cliffTime) {
      canWithdraw = false;
      cliffTimeInWords = moment
        .duration(cliffTime - (Date.now() - stakingTime))
        .humanize(true);
    }
  }

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
                  style={{ top: "-1px" }}
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
                      0.3%
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
                      {getFormattedNumber(APY_TOTAL, 2)}%
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
                      {lockTime}
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
                    onClick={() => setshowCalculator(true)}
                  >
                    <img src={poolsCalculatorIcon} alt="" />
                    Calculator
                  </h6>
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
        <div className="pools-details-wrapper justify-content-center  d-flex m-0 container-lg border-0">
          <div className="row w-100 flex-column flex-lg-row gap-4 gap-lg-0 justify-content-between">
            <div className="firstblockwrapper col-12 col-md-6 col-lg-2">
              <div
                className="d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between gap-4"
                style={{ height: "100%" }}
              >
                <h6 className="start-title">Start Vault</h6>
                {/* <h6 className="start-desc">
            {this.props.coinbase === null
              ? "Connect wallet to view and interact with deposits and withdraws"
              : "Interact with deposits and withdraws"}
          </h6> */}
                {coinbase === null ||
                coinbase === undefined ||
                isConnected === false ? (
                  <button className="connectbtn btn" onClick={showModal}>
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
                      handleEthPool();
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
                (chainId !== "1" || expired === true) && "blurrypool"
              }`}
            >
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-2">
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
                        ? getFormattedNumber(token_balance, 6)
                        : getFormattedNumber(0, 6)}{" "}
                      {token_symbol}
                    </b>
                    {/* <img
              src={require(`./assets/dyp.svg`).default}
              alt=""
              style={{ width: 14, height: 14 }}
            /> */}
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
                        {"Deposit your assets to the vault smart contract."}
                      </div>
                    }
                  >
                    <img src={moreinfo} alt="" onClick={depositOpen} />
                  </Tooltip>
                </ClickAwayListener>
              </div>
              <div className="d-flex flex-column gap-2 justify-content-between">
                <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center justify-content-between justify-content-lg-center w-100 gap-2">
                    <div className="input-container px-0">
                      <input
                        type="number"
                        autoComplete="off"
                        value={
                          Number(depositAmount) > 0
                            ? depositAmount.slice(0, depositAmount.indexOf('.')+7)
                            : depositAmount.slice(0, depositAmount.indexOf('.')+7)
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
                <h6 className="withdraw-littletxt d-flex align-items-center gap-1">
                  You have 4 differents reward categories
                  <ClickAwayListener onClickAway={rewardsClose}>
                    <Tooltip
                      open={rewardsTooltip}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      placement="top"
                      title={
                        <div className="tooltip-text">
                          <h6 className="tvl-text mb-3">
                            Rewards earned by your deposit to the vault smart
                            contract are displayed in real-time. Rewards
                            breakdown:
                          </h6>
                          <h6 className="tvl-text">
                            {token_symbol} worth iDYP{" "}
                            <h6 className="tvl-amount" style={{ fontSize: 12 }}>
                              {" "}
                              {pendingDivsDyp}
                            </h6>
                          </h6>
                          <h6 className="tvl-text">
                            ETH
                            <h6 className="tvl-amount" style={{ fontSize: 12 }}>
                              {pendingDivsEth}
                            </h6>
                          </h6>
                          <h6 className="tvl-text">
                            {token_symbol} (Compound){" "}
                            <h6 className="tvl-amount" style={{ fontSize: 12 }}>
                              {pendingDivsComp}
                            </h6>
                          </h6>
                          <h6 className="tvl-text">
                            {token_symbol}{" "}
                            <h6 className="tvl-amount" style={{ fontSize: 12 }}>
                              {pendingDivsToken}
                            </h6>
                          </h6>
                          {/* <h6 className="tvl-text">
                    Earn Rewards in:{" "}
                    <h6 className="tvl-amount" style={{ fontSize: 12 }}>
                      {pendingDivsToken} {token_symbol}
                    </h6>
                  </h6> */}
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
                <div className="form-row d-flex flex-column flex-lg-row gap-2 align-items-start align-items-lg-center justify-content-between">
                  <div className="position-relative">
                    <span>
                      {getFormattedNumber(pendingDivsEth, 6)} {token_symbol}
                    </span>
                  </div>
                  <button
                    disabled={
                      claimStatus === "claimed" ||
                      claimStatus === "success" ||
                      pendingDivsEth <= 0
                        ? true
                        : false
                    }
                    className={`btn filledbtn ${
                      claimStatus === "claimed" || pendingDivsEth <= 0
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
                    {claimLoading && claimStatus === "initial" ? (
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
                </div>
              </div>
              {errorMsg2 && <h6 className="errormsg">{errorMsg2}</h6>}
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
                          "Withdraw your deposited assets from the vault smart contract."
                        }
                      </div>
                    }
                  >
                    <img src={moreinfo} alt="" onClick={withdrawOpen} />
                  </Tooltip>
                </ClickAwayListener>
              </h6>

              <button
                // disabled={depositStatus === "success" ? false : true}
                className={
                  // depositStatus === "success" ?
                  "outline-btn btn"
                  // :
                  //  "btn disabled-btn"
                }
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
            setpopup(false);
          }}
          width="fit-content"
        >
          <div className="earn-hero-content p4token-wrapper">
            <div className="l-box pl-3 pr-3">
              {/* <table className="table-stats table table-sm table-borderless mt-2">
              <tbody>
                <tr>
                  <td className="text-right">
                    <th>MY {token_symbol} Deposit</th>
                    <div>
                      <strong>{depositedTokens}</strong> <small>{token_symbol}</small>
                    </div>
                  </td>

                  <td className="text-right">
                    <th>Total Earned iDYP</th>
                    <div>
                      <strong style={{ fontSize: 9 }}>
                        {totalEarnedDyp}
                      </strong>{" "}
                      <small>iDYP</small>
                    </div>
                  </td>
                  <td className="text-right">
                    <th>Total Earned {token_symbol} (Fees) </th>
                    <div>
                      <strong>{totalEarnedToken}</strong>{" "}
                      <small>{token_symbol}</small>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="text-right">
                    <th>Total Earned {token_symbol} (Compound)</th>
                    <div>
                      <strong>{totalEarnedComp}</strong>{" "}
                      <small>{token_symbol}</small>
                    </div>
                  </td>
                  <td className="text-right">
                    <th>My Share</th>
                    <div>
                      <strong>
                        {getFormattedNumber(
                          !totalDepositedTokens
                            ? "..."
                            : (depositedTokens /
                                totalDepositedTokens) *
                                100,
                          2
                        )}
                      </strong>{" "}
                      <small>%</small>
                    </div>
                  </td>
                </tr>
                <tr></tr>
              </tbody>
            </table> */}
              <div className="stats-container my-4">
                <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                  <span className="stats-card-title">
                    MY {token_symbol} Deposit
                  </span>
                  <h6 className="stats-card-content">
                    {depositedTokens} {token_symbol}
                  </h6>
                </div>
                <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                  <span className="stats-card-title">Total Earned iDYP</span>
                  <h6 className="stats-card-content">{totalEarnedDyp} iDYP</h6>
                </div>
                <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                  <span className="stats-card-title">
                    Total Earned {token_symbol} (Fees)
                  </span>
                  <h6 className="stats-card-content">
                    {totalEarnedToken} {token_symbol}
                  </h6>
                </div>
                <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                  <span className="stats-card-title">
                    Total Earned {token_symbol} (Compound)
                  </span>
                  <h6 className="stats-card-content">
                    {totalEarnedComp} {token_symbol}
                  </h6>
                </div>
                <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                  <span className="stats-card-title">My share</span>
                  <h6 className="stats-card-content">
                    {getFormattedNumber(
                      !totaldepositedTokens
                        ? "..."
                        : (depositedTokens /
                            (totaldepositedTokens / 10 ** TOKEN_DECIMALS)) *
                            100,
                      2
                    )}
                    %
                  </h6>
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
                  href={`${window.config.etherscan_baseURL}/address/${coinbase}`}
                  className="stats-link"
                >
                  {shortAddress(coinbase)} <img src={statsLinkIcon} alt="" />
                </a>
              </div>
              <hr />
              <div className="container px-0">
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
                    <th>Total {token_symbol} Deposited</th>
                    <div>
                      <strong style={{ fontSize: 11 }}>
                        {getFormattedNumber(
                          totalDepositedTokens /
                            10 ** TOKEN_DECIMALS,
                          6
                        )}{" "}
                      </strong>{" "}
                      <small>{token_symbol}</small>
                    </div>
                  </td>

                  <td className="text-right">
                    <th>Contract Expiration</th>
                    <small>{expiration_time}</small>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      background: "transparent",
                      border: "none",
                      gap: 10,
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${window.config.etherscan_baseURL}/token/${token._address}?a=${coinbase}`}
                      className="maxbtn d-flex align-items-center"
                      style={{ height: "25px" }}
                    >
                      Etherscan
                      <img src={arrowup} alt="" />
                    </a>

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
                  </td>
                </tr>
              </tbody>
            </table> */}
                <div className="stats-container my-4">
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">TVL USD</span>
                    <h6 className="stats-card-content">
                      ${getFormattedNumber(tvl_usd, 6)} USD
                    </h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">
                      Total {token_symbol} deposited
                    </span>
                    <h6 className="stats-card-content">
                      {getFormattedNumber(
                        totaldepositedTokens / 10 ** TOKEN_DECIMALS,
                        6
                      )}{" "}
                      {token_symbol}
                    </h6>
                  </div>
                  <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                    <span className="stats-card-title">
                      Contract expiration
                    </span>
                    <h6 className="stats-card-content">{expiration_time}</h6>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-end gap-4">
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
                    href={`${window.config.etherscan_baseURL}/token/${token._address}?a=${coinbase}`}
                    className="stats-link"
                  >
                    View transaction <img src={statsLinkIcon} alt="" />
                  </a>
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
                  <div className="d-flex  gap-2 justify-content-between align-items-center">
                    <div className="d-flex flex-column gap-1">
                      <h6 className="withsubtitle mt-3">Timer</h6>
                      <h6 className="withtitle" style={{ fontWeight: 300 }}>
                        {lockTime === "No Lock" ? "No Lock" : lockTime}
                      </h6>
                    </div>
                  </div>
                  <div className="separator"></div>
                  <div className="d-flex  gap-2 justify-content-between align-items-center mb-4">
                    <div className="d-flex flex-column gap-1">
                      <h6 className="withsubtitle">Balance</h6>
                      <h6 className="withtitle">
                        {getFormattedNumber(depositedTokens, 6)} {token_symbol}
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
                        withdrawAmount === ""
                          ? true
                          : false
                      }
                      className={` w-100 btn filledbtn ${
                        withdrawStatus === "failed"
                          ? "fail-button"
                          : withdrawStatus === "success"
                          ? "success-button"
                          : withdrawAmount === ""
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
          handleConnection={() => {
            handleConnection();
            setshow(false);
          }}
        />
      )}
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
                {" "}
                ${getFormattedNumber(getApproxReturn() / getUsdPerETH(), 6)} USD
              </h3>
              <h6
                style={{
                  fontWeight: "300",
                  fontSize: "15px",
                  color: "#f7f7fc",
                }}
              >
                Approx {getFormattedNumber(getApproxReturn(), 2)}
                {token_symbol}
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
  //     <div
  //       className="col-12"
  //       style={{
  //         background: "url(img/banner/dyp_farming_vault-09.svg)",
  //         backgroundSize: "cover",
  //         resize: "both",
  //       }}
  //     >
  //       <div className="container">
  //         <Modal show={popup} handleClose={this.hidePopup}>
  //           <div className="earn-hero-content p4token-wrapper">
  //             <p className="h3">
  //               <b>DYP Vault</b>
  //             </p>
  //             <p>
  //               The DYP Vault is an automated smart contract with Compound
  //               Protocol integration and support for ETH, WBTC, USDC,
  //               USDT, and DAI markets. The rewards from Compound Protocol
  //               are entirely distributed to the users; from the other
  //               strategies, a substantial proportion of the rewards (75%)
  //               is converted to ETH and distributed to the users, whereas
  //               the remainder (25%) is used to buy back our protocol token
  //               and burn it.
  //             </p>
  //           </div>
  //         </Modal>
  //         <Modal
  //           show={show}
  //           handleConnection={this.props.handleConnection}
  //           handleConnectionWalletConnect={
  //             this.props.handleConnectionWalletConnect
  //           }
  //           handleClose={this.hideModal}
  //         />
  //         <div className="row">
  //           <div className="col-12" style={{ marginBottom: "30px" }}>
  //             <p
  //               style={{
  //                 width: "100%",
  //                 height: "auto",
  //                 fontFamily: "Mulish",
  //                 fontStyle: "normal",
  //                 fontWeight: "900",
  //                 fontSize: "42px",
  //                 lineHeight: "55px",
  //                 color: "#FFFFFF",
  //                 marginTop: "35px",
  //                 maxHeight: "55px",
  //               }}
  //             >
  //               DYP Vault
  //             </p>
  //           </div>
  //           <div
  //             className="col-12 col-sm-6"
  //             style={{ marginBottom: "27px" }}
  //           >
  //             <div className="row">
  //               <div
  //                 style={{ paddingRight: "15px" }}
  //                 className="col-6 col-sm-12 col-md-9 col-lg-6"
  //               >
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

  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="container">
  //       <div className="token-staking mt-5">
  //         <div className="row">
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
  //                           className="col-5 col-sm-4 col-md-3 mb-3 mb-md-0"
  //                           style={{ marginTop: "0px", paddingLeft: "" }}
  //                         >
  //                           <img
  //                             src="img/icon/eth.svg"
  //                             style={{
  //                               marginRight: "10px",
  //                               marginTop: "5px",
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
  //                             Ethereum
  //                           </label>
  //                         </div>
  //                         <div className="col-7 col-sm-6 col-md-5 mb-3 mb-md-0">
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
  //                                 {getFormattedNumber(APY_TOTAL, 2)}%{" "}
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
  //                             disabled={!is_connected}
  //                             className="form-control left-radius"
  //                             placeholder="0"
  //                             type="text"
  //                           />
  //                           <div className="input-group-append">
  //                             <button
  //                               className="btn  btn-primary right-radius btn-max l-light-btn"
  //                               disabled={!is_connected}
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
  //                             onClick={this.handleApprove}
  //                             className="btn  btn-block btn-primary "
  //                             disabled={!is_connected}
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
  //                             onClick={this.handleStake}
  //                             disabled={!is_connected}
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

  //                         Please approve before deposit.
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
  //                         1. Before you deposit your funds, please make
  //                         sure that you double-check the contract
  //                         expiration date. At the end of a contract, you
  //                         can withdraw your funds only after the
  //                         expiration of your lock time. Consider a
  //                         scenario wherein you deposit funds to a contract
  //                         that expires in 30 days, but you lock the funds
  //                         for 90 days; you will then be able to withdraw
  //                         the funds 60 days after the expiration of the
  //                         contract. Furthermore, you will not receive any
  //                         rewards during this period.
  //                       </div>
  //                       <div
  //                         className="col-md-12 d-block mb-0 text-muted small"
  //                         style={{ fontSize: "15px" }}
  //                       >
  //                         2. New contracts with improved strategies will
  //                         be released after the current one expires.
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
  //                           disabled={!is_connected}
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
  //                           : `You recently deposited, you can withdraw ${cliffTimeInWords}`
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
  //                       0.3% fee for withdraw (75% distributed pro-rata
  //                       among active vault users, whereas the remainder
  //                       25% is used to buy back iDYP and burn it)
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
  //                               {pendingDivsDyp}
  //                             </span>{" "}
  //                             <small className="text-bold">
  //                               {token_symbol} worth iDYP
  //                             </small>
  //                           </p>
  //                         </div>
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
  //                               {pendingDivsEth}
  //                             </span>{" "}
  //                             <small className="text-bold">ETH</small>
  //                           </p>
  //                         </div>
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
  //                               {pendingDivsComp}
  //                             </span>{" "}
  //                             <small className="text-bold">
  //                               {token_symbol} (Compound)
  //                             </small>
  //                           </p>
  //                         </div>
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
  //                               {pendingDivsToken}
  //                             </span>{" "}
  //                             <small className="text-bold">
  //                               {token_symbol}
  //                             </small>
  //                           </p>
  //                         </div>
  //                       </div>
  //                     </div>
  //                     <div className="form-row">
  //                       <div className="col-md-12 mb-2">
  //                         <button
  //                           className="btn  btn-primary btn-block l-outline-btn"
  //                           disabled={!is_connected}
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
  //                             {token_symbol} to Deposit
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
  //                       {token_symbol} worth rewards.
  //                     </p>
  //                     <p
  //                       style={{ fontSize: ".8rem" }}
  //                       className="mt-1 text-center text-muted mt-3"
  //                     >
  //                       Approx. Value Not Considering Fees or unstable
  //                       APR.
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
  //                       <th>Contract Address</th>
  //                       <td className="text-right">
  //                        <Address
  //                           style={{ fontFamily: "monospace" }}
  //                           a={vault._address}
  //                         />
  //                       </td>
  //                     </tr>

  //                     <tr>
  //                       <th>Contract Expiration</th>
  //                       <td className="text-right">
  //                         <strong>{expiration_time}</strong>
  //                       </td>
  //                     </tr>

  //                     <tr>
  //                       <th>My {token_symbol} Balance</th>
  //                       <td className="text-right">
  //                         <strong>{token_balance}</strong>{" "}
  //                         <small>{token_symbol}</small>
  //                       </td>
  //                     </tr>

  //                     <tr>
  //                       <th>My iDYP Balance</th>
  //                       <td className="text-right">
  //                         <strong>
  //                           {getFormattedNumber(
  //                             this.state.platform_token_balance / 1e18,
  //                             6
  //                           )}
  //                         </strong>{" "}
  //                         <small>iDYP</small>
  //                       </td>
  //                     </tr>

  //                     <tr>
  //                       <th>MY {token_symbol} Deposit</th>
  //                       <td className="text-right">
  //                         <strong>{depositedTokens}</strong>{" "}
  //                         <small>{token_symbol}</small>
  //                       </td>
  //                     </tr>

  //                     <tr>
  //                       <th>Total {token_symbol} Deposited</th>
  //                       <td className="text-right">
  //                         <strong>
  //                           {getFormattedNumber(
  //                             this.state.totalDepositedTokens /
  //                               10 ** TOKEN_DECIMALS,
  //                             6
  //                           )}
  //                         </strong>{" "}
  //                         <small>{token_symbol}</small>
  //                       </td>
  //                     </tr>
  //                     <tr>
  //                       <th>MY Share</th>
  //                       <td className="text-right">
  //                         <strong>
  //                           {getFormattedNumber(
  //                             !this.state.totalDepositedTokens
  //                               ? "..."
  //                               : (this.state.depositedTokens /
  //                                   this.state.totalDepositedTokens) *
  //                                   100,
  //                             2
  //                           )}
  //                         </strong>{" "}
  //                         <small>%</small>
  //                       </td>
  //                     </tr>

  //                     <tr>
  //                       <th>Total Earned iDYP</th>
  //                       <td className="text-right">
  //                         <strong>{totalEarnedDyp}</strong>{" "}
  //                         <small>iDYP</small>
  //                       </td>
  //                     </tr>
  //                     <tr>
  //                       <th>Total Earned {token_symbol} (Compound)</th>
  //                       <td className="text-right">
  //                         <strong>{totalEarnedComp}</strong>{" "}
  //                         <small>{token_symbol}</small>
  //                       </td>
  //                     </tr>
  //                     <tr>
  //                       <th>Total Earned {token_symbol} (Fees)</th>
  //                       <td className="text-right">
  //                         <strong>{totalEarnedToken}</strong>{" "}
  //                         <small>{token_symbol}</small>
  //                       </td>
  //                     </tr>
  //                     <tr>
  //                       <th>Total Earned ETH</th>
  //                       <td className="text-right">
  //                         <strong>{totalEarnedEth}</strong>{" "}
  //                         <small>ETH</small>
  //                       </td>
  //                     </tr>

  //                     <tr>
  //                       <th>TVL USD</th>
  //                       <td className="text-right">
  //                         <strong>${tvl_usd}</strong> <small>USD</small>
  //                       </td>
  //                     </tr>
  //                     <tr>
  //                       <th>APR</th>
  //                       <td className="text-right">
  //                         <strong>
  //                           {getFormattedNumber(APY_TOTAL, 2)}
  //                         </strong>{" "}
  //                         <small>%</small>
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
  //                             href={`${window.config.etherscan_baseURL}/token/${token._address}?a=${coinbase}`}
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

export default Vault;
