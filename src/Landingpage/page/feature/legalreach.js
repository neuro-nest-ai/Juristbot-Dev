import React, { useState, useEffect,useRef  } from "react";
import logoImage from "../../assetes/images/logojuristbot.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBars, faXmark, faArrowRight, faCirclePlay, faPlay, faQuoteLeft, faBullseye,
  faClock, faCommentDots, faGear,  faMagnifyingGlass,faBalanceScale, faGavel, faBuilding, faMicroscope,faCircleCheck,faPlus,
  faUsers, faUserGraduate} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./legalreach.css";
import faComments from './docs/key1.svg';
import faFileLines from './docs/key2.svg';
import faBookOpen from './docs/key3.svg'
import faBolt from './docs/key4.svg'
import greentick from './docs/greentick.svg';
import xmark from './docs/xmark.svg';
import xtick from './docs/x-tick.svg';
import brain from './docs/brain.svg'
import book from './docs/book.svg'
import pagebooks from './docs/pagebooks.svg'
import search from './docs/search.svg'
import chain from './docs/chain.svg'
import supprotingcase from "./docs/supprotingcase.svg";
import searchCaseImg from './docs/searchcase.jpg';


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

const VIDEO_ID = "BKSQ5kmj3q4";

const benefits = [
  { icon: faComments,  title: "Natural Language Queries", text: "Ask complex legal questions in simple language." },
  { icon: faFileLines, title: "Relevant Judgements",      text: "Find the most applicable case law." },
  { icon: faBookOpen,  title: "Acts & Sections",          text: "Understand relevant laws and judgements." },
  { icon: faBolt,      title: "Faster Initial Research",  text: "Get to useful information more quickly." },
];


const lawTags = [
  { label: "Case Law",                             left: 58,   top: 8  },
  { label: "Supreme Court Judgements",             left: 70,   top: 13 },
  { label: "Indian laws and legal provisions",     left: 33,   top: 21 },
  { label: "High Court Judgements",                left: 75,   top: 29 },
  { label: "Acts and Sections",                    left: 35,   top: 43 },
  { label: "Legal Precedents",                     left: 79,   top: 50 },
  { label: "Relevant Judgements",                  left: 35.5, top: 63 },
  { label: "Specific Legal Issues",                left: 77,   top: 72 },
  { label: "Case-related questions",               left: 38.5, top: 85 },
  { label: "Areas requiring further legal research", left: 68, top: 87 },
]

const helpItems = [
  { icon: search,    label: "Find Relevant Judgements" },
  { icon: pagebooks, label: "Researching Legal Issues" },
  { icon: chain,     label: "Understanding Laws Sections" },
  { icon: book,      label: "Exploring Case Law" },
  { icon: supprotingcase,      label: "Supporting Case Preparation" }, // swap null for your target.svg when you have it
];

const benefitCards = [
  {
    no: "02", icon: faFileLines, tone: "gray",
    title: "Find Potentially Relevant Authorities",
    paras: [
      "The challenge in legal research is often not finding something related to a topic. It is finding material that is actually relevant to the issue.",
      "AI-assisted research can help identify potentially relevant judgments, case law and legal information for further examination.",
    ],
  },
  {
    no: "03", icon: faCommentDots, tone: "purple",
    title: "Make Case Law Research More Focused",
    paras: [
      "When researching a complex issue, the ability to start with a description of the problem can make the research process more intuitive.",
      "Instead of relying entirely on exact keyword combinations, lawyers can use natural-language questions to explore a legal topic.",
    ],
  },
  {
    no: "04", icon: faGear, tone: "green",
    title: "Reduce Repetitive Research Work",
    paras: [
      "Searching, filtering and reviewing information can involve repetitive work.",
      "AI can assist with parts of this process while the legal professional remains responsible for reviewing and verifying the information.",
    ],
  },
  {
    no: "05", icon: faCommentDots, tone: "gold", featured: true,
    title: "Make Case Law Research More Focused",   // ⚠ duplicate of 03 in the design — replace with the real 05 content
    paras: [
      "When researching a complex issue, the ability to start with a description of the problem can make the research process more intuitive.",
      "Instead of relying entirely on exact keyword combinations, lawyers can use natural-language questions to explore a legal topic.",
    ],
  },
];

