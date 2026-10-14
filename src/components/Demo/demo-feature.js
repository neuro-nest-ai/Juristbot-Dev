import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faLanguage, faPlay } from "@fortawesome/free-solid-svg-icons";
import './demo.css'
const DEMOS = [
  // English Videos
  {
    id: "BKSQ5kmj3q4",
    title: "Scenario Solver – Laws & Sections",
    category: "Scenario solver",
    lang: "English",
    desc: "Scenario Solver – Laws & Sections instantly identifies relevant legal provisions for any situation.Get accurate statutes, applicable sections, and contextual references to guide your legal strategy.",
  },
  {
    id: "O13Z2nZHL9Y",
    title: "Scenario Solver – Case Strategy",
    category: "Scenario solver",
    lang: "English",
    desc: "Scenario Solver – Case Strategy helps you analyze real-life legal situations and craft winning approaches.Receive AI-driven insights to outline arguments, anticipate challenges, and strengthen your case preparation.",
  },
  {
    id: "dIn5kABNZcA",
    title: "Scenario Solver – Researching Legal Topics",
    category: "Scenario solver",
    lang: "English",
    desc: "Scenario Solver – Researching Legal Topics streamlines your legal research with AI precision.Quickly access authoritative sources, case laws, and insights to support well-founded legal arguments.",
  },
  {
    id: "JLYzuHCZ7Js",
    title: "Scenario Solver – Analyzing Legal Documents",
    category: "Scenario solver",
    lang: "English",
    desc: "Scenario Solver – Analyzing Legal Documents swiftly reviews contracts, pleadings, and agreements.Extract key details, identify risks, and highlight relevant clauses for informed legal decision-making.",
  },
  {
    id: "Z9nYfoEaQtQ",
    title: "Cross Q\\A – Demo",
    category: "Cross Q\\A",
    lang: "English",
    desc: "Cross Q/A empowers legal professionals to simulate courtroom-style cross-examination with precision.Generate strategic, context-aware questions tailored to witness testimonies and legal arguments.",
  },
  {
    id: "n5NFVt-pTvs",
    title: "Legal Drafting – Demo",
    category: "Legal drafting",
    lang: "English",
    desc: "Instantly create precise legal drafts tailored to your unique requirements. Streamline your legal processes with quick, customized documents, saving time and ensuring accuracy with every draft.",
  },
  {
    id: "r0-LKM4TuIY",
    title: "Relevant Judgement – Demo",
    category: "Relevant judgement",
    lang: "English",
    desc: "Effortlessly explore a vast database of relevant judgments tailored to your cases, streamlining your legal research, and enhancing case preparation efficiency. Empower your practice with comprehensive insights at your fingertips, saving you valuable time and resources.",
  },

  // Hindi Videos
  {
    id: "k-IoWuEXNZA",
    title: "परिदृश्य सॉल्वर – कानून और अनुभाग",
    category: "Scenario solver",
    lang: "Hindi",
    desc: "परिदृश्य समाधानकर्ता - कानून और धाराएँ किसी भी स्थिति के लिए प्रासंगिक कानूनी प्रावधानों की तुरंत पहचान करती हैं। अपनी कानूनी रणनीति का मार्गदर्शन करने के लिए सटीक क़ानून, लागू धाराएँ और प्रासंगिक संदर्भ प्राप्त करें।",
  },
  {
    id: "sc0Vgi9Gk04",
    title: "परिदृश्य समाधानकर्ता केस रणनीति",
    category: "Scenario solver",
    lang: "Hindi",
    desc: `परिदृश्य समाधानकर्ता - केस रणनीति आपको वास्तविक जीवन की कानूनी स्थितियों का विश्लेषण करने और सफल दृष्टिकोण तैयार करने में मदद करती है।
तर्कों की रूपरेखा तैयार करने, चुनौतियों का पूर्वानुमान लगाने और अपने केस की तैयारी को मज़बूत बनाने के लिए AI-संचालित अंतर्दृष्टि प्राप्त करें।`},
  {
    id: "VpN813tYNKw",
    title: "परिदृश्य समाधानकर्ता कानूनी विषयों पर शोध",
    category: "Scenario solver",
    lang: "Hindi",
    desc: `परिदृश्य समाधानकर्ता - कानूनी विषयों पर शोध, AI परिशुद्धता के साथ आपके कानूनी शोध को सुव्यवस्थित करता है।
सुस्थापित कानूनी तर्कों का समर्थन करने के लिए आधिकारिक स्रोतों, केस कानूनों और जानकारियों तक त्वरित पहुँच प्राप्त करें।
`,
  },
  {
    id: "1Z6a4mPE7-Y",
    title: "कानूनी दस्तावेज़ों का विश्लेषण – परिदृश्य सॉल्वर",
    category: "Scenario solver",
    lang: "Hindi",
    desc: `परिदृश्य सॉल्वर – कानूनी दस्तावेजों का विश्लेषण
समझौतों, याचिकाओं और अनुबंधों की त्वरित समीक्षा करता है।
मुख्य विवरण निकालता है, जोखिमों की पहचान करता है, और प्रासंगिक धाराओं को उजागर करता है, जिससे कानूनी निर्णय लेने में सहायता मिलती है।
`,
  },
  {
    id: "bPqKT2KX1DQ",
    title: "ज्यूरिस्टबॉट कानूनी ड्राफ्टिंग",
    category: "Legal drafting",
    lang: "Hindi",
    desc: "अपनी विशिष्ट आवश्यकताओं के अनुरूप सटीक कानूनी ड्राफ्ट तुरंत तैयार करें। त्वरित, अनुकूलित दस्तावेज़ों के साथ अपनी कानूनी प्रक्रियाओं को सुव्यवस्थित करें, समय की बचत करें और प्रत्येक ड्राफ्ट की सटीकता सुनिश्चित करें",
  },
  {
    id: "vnxTrCEXC-k",
    title: "ज्यूरिस्टबॉट क्रॉस क्यू/ए",
    category: "Cross Q\\A",
    lang: "Hindi",
    desc: `क्रॉस क्यू/ए कानूनी पेशेवरों को अदालती शैली की जिरह को सटीकता से दोहराने में सक्षम बनाता है।गवाहों की गवाही और कानूनी तर्कों के अनुरूप रणनीतिक, संदर्भ-सचेत प्रश्न तैयार करें।`,
  },
  {
    id: "oXAhHDQ2-6E",
    title: "प्रासंगिक निर्णय डेमो",
    category: "Relevant judgement",
    lang: "Hindi",
    desc: "अपने मामलों के लिए प्रासंगिक निर्णयों के विशाल डेटाबेस को आसानी से देखें, अपने कानूनी शोध को सुव्यवस्थित करें और केस तैयारी की दक्षता बढ़ाएँ। अपनी उंगलियों पर व्यापक जानकारी के साथ अपने अभ्यास को सशक्त बनाएँ, जिससे आपका बहुमूल्य समय और संसाधन बचेंगे।",
  },
];

