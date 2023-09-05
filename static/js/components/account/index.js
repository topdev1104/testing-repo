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
import gotoWod from "./assets/gotoWod.svg";
import { useHistory } from "react-router-dom";

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
      usdtAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      usdteAddress: "0xc7198437980c041c805a1edcba50c1ce5db95118",
      triggerText: "See more V",
      isApproved: false,
      myNFTs: [],
      myStakess: [],
      myLandNFTs: [],
      landStakes: [],
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
      ethBalance: "0.0",
      bnbBalance: "0.0",
      avaxBalance: "0.0",
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

  fetchfavData() {
    window
      .getFavoritesETH()
      .then((favorites) => {
        this.setState({ favoritesETH: favorites });
      })
      .catch(console.error);
    if (this.props.networkId === 1) {
      this.setState({
        selectedSubscriptionToken: Object.keys(
          window.config.subscriptioneth_tokens
        )[0],
      });
    } else if (this.props.networkId !== 1) {
      this.setState({
        selectedSubscriptionToken: Object.keys(
          window.config.subscription_tokens
        )[0],
      });
    }
    window
      .getFavorites()
      .then((favorites) => {
        this.setState({ favorites: favorites });
      })
      .catch(console.error);
  }

  fetchUsername = async () => {
    if (this.props.coinbase) {
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
  };

  getDypBalance = async () => {
    const web3eth = new Web3(
      "https://mainnet.infura.io/v3/94608dc6ddba490697ec4f9b723b586e"
    );
    const web3avax = new Web3("https://api.avax.network/ext/bc/C/rpc");
    const web3bsc = new Web3("https://bsc-dataseed.binance.org/");
    const tokenAddress = "0x961C8c0B1aaD0c0b10a51FeF6a867E3091BCef17";
    const walletAddress = this.props.coinbase;
    const TokenABI = window.ERC20_ABI;
    if (walletAddress && walletAddress !== undefined) {
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

  getAllBalance = async () => {
    const tokenAddress = "0x961C8c0B1aaD0c0b10a51FeF6a867E3091BCef17";
    const walletAddress = this.props.coinbase;
    const TokenABI = window.ERC20_ABI;

    if (this.props.coinbase && this.props.coinbase != undefined) {
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
          let depositedTokens = new BigNumber(data).div(1e18).toFixed(2);

          this.setState({ ethBalance: depositedTokens });
        });
      await contract2.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          let depositedTokens = new BigNumber(data).div(1e18).toFixed(2);

          this.setState({ avaxBalance: depositedTokens });
        });

      await contract3.methods
        .balanceOf(walletAddress)
        .call()
        .then((data) => {
          let depositedTokens = new BigNumber(data).div(1e18).toFixed(2);

          this.setState({ bnbBalance: depositedTokens });
        });
    }
  };

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):

    if (this.props.isPremium === false) {
      window.location.href = "https://app.dypius.com/plans";
    }

    if (this.props.coinbase !== prevProps.coinbase) {
      this.fetchUserPools();
      // this.getDypBalance();
      this.fetchAvatar();
      this.fetchUsername();
      this.fetchUserPools();
      this.fetchAvaxFarming();
      this.fetchAvaxStaking();
      this.fetchBnbStaking();
      this.fetchBscFarming();
      this.fetchEthFarming();
      this.fetchEthStaking();
      this.getAllBalance();
      this.props.onSubscribe()
      this.myNft().then();
      this.myStakes().then();
      this.myLandNft().then();
      this.myLandStakes().then();
    }

    if (this.props.networkId !== prevProps.networkId) {
      if (this.props.networkId === 43114) {
        this.handleSubscriptionTokenChange(this.state.usdteAddress);
      } else if (this.props.networkId === 1) {
        this.handleSubscriptionTokenChange(this.state.usdtAddress);
      }
    }
  }

  componentDidMount() {
    if (this.props.isPremium === false) {
      window.location.href = "https://app.dypius.com/plans";
    }
    // window._refreshBalIntervalDyp = setInterval(this.getDypBalance, 2000);
    this.getAllBalance();
    this.fetchUserPools();
    this.props.onSubscribe()
    this.fetchAvatar();
    this.fetchUsername();
    this.fetchUserPools();
    this.fetchAvaxFarming();
    this.fetchAvaxStaking();
    this.fetchBnbStaking();
    this.fetchBscFarming();
    this.fetchEthFarming();
    this.fetchEthStaking();
    this.setState({ coinbase: this.props.coinbase });

    this.myNft().then();
    this.myStakes().then();
    this.myLandNft().then();
    this.myLandStakes().then();
    // this.handleCheckIfAlreadyApproved();
    window.scrollTo(0, 0);
    // this.checkConnection();
  }
  componentWillUnmount() {
    if (this.props.networkId === 1) {
      clearInterval(window._refreshBalInterval);
      clearInterval(window._refreshBalInterval2);
    }
    // clearInterval(window._refreshBalIntervalDyp);

    window.removeOneTimeWalletConnectionListener(this.onComponentMount);
  }

  handleSubscriptionTokenChange = async (tokenAddress) => {
    const token =
      this.props.networkId === 1
        ? this.state.usdtAddress
        : this.state.usdteAddress;
    let tokenDecimals =
      this.props.networkId === 1
        ? window.config.subscriptioneth_tokens[token]?.decimals
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

  // myNft = async () => {
  //   if (this.props.coinbase !== null && this.props.coinbase !== undefined) {
  //     let myNft = await window.myNftListContract(this.props.coinbase);

  //     let nfts = myNft.map((nft) => window.getNft(nft));

  //     nfts = await Promise.all(nfts);

  //     nfts.reverse();
  //     this.setState({ myNFTs: nfts });
  //   }
  // };
  // myLandNft = async () => {
  //   if (this.props.coinbase !== null && this.props.coinbase !== undefined) {
  //     let myNft = await window.myNftLandListContract(this.props.coinbase);

  //     let nfts = myNft.map((nft) => window.getLandNft(nft));

  //     nfts = await Promise.all(nfts);
  //     nfts.reverse();
  //     this.setState({ myLandNFTs: nfts });
  //   }
  // };

  myNft = async () => {
    if (this.props.coinbase !== null && this.props.coinbase !== undefined) {
      const infura_web3 = window.infuraWeb3;
      let nfts_contract = new infura_web3.eth.Contract(
        window.NFT_ABI,
        window.config.nft_address
      );

      let getBalanceOf = await nfts_contract.methods
        .balanceOf(this.props.coinbase)
        .call();

      let nftList = [];

      for (let i = 0; i < getBalanceOf; i++)
        nftList.push(
          await nfts_contract.methods
            .tokenOfOwnerByIndex(this.props.coinbase, i)
            .call()
        );

      let nfts = nftList.map((nft) => window.getNft(nft));

      nfts = await Promise.all(nfts);
      nfts.reverse();
      this.setState({ myNFTs: nfts });
    }
  };
  myLandNft = async () => {
    if (this.props.coinbase !== null && this.props.coinbase !== undefined) {
      const infura_web3 = window.infuraWeb3;
      let nfts_contract = new infura_web3.eth.Contract(
        window.LANDMINTING_ABI,
        window.config.landnft_address
      );

      let getBalanceOf = await nfts_contract.methods
        .balanceOf(this.props.coinbase)
        .call();

      let nftList = [];

      for (let i = 0; i < getBalanceOf; i++)
        nftList.push(
          await nfts_contract.methods
            .tokenOfOwnerByIndex(this.props.coinbase, i)
            .call()
        );

      let nfts = nftList.map((nft) => window.getLandNft(nft));

      nfts = await Promise.all(nfts);
      nfts.reverse();
      this.setState({ myLandNFTs: nfts });
    }
  };

  // getStakesIds = async () => {
  //   const address = this.props.coinbase;
  //   if (address !== null && address !== undefined) {
  //     let staking_contract = await window.getContractNFT("NFTSTAKING");
  //     let stakenft = [];
  //     let myStakes = await staking_contract.methods
  //       .depositsOf(address)
  //       .call()
  //       .then((result) => {
  //         for (let i = 0; i < result.length; i++)
  //           stakenft.push(parseInt(result[i]));
  //         return stakenft;
  //       });

  //     return myStakes;
  //   }
  // };
  // getLandStakesIds = async () => {
  //   const address = this.props.coinbase;
  //   if (address !== null && this.props.coinbase !== undefined) {
  //     let staking_contract = await window.getContractLandNFT("LANDNFTSTAKING");
  //     let stakenft = [];
  //     let myStakes = await staking_contract.methods
  //       .depositsOf(address)
  //       .call()
  //       .then((result) => {
  //         for (let i = 0; i < result.length; i++)
  //           stakenft.push(parseInt(result[i]));
  //         return stakenft;
  //       });

  //     return myStakes;
  //   }
  // };
  getStakesIds = async () => {
    const address = this.props.coinbase;
    if (address !== null && address !== undefined) {
      const infura_web3 = window.infuraWeb3;
      let staking_contract = new infura_web3.eth.Contract(
        window.NFTSTAKING_ABI,
        window.config.nftstaking_address
      );
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
  getLandStakesIds = async () => {
    const address = this.props.coinbase;
    if (address !== null && this.props.coinbase !== undefined) {
      const infura_web3 = window.infuraWeb3;
      let staking_contract = new infura_web3.eth.Contract(
        window.LANDSTAKING_ABI,
        window.config.landnftstake_address
      );
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
    if(myStakes && myStakes.length > 0)
   { let stakes = myStakes.map((stake) => window.getNft(stake));
    stakes = await Promise.all(stakes);
    stakes.reverse();
    this.setState({ myStakess: stakes });}
  };
  myLandStakes = async () => {
    let myStakes = await this.getLandStakesIds();
    if(myStakes && myStakes.length > 0)
   { let stakes = myStakes.map((stake) => window.getLandNft(stake));
    stakes = await Promise.all(stakes);
    stakes.reverse();
    this.setState({ landStakes: stakes });}
  };

  handleApprove = async (e) => {
    e.preventDefault();

    let tokenContract = await window.getContract({
      address: this.state.selectedSubscriptionToken,
      ABI: window.ERC20_ABI,
    });

    this.setState({ loadspinner: true });

    await tokenContract.methods
      .approve(
        this.props.networkId === 1
          ? window.config.subscriptioneth_address
          : window.config.subscriptioneth_address,
        this.state.price
      )
      .send()
      .then(() => {
        this.setState({ lockActive: true });
        this.setState({ loadspinner: false });
        this.setState({ isApproved: true });

        // this.handleSubscribe();
      })
      .catch((e) => {
        this.setState({ status: "An error occurred. Please try again" });
        this.setState({ loadspinner: false });
      });
  };

  handleCheckIfAlreadyApproved = async () => {
    const web3eth = new Web3(
      "https://mainnet.infura.io/v3/94608dc6ddba490697ec4f9b723b586e"
    );

    const ethsubscribeAddress = window.config.subscriptioneth_address;
    const avaxsubscribeAddress = window.config.subscription_address;
    const subscribeToken = this.state.selectedSubscriptionToken;
    const subscribeTokencontract = new web3eth.eth.Contract(
      window.ERC20_ABI,
      subscribeToken
    );

    if (this.props.coinbase) {
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
      } else {
        const result = await subscribeTokencontract.methods
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
    e.preventDefault();
    
    let subscriptionContract = await window.getContract({
      key: this.props.networkId === 1 ? "SUBSCRIPTIONETH" : "SUBSCRIPTION",
    });

    this.setState({ loadspinnerSub: true });

    await subscriptionContract.methods
      .subscribe(this.state.selectedSubscriptionToken, this.state.price)
      .send({ from: await window.getCoinbase() })
      .then(() => {
        this.setState({ loadspinnerSub: false });
      })
      .catch((e) => {
        this.setState({ status: "An error occurred. Please try again" });
        this.setState({ loadspinnerSub: false });
      });
  };

  handleUnsubscribe = async (e) => {
    e.preventDefault();
    let subscriptionContract = await window.getContract({
      key: this.props.networkId === 1 ? "SUBSCRIPTIONETH" : "SUBSCRIPTION",
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
    let coinbase = this.props.coinbase;
    this.setState({ loadspinnerSave: true });
    if (!coinbase) {
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
        : window.config.subscription_tokens[
            this.state.selectedSubscriptionToken
          ]?.decimals;
    // this.handleCheckIfAlreadyApproved()
    let mycaws = [...this.state.myNFTs, ...this.state.myStakess];
    let lands = [...this.state.myLandNFTs, ...this.state.landStakes];

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

    const handleTooltipClose = () => {
      this.setState({ openTooltip: false });
    };

    const handleTooltipOpen = () => {
      this.setState({ openTooltip: true });
    };

    


    return this.props.isPremium ? (
      <div>
        <div className="d-flex align-items-start align-items-lg-0 justify-content-between flex-column flex-lg-row gap-4 gap-lg-0">
          <div
            className={`d-flex flex-column ${
              this.state.showInput ? "gap-5 gap-lg-2" : "gap-2"
            }`}
          >
            <div
              className={`d-flex align-items-center w-100 justify-content-between justify-content-lg-start gap-3`}
              // style={{ height: 38 }}
            >
              <div className="position-relative">
                <div className="avatar-border"></div>
                <img
                  src={require("./assets/changeImage.svg").default}
                  alt=""
                  className="add-image"
                />
                <img
                  src={this.state.image}
                  alt="your image"
                  className="avatarimg"
                />
                <input
                  type="file"
                  id="group_image"
                  onChange={this.onImageChange}
                />
                {/* {this.state.showSavebtn === true ? (
                <div
                  className="savebtn"
                  type=""
                  onClick={this.handleSubmission}
                >
                  {this.state.loadspinnerSave === true ? (
                    <div
                      className="spinner-border "
                      role="status"
                      style={{ height: "1.5rem", width: "1.5rem" }}
                    ></div>
                  ) : (
                    "Save"
                  )}
                </div>
              ) : (
                <></>
              )}
              {this.state.showRemovebtn === true ||
              this.state.image !== Placeholder ? (
                <div className="removebtn" type="" onClick={this.deleteAvatar}>
                  {this.state.loadspinnerRemove === true ? (
                    <div
                      className="spinner-border "
                      role="status"
                      style={{ height: "1.5rem", width: "1.5rem" }}
                    ></div>
                  ) : (
                    "Remove"
                  )}
                </div>
              ) : (
                <></>
              )} */}
              </div>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3">
                  <h6 className="account-username">
                    {this.state.username ? this.state.username : "Dypian"}
                  </h6>
                  {this.state.showInput ? (
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="input-container px-0"
                        style={{ width: "190px" }}
                      >
                        <input
                          type="text"
                          min={1}
                          max={365}
                          id="username"
                          name="username"
                          placeholder=" "
                          className="text-input"
                          style={{ width: "100%" }}
                          value={this.state.userNameInput}
                          onChange={(e) =>
                            this.setState({ userNameInput: e.target.value })
                          }
                        />
                        <label
                          htmlFor="username"
                          className="label"
                          onClick={() => focusInput("username")}
                        >
                          Enter a new name
                        </label>
                        <img
                          src={require(`./assets/clearFieldIcon.svg`).default}
                          className="clear-icon cursor-pointer"
                          alt="clear field"
                          onClick={() => this.setState({ showInput: false })}
                        />
                      </div>
                      <button
                        className="btn outline-btn py-2"
                        onClick={() =>
                          this.postUsername(this.state.userNameInput)
                        }
                      >
                        Submit
                      </button>
                    </div>
                  ) : (
                    <img
                      src={openNameChange}
                      className="cursor-pointer"
                      alt=""
                      onClick={() => this.setState({ showInput: true })}
                      style={{ zIndex: 2 }}
                    />
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="account-wallet-address">
                    {shortAddress(this.props.coinbase)}
                  </span>
                  <ClickAwayListener onClickAway={handleTooltipClose}>
                    <Tooltip
                      PopperProps={{
                        disablePortal: true,
                      }}
                      onClose={handleTooltipClose}
                      open={this.state.openTooltip}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      placement="top"
                      title={
                        <div className="tooltip-text">
                          {"Wallet address copied!"}
                        </div>
                      }
                    >
                      <img
                        src={require("./assets/clipboardIcon.svg").default}
                        className="cursor-pointer"
                        alt="clipboard"
                        onClick={() => {
                          navigator.clipboard.writeText(this.props.coinbase);
                          handleTooltipOpen();
                        }}
                      />
                    </Tooltip>
                  </ClickAwayListener>
                </div>
              </div>
            </div>
          </div>
          <div
            className={
              this.props.coinbase
                ? "mb-3 d-flex justify-content-between justify-content-lg-end"
                : "d-none"
            }
          >
            <div className="d-flex flex-column align-items-start align-items-lg-start w-100 justify-content-between justify-content-lg-end gap-1">
              {/* <span className=" my-plan-tag">My plan</span> */}
              <div className="plan-tag py-2 px-4 d-flex align-items-center gap-2">
                <img
                  src={require("./assets/premiumDypIcon.svg").default}
                  alt=""
                  style={{ width: 28, height: 28 }}
                />
                <span className="plan-tag-title">
                  {this.props.isPremium ? "Premium" : "Free"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-4 gap-3 gap-lg-0">
          <div className="col-12 col-lg-6">
            <div className="dyp-balances-wrapper d-flex flex-column gap-4 p-3">
              <h6 className="balances-title">Multichain DYP Balance</h6>
              <div className="d-flex flex-column flex-lg-row gap-3 align-items-center justify-content-between">
                <div className="dyp-balance-wrapper d-flex align-items-center justify-content-between justify-content-lg-center p-2 gap-3 gap-xxl-3 gap-lg-1">
                  <img
                    src={require(`./assets/wethIcon.svg`).default}
                    width={20}
                    height={20}
                    alt=""
                  />
                  <div className="d-flex align-items-center gap-1">
                    <span className="balance-amount mb-0">
                      {getFormattedNumber(this.state.ethBalance)} DYP
                    </span>
                    <img
                      src={require(`./assets/dypIcon.svg`).default}
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </div>
                <div className="dyp-balance-wrapper d-flex align-items-center justify-content-between justify-content-lg-center p-2  gap-3 gap-xxl-3 gap-lg-1">
                  <img
                    src={require(`./assets/wbnbIcon.svg`).default}
                    width={20}
                    height={20}
                    alt=""
                  />
                  <div className="d-flex align-items-center gap-1">
                    <span className="balance-amount mb-0">
                      {getFormattedNumber(this.state.bnbBalance)} DYP
                    </span>
                    <img
                      src={require(`./assets/dypIcon.svg`).default}
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </div>
                <div className="dyp-balance-wrapper d-flex align-items-center justify-content-between justify-content-lg-center p-2 gap-3 gap-xxl-3 gap-lg-1">
                  <img src={require(`./assets/wavaxIcon.svg`).default} alt="" />
                  <div className="d-flex align-items-center gap-1">
                    <span className="balance-amount mb-0">
                      {getFormattedNumber(this.state.avaxBalance)} DYP
                    </span>
                    <img
                      src={require(`./assets/dypIcon.svg`).default}
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <a
              href="https://www.worldofdypians.com/"
              target={"_blank"}
              className="wod-wrapper d-flex flex-column align-items-end gap-3 p-3"
            >
              <h6 className="wod-title">Experience unique gameplay</h6>
              <div className="d-flex align-items-center gap-1">
                <span className="explore-wod">Explore more</span>
                <img src={gotoWod} alt="" />
              </div>
            </a>
          </div>
        </div>
        {/* <div className="row mt-5 gap-4 gap-lg-0">
          <div className="col-12 col-lg-6 position-relative d-flex justify-content-center">
            <div
              className="purplediv"
              style={{
                top: "15px",
                zIndex: 1,
                left: "12px",
                background: "#8E97CD",
              }}
            ></div>
            <div className="row free-plan-container p-3 position-relative w-100">
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
              <div className="col-12">
                <hr className="form-divider my-4" style={{ height: "2px" }} />
                <div className="d-flex flex-column">
                  <span className="inactive-plan">Active</span>
                  <span className="inactive-plan">Free plan bundle</span>
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
                background: "#8E97CD",
              }}
            ></div>
            <div className="row free-plan-container p-3 position-relative w-100">
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
                {!this.props.appState.isPremium ? (
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
                            <img
                              src="/assets/img/usdt.svg"
                              width={28}
                              height={28}
                              alt=""
                            ></img>
                            <h3 className="subscr-price">75 USDT</h3>
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
                        Subscribe <br></br> to the Premium plan
                      </div>
                      <div
                        className="btn filledbtn px-3 px-lg-5"
                        style={{ whiteSpace: "pre" }}
                        type=""
                        onClick={() => {
                          this.setState({
                            subscribe_now: !this.state.subscribe_now,
                          });
                          this.handleSubscriptionTokenChange(
                            this.state.usdtAddress
                          );
                          this.handleCheckIfAlreadyApproved();
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
                          <p className="subscr-subtitle">
                            *When you unsubscribe the DYP will be unlocked and
                            sent to your wallet
                          </p>
                          <p className="subscr-note">
                        *When you unsubscribe the DYP will be unlocked and sent to
                        your wallet
                      </p>
                        </div>
                        <div>
                      <div className="d-flex gap-2">
                        <img src="/assets/img/usdt.svg"></img>
                        <h3 className="subscr-price">75 USDT</h3>
                      </div>
                      <p className="subscr-note">*Exclusive offer</p>
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
                        Active <br></br> Premium plan
                      </div>
                      <div
                        className="btn outline-btn px-5"
                        type=""
                        onClick={this.handleUnsubscribe}
                      >
                        Unsubscribe
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div> 
        {this.state.subscribe_now === true ? (
          <div className="row mt-4 justify-content-end">
            <div className="col-12 col-lg-6">
              <div className="subscribe-container p-3 position-relative">
                <div
                  className="purplediv"
                  style={{ background: "#8E97CD" }}
                ></div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <img src={coinStackIcon} alt="coin stack" />
                    <h6 className="free-plan-title">
                      DYP Tools Premium Subscription
                    </h6>
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
                      Token Amount
                    </span>
                    <div
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
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end justify-content-lg-end">
                    <span className="token-balance-placeholder">
                      USDT Balance
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
                <hr className="form-divider my-4" />
                <div className="d-flex justify-content-between align-items-center">
                  <div
                    className="subscription-token-wrapper  p-2 d-flex align-items-center justify-content-between "
                    style={{ width: "40%" }}
                  >
                    <span className="token-amount-placeholder">
                      Subscription token:
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src="/assets/img/usdt.svg"
                        height={24}
                        width={24}
                        alt="usdt"
                      />
                      <span className="usdt-text">USDT</span>
                    </div>
                  </div>
                  <button
                    className="btn success-button px-4"
                    onClick={(e) =>
                      this.state.isApproved === false
                        ? this.handleApprove(e)
                        : this.handleSubscribe()
                    }
                  >
                    {this.state.isApproved === true &&
                    this.state.loadspinner === false ? (
                      "Subscribe"
                    ) : this.state.isApproved === false &&
                      this.state.loadspinner === false ? (
                      "Approve"
                    ) : (
                      <div
                        className="spinner-border "
                        role="status"
                        style={{ height: "1.5rem", width: "1.5rem" }}
                      ></div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )} */}
        {/* <form onSubmit={this.handleSubscribe}>     
          <div>
            {!this.props.appState.isPremium ? (
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
          {!this.props.appState.isPremium ? (   
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

        {this.state.userPools && this.state.userPools.length > 0 && (
          <>
            <h4 className="d-block mb-5 mt-5" id="my-fav">
              My Earnings
            </h4>
            <div
              style={{
                gap: "50px 0px",
                display: "grid",
                gridTemplateColumns: "repeat(1, 1fr)",
              }}
            >
              <div
                className="row p-0 m-0 poolrows"
                style={{
                  gap: "50px 0px",
                }}
              >
                {this.state.ethStake &&
                  this.state.ethStake
                    .slice(0, this.state.ethStake.length)
                    .map((pool, index) => (
                      <NavLink
                        to="/earn"
                        style={{
                          display:
                            this.state.userPools.length > 0
                              ? this.state.userPools.find(
                                  (obj) => obj.contract_address == pool.id
                                )
                                ? "block"
                                : "none"
                              : "none",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            display:
                              this.state.userPools.length > 0
                                ? this.state.userPools.find(
                                    (obj) => obj.contract_address == pool.id
                                  )
                                  ? "block"
                                  : "none"
                                : "none",
                            position: "relative",
                          }}
                        >
                          <div
                            className="d-flex justify-content-center align-items-center"
                            style={{
                              position: "absolute",
                              top: "-23px",
                              left: "33%",
                              width: "106px",
                              height: "34px",
                              transform: "translateX(-50%)",
                              borderRadius: "50px",
                              background:
                                "linear-gradient(93.99deg, #4ED5CD 0%, #524FD8 100%)",
                              gap: "5px",
                              zIndex: 1,
                            }}
                          >
                            <img src="/assets/img/ethereum.svg"></img>
                            <div style={{ color: "#F7F7FC" }}>Ethereum</div>
                          </div>
                          <TopPoolsCard
                            key={index}
                            chain={this.props.networkId}
                            top_pick={pool.top_pick}
                            tokenName={pool.pair_name}
                            apr={pool.apy_percent + "%"}
                            tvl={"$" + getFormattedNumber(pool.tvl_usd)}
                            lockTime={
                              pool.lock_time ? pool.lock_time : "No Lock"
                            }
                            tokenLogo={
                              pool.icon
                                ? pool.icon
                                : pool.pair_name === "DYP"
                                ? "dyplogo.svg"
                                : "idypius.svg"
                            }
                            onShowDetailsClick={() => {}}
                            onHideDetailsClick={() => {}}
                            cardType={"table"}
                            details={false}
                            isNewPool={pool.new_pool === "Yes" ? true : false}
                            isStaked={
                              this.state.userPools.length > 0
                                ? this.state.userPools.find(
                                    (obj) => obj.contract_address == pool.id
                                  )
                                  ? true
                                  : false
                                : false
                            }
                            isAccount={true}
                            expired={pool.expired === "Yes" ? true : false}
                          />
                        </div>
                      </NavLink>
                    ))}
                    {this.state.bnbStake &&
                  this.state.bnbStake
                    .slice(0, this.state.bnbStake.length)
                    .map((pool, index) => (
                      <NavLink
                        to="/earn"
                        style={{
                          display:
                            this.state.userPools.length > 0
                              ? this.state.userPools.find(
                                  (obj) => obj.contract_address == pool.id
                                )
                                ? "block"
                                : "none"
                              : "none",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            display:
                              this.state.userPools.length > 0
                                ? this.state.userPools.find(
                                    (obj) => obj.contract_address == pool.id
                                  )
                                  ? "block"
                                  : "none"
                                : "none",
                            position: "relative",
                          }}
                        >
                          <div
                            className="d-flex justify-content-center align-items-center"
                            style={{
                              position: "absolute",
                              top: "-23px",
                              left: "33%",
                              width: "115px",
                              height: "34px",
                              transform: "translateX(-50%)",
                              borderRadius: "50px",
                              background:
                                "linear-gradient(93.99deg, #DAAA0A 0%, #EDB90B 100%)",
                              gap: "5px",
                              zIndex: 1,
                            }}
                          >
                            <img
                              src={require("../../assets/bnblogo.svg").default}
                              alt=""
                              style={{ height: 20, width: 20 }}
                            ></img>
                            <div style={{ color: "#F7F7FC" }}>BNB Chain</div>
                          </div>

                          <TopPoolsCard
                            key={index}
                            chain={this.props.networkId}
                            top_pick={pool.top_pick}
                            tokenName={pool.pair_name}
                            apr={pool.apy_percent + "%"}
                            tvl={"$" + getFormattedNumber(pool.tvl_usd)}
                            lockTime={
                              pool.lock_time ? pool.lock_time : "No Lock"
                            }
                            tokenLogo={
                              pool.icon
                                ? pool.icon
                                : pool.pair_name === "DYP"
                                ? "dyplogo.svg"
                                : "idypius.svg"
                            }
                            onShowDetailsClick={() => {}}
                            onHideDetailsClick={() => {}}
                            cardType={"table"}
                            details={false}
                            isNewPool={pool.new_pool === "Yes" ? true : false}
                            isStaked={
                              this.state.userPools.length > 0
                                ? this.state.userPools.find(
                                    (obj) => obj.contract_address == pool.id
                                  )
                                  ? true
                                  : false
                                : false
                            }
                            isAccount={true}
                            expired={pool.expired === "Yes" ? true : false}
                          />
                        </div>
                      </NavLink>
                    ))}
                    {this.state.avaxStake &&
                  this.state.avaxStake
                    .slice(0, this.state.avaxStake.length)
                    .map((pool, index) => (
                      <NavLink
                        to="/earn"
                        style={{
                          display:
                            this.state.userPools.length > 0
                              ? this.state.userPools.find(
                                  (obj) => obj.contract_address == pool.id
                                )
                                ? "block"
                                : "none"
                              : "none",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            display:
                              this.state.userPools.length > 0
                                ? this.state.userPools.find(
                                    (obj) => obj.contract_address == pool.id
                                  )
                                  ? "block"
                                  : "none"
                                : "none",
                            position: "relative",
                          }}
                        >
                          <div
                            className="d-flex justify-content-center align-items-center"
                            style={{
                              position: "absolute",
                              top: "-23px",
                              left: "33%",
                              width: "115px",
                              height: "34px",
                              transform: "translateX(-50%)",
                              borderRadius: "50px",
                              background:
                                "linear-gradient(93.99deg, #DF2C2D 0%, #F86465 100%)",
                              gap: "5px",
                              zIndex: 1,
                            }}
                          >
                            <img
                              src={require("../../assets/wavax.svg").default}
                              alt=""
                              style={{ height: 20, width: 20 }}
                            ></img>
                            <div style={{ color: "#F7F7FC" }}>Avalanche</div>
                          </div>

                          <TopPoolsCard
                            key={index}
                            chain={this.props.networkId}
                            top_pick={pool.top_pick}
                            tokenName={pool.pair_name}
                            apr={pool.apy_percent + "%"}
                            tvl={"$" + getFormattedNumber(pool.tvl_usd)}
                            lockTime={
                              pool.lock_time ? pool.lock_time : "No Lock"
                            }
                            tokenLogo={
                              pool.icon
                                ? pool.icon
                                : pool.pair_name === "DYP"
                                ? "dyplogo.svg"
                                : "idypius.svg"
                            }
                            onShowDetailsClick={() => {}}
                            onHideDetailsClick={() => {}}
                            cardType={"table"}
                            details={false}
                            isNewPool={pool.new_pool === "Yes" ? true : false}
                            isStaked={
                              this.state.userPools.length > 0
                                ? this.state.userPools.find(
                                    (obj) => obj.contract_address == pool.id
                                  )
                                  ? true
                                  : false
                                : false
                            }
                            isAccount={true}
                            expired={pool.expired === "Yes" ? true : false}
                          />
                        </div>
                      </NavLink>
                    ))}
              </div>
            
            </div>
          </>
        )}
        <div
          className="row"
          // style={{ marginTop: mycaws.length === 0 || lands.length === 0 ? "6rem" : "" }}
        >
          <div className="col-12 col-lg-6">
            <div className="mycawsCollection position-relative mb-5">
              <div className="nft-ethereum-tag p-2 d-flex align-items-center gap-2">
                <img src={require("./assets/wethIcon.svg").default} alt="" />
                <span className="nft-ethereum-span">Ethereum</span>
              </div>
              <div className="d-flex flex-column gap-2 justify-content-between align-items-start">
                <div className="col-xxl-2 col-lg-2 col-12 col-md-2">
                  <h6 className="mycawscollection-title">CAWS NFTs</h6>
                </div>
                <div
                  className={
                    this.state.viewall === false
                      ? "cawscontaier"
                      : "cawscontaier-open"
                  }
                >
                  {mycaws.length > 0 &&
                    this.props.coinbase !== null &&
                    mycaws
                      .slice(
                        0,
                        this.state.viewall === false && window.innerWidth > 756
                          ? 2
                          : this.state.viewall === false &&
                            window.innerWidth <= 756 &&
                            window.innerWidth > 500
                          ? 1
                          : this.state.viewall === false &&
                            window.innerWidth <= 500
                          ? 1
                          : mycaws.length
                      )
                      .map((item, id) => {
                        return (
                          <NftCawCard
                            key={id}
                            nft={item}
                            action={() => {
                              window.location.assign("/earn");
                            }}
                            modalId="#newNftStake"
                            coinbase={this.props.coinbase}
                          />
                        );
                      })}
                </div>
                <button
                  className="outline-btn"
                  style={{
                    height: "fit-content",
                    display: mycaws.length > 4 ? "block" : "none",
                  }}
                  onClick={() => {
                    this.setState({ viewall: !this.state.viewall });
                  }}
                >
                  {this.state.viewall === false ? " View all" : "View less"}
                </button>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="mycawsCollection position-relative mb-5">
              <div className="nft-ethereum-tag p-2 d-flex align-items-center gap-2">
                <img src={require("./assets/wethIcon.svg").default} alt="" />
                <span className="nft-ethereum-span">Ethereum</span>
              </div>
              <div className="d-flex flex-column gap-2 justify-content-between align-items-start">
                <div className="col-xxl-2 col-lg-2 col-12 col-md-2">
                  <h6 className="mycawscollection-title">WoD NFTs</h6>
                </div>
                <div
                  className={
                    this.state.viewall === false
                      ? "cawscontaier"
                      : "cawscontaier-open"
                  }
                >
                  {lands.length > 0 &&
                    this.props.coinbase !== null &&
                    lands
                      .slice(
                        0,
                        this.state.viewall === false && window.innerWidth > 756
                          ? 2
                          : this.state.viewall === false &&
                            window.innerWidth <= 756 &&
                            window.innerWidth > 500
                          ? 1
                          : this.state.viewall === false &&
                            window.innerWidth <= 500
                          ? 1
                          : lands.length
                      )
                      .map((item, id) => {
                        return (
                          <NftCawCard
                            key={id}
                            nft={item}
                            action={() => {
                              window.location.assign("/earn");
                            }}
                            modalId="#newNftStake"
                            coinbase={this.props.coinbase}
                          />
                        );
                      })}
                </div>
                <button
                  className="outline-btn"
                  style={{
                    height: "fit-content",
                    display: lands.length > 2 ? "block" : "none",
                  }}
                  onClick={() => {
                    this.setState({ viewall: !this.state.viewall });
                  }}
                >
                  {this.state.viewall === false ? " View all" : "View less"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <TierLevels display={"none"} infoDisplay={"flex"} />
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
    ) : (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "65vh" }}
      >
        <div class="spinner-border text-info" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
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
