import React from "react";
import moment from "moment";
import DataTable, { createTheme } from "react-data-table-component";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavLink, Redirect } from "react-router-dom";
// import Chart from 'kaktana-react-lightweight-charts'
import { TVChartContainer } from "../tv-chart-container/index";

import getProcessedSwaps from "../../functions/get-processed-swaps";
import getFormattedNumber from "../../functions/get-formatted-number";
import getSearchResults from "../../functions/get-search-results";
import { get24hEarlierBlock } from "../../functions/get-block-from-timestamp";
import fetchGql from "../../functions/fetch-gql";
import { getPairCandles } from "../../functions/datafeed";
import PairLocker from "./pairlocker.svg";
import ethlogo from "../../assets/ethlogo.svg";
import bnblogo from "../../assets/bnblogo.svg";
import avaxlogo from "../../assets/avaxlogo.svg";
import { Modal, Button } from "react-bootstrap";
import GearProgress from "./GearProgress";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./pair-explorer.css";
import { Tooltip } from "@material-ui/core";

async function getTokenInformation(address, network) {
  let res = await axios.get(
    network === 1
      ? `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`
      : `https://api.coingecko.com/api/v3/coins/avalanche/contract/${address}`
  );

  return res.data;
}

async function getSearchResultsLocalAPI(query, network) {
  let res = await axios.get(
    network === 1
      ? `https://api-explorer.dyp.finance/v1/eth/search/pairs/${query}`
      : `https://api-explorer.dyp.finance/v1/avax/search/pairs/${query}`
  );

  return res.data.sort((a, b) => a.pair.reserve - b.pair.reserve).reverse();
}

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

