import React, { useState, useEffect } from "react";
import initBridge from "./bridge";
import BridgeFAQ from "./BridgeFAQ";
import initBridgeidyp from "./bridge-idyp";
import dyp from "./assets/dyp.svg";
import idyp from "./assets/idyp.svg";
import eth from "./assets/eth.svg";
import bnb from "./assets/bnb.svg";
import avax from "./assets/avax.svg";
import "./bridge.css";
import { useLocation } from "react-router-dom";

const Bridge = ({ networkId, isConnected, handleConnection, coinbase }) => {
  const [sourceChain, setSourceChain] = useState("");
  const [sourceChainiDyp, setSourceChainiDyp] = useState("");
  const [destinationChainiDyp, setDestinationChainiDyp] = useState("");
  const [destinationChain, setDestinationChain] = useState("");
  const [activebtn, setActiveBtn] = useState("");

  const [sourceBridge, setSourceBridge] = useState(window.bridge_bscavaxbsc);
  const [destinationBridge, setDestinationBridge] = useState(
    window.bridge_bscavax
  );
  const [sourceToken, setSourceToken] = useState(window.token_dyp_bscavaxbsc);
  const [destinationToken, setDestinationToken] = useState(
    window.token_dyp_bscavax
  );

  const [sourceBridgeiDyp, setSourceBridgeiDyp] = useState(
    window.bridge_idypeth
  );
  const [destinationBridgeiDyp, setDestinationBridgeiDyp] = useState(
    window.bridge_idypbsceth
  );
  const [sourceTokeniDyp, setSourceTokeniDyp] = useState(window.token_idyp_eth);
  const [destinationTokeniDyp, setDestinationTokeniDyp] = useState(
    window.token_idyp_bsceth
  );

  const routeData = useLocation();
  const [faqSection, setFaqSection] = useState(routeData.state?.section);
  const [ethBalance, setEthBalance] = useState("0.0");
  const [bnbBalance, setBnbBalance] = useState("0.0");
  const [avaxBalance, setAvaxBalance] = useState("0.0");

  const [ethBalanceidyp, setEthBalanceidyp] = useState("0.0");
  const [bnbBalanceidyp, setBnbBalanceidyp] = useState("0.0");
  const [avaxBalanceidyp, setAvaxBalanceidyp] = useState("0.0");

  const getAllBalance = async () => {
    const tokenAddress = "0x961C8c0B1aaD0c0b10a51FeF6a867E3091BCef17";
    const walletAddress = coinbase;
    const TokenABI = window.ERC20_ABI;

    if (coinbase != undefined) {
      const contract1 = new window.infuraWeb3.eth.Contract(
        TokenABI,
        tokenAddress
      );
      const contract2 = new window.avaxWeb3.eth.Contract(
        TokenABI,
        tokenAddress
      );
      const contract3 = new window.bscWeb3.eth.Contract(TokenABI, tokenAddress);

      await contract1.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          setEthBalance(data);
        });
      await contract2.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          setAvaxBalance(data);
        });

      await contract3.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          setBnbBalance(data);
        });
    }
  };

  const getAllBalanceiDyp = async () => {
    const tokenAddress = "0xbd100d061e120b2c67a24453cf6368e63f1be056";
    const walletAddress = coinbase;
    const TokenABI = window.ERC20_ABI;
    let bal1, bal2, bal3;
    if (coinbase != undefined) {
      const contract1 = new window.infuraWeb3.eth.Contract(
        TokenABI,
        tokenAddress
      );
      const contract2 = new window.avaxWeb3.eth.Contract(
        TokenABI,
        tokenAddress
      );
      const contract3 = new window.bscWeb3.eth.Contract(TokenABI, tokenAddress);

      bal1 = await contract1.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          setEthBalanceidyp(data);
        });
      bal2 = await contract2.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          setAvaxBalanceidyp(data);
        });

      bal3 = await contract3.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          setBnbBalanceidyp(data);
        });
    }
  };

  const handleSourceChain = async (chainText) => {
    if (chainText === "eth") {
      setSourceChain(chainText);
    }

    if (chainText === "bnb") {
      setSourceChain(chainText);
      setSourceBridge(window.bridge_bscavaxbsc);
      setDestinationBridge(window.bridge_bscavax);
      setSourceToken(window.token_dyp_bscavaxbsc);
      setDestinationToken(window.token_dyp_bscavax);
    }

    if (chainText === "avax") {
      setSourceChain(chainText);
      setDestinationBridge(window.bridge_bscavaxbsc);
      setSourceBridge(window.bridge_bscavax);
      setDestinationToken(window.token_dyp_bscavaxbsc);
      setSourceToken(window.token_dyp_bscavax);
    }
  };

  const handleSourceChainiDyp = async (chainText) => {
    if (activebtn === "5") {
      if (chainText === "eth") {
        setSourceChainiDyp(chainText);
        setSourceBridgeiDyp(window.bridge_idypbsceth);
        setDestinationBridgeiDyp(window.bridge_idypbscbsc);
        setSourceTokeniDyp(window.token_idyp_bsceth);
        setDestinationTokeniDyp(window.token_idyp_bscbsc);
      }

      if (chainText === "bnb") {
        setSourceChainiDyp(chainText);
        setSourceBridgeiDyp(window.bridge_idypbscbsc);
        setDestinationBridgeiDyp(window.bridge_idypbsceth);
        setSourceTokeniDyp(window.token_idyp_bscbsc);
        setDestinationTokeniDyp(window.token_idyp_bsceth);
      }
    } else if (activebtn === "7") {
      if (chainText === "eth") {
        setSourceChainiDyp(chainText);
        setSourceBridgeiDyp(window.bridge_idypeth);
        setDestinationBridgeiDyp(window.bridge_idypbsc);
        setSourceTokeniDyp(window.token_idyp_eth);
        setDestinationTokeniDyp(window.token_idyp_bsc);
      }

      if (chainText === "avax") {
        setSourceChainiDyp(chainText);
        setSourceBridgeiDyp(window.bridge_idypbsc);
        setDestinationBridgeiDyp(window.bridge_idypeth);
        setSourceTokeniDyp(window.token_idyp_bsc);
        setDestinationTokeniDyp(window.token_idyp_eth);
      }
    }
  };

  useEffect(() => {
    getAllBalance();
    getAllBalanceiDyp();
  }, [sourceChain, destinationChain, sourceChainiDyp, destinationChainiDyp]);

  const BridgeModal = initBridge({
    bridgeETH: sourceBridge,
    bridgeBSC: destinationBridge,
    tokenETH: sourceToken,
    tokenBSC: destinationToken,
  });

  const BridgeiDYPModal = initBridgeidyp({
    bridgeETH: sourceBridgeiDyp,
    bridgeBSC: destinationBridgeiDyp,
    tokenETH: sourceTokeniDyp,
    tokenBSC: destinationTokeniDyp,
  });

  return (
    <div className="container-lg p-0">
      <div className="col-12 col-lg-5 d-flex flex-column justify-content-center gap-3 mb-4">
        <h3 className="text-white">Dypius Bridge</h3>
        <p className="text-white">
          Send tokens from BNB Chain to Avalanche with ease.
          <br />
          Every transaction is instant and secure.
        </p>
      </div>
      <div>
        <h3 className="text-white mb-4">
          <img src={dyp} alt="" /> DYP Bridge
        </h3>
        <h5 className="text-white mb-2">Choose route</h5>
        <div className="d-flex gap-3 mb-2">
          <div
            className={
              activebtn === "1"
                ? "optionbtn-active activebscavax"
                : "optionbtn-passive bridge-passive"
            }
            onClick={() => {
              setActiveBtn("1");
              setSourceChain("bnb");
              setDestinationChain("avax");
              setSourceBridge(window.bridge_bscavaxbsc);
              setDestinationBridge(window.bridge_bscavax);
              setSourceToken(window.token_dyp_bscavaxbsc);
              setDestinationToken(window.token_dyp_bscavax);
            }}
          >
            <h6 className="optiontext d-flex align-items-center gap-2">
              <img src={bnb} alt="" /> <img src={avax} alt="" />
              <p className=" mb-0 optiontext d-none d-lg-flex">BSC/AVAX</p>
            </h6>
          </div>
        </div>
        <BridgeModal
          isConnected={isConnected}
          networkId={networkId}
          handleConnection={handleConnection}
          destinationChain={destinationChain}
          onSelectChain={(value) => {
            setDestinationChain(value);
          }}
          onSelectSourceChain={(value) => {
            handleSourceChain(value);
          }}
          coinbase={coinbase}
          sourceChain={sourceChain}
          activebtn={activebtn}
          ethBalance={ethBalance}
          bnbBalance={bnbBalance}
          avaxBalance={avaxBalance}
        />
      </div>
      <div className="bigseparator mt-5 mb-5 col-6 col-xxl-5"></div>
      <div>
        <h3 className="text-white mb-4">
          <img src={idyp} alt="" style={{ width: 32, height: 32 }} /> iDYP
          Bridge
        </h3>
        <h5 className="text-white mb-2">Choose route</h5>
        <div className="d-flex gap-3 mb-2">
          <div
            className={
              activebtn === "5"
                ? "optionbtn-active activeethbnb"
                : "optionbtn-passive bridge-passive"
            }
            onClick={() => {
              setActiveBtn("5");
              setSourceChainiDyp("eth");
              setDestinationChainiDyp("bnb");
              setSourceBridgeiDyp(window.bridge_idypbsceth);
              setDestinationBridgeiDyp(window.bridge_idypbscbsc);
              setSourceTokeniDyp(window.token_idyp_bsceth);
              setDestinationTokeniDyp(window.token_idyp_bscbsc);
            }}
          >
            <h6 className="optiontext d-flex align-items-center gap-2">
              <img src={eth} alt="" /> <img src={bnb} alt="" />
              <p className=" mb-0 optiontext d-none d-lg-flex">ETH/BNB</p>
            </h6>
          </div>

          <div
            className={
              activebtn === "7"
                ? "optionbtn-active activeethavax"
                : "optionbtn-passive bridge-passive"
            }
            onClick={() => {
              setSourceChainiDyp("eth");
              setDestinationChainiDyp("avax");
              setActiveBtn("7");
              setSourceBridgeiDyp(window.bridge_idypeth);
              setDestinationBridgeiDyp(window.bridge_idypbsc);
              setSourceTokeniDyp(window.token_idyp_eth);
              setDestinationTokeniDyp(window.token_idyp_bsc);
            }}
          >
            <h6 className="optiontext d-flex align-items-center gap-2">
              <img src={eth} alt="" /> <img src={avax} alt="" />
              <p className=" mb-0 optiontext d-none d-lg-flex">ETH/AVAX</p>
            </h6>
          </div>
        </div>
        <BridgeiDYPModal
          isConnected={isConnected}
          networkId={networkId}
          handleConnection={handleConnection}
          destinationChain={destinationChainiDyp}
          onSelectChain={(value) => {
            setDestinationChainiDyp(value);
          }}
          onSelectSourceChain={(value) => {
            handleSourceChainiDyp(value);
          }}
          sourceChain={sourceChainiDyp}
          coinbase={coinbase}
          activebtn={activebtn}
          ethBalance={ethBalanceidyp}
          bnbBalance={bnbBalanceidyp}
          avaxBalance={avaxBalanceidyp}
        />
      </div>
      <BridgeFAQ faqIndex={routeData.state ? routeData.state.faqIndex : -1} />
    </div>
  );
};

export default Bridge;
