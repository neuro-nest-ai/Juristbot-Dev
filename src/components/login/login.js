
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import emails from "../Assets/icons/email.svg";
import passwordicon from "../Assets/icons/passwordicon.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import config from "../config/config";
import "./login.css";
import { useAuth } from "../AuthContext"; 
function LoginForm() {
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}/auth/login`, {
        email,
        pass_word: password,
      });
      const token = response.data;
      localStorage.setItem('authToken', token);
        const toastId = toast.success("Login Successful", {
                autoClose: 3000,
                hideProgressBar: false,
                newestOnTop: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light"
              });
       setTimeout(() => {
        toast.dismiss(toastId);
      }, 1000);
      await login(token);
      await handleNewChatClick();
      setTimeout(() => {
          navigate("/chat");       
      },1500);
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        const message = error.response.data.message
        toast.error(`Error: ${message}`);
        // Navigate ONLY if OTP is not verified
       if (message === "OTP is not verified. Please sign up again.") {
          setTimeout(() => {
            navigate("/verifyotp");
          }, 1000);
        }
      } else {
        toast.error("Network error. Try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateUUID = async() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
  
  const handleNewChatClick = async () => {
    const randomId = await generateUUID(); 
    localStorage.setItem('session_id' , randomId);  
  }
  

  return (
    <div className="container-fluid backimage2">
      <div className="row h-100  justify-content-center align-items-center">
        <div className="col-lg-4 col-md-2 col-sm-1 col-0"></div>
        <div className="col-lg-4 col-md-8 col-sm-10 col-12">
          <div className="logincontainer">
            <h4 className="logintxt">Login</h4>
            <form onSubmit={handleLogin}>
              <div className="col-12 mt-5">
                <div className="input-container">
                  <img src={emails} alt="email icon" className="loginfaicons" />
                  <input
                    type="email"
                    className="reg-form mt-1"
                    value={email}
                    placeholder="Enter email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Enter your email"
                  />
                </div>
              </div>
              <div className="password-input-container col-12 mt-3">
                <div className="input-container">
                  <img
                    src={passwordicon}
                    alt="password icon"
                    className="loginfaicons"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    className="reg-form"
                    placeholder="Enter password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-label="Enter your password"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon
                    className="eyepassword"
                    icon={showPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  className="loginformbtn mt-4"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>
              <p className="text-center ptextlogs">
                Don’t have an account?
                <Link className="colorlogin" to="/register">
                  <span className="colorlogin"> Sign up</span>
                </Link>
              </p>
              <p className="text-center colorlogin">
                <Link to="/forgetpassmobileOtp" className="colornone">
                  Forgot password?
                </Link>
              </p>
            </form>
          </div>
        </div>
        <div className="col-lg-4 col-md-2 col-sm-1 col-0"></div>
      </div>
      <ToastContainer />
    </div>
  );
}
export default LoginForm;