const FILTERS = ["ALL", "Scenario solver", "Legal drafting", "Cross Q\\A", "Relevant judgement", "Others"];

function Demofeature({ value = "", onChange, onSubmit, onSelect }) {
  const [selectedLang, setSelectedLang] = useState("English");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [query, setQuery] = useState(value || "");
  const [playing, setPlaying] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(query);
  };

  const handleLang = (lang) => {
    setSelectedLang(lang);
    onChange?.(lang);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMOS.filter((d) => {
      const byLang = d.lang === selectedLang;
      const byFilter = activeFilter === "ALL" ? true : d.category === activeFilter;
      const byQuery =
        !q || d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
      return byLang && byFilter && byQuery;
    });
  }, [activeFilter, query, selectedLang]);

  return (
    <div className="demo-feature-container">
      <h3 className="head-demo-feature">Product Demo</h3>
      <h6 className="mb-3">
        An interactive walkthrough with in-depth explanations to help you explore every aspect of our product.
      </h6>
      <div className="d-flex justify-content-between align-items-center gap-2">
        <form className="sb-wrap" onSubmit={handleSubmit} role="search" aria-label="Site search">
          <input
            type="search"
            className="sb-input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="sb-icon" type="submit" aria-label="Search">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>
        <div className="lang-container">
          <button className="lang-btn">
            <span className="lang-text">{selectedLang}</span>
            <FontAwesomeIcon icon={faLanguage} className="lang-icon" />
          </button>
          <div className="lang-dropdown">
            <div onClick={() => handleLang("English")}>English</div>
            <div onClick={() => handleLang("Hindi")}>हिन्दी</div>
          </div>
        </div>
      </div>

      <div className="filter-container mt-3">
        {FILTERS.map((opt) => (
          <button
            key={opt}
            className={`filter-btn ${activeFilter === opt ? "active" : ""}`}
            onClick={() => {
              setActiveFilter(opt);
              onSelect?.(opt);
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="demo-list pt-3">
        {filtered.map((d) => (
          <div key={d.id} className="demo-card mb-4 mt-1">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-6">
                <div className="media">
                  {playing === d.id ? (
                    <div className="player">
                      <iframe
                        src={`https://www.youtube.com/embed/${d.id}?autoplay=1&rel=0`}
                        title={d.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <button className="thumb" onClick={() => setPlaying(d.id)} aria-label={`Play ${d.title}`}>
                      <img src={`https://i.ytimg.com/vi/${d.id}/hqdefault.jpg`} alt={d.title} loading="lazy" />
                      <span className="play-pill">
                        <FontAwesomeIcon icon={faPlay} /> Play
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="copy">
                  <h4 className="demo-title">{d.title}</h4>
                  <p className="demo-desc">{d.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Demofeature;
