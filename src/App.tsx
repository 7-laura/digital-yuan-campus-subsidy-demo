import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import PaymentSimulatorPage from "./pages/PaymentSimulatorPage";
import StudentWalletPage from "./pages/StudentWalletPage";
import { SubsidyProvider } from "./services/SubsidyContext";

const getCurrentHash = () => (typeof window === "undefined" ? "" : window.location.hash);

function App() {
  const [currentHash, setCurrentHash] = useState(getCurrentHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(getCurrentHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  let page = <HomePage />;

  if (currentHash === "#student-wallet") {
    page = <StudentWalletPage />;
  }

  if (currentHash === "#payment-simulator") {
    page = <PaymentSimulatorPage />;
  }

  return <SubsidyProvider>{page}</SubsidyProvider>;
}

export default App;
