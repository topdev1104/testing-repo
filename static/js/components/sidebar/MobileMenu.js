import React, { useEffect, useState } from "react";
import earnIcon from "../../assets/sidebarIcons/earnIcon.svg";
import earnIconActive from "../../assets/sidebarIcons/earnIconActive.svg";
import governanceIcon from "../../assets/sidebarIcons/governanceIcon.svg";
import governanceIconActive from "../../assets/sidebarIcons/governanceIconActive.svg";
import bridgeIcon from "../../assets/sidebarIcons/bridgeIcon.svg";
import bridgeIconActive from "../../assets/sidebarIcons/bridgeIconActive.svg";
import yieldsIcon from "../../assets/sidebarIcons/yieldsIcon.svg";
import yieldsIconActive from "../../assets/sidebarIcons/yieldsIconActive.svg";
import explorerIcon from "../../assets/sidebarIcons/explorerIcon.svg";
import explorerIconActive from "../../assets/sidebarIcons/explorerIconActive.svg";
import projectsIcon from "../../assets/sidebarIcons/projectsIcon.svg";
import projectsIconActive from "../../assets/sidebarIcons/projectsIconActive.svg";
import swapIcon from "../../assets/sidebarIcons/swapIcon.svg";
import swapIconActive from "../../assets/sidebarIcons/swapIconActive.svg";
import newsIcon from "../../assets/sidebarIcons/newsIcon.svg";
import newsIconActive from "../../assets/sidebarIcons/newsIconActive.svg";
import moreIcon from "../../assets/sidebarIcons/moreIcon.svg";
import moreIconActive from "../../assets/sidebarIcons/moreIconActive.svg";
import rightArrow from "../faqcard/assets/rightlogo.svg";
import { NavLink, useLocation } from "react-router-dom";
import xMark from "../Modal/xMark.svg";
import OutsideClickHandler from "react-outside-click-handler";
const MobileMenu = () => {
  const [activeIcon, setActiveIcon] = useState("");
  const [explorerModal, setExplorerModal] = useState(false);
  const [moreModal, setMoreModal] = useState(false);

  const location = useLocation();

  const html = document.querySelector("html");
  const explorer = document.querySelector("#explorerModal");
  const more = document.querySelector("#moreModal");
  const mobile = document.querySelector("#mobileMenu");

  useEffect(() => {
    if(location.pathname === "/"){
      setActiveIcon("")
    }

    if (explorerModal === true || moreModal === true) {
      html.classList.add("hidescroll");
      explorer.classList.add("modal-pointer-events");
      mobile.classList.add("modal-pointer-events");
      more.classList.add("modal-pointer-events");
    } else {
      html.classList.remove("hidescroll");
    }
  }, [explorerModal, moreModal, location]);

  return (
    <div
      className="container-fluid mobile-sidebar justify-content-center align-items-center d-flex d-lg-none"
      id="mobileMenu"
        onClick={() => {
            explorerModal === true && 
            setExplorerModal(false);
            moreModal === true &&  
            setMoreModal(false)}}
    >
      <div className="row w-100">
        <NavLink
          to="/earn"
          className="col"
          onClick={() => setActiveIcon("earn")}
        >
          <div
            className={`d-flex align-items-center sidebar-item ${
              activeIcon === "earn" && "active-side-link"
            } p-2 justify-content-center`}
          >
            <img
              src={activeIcon === "earn" ? earnIconActive : earnIcon}
              width={25}
              height={25}
              alt=""
            />
            {/* <h3 className={`active-text ${activeIcon === 'earn' ? 'd-flex' : 'd-none'}`}>Earn</h3> */}
          </div>
        </NavLink>
        <NavLink
          to="/governance"
          className="col"
          onClick={() => setActiveIcon("governance")}
        >
          <div
            className={`d-flex align-items-center sidebar-item ${
              activeIcon === "governance" && "active-side-link"
            } p-2 justify-content-center`}
          >
            <img
              src={
                activeIcon === "governance"
                  ? governanceIconActive
                  : governanceIcon
              }
              width={25}
              height={25}
              alt=""
            />
            {/* <h3 className={`active-text ${activeIcon === 'governance' ? 'd-flex' : 'd-none'}`}>Governance</h3> */}
          </div>
        </NavLink>
        <NavLink
          to="/bridge"
          className="col"
          onClick={() => setActiveIcon("bridge")}
        >
          <div
            className={`d-flex align-items-center sidebar-item ${
              activeIcon === "bridge" && "active-side-link"
            } p-2 justify-content-center`}
          >
            <img
              src={activeIcon === "bridge" ? bridgeIconActive : bridgeIcon}
              width={25}
              height={25}
              alt=""
            />
            {/* <h3 className={`active-text ${activeIcon === 'bridge' ? 'd-flex' : 'd-none'}`}>Bridge</h3> */}
          </div>
        </NavLink>
        <NavLink
          to="/farms"
          className="col"
          onClick={() => setActiveIcon("yields")}
        >
          <div
            className={`d-flex align-items-center sidebar-item ${
              activeIcon === "yields" && "active-side-link"
            } p-2 justify-content-center`}
          >
            <img
              src={activeIcon === "yields" ? yieldsIconActive : yieldsIcon}
              width={25}
              height={25}
              alt=""
            />
            {/* <h3 className={`active-text ${activeIcon === 'bridge' ? 'd-flex' : 'd-none'}`}>Bridge</h3> */}
          </div>
        </NavLink>
        {/* <div
          className="col"
          onClick={() => {
            setActiveIcon("explorer");
            setExplorerModal(!explorerModal);
          }}
        >
          <div
            className={`d-flex align-items-center sidebar-item ${
              activeIcon === "explorer" && "active-side-link"
            } p-2 justify-content-center`}
          >
            <img
              src={
                activeIcon === "explorer" ? explorerIconActive : explorerIcon
              }
              width={25}
              height={25}
              alt=""
            />
          </div>
        </div> */}
        <div
          className="col"
          onClick={() => {
            setActiveIcon("more");
            setMoreModal(!moreModal);
          }}
        >
          <div
            className={`d-flex align-items-center sidebar-item ${
              activeIcon === "more" && "active-side-link"
            } p-2 justify-content-center`}
          >
            <img
              src={activeIcon === "more" ? moreIconActive : moreIcon}
              width={25}
              height={25}
              alt=""
            />
            {/* <h3 className={`active-text ${activeIcon === 'more' ? 'd-flex' : 'd-none'}`}>More</h3> */}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: '5%', width: '100%'}}>
      <OutsideClickHandler onOutsideClick={() => setExplorerModal(false)}>
      <div
        className={`explorer-modal ${
          explorerModal && "explorer-modal-active"
        } d-flex flex-column gap-2  p-3`}
        id="explorerModal"
      >
        <div
          className="d-flex w-100 justify-content-end py-3"
          onClick={() => setExplorerModal(false)}
        >
          <img src={xMark} alt="" />
        </div>
        <NavLink
          to="/pair-explorer"
          onClick={() => setExplorerModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <h3 className="sideitem-text">Pair Explorer</h3>
          <img src={rightArrow} alt="" />
        </NavLink>
        <NavLink
          to="/pool-explorer"
          onClick={() => setExplorerModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <h3 className="sideitem-text">Pool explorer</h3>
          <img src={rightArrow} alt="" />
        </NavLink>
        <NavLink
          to="/big-swap-explorer"
          onClick={() => setExplorerModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <h3 className="sideitem-text">Big swap</h3>
          <img src={rightArrow} alt="" />
        </NavLink>
        <NavLink
          to="/top-tokens"
          onClick={() => setExplorerModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <h3 className="sideitem-text">Top tokens</h3>
          <img src={rightArrow} alt="" />
        </NavLink>
        <NavLink
          to="/farms"
          onClick={() => setExplorerModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <h3 className="sideitem-text">Yields</h3>
          <img src={rightArrow} alt="" />
        </NavLink>
        <NavLink
          to="/submit-info"
          onClick={() => setExplorerModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <h3 className="sideitem-text">Submit form</h3>
          <img src={rightArrow} alt="" />
        </NavLink>
      </div>
      </OutsideClickHandler>
      </div>
     <div style={{position: 'absolute', left: '5%', width: '100%'}}>
     <OutsideClickHandler onOutsideClick={() => setMoreModal(false)}>
      <div
        className={`explorer-modal ${
          moreModal && "explorer-modal-active"
        } d-flex flex-column gap-2 p-3`}
        id="moreModal"
      >
        <div
          className="d-flex w-100 justify-content-end"
          onClick={() => setMoreModal(false)}
        >
          <img src={xMark} alt="" />
        </div>
        <div className="sidebar-item active-side-link w-100 p-3">
          <div className="d-flex align-items-center gap-2">
            <img src={projectsIconActive} alt="" />
            <h3 className="active-text">Projects</h3>
          </div>
        </div>
        <div
          onClick={() => setMoreModal(false)}
          className="mobile-modal-item d-flex flex-column justify-content-between align-items-center w-100 pb-3"
        >
          <NavLink
            to="/launchpad"
            className="d-flex justify-content-between align-items-center w-100 py-2"
          >
            <h3 className="sideitem-text">Launchpad</h3>
            <img src={rightArrow} alt="" />
          </NavLink>
          <NavLink
            to="/locker"
            className="d-flex justify-content-between align-items-center w-100 py-2"
          >
            <h3 className="sideitem-text">DYP Locker</h3>
            <img src={rightArrow} alt="" />
          </NavLink>
        </div>
        {/* <NavLink
          to="/swap"
          onClick={() => setMoreModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <div className="d-flex align-items-center gap-2">
            <img src={swapIcon} alt="" />
            <h3 className="sideitem-text">Swap</h3>
          </div>
          <img src={rightArrow} alt="" />
        </NavLink> */}
        <NavLink
          to="/swap"
          onClick={() => setMoreModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <div className="d-flex align-items-center gap-2">
            <img src={swapIcon} alt="" />
            <h3 className="sideitem-text">Swap</h3>
          </div>
          <img src={rightArrow} alt="" />
        </NavLink>
        <NavLink
          to="/news"
          onClick={() => setMoreModal(false)}
          className="mobile-modal-item d-flex justify-content-between align-items-center w-100 py-3"
        >
          <div className="d-flex align-items-center gap-2">
            <img src={newsIcon} alt="" />
            <h3 className="sideitem-text">News</h3>
          </div>
          <img src={rightArrow} alt="" />
        </NavLink>
      </div>
      </OutsideClickHandler>
     </div>
    </div>
  );
};

export default MobileMenu;
