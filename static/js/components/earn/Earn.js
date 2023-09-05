import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./earn.css";
import EarnContent from "./EarnContent/EarnContent";
import EarnHero from "./EarnHero/EarnHero";

const Earn = ({
  coinbase,
  the_graph_result,
  lp_id,
  isConnected,
  network,
  handleConnection,
  the_graph_resultavax,
  the_graph_resultbsc,
  referrer,
  handleSwitchNetwork,
}) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const html = document.querySelector("html");

  const routeData = useLocation();




  useEffect(() => {
    if (showCalculator === true) {
      html.classList.add("hidescroll");
    } else {
      html.classList.remove("hidescroll");
    }

    if (routeData.state?.section === "earnFaq") {
      setTimeout(() => {
        window.scrollTo(0, 800);
      }, 500);
    }
  }, [showCalculator]);

  return (
    <div className="container-lg earn-wrapper d-flex flex-column justify-content-center align-items-center p-0 position-relative">
      <EarnHero />
      <EarnContent
        coinbase={coinbase}
        the_graph_result={the_graph_result}
        lp_id={lp_id}
        isConnected={isConnected}
        chainId={network}
        networkId={network}
        handleConnection={handleConnection}
        the_graph_resultavax={the_graph_resultavax}
        the_graph_resultbsc={the_graph_resultbsc}
        referrer={referrer}
        routeOption={routeData.state ? routeData.state.option : "Staking"}
        routeChain={routeData.state ? routeData.state.chain : ""}
        pool={routeData.state ? routeData.state.pool : null}
        customChain={routeData.state ? routeData.state.customChain : "eth"}
        faqIndex={routeData.state ? routeData.state.faqIndex : -1}
        handleSwitchNetwork={handleSwitchNetwork}
      />
    </div>
  );
};

export default Earn;
