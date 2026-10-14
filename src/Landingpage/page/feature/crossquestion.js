import React, { useState, useEffect, useRef } from "react";
import logoImage from "../../assetes/images/logojuristbot.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faArrowRight, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./crossquession.css";
import chatImg from './docs/crosschat.jpg';
import heroBot from './docs/crossbot.jpg';
import assistBot from './docs/crossrobot.jpg';
import fileview from './docs/file.svg';
import connectImg from './docs/connectImg.jpg';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const panelRef = useRef(null);
  const togglerRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        togglerRef.current && !togglerRef.current.contains(e.target)
      ) setIsMenuOpen(false);
    };
    const handleEsc = (e) => { if (e.key === "Escape") setIsMenuOpen(false); };
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
                <a className="nav-link" href={href} onClick={closeMenu}>{label}</a>
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

const turnPoints = [
  "Generate AI Cross Questions",
  "Explore different lines of questioning",
  "Identify inconsistencies in statements",
  "Look at the case from different perspectives",
  "Find areas that may need further clarification",
  "Prepare questions before a hearing or trial",
];

const crossAudience = [
  "Advocates",
  "Lawyers",
  "Litigation Teams",
  "Legal Practitioners",
  "Legal Consultants",
  "Law Firm Professionals",
  "Legal researchers",
];

const crossFaqs = [
  { q: "What is an AI cross-examination tool?",
    a: "An AI cross-examination tool uses artificial intelligence to assist lawyers in preparing and exploring possible questions based on case information, statements, and other details provided by the user." },
  { q: "Can lawyers use AI for cross-examination preparation?",
    a: "Yes. AI can be used as a preparation tool to generate possible questions, explore different lines of questioning, and review case information. The final questions and strategy should be decided by the lawyer." },
  { q: "Can JuristBot generate cross-examination questions?",
    a: "Yes. JuristBot can generate potential cross-examination questions based on the case information you provide. The questions can then be reviewed and adapted according to the specific case." },
  { q: "Is JuristBot designed for Indian legal professionals?",
    a: "Yes. JuristBot is built for legal professionals working with Indian legal matters and provides multiple AI-powered tools for legal research, drafting, judgment discovery, case analysis, and cross-examination preparation." },
];

