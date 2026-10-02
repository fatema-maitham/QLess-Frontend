import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/Landing/LandingPage";
import NotFound from "./components/NotFound/NotFound";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Add new pages here, for example:
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/business/register" element={<BusinessRegister />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/businesses/:id" element={<BusinessDetails />} />
        */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}