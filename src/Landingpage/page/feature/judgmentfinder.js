import React, { useState, useEffect,useRef  } from "react";
import logoImage from "../../assetes/images/logojuristbot.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBars, faXmark,faArrowRight,faPlus} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./Judgmentfinder.css";
import fileview from './docs/file.svg';
import audImg1 from './docs/aud1.jpg';
import audImg2 from './docs/aud2.jpg';
import audImg3 from './docs/aud3.jpg';
import audImg4 from './docs/aud4.jpg';
import robotQ from './docs/robotquestion.jpg';
import faqImg from './docs/faqimg.jpg';


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

const searchTopics = [
  "Indian case law",
  "Supreme Court judgments",
  "High Court judgments",
  "Relevant judicial decisions",
  "Legal issues",
  "Previous case decisions",
  "Legal precedents",
];


const finderSteps = [
  { no: "1", title: "Find Relevant Judgments",
    text: "Explore judicial decisions related to the legal issue you are researching." },
  { no: "2", title: "Make Case Law Research Faster",
    text: "Reduce some of the repetitive searching involved in finding potentially relevant authorities." },
  { no: "3", title: "Explore Legal Precedents",
    text: "Identify previous decisions that may be useful for understanding a legal issue or preparing a case." },
  { no: "4", title: "Support Case Preparation",
    text: "Use relevant judgments as part of your wider legal research and case preparation process." },
];

const finderAudience = [
  { img: audImg1, title: "Advocates & Lawyers",
    text: "Research case law and judgments while preparing matters." },
  { img: audImg2, title: "Law Firms",
    text: "Give legal teams an additional tool for judgment discovery and case research." },
  { img: audImg3, title: "Legal Researchers",
    text: "Explore Indian judicial decisions and identify areas for further research." },
  { img: audImg4, title: "Law Students",
    text: "Find judgments and case law while studying Indian legal topics." },
];

const whyCaps = [
  "AI Legal Research",
  "AI Legal Drafting",
  "Scenario Solver",
  "AI Cross Examination",
];

const whyFlow = [
  "Finding a Judgement",
  "Researching the Issue",
  "Analyzing the case",
  "Preparing Legal Documents within one Legal AI Platform",
];


const scFaqs = [
  { q: "What is a Judgment Finder?",
    a: "A Judgment Finder is a tool that helps users search for and discover potentially relevant judicial decisions and judgments related to a legal issue." },
  { q: "Can JuristBot find Indian judgments?",
    a: "JuristBot provides AI-assisted judgment discovery for Indian legal research, including research involving relevant judicial decisions." },
  { q: "Can I search Supreme Court and High Court judgments?",
    a: "JuristBot is designed to support Indian legal research and judgment discovery. Always review the original judgment and authoritative source before relying on it." },
  { q: "How does AI help with case law search?",
    a: "AI can help users explore legal questions and identify potentially relevant judgments, making the initial case law research process more efficient." },
  { q: "Is JuristBot a replacement for legal research?",
    a: "No. JuristBot is an AI assistance tool. Legal professionals should independently review and verify judgments, citations and legal information." },
];


