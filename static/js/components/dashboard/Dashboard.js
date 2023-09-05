import React, { useEffect, useState } from "react";
import "./dashboard.css";
import TopPoolsCard from "../top-pools-card/TopPoolsCard";
import NewsCard from "../newsCard/NewsCard";
import GovCard from "../gov-card/GovCard";
import BridgeCard from "../bridgecard/BridgeCard";
import ExplorerCard from "../explorer-card/ExplorerCard";
import Calculator from "../calculator/Calculator";
import FaqCard from "../faqcard/FaqCard";
import LaunchpadCard from "../launchpad-card/LaunchpadCard";
import ChainlinkCard from "../chainlink-card/ChainlinkCard";
import TrendingNews from "../newsCard/TrendingNews";
import rightarrow from "./assets/right-arrow.svg";
import { NavLink } from "react-router-dom";
import useWindowSize from "../../functions/useWindowSize";
import axios from "axios";
import getFormattedNumber from "../../functions/get-formatted-number";
import stakeAvax from "../FARMINNG/stakeAvax";
import { FadeLoader } from "react-spinners";
import CawsDetails from "../FARMINNG/caws";
import StakeBsc from "../FARMINNG/bscConstantStake";
import LandCard from "../top-pools-card/LandCard";
import LandDetails from "../FARMINNG/land";
import StakeAvax from "../FARMINNG/stakeAvax";
import StakeNewEth from "../FARMINNG/stakeNewEth";
import CawsWodDetails from "../FARMINNG/cawsWod";
import CawsWodCard from "../top-pools-card/CawsWodCard";
import BscFarmingFunc from "../FARMINNG/BscFarmingFunc";

