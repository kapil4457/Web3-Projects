import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { io } from "socket.io-client";

// Components
import Navigation from "./components/Navigation";
import Servers from "./components/Servers";
import Channels from "./components/Channels";
import Messages from "./components/Messages";

// ABIs
import Dappcord from "./abis/Dappcord.json";

// Config
import config from "./config.json";

// Socket
const socket = io("ws://localhost:3030");

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [dappcord, setDappcord] = useState(null);
  const [channels, setChannels] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);

  const loadBlockchainData = async () => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    const chainId = network.chainId;

    const dappcord = new ethers.Contract(
      config[chainId].Dappcord.address,
      Dappcord,
      provider
    );
    setDappcord(dappcord);
    const totalChannels = await dappcord.totalChannels();
    const channels = [];
    for (var i = 1; i <= totalChannels; i++) {
      let channel = await dappcord.getChannel(i);
      channels.push(channel);
    }
    console.log(channels);
    setChannels(channels);
    window.ethereum.on("accountsChanged", async () => {
      window.location.reload();
    });
  };

  useEffect(() => {
    loadBlockchainData();
    socket.on("connect", () => {
      socket.emit("get messages");
    });

    socket.on("new message", (messages) => {
      setMessages(messages);
    });

    socket.on("get messages", (messages) => {
      setMessages(messages);
    });

    return () => {
      socket.off("connect");
      socket.off("new message");
      socket.off("get messages");
    };
  }, []);
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <main>
        <Servers />
        <Channels
          account={account}
          channels={channels}
          currentChannel={currentChannel}
          dappcord={dappcord}
          provider={provider}
          setCurrentChannel={setCurrentChannel}
        />
        <Messages
          messages={messages}
          account={account}
          currentChannel={currentChannel}
        />
      </main>
    </div>
  );
}

export default App;
