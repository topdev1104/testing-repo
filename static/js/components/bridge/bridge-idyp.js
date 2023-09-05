import React from "react";
import getFormattedNumber from "../../functions/get-formatted-number";
import Countdown from "react-countdown";
import "./bridge.css";
import eth from "./assets/eth.svg";
import bnb from "./assets/bnb.svg";
import avax from "./assets/avax.svg";
import wallet from "./assets/wallet.svg";
import moreinfo from "./assets/more-info.svg";
import switchicon from "./assets/switch.svg";
import failMark from "../../assets/failMark.svg";
import Tooltip from "@material-ui/core/Tooltip";
import Address from "../FARMINNG/address";
import WalletModal from "../WalletModal";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import routeIcon from "./assets/route-icon.svg";

// Renderer callback with condition
const getRenderer =
  (completedText = "0s", braces = false) =>
  ({ days, hours, minutes, seconds, completed }) => {
    if (braces && completedText === "0s") {
      completedText = "( 0s )";
    }
    if (completed) {
      // Render a complete state
      return <span>{completedText}</span>;
    } else {
      // Render a countdown
      return (
        <span>
          {braces ? "(" : ""} {days > 0 ? days + "d " : ""}
          {hours > 0 || days > 0 ? hours + "h " : ""}
          {minutes > 0 || hours > 0 || days > 0 ? minutes + "m " : ""}
          {seconds}s {braces ? ")" : ""}
          {/* {days}d {hours}h {minutes}m {seconds}s Left */}
        </span>
      );
    }
  };

