import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";
import axios from "axios";

function App() {
  const [account, setAccount] = useState(null);
  const [homes, setHomes] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [provider, setProvider] = useState(null);
  const [home, setHome] = useState({});
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    const contractAddresses = config[chainId];
    if (!contractAddresses) {
      throw new Error(`No contract addresses found for chainId ${chainId}`);
    }

    const realEstate = new ethers.Contract(
      contractAddresses.realEstate.address,
      RealEstate,
      provider
    );
    const totalSupply = await realEstate.totalSupply();
    const homes = [];

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await fetch(uri);
      const metadata = await response.json();
      homes.push(metadata);
    }

    setHomes(homes);

    const escrow = new ethers.Contract(
      contractAddresses.escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };
  const togglePop = (home) => {
    setHome(home);
    toggle ? setToggle(false) : setToggle(true);
  };
  useEffect(() => {
    loadBlockchainData();
  }, []);
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h3>Homes for you</h3>
        <hr />
        <div className="cards">
          {homes &&
            homes.map((item, key) => {
              return (
                <div className="card" key={key} onClick={() => togglePop(item)}>
                  <div className="card__image">
                    <img alt="Home" src={item.image} />
                  </div>
                  <div className="card__info">
                    <h4>{item.attributes[0].value} ETH</h4>
                    <p>
                      <strong>{item.attributes[2].value}</strong> bds |
                      <strong>{item.attributes[3].value}</strong> ba |
                      <strong>{item.attributes[4].value}</strong> sqft
                    </p>
                    <p>{item.address}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      {toggle && (
        <Home
          home={home}
          provider={provider}
          account={account}
          escrow={escrow}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;
