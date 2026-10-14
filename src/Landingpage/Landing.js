import React, { useState, useRef, useEffect } from "react";

import absteact from "./assetes/images/absteact.svg";
import logoImage from "./assetes/images/logojuristbot.svg";
import robot from "./assetes/images/robot.gif";
import "./Landing.css";
import badge from "./assetes/images/badge.svg";
import ContactForm from "./page/send-email-template.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBars,faXmark,faLeftLong,faRightLong,faChevronDown,faChevronUp,faPlay} from "@fortawesome/free-solid-svg-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link, useLocation} from "react-router-dom";
import defaultimg from "../Landingpage/assetes/images/dummy.svg";
import config from "../components/config/config.js";
import axios from "axios";
import Prcing from "./page/prcing.js";
import tickiconhm from "./assetes/images/hometickicon.svg";
import usericon from "./assetes/images/usericon.svg";
import pdficon from "./assetes/images/pdficon.svg";
import chaticon from "./assetes/images/chaticon.svg";
import cert2 from "./assetes/images/coursecertificate.jpg";
import cert3 from "./assetes/images/cals.jpg";
import logocert from "./assetes/images/isocertificatelogo.jpg";
import doublecodes from "./assetes/images/dobulecode.svg";
import demo1 from "./assetes/images/demo1.svg";
import demo2 from "./assetes/images/demo2.svg";
import demo3 from "./assetes/images/demo3.svg";
import demo4 from "./assetes/images/demo4.svg";
import Footer  from './page/footer';


