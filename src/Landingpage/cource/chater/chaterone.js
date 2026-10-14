import React, { useState } from "react";
import logoImage from "../../assetes/images/logo_img_1.png";
import "../cource.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Link , useNavigate } from "react-router-dom";
import ddd from "../chater/Frame.png";
function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    return (
        <div className="d-flex justify-content-center">
            <nav className="navbar navbar-expand-xl navbar-dark bg-dark nav-bar-cls" style={{ borderRadius: isMenuOpen ? "20px" : "58px" }}  >
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
                                <a className="nav-link " href="/">About</a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/" >  Our services </a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/" > Pricing </a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/course" >
                                    Legal Courses
                                </a>
                            </li>
                            <li className="nav-item nav-cls">
                                <a className="nav-link" href="/" >Contact us </a>
                            </li>
                        </ul>
                        <div className="col-lg-2 col-md-2 col-sm-3 col-4 massnav">
                            <Link to="/login">
                                <button type="button" className="juristbotAIbtn">
                                    Login
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

function Chaterone() {

    const [expandedModules, setExpandedModules] = useState([]);
    const navigate = useNavigate();
    const targetAudience = [
        'Law students',
        'Advocates',
        'CS/CA professionals',
        'Paralegals',
        'Corporate & government legal officers'
    ];


    const skills = [
        'AI-Powered Legal Drafting',
        'Prompt Engineering for Law',
        'Contract Automation',
        'Document Review with AI',
        'Responsible AI Usage',
        'Litigation Drafting',
        'Error Detection & Correction',
        'Strategic AI Advisory',
        'Legal Tech Proficiency',
        'Corporate Document Drafting'
    ];

        const skillreed = [
        'Smart Notes for Faster Learning',
        '24/7 Chatbot Assistance',
        'Six-Month Access to JuristBot AI',
        'Detailed Assignment Feedback',
        'Complete Digital Course Booklet',
        'Internship Opportunities for Top Performers',
        'Official Graded Certificate'
    ];

    const explorations = [
        {
            title: 'Draft Diverse AI-Powered Legal Documents',
            description: 'across multiple practice areas with confidence, speed, and accuracy using advanced AI assistance'
        },
        {
            title: 'Identify and Correct Drafting Errors Using AI Tools',
            description: 'through AI-enhanced critical analysis and intelligent quality review techniques'
        },
        {
            title: 'Structure Contracts and Pleadings with AI Assistance',
            description: 'according to established legal standards and best practices, leveraging AI for precision and consistency'
        },
        {
            title: 'Translate Client Requirements into AI-Generated',
            description: 'Documentation that is clear, enforceable, and meets objectives efficiently'
        },
        {
            title: 'Master Juristbot AI Writing Techniques',
            description: 'to produce professional-grade legal documents 10x faster than traditional methods'
        }
    ];


const courseData = {
  totalModules: 9,
  totalHours: 19.5,
  modules: [
    {
      id: 1,
      moduleNumber: "Module 1",
      duration: "2.5 hours",
      title: "Introduction to Legal Drafting with JURISBOT AI",
      description: "Master the fundamentals of AI-assisted legal drafting with confidence",
      lessons: [
        "Lesson 1.1: What is Legal Drafting?",
        "Lesson 1.2: What is Conveyancing?",
        "Lesson 1.3: Problems of Old School Drafting & How AI Solves Them",
        "Lesson 1.4: Fowler’s Five Rules of Drafting",
        "Lesson 1.5: Do’s and Don’ts in Legal Drafting"
      ],
      viewLessons: true
    },
    {
      id: 2,
      moduleNumber: "Module 2",
      duration: "3 hours",
      title: "Components of a Legal Document",
      description: "Understand the building blocks of legally sound documents",
      lessons: [
        "Lesson 2.1: Title",
        "Lesson 2.2: Parties",
        "Lesson 2.3: Recitals",
        "Lesson 2.4: Definitions",
        "Lesson 2.5: Operative Clauses",
        "Lesson 2.6: Covenants",
        "Lesson 2.7: Remedies & Termination",
        "Lesson 2.8: Force Majeure",
        "Lesson 2.9: Signatures & Attestation"
      ],
      viewLessons: false
    },
    {
      id: 3,
      moduleNumber: "Module 3",
      duration: "3 hours",
      title: "Contract Drafting Essentials",
      description: "Draft enforceable business contracts with clarity and precision",
      lessons: [
        "Lesson 3.1: Introduction to Agreements and Contracts",
        "Lesson 3.2: What is an Agreement?",
        "Lesson 3.3: What is a Contract?",
        "Lesson 3.4: Non-Disclosure Agreement",
        "Lesson 3.5: Employment Agreement",
        "Lesson 3.6: Vendor Agreement",
        "Lesson 3.7: IP Franchise Agreement",
        "Lesson 3.8: Service Agreement",
        "Lesson 3.9: Consultant Agreement",
        "Lesson 3.10: Conclusion & Additional Resources"
      ],
      viewLessons: false
    },
    {
      id: 4,
      moduleNumber: "Module 4",
      duration: "2 hours",
      title: "Technology Agreements Drafting",
      description: "Navigate IT, SaaS, and digital contracts with confidence",
      lessons: [
        "Lesson 4.1: Introduction to Technology Agreements",
        "Lesson 4.2: Software Licensing Agreement",
        "Lesson 4.3: Software as a Service (SaaS) Agreement",
        "Lesson 4.4: Channel Partner Agreement",
        "Lesson 4.5: Contract Redlining"
      ],
      viewLessons: false
    },
    {
      id: 5,
      moduleNumber: "Module 5",
      duration: "3 hours",
      title: "Corporate Drafting Masterclass",
      description: "Handle corporate transactions like a seasoned professional",
      lessons: [
        "Lesson 5.1: What is Corporate Drafting & Why It Matters",
        "Lesson 5.2: Practical Examples of Corporate Drafting",
        "Lesson 5.3: Memorandum of Understanding",
        "Lesson 5.4: Memorandum of Association",
        "Lesson 5.5: Board Resolution",
        "Lesson 5.6: Shareholders Agreement",
        "Lesson 5.7: Non-Compete Agreement",
        "Lesson 5.8: Loan Agreement",
        "Lesson 5.9: Foreign Collaboration Agreement",
        "Lesson 5.10: Mortgage Agreement",
        "Lesson 5.11: Hypothecation Agreement"
      ],
      viewLessons: false
    },
    {
      id: 6,
      moduleNumber: "Module 6",
      duration: "2 hours",
      title: "Criminal Drafting Fundamentals",
      description: "Court drafting for criminal matters",
      lessons: [
        "Lesson 6.1: Why Criminal Drafting Matters",
        "Lesson 6.2: FIR and Its Key Components",
        "Lesson 6.3: Bail Applications",
        "Lesson 6.4: Anticipatory Bail",
        "Lesson 6.5: Criminal Complaint"
      ],
      viewLessons: false
    },
    {
      id: 7,
      moduleNumber: "Module 7",
      duration: "2 hours",
      title: "Civil Drafting Expertise",
      description: "Master pleadings and petitions in civil law",
      lessons: [
        "Lesson 7.1: Introduction to Civil Drafting",
        "Lesson 7.2: What is Civil Drafting & Its Advantages",
        "Lesson 7.3: Plaint",
        "Lesson 7.4: Review Petition",
        "Lesson 7.5: Counter Claim",
        "Lesson 7.6: Consumer Complaint",
        "Lesson 7.7: Writ and Its Types",
        "Lesson 7.8: Writ Petition"
      ],
      viewLessons: false
    },
    {
      id: 8,
      moduleNumber: "Module 8",
      duration: "2 hours",
      title: "Family Law Drafting",
      description: "Handle sensitive family matters with professionalism",
      lessons: [
        "Lesson 8.1: Importance of Family Law Drafting",
        "Lesson 8.2: Application for Divorce (Hindu Law)",
        "Lesson 8.3: Child Custody Application"
      ],
      viewLessons: false
    },
    {
      id: 9,
      moduleNumber: "Final Module",
      duration: "45 Questions",
      title: "Final Certification Assessment",
      description: "Assessment to certify AI-age legal drafting competency",
      lessons: [],
      viewLessons: false,
      isFinal: true
    }
  ]
};

    const toggleModule = (moduleId) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };


    return (
        <div className="pattern-bnner">
            <div className="container-fluid">
                <Navbar />
            </div>
            <div className="container-main">
                <div className="cource-heading-top">
                    <h3 className="text-center ">Courses</h3>
                    <h2 className="text-center ">CERTIFIED AI DRAFTING COURSE FOR LAW STUDENTS AND LEGAL PROFESSIONALS</h2>
                    <p className="text-center">A beginner-friendly course that helps law students and professionals master AI-powered drafting with Juristbot AI. Build practical drafting skills, improve efficiency, and prepare for modern legal practice.</p>
                    <div className="d-flex  justify-content-center pt-3">
                     <button className="enrollnowbtn d-flex align-items-center justify-content-center px-4 py-2" onClick={() => navigate('/register')}>   Enroll Now   </button>
                    </div>
                </div>

                <div className="enrollment-section">
                    <div className="content-wrapper">
                        <div className="left-content">
                            <div className="section-block">
                                <h2 className="section-title">Who Should Enroll</h2>
                                <ul className="audience-list">
                                    {targetAudience.map((audience, index) => (
                                        <li key={index} className="audience-item">
                                            <span className="bullet">▸</span>
                                            <span>{audience}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* What You'll Explore */}
                            <div className="section-block">
                                <h2 className="section-title">What You'll Explore</h2>
                                <ul className="exploration-list">
                                    {explorations.map((item, index) => (
                                        <li key={index} className="exploration-item">
                                            <span className="bullet">▸</span>
                                            <div className="exploration-content">
                                                <span className="exploration-title">{item.title}</span>
                                                <span className="exploration-description"> {item.description}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>

                        {/* Right side - Professional Image */}
                        <div className="right-content">
                            <div className="professional-image-wrapper">
                                <div className="image-background"></div>
                                <img
                                    src={ddd}
                                    alt="Professional giving thumbs up"
                                    className="professional-image"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="enrollment-section">
                        <div className="section-block">
                            <h2 className="section-title">Skills You'll Develop</h2>
                            <div className="skills-grid">
                                {skills.map((skill, index) => (
                                    <div key={index} className="skill-badge">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="course-curriculum">
                        <div className="curriculum-header">
                            <h2 className="curriculum-title">What's Inside the Course</h2>
                            <p className="curriculum-subtitle">5 Core Modules + Foundation Training</p>
                        </div>

                        <div className="modules-container">
                            {courseData.modules.map((module) => (
                                <div key={module.id} className="module-card">
                                    <div className="module-header">
                                        <div className="module-info">
                                            <div className="module-meta">
                                                <span className={`module-badge ${module.isFinal ? 'final-badge' : ''}`}>
                                                    {module.moduleNumber}
                                                </span>
                                                <span className="module-duration">{module.duration}</span>
                                            </div>
                                            <h3 className="module-title">{module.title}</h3>
                                            <p className="module-description">{module.description}</p>
                                        </div>
                                    </div>

                                    {module.lessons.length > 0 && (
                                        <div className="module-content">
                                            <button
                                                className="view-lessons-btn"
                                                onClick={() => toggleModule(module.id)}
                                            >
                                                {expandedModules.includes(module.id) ? 'Hide Lessons' : 'View Lessons'}
                                                <span className={`arrow ${expandedModules.includes(module.id) ? 'expanded' : ''}`}>
                                                    →
                                                </span>
                                            </button>

                                            {expandedModules.includes(module.id) && (
                                                <ul className="lessons-list">
                                                    {module.lessons.map((lesson, index) => (
                                                        <li key={index} className="lesson-item">
                                                            <span className="lesson-bullet">•</span>
                                                            <span className="lesson-text">{lesson}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {module.lessons.length === 0 && (
                                        <div className="module-content">
                                            <button className="view-lessons-btn disabled">
                                                View Lessons
                                                <span className="arrow">→</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className="enrollment-section">
                    <div className="section-block">
                     <h2 className="section-title">Perks Of The Course</h2>
                     <div className="skills-grid">
                     {skillreed.map((skill, index) => (
                        <div key={index} className="skill-badge">
                        {skill}
                        </div>
                     ))}
                    </div>
                </div>
             </div>    
            </div>
                      <footer className="text-white text-center">
        <div className="bg-colors" style={{ borderBottom: "1px solid #323030",  height: "auto", }} >
          <div style={{ padding: "15px 0px",  borderBottom: "1px solid #363333",  }}  >
            <img src={logoImage} style={{ width: "182px" }} alt="logo" />
          </div>
         
          <div className=" container" style={{ padding: "15px 10px", paddingBottom: "0px", marginBottom: "15px", }}>
            <div className="row">
              <div className="col-lg-3 col-6"> <p className="footer-pvt " >  @{new Date().getFullYear()} juristbot.ai All Rights Reserved.</p></div>
              <div className="col-lg-3 col-6">
                <p className="footer-pvt "><Link className="footerdecoration" to="/Privacy_Policy"> Privacy Policy</Link></p></div>
              <div className="col-lg-3 col-6"><p className="footer-pvt"><Link className="footerdecoration" to="/Refundpolicy">  Refund policy  </Link></p></div>
              <div className="col-lg-3 col-6"><p className="footer-pvt"><Link className="footerdecoration" to="/Terms"> Terms & Conditions</Link></p></div>
            </div>
          </div>
        </div>
      </footer>
        </div>

    )
}

export default Chaterone
