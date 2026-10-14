import React, { useState,useRef,useEffect} from "react";
import logoImage from "../assetes/images/logojuristbot.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars,faPhone,faLeaf ,faLock } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import './index.css'
import shield from './shield.svg';
import warning from './warning.svg';
import {
  faShieldHalved,
  faArrowTrendUp,
  faCircleCheck,
  faUser,
  faBuildingColumns,
  faHeartPulse,
  faShareNodes,
  faRobot,
  faLaptop,
  faCartShopping,
  faTowerBroadcast,
  faLayerGroup,
  faGraduationCap,
  faUserTie,
  faHouse,
  faScaleBalanced,
  faCheck,
  faPlaneDeparture,
  faTruckFast,
  faBullhorn,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {

  faBuilding,
  faGlobe,
  faFileLines,
  faChevronRight,
  faCrown,
  faCircle,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

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
    ["/", "Home"],
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
          aria-controls="dpdpNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
        </button>

        <div
          ref={panelRef}
          id="dpdpNav"
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


const categories = [
  {
    id: "finance-health",
    icon: faBuildingColumns,
    title: "Finance & Health",
    subtitle: "Banking . Healthcare",
  },
  {
    id: "tech-digital",
    icon: faLaptop,
    title: "Tech & Digital",
    subtitle: "IT . E.Com . Telecom . BPO",
  },
  {
    id: "enterprise-professional",
    icon: faBuilding,
    title: "Enterprise & Professional",
    subtitle: "HR . Legal . Education . Marketing",
  },
  {
    id: "public-community",
    icon: faGlobe,
    title: "Public & Community",
    subtitle: "NGO . Govt . Real Estate . Travel",
  },
];

const documentCards = [
  {
    id: "it-companies",
    icon: faLaptop,
    iconBg: "dpdp-doc-icon-blue",
    title: "IT Companies",
    subtitle: "Employee . Client . Website Data Fiduciary",
    tags: ["Pro", "Premium"],
    docCount: 13,
    documents: [
      "Privacy Notice / Privacy Policy",
      "Employee Consent Form",
      "Client Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Processing Agreement (DPA)",
      "DPIA (High-Risk Projects)",
      "Employee Personal Data Handling Policy",
    ],
  },
  {
    id: "ecommerce",
    icon: faCartShopping,
    iconBg: "dpdp-doc-icon-green",
    title: "E-Commerce & Digital Platforms",
    subtitle: "Customer . Payment . Behavioural Data",
    tags: ["Pro", "Premium"],
    docCount: 13,
    documents: [
      "Privacy Notice / Privacy Policy",
      "Employee Consent Form",
      "Client Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Processing Agreement (DPA)",
      "DPIA (High-Risk Projects)",
      "Employee Personal Data Handling Policy",
    ],
  },
  {
    id: "telecom",
    icon: faTowerBroadcast,
    iconBg: "dpdp-doc-icon-purple",
    title: "Telecom & Internet Services",
    subtitle: "TRAI Regulated - Subscriber Data Fiduciary",
    tags: ["Pro", "Premium"],
    docCount: 10,
    documents: [
      "Privacy Notice / Privacy Policy",
      "Subscriber Consent Form",
      "Consent Artefact",
      "Consent Artefact",
      "Cookie Policy",
      "Data Processing Agreement (DPA)",
      "DPIA (High-Risk Projects)",
      "Employee Personal Data Handling Policy",
    ],
  },
];

function CategoryTab({ category, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`dpdp-doc-tab ${isActive ? "dpdp-doc-tab-active" : ""}`}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={category.icon} className="dpdp-doc-tab-icon" />
      <h4 className="dpdp-doc-tab-title">{category.title}</h4>
      <p className="dpdp-doc-tab-subtitle">{category.subtitle}</p>
      {isActive && <span className="dpdp-doc-tab-underline" />}
    </button>
  );
}

function DocumentCard({ card }) {
  return (
    <div className="dpdp-doc-card">
      <div className="dpdp-doc-card-header">
        <div className={`dpdp-doc-icon-wrap ${card.iconBg}`}>
          <FontAwesomeIcon icon={card.icon} />
        </div>
        <div>
          <h4 className="dpdp-doc-card-title">{card.title}</h4>
          <p className="dpdp-doc-card-subtitle">{card.subtitle}</p>
          <div className="dpdp-doc-card-tags">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className={`dpdp-doc-tag ${
                  tag === "Pro" ? "dpdp-doc-tag-pro" : "dpdp-doc-tag-premium"
                }`}
              >
                {tag === "Pro" && <FontAwesomeIcon icon={faCrown} />}
                {tag === "Premium" && <FontAwesomeIcon icon={faCircle} />}
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="dpdp-doc-count">{card.docCount} Compliance Documents</p>

      <ul className="dpdp-doc-list">
        {card.documents.map((doc) => (
          <li className="dpdp-doc-item" key={doc}>
            <span className="dpdp-doc-item-label">
              <FontAwesomeIcon icon={faChevronRight} className="dpdp-doc-item-chevron" />
              {doc}
            </span>
            <span className="dpdp-doc-item-status">Mandatory</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DpdpDocumentsSection() {
  const [activeCategory, setActiveCategory] = useState("finance-health");

  return (
    <section className="dpdp-doc-section">
      <div className="dpdp-doc-header">
        <h2 className="dpdp-doc-heading">
          Documents Required For Your{" "}
          <span className="dpdp-doc-heading-highlight">Sector</span>
        </h2>
        <p className="dpdp-doc-description">
          All 16 sectors covered under the Digital Personal Data Protection Act ,2003.
          <br />
          Select your category to view mandatory and recommended documents.
        </p>
      </div>

      <div className="dpdp-doc-tabs">
        {categories.map((category) => (
          <CategoryTab
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          />
        ))}
      </div>

      <div className="dpdp-doc-status-legend">
        Document Status :
        <span className="dpdp-doc-status dpdp-doc-status-mandatory">
          <FontAwesomeIcon icon={faCircle} /> Mandatory
        </span>
        |
        <span className="dpdp-doc-status dpdp-doc-status-recommended">
          <FontAwesomeIcon icon={faCircle} /> Recommended
        </span>
      </div>

<div className="dpdp-doc-notice">
  <div className="dpdp-doc-notice-icon-wrap">
    <FontAwesomeIcon icon={faFileLines} className="dpdp-doc-notice-icon" />
  </div>
  <div className="dpdp-doc-notice-title">
    Primary Data Fiduciary -
    <br />
    Large-Scale Processing Obligations
  </div>
  <div className="dpdp-doc-notice-divider" />
  <p className="dpdp-doc-notice-text">
    Cross-border data transfers, API-based integrations, and algorithmic
    processing trigger enchanced obligations including DPA, Sub-Processor
    Agreements, and DPIA under the DPDP Act 2023
  </p>
</div>

      <div className="dpdp-doc-cards-grid">
        {documentCards.map((card) => (
          <DocumentCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}

function RiskCard({
  level,
  levelClass,
  iconBg,
  icon,
  subtitle,
  items,
  ctaLabel,
  ctaClass,
}) {
  return (
    <div className="dpdp-risk-card">
      <div className={`dpdp-risk-icon-wrap ${iconBg}`}>
        <FontAwesomeIcon icon={icon} className="dpdp-risk-icon" />
      </div>

      <h3 className={`dpdp-risk-title ${levelClass}`}>{level}</h3>
      <p className="dpdp-risk-subtitle">{subtitle}</p>

      <ul className="dpdp-risk-list">
        {items.map(([icon, label]) => (
          <li className="dpdp-risk-item" key={label}>
            <FontAwesomeIcon icon={icon} className="dpdp-risk-item-icon" />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <button type="button" className={`dpdp-risk-cta ${ctaClass}`}>
        <FontAwesomeIcon icon={faArrowRight} />
        {ctaLabel}
      </button>
    </div>
  );
}

function DpdpRiskLevels() {
  const cards = [
    {
      level: "Critical Risk",
      levelClass: "dpdp-risk-critical",
      iconBg: "dpdp-risk-bg-critical",
      icon: faShieldHalved,
      subtitle: "SENSITIVE DATA FIDUCIARY",
      items: [
        [faBuildingColumns, "Banking & Finance"],
        [faHeartPulse, "Healthcare"],
        [faShareNodes, "Social Media"],
        [faRobot, "AI / ML Companies"],
      ],
      ctaLabel: "Pro Plan Required",
      ctaClass: "dpdp-risk-cta-critical",
    },
    {
      level: "High Risk",
      levelClass: "dpdp-risk-high",
      iconBg: "dpdp-risk-bg-high",
      icon: faArrowTrendUp,
      subtitle: "LARGE DATA PROCESSOR",
      items: [
        [faLaptop, "IT & SaaS"],
        [faCartShopping, "E-Commerce"],
        [faTowerBroadcast, "Telecom"],
        [faLayerGroup, "BPO / KPO"],
      ],
      ctaLabel: "Pro / Premium",
      ctaClass: "dpdp-risk-cta-high",
    },
    {
      level: "Medium Risk",
      levelClass: "dpdp-risk-medium",
      iconBg: "dpdp-risk-bg-medium",
      icon: faCircleCheck,
      subtitle: "REGULAR DATA HANDLER",
      items: [
        [faGraduationCap, "Education"],
        [faUserTie, "HR & Consulting"],
        [faHouse, "Real Estate"],
        [faScaleBalanced, "Law Firms"],
      ],
      ctaLabel: "Premium Plans",
      ctaClass: "dpdp-risk-cta-medium",
    },
    {
      level: "Entry Level",
      levelClass: "dpdp-risk-entry",
      iconBg: "dpdp-risk-bg-entry",
      icon: faUser,
      subtitle: "SMALL DATA COLLECTOR",
      items: [
        [faCheck, "NGOs & Trusts"],
        [faPlaneDeparture, "Travel & Hospitality"],
        [faTruckFast, "Logistics"],
        [faBullhorn, "Marketing"],
      ],
      ctaLabel: "Standard Plan",
      ctaClass: "dpdp-risk-cta-entry",
    },
  ];

  return (
    <section className="dpdp-risk-section">
      <div className="dpdp-risk-header">
        <h2 className="dpdp-risk-heading">
          Identify Your <span className="dpdp-risk-heading-highlight">Risk Level</span>
        </h2>
        <p className="dpdp-risk-description">
          Understand where your business stands under the DPDP Act 2023 and select
          the appropriate compliance shield.
        </p>
      </div>

      <div className="dpdp-risk-grid">
        {cards.map((card) => (
          <RiskCard key={card.level} {...card} />
        ))}
      </div>
    </section>
  );
}


const masterDocuments = [
  {
    document: "Privacy Notice / Privacy Policy",
    purpose:
      "Discloses data collection purpose, categories, and rights to data principals before or at the point of collection",
    sectors: ["All 16 Sectors"],
  },
  {
    document: "Consent Form (Data Principal)",
    purpose:
      "Free, specific, informed, and unambiguous consent before processing personal data",
    sectors: ["All 16 Sectors"],
  },
  {
    document: "Consent Artefact",
    purpose:
      "Machine-readable proof of consent with timestamp, scope, and purpose — mandatory under DPDP Rules",
    sectors: ["All 16 Sectors"],
  },
  {
    document: "Cookie Policy",
    purpose:
      "Discloses use of tracking technologies on digital platforms; includes opt-in / opt-out controls",
    sectors: ["All sectors with websites/apps"],
  },
  {
    document: "Cookie Consent Banner",
    purpose: "Mandatory consent collection mechanism for tracking technologies",
    sectors: ["E-Commerce", "Social Media", "Marketing"],
  },
  {
    document: "Data Retention & Deletion Policy",
    purpose:
      "Defines lawful retention periods and mandates secure erasure upon expiry of purpose",
    sectors: ["All 16 Sectors"],
  },
  {
    document: "Grievance Officer Appointment Letter",
    purpose:
      "Designated officer with contact details; escalation timelines for data complaints",
    sectors: ["All 16 Sectors"],
  },
  {
    document: "Data Breach Incident Report",
    purpose:
      "Mandatory notification to DPBI and affected data principals within prescribed timelines",
    sectors: ["All 16 Sectors"],
  },
  {
    document: "Consent Withdrawal / Opt-out Form",
    purpose: "Mechanism enabling data principals to withdraw previously given consent",
    sectors: ["E-Commerce", "Telecom", "Marketing", "Social Media"],
  },
  {
    document: "Data Protection Impact Assessment (DPIA)",
    purpose:
      "Risk assessment framework for high-volume or sensitive data processing activities",
    sectors: ["Banking", "Healthcare", "IT", "BPO", "Education"],
  },
  {
    document: "Data Processing Agreement (DPA)",
    purpose: "Binding contract governing third-party processors' obligations under DPDP Act",
    sectors: ["IT", "HR", "BPO", "LPO", "Logistics", "E-Commerce"],
  },
  {
    document: "Cross-Border Data Transfer Agreement",
    purpose:
      "Standard contractual clauses ensuring adequate protection for international data transfers",
    sectors: ["IT", "Banking", "Travel", "BPO", "Telecom"],
  },
  {
    document: "Sub-Processor Agreement",
    purpose: "Agreement binding sub-vendors and cloud providers in the data processing chain",
    sectors: ["BPO/KPO", "Cloud", "IT"],
  },
  {
    document: "Child Data Protection Policy",
    purpose:
      "Enhanced safeguards; parental consent verification; prohibition on profiling of minors",
    sectors: ["EdTech", "Social Media", "Education", "E-Commerce"],
  },
  {
    document: "Data Erasure / Right to be Forgotten Form",
    purpose: "Enables data principals to request complete deletion of personal data",
    sectors: ["E-Commerce", "Social Media"],
  },
  {
    document: "Data Fiduciary Registration Form (SDF)",
    purpose: "Registration with DPBI as Significant Data Fiduciary where applicable",
    sectors: ["Banking", "Telecom", "Large IT", "Social Media"],
  },
];

function DpdpMasterDocuments() {
  return (
    <section className="dpdp-master-section">
      <div className="dpdp-master-header">
        <h2 className="dpdp-master-heading">
          <span className="dpdp-master-heading-highlight">Master Documents</span> -All 16
          Sectors
        </h2>
        <p className="dpdp-master-description">
          Core documents mandated for every data fiduciary under the DPDP Act, 2023
          <br />
          — regardless of sector, size, or scale of operations.
        </p>
      </div>

      <div className="dpdp-master-table-wrap">
        <table className="dpdp-master-table">
          <thead>
            <tr>
              <th className="dpdp-master-th">Document</th>
              <th className="dpdp-master-th">Purpose</th>
              <th className="dpdp-master-th">Applicable Sectors</th>
            </tr>
          </thead>
          <tbody>
            {masterDocuments.map((row) => (
              <tr className="dpdp-master-row" key={row.document}>
                <td className="dpdp-master-td dpdp-master-td-doc">{row.document}</td>
                <td className="dpdp-master-td dpdp-master-td-purpose">{row.purpose}</td>
                <td className="dpdp-master-td dpdp-master-td-sectors">
                  <div className="dpdp-master-tags">
                    {row.sectors.map((sector) => (
                      <span className="dpdp-master-tag" key={sector}>
                        {sector}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


function DpdpCtaSection() {
  return (
    <section className="dpdp-cta-section">
      <div className="dpdp-cta-card">
        <h2 className="dpdp-cta-heading">
          <span className="dpdp-cta-heading-highlight">Ready to Shield</span> Your
          Business ?
        </h2>

        <p className="dpdp-cta-subtext">
          Get a free consultation with our DPDP compliance experts. We'll identify
          your sector, assess your risk level, and recommend the right plan in
          minutes.
        </p>

        <div className="dpdp-cta-buttons">
          <a href="tel:+919487755879" className="dpdp-cta-btn dpdp-cta-btn-primary">
            <FontAwesomeIcon icon={faPhone} />
            Reply "DPDP"-Free Consultation
          </a>

          <button type="button" className="dpdp-cta-btn dpdp-cta-btn-outline">
            View All Plans
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="dpdp-cta-footer">
          <FontAwesomeIcon icon={faLeaf} className="dpdp-cta-leaf" />
          <p className="dpdp-cta-footer-text">
            Serving IT, AI, SaaS, Hospitals, Schools, Law Firms, HR, E-Commerce,
            Finance, Real Estate, Manufacturing, Retail &amp; all data-handling
            businesses
          </p>
          <FontAwesomeIcon icon={faLeaf} className="dpdp-cta-leaf dpdp-cta-leaf-flip" />
        </div>
      </div>
    </section>
  );
}

function DpdpFooter() {
  return (
    <footer className="dpdp-footer">
      <div className="dpdp-footer-inner">
        <p className="dpdp-footer-copyright">
          © 2025 Juristbot AI by NeuroNest AI Pvt Ltd
          <span className="dpdp-footer-dot">·</span>
          <span className="dpdp-footer-tagline">
            "From Drafting to Compliance – We Support Your Business."
          </span>
        </p>

        <p className="dpdp-footer-disclaimer">
          <FontAwesomeIcon icon={faScaleBalanced} className="dpdp-footer-icon" />
          All documents prepared pursuant to the Digital Personal Data Protection Act,
          2023 and applicable Indian laws. This does not constitute legal advice.
        </p>

        <div className="dpdp-footer-badge">
          <FontAwesomeIcon icon={faLock} className="dpdp-footer-badge-icon" />
          DPDP Act 2023 Compliant Framework
        </div>
      </div>
    </footer>
  );
}


function Dpconcept() {
     const stats = [
    { value: "16", label: "Sectors Covered" },
    { value: "4", label: "Shield Categories" },
    { value: "120+", label: "Legal Documents" },
    { value: "₹250Cr", label: "Penalty Risk Covered" },
  ];

  const sectors = [
    "Banking & Finance", "Health Care", "E-Commerce", "Education", "Real Estate",
    "IT & SaaS", "Telecom", "HR & Consulting", "Law Firms", "Social Media",
    "Government", "NGOs & Trusts", "Marketing", "BPO/KPO", "Travel & Hospitality",
    "Logistics",
  ];
  return (
    <div className="main-container">
     <div className="container-fluid"><Navbar /></div>
    <div className="dpdp-hero">
      <div className="dpdp-hero-inner">
        <span className="dpdp-badge">
            <img src={shield} alt="shield" className="dpdp-shield-icon" />
         DPDP SHIELD - COMPLIANCE FRAMEWORK 2025
        </span>

        <h1 className="dpdp-heading">
          Protect Your Business
          <br />
          from <span className="dpdp-heading-highlight">DPDP Act Penalties</span>
        </h1>

        <p className="dpdp-subtext">
          India's most comprehensive sector-specific DPDP Act compliance solution -
          AI-drafted, legally verified documents for all 16 regulated sectors
        </p>

        <div className="dpdp-warning">
            <img src={warning} alt="warning"  />
          Non-compliance penalties upto <strong>₹ 250 Crores</strong> under Section 33, DPDP Act 2023
        </div>

        <div className="dpdp-stats">
          {stats.map((s) => (
            <div className="dpdp-stat" key={s.label}>
              <div className="dpdp-stat-value">{s.value}</div>
              <div className="dpdp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dpdp-sectors">
          {sectors.map((sector) => (
            <span className="dpdp-sector-pill" key={sector}>
              {sector}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div className="dpdp-concept">
        <DpdpRiskLevels />

    </div>
      <div className="dpdp-concept">
         <DpdpDocumentsSection />
        
    </div>
      <div className="dpdp-concept">
          <DpdpMasterDocuments />
        
    </div>
     <div className="dpdp-concept">
    <DpdpCtaSection />
        
    </div>
    <div className="dpdp-concept">
    <DpdpFooter />
    </div>
    </div>
  )
}

export default Dpconcept
