import React from "react";
import moment from "moment";
import DataTable, { createTheme } from "react-data-table-component";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavLink } from "react-router-dom";
import getProcessedTransactions from "../../functions/get-processed-transactions";
// import {getProcessedTransactionsETH} from "../../functions/get-processed-transactions";
import getFormattedNumber from "../../functions/get-formatted-number";
import ethlogo from "../../assets/ethlogo.svg";
import bnblogo from "../../assets/bnblogo.svg";
import avaxlogo from "../../assets/avaxlogo.svg";
import BigSwapExplorer from "../big-swap-explorer";
import TopTokens from "../top-tokens";
import Farms from "../farms";
import ethPools from '../../assets/ethPools.png'
import bnbPools from '../../assets/bnbPools.png'
import avaxPools from '../../assets/avaxPools.png'
import "./table.css";
import { Tooltip } from "@material-ui/core";

const Circular = () => (
  // we need to add some padding to circular progress to keep it from activating our scrollbar
  <div style={{ padding: "60px" }}>
    <CircularProgress color="inherit" size={75} />
  </div>
);

createTheme("solarized", {
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(0,0,0,.12)",
  },
  background: {
    default: "transparent",
  },
  context: {
    background: "transparent" || "#E91E63",
    text: "#FFFFFF",
  },
  divider: {
    default: "rgba(81, 81, 81, 1)",
  },
  button: {
    default: "#FFFFFF",
    focus: "rgba(255, 255, 255, .54)",
    hover: "rgba(255, 255, 255, .12)",
    disabled: "rgba(255, 255, 255, .18)",
  },
  sortFocus: {
    default: "rgba(255, 255, 255, .54)",
  },
  selected: {
    default: "rgba(0, 0, 0, .7)",
    text: "#FFFFFF",
  },
  highlightOnHover: {
    default: "rgba(0, 0, 0, .7)",
    text: "#FFFFFF",
  },
  striped: {
    default: "rgba(0, 0, 0, .87)",
    text: "#FFFFFF",
  },
});

