import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/Landing/LandingPage";
import BrowsePage from "./components/Browse/BrowsePage";
import BusinessDetailsPage from "./components/BusinessDetails/BusinessDetailsPage";
import BranchDetailsPage from "./components/BranchDetails/BranchDetailsPage";
import NotFound from "./components/NotFound/NotFound";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/businesses" element={<BrowsePage />} />
        <Route path="/businesses/:businessId" element={<BusinessDetailsPage />} />
        <Route path="/branches/:branchId" element={<BranchDetailsPage />} />

        {/* Next steps:
        <Route path="/queues/:queueId" element={<JoinQueuePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}