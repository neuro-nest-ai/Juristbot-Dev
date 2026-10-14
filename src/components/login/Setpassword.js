import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import passwordicon from "../Assets/icons/passwordicon.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faKey } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./setpassword.css";
import config from "../config/config";

function SetpasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "otp") setOtp(value);
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") {
      setConfirmPassword(value);
      setPasswordError(password !== value ? "Passwords do not match" : "");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    const uppercaseMatches = password.match(/[A-Z]/g);
    if (!uppercaseMatches || uppercaseMatches.length !== 1) {
      toast.error("Password must contain exactly one uppercase letter");
      return;
    }
  
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/auth/verifyotp&password`,
        {
          otp,
          password,
        }
      );
      console.log(response.data);
      toast.success("Password update successful");

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response ? error.response.data : error
      );
      toast.error("Enter correct otp! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid backimage4">
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-lg-4 col-md-7 col-10 col-12">
          <div className="setpasswords">
            <h4 className="setpasswordtxt">Create new password</h4>
            <form onSubmit={handleSubmit}>
              <div className="mt-4">
                <div className="input-container">
                  <FontAwesomeIcon icon={faKey} className="loginfaicons" />
                  <input
                    className="reg-form"
                    type="text"
                    name="otp"
                    placeholder="Enter otp"
                    value={otp}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="password-input-container">
                  <div className="input-container">
                    <img
                      src={passwordicon}
                      alt="location"
                      className="loginfaicons"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      className="reg-form"
                      placeholder="New Password"
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <span
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon
                      className="eyepassword"
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="password-input-container">
                  <div className="input-container">
                    <img
                      src={passwordicon}
                      alt="location"
                      className="loginfaicons"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      className="reg-form custom-inputs"
                      placeholder="Confirm New Password"
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <span
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon
                      className="eyepassword"
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </span>
                </div>
                {passwordError && (
                  <p className="text-danger">{passwordError}</p>
                )}
              </div>
              <button
                className="passwordsetbtn mt-4"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Set Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default SetpasswordForm;
