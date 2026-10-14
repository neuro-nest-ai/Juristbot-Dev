const dpdpData = {
  // Sector 01
  banking: {
    label: "Banking & Financial Services",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Consent Form (Data Principal)",
      "Consent Artefact",
      "Cookie Policy",
      "Data Fiduciary Registration Form (SDF)",
      "Data Protection Impact Assessment (DPIA)",
      "Data Retention & Deletion Policy",
      "Data Breach Incident Report",
      "Grievance Redressal Policy",
      "Cross-Border Data Transfer Agreement",
      "Data Processing Agreement (with vendors)",
      "Consent Withdrawal Form",
    ],
  },

  // Sector 02
  healthcare: {
    label: "Healthcare",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Patient Consent Form (Sensitive Data)",
      "Consent Artefact",
      "Cookie Policy",
      "Data Protection Impact Assessment (DPIA)",
      "Data Retention & Deletion Policy",
      "Data Breach Incident Report",
      "Grievance Redressal Policy",
      "Third-Party Data Sharing Agreement",
      "Consent Withdrawal Form",
    ],
  },

  // Sector 03
  ecommerce: {
    label: "E-Commerce & Digital Platforms",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Customer Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Cookie Consent Banner",
      "Child Data Protection Policy",
      "Data Retention & Deletion Policy",
      "Data Breach Incident Report",
      "Grievance Officer Appointment Letter",
      "Data Erasure / Right to be Forgotten Request Form",
      "Consent Withdrawal Form",
      "Terms of Service",
    ],
  },

  // Sector 04
  it_companies: {
    label: "IT Companies",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Employee Consent Form",
      "Client Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Processing Agreement (DPA)",
      "Data Protection Impact Assessment (DPIA)",
      "Employee Personal Data Handling Policy",
      "Cross-Border Data Transfer Agreement",
      "Data Breach Incident Report",
      "Grievance Redressal Policy",
      "Data Retention & Deletion Policy",
      "Sub-Processor Agreement",
    ],
  },

  // Sector 05
  telecom: {
    label: "Telecom & Internet",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Subscriber Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Subscriber Data Processing Policy",
      "Data Retention & Deletion Policy",
      "Data Breach Incident Report",
      "Grievance Officer Appointment Letter",
      "Data Processing Agreement (with OTT/App Partners)",
      "Consent Withdrawal Form",
    ],
  },

  // Sector 06
  hr_services: {
    label: "HR, Consulting & Professional Services",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Candidate Consent Form",
      "Employee Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Processing Agreement (with Client Companies)",
      "Data Retention & Deletion Policy",
      "Grievance Officer Appointment Letter",
      "Confidentiality & Data Handling Agreement",
      "Data Breach Incident Report",
      "Consent Withdrawal Form",
    ],
  },

  // Sector 07
  legal: {
    label: "Advocates / Law Firms / LPOs",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Client Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Retention & Deletion Policy",
      "Grievance Officer Appointment Letter",
      "Data Processing Agreement (for LPOs as Processors)",
      "Data Breach Incident Report",
      "Client Data Confidentiality Agreement",
    ],
  },

  // Sector 08
  education: {
    label: "Education Sector",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Parental / Guardian Consent Form (for Minors)",
      "Student Consent Form (Adults)",
      "Consent Artefact",
      "Cookie Policy",
      "Child Data Protection Policy",
      "Data Retention & Deletion Policy",
      "Grievance Redressal Policy",
      "Data Breach Incident Report",
      "Third-Party Sharing Agreement",
      "Consent Withdrawal Form",
    ],
  },

  // Sector 09
  real_estate: {
    label: "Real Estate & Property",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Buyer / Tenant Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Retention & Deletion Policy",
      "Grievance Officer Appointment Letter",
      "Data Breach Incident Report",
      "Data Processing Agreement (with Brokers/Portals)",
    ],
  },

  // Sector 10
  travel: {
    label: "Travel & Hospitality",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Guest / Traveller Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Retention & Deletion Policy",
      "Data Breach Incident Report",
      "Grievance Officer Appointment Letter",
      "Cross-Border Data Transfer Agreement",
      "Consent Withdrawal Form",
    ],
  },

  // Sector 11
  logistics: {
    label: "Logistics & Delivery",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Customer Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Retention & Deletion Policy",
      "Grievance Officer Appointment Letter",
      "Data Breach Incident Report",
      "Data Processing Agreement (with E-Commerce Clients)",
    ],
  },

  // Sector 12
  social_media: {
    label: "Social Media & Online Services",
    docs: [
      "Privacy Notice / Privacy Policy",
      "User Consent Form / Terms Acceptance",
      "Consent Artefact",
      "Cookie Policy",
      "Cookie Consent Banner",
      "Child Data Protection Policy",
      "Parental Consent Form (for Users Under 18)",
      "Data Retention & Deletion Policy",
      "Data Erasure / Right to be Forgotten Request Form",
      "Data Breach Incident Report",
      "Grievance Officer Appointment Letter",
      "Consent Withdrawal Form",
      "Data Fiduciary Registration Form (SDF)",
    ],
  },

  // Sector 13
  government: {
    label: "Government & Public Authorities",
    docs: [
      "Privacy Notice (Citizen-Facing)",
      "Citizen Consent Form (Where Applicable)",
      "Consent Artefact",
      "Cookie Policy",
      "Data Retention & Deletion Policy",
      "Data Breach Incident Report",
      "Grievance Redressal Mechanism",
      "Data Processing Agreement (with IT Vendors)",
    ],
  },

  // Sector 14
  ngo: {
    label: "NGOs & Trusts",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Donor / Beneficiary Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Retention & Deletion Policy",
      "Grievance Officer Appointment Letter",
      "Data Breach Incident Report",
    ],
  },

  // Sector 15
  marketing: {
    label: "Marketing & Advertising",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Marketing Consent Form (Opt-in)",
      "Consent Artefact",
      "Cookie Policy",
      "Cookie Consent Banner",
      "Consent Withdrawal / Opt-out Form",
      "Data Processing Agreement (with Lead Gen Firms)",
      "Grievance Redressal Policy",
      "Data Retention & Deletion Policy",
      "Data Breach Incident Report",
    ],
  },

  // Sector 16
  bpo_kpo: {
    label: "BPO / KPO / Cloud & Data Processing Services",
    docs: [
      "Privacy Notice / Privacy Policy",
      "Employee Consent Form",
      "Consent Artefact",
      "Cookie Policy",
      "Data Processing Agreement (as Data Processor)",
      "Sub-Processor Agreement",
      "Cross-Border Data Transfer Agreement",
      "Data Retention & Deletion Policy",
      "Data Breach Incident Report",
      "Grievance Officer Appointment Letter",
      "Data Protection Impact Assessment (DPIA)",
    ],
  },
  insurance: {
    label: "Insurance",
    docs: [
      "Privacy Notice",
      "Consent Artefact",
      "Consent Withdrawal Form",
      "Cookie Policy",
      "Data Breach Incident Report",
      "Data Retention & Deletion Policy",
      "DPIA",
      "Grievance Officer Appointment Letter",
      "Policyholder Consent Form",
    ],
  },
};

export default dpdpData;