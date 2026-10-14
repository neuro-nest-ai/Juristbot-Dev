import React from "react";
import { Link } from "react-router-dom";
import RobotIcon from '../assetes/botlogo.svg'
import "./footer.css";

const legalTools = [
  { label: "AI Legal Research", to: "/ai-legal-research-software-chatbot-assistant-juristbot-ai" },
  { label: "Scenario Solver", to: "/ai-legal-scenario-solver-and-legal-case-analysis-juristbot-ai" },
  { label: "AI Legal Drafting", to: "/ai-legal-drafting-software-chatbot-juristbot-ai" },
  { label: "AI Cross Examination", to: "/ai-legal-cross-examination-chabot-juristbot-ai" },
  { label: "Judgment Finder", to: "/ai-legal-judgment-finder-for-indian-case-law-juristbot-ai" },
];

const company = [
  { label: "About Us", href: "#about" },
  { label: "Our Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact Us", href: "#contact" },
];

const legal = [
  { label: "Privacy Policy", to: "/Privacy_Policy" },
  { label: "Terms & Conditions", to: "/Terms" },
  { label: "Refund Policy", to: "/Refundpolicy" },
];



const FooterLink = ({ item }) =>
  item.to ? (
    <Link to={item.to} className="jb-footer-link">
      {item.label}
    </Link>
  ) : (
    <a href={item.href} className="jb-footer-link">
      {item.label}
    </a>
  );

const FooterColumn = ({ title, items }) => (
  <div className="jb-footer-col">
    <h4 className="jb-footer-col-title">{title}</h4>
    <ul className="jb-footer-list">
      {items.map((item) => (
        <li key={item.label}>
          <FooterLink item={item} />
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer className="jb-footer">
    <div className="jb-footer-inner">
      <div className="jb-footer-brand">
        <div className="jb-footer-brand-head">
          <img src={RobotIcon} alt="logo"/>
          <h3 className="jb-footer-tagline">
            Your Legal Assistant,
            <span className="jb-footer-accent"> Always.</span>
          </h3>
        </div>
        <p className="jb-footer-desc">
          AI-powered legal assistant for Indian Law.
          <br />
          Draft, Research, analyze and get answers-faster.
        </p>
      </div>

      <div className="jb-footer-divider" />

      <div className="jb-footer-cols">
        <FooterColumn title="Legal Tools" items={legalTools} />
        <FooterColumn title="Company" items={company} />
        <FooterColumn title="Legal" items={legal} />
      </div>
    </div>

    <div className="jb-footer-bottom">
      <p className="jb-footer-copy">
        @{new Date().getFullYear()} juristbot.ai All Rights Reserved.
      </p>
    </div>
  </footer>
);

export default Footer;