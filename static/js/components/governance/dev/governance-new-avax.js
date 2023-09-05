import React, { useState } from "react";
import moment from "moment";
import { NavLink, Route } from "react-router-dom";
import Address from "../../FARMINNG/address";
import getFormattedNumber from "../../../functions/get-formatted-number";
import "./governance-new.css";
import Modal from "../../Modal/Modal";
import WalletModal from "../../WalletModal";
import eth from "../assets/eth.svg";
import bnb from "../assets/bnb.svg";
import avax from "../assets/avax.svg";
import submit from "../assets/submit.svg";
import walleticon from "../assets/walleticon.svg";
import copy from "../assets/copy.svg";
import emptyCard from "../assets/emptycard.png";
import freetextPassive from "../assets/freetext-passive.svg";
import freetextActive from "../assets/freetext-active.svg";
import disburselogoActive from "../assets/disburselogo-active.svg";
import disburselogoPassive from "../assets/disburselogo-passive.svg";
import empty from "../assets/empty.svg";
import check from "../assets/check.svg";
import govhero from "../assets/govhero.png";
import statsLinkIcon from "../../FARMINNG/assets/statsLinkIcon.svg";
import purplestats from "../../FARMINNG/assets/purpleStat.svg";
import moreinfo from "../../FARMINNG/assets//more-info.svg";
import failMark from "../../../assets/failMark.svg";
import Tooltip from "@material-ui/core/Tooltip";
import ellipse from "../assets/ellipse.svg";
import ellipsegreen from "../assets/ellipsegreen.svg";

import tyHero from "../assets/tyhero.png";
import totalVotesIcon from "../assets/totalVotesIcon.svg";

import { shortAddress } from "../../../functions/shortAddress";
import axios from "axios";

const { new_governanceavax: governance, reward_token, BigNumber } = window;

const LP_AMPLIFY_FACTOR = 1;

let PoolGroupName = Object.freeze({
  AVAX: "0",
});

const stakingPools = [
  {
    logo: "/images/avax.png",
    name: "AVAX Pools",
    group_name: PoolGroupName.AVAX,
    pools: [
      "0x499c588146443235357e9C630A66D6fe0250caA1",
      "0xD8aF0591Be4Fba56e3634C992B7Fe4ff0A90B584",
      "0xBEBE1fe1444a50AC6EE95EA25Ba80ADF5aC7322C",
      "0x79BE220ab2dFcc2f140b59A97bFe6751ed1579B0",
    ],
  },
].map((pools) => {
  pools.pools = pools.pools
    .map((p) => p.toLowerCase())
    .sort()
    .join(",");
  return pools;
});

