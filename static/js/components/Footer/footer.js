import React from 'react'
import { NavLink } from 'react-router-dom';
import useWindowSize from '../../functions/useWindowSize'

const Footer = () => {

  const windowSize = useWindowSize();

  return (
    <div className="footer container-fluid d-flex justify-content-center justify-content-lg-start">
    <div className="row w-100">
    <div className="col-1"></div>
    <div className={`${windowSize.width < 991 ? 'col-12' : windowSize.width < 1490 ? 'col-11' : 'col-10'}`}>
    <div className="py-4 flex-column flex-lg-row px-0 container-lg d-flex justify-content-between gap-3 align-items-start align-items-lg-center">
      <div className="d-flex flex-row flex-lg-column justify-content-between justify-content-lg-center align-items-center align-items-lg-start col-12 col-lg-6 gap-2">
        <a target={"_blank"} href="https://dypius.com/">
          <img src="/assets/img/dypiusFooter.svg" alt="Dypius" ></img>
        </a>
        <a target={"_blank"} href="https://www.worldofdypians.com/" style={{ position: 'relative'}}>
          <img src="/assets/img/metaverse.svg" alt="METAVERSE" style={{height: '30px'}}/>
        </a>
      </div>
      <hr className="form-divider my-2 d-flex d-lg-none" style={{height: '2px'}} />
      <div className="social-and-links d-flex align-items-end flex-column-reverse flex-lg-column justify-content-center gap-4">
      <div className="social-profile">
      <span className="mobile-footer-title d-flex d-lg-none mb-3">Community</span>
        <ul>
          <li>
            <a target={"_blank"} href="https://twitter.com/dypius">
              <img src="/assets/img/Social/twitter.svg" alt="Twitter"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a target={"_blank"} href="https://t.me/dypius">
              <img src="/assets/img/Social/telegram.svg" alt="Telegram"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a target={"_blank"} href="https://discord.gg/worldofdypians">
              <img src="/assets/img/Social/discord.svg" alt="Discord"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a target={"_blank"} href="https://www.instagram.com/dyp.eth">
              <img src="/assets/img/Social/instagram.svg" style={{height: 23, width: 23}} alt="Instagram"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a target={"_blank"} href="https://medium.com/@dypius">
              <img src="/assets/img/Social/medium.svg" alt="Medium"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a
              target={"_blank"}
              href="https://www.youtube.com/@Dypius"
            >
              <img src="/assets/img/Social/youtube.svg" alt="Youtube"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a
              target={"_blank"}
              href="https://www.linkedin.com/company/dypius-ecosystem"
            >
              <img src="/assets/img/Social/linkedin.svg" alt="Linkedin"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a target={"_blank"} href="https://github.com/dypfinance">
              <img src="/assets/img/Social/github.svg" alt="Github"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a target={"_blank"} href="mailto:business@dypius.com">
              <img src="/assets/img/Social/email.svg" alt="Mail"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a
              target={"_blank"}
              href="https://www.coingecko.com/en/coins/defi-yield-protocol"
            >
              <img src="/assets/img/coingecko-logo.svg" alt="Coingecko"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a
              target={"_blank"}
              href="https://coinmarketcap.com/currencies/defi-yield-protocol/"
            >
              <img
                src="/assets/img/coinmarketcap.svg"
                alt="Coinmarketcap"
                 height={24} width={24}
              ></img>
            </a>
          </li>
        </ul>
        {/* <div className="d-flex flex-column gap-3 d-lg-none mt-3">
        <span className="mobile-footer-title d-flex d-lg-none">Dypius track</span>
        <ul>
          <li>
            <a
              target={"_blank"}
              href="https://www.coingecko.com/en/coins/defi-yield-protocol"
            >
              <img src="/assets/img/coingecko-logo.svg" alt="Coingecko"
              height={24} width={24}></img>
            </a>
          </li>
          <li>
            <a
              target={"_blank"}
              href="https://coinmarketcap.com/currencies/defi-yield-protocol/"
            >
              <img
                src="/assets/img/coinmarketcap.svg"
                alt="Coinmarketcap"
                 height={24} width={24}
              ></img>
            </a>
          </li>
        </ul>
        </div> */}
      </div>
      <hr className="form-divider my-2 d-flex d-lg-none w-100" style={{height: '2px'}} />
      <div className="footer-menu">
        <span className="mobile-footer-title d-flex d-lg-none mb-3">Links</span>
        <ul className='external-links'>
          <li>
            <a
              target={"_blank"}
              href="https://etherscan.io/address/0x961C8c0B1aaD0c0b10a51FeF6a867E3091BCef17#code"
            >
              Token Contract
            </a>
          </li>
          <li>
            <a
              target={"_blank"}
              href="https://dypius.com/about#security"
            >
              Security
            </a>
          </li>
          <li>
            <NavLink  to="/disclaimer"
              
            >
              Disclaimer
            </NavLink>
          </li>
          <li>
            <a
              target={"_blank"}
              href="https://dypius.com//support"
            >
             Support
            </a>
          </li>
        </ul>

      </div>
      </div>
    </div>
    </div>
    <div className="col-1"></div>
    </div>
  </div>
  )
}

export default Footer