const Navbar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("#home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const panelRef = useRef(null);
  const togglerRef = useRef(null);

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    }
  }, [location]);

  // close on outside click + ESC
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

  const handleClick = (link) => {
    setActiveLink(link);
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav className="navbar navbar-expand-xl navbar-dark bg-dark nav-bar-cls">
      <div className="container-fluid jb-nav-inner">
        {/* Logo */}
        <div className="jb-logo-wrap">
          <img src={logoImage} alt="logo" className="landinglogo" />
        </div>

        {/* Toggler: bars <-> X */}
        <button
          ref={togglerRef}
          type="button"
          className="navbar-toggler navbar-toggler_2"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
        </button>

        {/* Menu panel */}
        <div
          ref={panelRef}
          id="navbarNav"
          className={`collapse navbar-collapse jb-menu-panel ${
            isMenuOpen ? "show" : ""
          }`}
        >
          <ul className="navbar-nav jb-nav-list">
            <li className="nav-item nav-cls">
              <a
                className={`nav-link ${activeLink === "#about" ? "active" : ""}`}
                href="#about"
                onClick={() => handleClick("#about")}
              >
                About
              </a>
            </li>
            <li className="nav-item nav-cls">
              <a
                className={`nav-link ${
                  activeLink === "#pricing" ? "active" : ""
                }`}
                href="#pricing"
                onClick={() => handleClick("#pricing")}
              >
                Pricing
              </a>
            </li>
            <li className="nav-item nav-cls">
              <a className="nav-link" href="/dpdpshield" onClick={closeMenu}>
                DPDP Shield
              </a>
            </li>
            <li className="nav-item nav-cls">
              <a className="nav-link" href="/course" onClick={closeMenu}>
                Legal Courses
              </a>
            </li>
            <li className="nav-item nav-cls">
              <a className="nav-link" href="/list-lawyers" onClick={closeMenu}>
                Listing
              </a>
            </li>
            <li className="nav-item nav-cls">
              <a
                className={`nav-link ${
                  activeLink === "#contact" ? "active" : ""
                }`}
                href="#contact"
                onClick={() => handleClick("#contact")}
              >
                Contact us
              </a>
            </li>
          </ul>

          <div className="massnav">
            <Link to="/login" onClick={closeMenu}>
              <button type="button" className="juristbotAIbtn">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [playing, setPlaying] = useState(null);

  const faqs = [
    {
      question: "What is JuristBot AI?",
      answer:
        "JuristBot AI is a professional legal AI tool built exclusively for Indian advocates and law firms — combining AI for legal drafting, case research, and argument preparation in one platform.",
    },
    {
      question: "How does JuristBot's legal drafting AI work?",
      answer:
        "Describe your matter, and JuristBot instantly generates court-ready drafts — petitions, notices, replies, and more. It's legal drafting AI that thinks like an advocate.",
    },
    {
      question: "Is JuristBot among the best AI tools in India for lawyers?",
      answer:
        "Yes. Unlike generic writing tools, JuristBot is purpose-built for Indian law — making it one of the best legal AI tools in India for practising advocates.",
    },
    {
      question: "What documents can JuristBot draft?",
      answer:
        "Petitions, bail applications, legal notices, agreements, writ petitions, consumer complaints, patent applications, creating case strategy, Law & Section, Old and new sections, Research legal topic, analysis legal document, Case cross question q/a, Relevant Judgement and more — all through AI legal drafting tailored to your facts.",
    },
    {
      question: "How does JuristBot help with legal research?",
      answer:
        "Query in plain language and get judgment-backed, cited results instantly. JuristBot's AI tools for legal research replace hours of manual searching on SCC Online or Manupatra.",
    },
    {
      question: "Is my data secure on JuristBot?",
      answer:
        "Absolutely. Your case details and drafts are fully private and never used to train external models. Confidentiality is built into JuristBot's AI for legal drafting from the ground up.",
    },
    {
      question: "Can JuristBot help with cross-examination preparation?",
      answer:
        "Yes — a feature most legal AI tools in India don't offer. JuristBot generates sharp cross-questioning strategies based on your case facts.",
    },
    {
      question: "How do I get started with JuristBot?",
      answer:
        "Visit juristbot.ai, sign up, and experience how legal AI for drafting and research can transform your practice — from day one.",
    },
    {
      question: "Does JuristBot support AI-assisted patent drafting?",
      answer:
        "Yes, JuristBot's AI can assist with drafting patent applications, ensuring they meet the required standards and are well-structured for submission.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const certificates = [
    { id: 2, image: cert2, alt: "Certificate of Completion" },
    { id: 3, image: cert3, alt: "AI Legal Specialist Certificate" },
  ];

  const benefitsList = [
    {
      id: 1,
      icon: "⏱️",
      title: "Save up to 80% drafting time with legal AI software",
    },
    {
      id: 2,
      icon: "✓",
      title: "Accurate Indian law citations with verified acts & sections",
    },
    {
      id: 3,
      icon: "🎯",
      title: "Enhanced AI for legal research and case preparation",
    },
    {
      id: 4,
      icon: "💬",
      title: "Smart legal chatbot for instant legal answers",
    },
    {
      id: 5,
      icon: "🛡️",
      title: "Secure, confidential, and compliant legal AI India platform",
    },
  ];

  const demovideo = [
    {
      id: "BKSQ5kmj3q4",
      icon: demo1,
      category: "Scenario solver",
      title: "AI Legal Case Analysis Tool",
      desc: "Analyze complex cases instantly using AI in legal research. JuristBot's Scenario Solver applies relevant Indian laws and acts to deliver expert legal insights and confident case strategies.",
    },
    {
      id: "Z9nYfoEaQtQ",
      icon: demo2,
      title: "AI Cross Examination Tool",
      category: "Cross Q&A",
      desc: "Strengthen arguments with AI-powered legal Q&A. Prepare intelligent cross-examination questions and counter-arguments using AI tools for advocates and courtroom professionals.",
    },
    {
      id: "n5NFVt-pTvs",
      icon: demo3,
      title: "AI Legal Drafting Software",
      category: "Legal drafting",
      desc: "Draft petitions, affidavits, notices, and contracts using AI legal drafting software India. This AI-based legal research tool ensures court-ready formatting, compliance, and professional accuracy.",
    },
    {
      id: "r0-LKM4TuIY",
      icon: demo4,
      title: "Indian Case Law Search ",
      category: "Relevant judgement",
      desc: "Find Supreme Court and High Court judgments instantly with AI legal research software. This legal research tool reduces manual effort and improves legal accuracy.",
    },
  ];

  const userCategories = [
    {
      id: 1,
      icon: "⚖️",
      iconColor: "#6366F1",
      title: "Advocates & Law Firms",
      description:
        "Legal AI software for advocates and law firms to help with legal drafting, AI legal research, case preparation, and judgment finding.",
      bgColor: "#ffffff",
    },
    {
      id: 2,
      icon: "💼",
      iconColor: "#8B5CF6",
      title: "Judges",
      description:
        "AI legal assistance for judges to quickly check relevant Indian laws, legal sections, and case judgments.",
      bgColor: "#ffffff",
    },
    {
      id: 3,
      icon: "🛡️",
      iconColor: "#10B981",
      title: "Police Officers",
      description:
        "Legal AI tools for police officers to understand laws, procedures, and correct legal sections easily.",
      bgColor: "#ffffff",
    },
    {
      id: 4,
      icon: "🎓",
      iconColor: "#F97316",
      title: "Law Students",
      description:
        "AI legal support for law students to learn legal drafting, research Indian laws, and prepare for exams and practice.",
      bgColor: "#ffffff",
    },
    {
      id: 5,
      icon: "👥",
      iconColor: "#06B6D4",
      title: "General Public",
      description:
        "AI legal information for the public to help people understand Indian laws in a simple and clear way.",
      bgColor: "#ffffff",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "The sign-up process was smooth, and the trial experience was easy to navigate. The platform is user-friendly and made getting started very simple.",
      name:"Valibi",
      rating:"⭐⭐⭐⭐⭐",
      role: "Advocate",
      city:"Karnataka"
    },
    {
      id: 2,
      text: "The sign-in process was seamless. While the overall experience was good, I'd like to see smoother access to all department trial features for a more complete evaluation.",
      name:"Amith Anandh",
      rating:"⭐⭐⭐⭐☆",
      role:"Advocate",
      city:"Karnataka"
    },
    {
      id: 3,
      text: "The trial process was simple and easy to use. Everything worked well, and the overall experience was smooth.",
      name:"Bhoopendra",
      rating:"⭐⭐⭐⭐⭐",
      role:"Advocate",
      city:"Madhya Pradesh"
    },
    {
      id: 4,
      text: "The platform is clear, intuitive, and easy to use. I didn't face any issues during the trial, and the overall experience was excellent.",
      name:"Nisham",
      rating:"⭐⭐⭐⭐⭐",
      role: "Advocate",
      city:"Uttar Pradesh"
    },
    {
      id: 5,
      text: "The onboarding experience was good and the platform is easy to understand. Expanding trial access to more features would make the evaluation even better.",
      name:"Bala",
      rating:"⭐⭐⭐⭐⭐",
      role:"Advocate",
      city:"Chennai"     
    },{
      id: 6,
      text: "The sign-up process was smooth, and the platform works well overall. The English responses are satisfactory, while the Tamil content could be improved further. I would alsoappreciate more detailed and elaborate answers for a better user experience.",
      name:"Karthikeyan",
      rating:"⭐⭐⭐⭐☆",
      role:"Advocate",
      city:"Tamil Nadu"     
    },{
      id: 7,
      text: "The sign-up process was simple and hassle-free. The platform's features are good and easyto use. Overall, I have had a positive experience, and adding more detailed and elaborateresults would make it even better.",
      name:"Anshad Palya",
      rating:"⭐⭐⭐⭐⭐",
      role:"Advocate",
      city:"Karnataka"     
    },{
      id: 8,
      text: "The sign-up process was smooth, and the platform has been performing well. The featuresare easy to use, with no lag or issues experienced so far. I would appreciate more detailedand enriched content to further enhance the overall experience.",
      name:"Devapratim",
      rating:"⭐⭐⭐⭐⭐",
      role:"Advocate",
      city:"Chennai"     
    },{
      id: 9,
      text: "The sign-up process was smooth, and my experience with the platform has been very good.The features are delivering good results, and the platform has been easy to use with noissues so far.",
      name:"Swarup Mondal",
      rating:"⭐⭐⭐⭐⭐",
      role:"Advocate",
      city:"Kolkata"     
    },{
      id: 10,
      text: "The sign-up process was seamless, and the platform's features have performed well. My overall experience has been excellent, and I have not faced any issues so far.",
      name:"Shruti Anand",
      rating:"⭐⭐⭐⭐⭐",
      role:"Law student",
      city:"Chennai"     
    },{
      id: 11,
      text: "The sign-up process was smooth, and my experience with the available features has beengood. I would appreciate more detailed responses and information related to the questionsasked",
      name:"Nithin",
      rating:"⭐⭐⭐⭐⭐",
      role:"advocate",
      city:"Maharashtra"     
    },{
      id: 12,
      text: "The sign-up process was simple, and my experience has been good so far. I have exploredtwo features, and the platform has been easy to use. I look forward to trying the remainingfeatures.",
      name:"Hima Bindu",
      rating:"⭐⭐⭐⭐⭐",
      role:"Advocate",
      city:"mumbai"     
    },{
      id: 13,
      text: "The sign-up process was smooth, and the platform has been easy to use. My experience with the available features has been good. I would appreciate more detailed results to makethe experience even better.",
      name:"Ajay",
      rating:"⭐⭐⭐⭐⭐",
      role:"Advocate",
      city:"Karnataka"     
    },
    {
      id: 14,
      text: "The sign-up process was good, and I have explored all the available features. The platform has been easy to use, and my overall experience has been positive with no issues so far.",
      name:"Janesh",
      rating:"⭐⭐⭐⭐⭐",
      role:"Advocate",
      city:"Delhi"     
    },
  ];

  const nextSlidetest = () => {
    setCurrentSlide((prev) => (prev === testimonials.length - 3 ? 0 : prev + 1));
  };

  const prevSlidetest = () => {
    setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 3 : prev - 1));
  };



  useEffect(() => {
    AOS.init({
      duration: 500,
    });
  }, []);

  const [startIndex, setStartIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(5);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get(
          `${config.apiBaseUrl}/auth/calsprofile`
        );
        const sortedProfiles = response.data.sort((a, b) => {
          return b.id - a.id;
        });
        setProfiles(sortedProfiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth < 576) {
        setVisibleCards(1);
      } else if (window.innerWidth < 768) {
        setVisibleCards(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(4);
      } else if (window.innerWidth < 1224) {
        setVisibleCards(5);
      } else {
        setVisibleCards(5);
      }
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  const nextSlide = () => {
    if (startIndex < profiles.length - visibleCards) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const membershipRef = useRef(null);

  useEffect(() => {
    if (membershipRef.current) {
      membershipRef.current.style.display = "block";
    }
  }, []);



  return (
    <div className="main-container">
      <section
        id="home"
        className="col-12 text-white text-center d-flex align-items-center justify-content-start flex-column  "
      >
        <Navbar />
        <div
          data-aos="fade-up"
          className="col-sm-10 col-md-10 col-lg-6 mt-5 heropage"
          style={{ padding: "45px 10px", paddingTop: "122px" }}
        >
          <h1
            className="display-4 font-family"
            style={{ color: "black", fontWeight: "700", fontSize: "52px" }}
          >
            JuristBot AI{" "}
            <span style={{ color: "#454545" }}>
              {" "}
              Legal AI Software for Indian Lawyers
            </span>
          </h1>
          <p
            className="hero-para"
            style={{ color: "black", marginLeft: "auto", marginRight: "auto" }}
          >
            JuristBot AI is an AI-powered legal AI software in India designed for
            advocates, law firms, police officers, judges, and the public. It
            combines AI legal research, legal drafting, judgment discovery, and
            legal scenario analysis into one intelligent legal research tool
            built for Indian laws.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3 mt-5 mb-5">
            <button type="button" className="juristbothmbtn1">
              <img src={tickiconhm} alt="tick" /> Built for Indian Laws
            </button>{" "}
            <button type="button" className="juristbothmbtn">
              <img src={tickiconhm} alt="tick" /> Fast, Accurate & Reliable Legal
              AI
            </button>{" "}
            <button type="button" className="juristbothmbtn">
              <img src={tickiconhm} alt="tick" /> Secure AI Legal Assistance
              Platform
            </button>
          </div>
        </div>
        <div className="static-info" data-aos="fade-up">
          <p className="statichead col-8 mb-0">
            🎉 Get Started at ₹499 - Get 750 Credits
          </p>
          <div className=" col-4  padd-cls">
            <Link to="/register">
              <button className="jurist-btn " type="button">
                Register now
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container-main-home mb-4">
        <div className="row text-center">
          <div
            data-aos="zoom-in-down"
            className="col-12"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <p className="font-family" style={{ fontWeight: "700" }}>
              <img
                src={absteact}
                alt="logo"
                style={{ height: "25px", marginRight: "8px" }}
              />
            </p>
            <h2 className="font-family heading-section-all">
              <span style={{ color: "#FFD119" }}>Trusted </span>
              <span style={{ color: "#000000" }}>
                Legal AI Software in Action
              </span>
            </h2>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards-container">
          <div className="stats-card" data-aos="fade-up" data-aos-delay="100">
            <div className="stats-icon">
              <img
                src={usericon}
                alt="usericon"
                style={{ width: "40px", height: "40px" }}
              />
            </div>
            <div className="stats-number">150+</div>
            <div className="stats-title">Law Students Registered</div>
            <p className="stats-description">
              Helping future lawyers master AI legal research and drafting
            </p>
          </div>

          <div className="stats-card" data-aos="fade-up" data-aos-delay="200">
            <div className="stats-icon">
              <img
                src={usericon}
                alt="usericon"
                style={{ width: "40px", height: "40px" }}
              />
            </div>
            <div className="stats-number">2,500+</div>
            <div className="stats-title">Lawyers Actively Using</div>
            <p className="stats-description">
              Trusted by advocates and law firms across India
            </p>
          </div>

          <div className="stats-card" data-aos="fade-up" data-aos-delay="300">
            <div className="stats-icon">
              <img
                src={pdficon}
                alt="usericon"
                style={{ width: "40px", height: "40px" }}
              />
            </div>
            <div className="stats-number">500+</div>
            <div className="stats-title">Legal Drafts Daily</div>
            <p className="stats-description">
              Save time with AI-powered legal drafting
            </p>
          </div>

          <div className="stats-card" data-aos="fade-up" data-aos-delay="400">
            <div className="stats-icon">
              <img
                src={chaticon}
                alt="usericon"
                style={{ width: "40px", height: "40px" }}
              />
            </div>
            <div className="stats-number">10,000+</div>
            <div className="stats-title">Legal Queries Answered</div>
            <p className="stats-description">
              Instant solutions through our intelligent tool
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <section id="about" style={{ minHeight: "352px", padding: "50px 0px" }}>
        <div className="container-main-home">
          <div className="row text-center" style={{ padding: "30px 0px 90px 0px" }}>
            <div
              data-aos="zoom-in-down"
              className="col-lg-7 col-md-7 col-sm-10 col-12 order-lg-1 order-md-1  order-sm-2 order-2 mt-5 mb-4"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <p className="font-family " style={{ fontWeight: "700" }}>
                <img
                  src={absteact}
                  alt="logo"
                  style={{ height: "25px", marginRight: "8px" }}
                />{" "}
                About
              </p>
              <h2 className="font-family heading-section-all">
                <span style={{ color: "#FFD119" }}>Trusted </span>{" "}
                <span style={{ color: "#000000" }}>
                  & Certified Legal AI Platform{" "}
                </span>
              </h2>
              <p
                className="font-family about-class"
                style={{ textAlign: "left", color: "#858585" }}
              >
                <span
                  style={{
                    color: "#FFD119",
                    marginRight: "10PX",
                    fontSize: "18PX",
                  }}
                >
                  {" "}
                  Juristbot{" "}
                </span>
                {""}
                Built by Neuronest AI Pvt. Ltd, JuristBot AI is a trusted legal
                AI software India that meets compliance, certification, and data
                security standards. Recognized as a certified legal AI platform,
                JuristBot ensures reliability, accuracy, and ethical use of legal
                software AI for professionals.
              </p>
              <Link to="/register" className="text-decoration-none ">
                <button type="button" className="juristbotAIbutton">
                   Get Started at ₹499 - Get 750 Credits
                </button>
              </Link>
            </div>
            <div
              data-aos="flip-left"
              data-aos-easing="ease-out-cubic"
              data-aos-duration="700"
              className=" col-lg-5 col-md-5 col-sm-12 col-12 order-lg-2 order-md-2  order-sm-1 order-1"
            >
              <Link to="/login">
                {" "}
                <img className="roboatimg" src={robot} alt="robot" />
              </Link>
            </div>
          </div>
        </div>
        <div className="container-main-home">
          <div className="certifications-section">
            {/* Certificates Display */}
            <div className="certificates-carousel" data-aos="fade-up">
              <div className="certificates-wrapper">
                {certificates.map((cert) => (
                  <div key={cert.id} className="certificate-card">
                    <div className="certificate-image-container">
                      <img
                        src={cert.image}
                        alt={cert.alt}
                        className="certificate-image"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="isocertlogo-div">
            <img src={logocert} alt="swiperHead" className="logo-cert-iso" />
          </div>
        </div>
      </section>

      <section id="services" style={{ minHeight: "352px" }} className="py-5">
        <div className="container-main-home">
          <div className="row text-center" style={{ minHeight: "352px" }}>
            <div
              data-aos="zoom-in"
              className="col-sm-10 col-md-12 col-lg-12"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                paddingBottom: "50px",
              }}
            >
              <p className="font-family" style={{ fontWeight: "700" }}>
                <img
                  src={absteact}
                  alt="abstract"
                  style={{ height: "25px", marginRight: "8px" }}
                />{" "}
              </p>
              <h2 className="font-family heading-section-all">
                <span style={{ color: "#FFD119" }}>Advanced AI </span>{" "}
                <span style={{ color: "#000000" }}>
                  Tools for Modern Advocates & Law Firms
                </span>
              </h2>
              <p
                className="font-family about-class pt-3 pb-4"
                style={{ textAlign: "left", color: "#858585" }}
              >
                JuristBot AI empowers advocates, law firms, judges, and police
                officers with advanced AI tools for advocates and AI software for
                law firms. From AI legal research and AI-powered legal drafting
                to judgment analysis and case strategy, JuristBot delivers
                end-to-end Indian legal AI software for smarter legal practice.
              </p>

              <Link to="/register" className="text-decoration-none ">
                <button type="button" className="juristbotAIbutton">
                 Get Started at ₹499 - Get 750 Credits
                </button>
              </Link>
            </div>

            <div className="juristbot-users-section">
              <div className="juristbot-users-container">
                {/* Header */}
                <div data-aos="zoom-in" className=" pt-5 pb-5">
                  <h2 className="font-family heading-section-all juristbot-users-title text-center">
                    <span className="juristbot-users-title-highlight">
                      Why Choose{" "}
                    </span>
                    <span className="juristbot-users-title-text">
                      JuristBot AI?
                    </span>
                  </h2>
                </div>

                <div className="benefits-layout">
                  {/* Top Row - 3 cards */}
                  <div className="benefits-row-first">
                    {benefitsList.slice(0, 3).map((benefit) => (
                      <div key={benefit.id} className="benefit-item">
                        <div className="benefit-icon-container">
                          <span className="benefit-icon-symbol">
                            {benefit.icon}
                          </span>
                        </div>
                        <p className="benefit-description">{benefit.title}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row - 2 cards */}
                  <div className="benefits-row-second">
                    {benefitsList.slice(3, 5).map((benefit) => (
                      <div key={benefit.id} className="benefit-item">
                        <div className="benefit-icon-container">
                          <span className="benefit-icon-symbol">
                            {benefit.icon}
                          </span>
                        </div>
                        <p className="benefit-description">{benefit.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-5">
                  <Link to="/register" className="text-decoration-none ">
                    <button type="button" className="juristbotAIbutton">
                      Get Started at ₹499 - Get 750 Credits
                    </button>
                  </Link>
                </div>
              </div>

              <div className="juristbot-users-container">
                <div data-aos="zoom-in" className=" pt-5 pb-5">
                  <h2 className="font-family heading-section-all juristbot-users-title text-center mb-3">
                    <span className="juristbot-users-title-highlight">
                      Our Powerful{" "}
                    </span>
                    <span className="juristbot-users-title-text">
                      {" "}
                      AI Legal Features
                    </span>
                  </h2>
                  <p>
                    Advanced tools designed for modern advocates and law firms
                  </p>
                </div>
                <div className="demo-feature-grid">
                  {demovideo.map((video, index) => (
                    <div key={video.id} className="demo-feature-card">
                      <div className="demo-feature-content">
                        <div className="demo-feature-category">
                          <h3>
                            <span>
                              <img
                                src={video.icon}
                                className="demo-catagroy-icon"
                                alt="icon"
                              />{" "}
                            </span>{" "}
                            {video.category} -{" "}
                            <span className="demo-feature-card-title">
                              {video.title}
                            </span>
                          </h3>
                        </div>
                        <p className="demo-feature-desc">{video.desc}</p>
                      </div>

                      <div className="demo-feature-media">
                        {playing === video.id ? (
                          <div className="demo-feature-player">
                            <iframe
                              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <button
                            className="demo-feature-thumb"
                            onClick={() => setPlaying(video.id)}
                            aria-label={`Play ${video.title}`}
                          >
                            <img
                              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                              alt={video.title}
                              loading="lazy"
                            />
                            <span className="demo-feature-play-pill">
                              <FontAwesomeIcon icon={faPlay} /> Play
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="juristbot-users-container">
                {/* Header */}
                <div data-aos="zoom-in" className="juristbot-users-header pt-5">
                  <p className="font-family juristbot-users-subtitle">
                    <img
                      src={absteact}
                      alt="abstract"
                      className="juristbot-users-abstract-icon"
                    />
                  </p>
                  <h2 className="font-family heading-section-all juristbot-users-title">
                    <span className="juristbot-users-title-highlight">
                      Who Can{" "}
                    </span>
                    <span className="juristbot-users-title-text">
                      Use JuristBot AI?
                    </span>
                  </h2>
                </div>

                {/* Tagline */}
                <div
                  data-aos="fade-up"
                  className="d-flex justify-content-center align-items-center"
                >
                  <p className="juristbot-users-tagline">
                    Juristbot is a flexible AI software for lawyers and legal
                    professionals at every level.
                  </p>
                </div>

                {/* Cards Grid */}
                <div className="juristbot-users-grid">
                  {/* Top Row - 3 Cards */}
                  <div className="juristbot-users-row-top">
                    {userCategories.slice(0, 3).map((category, index) => (
                      <div
                        key={category.id}
                        className="juristbot-user-card"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                        style={{ backgroundColor: category.bgColor }}
                      >
                        <div
                          className="juristbot-user-card-icon"
                          style={{ color: category.iconColor }}
                        >
                          {category.icon}
                        </div>
                        <h3 className="juristbot-user-card-title">
                          {category.title}
                        </h3>
                        <p className="juristbot-user-card-description">
                          {category.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row - 2 Cards */}
                  <div className="juristbot-users-row-bottom">
                    {userCategories.slice(3, 5).map((category, index) => (
                      <div
                        key={category.id}
                        className="juristbot-user-card"
                        data-aos="fade-up"
                        data-aos-delay={(index + 3) * 100}
                        style={{ backgroundColor: category.bgColor }}
                      >
                        <div
                          className="juristbot-user-card-icon"
                          style={{ color: category.iconColor }}
                        >
                          {category.icon}
                        </div>
                        <h3 className="juristbot-user-card-title">
                          {category.title}
                        </h3>
                        <p className="juristbot-user-card-description">
                          {category.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              data-aos="zoom-out-right"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                marginBottom: "62px",
                marginTop: "62px",
              }}
            >
              <p
                className="font-family"
                style={{
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={absteact}
                  alt="abstract"
                  style={{ height: "25px", marginRight: "8px" }}
                />
                <span>Testimonials</span>
              </p>
              <h2 className="font-family heading-section-all">
                <span style={{ color: "#FFD119" }}>Trusted by </span>
                <span style={{ color: "#000000" }}>
                  Legal Professionals Across India
                </span>
              </h2>
            </div>

            <div className="testimonials-carousel">
              <button className="carousel-button prev" onClick={prevSlidetest}>
                <span>❮</span>
              </button>

              <div className="testimonials-container">
                <div
                  className="testimonials-track"
                  style={{
                    transform: `translateX(-${currentSlide * (100 / 3)}%)`,
                  }}
                >
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="testimonial-card">
                      <div className="quote-icon">
                        <img
                          className="quote-icon-img"
                          src={doublecodes}
                          alt="quote"
                        />
                      </div>
                      <p className="testimonial-text pt-2 pb-2">
                        "{testimonial.text}"
                      </p>
                      <div className="testimonial-author">
                      
                        <div className="author-info">
                          <h4 className="author-name">{testimonial.name}</h4>
                          <p className="author-role">{testimonial.role}</p>
                          <p className="author-role">{testimonial.rating}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="carousel-button next" onClick={nextSlidetest}>
                <span>❯</span>
              </button>
            </div>

            <div
              data-aos="fade-down"
              data-aos-easing="ease-out-cubic"
              data-aos-duration="1000"
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "62px",
                marginTop: "62px",
              }}
            >
              <Link
                to="/cals-certification-lawyers"
                className="text-decoration-none"
              >
                {" "}
                <h2
                  className="font-family"
                  style={{ fontSize: "40px", fontWeight: "600" }}
                >
                  <span style={{ color: "#FFD119" }}>Certified Legal </span>
                  <span style={{ color: "#000000" }}>Experts Using AI</span>
                </h2>
              </Link>
              <p
                className="font-family about-class pt-3 pb-4"
                style={{ textAlign: "center", color: "#858585" }}
              >
                Certified legal professionals trust JuristBot AI as a
                CALS-certified legal AI platform for accurate and dependable
                legal assistance.
              </p>
              <div
                data-aos="fade-up"
                className="d-flex justify-content-center align-items-center"
              >
                <p className="juristbot-users-tagline-cals mb-0">
                  JuristBot AI is trusted as a CALS-certified legal AI platform
                  by professionals across India.
                </p>
              </div>
              <div className="carousel-wrapper mt-5">
                <div className="carousel">
                  {profiles
                    .slice(startIndex, startIndex + visibleCards)
                    .map((profile, index) => (
                      <div key={profile.id} className="card-cals ">
                        <div className="profile-img-wrapper">
                          <img
                            src={
                              profile.profile_img
                                ? profile.profile_img
                                : defaultimg
                            }
                            alt="img"
                            className="profile-img"
                          />
                          <span>
                            {" "}
                            <img
                              src={badge}
                              alt="verified"
                              className="badge-icon"
                            />
                          </span>
                        </div>
                        <p className="mb-2 cals-lawyer-name">
                          {profile.username}
                        </p>
                        <p className="role-cals mb-2">
                          {profile.law_category
                            ? `${profile.law_category}`
                            : `${profile.role}`}
                        </p>
                        <span className="city-cals ">
                          {profile.town || "N/A"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              <div className=" d-flex justify-content-end mt-4 ">
                <button className="carousel-btn  ms-2" onClick={nextSlide}>
                  <FontAwesomeIcon icon={faLeftLong} />
                </button>
                <button className="carousel-btn  ms-2" onClick={prevSlide}>
                  <FontAwesomeIcon icon={faRightLong} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-3 ">
        <div data-aos="zoom-in-up">
          <div className="container-main-home text-center">
            <h2 className="font-family heading-section-all">
              <span style={{ color: "#FFD119" }}>Simple </span>
              <span style={{ color: "#000000" }}>
                & Transparent Legal AI Pricing
              </span>
            </h2>
            <p
              className="font-family about-class"
              style={{ textAlign: "center", color: "#858585" }}
            >
              Flexible and affordable pricing plans for individuals, advocates,
              and law firms using legal AI software in India. JuristBot AI is
              built to scale with your legal needs, whether you need quick legal
              assistance, advanced AI legal research, expert AI legal drafting,
              or detailed case analysis.
            </p>
          </div>
          <div className="">
            <Prcing />
          </div>
        </div>
      </section>

      <div className="faq-container">
        <div className="text-center py-5">
          <h2
            className="font-family"
            style={{ fontSize: "40px", fontWeight: "600" }}
          >
            <span style={{ color: "#FFD119" }}>Frequently </span>
            <span style={{ color: "#000000" }}>
              Asked Questions About JuristBot AI
            </span>
          </h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div
                onClick={() => toggleFAQ(index)}
                className="faq-question-button"
                aria-expanded={openIndex === index}
              >
                <h4 className="faq-question-text mb-0">{faq.question}</h4>
                <FontAwesomeIcon
                  icon={openIndex === index ? faChevronUp : faChevronDown}
                  className="faq-icon"
                />
              </div>

              <div
                className={`faq-answer-container ${
                  openIndex === index ? "open" : ""
                }`}
              >
                <p className="faq-answer-text">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="py-5 " style={{ backgroundColor: "#0E0E0E" }}>
        <div data-aos="zoom-in-up" className="container-main-home">
          <div className="text-center py-5">
            {/* Main Headline */}
            <h2 className="font-family heading-section-all">
              <span style={{ color: "#FFD119" }}>Start Your</span>
              <span style={{ color: "#fff6f6" }}>
                {" "}
                Smarter Legal Journey with AI Today
              </span>
            </h2>

            {/* Subheadline */}
            <p
              className=" mb-4 px-md-5"
              style={{
                color: "#ffffff",
                fontSize: "18px",
                textAlign: "center",
              }}
            >
              Experience faster, smarter, and more accurate AI legal research and
              AI legal drafting with JuristBot AI, the next-generation legal AI
              software for Indian lawyers. Reduce manual effort, improve
              accuracy, and focus more on winning cases with confidence.
            </p>

            {/* Secondary Headline */}
            <p className=" text-warning mb-4">
              Step into the future of legal AI software in India.
            </p>

            {/* CTA Button */}
            <Link to="/register" className="text-decoration-none ">
              <button type="button" className="juristbotAIbutton">
                Get Started at ₹499 - Get 750 Credits
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-5 pb-5">
        <ContactForm data-aos="zoom-in-down" />
      </section>

     <sectio id='footer'>
      <Footer />
     </sectio>
    </div>
  );
};

export default LandingPage;