export default class PairExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ethPrice: "...",
      swaps: [],
      networkId: "1",
      isFavorite: false,
      favorites: [],

      coinbaseVote: null,
      voteCount: null,
      upvoteCount: null,
      isRegisteringVote: false,

      diffVolumeUSD: "...",
      diffUsdPerToken1Percent: "...",
      diffUsdPerToken0Percent: "...",
      starColor: "gray",
      searchResults: [],
      pair: null,
      isLoading: true,
      isSearching: false,
      _24hEarlierBlock: null,
      show: false,

      mainToken: null,
      mainTokenTotalSupply: "...",

      options: {
        alignLabels: true,
        // priceScaleId: 'right',
        timeScale: {
          rightOffset: 3,
          barSpacing: 8,
          //   fixLeftEdge: true,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
          borderVisible: false,
          borderColor: "#fff000",
          visible: true,
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 0,
        },
      },
      candlestickSeries: [],
      histogramSeries: [],
    };
  }

  checkFavData() {
    let pair_id = this.props.match.params.pair_id;
    if (pair_id) {
      if (this.props.networkId === 1) {
        window
          .isFavoriteETH(pair_id.toLowerCase())
          .then((isFavorite) => {
            this.setState({ isFavorite });
            this.setState({ starColor: "rgb(227, 6, 19)" });
          })
          .catch(console.error);
      }
      if (this.props.networkId === 43114) {
        window
          .isFavorite(pair_id.toLowerCase())
          .then((isFavorite) => {
            this.setState({ isFavorite });
            this.setState({ starColor: "rgb(227, 6, 19)" });
          })
          .catch(console.error);
      }
    }
  }

  checkNetworkId() {
    // if (window.ethereum) {
    //     window.ethereum
    //         .request({ method: "net_version" })
    //         .then((data) => {
    //             this.setState({
    //                 networkId: data,
    //             });
    //             this.fetchfavData();
    //             let pair_id = this.props.match.params.pair_id;
    //             if (!pair_id) return;
    //             this.checkFavData();
    //             this.refreshVoteCount();
    //             this.refreshPairInfo();
    //
    //             this.fetchSwaps(pair_id);
    //         })
    //         .catch(console.error);
    // } else {
    let pair_id = this.props.match.params.pair_id;
    if (!pair_id) return;
    this.refreshVoteCount();
    this.refreshPairInfo();
    this.fetchfavData();
    this.checkFavData();

    this.fetchSwaps(pair_id);
    // this.setState({
    //     networkId: "1",
    // });
    // }
  }

  fetchfavData() {
    if (this.props.networkId === 1) {
      window
        .getFavoritesETH()
        .then((favorites) => this.setState({ favorites }))
        .catch(console.error);
    }

    if (this.props.networkId === 43114) {
      window
        .getFavorites()
        .then((favorites) => this.setState({ favorites }))
        .catch(console.error);
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.oldTitle = document.querySelector("title").innerText;
    let pair_id = this.props.match.params.pair_id;
    if (!pair_id) return;
    this.checkNetworkId();
    window.addOneTimeWalletConnectionListener(this.refreshVoteCount);
    window.addOneTimeWalletConnectionListener(this.refreshPairInfo);
    this.fetchInterval = setInterval(() => this.fetchSwaps(pair_id), 15000);
  }
  componentWillUnmount() {
    document.querySelector("title").innerText = this.oldTitle || "DYP Tools";
    clearInterval(this.fetchInterval);
    clearInterval(this.barInterval);
    window.removeOneTimeWalletConnectionListener(this.refreshVoteCount);
    window.removeOneTimeWalletConnectionListener(this.refreshPairInfo);
  }

  refreshCGInfo = async (tokenAddress) => {
    try {
      let info = await getTokenInformation(tokenAddress, this.props.networkId);
      let cgInfo = {};
      console.log({ cgInfo: info });

      cgInfo.link_logo = info.image?.large;
      cgInfo.link_coingecko =
        info.id && `https://www.coingecko.com/en/coins/${info.id}`;
      cgInfo.link_website = info.links?.homepage?.filter((t) => t)[0];
      cgInfo.link_twitter =
        info.links?.twitter_screen_name &&
        `https://twitter.com/${info.links?.twitter_screen_name}`;
      cgInfo.link_telegram =
        info.links?.telegram_channel_identifier &&
        `https://t.me/${info.links?.telegram_channel_identifier}`;
      cgInfo.market_cap_usd = info.market_data?.market_cap?.usd;
      cgInfo.circulating_supply = info.market_data?.circulating_supply;
      cgInfo.fdv_usd = info.market_data?.fully_diluted_valuation?.usd;

      this.setState({ cgInfo });
    } catch (e) {
      console.error(e);
    }
  };

  refreshPairInfo = async () => {
    let { pairInfo } = await window.$.get(
      this.props.networkId === 1
        ? `${window.config.apieth_baseurl}/api/pair-info?pairId=${String(
            this.props.match.params.pair_id
          )
            .trim()
            .toLowerCase()}`
        : `${window.config.api_baseurl}/api/pair-info?pairId=${String(
            this.props.match.params.pair_id
          )
            .trim()
            .toLowerCase()}`
    );
    this.setState({ pairInfo });

    let coinbase;
    try {
      coinbase = this.props.appState.coinbase;
    } catch (e) {
      console.error(e);
      return;
    }
    if (this.state.pair) {
      let mainToken = await window.getMainToken(
        this.state.pair,
        this.props.networkId
      );
      this.setState({ mainToken });
      let mainTokenTotalSupply =
        (await window.getTokenTotalSupply(mainToken.id)) /
        10 ** mainToken.decimals;
      this.setState({ mainTokenTotalSupply });
    }
    this.refreshLockerData();
  };

  refreshVoteCount = async () => {
    let coinbase;
    try {
      coinbase = this.props.appState.coinbase;
    } catch (e) {
      console.error(e);
    }
    let { voteCount, upvoteCount, coinbaseVote } = await window.$.get(
      `${
        this.props.networkId === 1
          ? window.config.apieth_baseurl
          : window.config.api_baseurl
      }/api/community-votes?coinbase=${coinbase}&pairId=${
        this.props.match.params.pair_id
      }`
    );
    this.setState({
      voteCount,
      upvoteCount,
      coinbaseVote,
    });
  };
  registerViewOnce = async (pair) => {
    if (this.state.isViewRegistered) return;
    this.setState({ isViewRegistered: true });
    try {
      let pair_id = pair.id;
      let token0Symbol = pair.token0.symbol;
      let token1Symbol = pair.token1.symbol;
      let pair_address = pair_id;
      let pair_name = `${token0Symbol}-${token1Symbol}`;
      window.$.post(
        `${
          this.props.networkId === 1
            ? window.config.apieth_baseurl
            : window.config.api_baseurl
        }/api/register-view?pair_address=${pair_address}&pair_name=${pair_name}`
      )
        .then(console.log)
        .catch(console.error);
    } catch (e) {
      console.error(e);
    }
  };
  registerVote = async (upvote = true) => {
    if (!this.state.pair) {
      window.alertify.message("Wait for pair to load!");
      return;
    }
    if (this.state.isRegisteringVote) return;
    if (!this.props.appState.isConnected) {
      window.alertify.message("Connect wallet to vote!");
      return;
    }
    let coinbase = await window.getCoinbase();
    if (!coinbase) return;

    this.setState({ isRegisteringVote: true });
    let oldCoinbaseVote = this.state.coinbaseVote;
    this.setState({ coinbaseVote: oldCoinbaseVote == upvote ? null : upvote });

    try {
      let mainToken = await window.getMainToken(
        this.state.pair,
        this.props.networkId
      );

      let tokenBalance = Number(
        await window.getTokenHolderBalance(mainToken.id, coinbase)
      );

      if (!(tokenBalance > 0) && this.props.isPremium === false) {
        window.alertify.message(
          `Buy some ${mainToken.symbol} to vote! The voting process is free, but available only for ${mainToken.symbol} token holders!`
        );
        this.setState({ coinbaseVote: oldCoinbaseVote });
        return;
      }

      let action = "like";
      if (!upvote) action = "dislike";
      let pairId = this.props.match.params.pair_id;
      await window.$.post(
        `${
          this.props.networkId === 1
            ? window.config.apieth_baseurl
            : window.config.api_baseurl
        }/api/community-votes?coinbase=${coinbase}&pairId=${pairId}&action=${action}`
      );
    } finally {
      this.setState({ isRegisteringVote: false });
      this.refreshVoteCount();
    }
  };

  handleTimeTravelQueries = (_24hEarlierBlock, pair) => {
    fetchGql(
      `query ($pair: String!) {
            bundle(id: 1) {
              ethPrice
            }
            pair(id: $pair) {
              volumeUSD
              untrackedVolumeUSD
              token0 {
                derivedETH
              }
              token1 {
                derivedETH
              }
            }
            
            asOldBundle: bundle(id: 1, block: {number: ${_24hEarlierBlock}}) {
                  ethPrice
            }
            asOldPair: pair(id: $pair, block: {number: ${_24hEarlierBlock}}) {
              volumeUSD
              untrackedVolumeUSD
              token0 {
                derivedETH
              }
              token1 {
                derivedETH
              }
            }
          }`,
      { pair },
      this.props.networkId === 1
        ? window.config.subgraphGraphEth
        : window.config.subgraphGraphAvax
    )
      .then((res) => res.data)
      .then((data) => {
        let ethPrice = data.bundle.ethPrice;
        let usdPerToken0 = Math.min(
          Number.MAX_VALUE,
          ethPrice * data.pair.token0.derivedETH
        );
        let usdPerToken1 = Math.min(
          Number.MAX_VALUE,
          ethPrice * data.pair.token1.derivedETH
        );
        let volumeUSD = Number(data.pair.untrackedVolumeUSD);

        let old_ethPrice = data.asOldBundle.ethPrice;
        let old_usdPerToken0 = Math.min(
          Number.MAX_VALUE,
          old_ethPrice * data.asOldPair.token0.derivedETH
        );
        let old_usdPerToken1 = Math.min(
          Number.MAX_VALUE,
          old_ethPrice * data.asOldPair.token1.derivedETH
        );
        let old_volumeUSD = Number(data.asOldPair.untrackedVolumeUSD);

        let diffVolumeUSD = volumeUSD - old_volumeUSD;
        let diffUsdPerToken0Percent =
          (
            ((usdPerToken0 - old_usdPerToken0) / old_usdPerToken0) *
            100
          ).toFixed(2) * 1 || 0;
        let diffUsdPerToken1Percent =
          (
            ((usdPerToken1 - old_usdPerToken1) / old_usdPerToken1) *
            100
          ).toFixed(2) * 1;

        this.setState({
          diffVolumeUSD,
          diffUsdPerToken1Percent,
          diffUsdPerToken0Percent,
        });
      })
      .catch(console.error);
  };

  doSearch = () => {
    if (!this.state.query) {
      clearTimeout(this.searchTimeout);
      this.setState({ isSearching: false, searchResults: [] });
      return;
    }
    this.setState({ isSearching: true });
    getSearchResultsLocalAPI(this.state.query, this.props.networkId)
      .then((searchResults) => {
        if (!this.state.query) searchResults = [];
        this.setState({ searchResults });
      })
      .catch(console.log)
      .finally(() => {
        this.setState({ isSearching: false });
      });
  };

  fetchSwaps = async (pair_id) => {
    get24hEarlierBlock(this.props.networkId === 1 ? "ethereum" : "avalanche")
      .then((_24hEarlierBlock) => {
        this.setState({ _24hEarlierBlock });
        this.handleTimeTravelQueries(
          _24hEarlierBlock,
          this.props.match.params.pair_id
        );
      })
      .catch(console.error);
    try {
      let { swaps, ethPrice, pair } = await getProcessedSwaps(
        pair_id,
        false,
        this.props.networkId === 1 ? "ethereum" : "avalanche"
      );
      console.log({ swaps, ethPrice });
      this.setState({ swaps, ethPrice, pair });
      let mainToken = await window.getMainToken(
        this.state.pair,
        this.props.networkId
      );
      this.setState({ mainToken });
      if (!this.state.cgInfo) {
        let mainToken = await window.getMainToken(
          this.state.pair,
          this.props.networkId
        );
        if (mainToken && mainToken.id) {
          this.refreshCGInfo(mainToken.id);
        }
      }
      this.registerViewOnce(pair);

      let usd_price =
        (this.state.mainToken?.derivedETH * this.state.ethPrice).toFixed(4) *
          1 || "...";
      let symbol = `${pair.token0.symbol}-${pair.token1.symbol}`;
      let title = `$${usd_price} | ${symbol} | Pair Explorer - DYP Tools`;
      document.querySelector("title").innerText = title;
      return { swaps, ethPrice, pair };
    } finally {
      this.setState({ isLoading: false });
      setTimeout(this.refreshVoteCount, 50);
      setTimeout(this.refreshPairInfo, 50);
    }
  };

  handleQuery = (query) => {
    this.setState({ query });
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(this.doSearch, 400);
  };

  toggleFavorite = async () => {
    if (!this.state.pair) return;

    if (this.props.networkId === 1) {
      console.log("pair", this.state.pair);
      await window.toggleFavoriteETH(this.state.pair);
      window
        .isFavoriteETH(this.state.pair.id.toLowerCase())
        .then((isFavorite) =>
          this.setState({ isFavorite, starColor: "#E30613" })
        )
        .catch(console.error);
      this.fetchfavData();
    }
    if (this.props.networkId === 43114) {
      await window.toggleFavorite(this.state.pair);
      window
        .isFavorite(this.state.pair.id.toLowerCase())
        .then((isFavorite) =>
          this.setState({ isFavorite, starColor: "#E30613" })
        )
        .catch(console.error);
      this.fetchfavData();
    }
  };

  GetDataTable = () => {
    const columns = [
      {
        name: "Date",
        selector: "timestamp",
        sortable: true,
        minWidth: "145px",
        cell: (txn) => (
          <td
            style={{ whiteSpace: "nowrap" }}
            title={new Date(txn.timestamp * 1e3)}
          >
            {moment(txn.timestamp * 1e3).format("YYYY-MM-DD HH:mm")}
          </td>
        ),
      },
      {
        name: "Type",
        selector: "type",
        sortable: true,
        maxWidth: "80px",
        minWidth: "80px",
        textAlign: "right",
        cell: (txn) => (
          <span className={`${txn.type == "sell" ? "text-red" : "text-green"}`}>
            {" "}
            {txn.type}{" "}
          </span>
        ),
      },
      {
        name: "Price USD",
        selector: `usdPerToken${this.state.mainToken?.__number}`,
        sortable: true,
        format: (txn) =>
          `$${getFormattedNumber(
            txn[`usdPerToken${this.state.mainToken?.__number}`],
            4
          )}`,
      },
      {
        name: `Price ${this.state.pair?.token1.symbol || "token1"}`,
        selector: "token1PerToken0",
        sortable: true,
        format: (txn) =>
          `${getFormattedNumber(txn.token1PerToken0, 4)} ${
            this.state.pair?.token1.symbol
          }`,
      },
      {
        name: `Amount ${this.state.pair?.token0.symbol || "token0"}`,
        selector: "amount0",
        sortable: true,
        format: (txn) =>
          `${getFormattedNumber(txn.amount0, 2)} ${
            this.state.pair?.token0.symbol
          }`,
      },
      {
        name: `Amount ${this.state.pair?.token1.symbol || "token1"}`,
        selector: "amount1",
        sortable: true,
        format: (txn) =>
          `${getFormattedNumber(txn.amount1, 2)} ${
            this.state.pair?.token1.symbol
          }`,
      },

      {
        name: "Maker",
        selector: "maker",
        sortable: false,
        cell: (txn) => (
          <a
            className="l-clr-purple"
            target="_blank"
            rel="noopener noreferrer"
            href={
              this.props.networkId === 1
                ? `https://etherscan.io/address/${txn.maker}`
                : `https://cchain.explorer.avax.network/address/${txn.maker}`
            }
          >
            ...{txn.maker?.slice(36)}
          </a>
        ),
      },
      {
        name: "Others",
        // minWidth: '165px',
        cell: (txn) => (
          <div className="l-table-actions">
            {/* <a onClick={e => {
                            e.preventDefault()
                            this.filterByTokenId(this.state.filteredByTokenId == '' ? txn.tokenId : '')
                        }} title="Filter by token" href="#"><i style={{ fontSize: '18px', position: 'relative', top: '5px', color: this.state.filteredByTokenId == txn.tokenId ? 'red' : 'inherit' }} className={`fas fa-${this.state.filteredByTokenId == txn.tokenId ? 'times' : 'filter'}`}></i></a> */}
            {/* <a rel='noopener noreferrer' target="_blank" title="Buy at Uniswap" href={`https://app.uniswap.org/#/swap?outputCurrency=${txn.tokenId}`}><img src="/images/uniswap-logo-home.png" width="18" alt="" /></a> */}
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
            {/* <a rel='noopener noreferrer' target="_blank" title="Blocked Liquidity" href={`https://www.unicrypt.network/pair/${txn.pairId}`}><img className='icon-bg-white-rounded' src="/images/unicrypt_v3.svg" width="18" alt="" /></a> */}
            {/* <a title={"Coming Soon"} href="#"><i style={{ fontSize: '20px', position: 'relative', top: '5px' }} className='fab fa-wpexplorer'></i></a> */}
          </div>
        ),
      },
    ];

    const tableStyle = {
      table: {
        style: {
          height: "552px",
        },
      },
    };
    return (
      <DataTable
        progressComponent={<Circular />}
        compact={true}
        keyField="id2"
        theme={this.props.theme == "theme-dark" ? "solarized" : "light"}
        persistTableHead={false}
        progressPending={this.state.isLoading}
        fixedHeader={true}
        pagination={true}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[50, 100, 250, 500]}
        columns={columns}
        data={this.state.swaps}
        dense
        customStyles={tableStyle}
      />
    );
  };
  getShareInfo = () => {
    let link = window.location.href;
    let title = `Check ${this.state.pair?.token0.symbol}/${
      this.state.pair?.token1.symbol
    } on DYP Tools! Price $${
      (this.state.mainToken?.derivedETH * this.state.ethPrice).toFixed(4) * 1 ||
      "..."
    }`;
    title = encodeURIComponent(title);
    link = encodeURIComponent(link);
    // link = encodeURIComponent(link)
    return { link, title };
  };
  getAutoTrustScores = () => {
    let result = { avg: undefined, avg_weighted: undefined, scores: [] };
    let cgInfo = this.state.cgInfo || {};
    let settings = window.config.automated_trust_scores;
    let { perfect_scoring } = settings;
    let scores = {
      tx_no:
        Math.min(this.state.pair?.txCount * 1, perfect_scoring.tx_no) /
        perfect_scoring.tx_no,
      lp_holder_no:
        Math.min(
          this.state.pair?.liquidityProviderCount * 1,
          perfect_scoring.lp_holder_no
        ) / perfect_scoring.lp_holder_no,
      daily_volume_usd:
        Math.min(
          this.state.diffVolumeUSD * 1,
          perfect_scoring.daily_volume_usd
        ) / perfect_scoring.daily_volume_usd,
      liquidity_usd:
        Math.min(
          this.state.pair?.reserveUSD * 1,
          perfect_scoring.liquidity_usd
        ) / perfect_scoring.liquidity_usd,
      information:
        Object.keys(cgInfo).filter((key) => cgInfo[key]).length /
        (Object.keys(cgInfo).length || 1),
    };

    result.scores = settings.display_order.map((key) => ({
      key,
      name: settings.display_names[key],
      score: scores[key] * 100,
    }));

    if (result.scores.length) {
      result.avg =
        result.scores.reduce(
          (accumulator, currentValue) =>
            accumulator + (currentValue?.score || 0),
          0
        ) / result.scores.length;

      result.avg_weighted = result.scores.reduce(
        (accumulator, currentValue) =>
          accumulator +
          (currentValue?.score * settings.weights[currentValue.key] || 0),
        0
      );
    }
    return result;
  };

  toggleModal = () => {
    if (!this.props.appState.isConnected) {
      window.alertify.message("Connect wallet first!");
      return;
    }
    // if (!this.props.isPremium) {
    //     window.alertify.message("Subscribe to Premium for this feature!")
    //     return;
    // }
    this.setState({ show: !this.state.show });
  };

  refreshLockerData = async () => {
    let pair_id = this.props.match.params.pair_id;
    let baseTokens =
      this.props.networkId === 1
        ? await window.getBaseTokensETH()
        : await window.getBaseTokens();
    this.setState({ baseTokens });
    if (window.web3.utils.isAddress(pair_id)) {
      // this.refreshTokenLocks(pair_id)
      // this.handlePairChange(null, pair_id)
      let totalLpLocked =
        this.props.networkId === 1
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

      let { token0, token1 } = await window.getPairTokensInfo(
        pair,
        this.props.networkId
      );
      let baseToken;
      if (baseTokens.includes(token0.address.toLowerCase())) {
        baseToken = token0;
      } else if (baseTokens.includes(token1.address.toLowerCase())) {
        baseToken = token1;
      }
      let baseTokenBalance = await window.getTokenHolderBalance(
        baseToken?.address,
        pair
      );
      let baseTokenInLp =
        (baseTokenBalance / 10 ** (baseToken.decimals * 1)) *
        (amount / totalSupply);
      let tokenCG = window.tokenCG[baseToken.address.toLowerCase()];
      if (!tokenCG) return;
      let usdPerBaseToken = Number(await window.getPrice(tokenCG));
      let usdValueOfLP = baseTokenInLp * usdPerBaseToken * 2;
      this.setState({ usdValueOfLP });
    } catch (e) {
      console.error(e);
    }
  };

  onBarsRequest = (bars) => {
    console.log({ bars });
    if (!bars || !bars.length) return;
    let latestTime = Math.max(this.latestTime || 0, bars[bars.length - 1].time);
    this.latestTime = latestTime;
  };

  registerBarSubscription = (resolution, onRealtimeCallback) => {
    if (resolution != "1") return;
    clearInterval(this.barInterval);
    this.barInterval = setInterval(async () => {
      let pairId;
      if (!(pairId = this.props.match.params.pair_id)) return;
      if (!this.latestTime) return;
      if (!this.state.mainToken) return;

      let bars = await getPairCandles(
        pairId,
        Math.floor(this.latestTime / 1e3),
        Math.floor(Date.now() / 1e3 + 300),
        this.state.mainToken?.__number,
        this.props.networkId
      );

      this.onBarsRequest(bars);
      try {
        for (let bar of bars) {
          onRealtimeCallback(bar);
          // await window.wait(500)
        }
      } catch (e) {
        console.error("Caught Error onRealTimeCallBack: " + e);
      }
    }, 7000);
  };

  render() {
    // this.state.newsData[0].slice(0,10)

    if (!this.props.match.params.pair_id) {
      return (
        <Redirect
          to={
            this.props.networkId === 1
              ? "/pair-explorer/0x76911e11fddb742d75b83c9e1f611f48f19234e4"
              : "/pair-explorer/0x497070e8b6c55fd283d8b259a6971261e2021c01"
          }
        />
      );
    }

    if (this.props.networkId === 1) {
      if (
        this.props.match.params.pair_id ===
        "0x497070e8b6c55fd283d8b259a6971261e2021c01"
      ) {
        return (
          <Redirect
            to={"/pair-explorer/0x76911e11fddb742d75b83c9e1f611f48f19234e4"}
          />
        );
      }
    } else {
      if (
        this.props.match.params.pair_id ===
        "0x76911e11fddb742d75b83c9e1f611f48f19234e4"
      ) {
        return (
          <Redirect
            to={"/pair-explorer/0x497070e8b6c55fd283d8b259a6971261e2021c01"}
          />
        );
      }
    }

    // let options = {...this.state.options}
    // if (this.props.theme == 'theme-dark') {
    //     options.layout =  {
    //         backgroundColor: '#000000',
    //         textColor: 'rgba(255, 255, 255, 0.9)',
    //     }
    //     options.grid =  {
    //         vertLines: {
    //             color: 'rgba(197, 203, 206, 0.1)',
    //         },
    //         horzLines: {
    //             color: 'rgba(197, 203, 206, 0.1)',
    //         },
    //     }
    // }

    let { avg, avg_weighted, scores } = this.getAutoTrustScores();
    // console.log({ avg, avg_weighted, scores })
    let colors = ["orange", "violet", "salmon", "#3e98c7", "green"];

    let { title, link } = this.getShareInfo();

    let mainTokenKey = "0";
    let baseTokenKey = "1";
    if (this.state.mainToken) {
      if (this.state.pair.token1.id == this.state.mainToken.id) {
        mainTokenKey = "1";
        baseTokenKey = "0";
      }
    }

    return (
      <div>
        <div>
          <div className="graph-wrap container-lg p-0">
            <div className="leftside">
              <div
                className="row m-0 w-100 justify-content-between flex-column"
                style={{ gap: 20 }}
              >
                <div className="graph-right2" style={{ padding: "0px" }}>
                  <div className="search-box">
                    <form
                      id="searchform"
                      style={{
                        background: "#312F69",
                        padding: "10px",
                        borderRadius: "12px",
                        boxShadow: "0px 32px 64px rgba(17, 17, 17, 0.12)",
                      }}
                    >
                      <input
                        value={this.state.query}
                        onChange={(e) => this.handleQuery(e.target.value)}
                        type="text"
                        id="search-bar"
                        autoComplete="off"
                        placeholder="Search Pairs"
                        style={{
                          background: "transparent",
                          border: "1px solid #8E97CD",
                          color: "#fff",
                          borderRadius: "8px",
                        }}
                        
                      />
                      <ul
                        className="output"
                        style={{
                          display:
                            this.state.searchResults.length == 0
                              ? "none"
                              : "block",
                          zIndex: 9,
                          maxHeight: "300px",
                          overflowY: "auto",
                          borderRadius: "8px",
                          marginLeft: "-10px",
                        }}
                      >
                        {this.state.searchResults.map((p) => (
                          <NavLink
                            to={`/pair-explorer/${p.pair.address.toLowerCase()}`}
                          >
                            <li key={p.id} className="prediction-item">
                              <div className="suggest-item">
                                <h2
                                  style={{
                                    fontSize: "1.2rem",
                                    fontWeight: 500,
                                    color: "#FCFCF7",
                                  }}
                                >
                                  <span className="wh_txt">
                                    {p.pair.token_1.symbol}
                                  </span>
                                  /{p.pair.token_0.symbol}
                                  <span className="bar">-</span> (
                                  {p.pair.token_0.name})
                                </h2>
                                <p
                                  style={{
                                    fontSize: ".85rem",
                                    fontWeight: 400,
                                    marginBottom: "5px",
                                  }}
                                >
                                  Token: ...
                                  {p.pair.token_0.address
                                    .toLowerCase()
                                    .slice(34)}{" "}
                                  - Pair: ...
                                  {p.pair.address.toLowerCase().slice(34)}
                                </p>
                                <div className="d-flex gap-1 align-items-center">
                                  <p
                                    style={{
                                      opacity: "1",
                                      color: "#4ED5D2",
                                      fontSize: "12px",
                                      lineHeight: "18px",
                                      fontWeight: "400",
                                    }}
                                  >
                                    Total liquidity:
                                  </p>
                                  <span
                                    style={{
                                      opacity: "1",
                                      color: "#4ED5D2",
                                      fontSize: "12px",
                                      lineHeight: "18px",
                                      fontWeight: "400",
                                    }}
                                  >
                                    ${getFormattedNumber(p.pair.reserve, 2)}
                                  </span>
                                </div>
                              </div>
                            </li>
                          </NavLink>
                        ))}
                      </ul>
                      <button type="submit" id="submit">
                        <img
                          src="/assets/img/search-purple.svg"
                          alt="Image"
                          style={{ marginTop: "11px" }}
                        />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="form-container p-3 position-relative">
                  <div className="content-title">
                    <div className="content-title-top">
                      <h2>
                        {this.state.cgInfo?.link_logo && (
                          <img
                            height="30"
                            width="30"
                            style={{
                              objectFit: "contain",
                              position: "relative",
                              top: "-3px",
                            }}
                            src="/assets/img/icon.svg"
                          />
                        )}{" "}
                        {this.state.pair?.token0.symbol || "..."} /{" "}
                        {this.state.pair?.token1.symbol || "..."}{" "}
                        <button
                          onClick={this.toggleFavorite}
                          className={`btn btn-favorite v2 p-0 ${
                            this.state.isFavorite ? "is-favorite" : ""
                          }`}
                        >
                          <img src="/assets/img/star.svg"></img>
                        </button>
                      </h2>
                      <h2>
                        $
                        {(
                          this.state.mainToken?.derivedETH * this.state.ethPrice
                        ).toFixed(4) * 1 || "..."}
                      </h2>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p
                        style={{
                          fontSize: ".8rem",
                          color: "#fff",
                          opacity: "1",
                        }}
                      >
                        ({this.state.mainToken?.name || "..."})
                        <br />
                        Token contract:{" "}
                        <a
                          rel="noopener noreferrer"
                          target="_blank"
                          style={{ color: "#70B8E0" }}
                          href={
                            this.props.networkId === 1
                              ? `https://etherscan.io/token/${this.state.mainToken?.id}`
                              : `https://cchain.explorer.avax.network/tokens/${this.state.mainToken?.id}`
                          }
                        >
                          ...{this.state.mainToken?.id.slice(34)}
                        </a>{" "}
                      </p>
                      <p
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          fontSize: 12,
                          alignItems: "flex-end",
                          color: "#fff",
                        }}
                      >
                        {this.state[
                          `diffUsdPerToken${this.state.mainToken?.__number}Percent`
                        ] != "..." && (
                          <span
                            className={
                              this.state[
                                `diffUsdPerToken${this.state.mainToken?.__number}Percent`
                              ] *
                                1 >=
                              0
                                ? "green-text"
                                : ""
                            }
                          >
                            (24h:{" "}
                            {
                              this.state[
                                `diffUsdPerToken${this.state.mainToken?.__number}Percent`
                              ]
                            }
                            %)
                          </span>
                        )}{" "}
                        {(this.state.mainToken?.derivedETH * 1).toFixed(6) *
                          1 || "..."}{" "}
                        {this.props.networkId === 1 ? "ETH" : "AVAX"}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <NavLink
                        title="DYP Locker"
                        to={`/locker/${this.props.match.params.pair_id}`}
                        className={"w-auto"}
                        style={{ color: "#857DFA" }}
                      >
                        View pair locker
                      </NavLink>
                      <div className="d-flex gap-2">
                        <NavLink
                          to={`/locker/${this.props.match.params.pair_id}`}
                        >
                          <img
                            src={PairLocker}
                            alt=""
                            style={{ cursor: "pointer" }}
                          />
                        </NavLink>
                        <NavLink
                          to={`/locker/${this.props.match.params.pair_id}`}
                        >
                          <img
                            src="/assets/img/arrow.svg"
                            alt=""
                            style={{ cursor: "pointer" }}
                          />
                        </NavLink>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        background: "#2B2A59",
                        borderRadius: "6px",
                        border: "1px solid #565891",
                        padding: "8px",
                      }}
                    >
                      <ul
                        className="d-flex justify-content-between align-items-center"
                        style={{ gap: 4, alignItems: "baseline" }}
                      >
                        <li>
                          <div
                            className="social-share-parent"
                            style={{
                              display: "inline-block",
                              position: "relative",
                            }}
                          >
                            <button className="btn v3 p-0 btn-share">
                              <img src="/assets/img/share-alt.svg"></img>
                            </button>

                            <div className="social-share-wrapper-div">
                              <a
                                className="resp-sharing-button__link"
                                href={`https://twitter.com/intent/tweet/?text=${title}&url=${link}`}
                                target="_blank"
                                rel="noopener"
                                aria-label=""
                              >
                                <div className="resp-sharing-button resp-sharing-button--twitter resp-sharing-button--small">
                                  <div
                                    aria-hidden="true"
                                    className="resp-sharing-button__icon resp-sharing-button__icon--solid"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />
                                    </svg>
                                  </div>
                                </div>
                              </a>

                              <a
                                className="resp-sharing-button__link"
                                href={`https://reddit.com/submit/?url=${link}&resubmit=true&title=${title}`}
                                target="_blank"
                                rel="noopener"
                                aria-label=""
                              >
                                <div className="resp-sharing-button resp-sharing-button--reddit resp-sharing-button--small">
                                  <div
                                    aria-hidden="true"
                                    className="resp-sharing-button__icon resp-sharing-button__icon--solid"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-6.07-1.72.08-1.1.4-3.05 1.52-3.7.72-.4 1.73-.24 3 .5C17.2 6.3 18.46 7.5 20 7.5c1.65 0 3-1.35 3-3s-1.35-3-3-3c-1.38 0-2.54.94-2.88 2.22-1.43-.72-2.64-.8-3.6-.25-1.64.94-1.95 3.47-2 4.55-2.33.08-4.45.7-6.1 1.72C4.86 8.98 3.96 8.5 3 8.5c-1.65 0-3 1.35-3 3 0 1.32.84 2.44 2.05 2.84-.03.22-.05.44-.05.66 0 3.86 4.5 7 10 7s10-3.14 10-7c0-.22-.02-.44-.05-.66 1.2-.4 2.05-1.54 2.05-2.84zM2.3 13.37C1.5 13.07 1 12.35 1 11.5c0-1.1.9-2 2-2 .64 0 1.22.32 1.6.82-1.1.85-1.92 1.9-2.3 3.05zm3.7.13c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9.8 4.8c-1.08.63-2.42.96-3.8.96-1.4 0-2.74-.34-3.8-.95-.24-.13-.32-.44-.2-.68.15-.24.46-.32.7-.18 1.83 1.06 4.76 1.06 6.6 0 .23-.13.53-.05.67.2.14.23.06.54-.18.67zm.2-2.8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5.7-2.13c-.38-1.16-1.2-2.2-2.3-3.05.38-.5.97-.82 1.6-.82 1.1 0 2 .9 2 2 0 .84-.53 1.57-1.3 1.87z" />
                                    </svg>
                                  </div>
                                </div>
                              </a>

                              <a
                                className="resp-sharing-button__link"
                                href={`https://telegram.me/share/url?text=${title}&url=${link}`}
                                target="_blank"
                                rel="noopener"
                                aria-label=""
                              >
                                <div className="resp-sharing-button resp-sharing-button--telegram resp-sharing-button--small">
                                  <div
                                    aria-hidden="true"
                                    className="resp-sharing-button__icon resp-sharing-button__icon--solid"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M.707 8.475C.275 8.64 0 9.508 0 9.508s.284.867.718 1.03l5.09 1.897 1.986 6.38a1.102 1.102 0 0 0 1.75.527l2.96-2.41a.405.405 0 0 1 .494-.013l5.34 3.87a1.1 1.1 0 0 0 1.046.135 1.1 1.1 0 0 0 .682-.803l3.91-18.795A1.102 1.102 0 0 0 22.5.075L.706 8.475z" />
                                    </svg>
                                  </div>
                                </div>
                              </a>
                            </div>
                          </div>
                        </li>
                        <li>
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
                                ? `https://v2.info.uniswap.org/pair/${this.props.match.params.pair_id}`
                                : `https://app.pangolin.exchange/#/swap?outputCurrency/${this.props.match.params.pair_id}`
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
                        </li>
                        {this.state.pairInfo?.link_coinmarketcap && (
                          <li>
                            <a
                              rel="noopener noreferrer"
                              target="_blank"
                              title="Coinmarketcap"
                              href={this.state.pairInfo?.link_coinmarketcap}
                            >
                              <img
                                src="/assets/img/coinmarketcap.svg"
                                width="18"
                                alt=""
                              />
                            </a>
                          </li>
                        )}
                        {(this.state.pairInfo?.link_coingecko ||
                          this.state.cgInfo?.link_coingecko) && (
                          <li>
                            <a
                              rel="noopener noreferrer"
                              target="_blank"
                              title="Coingecko"
                              href={
                                this.state.pairInfo?.link_coingecko ||
                                this.state.cgInfo?.link_coingecko
                              }
                            >
                              <img
                                src="/assets/img/coingecko-logo.svg"
                                width="18"
                                alt=""
                              />
                            </a>
                          </li>
                        )}
                        {(this.state.pairInfo?.link_twitter ||
                          this.state.cgInfo?.link_twitter) && (
                          <li>
                            <a
                              rel="noopener noreferrer"
                              target="_blank"
                              title="Twitter"
                              href={
                                this.state.pairInfo?.link_twitter ||
                                this.state.cgInfo?.link_twitter
                              }
                            >
                              <img src="/assets/img/twitter-color.svg"></img>
                            </a>
                          </li>
                        )}
                        {(this.state.pairInfo?.link_telegram ||
                          this.state.cgInfo?.link_telegram) && (
                          <li>
                            <a
                              rel="noopener noreferrer"
                              target="_blank"
                              title="Telegram"
                              href={
                                this.state.pairInfo?.link_telegram ||
                                this.state.cgInfo.link_telegram
                              }
                            >
                              <img src="/assets/img/telegram-color.svg"></img>
                            </a>
                          </li>
                        )}
                        <li>
                          <a
                            rel="noopener noreferrer"
                            target="_blank"
                            title={this.state.pair?.id}
                            href={
                              this.props.networkId === 1
                                ? `https://etherscan.io/address/${this.props.match.params.pair_id}`
                                : `https://cchain.explorer.avax.network/address/${this.props.match.params.pair_id}`
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
                        </li>
                        {(this.state.pairInfo?.link_website ||
                          this.state.cgInfo?.link_website) && (
                          <li>
                            <a
                              rel="noopener noreferrer"
                              target="_blank"
                              title="Website"
                              href={
                                this.state.pairInfo?.link_website ||
                                this.state.cgInfo?.link_website
                              }
                            >
                              <img src="/assets/img/external-link.svg"></img>
                            </a>
                          </li>
                        )}

                        {this.state.pairInfo?.link_audit && (
                          <li>
                            <a
                              rel="noopener noreferrer"
                              target="_blank"
                              title="Audit"
                              href={this.state.pairInfo?.link_audit}
                            >
                              <img src="/assets/img/file-pdf.svg"></img>
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div
                  className="form-container p-3 position-relative d-flex flex-column justify-content-between"
                  style={{ height: "216px" }}
                >
                  <div
                    className="content-title mb-3 p-0"
                    style={{ borderBottom: "none" }}
                  >
                    <div
                      className="purplediv"
                      style={{ background: "#8E97CD", left: "0px" }}
                    ></div>
                    <div className="content-title-top">
                      <div className="d-flex gap-2 align-items-center">
                        <img src="/assets/img/star.svg"></img>
                        <h2 className="favorites-text-title">Favorites</h2>
                      </div>
                      {this.state.favorites.length > 0 && (
                        <NavLink
                          className="outline-btn btn m-0 w-auto d-flex align-items-center"
                          style={{ gap: 5 }}
                          to="/account#my-fav"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.32229 10C3.23685 10 2.14862 10 1.06318 10C0.423045 10 0 9.57696 0 8.93683C0 6.75759 0 4.57557 0 2.39633C0 1.76177 0.423045 1.33594 1.05483 1.33594C2.36014 1.33594 3.66546 1.33594 4.97078 1.33594C5.22683 1.33594 5.39382 1.55581 5.31033 1.78125C5.26023 1.91484 5.14055 1.99834 4.98748 2.00112C4.801 2.0039 4.61174 2.00112 4.42527 2.00112C3.30365 2.00112 2.18202 2.00112 1.0604 2.00112C0.793209 2.00112 0.667965 2.12636 0.667965 2.39355C0.667965 4.57835 0.667965 6.76037 0.667965 8.94518C0.667965 9.2068 0.795992 9.33482 1.05761 9.33482C3.24242 9.33482 5.42444 9.33482 7.60924 9.33482C7.87364 9.33482 7.99889 9.20958 7.99889 8.94518C7.99889 7.65378 7.99889 6.36238 7.99889 5.07098C7.99889 5.01531 8.00167 4.95965 8.01559 4.90677C8.06012 4.75091 8.20484 4.6535 8.36348 4.6702C8.52213 4.68411 8.65015 4.81771 8.66407 4.97913C8.66685 4.99862 8.66407 5.02088 8.66407 5.04036C8.66407 6.35403 8.66407 7.66491 8.66407 8.97858C8.66407 9.45728 8.37183 9.84415 7.92096 9.96383C7.81798 9.99166 7.70943 10 7.60089 10C6.50988 10 5.41609 10 4.32229 10Z"
                              fill="#857DFA"
                            />
                            <path
                              d="M8.83322 0.667966C8.57995 0.667966 8.32668 0.667966 8.07341 0.667966C7.60583 0.667966 7.13547 0.670749 6.66789 0.667966C6.49255 0.667966 6.35339 0.537156 6.33391 0.370164C6.31721 0.205956 6.42297 0.0528806 6.58718 0.0111328C6.62336 0.00278319 6.66233 0 6.70129 0C7.67541 0 8.65231 0 9.62642 0C9.86578 0 9.99937 0.133593 9.99937 0.375731C9.99937 1.34706 9.99937 2.3184 9.99937 3.29251C9.99937 3.51517 9.86578 3.66546 9.66817 3.66824C9.46778 3.67103 9.33141 3.51795 9.33141 3.28695C9.33141 2.6162 9.33141 1.94823 9.33141 1.27748C9.33141 1.2413 9.33141 1.20234 9.33141 1.14667C9.28966 1.18564 9.26183 1.21069 9.23678 1.23574C7.69489 2.77762 6.153 4.31673 4.6139 5.8614C4.50536 5.96994 4.38846 6.03396 4.2326 5.98664C4.00995 5.91706 3.92645 5.64709 4.07396 5.4634C4.09901 5.43 4.13241 5.40217 4.16024 5.37434C5.69099 3.84359 7.22453 2.31005 8.75529 0.779293C8.78312 0.751461 8.82208 0.729196 8.85548 0.704147C8.84713 0.687448 8.83878 0.679098 8.83322 0.667966Z"
                              fill="#857DFA"
                            />
                          </svg>
                          View all
                        </NavLink>
                      )}
                    </div>
                  </div>
                  <div className="d-flex flex-column" style={{ gap: 10 }}>
                    {this.state.favorites.length === 0 ? (
                      <div className="box-inner">
                        <p className="d-flex justify-content-between align-items-center">
                          Add a favorite pair{" "}
                          <button
                            className="outline-btn btn m-0 w-auto d-flex align-items-center"
                            onClick={this.toggleFavorite}
                          >
                            Add pair
                          </button>
                        </p>
                      </div>
                    ) : (
                      this.state.favorites
                        .slice(
                          this.state.favorites.length > 3
                            ? this.state.favorites.length - 3
                            : 0,
                          this.state.favorites.length
                        )
                        .map((lock, index) => {
                          return (
                            <NavLink
                              key={index}
                              className="favRow"
                              to={`/account#my-fav`}
                            >
                              <div
                                className="d-flex m-0 justify-content-between align-items-center"
                                style={{ gap: 20 }}
                              >
                                <h2 className="favpair">
                                  {lock.token0.symbol}/{lock.token1.symbol}
                                </h2>

                                <span className="favliq">
                                  ...{lock.id.slice(35)}
                                </span>
                              </div>
                            </NavLink>
                          );
                        })
                    )}{" "}
                  </div>
                </div>
              </div>

              <div
                className="form-container p-3 position-relative d-flex flex-column justify-content-between"
                style={{ height: "296px" }}
              >
                <div className="box-inner pb-0">
                  <div className="graph-header">
                    <div className="graph-header-left">
                      <h2 className="firstbox-title">
                        {this.state.pair?.token0.symbol || "..."} /{" "}
                        {this.state.pair?.token1.symbol || "..."}
                        {"  "}
                        INFO
                      </h2>
                    </div>
                    <div className="graph-header-right">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={
                          this.props.networkId === 1
                            ? `https://app.uniswap.org/#/swap?outputCurrency=${this.state.mainToken?.id}`
                            : `https://app.pangolin.exchange/#/swap?outputCurrency=${this.state.mainToken?.id}`
                        }
                      >
                        <button
                          className="outline-btn btn d-flex align-items-center"
                          style={{ gap: 5 }}
                        >
                          <svg
                            width="12"
                            height="10"
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2.66 4.3335L0 7.00016L2.66 9.66683V7.66683H7.33333V6.3335H2.66V4.3335ZM12 3.00016L9.34 0.333496V2.3335H4.66667V3.66683H9.34V5.66683L12 3.00016Z"
                              fill="#857DFA"
                            />
                          </svg>
                          Trade
                        </button>
                      </a>
                    </div>
                  </div>
                  <div className="graph-data mb-2">
                    <div className="graph-data-item">
                      <p className="firstbox-text">Total liquidity:</p>
                      <span className="firstbox-text">
                        ${getFormattedNumber(this.state.pair?.reserveUSD, 2)}
                      </span>
                    </div>
                    <div className="graph-data-item">
                      <p className="firstbox-text">Daily volume:</p>
                      <span className="firstbox-text">
                        ${getFormattedNumber(this.state.diffVolumeUSD, 2)}
                      </span>
                    </div>
                    <div className="graph-data-item">
                      <p className="firstbox-text">
                        Pooled {this.state.pair?.token0.symbol}:
                      </p>
                      <span className="firstbox-text">
                        {getFormattedNumber(this.state.pair?.reserve0, 2)}
                      </span>
                    </div>
                    <div className="graph-data-item">
                      <p className="firstbox-text">
                        Pooled {this.state.pair?.token1.symbol}:
                      </p>
                      <span className="firstbox-text">
                        {getFormattedNumber(this.state.pair?.reserve1, 2)}
                      </span>
                    </div>
                    <div className="graph-data-item">
                      <p className="firstbox-text">Pair txns:</p>
                      <span className="firstbox-text">
                        {getFormattedNumber(this.state.pair?.txCount, 0)}
                      </span>
                    </div>
                    <div className="graph-data-item">
                      <p className="firstbox-text">LP Holders:</p>
                      <span className="firstbox-text">
                        {getFormattedNumber(
                          this.state.pair?.liquidityProviderCount,
                          0
                        )}
                      </span>
                    </div>
                    <br />
                  </div>
                </div>{" "}
                <div style={{ textAlign: "center" }}>
                  <a
                    onClick={this.toggleModal}
                    style={{ fontSize: ".7rem" }}
                    className="btn-popup btn filledbtn px-5"
                    href="javascript:void(0)"
                  >
                    View More Info
                  </a>
                </div>
              </div>

              <div
                className="form-container p-3 position-relative progress-container d-flex flex-column justify-content-between"
                style={{ minHeight: "331px", height: '100%' }}
              >
                <div
                  style={{
                    marginBottom: "14px",
                    fontSize: "20px",
                    color: "#F7F7FC",
                    fontWeight: "500",
                    lineHeight: "30px",
                  }}
                >
                  Statistics score
                </div>
                <div>
                  {false && !isNaN(this.state.pairInfo?.ts_score_avg) ? (
                    <div className="graph-progress ">
                      <div className="progress-title">
                        <p>DYP Score</p>
                        <span>
                          {getFormattedNumber(
                            this.state.pairInfo?.ts_score_avg,
                            2
                          )}
                          %
                        </span>
                      </div>
                      <div
                        title={`Security: ${getFormattedNumber(
                          this.state.pairInfo?.ts_score_security,
                          2
                        )}%`}
                        className="progress v1"
                      >
                        <div
                          style={{
                            width: `${getFormattedNumber(
                              this.state.pairInfo?.ts_score_security,
                              2
                            )}%`,
                            opacity: 1,
                          }}
                          className="progress-done-one"
                          data-done="45"
                        ></div>
                      </div>
                      <div
                        title={`Information: ${getFormattedNumber(
                          this.state.pairInfo?.ts_score_information,
                          2
                        )}%`}
                        className="progress"
                      >
                        <div
                          style={{
                            width: `${getFormattedNumber(
                              this.state.pairInfo?.ts_score_information,
                              2
                            )}%`,
                            opacity: 1,
                          }}
                          className="progress-done-two"
                          data-done="95"
                        ></div>
                      </div>
                      <div
                        title={`Liquidity: ${getFormattedNumber(
                          this.state.pairInfo?.ts_score_liquidity,
                          2
                        )}%`}
                        className="progress"
                      >
                        <div
                          style={{
                            width: `${getFormattedNumber(
                              this.state.pairInfo?.ts_score_liquidity,
                              2
                            )}%`,
                            opacity: 1,
                          }}
                          className="progress-done-three"
                          data-done="95"
                        ></div>
                      </div>
                      <div
                        title={`Tokenomics: ${getFormattedNumber(
                          this.state.pairInfo?.ts_score_tokenomics,
                          2
                        )}%`}
                        className="progress"
                      >
                        <div
                          style={{
                            width: `${getFormattedNumber(
                              this.state.pairInfo?.ts_score_tokenomics,
                              2
                            )}%`,
                            opacity: 1,
                          }}
                          className="progress-done-four"
                          data-done="95"
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="graph-progress flex-column flex-md-row gap-3 gap-lg-0">
                      <div
                        className="progress-title m-0 pb-2 progress-circle"
                        style={{
                          background: "#2B2A59",
                          borderRadius: "8px",
                          padding: "10px",
                        }}
                      >
                        <p style={{ fontSize: 16 }}>DYP Score</p>
                        <GearProgress
                          values={[0, getFormattedNumber(avg_weighted, 2)]}
                        >
                          {(value) => (
                            <CircularProgressbar
                              value={value}
                              text={`${value}%`}
                              circleRatio={0.75}
                              styles={buildStyles({
                                rotation: 1 / 2 + 1 / 8,
                                strokeLinecap: "butt",
                                trailColor: "#FBB59C",
                                pathColor: "#4ED5D2",
                              })}
                            />
                          )}
                        </GearProgress>
                      </div>
                      <div
                        className="box-inner row m-0 justify-content-between progress-table"
                        style={{ gap: 12,  }}
                      >
                        <table className="w-100">
                          <tr>
                            {scores.slice(0, 2).map((score, i) => (
                              <td>
                                {" "}
                                <div className="score-wrapper" key={i}>
                                  <span className="score-title">
                                    {score.name}
                                  </span>
                                  <div className="d-flex" style={{ gap: 5 }}>
                                    <div
                                      className="color-indicator"
                                      style={{ background: colors[i] }}
                                    ></div>
                                    <span className="score-title-points">
                                      {`${
                                        getFormattedNumber(score.score, 2) ===
                                        "100.00"
                                          ? 100
                                          : getFormattedNumber(score.score, 2)
                                      }%`}{" "}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            {scores
                              .slice(2, scores.length - 1)
                              .map((score, i) => (
                                <td>
                                  <div className="score-wrapper" key={i}>
                                    <span className="score-title">
                                      {score.name}
                                    </span>
                                    <div className="d-flex" style={{ gap: 5 }}>
                                      <div
                                        className="color-indicator"
                                        style={{ background: colors[i + 2] }}
                                      ></div>
                                      <span className="score-title-points">
                                        {`${
                                          getFormattedNumber(score.score, 2) ===
                                          "100.00"
                                            ? 100
                                            : getFormattedNumber(score.score, 2)
                                        }%`}{" "}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              ))}
                          </tr>
                          <tr>
                            {scores
                              .slice(scores.length - 1, scores.length)
                              .map((score, i) => (
                                <td>
                                  <div className="score-wrapper" key={i}>
                                    <span className="score-title">
                                      {score.name}
                                    </span>
                                    <div className="d-flex" style={{ gap: 5 }}>
                                      <div
                                        className="color-indicator"
                                        style={{
                                          background: colors[scores.length - 1],
                                        }}
                                      ></div>
                                      <span className="score-title-points">
                                        {`${
                                          getFormattedNumber(score.score, 2) ===
                                          "100.00"
                                            ? 100
                                            : getFormattedNumber(score.score, 2)
                                        }%`}{" "}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              ))}
                          </tr>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="graph-progress2 mt-2">
                  <div
                    className="progress-title"
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <p className="community">
                      Community Trust{" "}
                      <span style={{ color: "#4ED5D2" }}>
                        {(
                          (this.state.upvoteCount /
                            (this.state.voteCount || 1)) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </p>
                    <p>{this.state.voteCount} votes</p>
                  </div>
                  <div>
                    <div className="d-flex flex-col justify-content-between align-items-center gap-2">
                      <div>
                        <span
                          onClick={() => this.registerVote(true)}
                          style={{
                            position: "relative",
                            cursor: "pointer",
                            width: "30px",
                            height: "30px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "#1E1C40",
                            borderRadius: "8px",
                          }}
                        >
                          <img src="/assets/img/thumbsup.svg"></img>
                        </span>
                      </div>
                      <div className="w-100">
                        <div className="progress">
                          <div
                            style={{
                              width: `${(
                                (this.state.upvoteCount /
                                  (this.state.voteCount || 1)) *
                                100
                              ).toFixed(2)}%`,
                              opacity: 1,
                            }}
                            className="progress-done-five"
                          ></div>
                        </div>
                      </div>
                      <div>
                        <span
                          onClick={() => this.registerVote(false)}
                          style={{
                            position: "relative",
                            cursor: "pointer",
                            width: "30px",
                            height: "30px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "#1E1C40",
                            borderRadius: "8px",
                          }}
                        >
                          <img src="/assets/img/thumbsdown.svg"></img>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rightside">
              <div className="graph-right">
                <div className="search-box d-flex gap-2 justify-content-between align-items-center">
                  <form
                    className="col-6"
                    id="searchform"
                    style={{
                      background: "#312F69",
                      padding: "10px",
                      borderRadius: "12px",
                      boxShadow: "0px 32px 64px rgba(17, 17, 17, 0.12)",
                    }}
                  >
                    <input
                      value={this.state.query}
                      onChange={(e) => this.handleQuery(e.target.value)}
                      type="text"
                      id="search-bar"
                      autoComplete="off"
                      placeholder="Search Pairs"
                      style={{
                        background: "transparent",
                        border: "1px solid #8E97CD",
                        color: "#fff",
                        borderRadius: "8px",
                      }}
                      className="pair-explorer-input"
                    />
                    <ul
                      className="output"
                      style={{
                        display:
                          this.state.searchResults.length == 0
                            ? "none"
                            : "block",
                        zIndex: 9,
                        maxHeight: "300px",
                        overflowY: "auto",
                        borderRadius: "8px",
                        marginLeft: "-10px",
                      }}
                    >
                      {this.state.searchResults.map((p) => (
                        <NavLink
                          to={`/pair-explorer/${p.pair.address.toLowerCase()}`}
                        >
                          <li key={p.id} className="prediction-item">
                            <div className="suggest-item">
                              <h2
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: 500,
                                  color: "#FCFCF7",
                                }}
                              >
                                <span className="wh_txt">
                                  {p.pair.token_1.symbol}
                                </span>
                                /{p.pair.token_0.symbol}
                                <span className="bar">-</span> (
                                {p.pair.token_0.name})
                              </h2>
                              <p
                                style={{
                                  fontSize: ".85rem",
                                  fontWeight: 400,
                                  marginBottom: "5px",
                                }}
                              >
                                Token: ...
                                {p.pair.token_0.address
                                  .toLowerCase()
                                  .slice(34)}{" "}
                                - Pair: ...
                                {p.pair.address.toLowerCase().slice(34)}
                              </p>
                              <div className="d-flex gap-1 align-items-center">
                                <p
                                  style={{
                                    opacity: "1",
                                    color: "#4ED5D2",
                                    fontSize: "12px",
                                    lineHeight: "18px",
                                    fontWeight: "400",
                                  }}
                                >
                                  Total liquidity:
                                </p>
                                <span
                                  style={{
                                    opacity: "1",
                                    color: "#4ED5D2",
                                    fontSize: "12px",
                                    lineHeight: "18px",
                                    fontWeight: "400",
                                  }}
                                >
                                  ${getFormattedNumber(p.pair.reserve, 2)}
                                </span>
                              </div>
                            </div>
                          </li>
                        </NavLink>
                      ))}
                    </ul>
                    <button type="submit" id="submit">
                      <img
                        src="/assets/img/search-purple.svg"
                        alt="Image"
                        style={{ marginTop: "11px" }}
                      />
                    </button>
                  </form>
                  <div className="position-relative col-6">
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
                        }}
                      >
                        <h6 className="optiontext">
                          <img src={avaxlogo} alt="" /> Avalanche
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-box d-flex flex-column" style={{ gap: 20 }}>
                <div className="chart-wrap" style={{ marginTop: 0 }}>
                  <div>
                    {this.state.mainToken && this.state.pair && (
                      <TVChartContainer
                        mainToken={this.state.mainToken}
                        onBarsRequest={this.onBarsRequest}
                        registerBarSubscription={this.registerBarSubscription}
                        pair={this.state.pair}
                        networkId={this.props.networkId}
                        theme={
                          this.props.theme == "theme-white" ? "Light" : "Dark"
                        }
                      />
                    )}
                  </div>
                </div>

                <div className="form-container p-3 position-relative">
                  <div
                    className="purplediv"
                    style={{ background: "#8E97CD", left: "0px" }}
                  ></div>
                  {this.GetDataTable()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal show={this.state.show} onHide={this.toggleModal}>
          <Modal.Header>
            <Modal.Title>More Info</Modal.Title>
            <img
              onClick={this.toggleModal}
              src="/assets/img/xMark.svg"
              style={{ cursor: "pointer" }}
            ></img>
          </Modal.Header>
          <Modal.Body>
            <div className="my-4">
              <div className="row gap-4 m-0 mb-4">
                <div
                  className="col"
                  style={{
                    background: "#26264F",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    className="mb-3"
                    style={{ color: "#857DFA", fontSize: "12px" }}
                  >
                    Market Cap
                  </div>
                  <div>
                    {" "}
                    {getFormattedNumber(
                      this.state.cgInfo?.market_cap_usd,
                      2
                    )}{" "}
                    USD{" "}
                  </div>
                </div>
                <div
                  className="col"
                  style={{
                    background: "#26264F",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    className="mb-3"
                    style={{ color: "#857DFA", fontSize: "12px" }}
                  >
                    {" "}
                    Fully Diluted Valuation
                  </div>
                  <div>
                    {" "}
                    {getFormattedNumber(this.state.cgInfo?.fdv_usd, 2)} USD{" "}
                  </div>
                </div>

                <div
                  className="col"
                  style={{
                    background: "#26264F",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    className="mb-3"
                    style={{ color: "#857DFA", fontSize: "12px" }}
                  >
                    {" "}
                    Total Supply
                  </div>
                  <div>
                    {" "}
                    {getFormattedNumber(
                      this.state.mainTokenTotalSupply,
                      2
                    )}{" "}
                    {this.state.mainToken?.symbol}{" "}
                  </div>
                </div>

                <div
                  className="col"
                  style={{
                    background: "#26264F",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    className="mb-3"
                    style={{ color: "#857DFA", fontSize: "12px" }}
                  >
                    {" "}
                    Circulating Supply
                  </div>
                  <div>
                    {" "}
                    {getFormattedNumber(
                      this.state.cgInfo?.circulating_supply,
                      2
                    )}{" "}
                    {this.state.mainToken?.symbol}{" "}
                  </div>
                </div>
              </div>

              <div className="row gap-4 m-0 mb-4">
                <div
                  className="col"
                  style={{
                    background: "#26264F",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    className="mb-3"
                    style={{ color: "#857DFA", fontSize: "12px" }}
                  >
                    {" "}
                    1{" "}
                    {this.state.pair &&
                      this.state.pair[`token${baseTokenKey}`].symbol}{" "}
                  </div>
                  <div>
                    {" "}
                    {this.state.pair &&
                      getFormattedNumber(
                        this.state.pair[`reserve${mainTokenKey}`] /
                          this.state.pair[`reserve${baseTokenKey}`],
                        6
                      )}{" "}
                    {this.state.mainToken?.symbol}{" "}
                  </div>
                </div>
                <div
                  className="col"
                  style={{
                    background: "#26264F",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    className="mb-3"
                    style={{ color: "#857DFA", fontSize: "12px" }}
                  >
                    {" "}
                    Pooled {this.state.mainToken?.symbol}{" "}
                  </div>
                  <div>
                    {" "}
                    {getFormattedNumber(
                      this.state.pair &&
                        this.state.pair[`reserve${mainTokenKey}`],
                      2
                    )}{" "}
                    (
                    {(
                      ((this.state.pair &&
                        this.state.pair[`reserve${mainTokenKey}`]) /
                        this.state.mainTokenTotalSupply) *
                      100
                    ).toFixed(4)}
                    %)
                  </div>
                </div>
                <div
                  className="col"
                  style={{
                    background: "#26264F",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    className="mb-3"
                    style={{ color: "#857DFA", fontSize: "12px" }}
                  >
                    {" "}
                    Pool Created
                  </div>
                  <div>
                    {" "}
                    {moment(this.state.pair?.createdAtTimestamp * 1e3).format(
                      "YYYY-MM-DD HH:mm"
                    )}{" "}
                  </div>
                </div>
              </div>

              <div
                className="d-flex justify-content-between align-items-center"
                style={{
                  background: "#26264F",
                  borderRadius: "8px",
                  padding: "10px 15px 10px 15px",
                  border: "1px solid #565891",
                }}
              >
                <div>
                  {" "}
                  <NavLink to={`/locker/${this.props.match.params.pair_id}`}>
                    <strong
                      style={{ color: "#857DFA", textDecoration: "underline" }}
                    >
                      LP On DYP Locker{" "}
                      <img
                        style={{ marginLeft: "20px" }}
                        src={PairLocker}
                      ></img>{" "}
                    </strong>
                  </NavLink>
                </div>
                <div> ${getFormattedNumber(this.state.usdValueOfLP, 2)} </div>
              </div>
            </div>
            {(this.state.pairInfo?.project_comment_public ||
              this.state.pairInfo?.ts_comment_public) &&
              this.props.isPremium && (
                <div>
                  <h5 className="mb-3">About Project</h5>
                  <p style={{ fontSize: ".8rem" }}>
                    {this.state.pairInfo.project_comment_public}{" "}
                  </p>
                  <p style={{ fontSize: ".8rem" }}>
                    {this.state.pairInfo.ts_comment_public}{" "}
                  </p>
                </div>
              )}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
