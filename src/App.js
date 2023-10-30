import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import toast from "react-hot-toast";
import { CONFIG } from "./config/config";
import MintCard from "./components/mintCard";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

function App() {
  const loadingToast = toast;

  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);

  const [claimingNft, setClaimingNft] = useState(false);
  const [packIDS, setPackIDS] = useState([]);

  const [whiteListTotal, setWhiteListTotal] = useState(0);
  const [whitelisted, setWhitelisted] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);

  const [mintLive, setMintLive] = useState(false);

  const commonPrice = 5000000000000000; //5000000000000000000;
  const [mintPrice, setMintPrice] = useState(0);

  //
  //
  //
  const getMintHeader = (price) => {
    return {
      gasLimit: String(CONFIG.GAS_LIMIT),
      maxPriorityFeePerGas: null,
      maxFeePerGas: null,
      to: CONFIG.CONTRACT,
      from: blockchain.account,
      value: String(price),
    };
  };

  // ******************************************************
  // Status
  // ******************************************************
  const getMintStatus = () => {
    blockchain.smartContract.methods
      .mintLive()
      .call()
      .then((receipt) => {
        console.log("🔥 Mint Status: ", receipt);
        setMintLive(receipt);
      });
  };

  // ******************************************************
  // Mint
  // ******************************************************
  const minting = (msg) => {
    setClaimingNft(true);
    loadingToast.loading(msg, { id: loadingToast });
  };
  const endMinting = (ids) => {
    // console.log(ids.events.TransferBatch.returnValues.ids);
    // setPackIDS(ids.events.TransferBatch.returnValues.ids);

    loadingToast.dismiss();
    toast.success("👻🏠 Boo Yeah!");

    setClaimingNft(false);

    getData();
  };
  const endMintWithError = (e) => {
    loadingToast.dismiss();
    toast.error(e.message);
    setClaimingNft(false);

    getData();
  };

  const mint = () => {
    minting("Minting your Boo Mansion");

    blockchain.smartContract.methods
      .mint()
      .send(getMintHeader(whitelisted > 0 ? 0 : commonPrice))
      .once("error", (err) => {
        console.log("Mint Over with error");
        setTimeout(() => {
          console.log("Delay Over with error");
          endMintWithError(err);
        }, 1000);
      })
      .then((receipt) => {
        console.log("Mint Over");
        setTimeout(() => {
          console.log("Delay Over");
          endMinting(receipt);
        }, 1000);
      });
  };
  // ******************************************************
  // Price
  // ******************************************************
  // const getMintPrice = () => {
  //   blockchain.smartContract.methods
  //     .getMintPrice(blockchain.account)
  //     .call()
  //     .then((receipt) => {
  //       setMintPrice(receipt[0]);
  //       console.log("🔥 Mint Price: " + receipt[0]);
  //     });
  // };

  // ******************************************************
  // Whitelist
  // ******************************************************
  const retriveWhitelistTotalCount = () => {
    blockchain.smartContract.methods
      .getWhiteCount(blockchain.account)
      .call()
      .then((receipt) => {
        setWhiteListTotal(parseInt(receipt[0]));
        console.log("🔥 Total Whitelist: " + receipt[0]);
      });
  };
  const retriveWhitelistCount = () => {
    blockchain.smartContract.methods
      .getAvailableWhiteSlots(blockchain.account)
      .call()
      .then((receipt) => {
        setWhitelisted(parseInt(receipt[0]));
        console.log("🔥 Available Whitelist: " + receipt[0]);
      });
  };
  const retriveBalance = () => {
    blockchain.smartContract.methods
      .balanceOf(blockchain.account)
      .call()
      .then((receipt) => {
        setTotalMinted(parseInt(receipt[0]));
        console.log("🔥 Total Minted: " + receipt[0]);
      });
  };

  // ******************************************************
  // DAPP
  // ******************************************************
  const getInitialData = () => {
    if (
      blockchain.account !== "" &&
      blockchain.account !== undefined &&
      blockchain.smartContract !== null
    ) {
      getMintStatus();
      retriveWhitelistTotalCount();
    }
  };

  const getData = () => {
    if (
      blockchain.account !== "" &&
      blockchain.account !== undefined &&
      blockchain.smartContract !== null
    ) {
      retriveWhitelistCount();
      retriveBalance();
    }
  };

  useEffect(() => {
    getInitialData();
    getData();
  }, [blockchain.account]);

  // ******************************************************
  // Connect Wallet
  // ******************************************************
  const connectWallet = () => {
    dispatch(connect());
    getData();
  };

  return (
    <div id="dapp">
      <div>
        <p>
          Toque no botão para a sua Mansão. <br /> (Tap the button to mint your
          Mansion)
        </p>

        <div className="card-packs">
          <MintCard
            type="common"
            label={whitelisted > 0 ? "Mint (Free)" : "Mint (5 MATIC)"}
            price="05 Matic"
            onClick={mint}
            account={blockchain.account}
            minting={claimingNft}
            onConnect={connectWallet}
            mintStatus={mintLive}
          />
        </div>
        <p>
          Whitelist Slots: {whiteListTotal}
          <br />
          Whitelist Available: {whitelisted}
          <br />
          Total Minted: {totalMinted}
        </p>
      </div>
    </div>
  );
}

export default App;
