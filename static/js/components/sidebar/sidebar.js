import { NavLink } from "react-router-dom";
// import Ethereum from "../assets/ethereum.svg";
// import Avax from "../assets/avalanche.svg";
// import Logo from "../assets/logo.svg";
// import LogoWhite from "../assets/logo-white.svg";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWeb3React } from "@web3-react/core";
// import { handleSwitchNetwork } from "../functions/hooks";
// import { injected } from "../../functions/connectors";
// import NotConnected from "../assets/notconnected.svg";
// import Connected from "../assets/connected.svg";
// import SubmitInfo from "../submit-info/SubmitInfo";
// import Crown from "../assets/crown.png";
// import RightArrow from "../assets/rightarrow.svg";
import { useEagerConnect, useInactiveListener } from "../../functions/hooks";
// import axios from "axios";
// import WalletModal from "../WalletModal";
// import Logout from "../assets/logout.svg";
import toolsLogo from "../../assets/sidebarIcons/toolsLogo.svg";
import toolsLogoActive from "../../assets/sidebarIcons/toolsLogoActive.svg";
import accordionIndicator from "../../assets/sidebarIcons/accordionIndicator.svg";
import sidebarDypius from "../../assets/sidebarDypius.svg";
import "./sidebar.css";
import navRadius from "../../assets/navRadius.svg";
import useWindowSize from "../../functions/useWindowSize";
import sidebarPremium from "./assets/sidebarPremium.png";

const activateLasers = () => {
  window.$.alert("Coming Soon!");
};

