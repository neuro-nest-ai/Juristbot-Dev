import React, { useState, useEffect, useRef } from "react";
import logoImage from "../../assetes/images/logojuristbot.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark,faArrowRight,faStar,faBalanceScale, faUserTie, faMagnifyingGlass, faGraduationCap,faPlus,faMinus,
  faUser, faGavel} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./solver.css";
import analysisImg from './docs/scanalysis.jpg';
import fileview from './docs/file.svg';


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

const scenarioQuestions = [
  "What legal provisions may be relevant to a situation?",
  "Which sections of Indian law may need to be examined?",
  "What legal issues arise from the facts?",
  "What areas require further legal research?",
  "What information or authorities may be relevant to the matter?",
];

const supportCards = [
  { no: "01", title: "Explore Complex Cases",
    text: "Break down a legal situation into its key facts and issues and use AI assistance to explore possible areas of concern." },
  { no: "02", title: "Identify Relevant Legal Provisions",
    text: "Understand which Acts, sections or provisions may be relevant to the scenario and require further examination." },
  { no: "03", title: "Find Areas for Further Research",
    text: "Use the analysis as a starting point for deeper legal research and case law search." },
  { no: "04", title: "Support Legal Strategy",
    text: "Scenario analysis can help professionals identify questions and issues that may need to be considered while preparing a matter." },
];

const solverAudience = [
  { icon: faBalanceScale, tone: "indigo", title: "Advocates",
    text: "Explore case scenarios and identify legal issues during case preparation." },
  { icon: faUserTie, tone: "teal", title: "Law Firms",
    text: "Give legal teams an additional AI tool for analyzing complex legal situations." },
  { icon: faMagnifyingGlass, tone: "pink", title: "Legal Researchers",
    text: "Use scenario-based analysis to explore legal questions and identify areas for further research." },
  { icon: faGraduationCap, tone: "blue", title: "Law Students",
    text: "Work through legal scenarios as part of learning and understanding Indian law." },
];


const solverTools = [
  { no: "01", tone: "indigo", icon: faUser, title: "Scenario Solver",
    text: "Explore the legal situation" },
  { no: "02", tone: "green", icon: faMagnifyingGlass, title: "AI Legal Research",
    text: "Research the relevant Legal Research" },
  { no: "03", tone: "purple", icon: faGavel, title: "Judgement Finder",
    text: "Find potentially relevant judgments" },
  { no: "04", tone: "gold", icon: faBalanceScale, title: "AI Legal Drafting",
    text: "Prepare the required document" },
];

const solverFaqs = [
  { q: "What is Scenario Solver?",
    a: "Scenario Solver is an AI-powered legal case analysis tool that helps users explore legal situations, issues and potentially relevant Indian laws and provisions." },
  { q: "How does AI legal case analysis work?",
    a: "Users provide information about a legal situation, and AI can assist in exploring the facts, possible legal issues and areas that may require further research." },
  { q: "Can Scenario Solver analyze Indian legal scenarios?",
    a: "JuristBot's Scenario Solver is designed around Indian legal use cases and can assist users in exploring scenarios involving Indian laws and legal provisions." },
  { q: "Can Scenario Solver replace a lawyer?",
    a: "No. It is an AI assistance tool for research and case preparation. The final legal analysis and professional judgment remain with the qualified legal professional." },
  { q: "Who can use Scenario Solver?",
    a: "Advocates, lawyers, law firms, legal researchers and law students can use Scenario Solver for exploring legal situations and supporting their research." },
];

