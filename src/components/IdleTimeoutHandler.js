import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "./config/config";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../components/AuthContext';
import PropTypes from "prop-types"; 
const IdleTimeoutHandler = ({ timeout = 60 * 60 * 1000 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
    let timeoutId;
    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleSessionExpired();
      }, timeout);
    };
    const handleSessionExpired = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const id = user?.id; 
        if (token && id) {
          await axios.post(
            `${config.apiBaseUrl}/auth/logout`,{ id }, 
            {
              headers: {
                Authorization:`Bearer ${token}`,
              },
            }
          );
        }
      } catch (error) {
        console.error("Error logging out on session expiration:", error);
      } finally {
        localStorage.clear();
        toast("Your session has expired due to inactivity. Please log in again.");
        navigate("/");
      }
    };
    const attachEventListeners = () => {
      window.addEventListener("mousemove", resetIdleTimer);
      window.addEventListener("keydown", resetIdleTimer);
      window.addEventListener("click", resetIdleTimer);
      resetIdleTimer();
    };
    const detachEventListeners = () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
    };
    attachEventListeners(); 
    return () => {
      detachEventListeners(); 
    };
  }, [navigate, timeout, user]);
  return null; 
};

IdleTimeoutHandler.propTypes = {
  timeout: PropTypes.number, 
};
export default IdleTimeoutHandler;
