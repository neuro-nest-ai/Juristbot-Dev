import React, { useState, useEffect,useRef  } from "react";
import logoImage from "../../assetes/images/logojuristbot.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faArrowRight, faBalanceScale, faUser, faUserTie, faBriefcase,faFileLines,faGavel,faCommentDots,faPlus,
  faMagnifyingGlass, faGraduationCap,faPenNib,
faLightbulb ,
  faCircleCheck, faFilePen } from "@fortawesome/free-solid-svg-icons";
import robot from './docs/robot.jpg';
import { Link } from "react-router-dom";
import "./legaldraft.css";
import fileview from './docs/file.svg';
import bamboo from './docs/bamboo.svg';
import robotdesk from './docs/studybot.jpg';

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


const draftTypes = [
  "Petitions",
  "Affidavits",
  "Legal notices",
  "Contracts",
  "Agreements",
  "Legal documents",
  "Other professional legal drafts",
];
const draftSteps = [
  { no: "1", title: "Provide the Requirements",
    text: "Start by providing the relevant information, facts and instructions for the document you need." },
  { no: "2", title: "Generate a Draft",
    text: "JuristBot uses AI to create a draft based on the information and instructions provided." },
  { no: "3", title: "Review the Document",
    text: "Read through the generated content carefully. Check the facts, legal provisions, names, dates, references and other important details." },
  { no: "4", title: "Make Your Changes",
    text: "Modify the draft according to your matter, preferred language, legal strategy and professional requirements." },
  { no: "5", title: "Finalize After Verification",
    text: "Before using the document professionally, verify the applicable law, citations and other legal information and make any necessary corrections." },
];

const draftWith = [
  { no: "1", title: "Petitions",
    text: "Use AI assistance to create a starting draft for petitions based on the information and requirements of your matter." },
  { no: "2", title: "Affidavits",
    text: "Prepare an initial affidavit draft and then review and modify it according to the specific facts and requirements." },
  { no: "4", title: "Contracts and Agreements",
    text: "AI assistance can help create an initial draft for contracts and agreements that can then be reviewed and adapted to the specific transaction." },
  { no: "3", title: "Legal Notices",
    text: "Create a structured starting point for legal notices and customize the content based on the matter." },
  { no: "5", title: "Other Legal Documents",
    text: "Depending on your requirements, JuristBot can assist with other legal drafting tasks by turning your instructions into a structured draft." },
];

const whyDraft = [
  { title: "Reduce Repetitive Drafting Work", tone: "gold",
    text: "Starting every document from a blank page can take considerable time. AI can provide an initial draft that gives you a starting point for your work." },
  { title: "Draft More Efficiently", tone: "blue",
    text: "Instead of spending the entire drafting process creating the first version, you can focus more of your time on reviewing, correcting and improving the document." },
  { title: "Work From Your Requirements", tone: "green",
    text: "You can provide instructions and relevant information based on the matter you are handling and use AI to create a draft around those requirements." },
  { title: "Make Revisions Easier", tone: "purple",
    text: "Legal drafting often involves several rounds of changes. An AI-powered drafting workflow can make it easier to work through different versions and refine the document." },
  { title: "Keep Drafting and Research Together", tone: "teal",
    text: "Drafting is closely connected to legal research. JuristBot also provides AI legal research and judgment discovery capabilities, allowing professionals to use different legal AI tools within the same platform." },
];

const tradDraft = [
  "Document starts from a blank page or previous draft",
  "Lawyer performs most of the initial drafting",
  "Repetitive sections may take additional time",
  "Lawyer reviews and edits the document",
];

const aiDraft = [
  "AI can provide an initial draft",
  "AI assists with the first version",
  "Repetitive drafting work can be reduced",
  "Lawyer reviews, edits and verifies the AI-generated draft",
];

const draftAudience = [
  { icon: faBalanceScale, tone: "indigo", title: "Advocates",
    text: "Create initial drafts and spend more time reviewing the legal substance and strategy of the matter." },
  { icon: faUser, tone: "purple", title: "Lawyers",
    text: "Use AI assistance for everyday drafting requirements and repetitive document preparation." },
  { icon: faUserTie, tone: "teal", title: "Law Firms",
    text: "Provide legal teams with an additional drafting tool that can support different matters and document requirements." },
  { icon: faBriefcase, tone: "green", title: "Corporate Legal Professionals",
    text: "Use AI assistance when preparing business-related contracts, agreements and other legal documents." },
  { icon: faMagnifyingGlass, tone: "pink", title: "Legal Researchers",
    text: "Use drafting assistance when working on research-related documents and legal projects." },
  { icon: faGraduationCap, tone: "blue", title: "Law Students",
    text: "Learn about legal document structure and drafting while developing practical legal skills." },
];

