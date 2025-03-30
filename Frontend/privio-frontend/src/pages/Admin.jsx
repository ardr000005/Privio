import React, { useState, useEffect } from "react";
import { LogOut, Search, AlertTriangle } from "lucide-react";
import ViolationViewer from "./violation";
import getContract from "../utils/contract";
import { useNavigate } from "react-router-dom";
import "../index.css"; // Ensure this file contains your CSS styles

const Dashboard = ({ user, onLogout }) => {
  const [violationId, setViolationId] = useState("");
  const [violationData, setViolationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();

  const ADMIN_ADDRESS = "<admin metamask address>".toLowerCase(); // Replace with actual admin address

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const contract = await getContract();
        const signer = await contract.signer.getAddress();
        console.log("Signer Address:", signer); // Debug log

        if (signer.toLowerCase() === ADMIN_ADDRESS) {
          setIsAdmin(true);
        } else {
          alert("Access Denied: You are not an admin.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error during admin login:", error);
        alert("Error connecting to MetaMask: " + error.message);
        navigate("/");
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchViolation = async () => {
    if (!violationId) {
      setError("Please enter a Violation ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3002/get-violation/${violationId}`);
      if (!response.ok) {
        throw new Error("Violation not found.");
      }
      const data = await response.json();
      console.log("Fetched Data:", data); // Debugging log
      setViolationData(data.data);  // Ensure you're accessing `data.data`
    } catch (err) {
      setViolationData(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
};


  if (isAdmin === null) {
    return <div className="loading-screen">Loading MetaMask connection...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <AlertTriangle className="nav-icon" />
            <span className="nav-title">Violation Admin</span>
          </div>
          <div className="nav-right">
            <span className="nav-welcome">Welcome, {user.username}</span>
            <button className="logout-button" onClick={onLogout}>
              <LogOut className="logout-icon" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="violation-lookup">
          <h2 className="section-title">Violation Lookup</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="lookup-form">
            <div className="input-group">
              <label htmlFor="violationId" className="input-label">Violation ID</label>
              <input
                type="text"
                id="violationId"
                className="input-field"
                placeholder="Enter violation ID"
                value={violationId}
                onChange={(e) => setViolationId(e.target.value)}
              />
            </div>
            <button className="fetch-button" onClick={fetchViolation} disabled={loading}>
              {loading ? "Loading..." : <><Search className="fetch-icon" /> Fetch</>}
            </button>
          </div>

          {violationData && <ViolationViewer violation={violationData} />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;