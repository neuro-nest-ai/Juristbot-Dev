import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import user from "../Assets/icons/user.svg";
import mobile from "../Assets/icons/mobile.svg";
import email from "../Assets/icons/email.svg";
import role from "../Assets/icons/role.svg";
import stateIcon from "../Assets/icons/sate.svg";
import passwordicon from "../Assets/icons/passwordicon.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import districts from "../config/districts.json";
import config from "../config/config";
import "../register/register.css";

function RegistrationForm() {
  const navigate = useNavigate();
  const locationHook = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile_no: "",
    pass_word: "",
    state: "",
    source: 'google',
    referral_code: ""
  });

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const refCode = params.get("referral_code");

    if (refCode) {
      setFormData((prev) => ({
        ...prev,
        referral_code: refCode,
        source: "referral"
      }));
    }
  }, [locationHook.search]);


  const [error, setError] = useState({
    passwordError: "",
    mobileError: "",
  });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Username validation
    if (name === "username" && !/^[a-zA-Z0-9_.-]*$/.test(value)) {
      setError("Username  only contain letters, numbers, underscores, dots, and hyphens.");
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to validate the form
  const validateForm = () => {
    let valid = true;

    // Password validation
    if (formData.pass_word.length < 8) {
      setError((prev) => ({
        ...prev,
        passwordError: "Password must be at least 8 characters long.",
      }));
      valid = false;
    } else if (
      !/\d/.test(formData.pass_word) ||
      !/[!@#$%^&*]/.test(formData.pass_word)
    ) {
      setError((prev) => ({
        ...prev,
        passwordError:
          "Password must include at least one number and one special character.",
      }));
      valid = false;
    } else {
      setError((prev) => ({ ...prev, passwordError: "" }));
    }

    // Mobile number validation
    if (!/^\d+$/.test(formData.mobile_no) || formData.mobile_no.length !== 10) {
      setError((prev) => ({
        ...prev,
        mobileError: "Mobile number must be a 10-digit number.",
      }));
      valid = false;
    } else {
      setError((prev) => ({ ...prev, mobileError: "" }));
    }

    return valid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/auth/signup`,
        formData
      );
      console.log("Registration successful", response.data);
      toast.success(response.data.message, "Registration successful! OTP has been sent to Register mobile are Mail");
      setTimeout(() => {
        navigate("/verifyotp");
      }, 2000);
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message ||
            "There was an error registering the user!",
          {}
        );
      } else {
        toast.error("There was an error registering the user!", {});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const states = Object.keys(districts["India"]);

  return (
      <div className="container-fluid backimage1">
        <ToastContainer />
        <div className="row">
          <div className="col-lg-3 col-md-2 col-sm-0 col-0"></div>
          <div className=" col-lg-6 col-md-8 col-sm-12 col-12 ">
            <div className="registration-registersc">
              <h4 className="registertitletxt mt-1">Register Now</h4>
              <form onSubmit={handleSubmit}>
                <div className="row mt-4">
                  <div className="mt-3 col-lg-6 col-12">
                    <div className="input-container">
                      <img src={user} alt="user" className="faicons" />
                      <input
                        className="reg-form"
                        type="text"
                        name="username"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{ paddingLeft: "30px" }}

                        pattern="^[a-zA-Z]*$"
                        title="Username can only contain letters"

                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mt-3  col-lg-6   col-12">
                    <div className="input-container">
                      <img src={email} alt="email" className="faicons" />
                      <input
                        className="reg-form"
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                  </div>

                  {/* Mobile number */}
                  <div className="mt-3  col-lg-6  col-12">
                    <div className="input-container">
                      <img src={mobile} alt="mobile" className="faicons" />
                      <input
                        className="reg-form"
                        type="text"
                        name="mobile_no"
                        placeholder="Enter Mobile number"
                        value={formData.mobile_no}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {error.mobileError && (
                      <p className="error-message">{error.mobileError}</p>
                    )}
                  </div>

                  {/* State */}
                  <div className="mt-3 col-lg-6 col-12">
                    <div className="input-container">
                      <img src={stateIcon} alt="state" className="faicons" />
                      <select
                        className="reg-formslect"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Choose State
                        </option>
                        {states.map((state, index) => (
                          <option key={index} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Source */}
                  <div className="mt-3  col-lg-6   col-12">
                    <div className="input-container">
                      <img src={role} alt="source" className="faicons" />
                      <select
                        className="reg-formslect"
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Choose Source
                        </option>
                        <option value="google">Google</option>
                        <option value="facebook">Facebook</option>
                        <option value="salesperson">Salesperson</option>
                        <option value="instagram">Instagram</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mt-3 col-lg-6   col-12">
                    <div className="password-input-container">
                      <div className="input-container">
                        <img
                          src={passwordicon}
                          alt="password"
                          className="faicons"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          className="reg-form"
                          placeholder="Enter your password"
                          name="pass_word"
                          value={formData.pass_word}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <span
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                        />
                      </span>
                    </div>
                    {error.passwordError && (
                      <p className="error-message">{error.passwordError}</p>
                    )}
                  </div>

                  {/* Register button */}
                  <div className="btndivall">
                    <button className="regformbtns mt-3" type="submit" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register Now"}
                  </button>
                  </div>

                  {/* Login link */}
                  <div className="mt-4 col-lg-12">
                    <p className=" pt-2 ptextlogin">
                      Already have an account?
                      <Link className="colornone" to="/login">
                        <span className="colorlogin"> Log in </span>
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="col-lg-3 col-md-2 col-sm-0 col-0"></div>
        </div>
      </div>
  );
}

export default RegistrationForm;