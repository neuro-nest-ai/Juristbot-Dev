import React,{useState,useEffect,useRef} from "react";
import logoImage from "../assetes/images/logojuristbot.svg";
import "./cource.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars,faXmark } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import cardImage from "./course1.png";
import { useNavigate } from "react-router-dom";
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
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const links = [
    ["/#about", "About"],
    ["/dpdpshield", "DPDP Shield"],
    ["/#pricing", "Pricing"],
    ["/course", "Legal Courses"],
    ["/list-lawyers", "Listings"],
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
          onClick={toggleMenu}
          aria-controls="courseNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
        </button>

        <div
          ref={panelRef}
          id="courseNav"
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
function Index() {
 const navigate = useNavigate();

    
  return (
    <div className="pattern-bnner">
       <div className="container-fluid">
          <Navbar />
       </div>
       <div className="container-main">
        <div className="cource-heading-top">
          <h3 className="text-center ">Courses</h3>
          <h1 className="text-center ">Learn at Your Own Pace, Advance Your Practice</h1>
          <p className="text-center">Comprehensive courses designed for solo advocates, law firms, and enterprises — gain practical knowledge and skills that fit your schedule and needs.</p>     
        </div>
           <div className="pt-3">
            <h4>Explore Our Courses</h4>
              <div onClick={() => navigate("/course/ai-Powered-drafting")} className="col-md-4 pt-2">
               <div className="card ai-card shadow-sm">
                    <img
                    src={cardImage}
                    className="card-img-top-course ai-card-img"
                    alt="AI Powered Drafting"
                    />

        <div className="card-body pt-3 p-0">
          <h5 className="card-title fw-bold">
            AI Powered Drafting
          </h5>

          <p className="card-text text-muted">
            Learn to draft legal documents efficiently using AI.
            Gain hands-on experience with Jurisbot AI and enhance
            your skills for academic and professional success.
          </p>

          <div className="d-flex flex-wrap gap-3 mt-3">
            <span className="  text-dark ">
              Beginner Friendly
            </span>
            <span className=" text-dark ">
              1 – 8 Weeks
            </span>
            <span className="text-dark ">
              Certification
            </span>
          </div>
        </div>
      </div>
    </div>
        </div>
       </div>
    </div>
  )
}

export default Index
