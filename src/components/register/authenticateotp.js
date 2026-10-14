import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./authotp.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import config from "../config/config";
import { useAuth } from "../AuthContext";

function Authenticateotp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const generateUUID = async () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleNewChatClick = async () => {
    const randomId = await generateUUID();
    localStorage.setItem("session_id", randomId);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${config.apiBaseUrl}/auth/verifyotp`, {
        otp,
      });

      const token = response.data.token;    

      localStorage.setItem('authToken', token);
      if (!token) {
        toast.error("No token received. Please try again.");
        return;
      }

      await login(token);                   
      await handleNewChatClick();
      
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-16858833972/Q8nWCN7s44QdELTI9eY-",
      });
    }

      toast.success("OTP verified successfully!");
      setTimeout(() => {
        navigate("/chat");
      }, 3000);
    } catch (error) {
      console.log("Failed to verify OTP. Please try again.", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid backimage5">
      <ToastContainer />
      <div className="otp-authicatediv">
        <form onSubmit={handleLogin}>
          <h4 className="authotitletxt">Enter the OTP</h4>
          <div className="mt-4">
            <div className="input-container">
              <FontAwesomeIcon icon={faKey} className="loginfaicons" />
              <input
                type="text"
                className="reg-form"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            className="autoticatebtn mt-3"
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
          {error && <p className="text-danger text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Authenticateotp;