export default function initBridgeidyp({
  bridgeETH,
  bridgeBSC,
  tokenETH,
  tokenBSC,
  TOKEN_DECIMALS = 18,
  TOKEN_SYMBOL = "DYP",
}) {
  let { BigNumber } = window;

  class Bridge extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        token_balance: "",
        network: "ETH",
        depositAmount: "",
        coinbase: "",
        gasPrice: "",
        txHash: "",
        chainText: "",
        ethPool: "...",
        bnbPool: "...",
        avaxPool: "...",
        withdrawableUnixTimestamp: null,
        depositLoading: false,
        depositStatus: "initial",
        withdrawLoading: false,
        withdrawStatus: "initial",
        errorMsg: "",
        errorMsg2: "",
        showWalletModal: false,
        destinationChain: this.props.destinationChain,
      };
    }

    componentDidMount() {
      this.refreshBalance();
      this.getChainSymbol();
      this.fetchData();
      window._refreshBalInterval = setInterval(this.refreshBalance, 4000);
      window._refreshBalInterval = setInterval(this.getChainSymbol, 500);
    }

    componentWillUnmount() {
      clearInterval(window._refreshBalInterval);
    }

    fetchData = async () => {
      //Get DYP Balance Ethereum Pool
      let ethPool = await window.getTokenHolderBalanceAll(
        this.props.sourceChain === "avax" || this.props.sourceChain === "bnb"
          ? bridgeBSC._address
          : bridgeETH._address,
        bridgeETH.tokenAddress,
        1
      );
      ethPool = ethPool / 1e18;

      //Get DYP Balance BNB Chain Pool
      let avaxPool = await window.getTokenHolderBalanceAll(
        this.props.sourceChain === "eth"
          ? bridgeBSC._address
          : bridgeETH._address,
        bridgeETH.tokenAddress,
        2
      );

      avaxPool = avaxPool / 1e18;
      let bnbPool = await window.getTokenHolderBalanceAll(
        this.props.sourceChain === "bnb"
          ? bridgeETH._address
          : bridgeBSC._address,
        bridgeETH.tokenAddress,
        3
      );
      bnbPool = bnbPool / 1e18;
      this.setState({ ethPool, avaxPool, bnbPool });
    };

    handleApprove = (e) => {
      // e.preventDefault();
      let amount = this.state.depositAmount;
      this.setState({ depositLoading: true });

      if (this.props.sourceChain === "eth") {
        if (this.props.destinationChain === "avax") {
          if (amount > this.state.avaxPool) {
            window.$.alert(
              "💡 Not enough balance on the bridge, check back later!"
            );
            this.setState({ depositLoading: false });

            return;
          }
        } else if (this.props.destinationChain === "bnb") {
          if (amount > this.state.bnbPool) {
            window.$.alert(
              "💡 Not enough balance on the bridge, check back later!"
            );
            this.setState({ depositLoading: false });

            return;
          }
        }
      } else if (this.props.sourceChain === "avax") {
        if (this.props.destinationChain === "eth") {
          if (amount > this.state.avaxPool || amount > this.state.ethPool) {
            window.$.alert(
              "💡 Not enough balance on the bridge, check back later!"
            );
            this.setState({ depositLoading: false });

            return;
          }
        }
      } else if (this.props.sourceChain === "bnb") {
        if (this.props.destinationChain === "eth") {
          if (amount > this.state.bnbPool || amount > this.state.ethPool) {
            window.$.alert(
              "💡 Not enough balance on the bridge, check back later!"
            );
            this.setState({ depositLoading: false });

            return;
          }
        }
      }
      
      amount = new BigNumber(amount).times(10 ** TOKEN_DECIMALS).toFixed(0);
      let bridge = bridgeETH;
      tokenETH
        .approve(bridge._address, amount)
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
          }, 8000);
        });
    };

    handleDeposit = async (e) => {
      let amount = this.state.depositAmount;
      this.setState({ depositLoading: true });

      if (this.props.sourceChain === "eth") {
        if (this.props.destinationChain === "avax") {
          if (amount > this.state.avaxPool) {
            window.$.alert(
              "💡 Not enough balance on the bridge, check back later!"
            );
            this.setState({ depositLoading: false });

            return;
          }
        } else if (this.props.destinationChain === "bnb") {
          if (amount > this.state.bnbPool) {
            window.$.alert(
              "💡 Not enough balance on the bridge, check back later!"
            );
            this.setState({ depositLoading: false });

            return;
          }
        }
      } else if (this.props.sourceChain === "avax") {
        if (this.props.destinationChain === "eth") {
          if (amount > this.state.avaxPool || amount > this.state.ethPool) {
            window.$.alert(
              "💡 Not enough balance on the bridge, check back later!"
            );
            this.setState({ depositLoading: false });

            return;
          }
        }
      } else if (this.props.sourceChain === "bnb") {
        if (this.props.destinationChain === "eth") {
          if (amount > this.state.bnbPool || amount > this.state.ethPool) {
            window.$.alert(
              "💡 Not enough balance on the bridge, check back later!"
            );
            this.setState({ depositLoading: false });

            return;
          }
        }
      }

      amount = new BigNumber(amount).times(10 ** TOKEN_DECIMALS).toFixed(0);
      let bridge = bridgeETH;
      let chainId = this.props.networkId;
      

      if (chainId !== undefined) {
        let contract = await window.getBridgeContract(bridge._address);
        contract.methods
          .deposit(amount)
          .send({ from: await window.getCoinbase() }, (err, txHash) => {
            this.setState({ txHash });
          })
          .then(() => {
            this.setState({ depositLoading: false, depositStatus: "success" });
            this.refreshBalance();
          })
          .catch((e) => {
            this.setState({
              depositLoading: false,
              depositStatus: "fail",
              errorMsg: e?.message,
            });
            setTimeout(() => {
              this.setState({
                depositStatus: "initial",
                depositAmount: "",
                errorMsg: "",
              });
            }, 8000);
          });
      }
    };

    handleWithdraw = async (e) => {
      this.setState({ withdrawLoading: true });
      let amount = this.state.withdrawAmount;
      amount = new BigNumber(amount).times(10 ** TOKEN_DECIMALS).toFixed(0);
      try {
        let signature =
          (this.props.sourceChain === "eth" &&
            this.props.destinationChain === "avax") ||
          (this.props.sourceChain === "avax" &&
            this.props.destinationChain === "eth")
            ? window.config.SIGNATURE_API_URLAVAXiDYP
            : window.config.SIGNATURE_API_URLBSCiDYP;
        let url =
          signature +
          `/api/withdraw-args?depositNetwork=${
            this.props.sourceChain === "eth"
              ? "ETH"
              : this.props.sourceChain === "avax"
              ? "AVAX"
              : "BSC"
          }&txHash=${this.state.txHash}`;
        console.log({ url });
        let args = await window.jQuery.get(url);
        console.log({ args });

        bridgeBSC
          .withdraw(args)
          .then(() => {
            this.setState({
              withdrawLoading: false,
              withdrawStatus: "success",
            });
            this.refreshBalance();
          })
          .catch((e) => {
            this.setState({ withdrawLoading: false, withdrawStatus: "fail" });
            this.setState({ errorMsg2: e?.message });
            console.log(e);
            setTimeout(() => {
              this.setState({
                withdrawStatus: "initial",
                withdrawAmount: "",
                errorMsg2: "",
              });
            }, 8000);
          });
      } catch (e) {
        this.setState({ withdrawLoading: false, withdrawStatus: "fail" });
        this.setState({ errorMsg2: e?.message });
        console.log(e);
        setTimeout(() => {
          this.setState({
            withdrawStatus: "initial",
            withdrawAmount: "",
            errorMsg2: "",
          });
        }, 8000);
        window.alertify.error("Something went wrong!");
        console.error(e);
      }
    };

    handleSetMaxDeposit = (e) => {
      e.preventDefault();
      this.setState({
        depositAmount: new BigNumber(this.state.token_balance)
          .div(10 ** TOKEN_DECIMALS)
          .toFixed(TOKEN_DECIMALS),
      });
    };

    refreshBalance = async () => {
      if (this.props.isConnected === true && this.props.networkId !== 0) {
        let coinbase = this.props.coinbase;
        this.setState({ coinbase });
        try {
          let chainId = this.props.networkId;
          let network = window.config.chain_ids[chainId] || "UNKNOWN";

          let token_balance = await (network == "AVAX" || network === "BSC"
            ? tokenBSC
            : tokenETH
          ).balanceOf(coinbase);

          this.setState({
            token_balance,
            network,
          });

          if (this.state.txHash) {
            try {
              let signature =
                (this.props.sourceChain === "eth" &&
                  this.props.destinationChain === "avax") ||
                (this.props.sourceChain === "avax" &&
                  this.props.destinationChain === "eth")
                  ? window.config.SIGNATURE_API_URLAVAXiDYP
                  : window.config.SIGNATURE_API_URLBSCiDYP;
              let url =
                signature +
                `/api/withdraw-args?depositNetwork=${
                  this.props.sourceChain === "eth"
                    ? "ETH"
                    : this.props.sourceChain === "avax"
                    ? "AVAX"
                    : "BSC"
                }&txHash=${
                  this.state.txHash
                }&getWithdrawableUnixTimestamp=true`;
              console.log({ url });
              let { withdrawableUnixTimestamp } = await window.jQuery.get(url);
              this.setState({ withdrawableUnixTimestamp });
              console.log({ withdrawableUnixTimestamp });
            } catch (e) {
              console.error(e);
              this.setState({ withdrawableUnixTimestamp: null });
            }
          } else this.setState({ withdrawableUnixTimestamp: null });
        } catch (e) {
          console.error(e);
        }
      }
    };

    getChainSymbol = async () => {
      try {
        let chainId = this.props.networkId;
        if (chainId === 43114) this.setState({ chainText: "AVAX" });
        else if (chainId === 1) this.setState({ chainText: "ETH" });
        else {
          this.setState({ chainText: "" });
        }
      } catch (err) {
        this.setState({ chainText: "ETH" });
        // console.log(err);
      }
    };

    handleSwapChains = () => {
      if (this.props.activebtn === "5") {
        if (this.props.sourceChain === "eth") {
          this.props.onSelectChain("eth");
          this.props.onSelectSourceChain("bnb");
        } else if (this.props.sourceChain === "bnb") {
          this.props.onSelectChain("bnb");
          this.props.onSelectSourceChain("eth");
        }
      } else if (this.props.activebtn === "7") {
        if (this.props.sourceChain === "eth") {
          this.props.onSelectChain("eth");
          this.props.onSelectSourceChain("avax");
        } else if (this.props.sourceChain === "avax") {
          this.props.onSelectChain("avax");
          this.props.onSelectSourceChain("eth");
        }
      }
    };

    render() {
      // console.log( this.props.networkId)
      let canWithdraw = false;
      let timeDiff = null;
      if (this.state.withdrawableUnixTimestamp) {
        timeDiff = Math.max(
          0,
          this.state.withdrawableUnixTimestamp * 1e3 - Date.now()
        );
        canWithdraw = timeDiff === 0;
      }
      
      return (
        <div className="d-flex gap-4 justify-content-between">
          <div className="token-staking col-12 col-lg-6 col-xxl-5">
            <div className="purplediv"></div>
            <div className="row">
              <div>
                <div className="d-flex flex-column">
                  <h6 className="fromtitle mb-2">Deposit</h6>
                  <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div
                        className={
                          this.props.sourceChain === "eth"
                            ? "optionbtn-active"
                            : "optionbtn-passive bridge-passive"
                        }
                        onClick={() => {
                          this.props.activebtn === "5"
                            ? this.props.onSelectChain("bnb")
                            : this.props.onSelectChain("avax");
                          this.props.onSelectSourceChain("eth");
                        }}
                      >
                        <h6 className="optiontext d-flex align-items-center gap-2">
                          <img src={eth} alt="" />
                          <p className=" mb-0 optiontext d-none d-lg-flex">
                            Ethereum
                          </p>
                        </h6>
                      </div>
                      {this.props.activebtn !== "7" && (
                        <div
                          className={
                            this.props.sourceChain === "bnb"
                              ? "optionbtn-active"
                              : "optionbtn-passive bridge-passive"
                          }
                          onClick={() => {
                            this.setState({
                              sourceChain: "bnb",
                            });
                            this.props.onSelectSourceChain("bnb");
                            this.props.onSelectChain("eth");
                          }}
                        >
                          <h6 className="optiontext d-flex align-items-center gap-2">
                            <img src={bnb} alt="" />
                            <p className=" mb-0 optiontext d-none d-lg-flex">
                              BNB Chain
                            </p>
                          </h6>
                        </div>
                      )}
                      {this.props.activebtn !== "5" && (
                        <div
                          className={
                            this.props.sourceChain === "avax"
                              ? "optionbtn-active"
                              : "optionbtn-passive bridge-passive"
                          }
                          onClick={() => {
                            this.setState({
                              sourceChain: "avax",
                            });
                            this.props.onSelectSourceChain("avax");
                            this.props.onSelectChain("eth");
                          }}
                        >
                          <h6 className="optiontext d-flex align-items-center gap-2">
                            <img src={avax} alt="" />
                            <p className=" mb-0 optiontext d-none d-lg-flex">
                              Avalanche
                            </p>
                          </h6>
                        </div>
                      )}
                    </div>
                    {this.props.isConnected === false ? (
                      <button
                        className="connectbtn btn d-flex align-items-center gap-2"
                        style={{ width: "fit-content" }}
                        onClick={() => {
                          this.setState({ showWalletModal: true });
                        }}
                      >
                        <img src={wallet} alt="" />
                        Connect wallet
                      </button>
                    ) : (
                      <div className="addressbtn btn">
                        <Address a={this.state.coinbase} chainId={43114} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="row token-staking-form gap-3">
                  <div className="col-12">
                    <div className="l-box">
                      <div onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                          <div className="row m-0">
                            <div className="activewrapper flex-column flex-lg-row mt-3 mb-3">
                              <label
                                htmlFor="deposit-amount"
                                className="chainWrapper text-left"
                              >
                                <h6 className="mybalance-text">
                                  Balance:
                                  <b>
                                    {this.props.sourceChain === "eth"
                                      ? getFormattedNumber(
                                          this.props.ethBalance / 1e18,
                                          6
                                        )
                                      : this.props.sourceChain === "avax"
                                      ? getFormattedNumber(
                                          this.props.avaxBalance / 1e18,
                                          6
                                        )
                                      : getFormattedNumber(
                                          this.props.bnbBalance / 1e18,
                                          6
                                        )}
                                  </b>
                                  iDYP
                                </h6>
                              </label>
                              <div className="">
                                <h6
                                  className="poolbalance-text"
                                  style={{ gap: "6px" }}
                                >
                                  {this.props.sourceChain === "eth"
                                    ? "Ethereum"
                                    : this.props.sourceChain !== "avax"
                                    ? "BNB Chain"
                                    : "Avalanche"}{" "}
                                  Pool:{" "}
                                  <b>
                                    {this.props.sourceChain === "eth"
                                      ? getFormattedNumber(
                                          this.state.ethPool,
                                          2
                                        )
                                      : this.props.sourceChain === "avax"
                                      ? getFormattedNumber(
                                          this.state.avaxPool,
                                          2
                                        )
                                      : getFormattedNumber(
                                          this.state.bnbPool,
                                          2
                                        )}{" "}
                                    iDYP
                                  </b>
                                </h6>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 otherside w-100">
                            <h6 className="fromtitle d-flex justify-content-between align-items-center mt-1 mb-2">
                              Deposit
                              <Tooltip
                                placement="top"
                                title={
                                  <div className="tooltip-text">
                                    {
                                      "Deposit your assets to bridge smart contract."
                                    }
                                  </div>
                                }
                              >
                                <img src={moreinfo} alt="" />
                              </Tooltip>
                            </h6>

                            <div className="d-flex gap-2 flex-column flex-lg-row align-items-center justify-content-between">
                              <div className="d-flex gap-2 align-items-center">
                                <input
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
                                  className="styledinput"
                                  placeholder="0"
                                  type="text"
                                  disabled={
                                    this.state.destinationChain !== ""
                                      ? false
                                      : true
                                  }
                                />

                                <button
                                  className="btn maxbtn"
                                  disabled={
                                    this.state.destinationChain !== ""
                                      ? false
                                      : true
                                  }
                                  style={{ cursor: "pointer" }}
                                  onClick={this.handleSetMaxDeposit}
                                >
                                  MAX
                                </button>
                              </div>

                              <button
                                style={{ width: "fit-content" }}
                                disabled={
                                  this.state.depositAmount === "" ||
                                  this.state.depositLoading === true ||
                                  this.state.depositStatus === "success"
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
                                    ? this.handleDeposit()
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
                                    <span class="visually-hidden">
                                      Loading...
                                    </span>
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
                            <p
                              style={{ fontSize: "10px" }}
                              className="mt-1 text-center mb-0"
                              id="firstPlaceholder"
                            >
                              Please approve before deposit.
                            </p>
                            {this.state.errorMsg && (
                              <h6 className="errormsg">
                                {this.state.errorMsg}
                              </h6>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <img
                    onClick={this.handleSwapChains}
                    src={switchicon}
                    alt=""
                    style={{
                      width: 55,
                      height: 55,
                      margin: "auto",
                      boxShadow: "0px 6px 12px rgba(78, 213, 210, 0.32)",
                      padding: 0,
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  />
                  <div className="col-12 position-relative">
                    <div className="purplediv"></div>
                    <div className="l-box">
                      <div className="pb-0">
                        <div className="form-group">
                          <label
                            htmlFor="deposit-amount"
                            className="d-block text-left"
                          >
                            <div className="d-flex flex-column">
                              <h6 className="fromtitle mb-2">Withdraw:</h6>
                              <div className="d-flex align-items-center justify-content-between gap-2">
                                <div className="d-flex align-items-center justify-content-between gap-3">
                                  <div
                                    className={
                                      this.state.destinationChain === "eth"
                                        ? "optionbtn-active"
                                        : "optionbtn-passive bridge-passive"
                                    }
                                    onClick={() => {
                                      // this.setState({
                                      //   destinationChain: "eth",
                                      // });
                                      // this.props.onSelectChain("eth");
                                    }}
                                    style={{
                                      pointerEvents:
                                        this.props.networkId === 1
                                          ? "none"
                                          : "auto",
                                    }}
                                  >
                                    <h6 className="optiontext d-flex align-items-center gap-2">
                                      <img src={eth} alt="" />
                                      <p className=" mb-0 optiontext d-none d-lg-flex">
                                        Ethereum
                                      </p>
                                    </h6>
                                  </div>
                                  {this.props.activebtn !== "7" && (
                                    <div
                                      className={
                                        this.state.destinationChain === "bnb"
                                          ? "optionbtn-active"
                                          : "optionbtn-passive bridge-passive"
                                      }
                                      onClick={() => {
                                        // this.props.onSelectChain("bnb");
                                      }}
                                      style={{
                                        pointerEvents:
                                          this.props.networkId === 43114 ||
                                          this.props.networkId === 56
                                            ? "none"
                                            : "auto",
                                      }}
                                    >
                                      <h6 className="optiontext d-flex align-items-center gap-2">
                                        <img src={bnb} alt="" />
                                        <p className=" mb-0 optiontext d-none d-lg-flex">
                                          BNB Chain
                                        </p>
                                      </h6>
                                    </div>
                                  )}
                                  {this.props.activebtn !== "5" && (
                                    <div
                                      className={
                                        this.state.destinationChain === "avax"
                                          ? "optionbtn-active"
                                          : "optionbtn-passive bridge-passive"
                                      }
                                      onClick={() => {
                                        this.props.onSelectChain("avax");
                                      }}
                                      style={{
                                        pointerEvents:
                                          this.props.networkId === 43114 ||
                                          this.props.networkId === 56
                                            ? "none"
                                            : "auto",
                                      }}
                                    >
                                      <h6 className="optiontext d-flex align-items-center gap-2">
                                        <img src={avax} alt="" />
                                        <p className=" mb-0 optiontext d-none d-lg-flex">
                                          Avalanche
                                        </p>
                                      </h6>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </label>

                          <div className="mt-4 otherside w-100">
                            <h6 className="fromtitle flex-column flex-lg-row d-flex justify-content-between align-items-start align-items-lg-center mt-1 mb-2">
                              RECEIVE
                              <div className="d-flex align-items-center gap-2">
                                <h6
                                  className="poolbalance-text"
                                  style={{ gap: "6px" }}
                                >
                                  {this.state.destinationChain === "bnb"
                                    ? "BNB Chain"
                                    : this.state.destinationChain === "avax"
                                    ? "Avalanche"
                                    : "Ethereum"}{" "}
                                  Pool:{" "}
                                  <b>
                                    {this.props.destinationChain === "avax"
                                      ? getFormattedNumber(
                                          this.state.avaxPool,
                                          2
                                        )
                                      : this.props.destinationChain === "bnb"
                                      ? getFormattedNumber(
                                          this.state.bnbPool,
                                          2
                                        )
                                      : getFormattedNumber(
                                          this.state.ethPool,
                                          2
                                        )}{" "}
                                    iDYP
                                  </b>
                                </h6>

                                <Tooltip
                                  placement="top"
                                  title={
                                    <div className="tooltip-text">
                                      {
                                        " Receive the assets in the selected chain."
                                      }
                                    </div>
                                  }
                                >
                                  <img src={moreinfo} alt="" />
                                </Tooltip>
                              </div>
                            </h6>

                            <div className="d-flex gap-2 flex-column flex-lg-row align-items-center justify-content-between">
                              <div className="d-flex gap-2 align-items-center">
                                <input
                                  value={this.state.txHash}
                                  onChange={(e) =>
                                    this.setState({ txHash: e.target.value })
                                  }
                                  className="styledinput"
                                  placeholder="Enter Deposit transaction hash"
                                  type="text"
                                  // disabled={!canWithdraw}
                                />
                              </div>

                              <button
                                style={{ width: "fit-content" }}
                                disabled={
                                  this.state.txHash !== "" ? false : true
                                }
                                className={`btn filledbtn ${
                                  canWithdraw === false &&
                                  this.state.txHash === "" &&
                                  "disabled-btn"
                                } ${
                                  this.state.withdrawStatus === "deposit" ||
                                  this.state.withdrawStatus === "success"
                                    ? "success-button"
                                    : this.state.withdrawStatus === "fail"
                                    ? "fail-button"
                                    : null
                                } d-flex justify-content-center align-items-center gap-2`}
                                onClick={this.handleWithdraw}
                              >
                                {this.state.withdrawLoading === true ? (
                                  <div
                                    class="spinner-border spinner-border-sm text-light"
                                    role="status"
                                  >
                                    <span class="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                ) : this.state.withdrawStatus === "initial" ? (
                                  <>Withdraw</>
                                ) : this.state.withdrawStatus === "success" ? (
                                  <>Success</>
                                ) : (
                                  <>
                                    <img src={failMark} alt="" />
                                    Failed
                                  </>
                                )}{" "}
                                {this.state.withdrawableUnixTimestamp &&
                                  Date.now() <
                                    this.state.withdrawableUnixTimestamp *
                                      1e3 && (
                                    <span>
                                      &nbsp;
                                      <Countdown
                                        onComplete={() => this.forceUpdate()}
                                        key="withdrawable"
                                        date={
                                          this.state.withdrawableUnixTimestamp *
                                          1e3
                                        }
                                        renderer={getRenderer(undefined, true)}
                                      />
                                    </span>
                                  )}
                              </button>
                            </div>

                            <div className="separator"></div>
                            <div className="d-flex gap-2 align-items-start">
                              <img
                                src={require("./assets/errorinfo.svg").default}
                                alt=""
                              />
                              <h6 className="bottominfotxt">
                                You connot Bridge from BNB Chain to Avalanche
                                directly, you need to go first to Ethereum and
                                then to Avalanche, the same will happen if you
                                want to bridge from Avalanche to BNB Chain, you
                                need first to bridge to Ethereum and then to BNB
                                Chain.
                              </h6>
                            </div>

                            {this.state.errorMsg2 && (
                              <h6 className="errormsg">
                                {this.state.errorMsg2}
                              </h6>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {this.state.showWalletModal === true && (
            <WalletModal
              show={this.state.showWalletModal}
              handleClose={() => {
                this.setState({ showWalletModal: false });
              }}
              handleConnection={this.props.handleConnection}
            />
          )}

          <div className="col-6 d-none d-lg-flex guidewrapper">
            <div className="purplediv" style={{ left: "0px" }}>
              {" "}
            </div>
            <div>
              <h6 className="guidetitle">
                <img src={routeIcon} alt="" />
                Bridge process guide
              </h6>
              <div className="separator"></div>
              <Timeline
                sx={{
                  [`& .${timelineItemClasses.root}:before`]: {
                    flex: 0,
                    padding: 0,
                  },
                }}
              >
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot
                      className={
                        this.props.isConnected === true
                          ? "greendot"
                          : "passivedot"
                      }
                    />
                    <TimelineConnector
                      className={
                        this.props.isConnected === true
                          ? "greenline"
                          : "passiveline"
                      }
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <h6 className="content-text">
                      <h6 className="content-title2">
                        <b>Connect wallet</b>
                      </h6>
                      Connect your wallet in order to start using Dypius Bridge.
                      Your wallet chain will be associated as default.
                    </h6>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot
                      className={
                        this.state.destinationChain !== ""
                          ? "greendot"
                          : "passivedot"
                      }
                    />
                    <TimelineConnector
                      className={
                        this.state.destinationChain !== ""
                          ? "greenline"
                          : "passiveline"
                      }
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <h6 className="content-text">
                      <h6 className="content-title2">
                        <b>Select chains</b>
                      </h6>
                      Select desired bridge chains at “FROM” and “TO” sections.
                      To change the “FROM” chain you need to change it to your
                      wallet.
                    </h6>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot
                      className={
                        this.state.depositAmount !== ""
                          ? "greendot"
                          : "passivedot"
                      }
                    />
                    <TimelineConnector
                      className={
                        this.state.depositAmount !== ""
                          ? "greenline"
                          : "passiveline"
                      }
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <h6 className="content-text">
                      <h6 className="content-title2">
                        <b>Fill in amount</b>
                      </h6>
                      Check your balance and fill in the desired amount you want
                      to bridge. You can use “Max” button to fill in the maximum
                      amount.
                    </h6>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot
                      className={
                        this.state.depositStatus === "deposit"
                          ? "greendot"
                          : "passivedot"
                      }
                    />
                    <TimelineConnector
                      className={
                        this.state.depositStatus === "deposit"
                          ? "greenline"
                          : "passiveline"
                      }
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <h6 className="content-text">
                      <h6 className="content-title2">
                        <b>Approve deposit</b>
                      </h6>
                      Approve the transaction and then deposit the assets. These
                      steps need confirmation in your wallet.
                    </h6>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot
                      className={
                        this.state.txHash !== "" ? "greendot" : "passivedot"
                      }
                    />
                    <TimelineConnector
                      className={
                        this.state.txHash !== "" ? "greenline" : "passiveline"
                      }
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <h6 className="content-text">
                      <h6 className="content-title2">
                        <b>Fill in transaction hash</b>
                      </h6>
                      After successful deposit, fill in the transaction hash and
                      switch your wallet to the chosen bridge network.
                    </h6>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot
                      className={
                        canWithdraw === true ? "greendot" : "passivedot"
                      }
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <h6 className="content-text">
                      <h6 className="content-title2">
                        <b>
                          {"Switch to destination chain. Wait timer & withdraw"}
                        </b>
                      </h6>
                      Firstly go to your wallet and switch into the chain you
                      want to withdraw from. Wait for the timer to end and and
                      click withdraw button to receive the assets in the desired
                      chain.
                    </h6>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </div>
          </div>
        </div>
      );
    }
  }

  return Bridge;
}