const Dashboard = ({
  isConnected,
  coinbase,
  the_graph_result,
  lp_id,
  network,
  handleConnection,
  the_graph_resultbsc,
  the_graph_resultavax,
  referrer,
  handleSwitchNetwork,
}) => {
  const [topPools, setTopPools] = useState([]);
  const [cawsLandCard, setCawsLandCard] = useState([]);
  const [theBnbPool, setTheBnbPool] = useState({});
  const [wbnbPrice, setWbnbPrice] = useState();

  const [userPools, setuserPools] = useState([]);
  const wbsc_address = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

  const fetchUserPools = async () => {
    if (coinbase && coinbase.includes("0x")) {
      const result = await axios
        .get(`https://api.dyp.finance/api/user_pools/${coinbase}`)
        .then((data) => {
          return data.data.PoolsUserIn;
        });
      setuserPools(result);
    }
  };

  const fetchBscFarming = async () => {
    await axios
      .get("https://api.dyp.finance/api/the_graph_bsc_v2")
      .then((res) => {
        let temparray = Object.entries(res.data.the_graph_bsc_v2.lp_data);
        let bnbpool = temparray.filter((item) => {
          setWbnbPrice(res.data.the_graph_bsc_v2.usd_per_eth);
          return (
            item[1].id ===
            "0x1bc61d08a300892e784ed37b2d0e63c85d1d57fb-0x5bc3a80a1f2c4fb693d9dddcebbb5a1b5bb15d65"
          );
        });
        setTheBnbPool(bnbpool);
      })
      .catch((err) => console.error(err));
  };

  const fetchBnbStaking = async () => {
    return await axios
      .get(`https://api.dyp.finance/api/get_staking_info_bnb`)
      .then((res) => {
        const dypdypBnb = res.data.stakingInfoDYPBnb;

        const cleanCards = dypdypBnb.filter((item) => {
          return item.expired !== "Yes";
        });

        const sortedAprs = cleanCards.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });
        // console.log(sortedAprs[0])
        setTopPools(sortedAprs.slice(0, 1));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchAvaxStaking = async () => {
    return await axios
      .get(`https://api.dyp.finance/api/get_staking_info_avax`)
      .then((res) => {
        const dypIdypBnb = res.data.stakingInfoDYPAvax;

        const cleanCards = dypIdypBnb.filter((item) => {
          return item.expired !== "Yes";
        });

        const sortedAprs = cleanCards.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });
        setTopPools(sortedAprs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const [landCard, setLandCard] = useState({});

  const fetchEthStaking = async () => {
    await axios
      .get(`https://api.dyp.finance/api/get_staking_info_eth`)
      .then((res) => {
        const dypIdyp = res.data.stakingInfoDYPEth;

        const cleanCards = dypIdyp.filter((item) => {
          return item.expired !== "Yes";
        });

        const sortedAprs = cleanCards.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });

        const finalEthCards = sortedAprs;
        setTopPools(finalEthCards.slice(0, 1));

        setLandCard(res.data.stakingInfoLAND[0]);

        const land = res.data.stakinginfoCAWSLAND;
        setCawsLandCard(land[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const [activeCard, setActiveCard] = useState();
  const [activeCardFarm, setActiveCardFarm] = useState();

  const [cardIndex, setcardIndex] = useState();
  const [details, setDetails] = useState();
  const [popularNewsData, setPopularNewsData] = useState([]);
  const [activeCard2, setActiveCard2] = useState();
  const [loading, setLoading] = useState(true);

  // let network = parseInt(network);

  const eth_address = "ETH";

  const expirearrayStakeBscDyp2 = ["14 July 2023", "5 August 2023"];

  const { LP_IDs_V2BNB } = window;

  const LP_IDBNB_Array = [
    LP_IDs_V2BNB.wbnb[0],
    LP_IDs_V2BNB.wbnb[1],
    LP_IDs_V2BNB.wbnb[2],
    LP_IDs_V2BNB.wbnb[3],
    LP_IDs_V2BNB.wbnb[4],
  ];

  const avax_address = "AVAX";

  const faqItems = [
    {
      title: "What is Dypius Stake?",
      option: "Staking",
      pathName: "/earn",
      section: "earnFaq",
      pool: null,
      faqIndex: 1,
    },
    {
      title: "What is the Reinvest function?",
      option: "Staking",
      pathName: "/earn",
      section: "earnFaq",
      pool: null,
      faqIndex: 14,
    },
    {
      title: "What is APR?",
      option: "Farming",
      pathName: "/earn",
      section: "earnFaq",
      pool: null,
      faqIndex: 6,
    },
    {
      title: "What is Dypius Vault?",
      option: "Vault",
      pathName: "/earn",
      section: "earnFaq",
      pool: null,
      faqIndex: 0,
    },
    {
      title: "What is Dypius Bridge?",
      option: "Bridge",
      pathName: "/bridge",
      section: "earnFaq",
      pool: null,
      faqIndex: 0,
    },
    {
      title: "Will my lock period reset if I deposit ad...",
      option: "Farming",
      pathName: "/earn",
      section: "earnFaq",
      pool: null,
      faqIndex: 4,
    },
  ];

  const fetchPopularNewsData = async () => {
    const result = await fetch(`https://news-manage.dyp.finance/api/populars/3`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setPopularNewsData(data);
      })
      .catch(console.error);

    return result;
  };

  const fetchStakeData = async () => {
    if (network === 1) {
      // setTimeout(() => {
      await fetchEthStaking();
      // }, 1000);
    } else if (network === 56) {
      // setTimeout(() => {
      await fetchBnbStaking();
      // }, 1000);
    }
    if (network === 43114) {
      // setTimeout(() => {
      await fetchAvaxStaking();
      // }, 1000);
    }
  };

  useEffect(() => {
    fetchStakeData().then();
    setTimeout(() => {
      setLoading(false);
    }, 2500);
    fetchPopularNewsData();
    fetchUserPools();
    fetchBscFarming();
  }, [network, coinbase, loading]);

  const windowSize = useWindowSize();

  return (
    <div className="container-lg dashboardwrapper px-0">
      <div className="d-flex m-0 flex-column flex-xxl-row justify-content-between gap-4">
        <div className="d-flex flex-column gap-4 justify-content-between">
          <div className="d-flex flex-column flex-md-row m-0 gap-3 justify-content-between">
            <Calculator />
            <div className="d-flex flex-column gap-3 gap-lg-4 justify-content-between dashboard-cards-wrapper">
              <ExplorerCard />
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                <GovCard />
                <BridgeCard />
              </div>
            </div>
          </div>
          <div>
            <div className="row m-0 align-items-center justify-content-between gap-2 w-100 pb-2">
              <h6 className="top-pools-title">Top Pools</h6>
              <NavLink
                to="/earn"
                className="view-more-title d-flex justify-content-center align-items-center gap-1"
              >
                View all <img src={rightarrow} alt="" />{" "}
              </NavLink>
            </div>
            {windowSize.width > 786 ? (
              <div>
                <div className="row m-0 gap-4 toppool-allwrapper">
                  {/* {network === 1 && (
                    <LandCard
                      network={network.toString()}
                      onShowDetailsClick={() => {
                        setActiveCard(1);
                        setcardIndex(1);
                        setDetails(1);
                      }}
                      onHideDetailsClick={() => {
                        setActiveCard(null);
                        setDetails();
                      }}
                      cardType={"table"}
                      details={details === 1 ? true : false}
                      expired={false}
                      // tvl={"$" + getFormattedNumber(cawsCard2.tvl_usd)}
                      tvl={"$" + getFormattedNumber(landCard.tvl_usd)}
                      apr={landCard.apy_percent}
                    />
                  )} */}

                  {network === 1 && loading === false ? (
                    <CawsWodCard
                      network={network.toString()}
                      onShowDetailsClick={() => {
                        setActiveCard(2);
                        setcardIndex(2);
                        setDetails(2);
                      }}
                      onHideDetailsClick={() => {
                        setActiveCard(null);
                        setDetails();
                      }}
                      cardType={"table"}
                      details={details === 2 ? true : false}
                      expired={false}
                      tvl={"$" + getFormattedNumber(cawsLandCard.tvl_usd)}
                    />
                  ) : null}

                  {topPools.length > 0 &&
                  network !== 56 &&
                  loading === false ? (
                    topPools.slice(0, 2).map((item, index) => {
                      return (
                        <TopPoolsCard
                          key={index}
                          network={network.toString()}
                          isNewPool={item.new_pool === "Yes" ? true : false}
                          isStaked={
                            userPools.length > 0
                              ? userPools.find(
                                  (obj) => obj.contract_address === item.id
                                )
                                ? true
                                : false
                              : false
                          }
                          chain={network}
                          top_pick={item.top_pick}
                          tokenName={item.pair_name}
                          apr={item.apy_percent + "%"}
                          tvl={"$" + getFormattedNumber(item.tvl_usd)}
                          lockTime={item.lock_time ? item.lock_time : 30}
                          tokenLogo={
                            item.icon
                              ? item.icon
                              : item.pair_name === "iDYP"
                              ? "idypius.svg"
                              : item.pair_name === "DYP"
                              ? "dyplogo.svg"
                              : "newCawsLogo.png"
                          }
                          onShowDetailsClick={() => {
                            setActiveCard(topPools[index]);
                            setcardIndex(index);
                            setDetails(index);
                          }}
                          onHideDetailsClick={() => {
                            setActiveCard(null);
                            setDetails();
                          }}
                          cardType={"table"}
                          details={details === index ? true : false}
                          expired={false}
                        />
                      );
                    })
                  ) : topPools.length > 0 &&
                    network === 56 &&
                    loading === false ? (
                    topPools.map((item, index) => {
                      return (
                        <>
                          <TopPoolsCard
                            chain={"bnb"}
                            top_pick={false}
                            tokenName={"WBNB"}
                            apr={`${getFormattedNumber(
                              theBnbPool[0][1].apy_percent,
                              0
                            )}%`}
                            tvl={`$${getFormattedNumber(
                              theBnbPool[0][1].tvl_usd,
                              2
                            )}`}
                            lockTime={"3 Days"}
                            tokenLogo={"bnb.svg"}
                            onShowDetailsClick={() => {
                              setActiveCard(null);
                              setActiveCard2(null);
                              setDetails(1);
                              setActiveCardFarm(1);
                            }}
                            onHideDetailsClick={() => {
                              setActiveCard(null);
                              setDetails();
                              setActiveCardFarm();
                            }}
                            cardType={"Farming"}
                            details={details === 1 ? true : false}
                            isNewPool={true}
                            isStaked={false}
                            expired={false}
                            network={network.toString()}
                          />
                          <TopPoolsCard
                            key={index}
                            network={network.toString()}
                            isNewPool={item.new_pool === "Yes" ? true : false}
                            isStaked={
                              userPools.length > 0
                                ? userPools.find(
                                    (obj) => obj.contract_address === item.id
                                  )
                                  ? true
                                  : false
                                : false
                            }
                            chain={network}
                            top_pick={item.top_pick}
                            tokenName={item.pair_name}
                            apr={item.apy_percent + "%"}
                            tvl={"$" + getFormattedNumber(item.tvl_usd)}
                            lockTime={item.lock_time ? item.lock_time : 30}
                            tokenLogo={
                              item.icon
                                ? item.icon
                                : item.pair_name === "iDYP"
                                ? "idypius.svg"
                                : item.pair_name === "DYP"
                                ? "dyplogo.svg"
                                : "newCawsLogo.png"
                            }
                            onShowDetailsClick={() => {
                              setActiveCard(topPools[index]);
                              setcardIndex(index);
                              setDetails(index);
                            }}
                            onHideDetailsClick={() => {
                              setActiveCard(null);
                              setDetails();
                            }}
                            cardType={"table"}
                            details={details === index ? true : false}
                            expired={false}
                          />
                        </>
                      );
                    })
                  ) : (
                    <div
                      className="w-100 d-flex justify-content-center align-items-center mt-5"
                      style={{ gridColumn: "1 / 3" }}
                    >
                      <FadeLoader color="#7770DF" />
                    </div>
                  )}
                </div>
                {activeCard && network === 1 ? (
                  activeCard &&
                  network === 1 &&
                  topPools[cardIndex]?.id ===
                    "0xeb7dd6b50db34f7ff14898d0be57a99a9f158c4d" ? (
                    <StakeNewEth
                      staking={window.constant_staking_newi3}
                      apr={
                        topPools[cardIndex]?.apy_percent
                          ? topPools[cardIndex]?.apy_percent
                          : 30
                      }
                      liquidity={eth_address}
                      expiration_time={"11 January 2024"}
                      finalApr={
                        topPools[cardIndex]?.apy_performancefee
                          ? topPools[cardIndex]?.apy_performancefee
                          : 30
                      }
                      fee_s={0}
                      lockTime={
                        topPools[cardIndex]?.lock_time === "No lock"
                          ? "No Lock"
                          : topPools[cardIndex]?.lock_time?.split(" ")[0]
                      }
                      lp_id={LP_IDBNB_Array[cardIndex]}
                      listType={"table"}
                      other_info={false}
                      is_wallet_connected={isConnected}
                      coinbase={coinbase}
                      the_graph_result={the_graph_result}
                      chainId={network.toString()}
                      handleConnection={handleConnection}
                      handleSwitchNetwork={handleSwitchNetwork}
                      expired={false}
                      referrer={referrer}
                    />
                  ) : activeCard && network === 1 && cardIndex === 2 ? (
                    <CawsWodDetails
                      coinbase={coinbase}
                      isConnected={isConnected}
                      listType={"table"}
                      chainId={network.toString()}
                      handleSwitchNetwork={handleSwitchNetwork}
                      handleConnection={handleConnection}
                      expired={false}
                      renderedPage={"dashboard"}
                    />
                  ) : (
                    <></>
                  )
                ) : activeCard &&
                  network === 56 &&
                  topPools[cardIndex]?.id ===
                    "0x7c82513b69c1b42c23760cfc34234558119a3399" ? (
                  <StakeBsc
                    lp_id={LP_IDBNB_Array[cardIndex]}
                    staking={window.constant_stakingbsc_new111}
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={wbsc_address}
                    expiration_time={"14 March 2024"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    fee={topPools[cardIndex]?.performancefee}
                    lockTime={
                      topPools[cardIndex]?.lock_time === "No lock"
                        ? "No Lock"
                        : topPools[cardIndex]?.lock_time?.split(" ")[0]
                    }
                    listType={"table"}
                    other_info={false}
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_resultbsc}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    referrer={referrer}
                  />
                ) : activeCardFarm && network === 56 ? (
                  <BscFarmingFunc
                    is_wallet_connected={isConnected}
                    wbnbPrice={wbnbPrice}
                    coinbase={coinbase}
                    latestTvl={theBnbPool[0][1].tvl_usd}
                    the_graph_result={the_graph_resultbsc}
                    lp_id={LP_IDBNB_Array[cardIndex]}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    expired={false}
                    handleSwitchNetwork={handleSwitchNetwork}
                    latestApr={theBnbPool[0][1].apy_percent}
                    liquidity={wbsc_address}
                    constant={window.farming_activebsc_1}
                    staking={window.constant_staking_newbscactive1}
                    token={window.token_newbsc}
                    lp_symbol={"USD"}
                    lock="3 Days"
                    rebase_factor={1}
                    expiration_time={"18 July 2024"}
                    fee="0.4"
                    finalApr={theBnbPool[0][1].apy_percent}
                    lockTime={3}
                    listType={"table"}
                  />
                ) : activeCard &&
                  network === 43114 &&
                  topPools[cardIndex].id ===
                    "0xb1875eeBbcF4456188968f439896053809698a8B" ? (
                  <StakeAvax
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_resultavax}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    staking={window.constant_staking_new11}
                    listType={"table"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={avax_address}
                    expiration_time={"15 August 2023"}
                    other_info={false}
                    fee_s={topPools[cardIndex]?.performancefee}
                    fee_u={topPools[cardIndex]?.performancefee}
                    lockTime={30}
                  />
                ) : activeCard &&
                  network === 43114 &&
                  topPools[cardIndex].id ===
                    "0x6eb643813f0b4351b993f98bdeaef6e0f79573e9" ? (
                  <StakeAvax
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_resultavax}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    staking={window.constant_staking_new12}
                    listType={"table"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={avax_address}
                    expiration_time={"14 March 2024"}
                    other_info={false}
                    fee_s={topPools[cardIndex]?.performancefee}
                    fee_u={topPools[cardIndex]?.performancefee}
                    lockTime={"No Lock"}
                  />
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                <div className="row m-0 gap-4 toppool-allwrapper">
                  {/* {network === 1 && (
                    <LandCard
                      network={network.toString()}
                      onShowDetailsClick={() => {
                        setActiveCard(1);
                        setcardIndex(1);
                        setDetails(1);
                      }}
                      onHideDetailsClick={() => {
                        setActiveCard(null);
                        setDetails();
                      }}
                      cardType={"table"}
                      details={details === 1 ? true : false}
                      expired={false}
                      // tvl={"$" + getFormattedNumber(cawsCard2.tvl_usd)}
                      tvl={"$" + getFormattedNumber(landCard.tvl_usd)}
                      apr={landCard.apy_percent}
                    />
                  )}
                  {activeCard && network === 1 && cardIndex === 1 && (
                    <LandDetails
                      coinbase={coinbase}
                      isConnected={isConnected}
                      listType={"table"}
                      chainId={network.toString()}
                      handleSwitchNetwork={handleSwitchNetwork}
                      handleConnection={handleConnection}
                      apr={landCard.apy_percent}
                      totalNftsLocked={landCard.total_nfts_locked}
                    />
                  )} */}
                  {network === 1 && (
                    <CawsWodCard
                      network={network.toString()}
                      onShowDetailsClick={() => {
                        setActiveCard(2);
                        setcardIndex(2);
                        setDetails(2);
                      }}
                      onHideDetailsClick={() => {
                        setActiveCard(null);
                        setDetails();
                      }}
                      cardType={"table"}
                      details={details === 2 ? true : false}
                      expired={false}
                      tvl={"$" + getFormattedNumber(cawsLandCard.tvl_usd)}
                      // tvl={"$" + getFormattedNumber(landCard.tvl_usd)}
                      // apr={landCard.apy_percent}
                    />
                  )}
                  {activeCard && network === 1 && cardIndex === 2 ? (
                    <CawsWodDetails
                      coinbase={coinbase}
                      isConnected={isConnected}
                      listType={"table"}
                      chainId={network.toString()}
                      handleSwitchNetwork={handleSwitchNetwork}
                      handleConnection={handleConnection}
                      expired={false}
                      renderedPage={"dashboard"}
                    />
                  ) : (
                    <></>
                  )}
                  {topPools.length > 0 &&
                  loading === false &&
                  network !== 56 ? (
                    topPools.slice(0, 1).map((item, index) => {
                      return (
                        <TopPoolsCard
                          key={index}
                          network={network.toString()}
                          chain={network}
                          top_pick={item.top_pick}
                          tokenName={item.pair_name}
                          apr={item.apy_percent + "%"}
                          tvl={"$" + getFormattedNumber(item.tvl_usd)}
                          lockTime={item.lock_time ? item.lock_time : 30}
                          tokenLogo={
                            item.icon
                              ? item.icon
                              : item.pair_name === "iDYP"
                              ? "idypius.svg"
                              : item.pair_name === "DYP"
                              ? "dyplogo.svg"
                              : "newCawsLogo.png"
                          }
                          onShowDetailsClick={() => {
                            setActiveCard(topPools[index]);
                            setcardIndex(index);
                            setActiveCard2(null);
                            setDetails(index);
                          }}
                          onHideDetailsClick={() => {
                            setActiveCard(null);
                            setActiveCard2(null);
                            setDetails();
                          }}
                          cardType={"table"}
                          details={details === index ? true : false}
                          expired={false}
                          isNewPool={item.new_pool === "Yes" ? true : false}
                          isStaked={
                            userPools.length > 0
                              ? userPools.find(
                                  (obj) => obj.contract_address === item.id
                                )
                                ? true
                                : false
                              : false
                          }
                        />
                      );
                    })
                  ) : topPools.length > 0 &&
                    loading === false &&
                    network === 56 ? (
                    topPools.map((item, index) => {
                      return (
                        <>
                          <TopPoolsCard
                            chain={"bnb"}
                            top_pick={false}
                            tokenName={"WBNB"}
                            apr={`${getFormattedNumber(
                              theBnbPool[0][1].apy_percent,
                              0
                            )}%`}
                            tvl={`$${getFormattedNumber(
                              theBnbPool[0][1].tvl_usd,
                              2
                            )}`}
                            lockTime={"3 Days"}
                            tokenLogo={"bnb.svg"}
                            onShowDetailsClick={() => {
                              setActiveCard();
                              setActiveCard2();
                              setDetails(1);
                              setActiveCardFarm(1);
                            }}
                            onHideDetailsClick={() => {
                              setActiveCard();
                              setDetails();
                              setActiveCardFarm();
                            }}
                            cardType={"Farming"}
                            details={details === 1 ? true : false}
                            isNewPool={true}
                            isStaked={false}
                            expired={false}
                            network={network.toString()}
                          />
                        </>
                      );
                    })
                  ) : (
                    <div
                      className="w-100 d-flex justify-content-center align-items-center mt-5"
                      style={{ gridColumn: "1 / 3" }}
                    >
                      <FadeLoader color="#7770DF" />
                    </div>
                  )}
                </div>

                {activeCard && network === 1 && cardIndex === 0 && (
                  <StakeNewEth
                    staking={window.constant_staking_newi3}
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={eth_address}
                    expiration_time={"11 January 2024"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    fee_s={0}
                    lockTime={
                      topPools[cardIndex]?.lock_time === "No lock"
                        ? "No Lock"
                        : topPools[cardIndex]?.lock_time?.split(" ")[0]
                    }
                    lp_id={LP_IDBNB_Array[cardIndex]}
                    listType={"table"}
                    other_info={false}
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_result}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    referrer={referrer}
                  />
                )}

                {activeCardFarm && network === 56 ? (
                  <BscFarmingFunc
                    is_wallet_connected={isConnected}
                    wbnbPrice={wbnbPrice}
                    coinbase={coinbase}
                    latestTvl={theBnbPool[0][1].tvl_usd}
                    the_graph_result={the_graph_resultbsc}
                    lp_id={LP_IDBNB_Array[cardIndex]}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    expired={false}
                    handleSwitchNetwork={handleSwitchNetwork}
                    latestApr={theBnbPool[0][1].apy_percent}
                    liquidity={wbsc_address}
                    constant={window.farming_activebsc_1}
                    staking={window.constant_staking_newbscactive1}
                    token={window.token_newbsc}
                    lp_symbol={"USD"}
                    lock="3 Days"
                    rebase_factor={1}
                    expiration_time={"18 July 2024"}
                    fee="0.4"
                    finalApr={theBnbPool[0][1].apy_percent}
                    lockTime={3}
                    listType={"table"}
                  />
                ) : activeCard &&
                  network === 43114 &&
                  topPools[cardIndex].id ===
                    "0xb1875eeBbcF4456188968f439896053809698a8B" ? (
                  <StakeAvax
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_resultavax}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    staking={window.constant_staking_new11}
                    listType={"table"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={avax_address}
                    expiration_time={"15 August 2023"}
                    other_info={false}
                    fee_s={topPools[cardIndex]?.performancefee}
                    fee_u={topPools[cardIndex]?.performancefee}
                    lockTime={30}
                  />
                ) : activeCard &&
                  network === 43114 &&
                  topPools[cardIndex].id ===
                    "0x6eb643813f0b4351b993f98bdeaef6e0f79573e9" ? (
                  <StakeAvax
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_resultavax}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    staking={window.constant_staking_new12}
                    listType={"table"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={avax_address}
                    expiration_time={"14 March 2024"}
                    other_info={false}
                    fee_s={topPools[cardIndex]?.performancefee}
                    fee_u={topPools[cardIndex]?.performancefee}
                    lockTime={"No Lock"}
                  />
                ) : (
                  <></>
                )}
                <div className="row m-0 gap-4 toppool-allwrapper">
                  {topPools.length > 0 &&
                  loading === false &&
                  network !== 56 ? (
                    topPools.slice(1, 2).map((item, index) => {
                      return (
                        <TopPoolsCard
                          network={network.toString()}
                          key={index}
                          chain={network}
                          top_pick={item.top_pick}
                          tokenName={item.pair_name}
                          apr={item.apy_percent + "%"}
                          tvl={"$" + getFormattedNumber(item.tvl_usd)}
                          lockTime={item.lock_time ? item.lock_time : 30}
                          tokenLogo={
                            item.icon
                              ? item.icon
                              : item.pair_name === "iDYP"
                              ? "idypius.svg"
                              : item.pair_name === "DYP"
                              ? "dyplogo.svg"
                              : "newCawsLogo.png"
                          }
                          onShowDetailsClick={() => {
                            setActiveCard2(topPools[index + 1]);
                            setActiveCard(null);
                            setcardIndex(index + 1);
                            setDetails(index + 1);
                          }}
                          onHideDetailsClick={() => {
                            setActiveCard2(null);
                            setDetails();
                            setActiveCard(null);
                          }}
                          cardType={"table"}
                          details={details === index + 1 ? true : false}
                          expired={false}
                          isNewPool={item.new_pool === "Yes" ? true : false}
                          isStaked={
                            userPools.length > 0
                              ? userPools.find(
                                  (obj) => obj.contract_address === item.id
                                )
                                ? true
                                : false
                              : false
                          }
                        />
                      );
                    })
                  ) : topPools.length > 0 &&
                    loading === false &&
                    network === 56 ? (
                    topPools.map((item, index) => {
                      return (
                        <TopPoolsCard
                          network={network.toString()}
                          key={index}
                          chain={network}
                          top_pick={item.top_pick}
                          tokenName={item.pair_name}
                          apr={item.apy_percent + "%"}
                          tvl={"$" + getFormattedNumber(item.tvl_usd)}
                          lockTime={item.lock_time ? item.lock_time : 30}
                          tokenLogo={
                            item.icon
                              ? item.icon
                              : item.pair_name === "iDYP"
                              ? "idypius.svg"
                              : item.pair_name === "DYP"
                              ? "dyplogo.svg"
                              : "newCawsLogo.png"
                          }
                          onShowDetailsClick={() => {
                            setActiveCard2(1);
                            setActiveCard(null);
                            setcardIndex(3);
                            setDetails(index + 2);
                          }}
                          onHideDetailsClick={() => {
                            setActiveCard2(null);
                            setDetails();
                            setActiveCard(null);
                          }}
                          cardType={"table"}
                          details={details === index + 2 ? true : false}
                          expired={false}
                          isNewPool={item.new_pool === "Yes" ? true : false}
                          isStaked={
                            userPools.length > 0
                              ? userPools.find(
                                  (obj) => obj.contract_address === item.id
                                )
                                ? true
                                : false
                              : false
                          }
                        />
                      );
                    })
                  ) : (
                    <div
                      className="w-100 d-flex justify-content-center align-items-center mt-5"
                      style={{ gridColumn: "1 / 3" }}
                    >
                      <FadeLoader color="#7770DF" />
                    </div>
                  )}
                </div>
                {activeCard2 && network === 1 ? (
                  activeCard2 && network === 1 && cardIndex === 0 ? (
                    <StakeNewEth
                      staking={window.constant_staking_newi3}
                      apr={
                        topPools[cardIndex]?.apy_percent
                          ? topPools[cardIndex]?.apy_percent
                          : 30
                      }
                      liquidity={eth_address}
                      expiration_time={"11 January 2024"}
                      finalApr={
                        topPools[cardIndex]?.apy_performancefee
                          ? topPools[cardIndex]?.apy_performancefee
                          : 30
                      }
                      fee_s={0}
                      lockTime={
                        topPools[cardIndex]?.lock_time === "No lock"
                          ? "No Lock"
                          : topPools[cardIndex]?.lock_time?.split(" ")[0]
                      }
                      lp_id={LP_IDBNB_Array[cardIndex]}
                      listType={"table"}
                      other_info={false}
                      is_wallet_connected={isConnected}
                      coinbase={coinbase}
                      the_graph_result={the_graph_result}
                      chainId={network.toString()}
                      handleConnection={handleConnection}
                      handleSwitchNetwork={handleSwitchNetwork}
                      expired={false}
                      referrer={referrer}
                    />
                  ) : activeCard2 && network === 1 && cardIndex === 2 ? (
                    <CawsWodDetails
                      coinbase={coinbase}
                      isConnected={isConnected}
                      listType={"table"}
                      chainId={network.toString()}
                      handleSwitchNetwork={handleSwitchNetwork}
                      handleConnection={handleConnection}
                      expired={false}
                      renderedPage={"dashboard"}
                    />
                  ) : (
                    <></>
                  )
                ) : activeCard2 &&
                  network === 56 &&
                  topPools[0]?.id ===
                    "0x7c82513b69c1b42c23760cfc34234558119a3399" ? (
                  <StakeBsc
                    lp_id={LP_IDBNB_Array[cardIndex]}
                    staking={window.constant_stakingbsc_new111}
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={wbsc_address}
                    expiration_time={"14 March 2024"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    fee={topPools[cardIndex]?.performancefee}
                    lockTime={
                      topPools[cardIndex]?.lock_time === "No lock"
                        ? "No Lock"
                        : topPools[cardIndex]?.lock_time?.split(" ")[0]
                    }
                    listType={"table"}
                    other_info={false}
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_resultbsc}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    referrer={referrer}
                  />
                ) : activeCard2 &&
                  network === 43114 &&
                  topPools[cardIndex].id ===
                    "0xb1875eeBbcF4456188968f439896053809698a8B" ? (
                  <StakeAvax
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_resultavax}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    staking={window.constant_staking_new11}
                    listType={"table"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={avax_address}
                    expiration_time={"15 August 2023"}
                    other_info={false}
                    fee_s={topPools[cardIndex]?.performancefee}
                    fee_u={topPools[cardIndex]?.performancefee}
                    lockTime={30}
                  />
                ) : activeCard2 &&
                  network === 43114 &&
                  topPools[cardIndex].id ===
                    "0x6eb643813f0b4351b993f98bdeaef6e0f79573e9" ? (
                  <StakeAvax
                    is_wallet_connected={isConnected}
                    coinbase={coinbase}
                    the_graph_result={the_graph_resultavax}
                    chainId={network.toString()}
                    handleConnection={handleConnection}
                    handleSwitchNetwork={handleSwitchNetwork}
                    expired={false}
                    staking={window.constant_staking_new12}
                    listType={"table"}
                    finalApr={
                      topPools[cardIndex]?.apy_performancefee
                        ? topPools[cardIndex]?.apy_performancefee
                        : 30
                    }
                    apr={
                      topPools[cardIndex]?.apy_percent
                        ? topPools[cardIndex]?.apy_percent
                        : 30
                    }
                    liquidity={avax_address}
                    expiration_time={"14 March 2024"}
                    other_info={false}
                    fee_s={topPools[cardIndex]?.performancefee}
                    fee_u={topPools[cardIndex]?.performancefee}
                    lockTime={"No Lock"}
                  />
                ) : (
                  <></>
                )}
              </div>
            )}
          </div>
          <div className="row m-0 align-items-center justify-content-between gap-2 w-100">
            <h6 className="top-pools-title">News</h6>
            <NavLink
              className="view-more-title d-flex justify-content-center align-items-center gap-1"
              to="/news"
            >
              View all <img src={rightarrow} alt="" />
            </NavLink>
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-between px-0">
              {popularNewsData !== [] && (
                <>
                  {" "}
                  <TrendingNews
                    image={popularNewsData[0]?.image}
                    title={popularNewsData[0]?.title}
                    date={popularNewsData[0]?.date}
                    link={popularNewsData[0]?.id}
                  />
                  <div className="d-flex flex-column flex-lg-row gap-3 regular-news">
                    <NewsCard
                      image={popularNewsData[1]?.image}
                      title={popularNewsData[1]?.title}
                      date={popularNewsData[1]?.date}
                      link={popularNewsData[1]?.id}
                    />
                    <NewsCard
                      image={popularNewsData[2]?.image}
                      title={popularNewsData[2]?.title}
                      date={popularNewsData[2]?.date}
                      link={popularNewsData[2]?.id}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="right-side-wrapper d-flex flex-column flex-md-row flex-xxl-column gap-4">
          <div className="launchpad-section-wrapper d-flex flex-column gap-3 gap-xxl-1">
            <h6 className="header">Launchpad</h6>
            <LaunchpadCard />
          </div>
          <ChainlinkCard />
          <div
            className="faq-items-wrapper d-flex flex-column"
            style={{ gap: "11px" }}
          >
            <h6 className="header">FAQs</h6>
            <div className="faq-grid">
              {faqItems.map((faq, index) => (
                <FaqCard
                  key={index}
                  title={faq.title}
                  option={faq.option}
                  pathName={faq.pathName}
                  section={faq.section}
                  pool={faq.pool}
                  faqIndex={faq.faqIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