const Scenasirosolver = () => {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <>
    <div className="jd-container">
      <div className="container-fluid"><Navbar /></div>
      <div className="container-main-jd-solver">
        <section className="jd-hero">
          <h1 className="jd-hero-title">
            AI Legal Case 
            <span className="sc-hero-highlight">Analysis & Scenario Solver</span>
          </h1>

          <p className="jd-hero-text">
            Every legal matter has its own set of facts, circumstances and questions. Understanding how the relevant law may apply to a particular situation often requires careful research and analysis.
          </p>
          <p className="jd-hero-text">
            JuristBot's Scenario Solver is an AI-powered legal case analysis tool designed to help legal professionals explore complex legal situations using Indian laws and legal provisions
          </p>
          <p className="jd-hero-text">
            Describe a legal scenario, provide the relevant details and use AI assistance to explore the legal issues, applicable provisions and possible areas for further research.
          </p>

          <Link to="/login" className="jd-hero-btn">
            Explore your legal scenario with JuristBot AI.
          </Link>
        </section>
      </div>
    </div>
    <section className="jd-about">
  <div className="jd-about-inner">
    <div className="jd-about-text">
      <h2 className="jd-about-title">
        What Is <span>AI Legal Case Analysis?</span>
      </h2>

      <p>
        AI legal case analysis uses artificial intelligence to assist with examining a
        legal situation based on the information provided.
      </p>
      <p>
        A lawyer may have the facts of a matter but still need to identify which laws,
        sections or legal issues require closer examination. Scenario-based AI can
        provide a structured starting point for this process.
      </p>
      <p>
        JuristBot's Scenario Solver allows users to describe a legal situation and
        explore it through an AI-powered legal analysis process.
      </p>
      <p>
        The output is intended to support research and case preparation. It should not be
        treated as a final legal opinion or a substitute for professional legal judgment.
      </p>
    </div>
  </div>
</section>
<section className="jd-about">
  <div className="jd-about-grid">
    <div className="jd-about-img">
      <img src={analysisImg} alt="AI legal case analysis" />
    </div>

    <div className="jd-about-text">
      <h2 className="jd-about-title">
        What Is <span>AI Legal Case Analysis?</span>
      </h2>

      <p>
        AI legal case analysis uses artificial intelligence to assist with examining a
        legal situation based on the information provided.
      </p>
      <p>
        A lawyer may have the facts of a matter but still need to identify which laws,
        sections or legal issues require closer examination. Scenario-based AI can
        provide a structured starting point for this process.
      </p>
      <p>
        JuristBot's Scenario Solver allows users to describe a legal situation and
        explore it through an AI-powered legal analysis process.
      </p>
      <p>
        The output is intended to support research and case preparation. It should not be
        treated as a final legal opinion or a substitute for professional legal judgment.
      </p>
    </div>
  </div>
</section>
<section className="jd-analyze">
  <div className="jd-analyze-inner">
    <h2 className="jd-analyze-title">
      <span>Analyze</span> Legal Scenarios With AI
    </h2>
    <p className="jd-analyze-sub">
      Scenario Solver can help legal professionals explore questions such as:
    </p>

    <ul className="jd-analyze-list">
      {scenarioQuestions.map((q) => (
        <li key={q}>
          <FontAwesomeIcon icon={faStar} className="jd-analyze-star" />
          <span>{q}</span>
        </li>
      ))}
    </ul>

    <p className="jd-analyze-text">
      For example, a lawyer handling a dispute can describe the facts and circumstances
      of the matter and use Scenario Solver to identify potential legal issues and areas
      that may require deeper research.
    </p>
    <p className="jd-analyze-text">
      The lawyer can then verify the applicable provisions, research relevant case law
      and make the final assessment.
    </p>
  </div>
</section>
{/* SUPPORT CASE PREPARATION */}
<section className="jd-support">
  <div className="jd-support-head">
    <h2 className="jd-support-title">
      How Scenario Solver Can
      <span>Support Case Preparation</span>
    </h2>
  </div>

  <div className="jd-support-grid">
    {supportCards.map((c) => (
      <article key={c.no} className="jd-support-card">
        <div className="jd-support-no"><span>{c.no}</span></div>
        <div className="jd-support-cardhead">
          <span className="jd-support-icon">
            <img src={fileview} alt="" />
          </span>
          <h3>{c.title}</h3>
        </div>
        <p>{c.text}</p>
      </article>
    ))}
  </div>
</section>

{/* WHO CAN USE */}
<section className="jd-audience">
  <div className="jd-audience-head">
    <h2 className="jd-audience-title">
      Who Can Use JuristBot
      <span>Scenario Solver?</span>
    </h2>
  </div>

  <div className="jd-audience-grid">
    {solverAudience.map((c) => (
      <article key={c.title} className={`jd-aud-card jd-aud-card--${c.tone}`}>
        <span className="jd-aud-icon">
          <FontAwesomeIcon icon={c.icon} />
        </span>
        <h3>{c.title}</h3>
        <span className="jd-aud-line" />
        <p>{c.text}</p>
      </article>
    ))}
  </div>
</section>
<section className="jd-toolsfaq">
  <div className="jd-toolsfaq-grid">
    {/* LEFT: tools */}
    <div className="jd-tools">
      <h2 className="jd-tools-title">
        Scenario Solver and<br />
        Other <span>JuristBot</span> Tools
      </h2>
      <p className="jd-tools-sub">
        Scenario Solver works alongside JuristBot's other legal AI capabilities.
      </p>
      <p className="jd-tools-flow">A typical workflow could involve:</p>

      <div className="jd-tools-grid">
        {solverTools.map((t) => (
          <article key={t.no} className={`jd-tool-card jd-tool-card--${t.tone}`}>
            <span className="jd-tool-no">{t.no}</span>
            <span className="jd-tool-icon">
              <FontAwesomeIcon icon={t.icon} />
            </span>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
          </article>
        ))}
      </div>

      <p className="jd-tools-note">
        This allows legal professionals to use different tools depending on the stage of
        their work.
      </p>
    </div>

    {/* RIGHT: FAQ */}
    <div className="jd-faq-card">
      <h2 className="jd-faq-title">FAQ</h2>

      <div className="jd-faq-list">
        {solverFaqs.map((item, i) => {
          const isOpen = openFaq === i;
          return (
            <div key={i} className={`jd-faq-item ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="jd-faq-q"
                onClick={() => setOpenFaq(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} className="jd-faq-ic" />
              </button>
              <div className="jd-faq-a"><p>{item.a}</p></div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</section>
<section className="jd-cta">
  <div className="jd-cta-banner">
    <div className="jd-cta-content">
      <h2 className="jd-cta-title">
        Explore Your Legal<br />
        Scenario With <span>JuristBot</span>
      </h2>
      <p className="jd-cta-lead">Have a complex legal situation to examine?</p>
      <p className="jd-cta-text">
        Use JuristBot's Scenario Solver to explore the legal issues, identify areas for
        further research and support your case preparation with AI assistance.
      </p>
      <Link to="/register" className="jd-cta-btn">
        Start Your Free Trial
        <FontAwesomeIcon icon={faArrowRight} />
      </Link>
    </div>
  </div>
</section>
</>
  )
}

export default Scenasirosolver