const draftingTasks = [
  "Preparing a legal document",
  "Working through repeated drafting requirements",
  "Drafting petitions",
  "Drafting contracts",
  "Drafting affidavits",
  "Preparing agreements",
  "Preparing legal notices",
  "Revising existing drafts",
  "Creating an initial draft from instructions",
  "Improving document structure",
];

const whyCaps = [
  { icon: faFileLines,      label: "AI Legal Research" },
  { icon: faPenNib,         label: "AI Legal Drafting" },
  { icon: faGavel,          label: "Judgement Discovery" },
  { icon: faLightbulb,      label: "Scenario-based analysis" },
  { icon: faCommentDots,    label: "AI cross-examination assistance" },
];

const draftFaqs = [
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
];
function Legaldrafting() {
const [openFaq, setOpenFaq] = useState(null);
  return (
    <>
    <div className="legaldraft-container">
      <div className="container-fluid"><Navbar /></div>
      <div className="container-main-legaldraft">
        <section className="lawyer-headingdraft-top">
          <h1 className="ld-hero-title">
          AI Legal Drafting Software for
            <span className="ld-hero-highlight">Indian Lawyers</span>
          </h1>
          <p className="ld-hero-text">
           Preparing a legal document can take hours, especially when you are working on a new matter, reviewing an existing draft or making repeated changes before the document is ready.
          JuristBot AI brings AI-powered legal drafting into one platform designed for Indian legal professionals. It can assist with creating and refining legal documents while helping you spend less time on repetitive drafting work.
          Whether you are preparing a petition, affidavit, legal notice or another legal document, JuristBot can provide an AI-assisted starting point that you can review, edit and adapt to the requirements of your matter.

          </p>
          <Link to="/login" className="ld-hero-btn">
            Start Legal Research
            <FontAwesomeIcon icon={faArrowRight} className="ld-hero-btn-icon" />
          </Link>
        </section>        
      </div>
    </div>
   <section className="ld-about">
  <div className="ld-about-inner">
    <div className="ld-about-text">
      <h2 className="ld-about-title">
        What Is <span>AI Legal Drafting</span>?
      </h2>

      <p>
        AI legal drafting uses artificial intelligence to assist with the preparation
        of legal documents.
      </p>
      <p>
        A traditional drafting process can involve starting from a blank document,
        referring to previous drafts, organizing facts, checking the structure and
        making multiple revisions. For busy legal professionals, this can become a
        repetitive and time-consuming part of the day.
      </p>
      <p>
        An AI legal drafting tool can make the initial drafting process easier. Instead
        of starting completely from scratch, a lawyer can provide the relevant
        information and requirements and use AI to generate a draft that can then be
        reviewed and modified.
      </p>
      <p>
        JuristBot is designed to support this process for Indian legal professionals.
      </p>
      <p>
        The lawyer remains in control of the final document. The generated draft should
        be carefully reviewed, edited and verified before being used for a client,
        filing or court proceeding.
      </p>
    </div>
  </div>
</section>


<section className="ld-types">
  <div className="ld-types-head">
    <h2 className="ld-types-title">
      AI Legal Drafting for
      <span>Indian Legal Professionals</span>
    </h2>
    <p className="ld-types-sub">
      Legal documents need to be clear, structured and appropriate for their intended
      purpose.
    </p>
    <p className="ld-types-desc">
      JuristBot provides AI-assisted legal drafting capabilities designed around the
      requirements of Indian legal professionals. The purpose of using AI is not to
      remove the lawyer from the drafting process. It is to provide a useful starting
      point and reduce repetitive work so that the professional can focus on reviewing
      the substance of the document.
    </p>
  </div>

  <ul className="ld-types-list">
    {draftTypes.map((type) => (
      <li key={type} className="ld-type-pill">
        <span className="ld-type-icon">
          <img src={fileview} alt="" />
        </span>
        <span>{type}</span>
      </li>
    ))}
  </ul>
</section>

<section className="ld-works">
  <div className="ld-works-head">
    <img src={robot} alt="" className="ld-works-bot" />
    <div className="ld-works-heading">
      <span className="ld-works-eyebrow">How JuristBot</span>
      <h2 className="ld-works-title">
        AI Legal Drafting <span>Works</span>
      </h2>
      <p className="ld-works-sub">
        The drafting process can be approached in a simple way.
      </p>
    </div>
  </div>

  <div className="ld-works-grid">
    {draftSteps.map((s) => (
      <article key={s.no} className="ld-step-card">
        <span className="ld-step-no">{s.no}</span>
        <span className="ld-step-icon">
          <img src={fileview} alt="" />
        </span>
        <h3>{s.title}</h3>
        <p>{s.text}</p>
      </article>
    ))}
  </div>

  <div className="ld-works-note">
    <FontAwesomeIcon icon={faLightbulb} className="ld-works-note-ic" />
    <span>
      This approach allows AI to become part of the drafting workflow without taking
      away the lawyer's responsibility for the final document.
    </span>
  </div>
</section>

<section className="ld-draftwith">
  <div className="ld-draftwith-grid">
    <div className="ld-draftwith-left">
      <span className="ld-draftwith-eyebrow">What can you</span>
      <h2 className="ld-draftwith-title">
        Draft With <span>JuristBot?</span>
      </h2>
      <p className="ld-draftwith-sub">
        JuristBot's AI legal drafting capability can assist with a range of professional
        documents.
      </p>

      <div className="ld-draftwith-cards">
        {draftWith.map((c) => (
          <article key={c.no} className={`ld-dw-card ld-dw-card--${c.no}`}>
            <span className="ld-dw-no">{c.no}</span>
            <span className="ld-dw-icon">
              <img src={fileview} alt="" />
            </span>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </article>
        ))}
      </div>
    </div>

    <div className="ld-draftwith-right">
      <img src={robotdesk} alt="JuristBot AI assistant" />
    </div>
  </div>

  <div className="ld-draftwith-note">
    <FontAwesomeIcon icon={faLightbulb} className="ld-works-note-ic" />
    <span>
      The final document should always be reviewed by a qualified legal professional
      before it is used.
    </span>
  </div>
</section>

<section className="ld-why">
  <div className="ld-why-head">
    <h2 className="ld-why-title">
      Why Use <span>AI Legal Drafting Software?</span>
    </h2>
  </div>

  <div className="ld-why-grid">
    {whyDraft.map((c, i) => (
      <article key={c.title} className={`ld-why-card ld-why-card--${c.tone}`}>
        <h3>{c.title}</h3>
        <p>{c.text}</p>
        <span className="ld-why-fold" />
      </article>
    ))}
  </div>
</section>

<section className="ld-vs">
  <div className="ld-vs-head">
    <h2 className="ld-vs-title">
      AI Legal Drafting <span>vs</span> Traditional Drafting
    </h2>
    <p className="ld-vs-sub">
      AI legal drafting is not intended to replace the traditional drafting skills of a
      lawyer. Traditional drafting gives the lawyer complete control from the first line
      of the document. AI-assisted drafting changes the starting point by generating an
      initial version based on the information and instructions provided. The difference
      is mainly in how the first draft is created.
    </p>
  </div>

  <div className="ld-vs-grid">
    <div className="ld-vs-card ld-vs-card--trad">
      <h3>
        <span className="ld-vs-ic ld-vs-ic--gray">
          <FontAwesomeIcon icon={faFilePen} />
        </span>
        Traditional Drafting
      </h3>
      <ul>
        {tradDraft.map((p) => (
          <li key={p}>
            <FontAwesomeIcon icon={faCircleCheck} className="ld-vs-mark ld-vs-mark--gray" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="ld-vs-card ld-vs-card--ai">
      <h3>
        <span className="ld-vs-ic ld-vs-ic--gold">
          <FontAwesomeIcon icon={faPenNib} />
        </span>
        AI-Assisted Drafting
      </h3>
      <ul>
        {aiDraft.map((p) => (
          <li key={p}>
            <FontAwesomeIcon icon={faCircleCheck} className="ld-vs-mark ld-vs-mark--gold" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
</section>

<section className="ld-audience">
  <div className="ld-audience-head">
    <h2 className="ld-audience-title">
      Who Can Use JuristBot
      <span>AI Legal Drafting?</span>
    </h2>
  </div>

  <div className="ld-audience-grid">
    {draftAudience.map((c) => (
      <article key={c.title} className={`ld-aud-card ld-aud-card--${c.tone}`}>
        <span className="ld-aud-icon">
          <FontAwesomeIcon icon={c.icon} />
        </span>
        <h3>{c.title}</h3>
        <span className="ld-aud-line" />
        <p>{c.text}</p>
      </article>
    ))}
  </div>
</section>
<section className="ld-tasks">
  <div className="ld-tasks-band">
    <div className="ld-tasks-band-text">
      <h2 className="ld-tasks-title">
        Common Legal <span>Drafting Tasks</span>
      </h2>
      <p className="ld-tasks-note">
        The final document should be reviewed carefully and adapted to the specific
        legal matter before professional use.
      </p>
      <p className="ld-tasks-sub">
        JuristBot can be used as an AI-assisted starting point for tasks such as:
      </p>
    </div>
  </div>

  <div className="ld-tasks-card">
    <ul className="ld-tasks-list">
      {draftingTasks.map((task) => (
        <li key={task} className="ld-task-item">
          <span className="ld-task-icon">
            <img src={bamboo} alt="" />
          </span>
          <span>{task}</span>
        </li>
      ))}
    </ul>
  </div>
</section>

{/* SAVE TIME BANNER */}
<section className="ld-save">
  <div className="ld-save-inner">
    <div className="ld-save-img">
      <img src={fileview} alt="" style={{ display: "none" }} />
    </div>
    <div className="ld-save-card">
      <h2 className="ld-save-title">
        Save Time on Your<br />
        <span>Legal Drafting Workflow</span>
      </h2>
      <p>For a lawyer handling multiple matters, even small amounts of repetitive work can add up over time.</p>
      <p>Preparing the first version of a document, rewriting standard sections and making repeated revisions can take valuable working hours.</p>
      <p>AI legal drafting software can reduce some of this initial workload by providing a starting point that the lawyer can review and develop.</p>
      <p>JuristBot brings this capability together with other legal AI tools, so legal professionals can research an issue, work with judgments, analyze a case and prepare documents within the same platform.</p>
    </div>
  </div>
</section>

{/* WHY + FAQ */}
<section className="ld-whyfaq">
  <div className="ld-whyfaq-grid">
    <div className="ld-why2-card">
      <h2 className="ld-why2-title">
        Why JuristBot for <span>AI Legal Drafting?</span>
      </h2>
      <p className="ld-why2-sub">
        JuristBot is built as a legal AI platform for Indian legal professionals rather
        than as a general-purpose writing tool. Its legal AI capabilities include:
      </p>

      <ul className="ld-why2-caps">
        {whyCaps.map((c) => (
          <li key={c.label}>
            <span className="ld-why2-ic"><FontAwesomeIcon icon={c.icon} /></span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>

      <p className="ld-why2-text">
        This allows users to use AI at different stages of their legal workflow.
      </p>
      <p className="ld-why2-text">
        For example, a lawyer may begin by researching a legal issue, review relevant
        judgments, analyze the case and then move into document drafting.
      </p>
      <p className="ld-why2-text">
        Instead of using a separate AI tool for each task, JuristBot brings these
        capabilities together.
      </p>
    </div>

    <div className="ld-faq-col">
      <div className="ld-faq-head">
        <FontAwesomeIcon icon={faCommentDots} className="ld-faq-head-ic" />
        <h3>Frequently Asked Questions</h3>
      </div>

      <div className="ld-faq-list">
        {draftFaqs.map((item, i) => {
          const isOpen = openFaq === i;
          return (
            <div key={i} className={`ld-faq-item ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="ld-faq-q"
                onClick={() => setOpenFaq(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <FontAwesomeIcon icon={isOpen ? faXmark : faPlus} className="ld-faq-ic" />
              </button>
              <div className="ld-faq-a"><p>{item.a}</p></div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</section>

{/* CTA BANNER */}
<section className="ld-cta">
  <div className="ld-cta-banner" >
    <div className="ld-cta-content">
      <h2 className="ld-cta-title">Start AI-Assisted Legal Drafting With JuristBot</h2>
      <p className="ld-cta-text">
        Spend less time staring at a blank document and more time reviewing the legal
        work that matters. Use JuristBot AI to create an initial draft, refine your
        documents and explore other legal AI capabilities from one platform.
      </p>
      <div className="ld-cta-btns">
        <Link to="/register" className="ld-cta-btn ld-cta-btn--primary">
               Get Started for Free trial
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
        <Link to="/login" className="ld-cta-btn ld-cta-btn--ghost">
          Get Started With JuristBot
        </Link>
      </div>
    </div>
  </div>
</section>
    </>
  );
}

export default Legaldrafting;