export default class PoolExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ethPrice: "...",
      gasPrice: "...",
      processedTransactions: [],
      filteredTransactions: [],
      isLoading: true,
      screen: "pool",
      filteredByTokenId: "",
      filteredByTxnType: "", // 'burn' | 'mint' | ''
      filteredByTokenSymbol: ""
    };
  }

  componentDidMount() {
    this.fetchTransactions();
    window.scrollTo(0, 0)
  }

  async componentDidUpdate(prevProps, prevState) {
    if(prevProps.networkId != this.props.networkId){
      this.setState({
        isLoading: true,
        ethPrice: "...",
        processedTransactions: [],
        filteredTransactions: []
      });
      await window.wait(1000);
      await this.fetchTransactions().then();
    }

    if(prevState.screen != this.state.screen){
      this.setState({filteredByTokenSymbol: ""})
      this.setState({
        filteredByTokenSymbol: "",
        filteredTransactions: JSON.parse(
            JSON.stringify(this.state.processedTransactions)
        ),
      });
    }
  }

  fetchTransactions = async () => {

    try {

      let network
      this.props.networkId == 1 ? network = 'ethereum' : network = 'avalanche'
      let transactions = await getProcessedTransactions(network);

      // TODO: Filter this to last 4 hour transactions once synced
      let filteredTransactions = transactions.transactions
          .filter(txn => txn.timestamp*1e3 >= Date.now() - 4 * 60 * 60 * 1000)
      this.setState({
        processedTransactions: filteredTransactions,
        filteredTransactions: filteredTransactions,
        ethPrice: transactions.ethPrice,
      });
    } catch (e) {
      console.log(e)
    }
    this.setState({isLoading: false});
  };

  filterByTokenId = (tokenId) => {
    if (!tokenId) {
      this.setState({
        filteredByTokenId: "",
        filteredTransactions: JSON.parse(
          JSON.stringify(this.state.processedTransactions)
        ),
      });
      return;
    }
    let filteredTransactions = JSON.parse(
      JSON.stringify(this.state.processedTransactions)
    );
    filteredTransactions = filteredTransactions.filter(
      (txn) => txn.tokenId == tokenId
    );
    this.setState({ filteredTransactions, filteredByTokenId: tokenId });
  };

  filterByTxnType = (txnType) => {
    if (!txnType) {
      this.setState({
        filteredByTxnType: "",
        filteredTransactions: JSON.parse(
          JSON.stringify(this.state.processedTransactions)
        ),
      });
      return;
    }
    let filteredTransactions = JSON.parse(
      JSON.stringify(this.state.processedTransactions)
    );
    filteredTransactions = filteredTransactions.filter(
      (txn) => txn.type == txnType
    );
    this.setState({ filteredTransactions, filteredByTxnType: txnType });
  };

  filterByTokenSymbol = (tokenSymbol) => {
    if (!tokenSymbol) {
      this.setState({
        filteredByTokenSymbol: "",
        filteredTransactions: JSON.parse(
          JSON.stringify(this.state.processedTransactions)
        ),
      });
      return;
    }
    let filteredTransactions = JSON.parse(
      JSON.stringify(this.state.processedTransactions)
    );
    filteredTransactions = filteredTransactions.filter((txn) =>
      String(txn.tokenSymbol)
        .toLowerCase()
        .startsWith(tokenSymbol.toLowerCase())
    );
    this.setState({ filteredTransactions, filteredByTokenSymbol: tokenSymbol });
  };

  GetDataTable = () => {
    let now = Date.now();

    const columns = [
      {
        name: "Token",
        minWidth: "200px",
        selector: "tokenSymbol",
        sortable: true,
        cell: (txn) => (
          <div class="token">

            {/* <img src="/assets/img/icon.svg" alt="" /> */}
            <a
              className="token-link"
              rel="noopener noreferrer"
              target="_blank"
              href={
                this.props.networkId === 1
                  ? `https://etherscan.io/address/${txn.tokenId}`
                  : `https://cchain.explorer.avax.network/address/${txn.tokenId}`
              }
            >
              {txn.tokenSymbol}
            </a>
            <img src="/assets/img/link.svg" alt="" />
          </div>
        ),
      },
      {
        name: "Time",
        selector: "timestamp",
        sortable: true,
        cell: (txn) => (
          <td title={new Date(txn.timestamp * 1e3)}>
            {moment.duration(txn.timestamp * 1e3 - now).humanize(true)}
          </td>
        ),
      },
      {
        name: "Actions",
        minWidth: "165px",
        cell: (txn) => (
          <div className="l-table-actions">
            <a
              onClick={(e) => {
                e.preventDefault();
                this.filterByTokenId(
                  this.state.filteredByTokenId == "" ? txn.tokenId : ""
                );
              }}
              title="Filter by token"
              href="#"
            >
              <img
                className="filter-actions"
                style={{
                  background:
                    this.state.filteredByTokenId == txn.tokenId
                      ? "red"
                      : "inherit",
                }}
                src={`${
                  this.state.filteredByTokenId == txn.tokenId
                    ? "/assets/img/times.svg"
                    : "/assets/img/filter.svg"
                }`}
                width="18"
                alt=""
              />
            </a>
            <a
              rel="noopener noreferrer"
              target="_blank"
              title={
                this.props.networkId === 1
                  ? "Buy at Uniswap"
                  : "Buy at Pangolin"
              }
              href={
                this.props.networkId === 1
                  ? `https://app.uniswap.org/#/swap?outputCurrency=${txn.tokenId}`
                  : `https://app.pangolin.exchange/#/swap?outputCurrency=${txn.tokenId}`
              }
            >
              <img
                className="icon-bg-white-rounded"
                src={
                  this.props.networkId === 1
                    ? "/images/uniswap-logo-home.png"
                    : "/images/pangolin.png"
                }
                width="18"
                alt=""
              />
            </a>
            <a
              rel="noopener noreferrer"
              target="_blank"
              title={txn.id.split("-")[0]}
              href={
                this.props.networkId === 1
                  ? `https://etherscan.io/tx/${txn.id.split("-")[0]}`
                  : `https://cchain.explorer.avax.network/tx/${
                      txn.id.split("-")[0]
                    }`
              }
            >
              <img
                className="icon-bg-white-rounded"
                src={
                  this.props.networkId === 1
                    ? "/images/etherscan.png"
                    : "/images/cchain.png"
                }
                width="18"
                alt=""
              />
            </a>
            {/* <a rel='noopener noreferrer' target="_blank" title="Blocked Liquidity" href={`https://www.unicrypt.network/amm/uni/pair/${txn.pairId}`}><img className='icon-bg-white-rounded' src="/images/unicrypt_v3.svg" width="18" alt="" /></a> */}
            <NavLink
              title="Pair Explorer"
              to={`/pair-explorer/${txn.pairId}`}
              onClick={() => {
                window.location.replace(`/pair-explorer/${txn.pairId}`);
              }}
            >
              <img
                className="icon-bg-white-rounded"
                src="/assets/img/compass-actions.svg"
                alt=""
              />
            </NavLink>
            <NavLink title="DYP Locker" to={`/locker/${txn.pairId}`}>
              <img
                className="icon-bg-white-rounded"
                src="/assets/img/lock.svg"
                alt=""
              />
            </NavLink>
          </div>
        ),
      },
      {
        name: "Type",
        minWidth: "165px",
        selector: "type",
        sortable: true,
        cell: (txn) => (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={
              this.props.networkId === 1
                ? `https://v2.info.uniswap.org/pair/${txn.pairId}`
                : `https://cchain.explorer.avax.network/address/${txn.pairId}`
            }
          >
            <span
              className={`type-${txn.type == "burn" ? "danger" : "light"} p-2`}
            >
              {txn.type == "burn" ? "Remove Liquidity" : "Added Liquidity"}
            </span>
          </a>
        ),
      },
      {
        name: "Token Price USD",
        selector: "tokenPerEth",
        sortable: true,
        format: (txn) =>
          `$${getFormattedNumber(txn.tokenPerEth * this.state.ethPrice, 4)}`,
      },
      {
        name: "Total Value",
        selector: "amountUSD",
        sortable: true,
        format: (txn) => `$${getFormattedNumber(txn.amountUSD, 2)}`,
      },
      {
        name: "Token Amount",
        selector: "tokenAmount",
        sortable: true,
        format: (txn) =>
          `${getFormattedNumber(txn.tokenAmount, 4)} ${txn.tokenSymbol}`,
      },
      {
        name: this.props.networkId === 1 ? "ETH Amount" : "AVAX Amount",
        selector: "ethAmount",
        sortable: true,
        format: (txn) =>
          this.props.networkId === 1
            ? `${getFormattedNumber(txn.ethAmount, 4)} ETH`
            : `${getFormattedNumber(txn.ethAmount, 4)} AVAX`,
      },
      {
        name: "Created on",
        minWidth: "160px",
        selector: "pairCreationTimestamp",
        sortable: true,
        cell: (txn) => (
          <div
            class="created-on"
            title={new Date(txn.pairCreationTimestamp * 1e3)}
          >
            <img src="assets/img/clock.svg" />

            {moment
              .duration(txn.pairCreationTimestamp * 1e3 - now)
              .humanize(true)}
          </div>
        ),
      },
    ];
    return (
      <DataTable
        progressComponent={<Circular />}
        compact={true}
        keyField="key"
        theme={this.props.theme == "theme-white" ? "light" : "solarized"}
        persistTableHead={false}
        progressPending={this.state.isLoading}
        fixedHeader={true}
        pagination={true}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[50, 100, 250, 500]}
        columns={columns}
        data={this.state.filteredTransactions}
      />
    );
  };

  render() {
    return (
      <div className="container-lg p-0">
        <div className="d-flex flex-column gap-3">
                <h2 className="launchpad-hero-title">Pool Explorer</h2>
                <p className="launchpad-hero-desc">
                Search new or existing liquidity pools
                </p>

          </div>
        <div className="row flex-colum flex-lg-row gap-5 gap-lg-0 justify-content-between align-items-center my-4">
          <div className="col-12 col-lg-4">
          <img src={this.state.destinationChain === "eth"? ethPools : this.state.destinationChain === 'bnb' ? bnbPools : this.state.destinationChain === "avax" ? avaxPools : ethPools} alt="" />

          </div>
          <div className="col-12 col-lg-5 col-xl-4 position-relative">
              <p
                className="launchpad-hero-desc position-absolute"
                style={{ fontSize: 12, top: "-27px" }}
              >
                Change network (view purposes only)
              </p>
              <div
                className="d-flex justify-content-around align-items-center"
                style={{
                  background: "#312F69",
                  padding: "10px",
                  borderRadius: "12px",
                  boxShadow: "0px 32px 64px rgba(17, 17, 17, 0.12)",
                }}
              >
                <div
                  className={
                    this.props.networkId === 1
                      ? "optionbtn-active"
                      : "optionbtn-passive"
                  }
                  onClick={() => {
                    this.setState({
                      destinationChain: "eth",
                    });
                    this.props.onSelectChain("eth");


                  }}
                >
                  <h6 className="optiontext">
                    <img src={ethlogo} alt="" /> Ethereum
                  </h6>
                </div>
                <Tooltip
                        placement="top"
                        title={
                          <div className="tooltip-text">{"Coming Soon!"}</div>
                        }
                      >
                       <div
                  className={
                    this.props.networkId === 56
                      ? "optionbtn-active bnb-passive"
                      : "optionbtn-passive bnb-passive"
                  }
                  // onClick={() => {
                  //   this.props.onSelectChain("bnb");
                  // }}
                >
                  <h6 className="optiontext" style={{cursor: 'auto'}}>
                    <img src={bnblogo} alt="" /> BNB Chain
                  </h6>
                </div>
                      </Tooltip>

                <div
                  className={
                    this.props.networkId === 43114
                      ? "optionbtn-active"
                      : "optionbtn-passive"
                  }
                  onClick={() => {
                    this.props.onSelectChain("avax");
                    this.setState({
                      destinationChain: "avax",
                    });

                  }}
                >
                  <h6 className="optiontext">
                    <img src={avaxlogo} alt="" /> Avalanche
                  </h6>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-3 col-xl-4">
              <div
                className="search-box"
                style={{
                  background: "#312F69",
                  padding: "10px",
                  borderRadius: "12px",
                  boxShadow: "0px 32px 64px rgba(17, 17, 17, 0.12)",
                }}
              >
                <form id="searchform">
                  <input
                    value={this.state.filteredByTokenSymbol}
                    onChange={(e) => {
                      this.setState({ filteredByTokenSymbol: e.target.value });
                      this.filterByTokenSymbol(e.target.value);
                    }}
                    type="text"
                    id="search-bar"
                    style={{
                      paddingBottom: "10px",
                      background: "transparent",
                      border: "1px solid #8E97CD",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                    autoComplete="off"
                    placeholder="Filter for Token"
                  />
                  <button type="submit" id="submit">
                    <img src="/assets/img/search.svg" alt="Image" />
                  </button>
                </form>
              </div>
            </div>

        </div>
        <div className="table-box">

            <div className="form-container p-3 position-relative">
              <div
                className="tablepurplediv"
                style={{ background: "#8E97CD", left: "0px" }}
              ></div>
              {this.GetDataTable()}
            </div>

          {/* <div className="l-table-wrapper-div">{this.GetDataTable()}</div> */}
        </div>
      </div>
    );
  }
}
