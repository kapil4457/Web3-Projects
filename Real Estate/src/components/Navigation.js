import logo from "../assets/logo.svg";

const Navigation = ({ account, setAccount }) => {
  const connectionHandler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };

  return (
    <nav>
      <ul className="nav__links">
        <li>
          <a href="#">Buy</a>
        </li>
        <li>
          <a href="#">Rent</a>
        </li>
        <li>
          <a href="#">Sell</a>
        </li>
      </ul>
      <div className="nav__brand">
        <img src={logo} alt="Logo" />
        <h1>Millow</h1>
      </div>

      {account ? (
        <button className="nav__connect" type="button">
          {account.toString()}
        </button>
      ) : (
        <button
          className="nav__connect"
          type="button"
          onClick={() => {
            if (!account) {
              connectionHandler();
            }
          }}
        >
          Connect
        </button>
      )}
    </nav>
  );
};

export default Navigation;