const Sidebar = (props) => {
  // const [activeBtn, setActiveBtn] = useState("avax");
  const [activeLink, setActiveLink] = useState(null);
  const [hover, setHover] = useState(null);
  const [location, setlocation] = useState("news");
  // const [networkId, setNetworkId] = useState(1);
  const [activeSidebar, setActiveSidebar] = useState(false);

  let chainId = parseInt(props.network);

  const [avatar, setAvatar] = useState("/assets/img/person.svg");

  const { active, account } = useWeb3React();

    const triedEager = useEagerConnect();
    useInactiveListener(!triedEager);


  const fetchAvatar = async () => {
    const response = await fetch(
      `https://api-image.dyp.finance/api/v1/avatar/${account}`
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

  // useEffect(() => {
  //   const logout = localStorage.getItem("logout");
  //   if (logout !== "true") {
  //     fetchAvatar().then();
  //   }
  // }, [account]);

  const windowSize = useWindowSize();

  const openSidebar = () => {
    if (windowSize.width < 1800) {
      setActiveSidebar(true);
    } else if (windowSize.width > 1800) {
      setActiveSidebar(true);
    }
  };

  const closeSidebar = () => {
    if (windowSize.width < 1800) {
      setActiveSidebar(false);
    } else if (windowSize.width > 1800) {
      setActiveSidebar(true);
    }
  };

  const sidebar = document.querySelector(".testbar");

  sidebar?.addEventListener("mouseover", openSidebar);
  sidebar?.addEventListener("mouseleave", closeSidebar);

  useEffect(() => {
    // const fetchInterval = setInterval(
    //   () => setlocation(window.location.pathname),
    //   1000
    // );
    if (windowSize.width > 1800) {
      setActiveSidebar(true);
    } else if (windowSize.width < 1800) {
      setActiveSidebar(false);
    }
  }, [windowSize]);

  const sidebarItems = [
    {
      label: "Earn",
      icon: "earnIcon",
      link: "/earn",
    },
    {
      label: "Governance",
      icon: "governanceIcon",
      link: "/governance",
    },
    {
      label: "Bridge",
      icon: "bridgeIcon",
      link: "/bridge",
    },
    {
      label: "Yields",
      icon: "yieldsIcon",
      link: "/farms",
      // children: [
      //   {
      //     title: "Pair explorer",
      //     link: "/pair-explorer",
      //   },
      //   {
      //     title: "Pool explorer",
      //     link: "/pool-explorer",
      //   },
      //   {
      //     title: "Big Swap",
      //     link: "/big-swap-explorer",
      //   },
      //   {
      //     title: "Top Tokens",
      //     link: "/top-tokens",
      //   },
      //   {
      //     title: "Yields",
      //     link: "/farms",
      //   },
      //   {
      //     title: "Submit Form",
      //     link: "/submit-info",
      //   },
      // ],
    },
    {
      label: "Projects",
      icon: "projectsIcon",
      children: [
        {
          title: "Launchpad",
          link: "/launchpad",
        },
        {
          title: "DYP Locker",
          link: "/locker",
        },
      ],
    },
    {
      label: "Swap",
      icon: "swapIcon",
      link: "/swap",
    },
    {
      label: "News",
      icon: "newsIcon",
      link: "/news",
    },
  ];

  const sidebarItem = document.querySelectorAll(".sidebar-item");

  const windowUrl = window.location.href;

  return (
    <div
      id="sidebar"
      style={{ padding: "2.5rem 0" }}
      className={`testbar ${
        activeSidebar ? "testbar-open" : null
      } d-none d-lg-flex flex-column gap-3 justify-content-between align-items-start`}
    >
      <img
        src={navRadius}
        className={`nav-radius ${activeSidebar && "nav-radius-open"}`}
        alt=""
      />
      <div className="w-100">
        <div className="d-flex w-100 justify-content-center align-items-center pb-5">
          <NavLink to="/" onClick={() => setActiveLink("")}>
            <img
              src={activeSidebar ? toolsLogoActive : toolsLogo}
              alt=""
              style={{ height: "40px" }}
            />
          </NavLink>
        </div>
        <div
          className={`sidebar-container w-100 justify-content-center ${
            activeSidebar ? "align-items-start" : "align-items-center"
          } d-flex flex-column gap-4`}
          style={{ gap: 35 }}
        >
          <div
            className={`sidebar-container w-100 accordion justify-content-center ${
              activeSidebar ? "align-items-start" : "align-items-center"
            } d-flex flex-column gap-4`}
            id="accordionExample2"
          >
            {sidebarItems.map((sideItem, index) =>
              sideItem.children?.length > 0 ? (
                <div key={index}>
                  <div
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${sideItem.label}`}
                    aria-expanded="true"
                    aria-controls={`collapse${sideItem.label}`}
                    id={`heading${sideItem.label}`}
                    className={`sidebar-item gap-3 p-2 d-flex ${
                      activeSidebar
                        ? "active-width justify-content-start ms-4"
                        : "justify-content-center"
                    } align-items-center ${
                      activeLink === sideItem.label ? "active-side-link" : null
                    }`}
                    onClick={() => setActiveLink(sideItem.label)}
                    onMouseEnter={() => setHover(sideItem.label)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <img
                      src={
                        require(`../../assets/sidebarIcons/${
                          activeLink === sideItem.label ||
                          hover === sideItem.label
                            ? sideItem.icon + "Active.svg"
                            : sideItem.icon + ".svg"
                        }`).default
                      }
                      alt=""
                      style={{ width: 32, height: 32 }}
                    />
                    {activeSidebar && (
                      <div className="d-flex w-100 flex-row align-items-center justify-content-between">
                        <h3
                          className={
                            activeLink === sideItem.label ||
                            hover === sideItem.label
                              ? "active-text"
                              : "sideitem-text"
                          }
                        >
                          {sideItem.label}
                        </h3>
                        <img
                          src={accordionIndicator}
                          alt="indicator"
                          id="indicator"
                        />
                      </div>
                    )}
                  </div>
                  <div
                    id={`collapse${sideItem.label}`}
                    className={`accordion-collapse collapse ${
                      sideItem.children.filter((obj) => {
                        return windowUrl.includes(obj.link);
                      })
                        ? "open"
                        : null
                    }`}
                    aria-labelledby={`heading${sideItem.label}`}
                    data-bs-parent="#accordionExample2"
                  >
                    {activeSidebar ? (
                      <div className="accordion-container d-flex flex-column gap-2 ms-5">
                        {sideItem.children.map((child, index) => (
                          <NavLink
                            key={index}
                            to={child.link}
                            className={(isActive) =>
                              isActive
                                ? "accordion-child accordion-child-active"
                                : "accordion-child"
                            }
                          >
                            {child.title}
                          </NavLink>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                sideItem.link?.length > 0 && (
                  <NavLink to={sideItem.link}>
                    <div
                      key={index}
                      id={sideItem.label}
                      className={`sidebar-item gap-3 p-2 d-flex ${
                        activeSidebar
                          ? "active-width justify-content-start ms-4"
                          : "justify-content-center"
                      } align-items-center ${
                        activeLink === sideItem.label
                          ? "active-side-link"
                          : null
                      }`}
                      onClick={() => setActiveLink(sideItem.label)}
                      onMouseEnter={() => setHover(sideItem.label)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <img
                        src={
                          require(`../../assets/sidebarIcons/${
                            activeLink === sideItem.label ||
                            hover === sideItem.label
                              ? sideItem.icon + "Active.svg"
                              : sideItem.icon + ".svg"
                          }`).default
                        }
                        alt=""
                        style={{ width: 32, height: 32 }}
                      />
                      {activeSidebar && (
                        <h3
                          className={
                            activeLink === sideItem.label ||
                            hover === sideItem.label
                              ? "active-text"
                              : "sideitem-text"
                          }
                        >
                          {sideItem.label}
                        </h3>
                      )}
                    </div>
                  </NavLink>
                )
              )
            )}
          </div>
        </div>
      </div>
      {activeSidebar && (props.isPremium === false || props.isPremium === null) && (
        <NavLink
          to={"/plans"}
          className="d-flex align-items-center justify-content-center"
        >
          <img src={sidebarPremium} alt="" style={{ width: "80%" }} />
        </NavLink>
      )}
    </div>
    // <div
    //   onClick={props.toggleMobileSidebar}
    //   className={`sidebar ${props.isOpenInMobile ? "open" : ""}`}
    // >
    //   <div className="close-sidebar">
    //     <i className="fas fa-arrow-left"></i>
    //   </div>
    //   <div className="logo">
    //     <a href="/news">
    //       <img className="logo-white" src={LogoWhite} alt="Image" />
    //       <img className="logo-black" src={Logo} alt="Image" />
    //     </a>
    //   </div>
    //   <div
    //     className="d-flex flex-column justify-content-between "
    //     style={{ height: "90%" }}
    //   >
    //     <div className="premiumposition">
    //       <div className="menu-cat-one" style={{ marginTop: "2rem" }}>
    //         <div className="walletwrapper">
    //           <div
    //             className="top-right-header"
    //             style={{
    //               background: props.isConnected
    //                 ? chainId === 1
    //                   ? "linear-gradient(87.56deg, #1D91D0 9.37%, #32B1F7 93.57%)"
    //                   : "linear-gradient(87.56deg, #FC4F36 9.37%, #E30613 93.57%)"
    //                 : "rgba(255, 255, 255, 0.3)",
    //             }}
    //           >
    //             <WalletModal
    //               show={props.show}
    //               handleClose={props.hideModal}
    //               handleConnection={props.handleConnection}
    //             />
    //             <div className="home-menu">
    //               <a href="#" id="wallet">
    //                 <img
    //                   src={!props.isConnected ? NotConnected : Connected}
    //                   alt="Image"
    //                 />
    //                 {/* <i style={{color: '#fff'}} className='fas fa-wallet'></i> */}
    //                 {!props.isConnected ? (
    //                   <span
    //                     style={{
    //                       color: "#6B7A99",
    //                     }}
    //                     className="notconnect-text"
    //                   >
    //                     Wallet not connected
    //                   </span>
    //                 ) : (
    //                   // <span>test</span>
    //                   <span
    //                     style={{
    //                       color: "#fff",
    //                     }}
    //                     className="connect-text"
    //                   >
    //                     Connected!
    //                   </span>
    //                 )}
    //                 {props.isConnected && (
    //                   <span onClick={props.logout} className="d-flex">
    //                     <img
    //                       src={Logout}
    //                       alt=""
    //                       style={{
    //                         transform: "rotate(180deg)",
    //                         height: 15,
    //                         marginLeft: 10,
    //                       }}
    //                     />
    //                     <span style={{ color: "#fff" }}>Logout</span>
    //                   </span>
    //                 )}
    //               </a>
    //               {!props.isConnected && (
    //                 <button
    //                   className="connectwalletbtn"
    //                   onClick={(e) => {
    //                     e.preventDefault();
    //                     // injected.activate(injected, undefined, true);
    //                     props.showModal();
    //                   }}
    //                 >
    //                   Connect
    //                 </button>
    //               )}
    //             </div>
    //           </div>
    //           <h6
    //             className="networks row m-0"
    //             style={{
    //               border:
    //                 chainId === 1 ? "1px solid #1486C3" : "1px solid #E84142",
    //             }}
    //           >
    //             <a
    //               href="javascript:void(0)"
    //               className="hoverNetwork"
    //               style={{
    //                 background: chainId === 1 ? "#1D91D0" : "transparent",
    //               }}
    //               onClick={() => {
    //                 setActiveBtn("eth");
    //                 props.handleSwitchNetwork(1);
    //               }}
    //             >
    //               <img src={Ethereum} alt="Image not found" />
    //               <span
    //                 style={{
    //                   color: chainId === 1 ? "#fff" : "#6B7A99",
    //                 }}
    //                 className="network-text"
    //               >
    //                 Ethereum
    //               </span>
    //             </a>
    //             <a
    //               href="javascript:void(0)"
    //               className="hoverNetwork"
    //               style={{
    //                 padding: "4px 11px 0",
    //                 background: chainId === 43114 ? "#E84142" : "transparent",
    //               }}
    //               onClick={() => {
    //                 setActiveBtn("avax");
    //                 props.handleSwitchNetwork(43114);
    //               }}
    //             >
    //               <img src={Avax} alt="Image not found" />
    //               <span
    //                 style={{
    //                   color: chainId === 43114 ? "#fff" : "#6B7A99",
    //                 }}
    //               >
    //                 Avalanche
    //               </span>
    //             </a>
    //           </h6>
    //         </div>
    //         <ul style={{ width: "fit-content", margin: "auto" }}>
    //           <div
    //             className="row m-auto align-items-center twolinks-wrapper"
    //             style={{ width: "fit-content" }}
    //           >
    //             <li
    //               className={
    //                 location.includes("pool-explorer")
    //                   ? "activenavlink"
    //                   : "navlinks"
    //               }
    //             >
    //               <NavLink
    //                 exact
    //                 to="/pool-explorer"
    //                 onClick={() => {
    //                   setActiveLink("explorer");
    //                 }}
    //                 className={
    //                   location.includes("pool-explorer")
    //                     ? "activelink"
    //                     : "navlinkitem"
    //                 }
    //               >
    //                 <img
    //                   src={
    //                     location.includes("pool-explorer") &&
    //                     props.theme === "theme-white"
    //                       ? "/assets/img/search.svg"
    //                       : location.includes("pool-explorer") &&
    //                         props.theme === "theme-dark"
    //                       ? "/assets/img/search-white.svg"
    //                       : "/assets/img/search-passive.svg"
    //                   }
    //                   alt="Image"
    //                 />
    //                 <span className="sidebar-link">Explorer</span>
    //               </NavLink>
    //             </li>
    //             <li
    //               className={
    //                 location.includes("pair-explorer")
    //                   ? "activenavlink"
    //                   : "navlinks"
    //               }
    //             >
    //               <NavLink
    //                 to="/pair-explorer"
    //                 onClick={() => {
    //                   setActiveLink("pair");
    //                 }}
    //                 className={
    //                   location.includes("pair-explorer")
    //                     ? "activelink"
    //                     : "navlinkitem"
    //                 }
    //               >
    //                 <img
    //                   src={
    //                     location.includes("pair-explorer") &&
    //                     props.theme === "theme-white"
    //                       ? "/assets/img/compass.svg"
    //                       : location.includes("pair-explorer") &&
    //                         props.theme === "theme-dark"
    //                       ? "/assets/img/compass-white.svg"
    //                       : "/assets/img/compass-passive.svg"
    //                   }
    //                   alt="Image"
    //                 />
    //                 <span className="sidebar-link">Pair Explorer</span>
    //               </NavLink>
    //             </li>
    //           </div>
    //           <div
    //             className="row m-auto align-items-center twolinks-wrapper"
    //             style={{
    //               width: "fit-content",
    //               borderRadius: 0,
    //               borderTop: "none",
    //               borderBottom: "none",
    //             }}
    //           >
    //             <li
    //               className={
    //                 location.includes("locker") ? "activenavlink" : "navlinks"
    //               }
    //             >
    //               <NavLink
    //                 to="/locker"
    //                 onClick={() => {
    //                   setActiveLink("lock");
    //                 }}
    //                 className={
    //                   location.includes("locker") ? "activelink" : "navlinkitem"
    //                 }
    //               >
    //                 <img
    //                   src={
    //                     location.includes("locker") &&
    //                     props.theme === "theme-white"
    //                       ? "/assets/img/locker-active.svg"
    //                       : location.includes("locker") &&
    //                         props.theme === "theme-dark"
    //                       ? "/assets/img/locker-white.svg"
    //                       : "/assets/img/locker-passive.svg"
    //                   }
    //                   alt="Image"
    //                 />
    //                 <span className="sidebar-link">DYP Locker</span>
    //               </NavLink>
    //             </li>
    //             <li
    //               className={
    //                 location.includes("news") ? "activenavlink" : "navlinks"
    //               }
    //             >
    //               <NavLink
    //                 to="/news"
    //                 onClick={() => {
    //                   setActiveLink("news");
    //                 }}
    //                 className={
    //                   location.includes("news") ? "activelink" : "navlinkitem"
    //                 }
    //               >
    //                 <img
    //                   src={
    //                     location.includes("news") &&
    //                     props.theme === "theme-white"
    //                       ? "/assets/img/news-active.svg"
    //                       : location.includes("news") &&
    //                         props.theme === "theme-dark"
    //                       ? "/assets/img/news-white.svg"
    //                       : "/assets/img/news-passive.svg"
    //                   }
    //                   alt="Image"
    //                 />
    //                 <span className="sidebar-link">News</span>
    //               </NavLink>
    //             </li>
    //           </div>
    //         </ul>
    //       </div>
    //       <div className="menu-cat-two m-0">
    //         {/* <h6>Others</h6> */}
    //         <ul style={{ width: "fit-content", margin: "auto" }}>
    //           {String(props.appState.coinbase).toLowerCase() ==
    //             window.config.metamask_admin_account.toLowerCase() && (
    //             <li>
    //               <NavLink to="/admin">
    //                 <i className="fas fa-user-cog" alt="Image" />
    //                 <span className="sidebar-link">Admin</span>
    //               </NavLink>
    //             </li>
    //           )}
    //           <div
    //             className="row m-auto align-items-center twolinks-wrapper"
    //             style={{
    //               width: "fit-content",
    //               borderRadius: 0,
    //               borderBottom: "none",
    //             }}
    //           >
    //             <li
    //               className={
    //                 location.includes("info") ? "activenavlink" : "navlinks"
    //               }
    //               onClick={() => {
    //                 setActiveLink("info");
    //               }}
    //             >
    //               <NavLink
    //                 to="/submit-info"
    //                 onClick={() => {
    //                   setActiveLink("info");
    //                 }}
    //                 className={
    //                   location.includes("info") ? "activelink" : "navlinkitem"
    //                 }
    //               >
    //                 <img
    //                   src={
    //                     location.includes("info") &&
    //                     props.theme === "theme-white"
    //                       ? "/assets/img/info-active.svg"
    //                       : location.includes("info") &&
    //                         props.theme === "theme-dark"
    //                       ? "/assets/img/info-white.svg"
    //                       : "/assets/img/info-passive.svg"
    //                   }
    //                   alt="Image"
    //                 />
    //                 <span className="sidebar-link">Submit form</span>
    //               </NavLink>
    //             </li>
    //             <li
    //               onClick={() => {
    //                 setActiveLink("rocket");
    //               }}
    //               className="navlinks"
    //             >
    //               <a
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 href="https://dyp.finance/launchpad"
    //                 className={
    //                   activeLink === "rocket" ? "activelink" : "navlinkitem"
    //                 }
    //               >
    //                 <img
    //                   src={
    //                     activeLink === "rocket" && props.theme === "theme-white"
    //                       ? "/assets/img/rocket-active.svg"
    //                       : activeLink === "rocket" &&
    //                         props.theme === "theme-dark"
    //                       ? "/assets/img/rocket-white.svg"
    //                       : "/assets/img/rocket-passive.svg"
    //                   }
    //                   alt="Image"
    //                 />
    //                 <span className="sidebar-link">Launchpad</span>
    //               </a>
    //             </li>
    //           </div>
    //           <div
    //             className="row m-auto align-items-center twolinks-wrapper"
    //             style={{
    //               width: "fit-content",
    //               borderRadius: "0px 0px 8px 8px",
    //             }}
    //           >
    //             <li
    //               className="navlinks"
    //               onClick={() => {
    //                 setActiveLink("buydyp");
    //               }}
    //             >
    //               <a
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 href={
    //                   chainId === 1
    //                     ? "https://app.uniswap.org/#/swap?outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
    //                     : "https://app.pangolin.exchange/#/swap?outputCurrency=0x961c8c0b1aad0c0b10a51fef6a867e3091bcef17"
    //                 }
    //                 className={
    //                   activeLink === "buydyp" ? "activelink" : "navlinkitem"
    //                 }
    //               >
    //                 <img
    //                   src={
    //                     activeLink === "buydyp" && props.theme === "theme-white"
    //                       ? "/assets/img/cart.svg"
    //                       : activeLink === "buydyp" &&
    //                         props.theme === "theme-dark"
    //                       ? "/assets/img/cart-white.svg"
    //                       : "/assets/img/cart-passive.svg"
    //                   }
    //                   alt="Image"
    //                 />
    //                 <span className="sidebar-link">Buy DYP</span>
    //               </a>
    //             </li>
    //             <li
    //               className={
    //                 location.includes("account") ? "activenavlink" : "navlinks"
    //               }
    //             >
    //               <NavLink
    //                 exact
    //                 to="/account"
    //                 onClick={() => {
    //                   setActiveLink("account");
    //                 }}
    //                 className={
    //                   location.includes("account")
    //                     ? "activelink"
    //                     : "navlinkitem"
    //                 }
    //               >
    //                 <img
    //                   src={
    //                     avatar.includes("thumbnails")
    //                       ? avatar
    //                       : location.includes("account") &&
    //                         props.theme === "theme-white"
    //                       ? "/assets/img/person-active.svg"
    //                       : location.includes("account") &&
    //                         props.theme === "theme-dark"
    //                       ? "/assets/img/person-white.svg"
    //                       : "/assets/img/person.svg"
    //                   }
    //                   style={{ borderRadius: "50%" }}
    //                   alt="Image"
    //                 />
    //                 <span className="sidebar-link">Account</span>
    //               </NavLink>
    //             </li>
    //           </div>
    //         </ul>
    //       </div>
    //     </div>
    //     {props.isPremium === true ? (
    //       <></>
    //     ) : (
    //       <>
    //         <NavLink className="upgrade-text" to="/account">
    //           <div className="premium-wrapper">
    //             <div style={{ padding: 15 }}>
    //               <div className="row m-0 pb-2 upper-wrapper">
    //                 <div style={{ maxWidth: 110 }}>
    //                   <h3 className="premium-title">Upgrade to Premium</h3>
    //                   <span className="premium-subtitle">
    //                     Get additional benefits & features
    //                   </span>
    //                 </div>
    //                 <div>
    //                   <img src={Crown} alt="" className="crown" />
    //                 </div>
    //               </div>
    //               Upgrade today <img src={RightArrow} alt="" />
    //             </div>
    //           </div>
    //         </NavLink>
    //       </>
    //     )}
    //   </div>
    // </div>
  );
};

export default Sidebar;