const tradPoints = [
  "Relies heavily on manual keyword searches",
  "Requires extensive manual filtering",
  "Can involve reviewing large volumes of information",
  "Related authorities may need to be found manually",
  "Lawyer spends more time on initial information discovery",
];

const aiPoints = [
  "Allows natural-language research queries",
  "Helps identify potential research directions",
  "Can help narrow the initial research process",
  "AI can assist in identifying potentially relevant authorities",
  "Lawyer can spend more time reviewing and evaluating relevant material",
];

const audienceCards = [
  { icon: faBalanceScale, title: "Advocates",
    text: "Use AI-assisted research to explore legal issues, case law and relevant judgments while preparing matters." },
  { icon: faGavel, title: "Lawyers",
    text: "Research Indian laws, legal provisions and judicial authorities as part of day-to-day legal work." },
  { icon: faBuilding, title: "Law Firms",
    text: "Give legal teams an additional research tool for exploring case-related questions and preparing matters." },
  { icon: faMicroscope, title: "Legal Researchers",
    text: "Use AI-assisted research to explore legal topics and identify areas for deeper investigation." },
  { icon: faUsers, title: "Corporate Legal Teams",
    text: "Research legal questions and relevant authorities that arise during corporate and business activities." },
  { icon: faUserGraduate, title: "Legal Students",
    text: "Use JuristBot as a learning and research aid while studying Indian law and developing legal research skills." },
];


const commonTasks = [
  ["Finding potentially relevant case law", "Researching specific Acts and sections"],
  ["Researching a legal issue", "Preparing for a case"],
  ["Exploring Indian case law", "Understanding a legal question"],
  ["Finding supporting judgments", "Identifying areas that require further research"],
  ["Reviewing relevant legal provisions", "Exploring Supreme Court and High Court judgments"],
  ["Exploring legal precedents", null],
];

const keyAreas = [
  ["AI-assisted legal research", "Case analysis"],
  ["Indian legal research", "Legal drafting"],
  ["Judgment discovery", "Cross-question preparation"],
];

const faqs = [
  { q: "What is AI legal drafting software?",
    a: "AI legal drafting software uses artificial intelligence to assist legal professionals in preparing documents based on their instructions, facts and requirements." },
  { q: "Can AI draft legal documents?",
    a: "Yes. AI can generate an initial draft based on the information and instructions provided. The document should always be reviewed, edited and verified by a qualified legal professional before use." },
  { q: "What documents can JuristBot help draft?",
    a: "JuristBot can assist with documents such as petitions, affidavits, legal notices, contracts, agreements and other legal drafts depending on the user's requirements." },
  { q: "Can lawyers use AI for legal drafting?",
    a: "Yes. Lawyers can use AI as a drafting assistant to create initial versions of documents and reduce repetitive drafting work." },
  { q: "Is AI legal drafting reliable?",
    a: "AI-generated drafts should not be accepted without review. Legal professionals should verify facts, applicable provisions, citations, dates and other important information before using a document professionally." },
  { q: "Can JuristBot draft petitions and affidavits?",
    a: "JuristBot's legal drafting capabilities can assist with creating drafts for petitions and affidavits based on the information and instructions provided by the user." },
  { q: "Can JuristBot help with legal notices?",
    a: "Yes. JuristBot can assist in preparing an initial legal notice draft, which can then be reviewed and customized according to the specific matter." },
  { q: "Can AI replace a lawyer for legal drafting?",
    a: "No. AI can assist with the drafting process, but professional legal judgment and review remain necessary." },
  { q: "Is JuristBot built for Indian law?",
    a: "JuristBot is designed around Indian legal use cases and provides AI-powered tools for Indian legal professionals." },
  { q: "Who can use JuristBot?",
    a: "JuristBot is designed for advocates, lawyers, law firms, corporate legal professionals, legal researchers and law students." },
];


