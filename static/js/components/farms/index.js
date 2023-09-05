import React from "react";
import moment from "moment";
import DataTable, { createTheme } from "react-data-table-component";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavLink } from "react-router-dom";
import ethlogo from "../../assets/ethlogo.svg";
import bnblogo from "../../assets/bnblogo.svg";
import avaxlogo from "../../assets/avaxlogo.svg";
import getFormattedNumber from "../../functions/get-formatted-number";
import ethPools from '../../assets/ethPools.png'
import bnbPools from '../../assets/bnbPools.png'
import avaxPools from '../../assets/avaxPools.png'
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

export default class Farms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ethPrice: "...",
      gasPrice: "...",
      farms: [],
      filteredFarms: [],
      isLoading: true,
      filteredByName: "",
      destinationChain: ""

    };
  }

  async componentDidMount() {
    // this.fetchTransactions()
    await this.fetchFarms();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.networkId != this.props.networkId) {
      this.setState({
        isLoading: true,
        ethPrice: "...",
        farms: [],
        filteredFarms: [],
      });
      await this.fetchFarms().then();
    }

  }

  fetchFarms = async () => {
    try {
      let network = this.props.networkId;
      let farms = await window.$.get(
        network == 1
          ? `${window.config.farm_api}/api/farm-info/eth/` 
          :
          network == 56
          ?
          `${window.config.farm_api}/api/farm-info-bsc/`
          : 
          `${window.config.farm_api}/api/farm-info-avax/`
      );
      farms = farms.farmInfo;
      //console.log({ farms })
      this.setState({ farms, filteredFarms: farms });
      return { farms };
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // filterByTokenId = (tokenId) => {
  //     if (!tokenId) {
  //         this.setState({filteredByTokenId: '', filteredTransactions: JSON.parse(JSON.stringify(this.state.processedTransactions))})
  //         return
  //     }
  //     let filteredTransactions = JSON.parse(JSON.stringify(this.state.processedTransactions))
  //     filteredTransactions = filteredTransactions.filter(txn => txn.tokenId == tokenId)
  //     this.setState({filteredTransactions, filteredByTokenId: tokenId})
  // }

  // filterByTxnType = (txnType) => {
  //     if (!txnType) {
  //         this.setState({ filteredByTxnType: '', filteredTransactions: JSON.parse(JSON.stringify(this.state.processedTransactions)) })
  //         return
  //     }
  //     let filteredTransactions = JSON.parse(JSON.stringify(this.state.processedTransactions))
  //     filteredTransactions = filteredTransactions.filter(txn => txn.type == txnType)
  //     this.setState({ filteredTransactions, filteredByTxnType: txnType })
  // }

  filterByName = (name) => {
    if (!name) {
      this.setState({
        filteredByName: "",
        filteredFarms: JSON.parse(JSON.stringify(this.state.farms)),
      });
      return;
    }
    let filteredFarms = JSON.parse(JSON.stringify(this.state.farms));
    filteredFarms = filteredFarms.filter(
      (farm) =>
        String(farm.pool_name).toLowerCase().startsWith(name.toLowerCase()) ||
        String(farm.pair_name).toLowerCase().startsWith(name.toLowerCase())
    );
    this.setState({ filteredFarms, filteredByName: name });
  };

  GetDataTable = () => {
    const columns = [
      {
        name: "Pool",
        selector: row => row.pair_name,
        sortable: true,
        minWidth: '200px',
        cell: (row) => (
          <div className="token">
            {/* <img src="/assets/img/icon.svg" alt="" /> */}
            <img src={row.link_logo} height={40} width={40} alt="" />
            <a
              className="token-link"
              target="_blank"
              rel="noopener noreferrer"
              href={row.link_pair}
            >
              {" "}
              {row.pair_name}{" "}
            </a>
            <img src="/assets/img/link.svg" alt="" />
          </div>
        ),
      },
      {
        name: "Project",
        selector: row => row.pool_name,
        sortable: true,
      },
      {
        name: "TVL",
        selector: row => row.tvl_usd,
        sortable: true,
        cell: (row) => <div> ${getFormattedNumber(row.tvl_usd)} </div>,
      },
      {
        name: "APY",
        selector: row => row.apy_percent,
        sortable: true,
        cell: (row) => <div> {getFormattedNumber(row.apy_percent)}% </div>,
      },
      {
        name: "Confidence",
        selector: row => row.confidence,
        sortable: false,
      },
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
        data={this.state.filteredFarms}
      />
    );
  };

  render() {
    return (
      <div className="container-lg p-0">
           <div className="d-flex flex-column gap-3">
            <h2 className="launchpad-hero-title">Yields</h2>
            <p className="launchpad-hero-desc">
              This list does not imply endorsement by Dypius. There
              might be Smart Contract risk and IL risk.
              <br />
              <b>
                Please conduct your own research before dealing with any
                project!
              </b>
            </p>
          </div>
        <div className="row flex-column flex-lg-row gap-5 gap-lg-0 justify-content-between align-items-center my-4">
        <div className="col-12 col-lg-4">
          <img src={this.state.destinationChain === "eth"? ethPools : this.state.destinationChain === 'bnb' ? bnbPools : this.state.destinationChain === "avax" ? avaxPools : ethPools} alt="" />
          </div>
          <div className="position-relative col-12 col-lg-5 col-xl-4">
              <p className="launchpad-hero-desc position-absolute" style={{ fontSize: 12, top: '-27px' }}>
              Change network (view purposes only)
              </p>
              <div className="d-flex justify-content-around align-items-center" style={{
                background: "#312F69",
                padding: "10px",
                borderRadius: "12px",
                boxShadow: "0px 32px 64px rgba(17, 17, 17, 0.12)",
              }}>
                <div
                  className={
                    this.props.networkId === 1
                      ? "optionbtn-active"
                      : "optionbtn-passive"
                  }
                  onClick={() => {
                    this.props.onSelectChain("eth");
                    this.setState({
                      destinationChain: "eth",
                    });
                  }}
                >
                  <h6 className="optiontext">
                    <img src={ethlogo} alt="" /> Ethereum
                  </h6>
                </div>
             
                       <div
                  className={
                    this.props.networkId === 56
                      ? "optionbtn-active"
                      : "optionbtn-passive"
                  }
                  onClick={() => {
                    this.props.onSelectChain("bnb");
                    this.setState({
                      destinationChain: "bnb",
                    });
                  }}
                >
                  <h6 className="optiontext" >
                    <img src={bnblogo} alt="" /> BNB Chain
                  </h6>
                </div>

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
                  value={this.state.filteredByName}
                  onChange={(e) => {
                    this.setState({ filteredByName: e.target.value });
                    this.filterByName(e.target.value);
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
                  placeholder="Filter by Name"
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