const Crossquestion = () => {
  return (
    <>
      <div className="crossqu-container">
        <div className="container-fluid"><Navbar /></div>
        <div className="container-main-crossqu">
          <section className="cq-hero">
            <div className="cq-hero-left">
              <span className="cq-badge">AI Cross Examination</span>
              <h1 className="cq-hero-title">
                AI Cross Examination
                <span className="cq-hero-highlight">Tool for Indian Lawyers</span>
              </h1>
              <p className="cq-hero-text">
                Cross-examination needs preparation. You need to understand the witness, go
                through the facts, identify inconsistencies, and decide what questions need to
                be asked.
              </p>
              <p className="cq-hero-text">
                JuristBot's AI Cross Examination tool gives lawyers a practical starting point
                for preparing cross-examination questions based on the case details they provide.
              </p>
              <Link to="/login" className="cq-hero-btn">
                Start Generating Questions
                <FontAwesomeIcon icon={faArrowRight} className="cq-hero-btn-icon" />
              </Link>
              <div className="cq-hero-bot">
                <img src={heroBot} alt="" />
              </div>
            </div>
            <div className="cq-hero-right">
              <img src={chatImg} alt="JuristBot cross examination assistant" />
            </div>
          </section>
        </div>
      </div>

      {/* PREPARE */}
      <section className="cq-prepare">
        <div className="cq-prepare-inner">
          <div className="cq-prepare-head">
            <span className="cq-eyebrow">The Preparation Problem</span>
            <h2 className="cq-h2">
              Prepare <span>Cross Examination Questions</span> With AI
            </h2>
          </div>
          <div className="cq-prepare-cols">
            <div className="cq-prepare-col">
              <span className="cq-col-mark" />
              <p>Preparing questions for cross-examination can take considerable time, especially when you are working through lengthy case documents and statements.</p>
            </div>
            <div className="cq-prepare-col">
              <span className="cq-col-mark" />
              <p>JuristBot can help you generate relevant questions from the information you provide — explore different aspects of the case, review the witness's statements, and identify areas that may require further examination.</p>
            </div>
            <div className="cq-prepare-col">
              <span className="cq-col-mark" />
              <p>The questions generated by AI are a starting point. You review, modify, and select the questions relevant to your case and strategy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TURN */}
      <section className="cq-turn">
        <div className="cq-turn-head">
          <span className="cq-eyebrow cq-eyebrow--c">The Workflow</span>
          <h2 className="cq-h2">
            Turn Case Details Into <span>Relevant Questions</span>
          </h2>
          <p className="cq-lead">
            Every case is different. The right questions depend on the facts, evidence and
            circumstances involved. Provide the case information and use AI to explore possible
            lines of questioning.
          </p>
        </div>
        <div className="cq-turn-grid">
          {turnPoints.map((point, i) => (
            <article key={point} className="cq-turn-card">
              <span className="cq-turn-no">{String(i + 1).padStart(2, "0")}</span>
              <p>{point}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ASSIST */}
      <section className="cq-assist">
        <div className="cq-assist-grid">
          <div className="cq-assist-text">
            <span className="cq-eyebrow">Faster Preparation</span>
            <h2 className="cq-h2">
              AI Assistance for <span>Cross Examination Preparation</span>
            </h2>
            <p>AI does not replace the lawyer's understanding of the case. It simply makes the preparation process faster.</p>
            <p>Use JuristBot to generate an initial set of questions, review the responses, and refine them based on your legal strategy and the facts of the case.</p>
            <p>Particularly useful when you need to prepare for a case within a limited amount of time.</p>
          </div>
          <div className="cq-assist-img">
            <img src={assistBot} alt="JuristBot cross examination assistant" />
          </div>
        </div>
      </section>

      {/* WHO CAN USE */}
      <section className="cq-audience">
        <div className="cq-audience-head">
          <span className="cq-eyebrow cq-eyebrow--c">Who It's For</span>
          <h2 className="cq-h2">
            Who Can Use <span>JuristBot's AI</span> Cross Examination Tool?
          </h2>
          <p className="cq-lead">
            Designed for legal professionals involved in case preparation:
          </p>
        </div>
        <ul className="cq-chips">
          {crossAudience.map((item) => (
            <li key={item} className="cq-chip">
              <span className="cq-chip-ic"><img src={fileview} alt="" /></span>
              {item}
            </li>
          ))}
        </ul>
        <p className="cq-note">
          Whether you are preparing questions for a witness or reviewing an existing case,
          JuristBot gives you a structured starting point.
        </p>
      </section>

      {/* CONNECT */}
      <section className="cq-connect">
        <div className="cq-connect-grid">
          <div className="cq-connect-img">
            <img src={connectImg} alt="" />
          </div>
          <div className="cq-connect-text">
            <span className="cq-eyebrow">One Platform</span>
            <h2 className="cq-h2">
              Connect Cross Examination With Your Other <span>Legal Work</span>
            </h2>
            <p>Cross-examination preparation is only one part of preparing a case.</p>
            <p>You may also need to research case law, understand relevant legal provisions, find supporting judgments, analyse the legal scenario, and prepare documents.</p>
            <p>JuristBot brings these AI-powered legal tools together in one platform — move from legal research and case analysis to drafting and cross-examination without switching tools.</p>
          </div>
        </div>
      </section>

      {/* WHY + FAQ */}
      <section className="cq-faqwrap">
        <div className="cq-why">
          <span className="cq-eyebrow cq-eyebrow--c">The Advantage</span>
          <h2 className="cq-h2">Why Use <span>AI</span> for Cross Examination?</h2>
          <p className="cq-lead">
            The main advantage is simple: less time spent starting from a blank page. Instead of
            manually thinking through every possible question, use AI to explore potential
            questions and lines of examination — while you remain in control of the final
            questions and legal strategy.
          </p>
        </div>
        <div className="cq-faq">
          <h3 className="cq-faq-title">Frequently Asked Questions</h3>
          <div className="cq-faq-grid">
            {crossFaqs.map((item, i) => (
              <div key={i} className="cq-faq-item">
                <FontAwesomeIcon icon={faCircleCheck} className="cq-faq-ic" />
                <div>
                  <h4>{item.q}</h4>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cq-cta">
        <div className="cq-cta-banner">
          <h2 className="cq-cta-title">Prepare Smarter With JuristBot AI</h2>
          <p className="cq-cta-text">
            Spend less time starting your cross-examination preparation from scratch. Explore
            questions, analyse case information, and prepare more efficiently.
          </p>
          <Link to="/register" className="cq-cta-btn">Start using JuristBot AI today</Link>
        </div>
      </section>
    </>
  );
};

export default Crossquestion;