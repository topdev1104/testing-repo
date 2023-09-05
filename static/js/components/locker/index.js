import React from "react";
import getFormattedNumber from "../../functions/get-formatted-number";
import DatePicker from "react-datepicker";
import { NavLink } from "react-router-dom";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import InfoModal from "./InfoModal";
import Badge from "../../assets/badge.svg";
import BadgeSmall from "../../assets/badge-small.svg";
import VerifiedLock from "./verifiedlock.svg";
import LiqLocked from "./lock-liquidity.jpeg";
import Active from "../../assets/active.svg";
import InActive from "../../assets/inactive.svg";
import BadgeYellow from "../../assets/badge-yellow.svg";
import BadgeGray from "../../assets/badge-gray.svg";
import BadgeGrayLight from "../../assets/badge-gray-light.svg";
import CountDownTimer from "./Countdown";
import Skeleton from "./Skeleton";
import Error from "../../assets/error.svg";
import "./newlocker.css";
import liquidityIcon from "./assets/liquidityIcon.svg";
import securityIcon from "./assets/securityIcon.svg";
import greySecurityIcon from "./assets/greySecurityIcon.svg";
import moreInfo from "../FARMINNG/assets/more-info.svg";
import ethStakeActive from "../../assets/earnAssets/ethStakeActive.svg";
import bnbStakeActive from "../../assets/earnAssets/bnbStakeActive.svg";
import avaxStakeActive from "../../assets/earnAssets/avaxStakeActive.svg";
import lockerCalendarIcon from "./assets/lockerCalendarIcon.svg";
import coinStackIcon from "../launchpad/assets/coinStackIcon.svg";
import purpleLiquidityLocker from "./assets/purpleLiquidityLocker.svg";
import PairLockerCard from "./PairLockerCard";

