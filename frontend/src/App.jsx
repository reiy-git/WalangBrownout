import LoginPage from "./LoginPage";

function App() {
  const handleLogin = ({ username, password }) => {
    console.log(username, password);
  };

  return <LoginPage onLogin={handleLogin} />;
}

export default App;