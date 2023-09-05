import "./header.css";
import Web3 from "web3";
import getFormattedNumber from "../../functions/get-formatted-number";
import React, { useEffect, useState } from "react";
import coin from "./assets/coins.svg";
import avax from "./assets/avax.svg";
import bnb from "./assets/bnb.svg";
import eth from "./assets/eth.svg";
import dropdown from "./assets/dropdown.svg";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { shortAddress } from "../../functions/shortAddress";
import ellipse from "./assets/ellipse.svg";
import user from "./assets/user.svg";
import plans from "./assets/plans.svg";
import logoutimg from "./assets/logout.svg";
import walletIcon from "./assets/walletIcon.svg";
import WalletModal from "../WalletModal";
import { handleSwitchNetworkhook } from "../../functions/hooks";
import { NavLink } from "react-router-dom";
import useWindowSize from "../../functions/useWindowSize";
import toolsLogo from "../../assets/sidebarIcons/toolsLogo.svg";
import axios from "axios";
import { useLocation } from "react-router-dom";
import error from "../../assets/error.svg";
const Header = ({
  toggleMobileSidebar,
  toggleTheme,
  theme,
  chainId,
  coinbase,
  logout,
  handleSwitchNetwork,
  showModal,
  show,
  hideModal,
  handleConnection,
  isConnected,
  appState,
}) => {
  const [gasPrice, setGasprice] = useState();
  const [ethPrice, setEthprice] = useState();
  const [username, setUsername] = useState();
  // const [chainId, setChainId] = useState(1)

  const windowSize = useWindowSize();
  const [hotpairs, setHotpairs] = useState([]);

  const [ethState, setEthState] = useState(true);
  const [bnbState, setBnbState] = useState(false);
  const [avaxState, setAvaxState] = useState(false);
  const [avatar, setAvatar] = useState("../../assets/img/person.svg");
  const routeData = useLocation();

  const { ethereum } = window;

  const setActiveChain = () => {
    if (chainId === 1) {
      setAvaxState(false);
      setBnbState(false);
      setEthState(true);
    } else if (chainId === 43114) {
      setAvaxState(true);
      setBnbState(false);
      setEthState(false);
    } else if (chainId === 56) {
      setAvaxState(false);
      setBnbState(true);
      setEthState(false);
    } else {
      setAvaxState(false);
      setBnbState(false);
      setEthState(false);
    }
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

  const handleBnbPool = async () => {
    await handleSwitchNetworkhook("0x38")
      .then(() => {
        handleSwitchNetwork("56");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleAvaxPool = async () => {
    await handleSwitchNetworkhook("0xa86a")
      .then(() => {
        handleSwitchNetwork("43114");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  function handleChainChanged() {
    // We recommend reloading the page, unless you must do otherwise
    // window.location.reload();

    if (window.location.href.includes("pair-explorer")) {
      if (chainId === 1) {
        window.location.assign(
          "/pair-explorer/0x497070e8b6c55fd283d8b259a6971261e2021c01"
        );
      } else {
        window.location.assign(
          "/pair-explorer/0x76911e11fddb742d75b83c9e1f611f48f19234e4"
        );
      }
    }
  }

  const fetchAvatar = async () => {
    const response = await fetch(
      `https://api-image.dyp.finance/api/v1/avatar/${coinbase}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.avatar
          ? setAvatar(data.avatar)
          : setAvatar("/assets/img/person.svg");
      })
      .catch(console.error);

    return response;
  };

  const fetchUsername = async () => {
    if (coinbase) {
      await axios
        .get(`https://api-image.dyp.finance/api/v1/username/${coinbase}`)
        .then((res) => {
          if (res.data.username) {
            setUsername(res.data.username);
          } else {
            setUsername("Dypian");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setUsername("Dypian");
    }
  };
  const [currencyAmount, setCurrencyAmount] = useState(0);
  const checklogout = localStorage.getItem("logout");
  //  console.log(isConnected)
  const getEthBalance = async () => {
    if (checklogout === "false" && coinbase) {
      const balance = await ethereum.request({
        method: "eth_getBalance",
        params: [coinbase, "latest"],
      });

      if (balance) {
        const infuraWeb3 = new Web3(window.config.infura_endpoint);

        const bscWeb3 = new Web3(window.config.bsc_endpoint);
        const avaxWeb3 = new Web3(window.config.avax_endpoint);
        if (chainId === 1) {
          const stringBalance = infuraWeb3.utils.hexToNumberString(balance);
          const amount = infuraWeb3.utils.fromWei(stringBalance, "ether");
          setCurrencyAmount(amount.slice(0, 7));
        }

        if (chainId === 43114) {
          const stringBalance = avaxWeb3.utils.hexToNumberString(balance);
          const amount = avaxWeb3.utils.fromWei(stringBalance, "ether");
          setCurrencyAmount(amount.slice(0, 7));
        }

        if (chainId === 56) {
          const stringBalance = bscWeb3.utils.hexToNumberString(balance);
          const amount = bscWeb3.utils.fromWei(stringBalance, "ether");
          setCurrencyAmount(amount.slice(0, 7));
        }
      }
    }
  };

  const welcomeTypes = ["Good morning", "Good afternoon", "Good evening"];
  const [welcomeText, setwelcomeText] = useState("");
  const hour = new Date().getHours();

  const setGreeting = () => {
    if (hour < 12) setwelcomeText(welcomeTypes[0]);
    else if (hour < 18) setwelcomeText(welcomeTypes[1]);
    else setwelcomeText(welcomeTypes[2]);
  };

  useEffect(() => {
    setGreeting();
  }, [hour]);

  useEffect(() => {
    getEthBalance();
    if (chainId === 1) {
      handleSwitchNetwork("1");
    }

    if (chainId === 56) {
      handleSwitchNetwork("56");
    }

    if (chainId === 43114) {
      handleSwitchNetwork("43114");
    }
  }, [chainId, currencyAmount, coinbase]);

  useEffect(() => {
    // fetchData().then();
    // refreshHotPairs().then();
    setActiveChain();
    ethereum?.on("chainChanged", handleChainChanged);
  }, [chainId, ethState]);

  useEffect(() => {
    if (coinbase !== undefined && coinbase !== null) {
      fetchAvatar();
      fetchUsername();
    }
  }, [coinbase, checklogout]);

  return (
    <>
      <header className="header-wrap" style={{ zIndex: 5 }}>
        <div className="container-fluid d-flex justify-content-center justify-content-lg-start">
          <div className="row w-100">
            <div className="col-1"></div>
            <div
              className={`${
                windowSize.width < 991
                  ? "col-12"
                  : windowSize.width < 1490
                  ? "col-11"
                  : "col-10"
              }`}
            >
              <div
                className="container-lg px-0 d-flex justify-content-between gap-3 align-items-center w-100"
                // style={{ maxWidth: "calc(100% - 215px)"}}
              >
                {/* marginLeft: "240px" */}
                <div className="d-none d-lg-flex flex-column gap-2 text-start">
                  <h4
                    className="text-white"
                    style={{ fontSize: "23px", fontWeight: "600" }}
                  >
                    {welcomeText}, {username}
                  </h4>
                  <span className="text-white headerdesc">
                    Discover the latest trends, breaking news, and gain access
                    to powerful dApps.
                  </span>
                </div>
                <NavLink to="/">
                  <img src={toolsLogo} className="d-flex d-lg-none" alt="" />
                </NavLink>
                <div className="d-flex m-0 justify-content-between gap-3 align-items-center">
                  <NavLink className="buydyp-btn btn" to="/buydyp">
                    <img src={coin} alt="" />
                    <span className="buy-dyp-text d-none d-lg-flex">
                      Buy DYP
                    </span>
                  </NavLink>
                  <div className="d-flex justify-content-between gap-3 align-items-center">
                    {routeData.pathname &&
                      routeData.pathname !== "/bridge" &&
                      routeData.pathname !== "/swap" && (
                        <DropdownButton
                          id="dropdown-basic-button"
                          className="d-flex align-items-center justify-content-center"
                          title={
                            <span className="dropdown-title">
                              <img
                                src={
                                  ethState === true
                                    ? eth
                                    : bnbState === true
                                    ? bnb
                                    : avaxState === true
                                    ? avax
                                    : error
                                }
                                height={16}
                                width={16}
                                alt=""
                              />
                              <span className="change-chain-text d-none d-lg-flex">
                                {ethState === true
                                  ? "Ethereum"
                                  : bnbState === true
                                  ? "BNB Chain"
                                  : avaxState === true
                                  ? "Avalanche"
                                  : "Unsupported Chain"}
                              </span>

                              <img src={dropdown} alt="" />
                            </span>
                          }
                        >
                          <Dropdown.Item onClick={() => handleEthPool()}>
                            <img src={eth} alt="" />
                            Ethereum
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleBnbPool()}>
                            <img src={bnb} alt="" />
                            BNB Chain
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleAvaxPool()}>
                            <img src={avax} alt="" />
                            Avalanche
                          </Dropdown.Item>
                        </DropdownButton>
                      )}
                    {/* <DropdownButton
                id="dropdown-basic-button2"
                onClick={checklogout === "true" && showModal}
                title={
                  <span className="dropdown-title walletaccount">
                    {checklogout === "false" && (
                      <img
                        src={avatar}
                        style={{
                          height: 18,
                          borderRadius: "50%",
                          border: "1px solid #00D849",
                        }}
                        alt=""
                      />
                    )}
                    {checklogout === "false" ? (
                      shortAddress(coinbase)
                    ) : (
                      <span className="d-flex align-items-center gap-2 connecttitle position-relative" style={{bottom: '5px'}}>
                        <img
                          src={walletIcon}
                          alt=""
                          className="position-relative"
                          // style={{ top: 4 }}
                        />
                        Connect Wallet
                      </span>
                    )}
                    {checklogout === "false" && <img src={dropdown} alt="" />}
                  </span>
                }
              >
                <Dropdown.Item
                  onClick={() => window.location.assign("/account")}
                >
                  <img src={user} alt="" />
                  Your account
                </Dropdown.Item>
                {checklogout === "false" && (
                  <Dropdown.Item onClick={() => logout()}>
                    <img src={logoutimg} alt="" />
                    Disconnect wallet
                  </Dropdown.Item>
                )}
              </DropdownButton> */}
                    {isConnected === true &&
                      coinbase !== undefined &&
                      coinbase !== null &&
                      routeData.pathname !== "/swap" && (
                        <>
                          <div className="account-info d-none d-lg-flex align-items-center justify-content-center gap-2 gap-lg-3">
                            <span className="account-balance d-none d-lg-flex">
                              {currencyAmount}{" "}
                              {chainId === 1
                                ? "ETH"
                                : chainId === 56
                                ? "BNB"
                                : chainId === 43114
                                ? "AVAX"
                                : ""}
                            </span>
                            <span className="account-address">
                              {windowSize.width > 786
                                ? shortAddress(coinbase)
                                : coinbase?.slice(0, 6) + "..."}
                            </span>
                          </div>
                          <DropdownButton
                            id="dropdown-basic-button4"
                            title={
                              <img
                                src={avatar}
                                style={{
                                  height: 40,
                                  width: 40,
                                  borderRadius: "50%",
                                  border: "2px solid #4ED5D2",
                                  margin: "auto",
                                }}
                                alt=""
                              />
                            }
                          >
                            <Dropdown.Item>
                              <NavLink
                                to={appState.isPremium ? "/account" : "/plans"}
                                className={"d-flex w-100"}
                              >
                                <span className="d-flex gap-2 align-items-center">
                                  <img src={user} alt="" />
                                  My account
                                </span>
                              </NavLink>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => logout()}>
                              <img src={logoutimg} alt="" />
                              Disconnect wallet
                            </Dropdown.Item>
                          </DropdownButton>
                        </>
                      )}
                    {isConnected === false &&
                      (coinbase !== undefined || coinbase !== null) &&
                      routeData.pathname !== "/swap" && (
                        <DropdownButton
                          onClick={isConnected === false && showModal}
                          id="dropdown-basic-button2"
                          title={
                            <div
                              className="d-flex align-items-center gap-2  position-relative"
                              style={{ bottom: "5px", fontSize: "12px" }}
                            >
                              <img
                                src={walletIcon}
                                alt=""
                                className="position-relative"
                                // style={{ top: 4 }}
                              />
                              <span className="connecttitle d-none d-lg-flex">
                                Connect Wallet
                              </span>
                            </div>
                          }
                        ></DropdownButton>
                      )}
                    {isConnected === false &&
                      (coinbase !== undefined || coinbase !== null) &&
                      routeData.pathname !== "/swap" && (
                        <NavLink
                          to="/plans"
                          className="account-user-wrapper d-flex align-items-center gap-1"
                        >
                          <img
                            src={require(`./assets/user2.svg`).default}
                            alt=""
                          />
                          <span className="account-user d-none d-lg-flex">
                            Account
                          </span>
                        </NavLink>
                      )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-1"></div>
          </div>
        </div>
      </header>

      {show && (
        <WalletModal
          show={show}
          handleClose={hideModal}
          handleConnection={handleConnection}
        />
      )}
    </>
  );
};

export default Header;