export default class Locker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unlockDate: new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000),
      todaysDateTimeStamp: new Date().getTime(),
      amount: 0,
      selectedBaseToken: "",
      selectedBaseTokenTicker: "Token",
      loadspinner: "initial",
      loadspinnerLock: "initial",

      pair_address: this.props.match.params.pair_id || "",
      lpBalance: "",
      unlockDatebtn: "1",
      lockActive: false,
      sliderValue: 25,
      showModal: false,
      maxLpID: 0,
      status: "",
      percentageLocked: 0,
      placeholderState: true,

      recipientLocksLength: 0,
      recipientLocks: [],
      tokenLocksLength: 0,
      tokenLocks: [],

      coinbase: "",
      isLoadingMoreMyLocks: false,
      isLoadingMoreTokenLocks: false,

      totalLpLocked: "",
      baseTokens: [],
      usdValueOfLP: undefined,
      lpTotalSupply: "",

      // iframe
      textToCopy: "",
      loadComponent: false,
      networkId: "1",
    };
  }

  checkNetworkId = async () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_chainId" })
        .then((data) => {
          this.getAllData(data);
          if (data === "0x1") {
            this.setState({
              networkId: "1",
            });
          } else if (data === "0xa86a") {
            this.setState({
              networkId: "43114",
            });
          } else if (data === "0x38") {
            this.setState({
              networkId: "56",
            });
          } else if (data !== "undefined") {
            this.setState({
              networkId: "0",
            });
          } else {
            this.setState({
              networkId: "1",
            });
          }

          this.refreshMyLocks().then();
          this.loadPairInfo().then();
          let pair_id = this.props.match.params.pair_id;

          // if (window.isConnectedOneTime) {
          //   this.onComponentMount();
          // } else {
          //   window.addOneTimeWalletConnectionListener(this.onComponentMount);
          // }
        })
        .catch(console.error);
    } else {
      // if (window.isConnectedOneTime) {
      //   this.onComponentMount();
      // } else {
      //   window.addOneTimeWalletConnectionListener(this.onComponentMount);
      // }
      this.setState({
        networkId: "1",
      });
    }
  };

  checkTotalLpLocked = async () => {
    let baseTokens =
      this.state.networkId === "1"
        ? await window.getBaseTokensETH()
        : await window.getBaseTokens();

    let pair_id = this.props.match.params.pair_id;
    let totalLpLocked =
      this.state.networkId === "1"
        ? await window.getLockedAmountETH(pair_id)
        : await window.getLockedAmount(pair_id);
    this.refreshUsdValueOfLP(pair_id, totalLpLocked, baseTokens);
    this.setState({ totalLpLocked });
  };

  async checkConnection() {
    const logout = localStorage.getItem("logout");

    if (logout !== "true") {
      window.getCoinbase().then((data) => {
        this.setState({
          coinbase: data,
        });
      });
    } else {
      this.setState({
        coinbase: undefined,
      });
    }
  }

  getAllData = async (data) => {
    let pair_id;
    if (this.props.match.params.pair_id) {
      pair_id = this.props.match.pair_id;
    } else if (!this.props.match.params.pair_id && data === "0x1") {
      pair_id = "0x76911e11fddb742d75b83c9e1f611f48f19234e4";
    } else if (!this.props.match.params.pair_id && data === "0xa86a") {
      pair_id = "0x497070e8b6c55fd283d8b259a6971261e2021c01";
    }
    let baseTokens =
      data === "0x1"
        ? await window.getBaseTokensETH()
        : await window.getBaseTokens();

    this.setState({ baseTokens });
    let isAddress = await window.isAddress(pair_id); 
    if (isAddress) {
      this.refreshTokenLocks(pair_id);
      // this.handlePairChange(null, pair_id);
      let totalLpLocked =
        data === "0x1"
          ? await window.getLockedAmountETH(pair_id)
          : await window.getLockedAmount(pair_id);
      this.refreshUsdValueOfLP(pair_id, totalLpLocked, baseTokens);
      this.setState({ totalLpLocked });
    }
  };

  componentDidMount() {
    // window.scrollTo(0, 0);
    this.checkNetworkId().then();
    this.checkConnection().then();
  }

  componentWillUnmount() {
    window.removeOneTimeWalletConnectionListener(this.onComponentMount);
  }

  refreshMyLocks = async () => {
    if (this.state.isLoadingMoreMyLocks) return;
    this.setState({ isLoadingMoreMyLocks: true });
    try {
      let recipient;
      await window.getCoinbase().then((data) => {
        recipient = data;
      });

      let recipientLocksLength =
        this.state.networkId === "1"
          ? await window.getActiveLockIdsLengthByRecipientETH(recipient)
          : await window.getActiveLockIdsLengthByRecipient(recipient);

      recipientLocksLength = Number(recipientLocksLength);

      let step = window.config.MAX_LOCKS_TO_LOAD_PER_CALL;

      if (recipientLocksLength !== 0) {
        let startIndex = this.state.recipientLocks.length;
        let endIndex = Math.min(recipientLocksLength, startIndex + step);
        let recipientLocks =
          this.state.networkId === "1"
            ? await window.getActiveLocksByRecipientETH(
                recipient,
                startIndex,
                endIndex
              )
            : await window.getActiveLocksByRecipient(
                recipient,
                startIndex,
                endIndex
              );

        recipientLocks = this.state.recipientLocks.concat(recipientLocks);
        this.setState({ recipientLocksLength, recipientLocks });
      }
    } finally {
      this.setState({ isLoadingMoreMyLocks: false });
    }
  };

  onComponentMount = async () => {
    this.refreshMyLocks().then();

    this.checkNetworkId().then();
    this.checkConnection().then();

    // this.setState({ coinbase: await window.getCoinbase() });
    let pair_id;

    if (this.props.match.params.pair_id) {
      pair_id = this.props.match.pair_id;
    } else if (
      !this.props.match.params.pair_id &&
      this.state.networkId === "1"
    ) {
      pair_id = "0x76911e11fddb742d75b83c9e1f611f48f19234e4";
    } else if (
      !this.props.match.params.pair_id &&
      this.state.networkId === "43314"
    ) {
      pair_id = "0x497070e8b6c55fd283d8b259a6971261e2021c01";
    }

    let baseTokens =
      this.state.networkId === "1"
        ? await window.getBaseTokensETH()
        : await window.getBaseTokens();

    this.setState({ baseTokens });
    let isAddress = await window.isAddress(pair_id);
    if (isAddress) {
      this.refreshTokenLocks(pair_id);
      this.handlePairChange(null, pair_id);
      let totalLpLocked =
        this.state.networkId === "1"
          ? await window.getLockedAmountETH(pair_id)
          : await window.getLockedAmount(pair_id);
      this.refreshUsdValueOfLP(pair_id, totalLpLocked, baseTokens);
      this.setState({ totalLpLocked });
    }
  };

  refreshUsdValueOfLP = async (pair, amount, baseTokens) => {
    try {

      let totalSupply = await window.getTokenTotalSupply(pair);
      this.setState({ lpTotalSupply: totalSupply });

      let { token0, token1 } = await window.getPairTokensInfo(pair);
      let baseToken;
      if (baseTokens.includes(token0.address.toLowerCase())) {
        baseToken = token0;
      } else if (baseTokens.includes(token1.address.toLowerCase())) {
        baseToken = token1;
      }
      if(baseToken && baseToken.address)
     { let baseTokenBalance = await window.getTokenHolderBalance(
        baseToken.address,
        pair
      );
      let baseTokenInLp =
        (baseTokenBalance / 10 ** (baseToken.decimals * 1)) *
        (amount / totalSupply);
      let tokenCG = window.tokenCG[baseToken.address.toLowerCase()];
      if (!tokenCG) return;
      let usdPerBaseToken = Number(await window.getPrice(tokenCG));
      let usdValueOfLP = baseTokenInLp * usdPerBaseToken * 2;
      this.setState({ usdValueOfLP });}
    } catch (e) {
      console.error(e);
    }
  };

  refreshTokenLocks = async (token) => {
    if (this.state.isLoadingMoreTokenLocks) return;
    this.setState({ isLoadingMoreTokenLocks: true });
    try {
      let tokenLocksLength =
        this.state.networkId === "1"
          ? await window.getActiveLockIdsLengthByTokenETH(token)
          : await window.getActiveLockIdsLengthByToken(token);

      tokenLocksLength = Number(tokenLocksLength);
      let step = window.config.MAX_LOCKS_TO_LOAD_PER_CALL;
      if (tokenLocksLength !== 0) {
        let startIndex = this.state.tokenLocks.length;
        let endIndex = Math.min(tokenLocksLength, startIndex + step);
        let tokenLocks =
          this.state.networkId === "1"
            ? await window.getActiveLocksByTokenETH(token, startIndex, endIndex)
            : await window.getActiveLocksByToken(token, startIndex, endIndex);

        tokenLocks = this.state.tokenLocks.concat(tokenLocks);
        this.setState({ tokenLocksLength, tokenLocks });
      }
    } finally {
      this.setState({ isLoadingMoreTokenLocks: false });
      const maxAmount = Math.max.apply(
        Math,
        this.state.tokenLocks.map(function (o) {
          return o.amount;
        })
      );
      var objId = this.state.tokenLocks.find(function (o) {
        return o.amount == maxAmount;
      });
      this.setState({ maxLpID: objId?.id });
    }
  };

  handlePairChange = async (e, pair_address = null) => {
    let newPairAddress = pair_address || e;

    this.setState({ pair_address: newPairAddress }, () => {
      this.refreshTokenLocks(newPairAddress);
    });

    let totalLpLocked =
      this.state.networkId === "1"
        ? await window.getLockedAmountETH(newPairAddress)
        : await window.getLockedAmount(newPairAddress);
    this.setState({ totalLpLocked });

    let totalSupply = await window.getTokenTotalSupply(newPairAddress);
    this.setState({ lpTotalSupply: totalSupply });

    clearTimeout(this.pairChangeTimeout);
    this.pairChangeTimeout = setTimeout(this.loadPairInfo, 500);
  };

  loadPairInfo = async () => {
    let isConnected = this.state.coinbase !== undefined ? true : false;

    if (!isConnected) {
      this.setState({
        status: "Please connect your wallet!",
      });

      this.setState({ placeholderState: true });
      return;
    }
    let isAddress;

    isAddress = await window.isAddress(this.state.pair_address);

    if (!isAddress) {
      this.setState({
        status:
          this.state.pair_address === ""
            ? ""
            : "Pair address not valid. Please enter a valid address!",
      });
      return;
    }

    if (this.state.placeholderState === true && isAddress && isConnected) {
      this.setState({ placeholderState: false });
      // this.selectBaseToken();
      this.handlePairChange(this.state.pair_address);
    }

    if (this.state.placeholderState === false && isAddress && isConnected) {
      // this.selectBaseToken();
      this.handlePairChange(this.state.pair_address);
    }
  };

  selectBaseToken = async (addr) => {
    let pair = await window.getPairTokensInfo(addr);
    console.log(pair);
    this.setState({ pair });
    this.setState({ status: "" });

    if (pair) {
      let balance = await window.getTokenHolderBalance(
        addr,
        this.state.coinbase
      );

      this.setState({ amount: balance, lpBalance: balance });

      let token0 = pair["token0"]?.address;
      let token1 = pair["token1"]?.address;

      let baseTokens =
        this.state.networkId === "1"
          ? await window.getBaseTokensETH()
          : await window.getBaseTokens();
      console.log(baseTokens);
      if (baseTokens.includes(token0)) {
        this.setState({ selectedBaseToken: "0" });
        this.setState({ selectedBaseTokenTicker: pair["token0"].symbol });
      } else if (baseTokens.includes(token1)) {
        this.setState({ selectedBaseToken: "1" });
        this.setState({ selectedBaseTokenTicker: pair["token1"].symbol });
      } else if (
        pair["token0"].symbol === "USDT" ||
        pair["token1"].symbol === "USDT"
      ) {
        this.setState({ selectedBaseTokenTicker: "WETH" });
      } else {
        this.setState({ selectedBaseTokenTicker: "TOKEN" });
      }
    }
  };

  handleApprove = async (e) => {
    let selectedBaseTokenAddress = this.state.pair
      ? this.state.pair[
          this.state.selectedBaseToken == "0" ? "token0" : "token1"
        ].address
      : "";
    let baseTokens = window.ethereum
      ? window.ethereum.chainId === "0x1"
        ? await window.getBaseTokensETH()
        : await window.getBaseTokens()
      : await window.getBaseTokensETH();
    if (
      !baseTokens.includes(selectedBaseTokenAddress) &&
      this.state.amount != 0
    ) {
      console.log({ selectedBaseTokenAddress, baseTokens });
      this.setState({
        status: "Base token is not valid. Please enter your pair address!",
      });
      return;
    }

    if (this.state.amount == 0) {
      this.setState({
        status: "Not enough liquidity of base token!",
      });
      return;
    }

    if (
      baseTokens.includes(selectedBaseTokenAddress) &&
      this.state.amount == 0
    ) {
      this.setState({
        status: "Please select amount to lock!",
      });
      return;
    }

    this.setState({ loadspinner: "loading" });
    let amountWei = new window.BigNumber(this.state.amount);

    let tokenContract = await window.getContract({
      address: this.state.pair_address,
      ABI: window.ERC20_ABI,
    });
    await tokenContract.methods
      .approve(
        window.ethereum
          ? window.ethereum.chainId === "0x1"
            ? window.config.lockereth_address
            : window.config.locker_address
          : window.config.lockereth_address,
        amountWei.times(1e18).toFixed(0).toString()
      )
      .send()
      .then(() => {
        this.setState({ lockActive: true });
        this.setState({ loadspinner: "success" });
      })
      .catch((e) => {
        this.setState({ loadspinner: "failed" });
        this.setState({ lockActive: false });

        this.setState({ status: "An error occurred, please try again later" });
        console.error(e);
        setTimeout(() => {
          this.setState({ loadspinner: "initial" });
          this.setState({ status: "" });
        }, 2000);
      });
  };

  focusInput = (input) => {
    document.getElementById(input).focus();
  };

  handleLockSubmit = async (e) => {
    e.preventDefault();
    let selectedBaseTokenAddress = this.state.pair
      ? this.state.pair[
          this.state.selectedBaseToken == "0" ? "token0" : "token1"
        ].address
      : "";
    if (window.ethereum) {
      if (window.ethereum.chainId === "0x1") {
        let lockerContract = await window.getContract({ key: "LOCKERETH" });

        let estimatedValue = await window.getMinLockCreationFeeInWei(
          this.state.pair_address,
          selectedBaseTokenAddress,
          this.state.amount
        );
        estimatedValue = new window.BigNumber(estimatedValue)
          .times(1.1)
          .toFixed(0);
        this.setState({ loadspinnerLock: "loading" });

        await lockerContract.methods
          .createLock(
            this.state.pair_address,
            selectedBaseTokenAddress,
            this.state.amount,
            Math.floor(this.state.unlockDate.getTime() / 1e3)
          )
          .send({ value: estimatedValue, from: await window.getCoinbase() })
          .then(() => {
            this.setState({ loadspinnerLock: "success" });
            this.setState({ lockActive: false });
          })
          .catch((e) => {
            console.error(e);
            this.setState({ loadspinnerLock: "fail" });
            this.setState({ status: "An error occurred, please try again" });
            setTimeout(() => {
              this.setState({ loadspinnerLock: "initial" });
              this.setState({ status: "" });
            }, 2000);
          });
      }

      if (window.ethereum.chainId === "0xa86a") {
        let lockerContract = await window.getContract({ key: "LOCKER" });

        let estimatedValue = await window.getMinLockCreationFeeInWei(
          this.state.pair_address,
          selectedBaseTokenAddress,
          this.state.amount
        );
        estimatedValue = new window.BigNumber(estimatedValue)
          .times(1.1)
          .toFixed(0);
        this.setState({ loadspinnerLock: true });

        await lockerContract.methods
          .createLock(
            this.state.pair_address,
            selectedBaseTokenAddress,
            this.state.amount,
            Math.floor(this.state.unlockDate.getTime() / 1e3)
          )
          .send({ value: estimatedValue, from: await window.getCoinbase() })
          .then(() => {
            this.setState({ loadspinnerLock: false });
          })
          .catch((e) => {
            console.error(e);
            this.setState({ loadspinnerLock: false });
            this.setState({ status: "An error occurred, please try again" });
          });
      }
    } else {
      let lockerContract = await window.getContract({ key: "LOCKERETH" });

      let estimatedValue = await window.getMinLockCreationFeeInWei(
        this.state.pair_address,
        selectedBaseTokenAddress,
        this.state.amount
      );
      estimatedValue = new window.BigNumber(estimatedValue)
        .times(1.1)
        .toFixed(0);
      this.setState({ loadspinnerLock: true });

      await lockerContract.methods
        .createLock(
          this.state.pair_address,
          selectedBaseTokenAddress,
          this.state.amount,
          Math.floor(this.state.unlockDate.getTime() / 1e3)
        )
        .send({ value: estimatedValue, from: await window.getCoinbase() })
        .then(() => {
          this.setState({ loadspinnerLock: false });
          this.setState({ lockActive: false });
        })
        .catch((e) => {
          console.error(e);
          this.setState({ loadspinnerLock: false });
          this.setState({ status: "An error occurred, please try again" });
        });
    }
  };

  handleAmountPercentInput = (percent) => (e) => {
    e.preventDefault();
    let amount = new window.BigNumber(this.state.lpBalance);
    amount = amount.times(percent).div(100).toFixed(0);
    this.setState({ amount });
  };

  handleClaim = (id) => (e) => {
    e.preventDefault();
    if (window.ethereum) {
      if (window.ethereum.chainId === "0x1") {
        window.claimUnlockedETH(id);
      }
      if (window.ethereum.chainId === "0xa86a") {
        window.claimUnlocked(id);
      }
    } else window.claimUnlockedETH(id);
  };

  handleSearchPair = (e) => {
    if (e.key === "Enter") {
      this.selectBaseToken();
      e.preventDefault();
    }
  };

  handleCopyIFrame = () => {
    let iFrame = document.createElement("iframe");
    iFrame.setAttribute("id", "locker-iframe");
    // navigator.clipboard.writeText(this.state.textToCopy)
  };
  GetPairLockInfo = () => {
    return (
      <div className="mb-4">
        <span className="total-dyp-locked">
          Total{" "}
          {this.state.pair
            ? `${this.state.pair.token0.symbol}-${this.state.pair.token1.symbol}`
            : "LP"}{" "}
          locked:{" "}
          <span style={{ fontWeight: "bold" }}>
            {getFormattedNumber(this.state.totalLpLocked / 1e18, 18)} (
            {getFormattedNumber(
              (this.state.totalLpLocked / this.state.lpTotalSupply) * 100,
              2
            )}
            %)
          </span>
        </span>
        {typeof this.state.usdValueOfLP !== "undefined" && (
          <p>
            USD Value Locked:{" "}
            <span style={{ fontWeight: "bold" }}>
              ${getFormattedNumber(this.state.usdValueOfLP, 2)}
            </span>
          </p>
        )}
      </div>
    );
  };

  GetCreateLockForm = () => {
    const getPercentageLocked = () => {
      if (this.state.recipientLocksLength !== 0) {
        const amount =
          this.state.recipientLocks[this.state.recipientLocksLength - 1]
            .amount / 1e18;
        const percentage =
          (amount * 100) / (this.state.lpBalance / 1e18 + amount);

        return percentage.toFixed(0);
      }

      if (!this.props.match.params.pair_id) {
        const percentage = 25;
        return percentage;
      }
    };

    const convertTimestampToDate = (timestamp) => {
      const result = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(timestamp * 1000);
      return result;
    };

    if (this.state.placeholderState === true) {
      return (
        <div className="placeholderdiv">
          <strong style={{ fontSize: "18px" }} className="d-block mb-3">
            Create a lock
          </strong>
          <div>
            <form>
              <p className="text-muted lock-text-wrapper">
                DYP Locker is a solution that supports liquidity lock
                functionality to every new project. Liquidity is the first thing
                that users check for, therefore having it encrypted via DYP
                Locker will assure them on the project validity and security.
              </p>
              <div
                className="row m-0"
                style={{ gap: 20, alignItems: "center", paddingBottom: "1rem" }}
              >
                <div>
                  <img
                    src={LiqLocked}
                    alt=""
                    style={{ width: 80, height: 80, borderRadius: 6 }}
                  />
                </div>
                <div className="lock-text-wrapper">
                  <h6 className="lockertitle-text">
                    <b>Locking Liquidity</b>
                  </h6>
                  <p className="text-muted lockliqtext">
                    This makes the funds immovable until they are unlocked.
                    Every owner of the project can encrypt a portion of the
                    asset for a specific period of time and this liquidity
                    cannot be withdrawn until the time is over. This way users
                    will create a sense of security against projects. Liquidity
                    is locked using time-locked smart contracts and DYP Locker
                    offers this functionality with no additional costs.
                  </p>
                </div>
              </div>
              <div
                className="row m-0"
                style={{ gap: 20, alignItems: "center" }}
              >
                <div>
                  <img
                    src={VerifiedLock}
                    alt=""
                    style={{ width: 80, height: 80, borderRadius: 6 }}
                  />
                </div>
                <div className="lock-text-wrapper">
                  <h6 className="lockertitle-text">
                    <b>Verified Security</b>
                  </h6>
                  <p className="text-muted" style={{ width: "fit-content" }}>
                    Each project that locks liquidity on DYP Locker will be
                    given a verified security badge. Owners of the project can
                    share it to their communities in order to increase
                    credibility.
                  </p>
                </div>
              </div>
              <br />
              <div
                style={{ gap: 100, marginTop: 40, marginBottom: 40 }}
                className="row ml-0"
              >
                <div>
                  <div className="row m-0 align-items-end" style={{ gap: 40 }}>
                    <div>
                      <p className="mt-0">
                        <b>Enter Pair address</b>
                      </p>
                      <input
                        style={{ width: "266px", height: 46 }}
                        disabled={this.props.match.params.pair_id}
                        value={this.state.pair_address}
                        onChange={(e) => {
                          this.handlePairChange(e);
                          this.loadPairInfo();
                          this.selectBaseToken(e);
                        }}
                        className="form-control"
                        type="text"
                        placeholder="Pair Address"
                        onKeyDown={this.handleSearchPair}
                      />
                    </div>

                    <div className="form-group m-0">
                      <div
                        className="search-pair-btn"
                        onClick={this.handleSearchPair}
                      >
                        <p className="search-pair-text">Search</p>
                      </div>
                    </div>
                  </div>

                  {this.state.status !== "" && (
                    <div className="status-wrapper">
                      <p style={{ color: "#E30613" }}>
                        <img src={Error} alt="" /> {this.state.status}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    } else if (this.state.placeholderState === false) {
      return (
        <div>
          <strong style={{ fontSize: "18px" }} className="d-block mb-3">
            Create a lock
          </strong>
          <div>
            <form onSubmit={this.handleLockSubmit}>
              <p className="text-muted lock-text-wrapper">
                DYP Locker is a solution that supports liquidity lock
                functionality to every new project. Liquidity is the first thing
                that users check for, therefore having it encrypted via DYP
                Locker will assure them on the project validity and security.
              </p>
              <div
                className="row m-0"
                style={{ gap: 20, alignItems: "center", paddingBottom: "1rem" }}
              >
                <div>
                  <img
                    src={LiqLocked}
                    alt=""
                    style={{ width: 80, height: 80, borderRadius: 6 }}
                  />
                </div>
                <div className="lock-text-wrapper">
                  <h6 className="lockertitle-text">
                    <b>Locking Liquidity</b>
                  </h6>
                  <p className="text-muted lockliqtext">
                    This makes the funds immovable until they are unlocked.
                    Every owner of the project can encrypt a portion of the
                    asset for a specific period of time and this liquidity
                    cannot be withdrawn until the time is over. This way users
                    will create a sense of security against projects. Liquidity
                    is locked using time-locked smart contracts and DYP Locker
                    offers this functionality with no additional costs.
                  </p>
                </div>
              </div>
              <div
                className="row m-0"
                style={{ gap: 20, alignItems: "center" }}
              >
                <div>
                  <img
                    src={VerifiedLock}
                    alt=""
                    style={{ width: 80, height: 80, borderRadius: 6 }}
                  />
                </div>
                <div className="lock-text-wrapper">
                  <h6 className="lockertitle-text">
                    <b>Verified Security</b>
                  </h6>
                  <p className="text-muted" style={{ width: "fit-content" }}>
                    Each project that locks liquidity on DYP Locker will be
                    given a verified security badge. Owners of the project can
                    share it to their communities in order to increase
                    credibility.
                  </p>
                </div>
              </div>
              <br />
              <div
                style={{ gap: 100, marginTop: 40, marginBottom: 40 }}
                className="row ml-0"
              >
                <div>
                  <div className="row m-0 align-items-end" style={{ gap: 40 }}>
                    <div>
                      <p className="mt-0">
                        <b>Enter Pair Address</b>
                      </p>
                      <input
                        style={{ width: "266px", height: 46 }}
                        disabled={this.props.match.params.pair_id}
                        value={this.state.pair_address}
                        onChange={(e) => {
                          this.handlePairChange(e);
                          this.selectBaseToken(e);
                        }}
                        className="form-control"
                        type="text"
                        placeholder="Pair Address"
                        onKeyDown={this.handleSearchPair}
                      />
                    </div>

                    <div className="form-group m-0">
                      <div>
                        <p>Selected Base Token</p>
                        <div className="d-flex align-items-center base-wrapper">
                          <label style={{ color: "#E30613", margin: 0 }}>
                            {this.state.selectedBaseTokenTicker}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <br />
                  <div className="form-group">
                    <div
                      className="row m-0 align-items-end"
                      style={{ gap: 40 }}
                    >
                      <div>
                        <p>
                          <b>Amount to lock</b>
                        </p>
                        <input
                          disabled
                          style={{ width: "266px", height: 46 }}
                          onChange={(e) => {
                            let amount = new window.BigNumber(e.target.value);
                            amount = amount.times(1e18).toFixed(0);
                            this.setState({ amount });
                          }}
                          value={this.state.amount}
                          type="number"
                          placeholder="LP Token Amount"
                          className="form-control"
                          min={
                            getFormattedNumber(this.state.lpBalance / 1e18, 6) *
                            0.25
                          }
                        />
                      </div>

                      <div className="d-flex flex-column">
                        <span className="balance-placeholder">Balance:</span>
                        <span className="balance-text">
                          {getFormattedNumber(this.state.lpBalance / 1e18, 6)}
                        </span>
                      </div>
                    </div>
                    <br />
                  </div>
                  <p>
                    <b>Selected</b>
                  </p>
                  <br />
                  <div className="slider-text-wrapper">
                    <span
                      className="slider-text"
                      style={{
                        color:
                          this.state.sliderValue < 35 ? "#E30613" : "#A4A4A4",
                        fontSize: this.state.sliderValue < 35 ? 20 : 15,
                        fontWeight: this.state.sliderValue < 35 ? 700 : 500,
                        justifyContent: "start",
                      }}
                    >
                      25%
                    </span>
                    <span
                      className="slider-text"
                      style={{
                        color:
                          this.state.sliderValue > 35 &&
                          this.state.sliderValue < 65
                            ? "#E30613"
                            : "#A4A4A4",
                        fontSize:
                          this.state.sliderValue > 35 &&
                          this.state.sliderValue < 65
                            ? 20
                            : 15,
                        fontWeight:
                          this.state.sliderValue > 35 &&
                          this.state.sliderValue < 65
                            ? 700
                            : 500,
                        justifyContent: "center",
                        width: "18%",
                      }}
                    >
                      50%
                    </span>
                    <span
                      className="slider-text"
                      style={{
                        color:
                          this.state.sliderValue > 65 &&
                          this.state.sliderValue < 90
                            ? "#E30613"
                            : "#A4A4A4",
                        fontSize:
                          this.state.sliderValue > 65 &&
                          this.state.sliderValue < 90
                            ? 20
                            : 15,
                        fontWeight:
                          this.state.sliderValue > 65 &&
                          this.state.sliderValue < 90
                            ? 700
                            : 500,
                        width: "27%",
                      }}
                    >
                      75%
                    </span>
                    <span
                      className="slider-text"
                      style={{
                        color:
                          this.state.sliderValue > 90 ? "#E30613" : "#A4A4A4",
                        fontSize: this.state.sliderValue > 90 ? 20 : 15,
                        fontWeight: this.state.sliderValue > 90 ? 700 : 500,
                        width: "30%",
                      }}
                    >
                      100%
                    </span>
                  </div>
                  <Slider
                    step={25}
                    dots
                    min={25}
                    dotStyle={{
                      background: "#B10C16",
                      height: 8,
                      width: 8,
                      border: "1px solid #B10C16",
                    }}
                    activeDotStyle={{ background: "#B10C16" }}
                    value={this.state.sliderValue}
                    onChange={(e) => {
                      this.handleAmountPercentInput(e);
                      this.setState({ sliderValue: e });

                      this.setState({
                        amount:
                          (getFormattedNumber(this.state.lpBalance / 1e18, 6) *
                            e) /
                          100,
                      });
                    }}
                  />
                  <br />
                  <p style={{ color: "#E30613" }}>
                    *Select % to of the balance to lock
                  </p>
                  <br />
                  <br />
                  <p>
                    <b>Selected unlock date</b>
                  </p>
                  <div className="form-group row align-items-end">
                    <div className="col">
                      <div
                        onClick={() => {
                          this.setState({
                            unlockDate: new Date(
                              Date.now() + 1 * 30 * 24 * 60 * 60 * 1000
                            ),
                          });

                          this.setState({ unlockDatebtn: "1" });
                        }}
                        className="btn btn-info btn-block"
                        style={{
                          border:
                            this.state.unlockDatebtn === "1"
                              ? "none"
                              : "1px solid #D8D8D8",
                          background:
                            this.state.unlockDatebtn === "1"
                              ? "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)"
                              : "transparent",
                          color:
                            this.state.unlockDatebtn === "1"
                              ? "white"
                              : "#A4A4A4",
                          width: "max-content",
                        }}
                      >
                        1 month
                      </div>
                    </div>
                    <div className="col">
                      <div
                        onClick={() => {
                          this.setState({
                            unlockDate: new Date(
                              Date.now() + 3 * 30 * 24 * 60 * 60 * 1000
                            ),
                          });
                          this.setState({ unlockDatebtn: "3" });
                        }}
                        style={{
                          border:
                            this.state.unlockDatebtn === "3"
                              ? "none"
                              : "1px solid #D8D8D8",
                          background:
                            this.state.unlockDatebtn === "3"
                              ? "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)"
                              : "transparent",
                          color:
                            this.state.unlockDatebtn === "3"
                              ? "white"
                              : "#A4A4A4",
                          width: "max-content",
                        }}
                        className="btn btn-info btn-block"
                      >
                        3 months
                      </div>
                    </div>
                    <div className="col">
                      <div
                        onClick={() => {
                          this.setState({
                            unlockDate: new Date(
                              Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
                            ),
                          });
                          this.setState({ unlockDatebtn: "6" });
                        }}
                        style={{
                          border:
                            this.state.unlockDatebtn === "6"
                              ? "none"
                              : "1px solid #D8D8D8",
                          background:
                            this.state.unlockDatebtn === "6"
                              ? "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)"
                              : "transparent",
                          color:
                            this.state.unlockDatebtn === "6"
                              ? "white"
                              : "#A4A4A4",
                          width: "max-content",
                        }}
                        className="btn btn-info btn-block"
                      >
                        6 months
                      </div>
                    </div>
                    <div style={{ width: "fit-content", marginLeft: 10 }}>
                      <p>Custom date</p>
                      <DatePicker
                        selected={this.state.unlockDate}
                        onChange={(unlockDate) => this.setState({ unlockDate })}
                        showTimeSelect
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="form-control l-datepicker"
                      />
                    </div>
                  </div>

                  <hr />
                  <br />
                  <div
                    className="row m-0 justify-content-between"
                    style={{ gap: 30 }}
                  >
                    <button
                      onClick={this.handleApprove}
                      className="btn v1"
                      type="button"
                      style={{
                        background:
                          "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)",
                        width: 230,
                      }}
                    >
                      {this.state.loadspinner === true ? (
                        <>
                          <div
                            className="spinner-border "
                            role="status"
                            style={{ height: "1.5rem", width: "1.5rem" }}
                          ></div>
                        </>
                      ) : (
                        "APPROVE"
                      )}
                    </button>
                    <button
                      className="btn v1 ml-0"
                      type="submit"
                      style={{
                        background:
                          this.state.lockActive === false
                            ? "#C4C4C4"
                            : "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)",
                        width: 230,
                        pointerEvents:
                          this.state.lockActive === false ? "none" : "auto",
                      }}
                    >
                      {this.state.loadspinnerLock === true ? (
                        <>
                          <div
                            className="spinner-border "
                            role="status"
                            style={{ height: "1.5rem", width: "1.5rem" }}
                          ></div>
                        </>
                      ) : (
                        "LOCK"
                      )}
                    </button>
                  </div>
                  {this.state.status !== "" && (
                    <div className="status-wrapper">
                      <p style={{ color: "#E30613" }}>
                        <img src={Error} alt="" /> {this.state.status}
                      </p>
                    </div>
                  )}
                </div>
                {this.state.recipientLocks.length > 0 ? (
                  <div style={{ maxWidth: "400px", width: "100%" }}>
                    <div className="row m-0">
                      <div className="badge-wraper">
                        <img
                          src={
                            this.state.lockActive === true
                              ? BadgeGrayLight
                              : Badge
                          }
                          alt=""
                        />
                        <div
                          className="counter-wrapper"
                          style={{
                            background:
                              this.state.lockActive === false
                                ? "#EC2120"
                                : "#C4C4C4",
                          }}
                        >
                          {this.state.lockActive === true ? (
                            <span className="counter-text">
                              Liquidity not locked
                            </span>
                          ) : (
                            <span className="counter-text">
                              {!this.state.lpBalance
                                ? 25
                                : getPercentageLocked()}{" "}
                              % Locked
                              <CountDownTimer
                                date={
                                  this.state.recipientLocksLength
                                    ? convertTimestampToDate(
                                        Number(
                                          this.state.recipientLocks[
                                            this.state.recipientLocksLength - 1
                                          ].unlockTimestamp
                                        )
                                      )
                                    : ""
                                }
                              />
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div
                          className="moreinfo-wrapper"
                          onClick={() => {
                            this.setState({ showModal: true });
                          }}
                        >
                          <span className="moreinfo-text">
                            More info<i className="fas fa-info-circle"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* <iframe
                    style={{border: 'none'}}
                      srcDoc={`<div style="display: flex; flex-direction: column; align-items: center; gap: 5px"><img src=${BadgeSmall} alt="" style="width: 100px; height: 100px;"/>
                      <span style="background: rgb(236, 33, 32); color: #fff; padding: 5px 10px; border-radius: 4px; font-weight: 500; ">${
                        !this.state.lpBalance ? 25 : getPercentageLocked()
                      } % Locked</span</div>`}
                    ></iframe> */}
                    <div className="copylink-wrapper">
                      <div>
                        <span className="link-text">
                          https://dyp.finance/link/dummytext/
                        </span>
                      </div>
                      <div
                        className="d-flex align-items-center"
                        style={{ gap: 20 }}
                      >
                        <span className="sharelink-text">
                          Share this link lorem ipsum dolor sit{" "}
                        </span>
                        <div
                          onClick={this.handleCopyIFrame}
                          className="copy-btn"
                        >
                          Copy
                        </div>
                      </div>
                    </div>
                    <div className="info-wrappers">
                      <div className="row-wrapper">
                        <span className="left-info-text">ID</span>
                        <span className="right-info-text">
                          {this.state.recipientLocksLength
                            ? this.state.recipientLocks[
                                this.state.recipientLocksLength - 1
                              ].id
                            : ""}
                        </span>
                      </div>
                      <div className="row-wrapper">
                        <span className="left-info-text">Pair address</span>
                        <span className="right-info-text">
                          <NavLink
                            to={`/pair-explorer/${
                              this.state.recipientLocksLength
                                ? this.state.recipientLocks[
                                    this.state.recipientLocksLength - 1
                                  ].token
                                : ""
                            }`}
                            style={{ color: "#A4A4A4" }}
                          >
                            ...
                            {this.state.recipientLocksLength
                              ? this.state.recipientLocks[
                                  this.state.recipientLocksLength - 1
                                ].token.slice(35)
                              : ""}
                          </NavLink>{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="badge-wraper">
                    <div
                      className="moreinfo-wrapper"
                      onClick={() => {
                        this.setState({ showModal: true });
                      }}
                    >
                      <span className="moreinfo-text">
                        More info<i className="fas fa-info-circle"></i>
                      </span>
                    </div>
                    <img src={BadgeGrayLight} alt="" />
                    <div
                      className="counter-wrapper"
                      style={{
                        background: "#C4C4C4",
                      }}
                    >
                      <span className="counter-text">Liquidity not locked</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
          {this.state.showModal === true ? (
            <InfoModal
              visible={this.state.showModal}
              modalId="infomodal"
              onModalClose={() => {
                this.setState({ showModal: false });
              }}
            />
          ) : (
            <></>
          )}
        </div>
      );
    }
  };

  GetMyLocks = () => {
    const convertTimestampToDate = (timestamp) => {
      const result = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(timestamp * 1000);
      return result;
    };

    if (this.state.recipientLocks.length > 0) {
      return (
        <div>
          <div style={{ display: "flex", gap: 20 }}>
            {this.state.recipientLocks.map((lock) => (
              <div
                style={{ position: "relative", maxWidth: 390, width: "100%" }}
                key={lock.id}
              >
                <div
                  className="d-flex table-wrapper"
                  style={{
                    background:
                      lock.claimed === false
                        ? Date.now() > lock.unlockTimestamp * 1e3
                          ? "linear-gradient(230.69deg, #F08522 1.73%, #F8E11A 120.4%)"
                          : "linear-gradient(30.97deg, #E30613 18.87%, #FC4F36 90.15%)"
                        : "linear-gradient(30.97deg, #4D4D4D 18.87%, #A4A4A4 90.15%)",
                  }}
                >
                  <div className="pair-locks-wrapper">
                    <div className="row-wrapper">
                      <span className="left-info-text">
                        ID {lock.unlockTimestamp}
                      </span>
                      <span className="right-info-text">{lock.id}</span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Pair Address</span>
                      <span className="right-info-text">
                        <NavLink
                          to={`/pair-explorer/${lock.token}`}
                          style={{ color: "#A4A4A4" }}
                        >
                          ...{lock.token.slice(35)}
                        </NavLink>{" "}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">LP Amount</span>
                      <span className="right-info-text">
                        {getFormattedNumber(lock.amount / 1e18, 6)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">DYP</span>
                      <span className="right-info-text">
                        {getFormattedNumber(
                          lock.platformTokensLocked / 1e18,
                          6
                        )}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Recipient</span>
                      <span className="right-info-text">
                        <a
                          rel="noopener noreferrer"
                          style={{ color: "#A4A4A4" }}
                          target="_blank"
                          href={`https://etherscan.io/address/${lock.recipient}`}
                        >
                          ...{lock.recipient.slice(35)}
                        </a>
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Unlocks In</span>
                      <span className="right-info-text">
                        {convertTimestampToDate(lock.unlockTimestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="table-left-wrapper">
                    <span className="table-title-text">Status</span>
                    <div className="d-flex align-items-center status-button">
                      <h6 className="status-btn-text">
                        <img
                          src={
                            lock.claimed === false
                              ? Date.now() > lock.unlockTimestamp * 1e3
                                ? Active
                                : Active
                              : InActive
                          }
                          alt=""
                        />
                        {lock.claimed === false
                          ? Date.now() > lock.unlockTimestamp * 1e3
                            ? "Active"
                            : "Active"
                          : "Passive"}
                      </h6>
                    </div>
                    <span className="table-title-text" style={{ marginTop: 6 }}>
                      Ends in
                    </span>
                    <span className="table-subtitle-text">
                      <CountDownTimer
                        date={convertTimestampToDate(lock.unlockTimestamp)}
                      />
                    </span>
                    <span
                      className="table-title-text"
                      style={{ marginTop: 16, fontSize: 13 }}
                    >
                      Created on
                    </span>
                    <span className="table-subtitle-text">
                      {convertTimestampToDate(lock.unlockTimestamp)}
                    </span>
                  </div>
                </div>
                {String(this.state.coinbase).toLowerCase() ==
                  lock.recipient.toLowerCase() && (
                  <button
                    onClick={this.handleClaim(lock.id)}
                    disabled={Date.now() < lock.unlockTimestamp * 1e3}
                    style={{
                      color:
                        Date.now() < lock.unlockTimestamp * 1e3
                          ? "#C4C4C4"
                          : "#13D38E",
                      border:
                        Date.now() < lock.unlockTimestamp * 1e3
                          ? "2px solid #C4C4C4"
                          : "2px solid #13D38E",
                    }}
                    className="btn v1 btn-sm claim-btn"
                  >
                    Claim
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pair Address</th>
                <th>LP Amount</th>
                <th>DYP</th>
                <th>Recipient</th>
                <th>Unlocks In</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {this.state.recipientLocks.map((lock) => (
                <tr key={lock.id}>
                  <td>{lock.id} </td>
                  <td title={lock.token}>
                    <NavLink to={`/pair-explorer/${lock.token}`}>
                      ...{lock.token.slice(35)}
                    </NavLink>{" "}
                  </td>
                  <td title={getFormattedNumber(lock.amount / 1e18, 18)}>
                    {getFormattedNumber(lock.amount / 1e18, 6)}{" "}
                  </td>
                  <td
                    title={getFormattedNumber(
                      lock.platformTokensLocked / 1e18,
                      18
                    )}
                  >
                    {getFormattedNumber(lock.platformTokensLocked / 1e18, 6)}
                  </td>
                  <td title={lock.recipient}>
                    <a
                      rel="noopener noreferrer"
                      target="_blank"
                      href={`https://etherscan.io/address/${lock.recipient}`}
                    >
                      ...{lock.recipient.slice(35)}
                    </a>
                  </td>
                  <td title={new Date(lock.unlockTimestamp * 1e3)}>
                    {moment
                      .duration(lock.unlockTimestamp * 1e3 - Date.now())
                      .humanize(true)}{" "}
                  </td>
                  <td>
                    {String(this.props.coinbase).toLowerCase() ==
                      lock.recipient.toLowerCase() && (
                      <button
                        onClick={this.handleClaim(lock.id)}
                        disabled={Date.now() < lock.unlockTimestamp * 1e3}
                        style={{ height: "auto" }}
                        className="btn v1 btn-sm"
                      >
                        CLAIM
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {this.state.recipientLocksLength >
                this.state.recipientLocks.length && (
                <tr>
                  <td colSpan="7" className="text-center">
                    {" "}
                    <a onClick={this.refreshMyLocks} href="javascript:void(0)">
                      {!this.state.isLoadingMoreMyLocks
                        ? "Load more"
                        : "Loading..."}{" "}
                    </a>{" "}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div> */}
        </div>
      );
    } else {
      return (
        <div>
          <div className="pair-locker-wrapper px-0 mt-3">
            <Skeleton theme={this.props.theme} />
            <Skeleton theme={this.props.theme} />
            <Skeleton theme={this.props.theme} />
          </div>
        </div>
      );
    }
  };

  helperFunction = () => {
    this.forceUpdate();
    this.GetTokenLocks();
  };

  GetTokenLocks = () => {
    const convertTimestampToDate = (timestamp) => {
      const result = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(timestamp * 1000);
      return result;
    };

    return (
      <div>
        <strong style={{ fontSize: "18px" }} className="d-block mb-3">
          Pair locks
        </strong>
        {this.GetPairLockInfo()}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            marginTop: "3rem",
            rowGap: 45,
          }}
        >
          {this.state.tokenLocks &&
            this.state.tokenLocks
              .filter((lock) => lock.id === this.state.maxLpID)
              .map((lock) => {
                return (
                  <div
                    style={{
                      position: "relative",
                      maxWidth: 390,
                      width: "100%",
                    }}
                  >
                    {this.state.maxLpID === lock.id ? (
                      <div
                        className="top-locked-wrapper"
                        style={{
                          background:
                            lock.claimed === false
                              ? Date.now() < lock.unlockTimestamp * 1e3
                                ? "linear-gradient(30.97deg, #E30613 18.87%, #FC4F36 90.15%)"
                                : "linear-gradient(230.69deg, #F08522 1.73%, #F8E11A 120.4%)"
                              : "linear-gradient(30.97deg, #4D4D4D 18.87%, #A4A4A4 90.15%)",
                        }}
                      >
                        <span className="top-locked-text">Top locked</span>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div
                      className="single-info"
                      onClick={() => {
                        this.setState({ showModal: true });
                      }}
                    >
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <div
                      className="d-flex table-wrapper"
                      style={{
                        background:
                          lock.claimed === false
                            ? Date.now() < lock.unlockTimestamp * 1e3
                              ? "linear-gradient(30.97deg, #E30613 18.87%, #FC4F36 90.15%)"
                              : "linear-gradient(230.69deg, #F08522 1.73%, #F8E11A 120.4%)"
                            : "linear-gradient(30.97deg, #4D4D4D 18.87%, #A4A4A4 90.15%)",
                        borderTopLeftRadius:
                          this.state.maxLpID === lock.id ? 0 : 6,
                      }}
                    >
                      <div key={lock.id} className="pair-locks-wrapper">
                        <div className="row-wrapper">
                          <span className="left-info-text">
                            ID{lock.unlockTimestamp}
                          </span>
                          <span className="right-info-text">{lock.id}</span>
                        </div>
                        <div className="row-wrapper">
                          <span className="left-info-text">Pair Address</span>
                          <span className="right-info-text">
                            <NavLink
                              to={`/pair-explorer/${lock.token}`}
                              style={{ color: "#A4A4A4" }}
                            >
                              ...{lock.token.slice(35)}
                            </NavLink>{" "}
                          </span>
                        </div>
                        <div className="row-wrapper">
                          <span className="left-info-text">LP Amount</span>
                          <span className="right-info-text">
                            {getFormattedNumber(lock.amount / 1e18, 6)}
                          </span>
                        </div>
                        <div className="row-wrapper">
                          <span className="left-info-text">DYP</span>
                          <span className="right-info-text">
                            {getFormattedNumber(
                              lock.platformTokensLocked / 1e18,
                              6
                            )}
                          </span>
                        </div>
                        <div className="row-wrapper">
                          <span className="left-info-text">Recipient</span>
                          <span className="right-info-text">
                            <a
                              rel="noopener noreferrer"
                              style={{ color: "#A4A4A4" }}
                              target="_blank"
                              href={`https://etherscan.io/address/${lock.recipient}`}
                            >
                              ...{lock.recipient.slice(35)}
                            </a>
                          </span>
                        </div>
                        <div className="row-wrapper">
                          <span className="left-info-text">Unlocks In</span>
                          <span className="right-info-text">
                            {convertTimestampToDate(lock.unlockTimestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="table-left-wrapper">
                        <span className="table-title-text">Status</span>
                        <div className="d-flex align-items-center status-button">
                          <h6 className="status-btn-text">
                            <img
                              src={
                                lock.claimed === false
                                  ? Date.now() < lock.unlockTimestamp * 1e3
                                    ? Active
                                    : Active
                                  : InActive
                              }
                              alt=""
                            />
                            {lock.claimed === false
                              ? Date.now() < lock.unlockTimestamp * 1e3
                                ? "Active"
                                : "Active"
                              : "Passive"}
                          </h6>
                        </div>
                        <span
                          className="table-title-text"
                          style={{ marginTop: 6 }}
                        >
                          Ends in
                        </span>
                        <span className="table-subtitle-text">
                          <CountDownTimer
                            date={convertTimestampToDate(lock.unlockTimestamp)}
                          />
                        </span>
                        <span
                          className="table-title-text"
                          style={{ marginTop: 16, fontSize: 13 }}
                        >
                          Created on
                        </span>
                        <span className="table-subtitle-text">
                          {convertTimestampToDate(lock.unlockTimestamp)}
                        </span>
                      </div>
                    </div>
                    <img
                      src={
                        lock.claimed === false
                          ? Date.now() > lock.unlockTimestamp * 1e3
                            ? BadgeYellow
                            : Badge
                          : BadgeGray
                      }
                      alt=""
                      className="badge-img"
                    />
                  </div>
                );
              })}
          {this.state.tokenLocks
            .filter((lock) => lock.id !== this.state.maxLpID)
            .map((lock) => {
              return (
                <div
                  style={{ position: "relative", maxWidth: 390, width: "100%" }}
                >
                  {this.state.maxLpID === lock.id ? (
                    <div
                      className="top-locked-wrapper"
                      style={{
                        background:
                          lock.claimed === false
                            ? Date.now() < lock.unlockTimestamp * 1e3
                              ? "linear-gradient(30.97deg, #E30613 18.87%, #FC4F36 90.15%)"
                              : "linear-gradient(230.69deg, #F08522 1.73%, #F8E11A 120.4%)"
                            : "linear-gradient(30.97deg, #4D4D4D 18.87%, #A4A4A4 90.15%)",
                      }}
                    >
                      <span className="top-locked-text">Top locked</span>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div
                    className="d-flex table-wrapper"
                    style={{
                      background:
                        lock.claimed === false
                          ? Date.now() < lock.unlockTimestamp * 1e3
                            ? "linear-gradient(30.97deg, #E30613 18.87%, #FC4F36 90.15%)"
                            : "linear-gradient(230.69deg, #F08522 1.73%, #F8E11A 120.4%)"
                          : "linear-gradient(30.97deg, #4D4D4D 18.87%, #A4A4A4 90.15%)",
                      borderTopLeftRadius:
                        this.state.maxLpID === lock.id ? 0 : 6,
                    }}
                  >
                    <div key={lock.id} className="pair-locks-wrapper">
                      <div className="row-wrapper">
                        <span className="left-info-text">ID</span>
                        <span className="right-info-text">{lock.id}</span>
                      </div>
                      <div className="row-wrapper">
                        <span className="left-info-text">Pair Address</span>
                        <span className="right-info-text">
                          <NavLink
                            to={`/pair-explorer/${lock.token}`}
                            style={{ color: "#A4A4A4" }}
                          >
                            ...{lock.token.slice(35)}
                          </NavLink>{" "}
                        </span>
                      </div>
                      <div className="row-wrapper">
                        <span className="left-info-text">LP Amount</span>
                        <span className="right-info-text">
                          {getFormattedNumber(lock.amount / 1e18, 6)}
                        </span>
                      </div>
                      <div className="row-wrapper">
                        <span className="left-info-text">DYP</span>
                        <span className="right-info-text">
                          {getFormattedNumber(
                            lock.platformTokensLocked / 1e18,
                            6
                          )}
                        </span>
                      </div>
                      <div className="row-wrapper">
                        <span className="left-info-text">Recipient</span>
                        <span className="right-info-text">
                          <a
                            rel="noopener noreferrer"
                            style={{ color: "#A4A4A4" }}
                            target="_blank"
                            href={`https://etherscan.io/address/${lock.recipient}`}
                          >
                            ...{lock.recipient.slice(35)}
                          </a>
                        </span>
                      </div>
                      <div className="row-wrapper">
                        <span className="left-info-text">Unlocks In</span>
                        <span className="right-info-text">
                          {convertTimestampToDate(lock.unlockTimestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="table-left-wrapper">
                      <span className="table-title-text">Status</span>
                      <div className="d-flex align-items-center status-button">
                        <h6 className="status-btn-text">
                          <img
                            src={
                              lock.claimed === false
                                ? Date.now() < lock.unlockTimestamp * 1e3
                                  ? Active
                                  : Active
                                : InActive
                            }
                            alt=""
                          />
                          {lock.claimed === false
                            ? Date.now() < lock.unlockTimestamp * 1e3
                              ? "Active"
                              : "Active"
                            : "Passive"}
                        </h6>
                      </div>
                      <span
                        className="table-title-text"
                        style={{ marginTop: 6 }}
                      >
                        Ends in
                      </span>
                      <span className="table-subtitle-text">
                        <CountDownTimer
                          date={convertTimestampToDate(lock.unlockTimestamp)}
                        />
                      </span>
                      <span
                        className="table-title-text"
                        style={{ marginTop: 16, fontSize: 12 }}
                      >
                        Created on
                      </span>
                      <span className="table-subtitle-text">
                        {convertTimestampToDate(lock.unlockTimestamp)}
                      </span>
                    </div>
                  </div>
                  <img
                    src={
                      lock.claimed === false
                        ? Date.now() > lock.unlockTimestamp * 1e3
                          ? BadgeYellow
                          : BadgeSmall
                        : BadgeGray
                    }
                    alt=""
                    className="badge-img"
                  />
                </div>
              );
            })}

          {this.state.tokenLocks.length == 0 && (
            <div className="row justify-content-between p-0 ml-0">
              <Skeleton theme={this.props.theme} />
              <Skeleton theme={this.props.theme} />
              <Skeleton theme={this.props.theme} />
            </div>
          )}
        </div>
      </div>
    );
  };

  getPercentageLocked = () => {
    if (this.state.recipientLocksLength !== 0) {
      const amount =
        this.state.recipientLocks[this.state.recipientLocksLength - 1].amount /
        1e18;
      const percentage =
        (amount * 100) / (this.state.lpBalance / 1e18 + amount);

      return percentage.toFixed(0);
    }

    if (!this.props.match.params.pair_id) {
      const percentage = 25;
      return percentage;
    }
  };

  convertTimestampToDate = (timestamp) => {
    const result = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(timestamp * 1000);
    return result;
  };

  render() {
    const convertTimestampToDate = (timestamp) => {
      const result = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(timestamp * 1000);
      return result;
    };
    return (
      <div className="container-lg px-0">
        <div className="d-flex flex-column gap-3">
          <h6 className="locker-title">DYP Locker</h6>
          <p className="locker-desc">
            DYP Locker is a solution that supports liquidity lock functionality
            to every new project. Liquidity is the first thing that users check
            for, therefore having it encrypted via DYP Locker will assure them
            on the project validity and security.
          </p>
        </div>
        {this.state.placeholderState === false ? (
          <>
            <div className="row  gap-4 gap-lg-0 mt-4 w-100 mx-0">
              <div className="col-12 col-lg-7 px-0 px-lg-2 ps-lg-0">
                <div className="px-3 py-4 locker-card liquidity-background d-flex gap-3 position-relative">
                  <div
                    className="purplediv"
                    style={{ left: "0px", background: "#EB5E39" }}
                  ></div>
                  <div className="liquidity-icon-holder d-flex align-items-center justify-content-center">
                    <img src={liquidityIcon} alt="" />
                  </div>
                  <div
                    className="d-flex flex-column gap-2"
                    style={{ marginTop: "7px" }}
                  >
                    <h6 className="locker-card-title">Locking Liquidity</h6>
                    <p className="locker-card-desc">
                      Locking liquidity makes the funds inaccessible for a
                      predeterimned amount of time which creates user
                      confidence. The liquidity is locked using time-locked
                      smart contracts that DYP offers at not additional cost.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-5 px-0 px-lg-2 pe-0">
                <div className="px-3 py-4 locker-card security-background d-flex gap-3 h-100  position-relative">
                  <div className="purplediv" style={{ left: "0px" }}></div>
                  <div className="security-icon-holder d-flex align-items-center justify-content-center">
                    <img src={securityIcon} alt="" />
                  </div>
                  <div
                    className="d-flex flex-column gap-2"
                    style={{ marginTop: "7px" }}
                  >
                    <h6 className="locker-card-title">Verified Security</h6>
                    <p className="locker-card-desc">
                      Each project that locks liquidity on DYP Locker will be
                      given a verified security badge. Owners of the project can
                      share it to their communities in order to increase
                      credibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row flex-column-reverse flex-lg-row gap-4 gap-lg-0 mx-0 w-100 mt-5">
              <div className="col-12 col-lg-7 px-0 px-lg-2 ps-0">
                <div className="px-4 pt-4 pb-5 purple-wrapper position-relative">
                  <div
                    className="purplediv"
                    style={{ left: "0px", top: "20px", background: "#8E97CD" }}
                  ></div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <img src={greySecurityIcon} alt="" />
                      <h6 className="locker-function-title">Create lock</h6>
                    </div>
                    {/* <img src={moreInfo} alt="" height={24} width={24} /> */}
                  </div>
                  <hr className="form-divider my-4" style={{ height: "3px" }} />
                  <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between gap-5">
                    <div className="d-flex align-items-end justify-content-start gap-3 create-lock-inputs">
                      <div
                        className="d-flex flex-column gap-5"
                        style={{ width: "70%" }}
                      >
                        <div className="d-flex flex-column gap-3">
                          <span className="create-lock-title">
                            Your pair address
                          </span>
                          <div
                            className="input-container px-0"
                            style={{ width: "100%" }}
                          >
                            <input
                              type="text"
                              id="pair_address"
                              name="pair_address"
                              placeholder=" "
                              className="text-input"
                              style={{ width: "100%" }}
                              disabled={this.props.match.params.pair_id}
                              value={this.state.pair_address}
                              onChange={(e) => {
                                this.handlePairChange(e.target.value);
                                this.loadPairInfo();
                                this.selectBaseToken(e.target.value);
                                this.setState({ pair_address: e.target.value });
                              }}
                            />
                            <label
                              htmlFor="usd"
                              className="label secondary-label"
                              onClick={() => this.focusInput("pair_address")}
                            >
                              Enter pair address
                            </label>
                          </div>
                        </div>
                        <div className="d-flex flex-column gap-3">
                          <span className="create-lock-title">
                            Select amount
                          </span>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="input-container px-0"
                              style={{ width: "100%" }}
                            >
                              <input
                                id="pair_address"
                                name="pair_address"
                                placeholder=" "
                                className="text-input"
                                style={{ width: "100%" }}
                                disabled
                                onChange={(e) => {
                                  let amount = new window.BigNumber(
                                    e.target.value
                                  );
                                  amount = amount.times(1e18).toFixed(0);
                                  this.setState({ amount });
                                }}
                                value={this.state.amount}
                                type="number"
                                min={
                                  getFormattedNumber(
                                    this.state.lpBalance / 1e18,
                                    6
                                  ) * 0.25
                                }
                              />
                              <label
                                htmlFor="usd"
                                className="label secondary-label"
                                onClick={() => this.focusInput("pair_address")}
                              >
                                Amount
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn maxbtn"
                        style={{ marginBottom: "3px" }}
                        onClick={() => {
                          this.setState({
                            amount: getFormattedNumber(
                              this.state.lpBalance / 1e18,
                              6
                            ),
                          });
                        }}
                      >
                        Max
                      </button>
                    </div>
                    <div className="d-flex flex-column gap-5">
                      <div className="selected-token-wrapper py-3 ps-3 pe-5">
                        <div className="d-flex flex-column gap-2">
                          <span className="create-lock-title">
                            Selected base token
                          </span>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={
                                this.state.selectedBaseTokenTicker === "WETH"
                                  ? ethStakeActive
                                  : avaxStakeActive
                              }
                              alt=""
                              height={24}
                              width={24}
                            />
                            <h6 className="create-lock-token">
                              {this.state.selectedBaseTokenTicker}
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div
                        className="d-flex flex-column gap-2"
                        style={{ paddingLeft: "5px" }}
                      >
                        <span className="create-lock-title">Balance</span>
                        <h6 className="locker-balance">
                          {getFormattedNumber(this.state.lpBalance / 1e18, 6)}
                        </h6>
                      </div>
                    </div>
                  </div>
                  <hr className="form-divider my-4" style={{ height: "3px" }} />
                  <div className="d-flex flex-column flex-lg-row gap-4 gap-lg-0 justify-content-between align-items-end">
                    <div className="d-flex flex-column gap-2">
                      <span className="create-lock-title">
                        Select unlock date
                      </span>
                      <div className="d-flex align-items-center gap-3">
                        <span
                          className={`create-lock-month ${
                            this.state.unlockDatebtn === "1" && "selected-month"
                          }`}
                          onClick={() => {
                            this.setState({
                              unlockDate: new Date(
                                Date.now() + 1 * 30 * 24 * 60 * 60 * 1000
                              ),
                            });
                            this.setState({ unlockDatebtn: "1" });
                          }}
                        >
                          1 month
                        </span>
                        <span
                          className={`create-lock-month ${
                            this.state.unlockDatebtn === "3" && "selected-month"
                          }`}
                          onClick={() => {
                            this.setState({
                              unlockDate: new Date(
                                Date.now() + 3 * 30 * 24 * 60 * 60 * 1000
                              ),
                            });
                            this.setState({ unlockDatebtn: "3" });
                          }}
                        >
                          3 months
                        </span>
                        <span
                          className={`create-lock-month ${
                            this.state.unlockDatebtn === "6" && "selected-month"
                          }`}
                          onClick={() => {
                            this.setState({
                              unlockDate: new Date(
                                Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
                              ),
                            });
                            this.setState({ unlockDatebtn: "6" });
                          }}
                        >
                          6 months
                        </span>
                      </div>
                    </div>
                    <div className="input-container px-0 calendar-input">
                      <input
                        type="date"
                        id="date"
                        name="date"
                        placeholder=" "
                        className="text-input"
                        style={{ width: "100%" }}
                        onChange={(unlockDate) => this.setState({ unlockDate })}
                      />
                      <img
                        src={lockerCalendarIcon}
                        alt=""
                        className="locker-calendar"
                      />
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-3 mt-4 locker-slider-wrapper">
                    <span className="create-lock-title mb-5">
                      Seleted % rate
                    </span>
                    {/* <input type="range" className="w-50" /> */}

                    <Slider
                      className="ms-0 ms-lg-3"
                      step={25}
                      dots
                      min={25}
                      dotStyle={{
                        background: "#C0C9FF",
                        height: 16,
                        width: 16,
                        bottom: "-8px",
                        border: "1px solid #C0C9FF",
                      }}
                      activeDotStyle={{
                        background: "#4ED5D2",
                        border: "1px solid #4ED5D2",
                      }}
                      value={this.state.sliderValue}
                      onChange={(e) => {
                        this.handleAmountPercentInput(e);
                        this.setState({ sliderValue: e });

                        this.setState({
                          amount:
                            (getFormattedNumber(
                              this.state.lpBalance / 1e18,
                              6
                            ) *
                              e) /
                            100,
                        });
                      }}
                    />
                    <div className="slider-text-wrapper ms-3">
                      <span
                        className={`slider-text ${
                          this.state.sliderValue < 35
                            ? "slider-text-active first-value"
                            : null
                        }`}
                      >
                        25%
                      </span>
                      <span
                        className={`slider-text ${
                          this.state.sliderValue > 35 &&
                          this.state.sliderValue < 65
                            ? "slider-text-active second-value"
                            : null
                        }`}
                      >
                        50%
                      </span>
                      <span
                        className={`slider-text ${
                          this.state.sliderValue > 65 &&
                          this.state.sliderValue < 90
                            ? "slider-text-active third-value"
                            : null
                        }`}
                      >
                        75%
                      </span>
                      <span
                        className={`slider-text ${
                          this.state.sliderValue > 90
                            ? "slider-text-active fourth-value"
                            : null
                        }`}
                      >
                        100%
                      </span>
                    </div>
                    <span className="select-percentage mt-4">
                      *Select % of balance to lock
                    </span>
                  </div>
                  <hr className="form-divider my-4" />
                  <div className="d-flex align-items-center justify-content-between mx-3">
                    <button
                      className={`btn filledbtn px-5 ${
                        this.state.loadspinner === "success"
                          ? "success-button"
                          : this.state.loadspinner === "fail"
                          ? "fail-button"
                          : null
                      }`}
                      onClick={this.handleApprove}
                    >
                      {this.state.loadspinner === "initial" ? (
                        <>Approve</>
                      ) : this.state.loadspinner === "loading" ? (
                        <div
                          class="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      ) : this.state.loadspinner === "success" ? (
                        <>Success</>
                      ) : (
                        <>Failed</>
                      )}
                    </button>
                    <button
                      disabled={!this.state.lockActive}
                      className={`btn disabled-btn px-5 ${
                        this.state.loadspinnerLock === "success"
                          ? "success-button"
                          : this.state.loadspinnerLock === "fail"
                          ? "fail-button"
                          : null
                      }`}
                      onClick={this.handleLockSubmit}
                    >
                      {this.state.loadspinnerLock === "initial" ? (
                        <>Lock</>
                      ) : this.state.loadspinnerLock === "success" ? (
                        <>Success</>
                      ) : this.state.loadspinnerLock === "fail" ? (
                        <>Fail</>
                      ) : (
                        <div
                          class="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      )}
                    </button>
                  </div>
                  {this.state.status !== "" && (
                    <div className="mt-3 ms-3">
                      <span className="required-star">{this.state.status}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-12 col-lg-5 px-0 px-lg-2 position-relative pe-0">
                <div className="p-4 purple-wrapper">
                  <div className="d-flex align-items-center gap-2">
                    <img src={coinStackIcon} alt="" />
                    <h6 className="locker-function-title">
                      My DYP locker liquidity
                    </h6>
                  </div>
                  <hr className="form-divider my-3" />
                  <div className="locker-liquidity-wrapper p-3 d-flex align-items-center justify-content-between">
                    <img src={purpleLiquidityLocker} alt="" />
                    <div className="d-flex flex-column justify-content-center gap-2 align-items-end">
                      <div
                        className="d-flex align-items-center gap-2 cursor-pointer"
                        onClick={() => this.setState({ showModal: true })}
                      >
                        <span className="locker-indicator">
                          DYP locker status
                        </span>
                        <img src={moreInfo} alt="" height={20} width={20} />
                      </div>
                      <div className="locker-status d-flex align-items-center gap-3 p-2">
                        <span className="locker-status-text">
                          {this.state.lpBalance == "0"
                            ? 25
                            : this.getPercentageLocked()}
                          % Locked
                        </span>
                        <span className="locker-status-text">
                          <CountDownTimer
                            date={
                              this.state.recipientLocksLength
                                ? this.convertTimestampToDate(
                                    Number(
                                      this.state.recipientLocks[
                                        this.state.recipientLocksLength - 1
                                      ].unlockTimestamp
                                    )
                                  )
                                : "Fri, 02 Feb 1996 03:04:05 GMT"
                            }
                          />
                        </span>
                      </div>
                      <span className="locker-timer">Countdown timer</span>
                    </div>
                  </div>
                  <div className="col-5  mt-3">
                    <span className="create-lock-title">Info data</span>
                    <hr
                      className="form-divider w-100 my-2"
                      style={{ height: "3px" }}
                    />
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="create-loxk-title">ID</span>
                        <span className="create-loxk-title fw-bold">
                          {" "}
                          {this.state.recipientLocksLength
                            ? this.state.recipientLocks[
                                this.state.recipientLocksLength - 1
                              ].id
                            : ""}
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="create-loxk-title">Pair address</span>
                        <span className="create-loxk-title fw-bold">
                          <NavLink
                            to={`/pair-explorer/${
                              this.state.recipientLocksLength
                                ? this.state.recipientLocks[
                                    this.state.recipientLocksLength - 1
                                  ].token
                                : ""
                            }`}
                            style={{ color: "#A4A4A4" }}
                          >
                            ...
                            {this.state.recipientLocksLength
                              ? this.state.recipientLocks[
                                  this.state.recipientLocksLength - 1
                                ].token.slice(35)
                              : ""}
                          </NavLink>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="purple-wrapper p-3 mt-3 col-12 col-lg-5 position-relative">
              <div className="purplediv" style={{ left: "0px" }}></div>
              <div className="d-flex align-items-center gap-2">
                <img src={greySecurityIcon} alt="" />
                <h6 className="locker-function-title">Create lock</h6>
              </div>
              <hr className="form-divider my-4" style={{ height: "3px" }} />
              <div className="d-flex align-items-end justify-content-between">
                <div className="d-flex flex-column gap-3">
                  <span className="create-lock-title">Your pair address</span>
                  <div
                    className="input-container px-0"
                    style={{ width: "100%" }}
                  >
                    <input
                      type="text"
                      id="def_pair_address"
                      name="def_pair_address"
                      placeholder=" "
                      className="text-input"
                      style={{ width: "100%" }}
                      disabled={this.props.match.params.pair_id}
                      value={this.state.pair_address}
                      onChange={(e) => {
                        this.handlePairChange(e.target.value);
                        this.loadPairInfo();
                        this.selectBaseToken(e.target.value);
                        this.setState({ pair_address: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="usd"
                      className="label secondary-label"
                      onClick={() => this.focusInput("def_pair_address")}
                    >
                      Enter pair address
                    </label>
                  </div>
                </div>
                <button
                  className="btn filledbtn"
                  onClick={() => this.handleSearchPair}
                >
                  Search
                </button>
              </div>
            </div>
          </>
        )}
        <h6 className="locker-title mt-5">Pair locks</h6>
        <span className="total-dyp-locked">{this.GetPairLockInfo()}</span>
        <div className="row mx-0 w-100 mt-2">
          <div className="pair-locker-wrapper px-0 mt-3">
            {/* <PairLockerCard completed={true} active={true} topLocked={true} />
            <PairLockerCard completed={false} active={true} />
            <PairLockerCard completed={false} active={false} /> */}
            {this.state.tokenLocks &&
              this.state.tokenLocks
                .filter((lock) => lock.id === this.state.maxLpID)
                .map((lock, index) => (
                  <PairLockerCard
                    key={index}
                    completed={
                      lock.claimed === false
                        ? Date.now() < lock.unlockTimestamp * 1e3
                          ? true
                          : false
                        : false
                    }
                    active={
                      lock.claimed === false
                        ? Date.now() < lock.unlockTimestamp * 1e3
                          ? true
                          : true
                        : false
                    }
                    topLocked={this.state.maxLpID === lock.id ? true : false}
                    id={lock.id}
                    pair_address={lock.token.slice(35)}
                    lpAmount={getFormattedNumber(lock.amount / 1e18, 6)}
                    dyp={getFormattedNumber(
                      lock.platformTokensLocked / 1e18,
                      6
                    )}
                    recipent={lock.recipient.slice(35)}
                    unlock={convertTimestampToDate(lock.unlockTimestamp)}
                    endsIn={convertTimestampToDate(lock.unlockTimestamp)}
                    startsIn={convertTimestampToDate(lock.unlockTimestamp)}
                  />
                ))}
            {this.state.tokenLocks &&
              this.state.tokenLocks
                .filter((lock) => lock.id !== this.state.maxLpID)
                .map((lock) => (
                  <PairLockerCard
                    completed={
                      lock.claimed === false
                        ? Date.now() < lock.unlockTimestamp * 1e3
                          ? true
                          : false
                        : false
                    }
                    active={
                      lock.claimed === false
                        ? Date.now() < lock.unlockTimestamp * 1e3
                          ? true
                          : true
                        : false
                    }
                    topLocked={this.state.maxLpID === lock.id ? true : false}
                    id={lock.id}
                    pair_address={lock.token.slice(35)}
                    lpAmount={getFormattedNumber(lock.amount / 1e18, 6)}
                    dyp={getFormattedNumber(
                      lock.platformTokensLocked / 1e18,
                      6
                    )}
                    recipent={lock.recipient.slice(35)}
                    unlock={convertTimestampToDate(lock.unlockTimestamp)}
                    endsIn={convertTimestampToDate(lock.unlockTimestamp)}
                    startsIn={convertTimestampToDate(lock.unlockTimestamp)}
                  />
                ))}
            {this.state.tokenLocks.length === 0 && (
              <>
                <Skeleton theme={this.props.theme} />
                <Skeleton theme={this.props.theme} />
                <Skeleton theme={this.props.theme} />
              </>
            )}
          </div>
        </div>
        {this.state.recipientLocks.length > 0 && (
          <>
            <h6 className="locker-title mt-5">My locks</h6>
            <div className="mb-5">{this.GetMyLocks()}</div>
          </>
        )}
        {this.state.showModal === true ? (
          <InfoModal
            visible={this.state.showModal}
            modalId="infomodal"
            onModalClose={() => {
              this.setState({ showModal: false });
            }}
          />
        ) : (
          <></>
        )}
      </div>

      // <div className="locker">
      //   <div className="table-title">
      //     <h2 style={{ display: "block", color: `var(--preloader-clr)` }}>
      //       DYP Locker
      //     </h2>

      //     <p>
      //       Lock {window.ethereum ? window.ethereum.chainId === "0x1" ? "Uniswap" : "Pangolin" : 'Uniswap'}
      //       {" "}liquidity and check status of liquidity locks.
      //     </p>
      //   </div>
      //   <div className="l-table-wrapper-div p-4">
      //     <div className="mb-4">{this.GetCreateLockForm()}</div>
      //     <div className="mb-4">{this.GetTokenLocks()}</div>
      //     {this.state.recipientLocks.length > 0 && (
      //       <div className="mb-5">{this.GetMyLocks()}</div>
      //     )}
      //   </div>
      // </div>
    );
  }
}
