import React, { useState, useEffect,useCallback,useRef  } from "react";
import logoImage from "../assetes/images/logojuristbot.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars,faXmark, faLocationDot, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./listing.css";
import Lawdata from "./lawcat.json";
import location from "../listing/location.svg";
import axios from "axios";
import config from "../../components/config/config";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const panelRef = useRef(null);
  const togglerRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        togglerRef.current &&
        !togglerRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const links = [
    ["/#about", "About"],
    ["/#pricing", "Pricing"],
    ["/dpdpshield", "DPDP Shield"],
    ["/course", "Legal Courses"],
    ["/list-lawyers", "Listing"],
    ["/#contact", "Contact us"],
  ];

  return (
    <nav className="navbar navbar-expand-xl navbar-dark bg-dark nav-bar-cls">
      <div className="container-fluid jb-nav-inner">
        <div className="jb-logo-wrap">
          <img src={logoImage} alt="logo" className="landinglogo" />
        </div>

        <button
          ref={togglerRef}
          type="button"
          className="navbar-toggler navbar-toggler_2"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-controls="listingNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
        </button>

        <div
          ref={panelRef}
          id="listingNav"
          className={`collapse navbar-collapse jb-menu-panel ${isMenuOpen ? "show" : ""}`}
        >
          <ul className="navbar-nav jb-nav-list">
            {links.map(([href, label]) => (
              <li key={label} className="nav-item nav-cls">
                <a className="nav-link" href={href} onClick={closeMenu}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="massnav">
            <Link to="/login" onClick={closeMenu}>
              <button type="button" className="juristbotAIbtn">Login</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
const uniqueSpecialists = [...new Set(Lawdata.specialists)];

const renderStars = (rating) => (
  <div className="stars-ls">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'star-ls filled-ls' : 'star-ls'}>★</span>
    ))}
    <span className="rating-text-ls">({rating})</span>
  </div>
);

function Listing() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [geoState, setGeoState] = useState("");
  const [geoTown, setGeoTown] = useState("");
  const [locationStatus, setLocationStatus] = useState(""); // for user feedback


  // Step 1: Get coordinates → Step 2: Reverse geocode → Step 3: Fetch lawyers
  const detectLocationAndFetch = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      fetchLawyers(); // fallback: fetch all
      return;
    }

    setLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap Nominatim (free, no API key needed)
          const geoRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
              },
              headers: {
                "Accept-Language": "en", // always get English names
              },
            }
          );

          const address = geoRes.data.address;

          // Nominatim returns different keys depending on region.
          // For India: county = district, state = state
          const detectedTown =
            address.state_district ||        // District (most Indian regions)
            address.city_district ||
            address.suburb ||
            address.city ||
            address.town ||
            address.village ||
            "";

          const detectedState = address.state || "";

          setGeoTown(detectedTown);
          setGeoState(detectedState);
          setLocationStatus("");

          // Pre-fill the search box with detected district
          setSearchCity(detectedTown);

          // Fetch lawyers filtered by detected location
          fetchLawyers(detectedTown, detectedState);
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setLocationStatus("");
          fetchLawyers(); // fallback: fetch all
        }
      },
      (err) => {
        console.warn("Location permission denied or error:", err.message);
        setLocationStatus("");
        fetchLawyers(); // fallback: fetch all
      },
      { timeout: 8000 }
    );
  }, []);

  
  useEffect(() => {
    detectLocationAndFetch();
  }, [detectLocationAndFetch]);

  const fetchLawyers = async (town = "", state = "") => {
    try {
      setLoading(true);
      const params = {};
      if (town)  params.town  = town;
      if (state) params.state = state;

      const response = await axios.get(
        `${config.apiBaseUrl}/auth/getmemberlisting`,
        { params }
      );
      setLawyers(response.data);
    } catch (error) {
      // If 404 (no profiles found for location), clear the list gracefully
      if (error.response?.status === 404) {
        setLawyers([]);
      } else {
        console.error("Failed to fetch lawyers:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Client-side filter (for category dropdown & manual search refinement)
  const filteredLawyers = lawyers.filter((l) => {
    const cityMatch = searchCity
      ? l.town?.toLowerCase().includes(searchCity.toLowerCase()) ||
        l.state?.toLowerCase().includes(searchCity.toLowerCase())
      : true;

    const categoryMatch = selectedCategory
      ? l.law_specialists?.includes(selectedCategory)
      : true;

    return cityMatch && categoryMatch;
  });

  // When user manually types in search box, re-fetch from API
  const handleSearchChange = (e) => {
    setSearchCity(e.target.value);
  };

  const handleSearchSubmit = () => {
    fetchLawyers(searchCity, "");
  };

  return (
    <div className="main-container">
      <div className="container-fluid"><Navbar /></div>
      <div className="container-main">
        <div className="lawyer-heading-top">
          <h2 className="lawyer-name-listing">Find A Lawyer</h2>
          {/* Show detected location as a subtle badge */}
          {geoTown && (
            <p className="text-muted" style={{ fontSize: "13px" }}>
              📍 Showing lawyers near <strong>{geoTown}{geoState ? `, ${geoState}` : ""}</strong>
            </p>
          )}
        </div>

        {/* Search */}
        <div className="search-bar-wrapper-ls">
          <div className="search-input-container-ls">
            <FontAwesomeIcon icon={faLocationDot} className="search-location-icon-ls" />
            <input
              type="search"
              className="search-input-ls"
              placeholder="Search District or State"
              value={searchCity}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            />
            <button className="search-btn-icon" onClick={handleSearchSubmit}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
          {locationStatus && (
            <p className="text-muted mt-1" style={{ fontSize: "12px" }}>
              {locationStatus}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="filter-wrapper-ls">
          <div className="filter-dropdown-ls">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Select Law Category</option>
              {uniqueSpecialists.map((item, i) => (
                <option key={i} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="listing-container-ls">
          <div className="search-header-ls">
            <h2>
              Showing Results
              {searchCity && <> for: <span className="location-highlight-ls">{searchCity}</span></>}
              <span className="ms-2 text-muted" style={{ fontSize: "14px" }}>
                ({filteredLawyers.length} found)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-5"><p>Loading lawyers...</p></div>
          ) : filteredLawyers.length === 0 ? (
            <div className="text-center py-5"><p>No lawyers found.</p></div>
          ) : (
            <div className="lawyers-grid-ls">
              {filteredLawyers.map((lawyer) => (
                <div key={lawyer.id} className="lawyer-card-ls">
                  <div className="card-content-ls">
                    <div className="lawyer-image-ls">
                      <img src={lawyer.profile_img} alt={lawyer.username} />
                    </div>
                    <div className="lawyer-details-ls">
                      <h3 className="lawyer-name-ls mb-0">Adv. {lawyer.username}</h3>
                      <div className="tags-ls">
                        <span className="tag-ls specialization-ls">{lawyer.role}</span>
                      </div>
                      {renderStars(4.5)}
                      <p className="description-ls mb-0">{lawyer.about?.slice(0, 80)}...</p>
                      <p className="location-ls mb-0">
                        <i className="icon-ls"><img src={location} alt="Location" /></i>
                        {lawyer.town}, {lawyer.state}
                      </p>
                    </div>
                    <Link to={`/listingview/${lawyer.id}`}>
                      <button className="view-profile-btn-ls">View Profile</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Listing;