function Judgmentfinder() {
const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
    <div className="sc-solver-container ">
      <div className="container-fluid"><Navbar /></div>
      <div className="container-main-sc-solver">
  <section className="sc-hero">
    <h1 className="sc-hero-title">
      AI Judgment Finder for
      <span className="sc-hero-highlight">Indian Case Law</span>
    </h1>

    <p className="sc-hero-text">
      Finding the right judgment can take time. Lawyers and advocates often need to
      search through previous decisions, compare cases and identify judgments that are
      relevant to the legal issue they are working on.
    </p>
    <p className="sc-hero-text">
      JuristBot's Judgment Finder helps make this process easier with AI-assisted case
      law search designed for Indian legal research.
    </p>
    <p className="sc-hero-text">
      Search for judgments related to your legal issue, explore potentially relevant
      case law and use the results as a starting point for deeper legal research.
    </p>

    <Link to="/login" className="sc-hero-btn">
      Find relevant judgments faster with JuristBot AI
      <FontAwesomeIcon icon={faArrowRight} className="sc-hero-btn-icon" />
    </Link>
  </section>
</div>
    </div>

    <section className="sc-search">
  <div className="sc-search-head">
    <h2 className="sc-search-title">
      Search <span>Indian Case Law</span> With AI
    </h2>
    <p className="sc-search-sub">
      Legal research often depends on finding the right judicial decisions.
      Instead of spending hours trying different search terms, JuristBot allows legal
      professionals to use AI assistance to explore case-related queries and discover
      potentially relevant judgments. It can support research involving:
    </p>
  </div>

  <ul className="sc-search-list">
    {searchTopics.map((topic) => (
      <li key={topic} className="sc-search-pill">
        <span className="sc-search-icon">
          <img src={fileview} alt="" />
        </span>
        <span>{topic}</span>
      </li>
    ))}
  </ul>

  <p className="sc-search-note">
    The results should always be reviewed against the original judgment and
    authoritative legal sources before being relied upon in professional legal work.
  </p>
</section>
<section className="sc-helps">
  <div className="sc-helps-head">
    <h2 className="sc-helps-title">
      How JuristBot <span>Judgment Finder Helps</span>
    </h2>
  </div>

  <div className="sc-helps-grid">
    {finderSteps.map((s) => (
      <article key={s.no} className="sc-help-card">
        <span className="sc-help-no">{s.no}</span>
        <span className="sc-help-icon">
          <img src={fileview} alt="" />
        </span>
        <h3>{s.title}</h3>
        <p>{s.text}</p>
      </article>
    ))}
  </div>
</section>

<section className="sc-audience">
  <div className="sc-audience-head">
    <h2 className="sc-audience-title">
      Who Can Use <span>Judgment Finder?</span>
    </h2>
  </div>

  <div className="sc-audience-grid">
    <div className="sc-audience-cards">
      {finderAudience.map((c) => (
        <article key={c.title} className="sc-aud-card">
          <span className="sc-aud-avatar">
            <img src={c.img} alt="" />
          </span>
          <h3>{c.title}</h3>
          <p>{c.text}</p>
        </article>
      ))}
    </div>

    <div className="sc-audience-img">
      <img src={robotQ} alt="JuristBot judgment finder" />
    </div>
  </div>
</section>

<section className="sc-why">
  <div className="sc-why-head">
    <h2 className="sc-why-title">
      Why Use <span>JuristBot?</span>
    </h2>
    <p className="sc-why-sub">
      JuristBot brings judgment discovery together with other AI-powered legal tools,
      including:
    </p>
  </div>

  <ul className="sc-why-caps">
    {whyCaps.map((c) => (
      <li key={c} className="sc-why-cap">
        <span className="sc-why-cap-icon">
          <img src={fileview} alt="" />
        </span>
        <span>{c}</span>
      </li>
    ))}
  </ul>

  <div className="sc-why-flow">
    {whyFlow.map((step, i) => (
      <React.Fragment key={step}>
        <div className="sc-why-circle">
          <span>{step}</span>
        </div>
        {i < whyFlow.length - 1 && (
          <span className="sc-why-arrow">
            <FontAwesomeIcon icon={faArrowRight} />
          </span>
        )}
      </React.Fragment>
    ))}
  </div>
</section>
<section className="sc-faq">
  <div className="sc-faq-card">
    <div className="sc-faq-left">
      <span className="sc-faq-eyebrow">● FAQ</span>
      <h2 className="sc-faq-title">Frequently Asked Questions</h2>
      <div className="sc-faq-img">
        <img src={faqImg} alt="" />
      </div>
    </div>

    <div className="sc-faq-right">
      <div className="sc-faq-list">
        {scFaqs.map((item, i) => {
          const isOpen = openFaq === i;
          return (
            <div key={i} className={`sc-faq-item ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="sc-faq-q"
                onClick={() => setOpenFaq(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <FontAwesomeIcon icon={isOpen ? faXmark : faPlus} className="sc-faq-ic" />
              </button>
              <div className="sc-faq-a"><p>{item.a}</p></div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</section>
<section className="sc-cta">
  <div className="sc-cta-banner">
    <div className="sc-cta-content">
      <h2 className="sc-cta-title">Find Relevant Case Law With JuristBot</h2>
      <p className="sc-cta-text">
        Spend less time searching and more time understanding the judgments that matter
        to your case.
      </p>
      <div className="sc-cta-btns">
        <Link to="/register" className="sc-cta-btn sc-cta-btn--primary">
                Get Started for Free trial
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
        <Link to="/register" className="sc-cta-btn sc-cta-btn--ghost">
          Explore JuristBot AI
        </Link>
      </div>
    </div>

    <span className="sc-cta-circle sc-cta-circle--1" />
    <span className="sc-cta-circle sc-cta-circle--2" />
  </div>
</section>
    </>
  );
}

export default Judgmentfinder;