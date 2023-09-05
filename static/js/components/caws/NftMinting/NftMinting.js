import React, { useState, useEffect } from "react";
import Web3 from "web3";
import MyNfts from "./components/NftMinting/MyNfts";
import NftCardModal from "./components/NftMinting/NftCardModal";
import NftLoadingModal from "./components/NftMinting/NftLoadingModal";
import WhitelistLoadingModal from "./components/NftMinting/WhitelistLoadingModal";
import MyStakes from "./components/NftMinting/MyStakes";
import NftStakeCheckListModal from "./components/NftMinting/NftStakeChecklistModal/NftStakeChecklistModal";
import NftUnstakeModal from "./components/NftMinting/NftUnstakeModal/NftUnstakeModal";
import NftStakeModal from "./components/NftMinting/NftStakeModal/NftStakeModal";
import NftConfirmUnstakeModal from "./components/NftMinting/NftConfirmUnstakeModal/NftConfirmUnstakeModal";
import NftConfirmClaimAllModal from "./components/NftMinting/NftConfirmClaimAllModal/NftConfirmClaimAllModal";
import "./_nftMinting.scss";

const NftMinting = ({ isConnected, coinbase, handleConnection }) => {
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showWhitelistLoadingModal, setShowWhitelistLoadingModal] =
    useState(false);
  const [showUnstakeModal, setShowUnstakeModal] = useState(false);
  const [showClaimAllModal, setShowClaimAllModal] = useState(false);

  //Load My Nfts
  const [myNFTs, setMyNFTs] = useState([]);
  //Show No. of Created Nfts

  const [openedNft, setOpenedNft] = useState(false);
  const [openStakeNft, setOpenStakeNft] = useState(false);
  const [openUnStakeNft, setOpenUnStakeNft] = useState(false);

  const [openStakeChecklist, setOpenStakeChecklist] = useState(false);
  const [showToStake, setshowToStake] = useState(false);
  const [showStaked, setshowStaked] = useState(true);

  const [mystakes, setMystakes] = useState([]);
  //Connect Wallet
  const [latestMintNft, setLatestMintNft] = useState([]);

  const [cawsMinted, setCawsMinted] = useState(0);
  const [EthRewards, setEthRewards] = useState(0);
  const [itemId, setItem] = useState();
  const [nftItemId, setNftItem] = useState();
  const [claimAllStatus, setclaimAllStatus] = useState(
    "Are you sure you want to Claim all your current selected NFT’s?"
  );
  const [unstakeAllStatus, setunstakeAllStatus] = useState(
    "Are you sure you want to Unstake all your current selected NFT’s?"
  );

  //Rarity & Score
  const [rarity, setRarity] = useState(false);
  const [score, setScore] = useState(false);
  const link = "https://dyp.finance/mint";

  //Countdown
  const [countDownLeft, setCountDownLeft] = useState(59000);

  const getTotalSupply = async () => {
    let totalSupply = await window.latestMint();
    totalSupply = parseInt(totalSupply) + 1;

    setCawsMinted(totalSupply);
  };

  async function getData(link) {
    try {
      let response = await fetch(link);
      let responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error(error);
    }
  }

  const onStakeNft = async (item) => {
    setOpenStakeNft(item);
    setOpenStakeNft(item);

    let nftId = item.name.replace(/\D/g, "");

    let response;

    setRarity(false);
    setScore(false);

    try {
      response = await getData(
        "https://mint.dyp.finance/api/v1/score/" + nftId
      );
    } catch (error) {
      console.error(error);
    }

    if (response) {
      setRarity(response.rank);
      setScore(response.rarity);
    }

    // setOpenedNft(nftId)
    setNftItem(nftId);
  };

  const onUnstakeNft = async (item) => {
    setOpenUnStakeNft(item);
    let nftId = item.name?.slice(6, item.name?.length);

    let response;

    setRarity(false);
    setScore(false);

    try {
      response = await getData(
        "https://mint.dyp.finance/api/v1/score/" + nftId
      );
    } catch (error) {
      console.error(error);
    }

    if (response) {
      setRarity(response.rank);
      setScore(response.rarity);
    }

    setItem(nftId);
  };

  const onStakCheckList = (item) => {
    setOpenStakeChecklist(item);
  };

  useEffect(() => {
    latestMint().then();
    getTotalSupply().then();

    if (isConnected) {
      myNft().then();
      // myStakes().then();
      handleClaimAll().then();
    }

    // const interval = setInterval(async () => {
    if (isConnected) {
      // await calculateCountdown().then();

      myNft().then();
      // myStakes().then();
      handleClaimAll().then();
    }
    latestMint().then();
    getTotalSupply().then();
    // }, 5000);

    // return () => clearInterval(interval);
  }, [isConnected, EthRewards]);

  useEffect(() => {
    if (isConnected) {
      myStakes().then();
    }
  }, [mystakes, isConnected]);

  useEffect(() => {
    // const interval = setInterval(async () => {
      if (isConnected) {
    calculateCountdown().then();
      }
    // }, 1000);
    // return () => clearInterval(interval);
  }, [isConnected]);

  const calculateCountdown = async () => {
    const address = coinbase;

    let staking_contract = await window.getContractNFT("NFTSTAKING");
    if (address !== null) {
      let finalDay = await staking_contract.methods
        .stakingTime(address)
        .call()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          // window.alertify.error(err?.message);
        });

      let lockup_time = await staking_contract.methods
        .LOCKUP_TIME()
        .call()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          // window.alertify.error(err?.message);
        });

      finalDay = parseInt(finalDay) + parseInt(lockup_time);

      setCountDownLeft(parseInt(finalDay * 1000) - Date.now());
    }
  };

  const descriptionTags = [
    // "Watch",
    // "Mustache",
    // "Glasses",
    // "Glasses",
    "Unrevealed",
  ];

  const handleLoadingSuccessClick = () => {
    // when user click ok button in loading modal
    setShowLoadingModal(false);
    setShowWhitelistLoadingModal(false);
    // showToast('Your NFT was created successfully!')
  };

  const handleLoadingCancelClick = () => {
    // when user click cancel button in loading modal
    setShowLoadingModal(false);
    setShowWhitelistLoadingModal(false);
  };

  const onShareClick = (item) => {
    // when user clicks share nft link
    // console.log("item clicked", item);
  };

  const latestMint = async () => {
    let end = await window.latestMint();

    let start = end - 7;

    let latest = window.range(start, end);

    let nfts = latest.map((nft) => window.getNft(nft));

    nfts = await Promise.all(nfts);

    nfts.reverse();

    setLatestMintNft(nfts);
  };

  const myNft = async () => {
    
    let myNft = await window.myNftListContract(coinbase);

    let nfts = myNft.map((nft) => window.getNft(nft));

    nfts = await Promise.all(nfts);

    nfts.reverse();

    setMyNFTs(nfts);
  };

  const getStakesIds = async () => {
    const address = coinbase;
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
  };

  const myStakes = async () => {
    let myStakes = await getStakesIds();

    let stakes = myStakes.map((stake) => window.getNft(stake));

    stakes = await Promise.all(stakes);
    stakes.reverse();
    setMystakes(stakes);
  };

  const handleClaimAll = async () => {
    const address = coinbase;
    let myStakes = await getStakesIds();
    let calculateRewards = [];
    let result = 0;
    let staking_contract = await window.getContractNFT("NFTSTAKING");
    if (address !== null) {
      if (myStakes.length > 0) {
        calculateRewards = await staking_contract.methods
          .calculateRewards(address, myStakes)
          .call()
          .then((data) => {
            return data;
          });
      }
    }
    let a = 0;
    const infuraWeb3 = new Web3(window.config.infura_endpoint);
    for (let i = 0; i < calculateRewards.length; i++) {
      a = infuraWeb3.utils.fromWei(calculateRewards[i], "ether");

      result = result + Number(a);
    }

    setEthRewards(result);
  };

  const claimRewards = async () => {
    let myStakes = await getStakesIds();
    let staking_contract = await window.getContractNFT("NFTSTAKING");

    setclaimAllStatus("Claiming all rewards, please wait...");
    await staking_contract.methods
      .claimRewards(myStakes)
      .send()
      .then(() => {
        setEthRewards(0);
        setclaimAllStatus("Claimed All Rewards!");
      })
      .catch((err) => {
        // window.alertify.error(err?.message);
        setclaimAllStatus("An error occurred, please try again");
      });
  };

  const handleUnstakeAll = async () => {
    let myStakes = await getStakesIds();
    let stake_contract = await window.getContractNFT("NFTSTAKING");
    setunstakeAllStatus("Unstaking all please wait...");

    await stake_contract.methods
      .emergencyWithdraw(myStakes)
      .send()
      .then(() => {
        setunstakeAllStatus("Successfully unstaked all!");
      })
      .catch((err) => {
        window.alertify.error(err?.message);
        setunstakeAllStatus("An error occurred, please try again");
        setShowUnstakeModal(false);
      });
  };

  const handleCancel = () => {
    setShowUnstakeModal(false);
  };
  const handleCancelClaim = () => {
    setShowClaimAllModal(false);
  };

  const handleShowUnstake = () => {
    setShowUnstakeModal(true);
    setOpenStakeChecklist(false);
  };

  const handleShowClaimAll = () => {
    setShowClaimAllModal(true);
    setOpenStakeChecklist(false);
  };

  return (
    <div className="nft-minting">
      <NftLoadingModal
        visible={showLoadingModal}
        onCancelClick={handleLoadingCancelClick}
        onSuccessClick={handleLoadingSuccessClick}
        setIsVisible={setShowLoadingModal}
        isConnected={isConnected}
        coinbase={coinbase}
      />
      <NftConfirmClaimAllModal
        visible={showClaimAllModal}
        onCancelClick={handleCancelClaim}
        onSuccessClick={claimRewards}
        setIsVisible={setShowClaimAllModal}
        title={claimAllStatus}
        isConnected={isConnected}
        coinbase={coinbase}
      />

      <NftConfirmUnstakeModal
        visible={showUnstakeModal}
        onCancelClick={handleCancel}
        onSuccessClick={handleUnstakeAll}
        setIsVisible={setShowUnstakeModal}
        title={unstakeAllStatus}
        isConnected={isConnected}
        coinbase={coinbase}
      />

      <WhitelistLoadingModal
        visible={showWhitelistLoadingModal ? true : false}
        onCancelClick={handleLoadingCancelClick}
        onSuccessClick={handleLoadingSuccessClick}
        setIsVisible={setShowWhitelistLoadingModal}
        isConnected={isConnected}
        coinbase={coinbase}
      />

      <NftCardModal
        modalId="newNft"
        nftItem={openedNft}
        visible={openedNft ? true : false}
        link={link}
        score={score}
        rarity={rarity}
        onShareClick={onShareClick}
        isConnected={isConnected}
        coinbase={coinbase}
      />

      <NftStakeModal
        modalId="newNftStake"
        nftItem={openStakeNft}
        visible={openStakeNft ? true : false}
        link={link}
        score={score}
        rarity={rarity}
        onShareClick={onShareClick}
        itemId={parseInt(nftItemId)}
        countDownLeft={countDownLeft}
        isConnected={isConnected}
        coinbase={coinbase}
      />

      <NftUnstakeModal
        modalId="NftUnstake"
        nftItem={openUnStakeNft}
        visible={openUnStakeNft ? true : false}
        link={link}
        score={score}
        rarity={rarity}
        onShareClick={onShareClick}
        itemId={parseInt(itemId)}
        countDownLeft={countDownLeft}
        isConnected={isConnected}
        coinbase={coinbase}
      />

      <NftStakeCheckListModal
        onClose={() => {
          setOpenStakeChecklist(false);
        }}
        nftItem={showStaked ? mystakes : showToStake ? myNFTs : showStaked}
        open={openStakeChecklist ? true : false}
        link={link}
        onShareClick={onShareClick}
        onshowStaked={() => {
          setshowStaked(true);
          setshowToStake(false);
        }}
        onshowToStake={() => {
          setshowStaked(false);
          setshowToStake(true);
        }}
        onClaimAll={() => {
          handleShowClaimAll();
        }}
        onUnstake={() => handleShowUnstake()}
        ETHrewards={EthRewards}
        countDownLeft={countDownLeft}
        isConnected={isConnected}
        coinbase={coinbase}
      />

      <MyNfts
        onItemClick={onStakeNft}
        items={myNFTs}
        numberOfNfts={myNFTs.length}
        label="Collection"
        smallTitle="MY"
        bigTitle="CAWS"
        isConnected={isConnected}
        coinbase={coinbase}
      />
      <MyStakes
        onItemClick={onUnstakeNft}
        items={mystakes}
        numberOfNfts={mystakes.length}
        label=""
        smallTitle="STAKE"
        bigTitle="CAWS"
        onStakeNFTClick={onStakCheckList}
        onClaimAllRewards={claimRewards}
        ETHrewards={EthRewards}
        isConnected={isConnected}
        coinbase={coinbase}
      />
    </div>
  );
};

export default NftMinting;
