import React from "react";
import Web3 from "web3";
import getFormattedNumber from "../../functions/get-formatted-number";
import { NavLink } from "react-router-dom";
import Error from "../../assets/error.svg";
import Placeholder from "../../assets/person.svg";
import "./account.css";
import NftCawCard from "../caws/NftMinting/components/General/NftCawCard/NftCawCard";
import TierLevels from "../launchpad/tierlevels/TierLevels";
import coinStackIcon from "../launchpad/assets/coinStackIcon.svg";
import axios from "axios";
import openNameChange from "./assets/openNameChange.svg";
import { ClickAwayListener, Tooltip } from "@material-ui/core";
import { shortAddress } from "../../functions/shortAddress";
import TopPoolsCard from "../top-pools-card/TopPoolsCard";
import useWindowSize from "../../functions/useWindowSize";
import launchpadIndicator from "../launchpad/assets/launchpadIndicator.svg";
import greenCheck from "./assets/greenCheck.svg";
import premiumDypTag from "./assets/premiumDypTag.png";
import premiumDypBanner from "./assets/premiumDypBanner2.png";
import KeyFeaturesCard from "../launchpad/launchpadhero/KeyFeaturesCard";

const { BigNumber } = window;

export default class Subscription extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coinbase: "",
      networkId: 0,
      selectedSubscriptionToken: Object.keys(
        window.config.subscription_tokens
      )[0],
      tokenBalance: "",
      price: "",
      formattedPrice: 0.0,
      favorites: [],
      favoritesETH: [],
      selectedFile: null,
      image: Placeholder,
      lockActive: false,
      status: "",
      loadspinner: false,
      loadspinnerSub: false,
      loadspinnerSave: false,
      loadspinnerRemove: false,
      showSavebtn: false,
      showRemovebtn: false,
      subscribe_now: false,
      wethAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      wavaxAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      wbnbAddress: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      triggerText: "See more V",
      isApproved: false,
      approveStatus: "initial",

      myNFTs: [],
      myStakess: [],
      viewall: false,
      username: "",
      userNameInput: "",
      showInput: false,
      openTooltip: false,
      dypBalance: "0.0",
      userPools: [],
      ethStake: [],
      bnbStake: [],
      avaxStake: [],
      ethFarm: [],
      bscFarm: [],
      avaxFarm: [],
      dropdownTitle: "",
      dropdownIcon: "",
    };
  }

  fetchUserPools = async () => {
    if (this.props.coinbase && this.props.coinbase.includes("0x")) {
      const result = await axios
        .get(`https://api.dyp.finance/api/user_pools/${this.props.coinbase}`)
        .then((data) => {
          return data.data.PoolsUserIn;
        });
      this.setState({ userPools: result });
      // console.log(result)
    }
  };

  fetchEthStaking = async () => {
    await axios
      .get(`https://api.dyp.finance/api/get_staking_info_eth`)
      .then((res) => {
        const dypIdyp = res.data.stakingInfoDYPEth.concat(
          res.data.stakingInfoiDYPEth
        );

        const expiredEth = dypIdyp.filter((item) => {
          return item.expired !== "No";
        });
        const activeEth = dypIdyp.filter((item) => {
          return item.expired !== "Yes";
        });

        const sortedExpired = expiredEth.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });
        const allEthPools = [...activeEth, ...sortedExpired];
        this.setState({ ethStake: allEthPools });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  fetchBnbStaking = async () => {
    await axios
      .get(`https://api.dyp.finance/api/get_staking_info_bnb`)
      .then((res) => {
        const dypIdypBnb = res.data.stakingInfoDYPBnb.concat(
          res.data.stakingInfoiDYPBnb
        );

        const expiredBnb = dypIdypBnb.filter((item) => {
          return item.expired !== "No";
        });
        const activeBnb = dypIdypBnb.filter((item) => {
          return item.expired !== "Yes";
        });
        const sortedActive = activeBnb.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });
        const sortedExpired = expiredBnb.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });

        const allBnbPools = [...sortedActive, ...sortedExpired];
        this.setState({ bnbStake: allBnbPools });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  fetchAvaxStaking = async () => {
    await axios
      .get(`https://api.dyp.finance/api/get_staking_info_avax`)
      .then((res) => {
        const dypIdypAvax = res.data.stakingInfoDYPAvax.concat(
          res.data.stakingInfoiDYPAvax
        );

        const expiredAvax = dypIdypAvax.filter((item) => {
          return item.expired !== "No";
        });

        const activeAvax = dypIdypAvax.filter((item) => {
          return item.expired !== "Yes";
        });

        const sortedActive = activeAvax.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });
        const sortedExpired = expiredAvax.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });

        const avaxAllPools = [...sortedActive, ...sortedExpired];
        this.setState({ avaxStake: avaxAllPools });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  fetchEthFarming = async () => {
    await axios
      .get("https://api.dyp.finance/api/the_graph_eth_v2")
      .then((res) => {
        let temparray = Object.entries(res.data.the_graph_eth_v2.lp_data);
        let farming = [];
        temparray.map((item) => {
          farming.push(item[1]);
        });

        const expiredFarmingEth = farming.filter((item) => {
          return item.expired !== "No";
        });
        const activeFarmingEth = farming.filter((item) => {
          return item.expired !== "Yes";
        });

        const sortedActive = activeFarmingEth.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });
        const sortedExpired = expiredFarmingEth.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });

        const ethAllPools = [...sortedActive, ...sortedExpired];
        this.setState({ ethFarm: ethAllPools });
      })
      .catch((err) => console.error(err));
  };

  fetchBscFarming = async () => {
    await axios
      .get("https://api.dyp.finance/api/the_graph_bsc_v2")
      .then((res) => {
        let temparray = Object.entries(res.data.the_graph_bsc_v2.lp_data);
        let farming = [];
        temparray.map((item) => {
          farming.push(item[1]);
        });
        const expiredFarmingBsc = farming.filter((item) => {
          return item.expired !== "No";
        });
        const activeFarmingBsc = farming.filter((item) => {
          return item.expired !== "Yes";
        });

        const sortedActive = activeFarmingBsc.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });
        const sortedExpired = expiredFarmingBsc.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });

        const bnbAllpools = [...sortedActive, ...sortedExpired];
        this.setState({ bscFarm: bnbAllpools });
      })
      .catch((err) => console.error(err));
  };

  fetchAvaxFarming = async () => {
    await axios
      .get("https://api.dyp.finance/api/the_graph_avax_v2")
      .then((res) => {
        let temparray = Object.entries(res.data.the_graph_avax_v2.lp_data);
        let farming = [];
        temparray.map((item) => {
          farming.push(item[1]);
        });
        const expiredFarmingAvax = farming.filter((item) => {
          return item.expired !== "No";
        });
        const activeFarmingAvax = farming.filter((item) => {
          return item.expired !== "Yes";
        });

        const sortedActive = activeFarmingAvax.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });
        const sortedExpired = expiredFarmingAvax.sort(function (a, b) {
          return b.tvl_usd - a.tvl_usd;
        });

        const avaxAllPools = [...sortedActive, ...sortedExpired];
      })
      .catch((err) => console.error(err));
  };

  fetchUsername = async () => {
    if (this.props.coinbase && this.props.coinbase.includes("0x")) {
      await axios
        .get(
          `https://api-image.dyp.finance/api/v1/username/${this.props.coinbase}`
        )
        .then((res) => {
          if (res.data?.username) {
            this.setState({ username: res.data?.username });
          } else {
            this.setState({ username: "Dypian" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  postUsername = async (userInput) => {
    const usernameData = {
      username: userInput,
    };
    if (this.props.coinbase && this.props.coinbase.includes("0x")) {
      await axios
        .post(
          `https://api-image.dyp.finance/api/v1/username/${this.props.coinbase}`,
          usernameData
        )
        .then((res) => {
          this.setState({ username: res.data?.username });
          this.fetchUsername();
          this.setState({ userNameInput: "", showInput: false });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  getDypBalance = async () => {
    const web3eth = window.infuraWeb3;
    const web3avax = window.avaxWeb3;
    const web3bsc = window.bscWeb3;
    const tokenAddress = "0x961C8c0B1aaD0c0b10a51FeF6a867E3091BCef17";
    const walletAddress = this.props.coinbase;
    const TokenABI = window.ERC20_ABI;
    if (walletAddress !== null && walletAddress !== undefined) {
      const contract1 = new web3eth.eth.Contract(TokenABI, tokenAddress);
      const contract2 = new web3avax.eth.Contract(TokenABI, tokenAddress);
      const contract3 = new web3bsc.eth.Contract(TokenABI, tokenAddress);

      const baleth = await contract1.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          return web3eth.utils.fromWei(data, "ether");
        });

      const balavax = await contract2.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          return web3avax.utils.fromWei(data, "ether");
        });

      const balbnb = await contract3.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          return web3bsc.utils.fromWei(data, "ether");
        });

      if (this.props.networkId === 43114) {
        this.setState({ dypBalance: balavax });
      } else if (this.props.networkId === 1) {
        this.setState({ dypBalance: baleth });
      } else if (this.props.networkId === 56) {
        this.setState({ dypBalance: balbnb });
      } else this.setState({ dypBalance: "0.0" });
    }
  };

  componentDidUpdate(prevProps) {

    if(this.props.isPremium){
      window.location.href = 'https://app.dypius.com/account'
    }


    // Typical usage (don't forget to compare props):
    if (this.props.coinbase !== prevProps.coinbase) {
      this.fetchUserPools();
      this.getDypBalance();
      this.fetchAvatar();
      this.fetchUsername();
      this.fetchUserPools();
      this.fetchAvaxFarming();
      this.fetchAvaxStaking();
      this.fetchBnbStaking();
      this.fetchBscFarming();
      this.fetchEthFarming();
      this.fetchEthStaking();

      if (this.props.networkId === 1) {
        this.myNft().then();
        this.myStakes().then();
      }
    }

    if (this.props.networkId !== prevProps.networkId) {
      this.setState({subscribe_now: false})
      this.getDypBalance();

      if (this.props.networkId === 43114) {
        this.handleSubscriptionTokenChange(this.state.wavaxAddress);
      } else if (this.props.networkId === 1) {
        this.handleSubscriptionTokenChange(this.state.wethAddress);
        this.myNft().then();
        this.myStakes().then();
      } else if (this.props.networkId === 56) {
        this.handleSubscriptionTokenChange(this.state.wbnbAddress);
      }
    }
  }

  componentDidMount() {
    if(this.props.isPremium){
      window.location.href = 'https://app.dypius.com/account'
    }
    this.getDypBalance();

    this.setState({ coinbase: this.props.coinbase });
    window.scrollTo(0, 0);
  }

  handleSubscriptionTokenChange = async (tokenAddress) => {
    const token = tokenAddress;
    let tokenDecimals =
      this.props.networkId === 1
        ? window.config.subscriptioneth_tokens[token]?.decimals
        : this.props.networkId === 56
        ? window.config.subscriptionbnb_tokens[token]?.decimals
        : window.config.subscription_tokens[token]?.decimals;
    this.setState({
      selectedSubscriptionToken: token,
      tokenBalance: "",
      formattedPrice: "",
      price: "",
    });

    let price =
      this.props.networkId === 1
        ? await window.getEstimatedTokenSubscriptionAmountETH(token)
        : this.props.networkId === 56
        ? await window.getEstimatedTokenSubscriptionAmountBNB(token)
        : await window.getEstimatedTokenSubscriptionAmount(token);
    price = new BigNumber(price).times(1.1).toFixed(0);

    let formattedPrice = getFormattedNumber(
      price / 10 ** tokenDecimals,
      tokenDecimals
    );
    let tokenBalance = await window.getTokenHolderBalance(
      token,
      this.props.coinbase
    );
    this.setState({ price, formattedPrice, tokenBalance });
  };

  myNft = async () => {
    if (this.props.coinbase !== null && this.props.coinbase !== undefined) {
      let myNft = await window.myNftListContract(this.props.coinbase);

      let nfts = myNft.map((nft) => window.getNft(nft));

      nfts = await Promise.all(nfts);

      nfts.reverse();
      this.setState({ myNFTs: nfts });
    }
  };

  getStakesIds = async () => {
    const address = this.props.coinbase;
    if (address !== null && this.props.coinbase !== undefined) {
      let staking_contract = await window.getContractNFT("NFTSTAKING");
      let stakenft = [];
      let myStakes = await staking_contract.methods
        .depositsOf(address)
        .call()
        .then((result) => {
          for (let i = 0; i < result.length; i++)
            stakenft.push(parseInt(result[i]));
          return stakenft;
        });

      return myStakes;
    }
  };

  myStakes = async () => {
    let myStakes = await this.getStakesIds();
    let stakes = myStakes.map((stake) => window.getNft(stake));
    stakes = await Promise.all(stakes);
    stakes.reverse();
    this.setState({ myStakess: stakes });
  };

  handleApprove = async (e) => {
    // e.preventDefault();

    let tokenContract = await window.getContract({
      address: this.state.selectedSubscriptionToken,
      ABI: window.ERC20_ABI,
    });

    this.setState({ loadspinner: true });

    await tokenContract.methods
      .approve(
        this.props.networkId === 1
          ? window.config.subscriptioneth_address
          : this.props.networkId === 56
          ? window.config.subscriptionbnb_address
          : window.config.subscription_address,
        this.state.price
      )
      .send()
      .then(() => {
        this.setState({ lockActive: true });
        this.setState({ loadspinner: false });
        this.setState({ isApproved: true, approveStatus: "deposit" });
      })
      .catch((e) => {
        this.setState({ status: e?.message });
        this.setState({ loadspinner: false, approveStatus: "fail" });
        setTimeout(() => {
          this.setState({
            status: "",
            loadspinner: false,
            approveStatus: "initial",
          });
        }, 8000);
      });
  };

  handleCheckIfAlreadyApproved = async (token) => {
    const web3eth = new Web3(window.config.infura_endpoint);
    const bscWeb3 = new Web3(window.config.bsc_endpoint);
    const avaxWeb3 = new Web3(window.config.avax_endpoint);

    const ethsubscribeAddress = window.config.subscriptioneth_address;
    const avaxsubscribeAddress = window.config.subscription_address;
    const bnbsubscribeAddress = window.config.subscriptionbnb_address;

    const subscribeToken = token;
    const subscribeTokencontract = new web3eth.eth.Contract(
      window.ERC20_ABI,
      subscribeToken
    );

    const subscribeTokencontractbnb = new bscWeb3.eth.Contract(
      window.ERC20_ABI,
      subscribeToken
    );

    const subscribeTokencontractavax = new avaxWeb3.eth.Contract(
      window.ERC20_ABI,
      subscribeToken
    );

    if (this.props.coinbase && this.props.coinbase.includes("0x")) {
      if (this.props.networkId === 1) {
        const result = await subscribeTokencontract.methods
          .allowance(this.props.coinbase, ethsubscribeAddress)
          .call()
          .then();

        if (result != 0) {
          this.setState({ lockActive: true });
          this.setState({ loadspinner: false });
          this.setState({ isApproved: true });
        } else if (result == 0) {
          this.setState({ lockActive: false });
          this.setState({ loadspinner: false });
          this.setState({ isApproved: false });
        }
      }
      if (this.props.networkId === 56) {
        const result = await subscribeTokencontractbnb.methods
          .allowance(this.props.coinbase, bnbsubscribeAddress)
          .call()
          .then();
        if (result != 0) {
          this.setState({ lockActive: true });
          this.setState({ loadspinner: false });
          this.setState({ isApproved: true });
        } else if (result == 0) {
          this.setState({ lockActive: false });
          this.setState({ loadspinner: false });
          this.setState({ isApproved: false });
        }
      } else {
        const result = await subscribeTokencontractavax.methods
          .allowance(this.props.coinbase, avaxsubscribeAddress)
          .call()
          .then();

        if (result != 0) {
          this.setState({ lockActive: true });
          this.setState({ loadspinner: false });
          this.setState({ isApproved: true });
        } else if (result == 0) {
          this.setState({ lockActive: false });
          this.setState({ loadspinner: false });
          this.setState({ isApproved: false });
        }
      }
    }
  };

  handleSubscribe = async (e) => {
    // e.preventDefault();
    let subscriptionContract = await window.getContract({
      key:
        this.props.networkId === 1
          ? "SUBSCRIPTIONETH"
          : this.props.networkId === 56
          ? "SUBSCRIPTIONBNB"
          : "SUBSCRIPTION",
    });

    this.setState({ loadspinnerSub: true });

    // let price =
    // this.props.networkId === 1
    //   ? await window.getEstimatedTokenSubscriptionAmountETH(this.state.selectedSubscriptionToken)
    //   : this.props.networkId === 56
    //   ? await window.getEstimatedTokenSubscriptionAmountBNB(this.state.selectedSubscriptionToken)
    //   : await window.getEstimatedTokenSubscriptionAmount(this.state.selectedSubscriptionToken);
// console.log(this.state.price, this.state.selectedSubscriptionToken)
    await subscriptionContract.methods
      .subscribe(this.state.selectedSubscriptionToken, this.state.price)
      .send({ from: await window.getCoinbase() })
      .then(() => {
        this.setState({ loadspinnerSub: false, approveStatus: "success" });
        this.props.onSubscribe()
        window.location.href = 'https://app.dypius.com/account'

      })
      .catch((e) => {
        this.setState({ status: e?.message });
        this.setState({ loadspinner: false, approveStatus: "fail", loadspinnerSub: false });
        setTimeout(() => {
          this.setState({
            status: "",
            loadspinner: false,
            loadspinnerSub: false,
            approveStatus: "initial",
          });
        }, 8000);
      });
  };

  handleUnsubscribe = async (e) => {
    e.preventDefault();
    let subscriptionContract = await window.getContract({
      key:
        this.props.networkId === 1
          ? "SUBSCRIPTIONETH"
          : this.props.networkId === 56
          ? "SUBSCRIPTIONBNB"
          : "SUBSCRIPTION",
    });
    await subscriptionContract.methods
      .unsubscribe()
      .send({ from: await window.getCoinbase() })
      .then(() => {
        // this.setState({ loadspinner: false });
      })
      .catch((e) => {
        this.setState({ status: "An error occurred. Please try again" });
        // this.setState({ loadspinner: false });
      });
  };

  onImageChange = (event) => {
    const fileTypes = [
      "image/apng",
      "image/bmp",
      "image/gif",
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/svg+xml",
      "image/tiff",
      "image/webp",
      "image/x-icon",
    ];

    this.setState({ showSavebtn: true, showRemovebtn: true });

    if (fileTypes.includes(event.target.files[0].type)) {
      if (event.target.files && event.target.files[0]) {
        this.setState({ selectedFile: event.target.files[0] });
        let reader = new FileReader();
        reader.onload = (e) => {
          this.setState({ image: e.target.result });
          this.handleSubmission();
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      window.alertify.error("Image type not supported");
    }
  };

  handleSubmission = async () => {
    const formData = new FormData();
    formData.append("image", this.state.selectedFile);
    this.setState({ loadspinnerSave: true });
    if (this.props.coinbase && this.props.coinbase.includes("0x")) {
      await window.connectWallet(undefined, false);
    }
    let signature;

    try {
      signature = await window.sign(
        window.config.metamask_message2,
        await window.getCoinbase()
      );
    } catch (e) {
      console.error(e);
      console.log(e);
      this.setState({ loadspinnerSave: false });

      return;
    }

    if (!signature) {
      window.alertify("No Signature provided");
      this.setState({ loadspinnerSave: false });

      return;
    }

    formData.append("signature", signature);

    await fetch("https://api-image.dyp.finance/api/v1/upload/avatar", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Success:", result);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    window.alertify.message("Avatar has been uploaded successfully!");
    this.setState({ loadspinnerSave: false, showSavebtn: false });
    // this.fetchAvatar().then();
  };

  fetchAvatar = async () => {
    const response = await fetch(
      `https://api-image.dyp.finance/api/v1/avatar/${this.props.coinbase}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.setState({ image: data.status === 0 ? Placeholder : data.avatar });
      })
      .catch(console.error);

    return response;
  };

  deleteAvatar = async () => {
    const response = await fetch(
      `https://api-image.dyp.finance/api/v1/avatar/${this.props.coinbase}/delete`
    )
      .then((res) => {
        return res.json();
      })
      .then(() => {
        this.setState({ image: Placeholder });
      })
      .catch(console.error);

    return response;
  };

  GetSubscriptionForm = () => {
    let tokenDecimals =
      this.props.networkId === 1
        ? window.config.subscriptioneth_tokens[
            this.state.selectedSubscriptionToken
          ]?.decimals
        : this.props.networkId === 56
        ? window.config.subscriptionbnb_tokens[
            this.state.selectedSubscriptionToken
          ]?.decimals
        : window.config.subscription_tokens[
            this.state.selectedSubscriptionToken
          ]?.decimals;
    // this.handleCheckIfAlreadyApproved()
    let mycaws = [...this.state.myNFTs, ...this.state.myStakess];

    const focusInput = (input) => {
      document.getElementById(input).focus();
    };

    const freePlanItems = [
      // "Real time DYP Tools",
      // "Pair Explorer",
      // "Big Swap Explorer",
      // "Top Tokens",
      "Yields",
      "News Section",
      "DYP Locker",
      // "Community Trust Vote",
      "dApps access",
    ];

    const paidPlanItems = [
      "All free features included",
      // "Manual research info for projects",
      // "Full access to Community Trust Vote",
      "Perform any votes on the News section",
      "Early access to new features released in the future",
      "Guaranteed allocation to presales of new projects launched using our Launchpad",
    ];

   

  const benefits = [
    'DYP Tools administrative dashboard',
    'Exclusive access to World of Dypians metaverse platform',
    'Priority allocation to presales of new projects through Dypius Launchpad',
    'Voting capabilities in the News section',
    'Early access to upcoming features and updates'
  ]

  const keyFeatures = [
    {
      icon: 'chart',
      content: 'Easy access to a range of tools and features, all in one convenient location.'
    },
    {
      icon: 'globe',
      content: 'Access unique content and experiences only available in the WoD.'
    },
    {
      icon: 'coins',
      content: 'Be among the first to find new projects before they hit the market.'
    },
    {
      icon: 'notes',
      content: `Vote instantly for your preferred news articles in real-time.`
    },
    {
      icon: 'eye',
      content: `Get a sneak peek at what's coming next and plan ahead.`
    },
  
  ]

    return (
      this.props.appState.isPremium ? 
      <>
      </>
      :
      <div style={{ minHeight: "65vh" }}>
      {/* <div className="row mt-5 gap-4 gap-lg-0">
        <div className="col-12 col-lg-6 position-relative d-flex justify-content-center">
          <div
            className={`purplediv`}
            style={{
              top: "15px",
              zIndex: 1,
              left: "12px",
              background:
                this.props.isPremium === false
                  ? "#50AF95"
                  : "#8E97CD",
            }}
          ></div>
          <div
            className={`row free-plan-container p-3 position-relative w-100 ${
              this.props.isPremium === false && "green-border"
            }`}
          >
            <div className="d-flex align-items-center gap-2">
              <img
                src={require("./assets/freePlanIcon.svg").default}
                alt=""
              />
              <h6 className="free-plan-title">Free plan</h6>
            </div>
            <div className="col-12 col-lg-6">
              <div className="d-flex flex-column gap-1 mt-3">
                {freePlanItems.map((item, index) => (
                  <div
                    key={index}
                    className="free-plan-item d-flex align-items-center justify-content-between p-2"
                  >
                    <span className="free-plain-item-text">{item}</span>
                    <img
                      src={require("./assets/freeCheck.svg").default}
                      alt=""
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 col-lg-6 free-plan-image"></div>
            <div className="col-12 d-flex flex-column justify-content-end">
              <hr className="form-divider my-4" style={{ height: "2px" }} />
              <div className="d-flex flex-column">
                <span className="inactive-plan">Active</span>
                <span className="inactive-plan">Free plan</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6 position-relative d-flex justify-content-center">
          <div
            className="purplediv"
            style={{
              top: "15px",
              zIndex: 1,
              left: "12px",
              background:
                this.props.isPremium === true
                  ? "#50AF95"
                  : "#8E97CD",
            }}
          ></div>
          <div
            className={`row free-plan-container p-3 position-relative w-100 ${
              this.props.isPremium === true && "green-border"
            }`}
          >
            <div className="d-flex align-items-center gap-2">
              <img
                src={require("./assets/paidPlanIcon.svg").default}
                alt=""
              />
              <h6 className="free-plan-title">Dypian plan</h6>
            </div>
            <div className="col-12 col-lg-6">
              <div className="d-flex flex-column gap-1 mt-3">
                {paidPlanItems.map((item, index) => (
                  <div
                    key={index}
                    className="free-plan-item d-flex align-items-center justify-content-between p-2"
                  >
                    <span className="free-plain-item-text">{item}</span>
                    <img
                      src={require("./assets/freeCheck.svg").default}
                      alt=""
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-lg-6 paid-plan-image"></div>
            <div className="col-12">
              {!this.props.isPremium ? (
                <>
                  <div className="premiumbanner">
                    <div className="d-flex align-items-center justify-content-between">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                        }}
                      >
                        <h3 className="subscr-title">
                          Lifetime subscription{" "}
                        </h3>
                        <p className="subscr-subtitle">
                          The subscription tokens will be used to buy DYP
                        </p>
                      </div>
                      <div>
                        <div className="d-flex gap-2 flex-column flex-lg-row">
                          <h3 className="subscr-price">75 USD</h3>
                        </div>
                        <p className="subscr-note">*Exclusive offer</p>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div
                      style={{
                        color: "#F7F7FC",
                        fontSize: "14px",
                        fontWeight: "500",
                        lineHeight: "20px",
                      }}
                    >
                      Subscribe <br></br> to the Dypian plan
                    </div>
                    <div
                      className="btn filledbtn px-3 px-lg-5"
                      style={{ whiteSpace: "pre" }}
                      type=""
                      onClick={() => {
                        this.setState({
                          subscribe_now: !this.state.subscribe_now,
                        });
                        this.props.networkId === 1
                          ? this.handleSubscriptionTokenChange(
                              this.state.wethAddress
                            )
                          : this.props.networkId === 56
                          ? this.handleSubscriptionTokenChange(
                              this.state.wbnbAddress
                            )
                          : this.handleSubscriptionTokenChange(
                              this.state.wavaxAddress
                            );
                        this.handleCheckIfAlreadyApproved(
                          this.props.networkId === 1
                            ? this.state.wethAddress
                            : this.props.networkId === 56
                            ? this.state.wbnbAddress
                            : this.state.wavaxAddress
                        );
                        this.props.networkId === 1
                          ? this.setState({
                              dropdownIcon: "weth",
                              dropdownTitle: "WETH",
                            })
                          : this.props.networkId === 56
                          ? this.setState({
                              dropdownIcon: "wbnb",
                              dropdownTitle: "WBNB",
                            })
                          : this.setState({
                              dropdownIcon: "wavax",
                              dropdownTitle: "WAVAX",
                            });
                      }}
                    >
                      Subscribe now
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="premiumbanner">
                    <div className="d-flex align-items-center justify-content-between">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                        }}
                      >
                        <h3 className="subscr-title">Welcome premium user</h3>
                      </div>
                    
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div
                      style={{
                        color: "#4FAD93",
                        fontSize: "14px",
                        fontWeight: "500",
                        lineHeight: "20px",
                      }}
                    >
                      Active <br></br> Dypian plan
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div> */}
      <div className="row mt-5">
        <div className="d-flex flex-column">
        <h6 className="plans-page-title">
        Upgrade to Premium Membership and Unlock Exclusive Benefits Today!
        </h6>
        <p className="plans-page-desc mt-4">
        The premium membership is designed to enhance your experience and provide you with outstanding value.
        </p>
        </div>
        <div className="d-flex flex-column flex-lg-row align-items-center align-items-lg-end justify-content-center justify-content-lg-between all-plans-wrapper mt-4">
          <div className="plans-benefits d-flex align-items-center p-3">
            <ul className="d-flex flex-column gap-3">
              {benefits.map((item, index) => (
                <li key={index} className="d-flex align-items-center gap-2">
                  <img src={greenCheck} className="green-check" alt="checkmark" />
                  <span className="plans-benefit-title mb-0">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="premium-subscribe-wrapper p-3">
            <div className="premium-gradient d-flex align-items-center justify-content-between p-3">
              <div className="d-flex flex-column">
                <span className="premium-span">
                  Premium
                </span>
                <h6 className="premium-price">
                $75
                </h6>
              </div>
              <img src={premiumDypTag} alt="premium dyp" />
            </div>
             <div className="d-flex flex-column" style={{position: 'relative', top: '-25px'}}>
             <span className="lifetime-subscription">Lifetime subscription</span>
              <span className="lifetime-desc">The subscription tokens will be used to buy DYP</span>
             </div>
              <div className="d-flex justify-content-end mt-0 mt-lg-3">
              <div
                      className="btn filledbtn px-3 px-lg-5"
                      style={{ whiteSpace: "pre" }}
                      type=""
                      onClick={() => {
                        this.setState({
                          subscribe_now: !this.state.subscribe_now,
                        });
                        this.props.networkId === 1
                          ? this.handleSubscriptionTokenChange(
                              this.state.wethAddress
                            )
                          : this.props.networkId === 56
                          ? this.handleSubscriptionTokenChange(
                              this.state.wbnbAddress
                            )
                          : this.handleSubscriptionTokenChange(
                              this.state.wavaxAddress
                            );
                        this.handleCheckIfAlreadyApproved(
                          this.props.networkId === 1
                            ? this.state.wethAddress
                            : this.props.networkId === 56
                            ? this.state.wbnbAddress
                            : this.state.wavaxAddress
                        );
                        this.props.networkId === 1
                          ? this.setState({
                              dropdownIcon: "weth",
                              dropdownTitle: "WETH",
                            })
                          : this.props.networkId === 56
                          ? this.setState({
                              dropdownIcon: "wbnb",
                              dropdownTitle: "WBNB",
                            })
                          : this.setState({
                              dropdownIcon: "wavax",
                              dropdownTitle: "WAVAX",
                            });
                      }}
                    >
                      Subscribe now
                    </div>
              </div>
          </div>
          <div className="premium-dyp-wrapper">
            <img src={premiumDypBanner} className="premium-dyp-banner" alt="" />
          </div>
          {/* <img src={premiumDyp} alt="premium dyp banner" className="premium-dyp-banner" /> */}
        </div>
        <div className="features-wrapper w-100 d-flex align-items-center justify-content-between my-5 flex-column flex-lg-row gap-3 gap-lg-0">
   {keyFeatures.map((item) => (
    <KeyFeaturesCard icon={item.icon} plansClass={'plans-feature'} content={item.content} /> 
   ))}
  </div>
      </div>
      
      {this.state.subscribe_now === true ? (
        <div
          className="subscribe-wrapper row mt-4 justify-content-end"
          id="subscribe"
        >
          <div className="subscribe-container p-3 position-relative">
            <div
              className="purplediv"
              style={{ background: "#8E97CD" }}
            ></div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <img src={coinStackIcon} alt="coin stack" />
                <h6 className="free-plan-title">Dypian Plan Subscription</h6>
              </div>
              <img
                src={require(`./assets/clearFieldIcon.svg`).default}
                height={28}
                width={28}
                className="cursor-pointer"
                onClick={() => this.setState({ subscribe_now: false })}
                alt="close subscription"
              />
            </div>
            <div className="d-flex mt-4 align-items-end justify-content-between flex-column-reverse flex-lg-row w-100">
              <div className="d-flex flex-column gap-3 subscribe-input-container">
                <span className="token-amount-placeholder">
                  Select Subscription Token
                </span>
                {/* <div
                    className="input-container px-0"
                    style={{ width: "100%" }}
                  >
                    <input
                      type="number"
                      disabled
                      min={1}
                      max={365}
                      id="token_amount"
                      name="token_amount"
                      placeholder=" "
                      className="text-input"
                      value={this.state.formattedPrice}
                      style={{ width: "100%" }}
                    />
                    <label
                      htmlFor="token_amount"
                      className="label"
                      onClick={() => focusInput("token_amount")}
                    >
                      Subscription Token Amount
                    </label>
                  </div> */}
                <div class="dropdown position relative">
                  <button
                    class={`btn launchpad-dropdown d-flex justify-content-between align-items-center dropdown-toggle w-100`}
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div
                      className="d-flex align-items-center gap-2"
                      style={{ color: "#fff" }}
                    >
                      <img
                        src={
                          require(`./assets/${this.state.dropdownIcon.toLowerCase()}Icon.svg`)
                            .default
                        }
                        alt=""
                      />
                      {this.state.dropdownTitle}
                    </div>
                    <img src={launchpadIndicator} alt="" />
                  </button>
                  <ul class="dropdown-menu w-100">
                    {/* <li className="dropdown-item launchpad-item d-flex align-items-center gap-2"
                    onClick={() => {
                      this.setState({dropdownTitle: 'WETH', dropdownIcon: 'wethIcon.svg'})
                    }}
                    >
                      <img
                        src={require(`./assets/wethIcon.svg`).default}
                        alt=""
                      />
                      WETH
                    </li>
                    <li className="dropdown-item launchpad-item d-flex align-items-center gap-2"
                    onClick={() => {
                      this.setState({dropdownTitle: 'USDT', dropdownIcon: 'usdtIcon.svg'})
                    }}
                    >
                      <img
                        src={require(`./assets/usdtIcon.svg`).default}
                        alt=""
                      />
                      USDT
                    </li>
                    <li className="dropdown-item launchpad-item d-flex align-items-center gap-2"
                    onClick={() => {
                      this.setState({dropdownTitle: 'USDC', dropdownIcon: 'usdcIcon.svg'})
                    }}
                    >
                      <img
                        src={require(`./assets/usdcIcon.svg`).default}
                        alt=""
                      />
                      USDC
                    </li> */}
                    {Object.keys(
                      this.props.networkId === 1
                        ? window.config.subscriptioneth_tokens
                        : this.props.networkId === 56
                        ? window.config.subscriptionbnb_tokens
                        : window.config.subscription_tokens
                    ).map((t, i) => (
                      // <span className="radio-wrapper" key={t}>
                      //   <input
                      //     type="radio"
                      //     value={t}
                      //     name={"tokensymbol"}
                      //     checked={
                      //       t == this.state.selectedSubscriptionToken
                      //     }
                      //     disabled={!this.props.appState.isConnected}
                      //     onChange={
                      //       (e) => {
                      //         this.handleSubscriptionTokenChange(
                      //           e.target.value
                      //         );
                      //         this.handleCheckIfAlreadyApproved();
                      //       console.log(e.target.value);

                      //       }

                      //     }
                      //   />
                      //   {this.props.networkId === 1
                      //     ? window.config.subscriptioneth_tokens[t]?.symbol
                      //     : window.config.subscription_tokens[t]?.symbol}
                      // </span>
                      <li
                      key={i}
                        className="dropdown-item launchpad-item d-flex align-items-center gap-2"
                        onClick={() => {
                          this.setState({
                            dropdownTitle:
                              this.props.networkId === 1
                                ? window.config.subscriptioneth_tokens[t]
                                    ?.symbol
                                : this.props.networkId === 56
                                ? window.config.subscriptionbnb_tokens[t]
                                    ?.symbol
                                : window.config.subscription_tokens[t]
                                    ?.symbol,
                            dropdownIcon:
                              this.props.networkId === 1
                                ? window.config.subscriptioneth_tokens[t]
                                    ?.symbol
                                : this.props.networkId === 56
                                ? window.config.subscriptionbnb_tokens[t]
                                    ?.symbol
                                : window.config.subscription_tokens[t]
                                    ?.symbol,
                          });
                          // console.log(t);
                          this.handleSubscriptionTokenChange(t);
                          this.handleCheckIfAlreadyApproved(t);
                        }}
                      >
                        <img
                          src={
                            this.props.networkId === 1
                              ? require(`./assets/${window.config.subscriptioneth_tokens[
                                  t
                                ]?.symbol.toLowerCase()}Icon.svg`).default
                              : this.props.networkId === 56
                              ? require(`./assets/${window.config.subscriptionbnb_tokens[
                                  t
                                ]?.symbol.toLowerCase()}Icon.svg`).default
                              : require(`./assets/${window.config.subscription_tokens[
                                  t
                                ]?.symbol.toLowerCase()}Icon.svg`).default
                          }
                          alt=""
                        />
                        {this.props.networkId === 1
                          ? window.config.subscriptioneth_tokens[t]?.symbol
                          : this.props.networkId === 56
                          ? window.config.subscriptionbnb_tokens[t]?.symbol
                          : window.config.subscription_tokens[t]?.symbol}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="d-flex flex-column align-items-end justify-content-lg-end">
                <span className="token-balance-placeholder">
                  Token Balance
                </span>
                <h6 className="account-token-amount">
                  {" "}
                  {getFormattedNumber(
                    this.state.tokenBalance / 10 ** tokenDecimals,
                    6
                  )}
                </h6>
              </div>
            </div>
            <div
                className="subscription-token-wrapper  p-2 d-flex align-items-center justify-content-between  mt-3"
                style={{ width: "100%" }}
              >
                <span className="token-amount-placeholder">
                  Subscription price:
                </span>
                <div className="d-flex align-items-center gap-2">
                  <span className="usdt-text">
                    {this.state.formattedPrice.slice(0, 9)}
                  </span>

                  <img
                    src={
                      require(`./assets/${this.state.dropdownIcon.toLowerCase()}Icon.svg`)
                        .default
                    }
                    height={24}
                    width={24}
                    alt="usdt"
                  />
                </div>
              </div>
            <hr className="form-divider my-4" />
            <div className={`d-flex align-items-center ${!this.props.coinbase ? 'justify-content-between' : 'justify-content-end'}`}>
            {!this.props.coinbase  &&
              <span style={{color: 'rgb(227, 6 ,19)'}}>Please connect your wallet first</span>
              }
              <div className="d-flex flex-column gap-2 justify-content-end align-items-center">
                <button
                  className={"btn success-btn px-4 align-self-end"}
                  disabled={this.state.approveStatus === "fail"  || !this.props.coinbase ? true : false}
                  style={{
                    background:
                      this.state.approveStatus === "fail"
                        ? "linear-gradient(90.74deg, #f8845b 0%, #f0603a 100%)"
                        : "linear-gradient(90.74deg, #75CAC2 0%, #57B6AB 100%)",
                  }}
                  onClick={(e) =>
                    this.state.isApproved === false
                      ? this.handleApprove(e)
                      : this.handleSubscribe()
                  }
                >
                  {this.state.isApproved === true &&
                  this.state.loadspinner === false && this.state.loadspinnerSub === false &&
                  (this.state.approveStatus === "deposit" || this.state.approveStatus === "initial") ? (
                    "Subscribe"
                  ) : this.state.isApproved === false &&
                    this.state.loadspinner === false &&
                    this.state.approveStatus === "initial" && this.state.loadspinnerSub === false ? (
                    "Approve"
                  ) : this.state.loadspinner === false &&
                    this.state.approveStatus === "fail" && this.state.loadspinnerSub === false ? (
                    "Failed"
                  ) : (
                    <div
                      className="spinner-border "
                      role="status"
                      style={{ height: "1.5rem", width: "1.5rem" }}
                    ></div>
                  )}
                </button>
                <span style={{ color: "#E30613" }}>{this.state.status}</span>
              </div>
            </div>
            
          </div>
        </div>
      ) : (
        <></>
      )}
      {/* <form onSubmit={this.handleSubscribe}>     
        <div>
          {!this.props.isPremium ? (
            <table className="w-100">
              <tr
                className="tablerow"
                style={{ position: "relative", top: "-10px" }}
              >
                <th className="tableheader"></th>
                <th className="tableheader freetext">
                  <img
                    src={this.props.theme === "theme-dark" ? FreeWhite : Free}
                    alt=""
                  />{" "}
                  Free
                </th>
                <th className="tableheader premiumtext">
                  <img src={Premium} alt="" /> Premium
                </th>
              </tr>
              {benefits.length > 0 &&
                benefits.map((item, key) => {
                  return (
                    <>
                      <tr key={key} className="tablerow">
                        <td className="tabledata">{item.title}</td>
                        <td className="tabledata">
                          <img
                            src={item.free === "yes" ? Check : Cross}
                            alt=""
                            className="itemdataimg"
                          />{" "}
                        </td>
                        <td className="tabledata">
                          <img
                            src={item.premium === "yes" ? Check : Cross}
                            alt=""
                          />
                        </td>
                      </tr>
                    </>
                  );
                })}
            </table>
          ) : (
            <>
              <table className="w-100">
                <tr
                  className="tablerow"
                  style={{ position: "relative", top: "-10px" }}
                >
                  <th className="tableheader"></th>
                  <th className="tableheader freetext">
                    <img
                      src={
                        this.props.theme === "theme-dark" ? FreeWhite : Free
                      }
                      alt=""
                    />{" "}
                    Free
                  </th>
                  <th className="tableheader premiumtext">
                    <img src={Premium} alt="" /> Premium
                  </th>
                </tr>
                {benefits.length > 0 &&
                  benefits.slice(0, 1).map((item, key) => {
                    return (
                      <>
                        <tr key={key} className="tablerow">
                          <td className="tabledata" style={{ width: "79%" }}>
                            {item.title}
                          </td>
                          <td className="tabledata">
                            <img
                              src={item.free === "yes" ? Check : Cross}
                              alt=""
                            />{" "}
                          </td>
                          <td className="tabledata">
                            <img
                              src={item.premium === "yes" ? Check : Cross}
                              alt=""
                            />
                          </td>
                        </tr>
                      </>
                    );
                  })}
              </table>

              <Collapsible
                trigger={this.state.triggerText}
                onClose={() => {
                  this.setState({ triggerText: "See more V" });
                }}
                onOpen={() => {
                  this.setState({ triggerText: "See less Ʌ" });
                }}
              >
                <table className="w-100">
                  {benefits.length > 0 &&
                    benefits.slice(1, benefits.length).map((item, key) => {
                      return (
                        <>
                          <tr key={key} className="tablerow">
                            <td
                              className="tabledata"
                              style={{ width: "77%" }}
                            >
                              {item.title}
                            </td>
                            <td className="tabledata">
                              <img
                                src={item.free === "yes" ? Check : Cross}
                                alt=""
                              />
                            </td>
                            <td className="tabledata">
                              <img
                                src={item.premium === "yes" ? Check : Cross}
                                alt=""
                              />
                            </td>
                          </tr>
                        </>
                      );
                    })}
                </table>
              </Collapsible>
            </>
          )}

         
        </div>
        {!this.props.isPremium ? (   
          this.state.subscribe_now === true ? (
            <>
              <div className="mt-4 ml-0">
                <div className="row m-0" style={{ gap: 100 }}>
                  <div
                    className="form-group"
                    style={{ maxWidth: 490, width: "100%" }}
                  >
                    <p>Select Subscription Token</p>
                    <div className="row m-0" style={{ gap: 10 }}>
                      {Object.keys(
                        this.props.networkId === 1
                          ? window.config.subscriptioneth_tokens
                          : window.config.subscription_tokens
                      ).map((t, i) => (
                        <span className="radio-wrapper" key={t}>
                          <input
                            type="radio"
                            value={t}
                            name={"tokensymbol"}
                            checked={
                              t == this.state.selectedSubscriptionToken
                            }
                            disabled={!this.props.appState.isConnected}
                            onChange={
                              (e) => {
                                this.handleSubscriptionTokenChange(
                                  e.target.value
                                );
                                this.handleCheckIfAlreadyApproved();
                              console.log(e.target.value);

                              }

                            }
                          />
                          {this.props.networkId === 1
                            ? window.config.subscriptioneth_tokens[t]?.symbol
                            : window.config.subscription_tokens[t]?.symbol}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <div>
                      <p>Token Amount</p>
                      <span className="subscription-subtitle">
                        Subcription token amount
                      </span>
                      <div
                        className="align-items-center row m-0"
                        style={{ gap: 40 }}
                      >
                        <input
                          style={{ width: "266px", height: 42 }}
                          disabled
                          onChange={(e) => {
                            let amount = new window.BigNumber(e.target.value);
                            amount = amount.times(1e18).toFixed(0);
                            this.setState({ amount });
                          }}
                          value={this.state.formattedPrice}
                          type="number"
                          placeholder="Subscription Token Amount"
                          className="form-control"
                        />
                        <div className="d-flex flex-column">
                          <span className="balance-placeholder">
                            Balance:
                          </span>
                          <span className="balance-text">
                            {getFormattedNumber(
                              this.state.tokenBalance / 10 ** tokenDecimals,
                              6
                            )}
                          </span>
                        </div>
                      </div>
                      <br />
                    </div>
                  </div>
                </div>
                <div className="row m-0" style={{ gap: 30 }}>
                  <button
                    disabled={!this.props.appState.isConnected}
                    onClick={this.handleApprove}
                    className="btn v1"
                    style={{
                      background:
                        this.state.lockActive === false
                          ? "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)"
                          : "#C4C4C4",
                      width: 230,
                      pointerEvents:
                        this.state.lockActive === false ? "auto" : "none",
                    }}
                    type="button"
                  >
                    {this.state.loadspinner === true ? (
                      <>
                        <div
                          className="spinner-border "
                          role="status"
                          style={{ height: "1.5rem", width: "1.5rem" }}
                        ></div>
                      </>
                    ) : (
                      "APPROVE"
                    )}
                  </button>
                  <button
                    disabled={!this.props.appState.isConnected}
                    className="btn v1 ml-0"
                    type="submit"
                    style={{
                      background:
                        this.state.lockActive === false
                          ? "#C4C4C4"
                          : "linear-gradient(51.32deg, #E30613 -12.3%, #FA4A33 50.14%)",
                      width: 230,
                      pointerEvents:
                        this.state.lockActive === false ? "none" : "auto",
                    }}
                  >
                    {this.state.loadspinnerSub === true ? (
                      <>
                        <div
                          className="spinner-border "
                          role="status"
                          style={{ height: "1.5rem", width: "1.5rem" }}
                        ></div>
                      </>
                    ) : (
                      "SUBSCRIBE"
                    )}
                  </button>
                </div>
                {this.state.status !== "" && (
                  <div className="status-wrapper">
                    <p style={{ color: "#E30613" }}>
                      <img src={Error} alt="" /> {this.state.status}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <></>
          )
        ) : (
          <>
            <div>
            <p>
              <i className="fas fa-check-circle"></i> Premium Member 
            </p>
            <p>
              DYP Locked in Subscription:{" "}
              {getFormattedNumber(
                this.props.appState.subscribedPlatformTokenAmount / 1e18,
                6
              )}{" "}
              DYP
            </p>
            
          </div>
            <div className="premiumbanner2">
              <div className="row m-0 justify-content-between">
                <div
                  style={{
                    maxWidth: 335,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <h3 className="subscr-title">Welcome Premium User</h3>
                  <p className="subscr-subtitle">
                    When you unsubscribe the DYP will be unlocked and sent to
                    your wallet
                  </p>
                </div>
                <div>
                  <button
                    disabled={!this.props.appState.isConnected}
                    onClick={this.handleUnsubscribe}
                    className="savebtn w-auto mt-2 v1"
                    type="button"
                    style={{ padding: "10px 20px" }}
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </form> */}

      {/* <h4 className="d-block mb-5 mt-5" id="my-fav">
        My favourite pairs
      </h4>
      <div className="row p-0 m-0 favorites-grid">
        {this.state.favorites.map((lock, index) => {
          return (
            <NavLink
              key={index}
              className="p-0"
              to={`/pair-explorer/${lock.id}`}
            >
              <div style={{ position: "relative" }}>
                <div
                  className="d-flex avax"
                  style={{
                    border: "2px solid #565891",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{
                      position: "absolute",
                      top: "-17px",
                      left: "50%",
                      width: "115px",
                      height: "34px",
                      transform: "translateX(-50%)",
                      borderRadius: "50px",
                      background:
                        "linear-gradient(93.99deg, #DF2C2D 0%, #F86465 100%)",
                      gap: "5px",
                    }}
                  >
                    <img
                      src={require("../../assets/wavax.svg").default}
                      alt=""
                      style={{ height: 20, width: 20 }}
                    ></img>
                    <div style={{ color: "#F7F7FC" }}>Avalanche</div>
                  </div>

                  <div className="pair-locks-wrapper">
                    <div className="row-wrapper">
                      <span className="left-info-text">ID</span>
                      <span className="right-info-text">{index + 1}</span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Pair Address</span>
                      <span className="right-info-text">
                        ...{lock.id.slice(35)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Tokens</span>
                      <span className="right-info-text">
                        {lock.token0.symbol}/{lock.token1.symbol}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Total liquidity</span>
                      <span className="right-info-text">
                        {getFormattedNumber(lock.reserveUSD, 2)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">
                        Pooled {lock.token0.symbol}
                      </span>
                      <span className="right-info-text">
                        {getFormattedNumber(lock.reserve0, 2)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">
                        Pooled {lock.token1.symbol}
                      </span>
                      <span className="right-info-text">
                        {getFormattedNumber(lock.reserve1, 2)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">LP Holders</span>
                      <span className="right-info-text">
                        {lock.liquidityProviderCount}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">
                        Pair transactions:
                      </span>
                      <span className="right-info-text">{lock.txCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </NavLink>
          );
        })}
        {this.state.favoritesETH.map((lock, index) => {
          return (
            <NavLink
              key={index}
              className="p-0"
              to={`/pair-explorer/${lock.id}`}
              onClick={() => {
                this.props.handleSwitchNetwork(1);
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  className="d-flex"
                  style={{
                    border: "2px solid #565891",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{
                      position: "absolute",
                      top: "-17px",
                      left: "50%",
                      width: "106px",
                      height: "34px",
                      transform: "translateX(-50%)",
                      borderRadius: "50px",
                      background:
                        "linear-gradient(93.99deg, #4ED5CD 0%, #524FD8 100%)",
                      gap: "5px",
                    }}
                  >
                    <img src="/assets/img/ethereum.svg"></img>
                    <div style={{ color: "#F7F7FC" }}>Ethereum</div>
                  </div>
                  <div className="pair-locks-wrapper">
                    <div className="row-wrapper">
                      <span className="left-info-text">ID</span>
                      <span className="right-info-text">{index + 1}</span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Pair Address</span>
                      <span className="right-info-text">
                        ...{lock.id.slice(35)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Tokens</span>
                      <span className="right-info-text">
                        {lock.token0.symbol}/{lock.token1.symbol}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">Total liquidity</span>
                      <span className="right-info-text">
                        {getFormattedNumber(lock.reserveUSD, 2)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">
                        Pooled {lock.token0.symbol}
                      </span>
                      <span className="right-info-text">
                        {getFormattedNumber(lock.reserve0, 2)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">
                        Pooled {lock.token1.symbol}
                      </span>
                      <span className="right-info-text">
                        {getFormattedNumber(lock.reserve1, 2)}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">LP Holders</span>
                      <span className="right-info-text">
                        {lock.liquidityProviderCount}
                      </span>
                    </div>
                    <div className="row-wrapper">
                      <span className="left-info-text">
                        Pair transactions:
                      </span>
                      <span className="right-info-text">{lock.txCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div> */}
    </div>
    );
  };

  render() {
    return (
      <div className="locker container-lg">
        <div>
          <div className="mb-4">{this.GetSubscriptionForm()}</div>
        </div>
      </div>
    );
  }
}
