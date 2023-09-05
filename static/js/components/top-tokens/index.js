import React from "react";
import moment from "moment";
import DataTable, { createTheme } from "react-data-table-component";
import CircularProgress from "@material-ui/core/CircularProgress";
import ethlogo from "../../assets/ethlogo.svg";
import bnblogo from "../../assets/bnblogo.svg";
import avaxlogo from "../../assets/avaxlogo.svg";
import ethPools from '../../assets/ethPools.png'
import bnbPools from '../../assets/bnbPools.png'
import avaxPools from '../../assets/avaxPools.png'
// import { NavLink as a } from 'react-router-dom'

// import getProcessedSwaps from '../../functions/get-processed-swaps'

import getTopTokens from "../../functions/get-top-tokens";
import getFormattedNumber from "../../functions/get-formatted-number";
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

export default class TopTokens extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ethPrice: "...",
      gasPrice: "...",
      tokens: [],
      filteredTokens: [],
      isLoading: true,
      filteredByTokenId: "",
      filteredByTxnType: "", // 'burn' | 'mint' | ''
      destinationChain: ""
    };
  }

  async componentDidMount() {
    // this.fetchTransactions()
    // this.fetchSwaps()
    // this.checkNetworkId();
    await this.fetchTopTokens().then();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.networkId != this.props.networkId) {
      this.setState({
        isLoading: true,
        ethPrice: "...",
        tokens: [],
        filteredTokens: [],
      });
      await this.fetchTopTokens().then();
    }
  }

  fetchTopTokens = async () => {
    try {
      let network;
      this.props.networkId == 1
        ? (network = "ethereum")
        : (network = "avalanche");
      let { tokens, ethPrice } = await getTopTokens(network);
      console.log({ tokens, ethPrice });
      this.setState({ tokens, ethPrice, filteredTokens: tokens });
      return { tokens, ethPrice };
    } finally {
      this.setState({ isLoading: false });
    }
  };

  filterByTokenSymbol = (tokenSymbol) => {
    if (!tokenSymbol) {
      this.setState({
        filteredByTokenSymbol: "",
        filteredTokens: JSON.parse(JSON.stringify(this.state.tokens)),
      });
      return;
    }
    let filteredTokens = JSON.parse(JSON.stringify(this.state.tokens));
    filteredTokens = filteredTokens.filter(
      (txn) =>
        String(txn.symbol)
          .toLowerCase()
          .startsWith(tokenSymbol.toLowerCase()) ||
        String(txn.name).toLowerCase().startsWith(tokenSymbol.toLowerCase())
    );
    this.setState({ filteredTokens, filteredByTokenSymbol: tokenSymbol });
  };

  GetDataTable = () => {
    const columns = [
      {
        name: "Name",
        selector: "name",
        sortable: true,
        // minWidth: '145px',
        cell: (txn) => (
          <div class="token">
            {/* <img src="/assets/img/icon.svg" alt="" /> */}
            <a
              target="_blank"
              className="token-link"
              href={
                this.props.networkId == 1
                  ? `https://v2.info.uniswap.org/token/${txn.id}`
                  : `https://cchain.explorer.avax.network/address/${txn.id}`
              }
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={txn.name}
            >
              {txn.name}
            </a>
            <img src="/assets/img/link.svg" alt="" />
          </div>
        ),
      },

      {
        name: "Symbol",
        selector: "symbol",
        sortable: true,
        // minWidth: '145px',
        cell: (txn) => (
          <td
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={txn.symbol}
          >
            {txn.symbol}
          </td>
        ),
      },
      {
        name: "Liquidity",
        selector: "liquidity",
        sortable: true,
        // minWidth: '145px',
        cell: (txn) => (
          <td style={{ whiteSpace: "nowrap" }} title={txn.liquidity}>
            ${getFormattedNumber(txn.liquidity, 2)}
          </td>
        ),
      },
      {
        name: "Volume (24hrs)",
        selector: "dailyVolume",
        sortable: true,
        // minWidth: '145px',
        cell: (txn) => (
          <td style={{ whiteSpace: "nowrap" }} title={txn.dailyVolume}>
            ${getFormattedNumber(txn.dailyVolume, 2)}
          </td>
        ),
      },
      {
        name: "Price",
        selector: "priceUSD",
        sortable: true,
        // minWidth: '145px',
        cell: (txn) => (
          <td style={{ whiteSpace: "nowrap" }} title={txn.priceUSD}>
            ${getFormattedNumber(txn.priceUSD, 2)}
          </td>
        ),
      },
      {
        name: "Price Change (24 hrs)",
        selector: "priceChange",
        sortable: true,
        // minWidth: '145px',
        cell: (txn) => (
          <td
            className={txn.priceChange >= 0 ? "green-text" : "red-text"}
            style={{ whiteSpace: "nowrap" }}
            title={txn.priceChange}
          >
            {txn.priceChange}%
          </td>
        ),
      },
      // {
      //     name: 'Liquidity',
      //     selector: 'liquidity',
      //     sortable: true,
      //     maxWidth: '80px',
      //     minWidth: '80px',
      //     textAlign: 'right',
      //     cell: txn => <span className={`l-clr-${txn.type == 'sell'?'red':'purple'}`}> {txn.type} </span>
      // },
      // {
      //     name: 'Amount USD',
      //     selector: 'amountUSD',
      //     sortable: true,
      //     format: txn => `$${getFormattedNumber(txn.amountUSD, 4)}`
      // },

      // {
      //     name: `Amount ${this.state.pair?.token0.symbol || 'token0'}`,
      //     selector: 'amount0',
      //     sortable: true,
      //     format: txn => `${getFormattedNumber(txn.amount0, 6)} ${txn.pair?.token0.symbol}`
      // },
      // {
      //     name: `Amount ${this.state.pair?.token1.symbol || 'token1'}`,
      //     selector: 'amount1',
      //     sortable: true,
      //     format: txn => `${getFormattedNumber(txn.amount1, 6)} ${txn.pair?.token1.symbol}`
      // },

      // {
      //     name: 'Maker',
      //     selector: 'maker',
      //     sortable: false,
      //     cell: txn => <a className='l-clr-purple' target="_blank" rel="noopener noreferrer" href={`https://etherscan.io/address/${txn.maker}`}>...{txn.maker?.slice(34)}</a>
      // },
    ];
    return (
      <DataTable
        progressComponent={<Circular />}
        compact={true}
        keyField="id"
        theme={this.props.theme == "theme-dark" ? "solarized" : "light"}
        persistTableHead={false}
        progressPending={this.state.isLoading}
        fixedHeader={true}
        pagination={true}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[50, 100, 250, 500]}
        columns={columns}
        data={this.state.filteredTokens}
      />
    );
  };

  render() {
    return (
      <div className="container-lg p-0">
        <div className="d-flex flex-column gap-3">
            <h2 className="launchpad-hero-title">Top Tokens</h2>
            <p className="launchpad-hero-desc">
              {this.props.networkId === 1
                ? "List of Uniswap Top Tokens"
                : this.props.networkId === 56 ? 
                "List of Pancakeswap Top Tokens"
                : "List of Pangolin Top Tokens"}
            </p>
          </div>
        <div className="row flex-column flex-lg-row gap-5 gap-lg-0 justify-content-between align-items-center my-4">
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
                    placeholder="Filter by Token"
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
          {/* <div className="page-nav">
                        <ul>
                            <li><a href="#"><img src="assets/img/arrow-left.png" alt="Image" /></a></li>
                            <li><span>Page 1 of 20</span></li>
                            <li><a href="#"><img src="assets/img/arro-right.png" alt="Image" /></a></li>
                        </ul>
                    </div> */}
        </div>
      </div>
    );
  }
}
