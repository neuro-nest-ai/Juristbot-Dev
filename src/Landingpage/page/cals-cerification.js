import React, { useEffect, useState } from "react";
import axios from "axios";
import config from '../../components/config/config';
import logoImage from "../assetes/images/logo_img_1.png";
import "./cals.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import defaultimg from "../../Landingpage/assetes/defalutimg.svg";
import { toast, ToastContainer } from "react-toastify";

function Calscerification() {
    const [profiles, setProfiles] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [modelopen ,setModelopen] = useState(false);
    const [activeProfileId, setActiveProfileId] = useState(null);
    const [lawyermobile, setLawyermobile] = useState(null);
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [caseDetails, setCaseDetails] = useState('');
    const [isloading,setIsloading] =useState(false)
 
const handleOpen = (id,mobile_no) => {
    setActiveProfileId(id);
    setLawyermobile(mobile_no);
    setModelopen(true);
};

const handleClose = () => {
    setModelopen(false);
    setActiveProfileId(null);
    setLawyermobile(null);

};
const handleSubmit = async () => {
    if (!userName) {
        toast.error("must be enter your name");
        return;
    }
    if (userPhone.length !== 10) {
        toast.error("Phone number must be 10 digits");
        return;
    }
    if (!caseDetails) {
        toast.error("Enter your caseDetails");
        return;
    }

    setIsloading(true);
    try {
        const response = await axios.post(`${config.apiBaseUrl}/senddata`, {
            id:activeProfileId,
            mobileno: lawyermobile,
            name: userName,
            mobileNumber: userPhone,
            description: caseDetails
        });

       toast.success("Your request has been submitted!", response.message);
       setUserName('');
       setUserPhone('');
       setCaseDetails('');
        handleClose(); 
    } catch (error) {
        console.error('Error sending data:', error);
        alert("Something went wrong. Please try again.");
    }finally {
        setIsloading(false); 
    }
}; 
    useEffect(() => {
        const fetchProfiles = async () => {
          try {
            const response = await axios.get(`${config.apiBaseUrl}/auth/calsprofile`);
            setProfiles(response.data);
          } catch (error) {
            console.error("Error fetching profiles:", error);
            alert("Failed to load profiles. Please try again later.");
          }
        };
    
        fetchProfiles();
      }, []);

      useEffect(() => {
        const getUserLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const locationResponse = await axios.get(
                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const userTown = locationResponse.data.address?.city || locationResponse.data.address?.town || locationResponse.data.address?.village || "";
                setSearch(userTown); 
              } catch (err) {
                console.error("Failed to get location info:", err);
              }
            }, (error) => {
              console.warn("Geolocation permission denied or failed:", error.message);
            });
          } else {
            console.warn("Geolocation is not supported by this browser.");
          }
        };
        getUserLocation();
      }, []);
      
      const filteredProfiles = profiles.filter(profile =>
        profile.username?.toLowerCase().includes(search.toLowerCase()) ||
        profile.town?.toLowerCase().includes(search.toLowerCase())
    );
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    return (
        <div className="d-flex justify-content-center">
            <ToastContainer/>
            <nav
                className="navbar navbar-expand-xl navbar-dark bg-dark nav-bar-cls"
                style={{ borderRadius: isMenuOpen ? "20px" : "58px" }}
            >
                <div className="container-fluid">
                    <div className="col-xl-3 col-lg-4 col-md-5 col-sm-6 col-9 d-flex justify-content-start">
                        <img src={logoImage} alt="logo" className="landinglogo" />
                    </div>
                    <FontAwesomeIcon
                        className="col-xl-9 col-lg-8 col-md-7 col-sm-6 col-3 navbar-toggler navbar-toggler_2"
                        type="button"
                        onClick={toggleMenu}
                        aria-controls="navbarNav"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation"
                        icon={faBars}
                        style={{ width: "52px", padding: "0px", margin: "0px" }}
                    />
                    <div
                        className={`collapse navbar-collapse ${isMenuOpen ? "nav-bar-box show" : ""
                            }`}
                        id="navbarNav"
                    >
                        <ul className="navbar-nav" style={{ margin: "auto" }}>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/" > Home </a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link " href="/">About</a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/" >  Our services </a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/" > Pricing </a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/cals-certification-lawyers" >
                                    CALS certificate
                                </a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/" >Contact us </a>
                            </li>
                        </ul>
                        <div className="col-lg-2 col-md-2 col-sm-3 col-4 massnav">
                            <Link to="/login">
                                <button type="button" className="juristbotAIbtn">
                                    Jurist bot AI
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="container mt-5">
                <div className="mt-5">
                    <h6 className="pt-5 mt-5 text-center cals-headstxt">
                        Join Certified AI Legal Specialist (CALS) and get FREE <br />
                        access to the Juristbot CALS Community for peer <br />discussions!
                    </h6>
                </div>

                {/* 🔍 Search Bar */}
                <div className="d-flex justify-content-end mt-4">
                    <div className="search-container">
                        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                            width="16" height="16" fill="gray">
                            <path d="M21.707 20.293l-5.396-5.396A7.934 7.934 0 0018 10c0-4.418-3.582-8-8-8S2 5.582 2 10s3.582 8 8 8c1.93 0 3.71-.613 5.189-1.689l5.396 5.396a1 1 0 001.415-1.414zM10 16a6 6 0 110-12 6 6 0 010 12z" />
                        </svg>
                        <input
                            className="searchbar-location"
                            type="search"
                            placeholder="Search members / Location"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* 🔁 Filtered Profiles */}
                <div className="row mt-5">
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile, index) => (
                            <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={profile.id}>
                                <div className="lawyer-card">
                                    <div className="row">
                                        <div className="col-4 d-flex justify-content-center align-items-center">
                                            <img  src={profile.profile_img? profile.profile_img : defaultimg} className="lawyer-image" alt="Profile" />
                                        </div>
                                        <div className="col-8">
                                            <h5 className="lawyer-name">{profile.username}</h5>
                                            <p className="lawyer-role">
                                            {profile.law_category ? `${profile.law_category}` : `${profile.role}`}
                                            </p>
                                            <ul className="law-specialists">
                                                {profile.law_specialists && profile.law_specialists.length > 0 ? (
                                                    profile.law_specialists.slice(0, 1).map((specialist, index) => (
                                                    <li key={specialist}>{specialist}</li>
                                                    ))
                                                ) : (
                                                    <li>----</li> 
                                                )}
                                                </ul>
                                                <p className="mb-2">{profile.town} </p>
                                                <div className="d-flex justify-content-">
                                                <button  className="lawyer-city"  onClick={() => handleOpen(profile.id, profile.mobile_no)}   > Get contact </button>
                                        </div>
                                        </div>
                                       
                                        {modelopen && activeProfileId && (
                                            <>                               
                                             <button className="modal-overlay-cals" onClick={handleClose} aria-label="Close Modal"></button>
                                                <div className="modal-cals">
                                                    <div className="form-group mb-2">
                                                        <label htmlFor="f" className="lable-profile-txt">Enter your Name</label>
                                                        <input
                                                            type="text"
                                                            className="profile-form-cals"
                                                            placeholder="Your Name"
                                                            value={userName}
                                                            onChange={(e) => setUserName(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-group mb-2">
                                                        <label htmlFor="f" className="lable-profile-txt">Phone Number</label>
                                                        <input
                                                        type="text"
                                                        className="profile-form-cals"
                                                        placeholder="Enter your Number"
                                                        value={userPhone}
                                                        onChange={(e) => {
                                                            const input = e.target.value;
                                                            if (/^\d{0,10}$/.test(input)) {
                                                            setUserPhone(input);
                                                            }
                                                        }}
                                                        required
                                                        />
                                                    </div>
                                                    <div className="form-group mb-2">
                                                        <label htmlFor="f" className="lable-profile-txt">Case Details</label>
                                                        <textarea
                                                            className="profile-form-cals"
                                                            placeholder="Enter case details here..."
                                                            rows="5"
                                                            maxLength="350"
                                                            value={caseDetails}
                                                            onChange={(e) => setCaseDetails(e.target.value)}
                                                            required
                                                        ></textarea>
                                                        <small className="text-dark">{caseDetails.length}/350 characters</small>
                                                    </div>
                                                    <div className="d-flex justify-content-end">
                                                        <button className="cals-cancle-btn" onClick={handleClose} >Close</button>
                                                        <button className="cals-submit-btn ms-2" onClick={handleSubmit} disabled={isloading}>{isloading ? "Submitting..." : "Submit"}</button>
                                                    </div>
                                                </div>
                                                </>
                                          
                                        )}

                                        
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center mt-4">No members found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Calscerification