function Legalreach() {

const [playing, setPlaying] = useState(false);
const [openFaq, setOpenFaq] = useState(null);
  return (
    <>
    <div className="legalreach-container">
      <div className="container-fluid"><Navbar /></div>
      <div className="container-main-legalreach">
        <section className="lawyer-heading-top">
          <h1 className="lr-hero-title">
            AI Legal Research for
            <span className="lr-hero-highlight">Indian Lawyers</span>
          </h1>
          <p className="lr-hero-text">
            JuristBot AI brings AI-assisted legal research into one platform built
            around Indian legal use cases. It can help legal professionals explore
            legal questions, identify relevant judgments, research case law and
            understand applicable laws and sections as part of their case
            preparation.
          </p>
          <Link to="/login" className="lr-hero-btn">
            Start Legal Research
            <FontAwesomeIcon icon={faArrowRight} className="lr-hero-btn-icon" />
          </Link>
        </section>        
      </div>
    </div>
    <div className="vvv">
      <section className="lr-video-wrap">
        <div className="lr-video-card">
          <div className="lr-video-label">
            <FontAwesomeIcon icon={faCirclePlay} /> Watch JuristBot AI in action
          </div>

          <div className="lr-video-frame">
            {playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                title="JuristBot AI Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className="lr-video-thumb"
                onClick={() => setPlaying(true)}
                aria-label="Play JuristBot AI demo video"
              >
                <img
                  src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                  onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`; }}
                  alt="JuristBot AI demo"
                />
                <span className="lr-play-btn"><FontAwesomeIcon icon={faPlay} /></span>
              </button>
            )}
          </div>
        </div>
      </section>
      <section className="lr-about">
        <div className="lr-about-grid">
          <div className="lr-about-left">
            <span className="lr-eyebrow">Simpler Research. Deeper Insights.</span>
            <h2 className="lr-about-title">What Is AI Legal Research?</h2>
            <p className="lr-about-text">
              AI legal research uses artificial intelligence to help find, understand and
              organize legal information. Traditional legal research often involves
              searching for specific terms, opening multiple results, reviewing documents
              and then identifying which authorities are actually relevant to the issue
              being researched. For a complex matter, this can become a time-consuming
              process.
            </p>

            <div className="lr-quote">
              <FontAwesomeIcon icon={faQuoteLeft} className="lr-quote-icon" />
              <p>
                AI doesn't replace legal judgement.<br />
                It helps you reach it faster.
              </p>
            </div>
          </div>

          <div className="lr-benefits-card">
            <h3 className="lr-benefits-title">Key Benefits</h3>
            <ul className="lr-benefits-list">
              {benefits.map((b) => (
                <li key={b.title} className="lr-benefit">
                  <span className="lr-benefit-icon"><img src={b.icon} alt="icon"/></span>
                  <div>
                    <h4>{b.title}</h4>
                    <p>{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      </div>
      <section className="lr-india">
  <div className="lr-india-content">
    <span className="lr-india-badge">Built for Indian Law</span>
    <h2 className="lr-india-title">
      AI Legal Research
      <span>for Indian Law</span>
    </h2>
    <p>
      Legal research in India requires attention to Indian Statutes, Acts, Sections,
      judicial decisions and legal precedents. Depending on the matter, a lawyer may
      also need to examine Supreme Court and High Court judgments and understand how
      particular provisions have been interpreted. JuristBot is designed around Indian
      legal use cases, making it relevant for professionals researching Indian law.
    </p>
    <p>
      With an AI-assisted legal research platform, users can explore areas such as:
    </p>
  </div>

  <ul className="lr-india-tags">
    {lawTags.map((t, i) => (
      <li
        key={t.label}
        className="lr-india-tag"
        style={{ left: `${t.left}%`, top: `${t.top}%`, animationDelay: `${i * 0.4}s` }}
      >
       <img src={greentick}  alt='legalindia' className="lr-india-check" />
        {t.label}
      </li>
    ))}
  </ul>
</section>

<section className="lr-case">
  <div className="lr-case-grid">
    <div className="lr-case-img">
      <img src={searchCaseImg} alt="AI-assisted case law search" />
    </div>

    <div className="lr-case-content">
      <h2 className="lr-case-title">
        Search Case Law <span>Faster</span>
      </h2>
      <p>
        Finding the right case law is often one of the most important parts of legal
        research. A lawyer may already know the broad legal issue but still need to find
        judgements that support a particular argument, explain how a provision has been
        interpreted or provide useful precedent for a matter.
      </p>
      <p>
        An AI-assisted case law search can provide a different starting point from a
        conventional keyword search. For example, consider a lawyer researching a
        particular legal issue involving a disputed provision of law. Instead of
        repeatedly trying different combinations of keywords, the lawyer can describe
        the issue and use AI-assisted research to identify potentially relevant
        judgements and areas of law to investigate.
      </p>
      <p>
        The results still need to be reviewed carefully by the lawyer, but the initial
        discovery process can become more focused.
      </p>
      <p>
        JuristBot brings this approach into its legal AI platform, alongside other tools
        for legal drafting, case analysis and judgement discovery.
      </p>
    </div>
  </div>

  <div className="lr-help-card">
    <div className="lr-help-intro">
      <span className="lr-help-brain"><img src={brain} alt="" /></span>
      <div>
        <h3>How JuristBot Helps With Legal Research</h3>
        <p>
          JuristBot combines AI legal research with other tools used during legal work.
          The platform is designed for advocates, law firms and other legal
          professionals who need to research Indian law and prepare for cases.
        </p>
      </div>
    </div>

    <ul className="lr-help-list">
      {helpItems.map((item) => (
        <li key={item.label} className="lr-help-item">
          {item.icon ? (
            <img src={item.icon} alt="" />
          ) : (
            <FontAwesomeIcon icon={faBullseye} className="lr-help-fa" />
          )}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  </div>
</section>

<section className="lr-benefits-sec">
  <h2 className="lr-benefits-heading">
    Benefits of Using an <span>AI Legal Research Tool</span>
  </h2>

  <div className="lr-bgrid">
    {/* 01 — tall featured card */}
    <article
      className="lr-bcard lr-bcard--featured lr-bcard--tall"
    >
      <div className="lr-bcard-no"><span>01</span></div>
      <span className="lr-bcard-icon lr-tone-gold"><FontAwesomeIcon icon={faClock} /></span>
      <h3>Spend Less Time on Initial Research</h3>
      <p>
        Legal research requires careful attention, but not every part of the process
        needs to begin with hours of manual searching.
      </p>
      <p>
        An AI legal research tool can help with the initial discovery process, allowing
        lawyers to explore a legal issue and identify potential research directions
        more quickly.
      </p>
    </article>

    {/* 02–05 */}
    {benefitCards.map((c) => (
      <article key={c.no} className={`lr-bcard ${c.featured ? "lr-bcard--featured" : ""}`}>
        <div className={`lr-bcard-no lr-no-${c.tone}`}><span>{c.no}</span></div>
        <div className="lr-bcard-head">
          <span className={`lr-bcard-icon lr-tone-${c.tone}`}>
            <FontAwesomeIcon icon={c.icon} />
          </span>
          <h3>{c.title}</h3>
        </div>
        {c.paras.map((p, i) => <p key={i}>{p}</p>)}
      </article>
    ))}
  </div>
</section>

<section className="lr-compare">
  <div className="lr-compare-head">
    <span className="lr-compare-eyebrow">Traditional vs Legal Research</span>
    <h2 className="lr-compare-title">
      AI Does Not Replace Legal Research.
      <span>It Makes it Better.</span>
    </h2>
    <p className="lr-compare-sub">
      AI can even distinguish traditional legal research to make the process more
      efficient and focused.
    </p>
  </div>

  <div className="lr-compare-grid">
    <div className="lr-compare-card lr-compare-card--trad">
      <h3>
        <span className="lr-compare-ic lr-compare-ic--gray">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
        Traditional Legal Research
      </h3>
      <ul>
        {tradPoints.map((p) => (
          <li key={p}>
            <img src={xmark} alt="vfgv" className="" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="lr-compare-card lr-compare-card--ai">
      <h3>
        <span className="lr-compare-ic lr-compare-ic--gold">
          <FontAwesomeIcon icon={faBullseye} />
        </span>
        AI-Assisted Legal Research
      </h3>
      <ul>
        {aiPoints.map((p) => (
          <li key={p}>
            <img src={xtick}  alt="tic" className="" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
</section>

<section className="lr-audience">
  <div className="lr-audience-head">
    <span className="lr-audience-eyebrow">Trusted Legal Intelligence</span>
    <h2 className="lr-audience-title">
      Who Can Use <span>JuristBot</span> for Legal Research?
    </h2>
    <p className="lr-audience-sub">
      Built for every legal professional and research-driven individual.
    </p>
  </div>

  <div className="lr-audience-grid">
    {audienceCards.map((c) => (
      <article key={c.title} className="lr-aud-card">
        <span className="lr-aud-icon">
          <FontAwesomeIcon icon={c.icon} />
        </span>
        <h3>{c.title}</h3>
        <p>{c.text}</p>
      </article>
    ))}
  </div>
</section>

<section className="lr-tasks">
  <div className="lr-tasks-inner">
    <div className="lr-tasks-head">
      <h2 className="lr-tasks-title">
        Common Legal Research Tasks
        <span>You Can Use AI For</span>
      </h2>
      <p className="lr-tasks-sub">
        JuristBot can be used as an AI-assisted starting point for a range
        of legal research activities, including:
      </p>
    </div>

    <ul className="lr-tasks-list">
      {commonTasks.flat().filter(Boolean).map((task) => (
        <li key={task} className="lr-task-item">
          <FontAwesomeIcon icon={faCircleCheck} className="lr-task-tick" />
          <span>{task}</span>
        </li>
      ))}
    </ul>
  </div>

  <div className="lr-tasks-note">
    The purpose is to make the research process more efficient while keeping
    the legal professional in control of the final analysis.
  </div>
</section>

<section className="lr-why">
  <div className="lr-why-card">
    <h2 className="lr-why-title">
      Why Use JuristBot for <span>AI Legal Research</span>?
    </h2>

    <p className="lr-why-text">
      Legal professionals often need more than a general-purpose AI chatbot when
      working with legal information. JuristBot is built specifically around legal
      use cases in the Indian context. Its platform combines AI-assisted legal
      research with tools for legal drafting, judgment discovery, case analysis
      and cross-question preparation.
    </p>

    <h3 className="lr-why-subhead">Key areas include</h3>

    <ul className="lr-why-areas">
      {keyAreas.flat().filter(Boolean).map((area) => (
        <li key={area}>{area}</li>
      ))}
      <li className="lr-why-areas-full">AI assistance for advocates and law firms</li>
    </ul>

    <p className="lr-why-text">
      For legal research, JuristBot provides a single environment where professionals
      can explore legal questions and then use other legal AI capabilities as their
      work progresses.
    </p>
    <p className="lr-why-text">
      JuristBot is available with credit-based plans, allowing users to get started
      with access to its AI legal tools and choose a plan based on their usage
      requirements.
    </p>
  </div>
</section>

<section className="lr-faq">
  <div className="lr-faq-head">
    <span className="lr-faq-eyebrow">Frequently Asked Questions</span>
    <h2 className="lr-faq-title">
      Your Questions,<span>Answered</span>
    </h2>
  </div>

  <div className="lr-faq-card">
    <div className="lr-faq-grid">
      {faqs.map((item, i) => {
        const isOpen = openFaq === i;
        return (
          <div key={i} className={`lr-faq-item ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              className="lr-faq-q"
              onClick={() => setOpenFaq(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <FontAwesomeIcon
                icon={isOpen ? faXmark : faPlus}
                className="lr-faq-ic"
              />
            </button>
            <div className="lr-faq-a">
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>

<section className="lr-cta">
  <div className="lr-cta-banner">
    <div className="lr-cta-content">
      <h2 className="lr-cta-title">
        Start Your AI Legal<br />Research With JuristBot
      </h2>
      <p className="lr-cta-text">
        Spend less time getting started with legal research and more time evaluating
        the information that matters to your case.
        Explore JuristBot's AI legal research capabilities and other legal AI tools
        designed for Indian legal professionals.
      </p>
    </div>

    <Link to="/register" className="lr-cta-btn">

      <FontAwesomeIcon icon={faArrowRight} />
    </Link>
  </div>
</section>
    </>
  );
}

export default Legalreach;