const AddProposal = (props) => {
  let [formState, setFormState] = useState({
    action: "0", // 0 - disburse or burn, 1 - upgrade governance
    stakingPool: stakingPools[0].pools,
    newGovernance: "",
    newQuorum: "",
    newMinBalance: "",
    text: "",
  });

  const [showModal, setShowModal] = useState(false);

  const setState = (obj) => setFormState({ ...formState, ...obj });
  let { isOwner, connected } = props;

  return (
    <div className="col-12 col-lg-7">
      <div className="d-flex flex-column justify-content-between h-100 w-100">
        <div className="d-flex justify-content-start justify-content-lg-center gap-2 align-items-center my-3 col-12 col-lg-6">
          <h6
            className="submitnewproposal-title"
            style={{ paddingRight: "15px" }}
          >
            <img src={require("../assets/submitwhite.svg").default} alt="" />{" "}
            Submit new proposal
          </h6>
        </div>
        <form className="h-100">
          <div className="d-flex flex-column gap-2 align-items-end justify-content-between h-100">
            <h6 className="initialdesc col-12 col-lg-11">
              <b>Governed by the community</b>
              <br />
              Vote to add more pools, burn tokens, or allocate DYP toward
              grants, strategic partnerships, governance initiatives, and other
              programs.
            </h6>
            <div className="d-flex justify-content-start col-12 col-lg-11">
              <div
                className={
                  connected === false ? "btn disabled-btn" : "btn filledbtn"
                }
                style={{ width: "fit-content" }}
                disabled={connected === false ? true : false}
                onClick={() => {
                  setShowModal(true);
                }}
              >
                Create proposal
              </div>
            </div>
          </div>
        </form>
      </div>
      {showModal === true && (
        <Modal
          visible={showModal}
          modalId="proposal"
          title="proposal"
          setIsVisible={() => {
            setShowModal(false);
          }}
          width="fit-content"
        >
          <div className="d-flex gap-2 flex-column justify-content-between align-items-start">
            <div>
              <label htmlFor="proposal-action" className="d-none">
                Select Action
              </label>
              <div className="d-flex justify-content-between gap-3 align-items-center">
                <div
                  className={
                    formState.action === "0"
                      ? "optionbtn-active"
                      : "optionbtn-passive"
                  }
                >
                  <input
                    type="checkbox"
                    value="0"
                    onChange={(e) => setState({ action: e.target.value })}
                    id="disburseburn"
                    className="d-none"
                  />
                  <label for="disburseburn" className="optiontext">
                    <img
                      src={
                        formState.action === "0"
                          ? disburselogoActive
                          : disburselogoPassive
                      }
                      alt=""
                    />
                    Disburse or Burn
                  </label>
                </div>
                <div
                  className={
                    formState.action === "3"
                      ? "optionbtn-active"
                      : "optionbtn-passive"
                  }
                >
                  <input
                    type="checkbox"
                    value="3"
                    onChange={(e) => setState({ action: e.target.value })}
                    id="freetext"
                    className="d-none"
                  />
                  <label for="freetext" className="optiontext">
                    <img
                      src={
                        formState.action === "3"
                          ? freetextActive
                          : freetextPassive
                      }
                      alt=""
                    />
                    Other / Free Text
                  </label>
                </div>
              </div>
              <select
                value={formState.action}
                onChange={(e) => setState({ action: e.target.value })}
                className="form-control d-none"
                id="proposal-action"
              >
                <option value="0">Disburse or Burn</option>
                {isOwner && <option value="1">Upgrade Governance</option>}
                {isOwner && <option value="2">Change Quorum</option>}
                {isOwner && <option value="4">Change Min Balance</option>}
                <option value="3">Other / Free Text</option>
              </select>
            </div>
            {formState.action == "3" && (
              <div className="pt-3 w-100">
                <textarea
                  style={{
                    minHeight: "150px",
                    width: "100%",
                    background: "#312F69",
                    border: "1px solid #8E97CD",
                    color: "#F7F7FC",
                  }}
                  required
                  className="form-control"
                  type="text"
                  placeholder="Proposal Text"
                  value={formState.text}
                  onChange={(e) => setState({ text: e.target.value })}
                ></textarea>
              </div>
            )}

            {formState.action == "1" && (
              <div className="pt-3">
                <input
                  required
                  className="form-control"
                  type="text"
                  placeholder="New Governance Contract Address"
                  value={formState.newGovernance}
                  onChange={(e) => setState({ newGovernance: e.target.value })}
                />
              </div>
            )}
            {formState.action == "2" && (
              <div className="pt-3">
                <input
                  required
                  className="form-control"
                  type="number"
                  placeholder="New Quorum"
                  value={formState.newQuorum}
                  onChange={(e) => setState({ newQuorum: e.target.value })}
                />
              </div>
            )}

            {formState.action == "4" && (
              <div className="pt-3">
                <input
                  required
                  className="form-control"
                  type="number"
                  placeholder="New Min Balance"
                  value={formState.newMinBalance}
                  onChange={(e) => setState({ newMinBalance: e.target.value })}
                />
              </div>
            )}
            <div className="pt-3 d-flex flex-column gap-2">
              <h6 className="form-bottomtext">
                Submitting a proposal requires a minimum of
                <br />{" "}
                <b>
                  {(props.MIN_BALANCE_TO_INIT_PROPOSAL / 1e18).toFixed(2)} DYP{" "}
                </b>
                Governance Token Balance.
              </h6>
            </div>
            <div className="separator mb-1"></div>
            {["0", "1"].includes(formState.action) && (
              <div className="">
                <label htmlFor="staking-pool" className="d-none">
                  Select Pool
                </label>
                {stakingPools.map((v, i) => (
                  // <option value={v.pools} key={i}>
                  //   {" "}
                  //   {v ? v.name : "DYP"}{" "}
                  // </option>
                  <div key={i}>
                    <input
                      type="checkbox"
                      value={v.pools}
                      onChange={(e) =>
                        setState({ stakingPool: e.target.value })
                      }
                      id="stakingpool"
                      className="d-none"
                    />
                    <label for="stakingpool" className="d-none">
                      <img
                        src={
                          formState.stakingPool === stakingPools[0].pools
                            ? check
                            : empty
                        }
                        alt=""
                      />

                      <img
                        src={avax}
                        alt=""
                        style={{ width: 18, height: 18 }}
                      />
                      {v ? v.name : "DYP"}
                    </label>
                  </div>
                ))}

                <select
                  className="form-control d-none"
                  id="staking-pool"
                  value={formState.stakingPool}
                  onChange={(e) => setState({ stakingPool: e.target.value })}
                >
                  {stakingPools.map((v, i) => (
                    <option value={v.pools} key={i}>
                      {" "}
                      {v ? v.name : "DYP"}{" "}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="d-flex gap-3 align-items-center justify-content-between w-100">
              <button
                className="btn loadmore-btn"
                type="submit"
                onClick={() => {
                  setShowModal(false);
                }}
                style={{ width: "45%" }}
              >
                Cancel
              </button>
              <button
                className={
                  formState.text === "" && formState.action == "3"
                    ? "btn disabled-btn"
                    : "btn filledbtn"
                }
                type="submit"
                onClick={props.onSubmit(formState)}
                disabled={
                  formState.text === "" && formState.action == "3"
                    ? true
                    : false
                }
              >
                SUBMIT PROPOSAL
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const ProposalCard = (props) => (
  <div className="container vault-container d-flex">
    <div className="row vault-row text-start justify-content-between p-1">
      <div
        className="text-center mb-2 d-flex align-items-center gap-3 justify-content-between"
        style={{ gap: 10 }}
      >
        <div className="d-flex justify-content-between gap-2 align-items-center">
          <img
            className="m-0 cardlogo"
            src={
              props.vault
                ? props.vault.logo
                : require("../assets/dyp.svg").default
            }
          />

          <div
            style={{ whiteSpace: "pre-line", gap: 10 }}
            className="p-0 d-flex"
          >
            <span className="vault-name ">
              {props.vault ? props.vault.name : "DYP Proposal"}{" "}
            </span>
          </div>
        </div>
        <div
          className={`${
            props._proposalAction === "3"
              ? "actionwrapper2"
              : props._proposalAction === "1"
              ? "actionwrapper3"
              : "actionwrapper"
          } col-sm-10 text-left`}
        >
          <span
            className={
              props._proposalAction === "3"
                ? "actionText2"
                : props._proposalAction === "1"
                ? "actionText3"
                : "actionText"
            }
          >
            {{
              0: "Disburse / Burn",
              1: "Upgrade Governance",
              2: "Change Quorum",
              3: "Other / Free Text",
              4: "Change Min Balance",
            }[props._proposalAction] || ""}
          </span>
        </div>
      </div>
      <div className="card-bottom-wrapper">
        <div className="text-left ExpireWrapper d-flex flex-column justify-content-start">
          <p className="expiretxt">Expires</p>
          <h6 className="duration-txt small mb-0 ">
            {moment
              .duration(
                props._proposalStartTime * 1e3 +
                  window.config.vote_duration_in_seconds * 1e3 -
                  Date.now()
              )
              .humanize(true) === "a year ago"
              ? "one year ago"
              : moment
                  .duration(
                    props._proposalStartTime * 1e3 +
                      window.config.vote_duration_in_seconds * 1e3 -
                      Date.now()
                  )
                  .humanize(true)}
          </h6>
        </div>
        <div className="avaxchain">
          <span className="chaintext">
            AVAX Chain
            <img src={avax} alt="" className="chainlogo2" />
          </span>
        </div>
      </div>
    </div>
  </div>
);

function getVaultByAddress(contract_address) {
  contract_address = contract_address.toLowerCase();
  let v = window.vaults.filter(
    (v) => v.contract_address.toLowerCase() == contract_address.toLowerCase()
  )[0];
  return v;
}

function getPoolForProposal(proposal) {
  let pools = proposal._stakingPool
    .map((p) => p.toLowerCase())
    .sort()
    .join(",");
  let p = stakingPools.filter((p) => p.pools == pools)[0];
  return p;
}

export default class Governance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proposals: [],
      total_proposals: 0,
      isLoading: false,
      is_wallet_connected: false,
      token_balance: "",
      totalDeposited: "",
      lastVotedProposalStartTime: "",
      QUORUM: "",
      MIN_BALANCE_TO_INIT_PROPOSAL: "",
      coinbase: "0x0000000000000000000000000000000000000111",
      open: false,
      proposalId: undefined,
      showModal: false,
      submitLoading: false,
      proposalData: "",
      submitStatius: "initial",
      showTYModal: false,
    };
  }

  refreshProposals = async () => {
    if (this.state.isLoading && this.state.proposals && this.state.proposals?.length > 0  && this.props.networkId === 43114) return;
    this.setState({ isLoading: true });
    try {
      let total_proposals = Number(await governance.lastIndex());
      let proposals = this.state.proposals;
      let newProposals = [];
      let newProposals2 = [];
      let step = window.config.max_proposals_per_call;
      for (
        let i = total_proposals - proposals?.length;
        i >= Math.max(1, total_proposals - proposals?.length - step + 2);
        i--
      ) {
        const checkproposal = await this.getProposal(i).then();
        if (checkproposal != undefined) {
          newProposals.push(this.getProposal(i));
        } else {
          this.refreshProposals();
        }
      }
      newProposals = await Promise.all(newProposals);
      // newProposals = newProposals.map(p => {
      //     p.vault = getVaultByAddress(p._stakingPool)
      //     return p
      // })
      newProposals2 = proposals.concat(newProposals);
      this.setState({ total_proposals, isLoading: false });
      this.setState({ proposals: newProposals2 });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  refreshDYPBalance = async () => {
    if (this.props.connected === true && this.props.networkId === 43114) {
      try {
        let coinbase = this.props.coinbase;
        await reward_token.balanceOf(coinbase).then((data) => {
          this.setState({
            token_balance: window.web3.utils.fromWei(data, "ether"),
          });
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  refreshBalance = async () => {
    if (this.props.connected === true && this.props.networkId === 43114) {
      let coinbase = this.props.coinbase;
      try {
        let _totalDeposited = governance.totalDepositedTokens(coinbase);
        let _lvsTime = governance.lastVotedProposalStartTime(coinbase);
        let _q = governance.QUORUM();
        let _m = governance.MIN_BALANCE_TO_INIT_PROPOSAL();

        let [
          totalDeposited,
          lastVotedProposalStartTime,
          QUORUM,
          MIN_BALANCE_TO_INIT_PROPOSAL,
        ] = await Promise.all([_totalDeposited, _lvsTime, _q, _m]);

        this.setState({
          totalDeposited,
          lastVotedProposalStartTime,
          QUORUM,
          MIN_BALANCE_TO_INIT_PROPOSAL,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  fetchProposals = async () => {
    await axios
      .get(`https://api.dyp.finance/api/gov-stats`)
      .then((res) => {
        this.setState({ proposalData: res.data });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  getProposal = async (_proposalId) => {
 
    if (this.props.connected === true && _proposalId && this.props.networkId === 43114) {
      let p = await governance.getProposal(_proposalId);
      p.vault = getPoolForProposal(p);
      return p;
    }
  };

  checkConnection = async () => {
    
    if (this.props.connected === true && this.props.networkId === 43114) {
      this.setState({ is_wallet_connected: true });
      let coinbase = this.props.coinbase;
      this.setState({ coinbase: coinbase });
    }
    if (this.props.connected === false) {
      this.setState({ is_wallet_connected: false });
    }
  };

  componentDidMount() {
    this.refreshBalance();
    this.refreshDYPBalance();

    
   this.fetchProposals();
    if ( this.state.proposals && this.state.proposals !== undefined && this.state.proposals?.length == 0 && this.props.connected === true && this.props.networkId === 43114) {
      this.refreshProposals();
    this.getProposal();
 
    }
    this.checkConnection();
    window._refreshBalInterval = setInterval(this.checkConnection, 1000);
    window.gRefBalInterval = setInterval(this.refreshBalance, 7e3);
    window.gRefDYPBalInterval = setInterval(this.refreshDYPBalance, 3000);
  }
  componentWillUnmount() {
    clearInterval(window.gRefBalInterval);
    clearInterval(window.gRefDYPBalInterval);
  }

  async shouldComponentUpdate(nextState) {
    if (nextState.connected !== this.props.connected) {
      await this.refreshProposals();
      return true;
    } else {
      return false;
    }
  }

  handleProposalSubmit = (formState) => (e) => {
    e.preventDefault();
    const min = this.state.MIN_BALANCE_TO_INIT_PROPOSAL.slice(0, 4);
    if (Number(this.state.token_balance) < parseInt(min)) {
      window.alertify.error("Insufficient Governance Token Balance!");
      return;
    }
    let poolGroupName;

    let poolGroup;
    if (
      (poolGroup = stakingPools.filter((p) => {
        return p.pools == formState.stakingPool;
      })[0])
    ) {
      poolGroupName = poolGroup.group_name;
    }

    if (!poolGroupName) {
      window.alertify.error("Invalid pool selected");
      return;
    }

    if (formState.action == "0") {
      governance.proposeDisburseOrBurn(poolGroupName);
    } else if (formState.action == "1") {
      if (!window.web3.utils.isAddress(formState.newGovernance)) {
        window.alertify.error("Invalid Address!");
        return;
      }
      governance.proposeUpgradeGovernance(
        poolGroupName,
        formState.newGovernance
      );
    } else if (formState.action == "2") {
      let newQuorum = formState.newQuorum;
      if (isNaN(newQuorum * 1)) {
        window.alertify.error("Invalid quorum!");
        return;
      }
      newQuorum = new BigNumber(newQuorum).times(1e18).toFixed(0);
      governance.proposeNewQuorum(newQuorum);
    } else if (formState.action == "3") {
      governance.proposeText(formState.text);
    } else if (formState.action == "4") {
      let newMinBalance = formState.newMinBalance;
      if (isNaN(newMinBalance * 1)) {
        window.alertify.error("Invalid quorum!");
        return;
      }
      newMinBalance = new BigNumber(newMinBalance).times(1e18).toFixed(0);
      governance.proposeNewMinBalanceToInitProposal(newMinBalance).then(() => {
        this.setState({ showTYModal: true });
      });
    }
  };

  handleClaim = (e) => {
    e.preventDefault();
    governance.withdrawAllTokens();
  };

  handleProposals = async (e) => {
    e.preventDefault();
    await this.refreshProposals();
  };


  render() {


    let { totalDeposited } = this.state;
    totalDeposited = getFormattedNumber(totalDeposited / 1e18, 6);

    let canWithdrawAll = false;
    let withdrawableTitleText = "";
    let canWithdrawAllAfter =
      this.state.lastVotedProposalStartTime * 1e3 +
      window.config.vote_duration_in_seconds * 1e3;
    if (Date.now() > canWithdrawAllAfter) {
      canWithdrawAll = true;
    } else if (canWithdrawAllAfter) {
      withdrawableTitleText =
        `You'll be able to withdraw ` +
        moment.duration(canWithdrawAllAfter - Date.now()).humanize(true);
    }

    let expireArray = [];
    let expires;
    for (let i = 0; i <= this.state.proposals?.length - 1; i++) {
      let endsOn =
        this.state.proposals[i]?._proposalStartTime * 1e3 +
        window.config.vote_duration_in_seconds * 1e3;

      expires = moment.duration(endsOn - Date.now()).humanize(true);
      expireArray[i] = expires;
    }

    let isOwner =
      String(this.state.coinbase).toLowerCase() ==
      window.config.admin_address.toLowerCase();
    const deviceWidth = window.innerWidth;
    let noVotes = localStorage.getItem("NoVotes");
    
    return (
      <div>
        <div
          className={deviceWidth < 500 ? "container-lg" : "container-lg p-0"}
        >
          <div className="d-flex flex-column flex-xxl-row justify-content-between gap-2 align-items-start">
            <div className="col-12 col-xxl-7">
              <h6 className="govtitle mb-3">Dypius Governance</h6>
              <h6 className="govdesc mb-3">
                DYP tokens represent voting shares in Dypius Governance. The
                introduction of DYP tokens enables shared community ownership of
                a vibrant, diverse, and dedicated governance system which will
                actively guide the protocol toward the future. <br />
                <br />
                DYP holders can vote to add more pools, burn tokens, or create their own unique proposals.
              </h6>
            </div>

            <div className="col-12 col-xxl-4 flex-column d-flex justify-content-between gap-2">
              <div className="d-flex  w-100 justify-content-center gap-2">
                <div className="totalproposals col-4">
                  <img src={eth} alt="" className="chainlogo" />
                  <div className="d-flex flex-column gap-2 justify-content-center align-items-center">
                    <h6 className="chaintitle">Ethereum</h6>
                    <h6 className="totalpoolsnr">
                      {this.state.proposalData.proposals?.eth}
                    </h6>
                    <h6 className="totalproposals-text">Total proposals</h6>
                  </div>
                </div>
                <div className="totalproposals col-4">
                  <img src={bnb} alt="" className="chainlogo" />
                  <div className="d-flex flex-column gap-2 justify-content-center align-items-center">
                    <h6 className="chaintitle">BNB Chain</h6>
                    <h6 className="totalpoolsnr">
                      {this.state.proposalData.proposals?.bsc}
                    </h6>
                    <h6 className="totalproposals-text">Total proposals</h6>
                  </div>
                </div>
                <div className="totalproposals col-4">
                  <img src={avax} alt="" className="chainlogo" />
                  <div className="d-flex flex-column gap-2 justify-content-center align-items-center">
                    <h6 className="chaintitle">Avalanche</h6>
                    <h6 className="totalpoolsnr">
                      {this.state.proposalData.proposals?.avax}
                    </h6>
                    <h6 className="totalproposals-text">Total proposals</h6>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 col-xl-12 flex-column flex-lg-row  mt-5 d-flex justify-content-start justify-content-lg-between align-items-center total-proposals-wrapper position-relative p-3">
                <div className="purplediv" style={{ left: "0" }}></div>
                <div className="d-flex flex-row align-items-center w-100 gap-2">
                  <img src={totalVotesIcon} alt="" />
                  <div className="d-flex flex-column  gap-1">
                    <span className="total-gov-votes">Total</span>
                    <span className="total-gov-votes w-100">
                      Governance Votes
                    </span>
                  </div>
                </div>
                <div className="total-votes">
                  {getFormattedNumber(this.state.proposalData?.totalVotes)}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-lg-row justify-content-between gap-4 gap-lg-2 cardwrapper mt-4 mb-4">
            <div className="govcard1 col-12 col-lg-3">
              <div className="purplediv"></div>
              <div className="d-flex flex-column gap-2">
                <img
                  src={walleticon}
                  alt=""
                  style={{ width: 40, height: 40 }}
                />
                <div className="d-flex justify-content-between gap-2 align-items-baseline position-relative">
                  <h6 className="govcard-title">Connect wallet</h6>
                  <h6 className="govcard-number">1</h6>
                </div>
                <h6 className="govcard-desc">
                Dypius Governance is available on Ethereum, BNB Chain and Avalanche. Connect your wallet to get started.
                </h6>
              </div>
            </div>
            <div className="govcard2 col-12 col-lg-3">
              <div className="greendiv"></div>
              <div className="d-flex flex-column gap-2">
                <img src={copy} alt="" style={{ width: 40, height: 40 }} />
                <div className="d-flex justify-content-between gap-2 align-items-baseline position-relative">
                  <h6 className="govcard-title">Create proposal</h6>
                  <h6 className="govcard-number">2</h6>
                </div>
                <h6 className="govcard-desc">
                Proposals can be for the disbursement or burning of tokens and other user suggestions.
                </h6>
              </div>
            </div>
            <div className="govcard3 col-12 col-lg-3">
              <div className="orangediv"></div>
              <div className="d-flex flex-column gap-2">
                <img src={submit} alt="" style={{ width: 40, height: 40 }} />
                <div className="d-flex justify-content-between gap-2 align-items-baseline position-relative">
                  <h6 className="govcard-title">Submit</h6>
                  <h6 className="govcard-number">3</h6>
                </div>
                <h6 className="govcard-desc">
                Submitting a Governance proposal requires a minimum of 5000 DYP token balance
                </h6>
              </div>
            </div>
          </div>

          <div>
            <h6 className="myDetails-title mb-3">New proposal</h6>
            <div className="d-flex justify-content-center justify-content-lg-end mb-5 gap-5 align-items-center position-relative">
              <img src={govhero} alt="" className="project-banner2" />
              <div
                className="row submitproposal-wrapper gap-4 gap-lg-0"
                id="votingWrapper"
              >
                <AddProposal
                  isOwner={isOwner}
                  connected={this.props.connected}
                  MIN_BALANCE_TO_INIT_PROPOSAL={
                    this.state.MIN_BALANCE_TO_INIT_PROPOSAL
                  }
                  onSubmit={this.handleProposalSubmit}
                  coinbase={this.state.coinbase}
                  handleConnection={() => {
                    this.props.handleConnection();
                  }}
                />
                <div className="mydetails-wrapper col-12 col-lg-4">
                  <div className="d-flex justify-content-between flex-column gap-4 gap-lg-0">
                    <div className="d-flex justify-content-start justify-content-lg-end">
                      {this.props.connected === false ? (
                        <button
                          className="connectbtn btn mb-3"
                          onClick={() => {
                            this.setState({ showModal: true });
                          }}
                        >
                          <img
                            src={require("../assets/wallet-green.svg").default}
                            alt=""
                          />{" "}
                          Connect wallet
                        </button>
                      ) : (
                        <div className="d-flex w-100 gap-2 mb-2">
                          <h6 className="change-chain-text">
                            To change chain
                            <br />
                            go to your wallet*
                          </h6>
                          <div
                            className="avaxchain position-relative"
                            style={{ right: "auto" }}
                          >
                            <span className="chaintext">
                              AVAX Chain
                              <img
                                src={avax}
                                alt=""
                                className="chainlogo2"
                                style={{ top: "-1px" }}
                              />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-between gap-2 align-items-center mb-3">
                      <div className="colored-container">
                        <span className="purpletext">
                          <img
                            src={require("../assets/wallet2.svg").default}
                            alt=""
                          />{" "}
                          My DYP Balance
                        </span>
                        <span className="whitetext">
                        {getFormattedNumber(this.state.token_balance)} DYP
                        </span>
                      </div>
                      <div className="colored-container">
                        <span className="purpletext">
                          <img
                            src={require("../assets/votes.svg").default}
                            alt=""
                          />
                          My number of votes
                        </span>
                        <span className="whitetext">
                          {noVotes == null ? 0 : noVotes} DYP
                        </span>
                      </div>
                    </div>

                    <form className="" onSubmit={this.handleClaim}>
                      <div className="form-group2">
                        <label
                          htmlFor="deposit-amount"
                          className="text-left d-block totalvoting"
                        >
                          Total in voting
                        </label>
                        <div className="d-flex justify-content-between align-items-center gap-5">
                          <div className="form-row totalVotingButton">
                            <div>
                              <span className="dypamounttext">
                                {totalDeposited} DYP
                              </span>
                            </div>
                          </div>

                          <button
                            title={withdrawableTitleText}
                            disabled={canWithdrawAll}
                            className="btn withdrawButton"
                            type="submit"
                          >
                            Withdraw all
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            {this.state.showModal && (
              <WalletModal
                show={this.state.showModal}
                handleClose={() => {
                  this.setState({ showModal: false });
                }}
                handleConnection={() => {
                  this.props.handleConnection();
                  this.setState({ showModal: false });
                }}
              />
            )}
          </div>
          <div
            className="row pb-5 m-0"
            style={{ flexDirection: "column-reverse" }}
          >
            <div className={`col-lg-12 p-0 `}>
              {/* {this.state.is_wallet_connected === false && (
                <div className="errorWrapper">
                  <span>
                    You need to connect your wallet in order to see the
                    proposals
                  </span>
                </div>
              )} */}

              {this.props.connected === true ? (
                <div className="mb-4">
                  <h6 className="myDetails-title mb-3">All proposals</h6>

                  <div
                    className="accordion  governanceWrapper"
                    id="accordionExample"
                  >
                    {this.state.proposals.map((props, index) => (
                      <div
                        className="accordion-item position-relative"
                        key={index}
                        style={{ border: "none" }}
                      >
                        {expireArray[index].includes("ago") ? (
                          <img
                            src={require("../assets/expired.png").default}
                            alt=""
                            className="acordionstate"
                          />
                        ) : (
                          <img
                            src={require("../assets/new.png").default}
                            alt=""
                            className="acordionstate"
                            style={{scale: '0.67'}}
                          />
                        )}
                        <div className="accordion-header" id="headingOne">
                          <button
                            className="accordion-button collapsed d-flex flex-column position-relative "
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${"collapse" + index}`}
                            aria-expanded="true"
                            aria-controls={"collapse" + index}
                            onClick={() => {
                              this.setState({
                                proposalId: this.state.total_proposals - index,
                              });
                            }}
                            style={{
                              margin: "auto",
                              paddingLeft: 10,
                              paddingRight: 10,
                            }}
                          >
                            <div className="purplediv"></div>
                            <ProposalCard {...props} />
                          </button>
                        </div>

                        <div
                          id={"collapse" + index}
                          className="accordion-collapse collapse"
                          aria-labelledby={"collapsed" + index}
                          data-bs-parent="#accordionExample"
                        >
                          <div className="accordion-body">
                            <ProposalDetails
                              refreshBalance={this.refreshBalance}
                              proposalId={
                                this.state.proposalId === undefined
                                  ? 0
                                  : this.state.proposalId
                              }
                              connected={this.props.connected}
                              coinbase ={this.props.coinbase}
                              networkId ={this.props.networkId}

                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="governanceWrapper">
                  <div className="emptycard"></div>
                  <div className="emptycard"></div>
                  <div className="emptycard"></div>
                </div>
              )}

              <div className="text-center">
                {this.state.proposals?.length < this.state.total_proposals &&
                  this.state.is_wallet_connected === true && (
                    <button
                      className="btn loadmore-btn"
                      style={{
                        fontSize: ".8rem",
                        background: "transparent",
                      }}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        this.refreshProposals();
                      }}
                    >
                      {this.state.isLoading ? "Loading..." : "Load more"}
                    </button>
                  )}

                {!this.state.isLoading &&
                  this.state.proposals?.length == 0 &&
                  this.state.is_wallet_connected === true && (
                    <div className="pt-5">
                      <p>No Proposals to Display</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {this.state.showTYModal === true && (
          <Modal
            visible={this.state.showTYModal}
            modalId="tymodal"
            title="ty"
            setIsVisible={() => {
              this.setState({ showTYModal: false });
            }}
            width="fit-content"
          >
            <img src={tyHero} alt="" className="tyHero" />
            <h6 className="ty-title">Thank you</h6>
            <h6 className="ty-subtitle">
              Your proposal submitted successfully
            </h6>
          </Modal>
        )}
      </div>
    );
  }
}

class ProposalDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      depositAmount: "",
      withdrawAmount: "",
      depositedTokens: "",
      token_balance: "",
      coinbase: "",
      totalDeposited: "",
      option: "1", // 0, 1.  0 = yes/disburse, 1 = no/burn
      lastVotedProposalStartTime: "",
      QUORUM: "",
      MIN_BALANCE_TO_INIT_PROPOSAL: "",
      is_wallet_connected: false,
      is_proposal_executible: false,
      proposal: {},
      z: false,
      depositLoading: false,
      depositStatus: "initial",
      removeLoading: false,
      removeStatus: "initial",
      errorMsg: "",
      errorMsg2: "",
      showWalletModal: false,
    };
  }
  componentDidMount() {
    this.refreshBalance();
    this.checkConnection();
    this.refreshProposal();
    window._refreshVoteBalInterval = setInterval(this.refreshProposal, 3000);
    window._refreshBalInterval = setInterval(this.checkConnection, 3000);
  }

  componentWillUnmount() {
    clearInterval(window._refreshVoteBalInterval);
  }

  refreshProposal = () => {
    if(this.props.proposalId  && this.props.networkId === 43114)
   { this.getProposal(this.props.proposalId)
      .then((proposal) => this.setState({ proposal }))
      .catch(console.error);}
  };

  getProposal = async (_proposalId) => {
    if(_proposalId && this.props.networkId === 43114)
   { let p = await governance.getProposal(_proposalId);
    p.vault = getPoolForProposal(p);
    return p;}
  };

  handleApprove = async (e) => {
    // e.preventDefault();
    this.setState({ depositLoading: true });

    let amount = this.state.depositAmount;
    amount = new BigNumber(amount).times(1e18).toFixed(0);
    await reward_token
      .approve(governance._address, amount)
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
  handleAddVote = async (e) => {
    this.setState({ depositLoading: true });

    let amount = this.state.depositAmount;
    amount = new BigNumber(amount).times(1e18).toFixed(0);
    await governance
      .addVotes(this.props.proposalId, this.state.option, amount)
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
        }, 8000);
      });
  };

  handleRemoveVote = async (e) => {
    // e.preventDefault();
    this.setState({ removeLoading: true });

    let amount = this.state.withdrawAmount;
    amount = new BigNumber(amount).times(1e18).toFixed(0);
    await governance
      .removeVotes(this.props.proposalId, amount)
      .then(() => {
        this.setState({ removeLoading: false, removeStatus: "success" });
      })
      .catch((e) => {
        this.setState({ removeLoading: false, removeStatus: "fail" });
        this.setState({ errorMsg2: e?.message });
        setTimeout(() => {
          this.setState({
            removeStatus: "initial",
            withdrawAmount: "",
            errorMsg2: "",
          });
        }, 8000);
      });
  };

  handleClaim = (e) => {
    e.preventDefault();
    governance.withdrawAllTokens();
  };

  handleSetMaxDeposit = (e) => {
    e.preventDefault();
    this.setState({
      depositAmount: new BigNumber(this.state.token_balance)
        .div(1e18)
        .toFixed(18),
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

  checkConnection = async () => {
   
    
    if (this.props.connected === true  && this.props.networkId === 43114) {
      this.setState({ is_wallet_connected: true });
      let coinbase = this.props.coinbase;
      this.setState({ coinbase: coinbase });
    }
    if (this.props.connected === false) {
      this.setState({ is_wallet_connected: false });
    }
  };

  refreshBalance = async () => {
    if (this.props.connected === true && this.props.networkId === 43114) {
      this.refreshProposal();

      let coinbase = this.props.coinbase;
      if(coinbase && this.props.networkId === 43114)
     { try {
        let _rBal = reward_token.balanceOf(coinbase);
        let _myVotes = governance.votesForProposalByAddress(
          coinbase,
          this.props.proposalId
        );
        let _totalDeposited = governance.totalDepositedTokens(coinbase);
        let _option = governance.votedForOption(
          coinbase,
          this.props.proposalId
        );
        let _lvsTime = governance.lastVotedProposalStartTime(coinbase);
        let _isExecutible = governance.isProposalExecutible(
          this.props.proposalId
        );
        let _q = governance.QUORUM();
        let _m = governance.MIN_BALANCE_TO_INIT_PROPOSAL();

        let [
          token_balance,
          depositedTokens,
          totalDeposited,
          option,
          lastVotedProposalStartTime,
          is_proposal_executible,
          QUORUM,
          MIN_BALANCE_TO_INIT_PROPOSAL,
        ] = await Promise.all([
          _rBal,
          _myVotes,
          _totalDeposited,
          _option,
          _lvsTime,
          _isExecutible,
          _q,
          _m,
        ]);

        this.setState({
          token_balance,
          depositedTokens,
          totalDeposited,
          lastVotedProposalStartTime,
          QUORUM,
          MIN_BALANCE_TO_INIT_PROPOSAL,
          is_proposal_executible:
            is_proposal_executible &&
            ["0", "1", "2", "4"].includes(this.state.proposal._proposalAction),
        });

        if (this.state.option == "" || Number(depositedTokens) > 0)
          this.setState({ option });
      } catch (e) {
        console.error(e);
      }}
    }
  };

  getOptionText = (option) => {
    if (this.state.proposal._proposalAction == "0") {
      return { 0: "DISBURSE", 1: "BURN" }[option];
    }
    return { 0: "YES", 1: "NO" }[option];
  };

  handleSetOption = (option) => {
    if (Number(this.state.depositedTokens) > 0) return;
    this.setState({ option });
    localStorage.setItem(
      "NoVotesAvax",
      getFormattedNumber(this.state.proposal._optionTwoVotes / 1e18, 6)
    );
  };

  handleExecute = () => {
    governance.executeProposal(this.props.proposalId);
  };

  render() {
    let { coinbase, token_balance, proposal, totalDeposited, depositedTokens } =
      this.state;

    if (!proposal._proposalId) return "";

    token_balance = getFormattedNumber(token_balance / 1e18, 6);
    totalDeposited = getFormattedNumber(totalDeposited / 1e18, 6);

    let optionOneVotes = proposal._optionOneVotes;
    let optionTwoVotes = proposal._optionTwoVotes;
    let action = proposal._proposalAction;

    let actionText =
      {
        0: "Disburse / Burn",
        1: "Upgrade Governance",
        2: "Change Quorum",
        3: "Other / Free Text",
        4: "Change Min Balance",
      }[action] || "";

    optionOneVotes = getFormattedNumber(optionOneVotes / 1e18, 6);
    optionTwoVotes = getFormattedNumber(optionTwoVotes / 1e18, 6);
    depositedTokens = getFormattedNumber(depositedTokens / 1e18, 6);

    let endsOn =
      proposal._proposalStartTime * 1e3 +
      window.config.vote_duration_in_seconds * 1e3;

    let expires = moment.duration(endsOn - Date.now()).humanize(true);

    let canRemoveVotes = false;

    if (Date.now() < endsOn) {
      canRemoveVotes = true;
    }

    let canWithdrawAll = false;
    let withdrawableTitleText = "";
    let canWithdrawAllAfter =
      this.state.lastVotedProposalStartTime * 1e3 +
      window.config.vote_duration_in_seconds * 1e3;
    if (Date.now() > canWithdrawAllAfter) {
      canWithdrawAll = true;
    } else if (canWithdrawAllAfter) {
      withdrawableTitleText =
        `You'll be able to withdraw ` +
        moment.duration(canWithdrawAllAfter - Date.now()).humanize(true);
    }

    return (
      <div className="token-staking">
        <div className="d-flex flex-column justify-content-between">
          <div className="proposalWrapper">
            <div className="row token-staking-form">
              <div className="col-12">
                <div className="activewrapper">
                  <div className="d-flex align-items-center justify-co ntent-between gap-5">
                    <h6
                      className={
                        expires.includes("ago")
                          ? "expiredtxt"
                          : "activetxt position-relative activetxt-vault"
                      }
                    >
                      <img
                        src={expires.includes("ago") ? ellipse : ellipsegreen}
                        alt=""
                        className="position-relative"
                      />
                      {expires.includes("ago") ? "Expired" : "Active"}
                    </h6>
                  </div>
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <div
                      onClick={() => {
                        this.setState({ open: true });
                      }}
                    >
                      <h6 className="bottomitems">
                        <img src={purplestats} alt="" />
                        Stats
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="d-flex  justify-content-between gap-4 mt-4">
                  <h6 className="start-title">Start Governance</h6>

                  {this.state.is_wallet_connected === false ? (
                    <button
                      className="connectbtn btn"
                      style={{ width: "fit-content" }}
                      onClick={() => {
                        this.setState({ showWalletModal: true });
                      }}
                    >
                      <img
                        src={require("../assets/wallet-green.svg").default}
                        alt=""
                      />
                      Connect wallet
                    </button>
                  ) : (
                    <div className="addressbtn btn">
                      <Address a={this.state.coinbase} chainId={43114} />
                    </div>
                  )}
                </div>

                <div className="mt-4 otherside w-100">
                  <div className="form-group">
                    <div className="d-flex justify-content-between gap-2 align-items-center">
                      <div className="d-flex justify-content-between gap-4 align-items-center flex-column flex-lg-row">
                        <label
                          htmlFor="deposit-amount"
                          className="d-block text-left addvotestxt"
                        >
                          Add votes
                        </label>
                        <h6 className="mybalance-text">
                          Balance:
                          <b>{token_balance} DYP</b>
                        </h6>
                      </div>
                      <Tooltip
                        placement="top"
                        title={
                          <div className="tooltip-text">
                            {
                              "Add votes to the governance pool.  The more you contribute, the more likely it will be for your vote to make an impact. Every vote counts!"
                            }
                          </div>
                        }
                      >
                        <img src={moreinfo} alt="" />
                      </Tooltip>
                    </div>
                    <div className="d-flex  flex-column flex-xxl-row flex-lg-row flex-md-row gap-2 align-items-center justify-content-between mt-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          value={
                            Number(this.state.depositAmount) > 0
                              ? this.state.depositAmount * LP_AMPLIFY_FACTOR
                              : this.state.depositAmount
                          }
                          onChange={(e) =>
                            this.setState({
                              depositAmount:
                                Number(e.target.value) > 0
                                  ? e.target.value / LP_AMPLIFY_FACTOR
                                  : e.target.value,
                            })
                          }
                          className="styledinput"
                          style={{ width: "120px" }}
                          placeholder="0"
                          type="text"
                        />

                        <button
                          className="btn maxbtn"
                          style={{ cursor: "pointer" }}
                          onClick={this.handleSetMaxDeposit}
                        >
                          MAX
                        </button>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={() => this.handleSetOption("0")}
                          className={
                            this.state.option == "0"
                              ? "emptybtnactive"
                              : "emptybtnpassive"
                          }
                          type="button"
                        >
                          <img
                            src={this.state.option == "0" ? check : empty}
                            alt=""
                          />

                          {this.getOptionText("0")}
                        </button>

                        <button
                          onClick={() => this.handleSetOption("1")}
                          className={
                            this.state.option == "1"
                              ? "emptybtnactive"
                              : "emptybtnpassive"
                          }
                          type="button"
                        >
                          <img
                            src={this.state.option == "1" ? check : empty}
                            alt=""
                          />
                          {this.getOptionText("1")}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="row justify-content-center">
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
                          ? this.handleAddVote()
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
                        <>Add votes</>
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
              <div className="mt-4 col-12">
                <div className="otherside w-100">
                  <div className="form-group">
                    <div className="d-flex justify-content-between gap-2 align-items-center">
                      <div className="d-flex justify-content-between gap-4 align-items-center flex-column flex-lg-row">
                        <label
                          htmlFor="deposit-amount"
                          className="d-block text-left addvotestxt"
                        >
                          REMOVE VOTES
                        </label>
                      </div>
                      <Tooltip
                        placement="top"
                        title={
                          <div className="tooltip-text">
                            {
                              "Remove votes from the governance pool. You have the possibility to remove a part or all of them."
                            }
                          </div>
                        }
                      >
                        <img src={moreinfo} alt="" />
                      </Tooltip>
                    </div>

                    <div className="d-flex align-items-center gap-3 justify-content-between flex-column flex-lg-row mt-3">
                      <div className="d-flex align-items-center gap-2 ">
                        <input
                          value={
                            Number(this.state.withdrawAmount) > 0
                              ? this.state.withdrawAmount * LP_AMPLIFY_FACTOR
                              : this.state.withdrawAmount
                          }
                          onChange={(e) =>
                            this.setState({
                              withdrawAmount:
                                Number(e.target.value) > 0
                                  ? e.target.value / LP_AMPLIFY_FACTOR
                                  : e.target.value,
                            })
                          }
                          className="styledinput"
                          style={{ width: "120px" }}
                          placeholder="0"
                          type="text"
                        />
                        <button
                          className="btn maxbtn"
                          style={{ cursor: "pointer" }}
                          onClick={this.handleSetMaxWithdraw}
                        >
                          MAX
                        </button>
                      </div>
                      <button
                        style={{ width: "fit-content" }}
                        disabled={
                          this.state.withdrawAmount === "" ||
                          this.state.removeLoading === true ||
                          this.state.removeStatus === "success"
                            ? true
                            : false
                        }
                        className={`btn filledbtn ${
                          this.state.withdrawAmount === "" &&
                          this.state.removeStatus === "initial" &&
                          "disabled-btn"
                        } ${
                          this.state.removeStatus === "deposit" ||
                          this.state.removeStatus === "success"
                            ? "success-button"
                            : this.state.removeStatus === "fail"
                            ? "fail-button"
                            : null
                        } d-flex justify-content-center align-items-center gap-2`}
                        onClick={() => {
                          this.handleRemoveVote();
                        }}
                      >
                        {this.state.removeLoading ? (
                          <div
                            class="spinner-border spinner-border-sm text-light"
                            role="status"
                          >
                            <span class="visually-hidden">Loading...</span>
                          </div>
                        ) : this.state.removeStatus === "initial" ? (
                          <>Remove</>
                        ) : this.state.removeStatus === "success" ? (
                          <>Success</>
                        ) : (
                          <>
                            <img src={failMark} alt="" />
                            Failed
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {this.state.errorMsg2 && (
                    <h6 className="errormsg">{this.state.errorMsg2}</h6>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pl-0">
            {proposal._proposalAction == "3" && (
              <div className="l-box proposal-details-wrapper">
                <div className="table-responsive">
                  <h6 className="proposal-details-title">PROPOSAL DETAILS</h6>
                  <p className="l-proposal-text">
                    <td colSpan> {proposal._proposalText} </td>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {this.state.open === true && (
          <Modal
            visible={this.state.open}
            modalId="statsmodal"
            title="stats"
            setIsVisible={() => {
              this.setState({ open: false });
            }}
            width="fit-content"
          >
            <div className="stats-container my-4">
              <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                <span className="stats-card-title">{`My ${this.getOptionText(
                  this.state.option
                )} Votes`}</span>
                <h6 className="stats-card-content">{depositedTokens} DYP</h6>
              </div>
              <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                <span className="stats-card-title">Proposal Action</span>
                <h6 className="stats-card-content">{actionText}</h6>
              </div>
              <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                <span className="stats-card-title">Expires</span>
                <h6 className="stats-card-content">{expires}</h6>
              </div>
              <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                <span className="stats-card-title">My DYP Balance</span>
                <h6 className="stats-card-content">{token_balance} DYP</h6>
              </div>
              <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                <span className="stats-card-title">
                  {this.getOptionText("0")} Votes
                </span>
                <h6 className="stats-card-content">{optionOneVotes} DYP</h6>
              </div>
              <div className="stats-card p-4 d-flex flex-column mx-auto w-100">
                <span className="stats-card-title">
                  {this.getOptionText("1")} Votes
                </span>
                <h6 className="stats-card-content">{optionTwoVotes} DYP</h6>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between gap-1 mb-3">
              <div className="d-flex flex-column gap-1">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://github.com/dypfinance/Avalanche-Bridge-and-Farming-contracts/tree/main/Audits`}
                  className="stats-link"
                >
                  Audit <img src={statsLinkIcon} alt="" />
                </a>
              </div>
              <div className="d-flex align-items-center gap-1 justify-content-between">
                <span
                  style={{
                    fontWeight: "400",
                    fontSize: "12px",
                    lineHeight: "18px",
                    color: "#C0C9FF",
                  }}
                >
                  Contract Address
                </span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${window.config.snowtrace_baseURL}/address/${governance._address}`}
                  className="stats-link"
                >
                  {shortAddress(governance._address)}{" "}
                  <img src={statsLinkIcon} alt="" />
                </a>
              </div>
              <div className="d-flex align-items-center gap-1 justify-content-between">
                <span
                  style={{
                    fontWeight: "400",
                    fontSize: "12px",
                    lineHeight: "18px",
                    color: "#C0C9FF",
                  }}
                >
                  My Address
                </span>

                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${window.config.snowtrace_baseURL}/address/${this.state.coinbase}`}
                  className="stats-link"
                >
                  {shortAddress(this.state.coinbase)}{" "}
                  <img src={statsLinkIcon} alt="" />
                </a>
              </div>
            </div>
            <div className="separator"></div>
            <h6 className="footertext">
              Proposals may be executed within <b>3 days</b> after voting ends.
              Quorum requirement is a minimum of <b>25000.00 DYP</b>, proposals
              with winning votes less than QUORUM will not be executed. Disburse
              proposals will disburse a maximum amount of DYP with a{" "}
              <b>-2.5% Price Impact</b>.
            </h6>
          </Modal>
        )}

        {this.state.showWalletModal && (
          <WalletModal
            show={this.state.showWalletModal}
            handleClose={() => {
              this.setState({ showWalletModal: false });
            }}
            handleConnection={() => {
              // this.props.handleConnection();
              this.setState({ showWalletModal: false });
            }}
          />
        )}
      </div>
    );
  }
}
