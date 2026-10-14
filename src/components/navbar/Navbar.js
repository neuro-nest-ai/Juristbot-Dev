// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPenToSquare, faTrash, faSun, faMoon, faClockRotateLeft, faBarsStaggered,
//   faMagnifyingGlass, faXmark, faComment,
//   faUser, faGraduationCap, faCreditCard,
//   faWandMagicSparkles, faFolderOpen, faRightFromBracket, faChevronRight,
// } from "@fortawesome/free-solid-svg-icons";
// import "./navbar.css";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import config from "../config/config";
// import axiosInstance from "../config/apiconfig";
// import { useAuth } from "../AuthContext";
// import { usePlanData } from "../../hooks/usePlanData";
// import dpdpData from "./dpdpData";
// import logo from '../Assets/logojuristbot.svg'


// const HISTORY_PAGE_SIZE = 20;
// const SEARCH_FETCH_LIMIT = 200;

// function Navbar() {
//   const { user } = useAuth();
//   const [visible, setVisible] = useState(false);
//   const { planData, planLoading } = usePlanData();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [scenarios, setScenarios] = useState([]);
//   const is_course_active = planData?.user_active?.is_course_active;
//   const username = user?.username || "Guest";
//   const Role = user?.role || "Guest";
//   const navigate = useNavigate();
//   const location = useLocation();
//   const menuRef = useRef();
//   const navref = useRef();
//   const oldchat = user?.oldchat;

//   const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "dark");

//   useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//     localStorage.setItem("app-theme", theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === "dark" ? "light" : "dark"));
//   };

//   const handleLogoutClick = () => setMenuOpen(!menuOpen);

//   const handleClickOutside = (event) => {
//     if (menuRef.current && !menuRef.current.contains(event.target)) {
//       setMenuOpen(false);
//     }
//     if (navref.current && !navref.current.contains(event.target)) {
//       setVisible(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

//   const openDeleteModal = (id) => setDeleteModal({ open: true, id });
//   const closeDeleteModal = () => setDeleteModal({ open: false, id: null });

//   const confirmDelete = () => {
//     if (deleteModal.id) {
//       deletescnario(deleteModal.id);
//     }
//     closeDeleteModal();
//   };

//   // ── History pagination (server-side limit/skip) ───────────────────────────
//   const [scenariosLoading, setScenariosLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [historySkip, setHistorySkip] = useState(0);
//   const [hasMoreHistory, setHasMoreHistory] = useState(false);

//   const fetchScenarios = useCallback(async (skip = 0, append = false) => {
//     const id = user?.id;
//     if (!id) {
//       setScenariosLoading(false);
//       return;
//     }

//     if (append) {
//       setLoadingMore(true);
//     } else {
//       setScenariosLoading(true);
//     }

//     try {
//       const response = await axiosInstance.get(
//         `/history/commonhistory/${id}?limit=${HISTORY_PAGE_SIZE}&skip=${skip}`
//       );
//       const payload = response.data;
//       const data = Array.isArray(payload) ? payload : payload?.data || [];
//       const hasMore = Array.isArray(payload) ? false : !!payload?.hasMore;

//       setScenarios((prev) => (append ? [...prev, ...data] : data));
//       setHasMoreHistory(hasMore);
//       setHistorySkip(skip + data.length);
//     } catch (err) {
//       if (err.response && err.response.status === 404) {
//         console.log("Scenarios not found for this user");
//         if (!append) {
//           setScenarios([]);
//         }
//         setHasMoreHistory(false);
//       }
//     } finally {
//       setScenariosLoading(false);
//       setLoadingMore(false);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     fetchScenarios(0, false);
//   }, [fetchScenarios]);

//   const handleViewMoreHistory = () => {
//     if (loadingMore) return;
//     fetchScenarios(historySkip, true);
//   };

//   // ── New chat title-a letter-by-letter type panna ──
//   useEffect(() => {
//     const handleScenarioCreated = (e) => {
//       const { session_id, title } = e.detail || {};
//       if (!session_id) return;

//       const fullTitle = title || "New chat";

//       // Empty title-oda item-a top la add pannu
//       setScenarios((prev) => {
//         if (prev.some((s) => s.session_id === session_id)) return prev;
//         return [{ session_id, title: "", isNew: true }, ...prev];
//       });

//       let i = 0;
//       const typeSpeed = 45;
//       const typer = setInterval(() => {
//         i += 1;
//         const partial = fullTitle.slice(0, i);
//         setScenarios((prev) =>
//           prev.map((s) =>
//             s.session_id === session_id ? { ...s, title: partial } : s
//           )
//         );
//         if (i >= fullTitle.length) {
//           clearInterval(typer);
//           setScenarios((prev) =>
//             prev.map((s) =>
//               s.session_id === session_id ? { ...s, isNew: false } : s
//             )
//           );
//         }
//       }, typeSpeed);
//     };

//     window.addEventListener("scenario:created", handleScenarioCreated);
//     return () => window.removeEventListener("scenario:created", handleScenarioCreated);
//   }, []);

//   const deleteHistory = async (id, endpoint) => {
//     try {
//       const response = await axiosInstance.delete(`/history/${endpoint}/${id}`);
//       if (response.status === 200) {
//         setScenarios((prev) => prev.filter((s) => s.session_id !== id));
//         setSearchList((prev) => prev.filter((s) => s.session_id !== id));
//         fetchScenarios(0, false);
//         if (location.pathname === `/C/${id}`) {
//           navigate("/chat");
//         }
//       }
//     } catch (err) {
//       console.error("Error deleting history:", err);
//       toast.error("An error occurred while deleting the history");
//     }
//   };

//   const deletescnario = (id) => deleteHistory(id, "commonhistorydelete");

//   const handleLogout = async () => {
//     try {
//       const id = user?.id;
//       if (id) {
//         await axios.post(`${config.apiBaseUrl}/auth/logout`, { id });
//       }
//       localStorage.clear();
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("Error during logout:", error.message);
//       alert("Failed to logout. Please try again.");
//     }
//   };

//   const generateUUID = () => {
//     return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
//       const r = (Math.random() * 16) | 0,
//         v = c === "x" ? r : (r & 0x3) | 0x8;
//       return v.toString(16);
//     });
//   };

//   const startScenarioChat = () => {
//     const newId = generateUUID();
//     localStorage.setItem("session_id", newId);
//     navigate("/chat", { state: { newChat: true, ts: Date.now() } });
//   };

//   // ── History search popup ──────────────────────────────────────────────────
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchList, setSearchList] = useState([]);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const searchInputRef = useRef(null);
//   const searchListRef = useRef(null);

//   const openSearch = async () => {
//     setSearchOpen(true);
//     setSearchTerm("");
//     setActiveIndex(0);
//     setSearchList(scenarios); // already load aana list-a udane kaattu

//     const id = user?.id;
//     if (!id) return;

//     setSearchLoading(true);
//     try {
//       const res = await axiosInstance.get(
//         `/history/commonhistory/${id}?limit=${SEARCH_FETCH_LIMIT}&skip=0`
//       );
//       const payload = res.data;
//       const data = Array.isArray(payload) ? payload : payload?.data || [];
//       setSearchList(data);
//     } catch (err) {
//       console.log("Search history fetch failed");
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const closeSearch = () => {
//     setSearchOpen(false);
//     setSearchTerm("");
//     setActiveIndex(0);
//   };

//   const filteredSearch = searchList.filter((s) =>
//     (s.title || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
//   );

//   const goToChat = (session_id) => {
//     closeSearch();
//     setVisible(false);
//     navigate(`/C/${session_id}`);
//   };

//   // Esc close + auto focus
//   useEffect(() => {
//     if (!searchOpen) return;

//     const onKey = (e) => {
//       if (e.key === "Escape") closeSearch();
//     };
//     document.addEventListener("keydown", onKey);
//     const t = setTimeout(() => searchInputRef.current?.focus(), 50);

//     return () => {
//       document.removeEventListener("keydown", onKey);
//       clearTimeout(t);
//     };
//   }, [searchOpen]);

//   // Keyboard-la move panna active item-a scroll pannu
//   useEffect(() => {
//     if (!searchOpen || !searchListRef.current) return;
//     const el = searchListRef.current.querySelector(".chat-search-item.active");
//     if (el) el.scrollIntoView({ block: "nearest" });
//   }, [activeIndex, searchOpen]);

//   const handleSearchKeyDown = (e) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setActiveIndex((i) => Math.min(i + 1, filteredSearch.length - 1));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setActiveIndex((i) => Math.max(i - 1, 0));
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       const item = filteredSearch[activeIndex];
//       if (item) goToChat(item.session_id);
//     }
//   };
//   // ──────────────────────────────────────────────────────────────────────────

//   const isProfessional = Role === "lawyer" || Role === "Advocate";

//   const hasMembership = planData?.user_active?.membership === 1;

//   const profilePath = planLoading
//     ? null
//     : hasMembership && isProfessional
//       ? "/listingprofile"
//       : "/profile";

//   // ── Sidebar tab state (History / DPDP Shield) ──────────────────────────────
//   const [activeNavTab, setActiveNavTab] = useState("history");
//   const [selectedSector, setSelectedSector] = useState(null);

//   const handleSectorClick = (sectorKey) => {
//     setSelectedSector(sectorKey);
//   };

//   const handleBackToSectors = () => { setSelectedSector(null); };


//   const handleDocClick = (sectorKey, docName) => {
//     const sector = dpdpData[sectorKey];
//     const prompt = `Draft a DPDP Act compliant "${docName}" for the ${sector.label} sector.`;

//     const newId = generateUUID();
//     localStorage.setItem("session_id", newId);

//     navigate("/chat", { state: { dpdpPrompt: prompt, ts: Date.now() } });
//   };
//   // ────────────────────────────────────────────────────────────────────────────

//   const formatHistoryDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     if (isNaN(d)) return "";

//     const now = new Date();
//     const diffMs = now - d;

//     if (diffMs < 60 * 60 * 1000) return "Past hour";

//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
//     const dayDiff = Math.round((startOfToday - startOfDate) / 86400000);

//     if (dayDiff <= 0) return "Today";
//     if (dayDiff === 1) return "Yesterday";
//     if (dayDiff < 7) return `${dayDiff} days ago`;
//     if (dayDiff < 30) return `${Math.floor(dayDiff / 7)} weeks ago`;

//     return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
//   };

//   return (
//     <>
//       <ToastContainer />
//       <div className="top-nav">
//         <FontAwesomeIcon icon={faBarsStaggered} className="mobile-nav-btn" onClick={() => setVisible((prev) => !prev)} />
//         <img src={logo} alt="logo" className="top-logo" />
//         <div className="profile">
//           <div className="profile">
//             <label className="qx-theme-switch">
//               <input type="checkbox" checked={theme === "light"} onChange={toggleTheme} />
//               <span className="qx-theme-slider qx-theme-round">
//                 <FontAwesomeIcon icon={faSun} className="sun-icon" />
//                 <FontAwesomeIcon icon={faMoon} className="moon-icon" />
//               </span>
//             </label>
//           </div>
//           <div className="qx-menu-wrap" ref={menuRef}>
//             <div
//               className={`profileimage ${menuOpen ? "is-open" : ""}`}
//               onClick={handleLogoutClick}
//             >
//               <h6 className="firstletterchar">{username ? username.charAt(0).toUpperCase() : "G"}</h6>
//             </div>

//             {menuOpen && (
//               <div className="qx-menu" onClick={() => setMenuOpen(false)}>
//                 {/* User header */}
//                 <div className="qx-menu-head">
//                   <div className="qx-menu-avatar">{username.charAt(0).toUpperCase()}</div>
//                   <div className="qx-menu-user">
//                     <span className="qx-menu-name">{username}</span>
//                     <span className="qx-menu-role">{Role}</span>
//                   </div>
//                 </div>

//                 <div className="qx-menu-group">
//                   <Link to={profilePath || "/profile"} className="qx-menu-item">
//                     <span className="qx-menu-icon"><FontAwesomeIcon icon={faUser} /></span>
//                     <span className="qx-menu-label">Profile</span>
//                     <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
//                   </Link>

//                   {["Advocate", "Judge", "Company", "lawyer", "Student"].includes(Role) &&
//                     is_course_active === 1 && (
//                       <Link to="/mycourse" className="qx-menu-item">
//                         <span className="qx-menu-icon"><FontAwesomeIcon icon={faGraduationCap} /></span>
//                         <span className="qx-menu-label">Courses</span>
//                         <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
//                       </Link>
//                     )}

//                   <Link to="/payment-history" className="qx-menu-item">
//                     <span className="qx-menu-icon"><FontAwesomeIcon icon={faCreditCard} /></span>
//                     <span className="qx-menu-label">Manage Payment</span>
//                     <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
//                   </Link>

//                   <Link to="/demo-feature" className="qx-menu-item">
//                     <span className="qx-menu-icon"><FontAwesomeIcon icon={faWandMagicSparkles} /></span>
//                     <span className="qx-menu-label">Demo Feature</span>
//                     <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
//                   </Link>

//                   <Link to="/documents" className="qx-menu-item">
//                     <span className="qx-menu-icon"><FontAwesomeIcon icon={faFolderOpen} /></span>
//                     <span className="qx-menu-label">Documents</span>
//                     <span className="qx-menu-badge">New</span>
//                   </Link>
//                 </div>

//                 <div className="qx-menu-divider" />

//                 <button type="button" className="qx-menu-item qx-menu-logout" onClick={handleLogout}>
//                   <span className="qx-menu-icon"><FontAwesomeIcon icon={faRightFromBracket} /></span>
//                   <span className="qx-menu-label">Log out</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//       </div>
//       <div className="">
//         <nav ref={navref} className={visible ? "navbars open" : "navbars"}>
//           <div className="nav-top">
//             <div className="nav-fixed-top">
//               <div className="newchat-row">
//                 <button type="button" className="newchatbtn" onClick={startScenarioChat}>
//                   New chat
//                   <FontAwesomeIcon icon={faPenToSquare} />
//                 </button>
//                 <button
//                   type="button"
//                   className="history-search-btn"
//                   title="Search chats"
//                   aria-label="Search chats"
//                   onClick={openSearch}
//                 >
//                   <FontAwesomeIcon icon={faMagnifyingGlass} />
//                 </button>
//               </div>

//                <div className="nav-tab-switch nav-tab-switch-3">
//                 <button
//                   type="button"
//                   className={`nav-tab-btn ${activeNavTab === "history" ? "active" : ""}`}
//                   onClick={() => setActiveNavTab("history")}
//                 >
//                   History
//                 </button>
//                 <button
//                   type="button"
//                   className={`nav-tab-btn ${activeNavTab === "dpdp" ? "active" : ""}`}
//                   onClick={() => setActiveNavTab("dpdp")}
//                 >
//                   DPDP
//                 </button>
//                 <button
//                   type="button"
//                   className={`nav-tab-btn ${activeNavTab === "ecourts" ? "active" : ""}`}
//                   onClick={() => setActiveNavTab("ecourts")}
//                 >
//                   E-Courts
//                 </button>
//               </div>
//             </div>
//             <div className="scrollable">
//               {activeNavTab === "history" && (
//                 <div style={{ padding: "5px 0px" }}>
//                   {scenariosLoading ? (
//                     <div className="history-loading-state">
//                       {Array.from({ length: 8 }).map((_, i) => (
//                         <div key={i} className="history-skeleton-item" />
//                       ))}
//                     </div>
//                   ) : scenarios.length === 0 ? (
//                     <div className="history-empty-state">
//                       <svg
//                         className="history-empty-wave-bg"
//                         viewBox="0 0 325 410"
//                         preserveAspectRatio="xMaxYMin slice"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <defs>
//                           <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
//                             <stop offset="0%" stopColor="#ffce2d" stopOpacity="0.9" />
//                             <stop offset="100%" stopColor="#3a350d" stopOpacity="0.1" />
//                           </linearGradient>
//                         </defs>
//                         {Array.from({ length: 14 }).map((_, i) => {
//                           const offset = i * 6;
//                           return (
//                             <path
//                               key={i}
//                               d={`M ${60 + offset},0 
//                                   C ${180 + offset},40 ${20 + offset},90 ${160 + offset},140
//                                   C ${280 + offset},180 ${40 + offset},220 ${180 + offset},270
//                                   C ${300 + offset},310 ${60 + offset},350 ${200 + offset},400`}
//                               fill="none"
//                               stroke="url(#waveGrad)"
//                               strokeWidth="0.6"
//                               opacity={0.15 + (i % 5) * 0.12}
//                             />
//                           );
//                         })}
//                       </svg>

//                       <div className="history-empty-icon-wrap">
//                         <FontAwesomeIcon icon={faClockRotateLeft} className="history-empty-icon" />
//                       </div>
//                       <p className="history-empty-text">No history found</p>
//                       <span className="history-empty-subtext">
//                         Your recent conversations will show up here
//                       </span>
//                     </div>
//                   ) : (
//                     <>
//                       {scenarios.map((scenario) => (
//                         <Link
//                           className={`linkings ${location.pathname === `/C/${scenario.session_id}` ? "active-history-item" : ""}${scenario.isNew ? " history-item-new" : ""}`}
//                           to={`/C/${scenario.session_id}`}
//                           key={scenario.session_id}
//                         >
//                           <p className="texthistory1"> {scenario.title}  {scenario.isNew && <span className="typing-cursor">|</span>}</p>
//                           <span className="trashicon">
//                             <FontAwesomeIcon
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 openDeleteModal(scenario.session_id);
//                               }}
//                               icon={faTrash}
//                             />
//                           </span>
//                         </Link>
//                       ))}

//                       {hasMoreHistory && (
//                         <button
//                           type="button"
//                           className="view-more-history-btn"
//                           onClick={handleViewMoreHistory}
//                           disabled={loadingMore}
//                         >
//                           {loadingMore ? "Loading..." : "View more"}
//                         </button>
//                       )}
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* ── DPDP SHIELD PANEL ── */}
//               {activeNavTab === "dpdp" && (
//                 <div className="dpdp-panel">
//                   {selectedSector === null ? (
//                     // Level 1: sector list
//                     Object.entries(dpdpData).map(([key, sector]) => (
//                       <div
//                         key={key}
//                         className="dpdp-sector-item"
//                         onClick={() => handleSectorClick(key)}
//                       >
//                         {sector.label}
//                       </div>
//                     ))
//                   ) : (
//                     // Level 2: document list for selected sector
//                     <>
//                       <div className="dpdp-back-row" onClick={handleBackToSectors}>
//                         ← {dpdpData[selectedSector].label}
//                       </div>
//                       {dpdpData[selectedSector].docs.map((doc, i) => (
//                         <div
//                           key={i}
//                           className="dpdp-doc-item-nav"
//                           onClick={() => handleDocClick(selectedSector, doc)}
//                         >
//                           {doc}
//                         </div>
//                       ))}
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="profile-section">
//             {oldchat === 1 ? (
//               <div className="split-button-container">
//                 <Link className="split-btn split-btn-left" to="/chathistory">
//                   <span className="textupgrade">Old History</span>
//                 </Link>
//                 <div className="split-divider"></div>
//                 <Link className="split-btn split-btn-right" to="/Subscription">
//                   <span className="textupgrade">Upgrade Plan</span>
//                 </Link>
//               </div>
//             ) : (
//               <div className="split-button-container">
//                 <Link className="split-btn split-btn-full" to="/Subscription">
//                   <span className="textupgrade">Upgrade Plan</span>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </nav>
//       </div>

//       {/* ── SEARCH POPUP ── */}
//       {searchOpen && (
//         <div className="chat-search-overlay" onClick={closeSearch}>
//           <div className="chat-search-box" onClick={(e) => e.stopPropagation()}>
//             <div className="chat-search-head">
//               <FontAwesomeIcon icon={faMagnifyingGlass} className="chat-search-head-icon" />
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 className="chat-search-input"
//                 placeholder="Search chats"
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setActiveIndex(0);
//                 }}
//                 onKeyDown={handleSearchKeyDown}
//               />
//               <FontAwesomeIcon
//                 icon={faXmark}
//                 className="chat-search-close"
//                 onClick={closeSearch}
//               />
//             </div>

//             <div className="chat-search-list" ref={searchListRef}>
//               {searchLoading && filteredSearch.length === 0 ? (
//                 <div className="chat-search-empty">Loading chats...</div>
//               ) : filteredSearch.length === 0 ? (
//                 <div className="chat-search-empty">
//                   No chats match "{searchTerm.trim()}"
//                 </div>
//               ) : (
//                 filteredSearch.map((item, i) => (
//                   <div
//                     key={item.session_id}
//                     className={`chat-search-item ${i === activeIndex ? "active" : ""}`}
//                     onMouseEnter={() => setActiveIndex(i)}
//                     onClick={() => goToChat(item.session_id)}
//                   >
//                     <FontAwesomeIcon icon={faComment} className="chat-search-item-icon" />
//                     <span className="chat-search-item-title">{item.title || "New chat"}</span>
//                     {i === activeIndex ? (
//                       <span className="chat-search-enter">Enter</span>
//                     ) : (
//                       <span className="chat-search-date">{formatHistoryDate(item.Date)}</span>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {deleteModal.open && (
//         <div className="edit-modal-overlay" onClick={closeDeleteModal}>
//           <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
//             <h6 className="delete-modal-title">Delete this chat?</h6>
//             <p className="delete-modal-text">
//               This will permanently remove this conversation. This action cannot be undone.
//             </p>
//             <div className="edit-modal-actions">
//               <button className="edit-modal-cancel" onClick={closeDeleteModal}>
//                 Cancel
//               </button>
//               <button className="delete-modal-confirm" onClick={confirmDelete}>
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
// export default Navbar;

// Secomnd version of the code with some improvements and optimizations:



// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPenToSquare, faTrash, faSun, faMoon, faClockRotateLeft, faBarsStaggered,
//   faMagnifyingGlass, faXmark, faComment,
//   faUser, faGraduationCap, faCreditCard,
//   faWandMagicSparkles, faFolderOpen, faRightFromBracket, faChevronRight,
//   faScaleBalanced, faCalendarDays, faArrowsRotate, faShieldHalved,
//   faRobot, faStore, faBookOpen, faChevronDown, faCircleCheck,
// } from "@fortawesome/free-solid-svg-icons";
// import "./navbar.css";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import config from "../config/config";
// import axiosInstance from "../config/apiconfig";
// import { useAuth } from "../AuthContext";
// import { usePlanData } from "../../hooks/usePlanData";
// import dpdpData from "./dpdpData";
// import logo from '../Assets/logojuristbot.svg'


// const HISTORY_PAGE_SIZE = 20;
// const SEARCH_FETCH_LIMIT = 200;

// // ── eCourts sidebar links (shown when the URL starts with /ecourt) ──────────
// const ECOURT_LINKS = [
//   { to: "/ecourt", label: "eCourts Home", icon: faScaleBalanced, exact: true },
//   { to: "/ecourt/search", label: "Case Search", icon: faMagnifyingGlass },
//   { to: "/ecourt/causelist", label: "Cause List", icon: faCalendarDays },
//   { to: "/ecourt/refresh", label: "Bulk Refresh", icon: faArrowsRotate },
//   { to: "/ecourt/legal-check", label: "Legal Check", icon: faShieldHalved },
// ];

// // Marketplace / Citations pages (routes in App.js)
// const EXTRA_MODULES = [
//   { key: "marketplace", to: "/marketplace", label: "Marketplace", icon: faStore },
//   { key: "citations", to: "/citations", label: "Citations", icon: faBookOpen },
// ];

// // ── Citations sidebar links (shown under "Citations" on /citations pages) ───
// // mode=verify opens the "Verify a citation" tab of the Citations page.
// const CITATION_LINKS = [
//   { key: "search", to: "/citations", label: "Search Judgments", icon: faMagnifyingGlass },
//   { key: "verify", to: "/citations?mode=verify", label: "Verify Citation", icon: faCircleCheck },
// ];

// // Indha paths-la "Workspace" sidebar (AI Tools / e-Courts / Marketplace / Citations) varum
// const MODULE_ROOTS = ["/ecourt", ...EXTRA_MODULES.map((m) => m.to)];
// const underPath = (pathname, root) => pathname === root || pathname.startsWith(`${root}/`);

// function Navbar() {
//   const { user } = useAuth();
//   const [visible, setVisible] = useState(false);
//   const { planData, planLoading } = usePlanData();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [scenarios, setScenarios] = useState([]);
//   const is_course_active = planData?.user_active?.is_course_active;
//   const username = user?.username || "Guest";
//   const Role = user?.role || "Guest";
//   const navigate = useNavigate();
//   const location = useLocation();
//   const menuRef = useRef();
//   const navref = useRef();
//   const oldchat = user?.oldchat;

//   const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "dark");

//   useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//     localStorage.setItem("app-theme", theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === "dark" ? "light" : "dark"));
//   };

//   const handleLogoutClick = () => setMenuOpen(!menuOpen);

//   const handleClickOutside = (event) => {
//     if (menuRef.current && !menuRef.current.contains(event.target)) {
//       setMenuOpen(false);
//     }
//     if (navref.current && !navref.current.contains(event.target)) {
//       setVisible(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

//   const openDeleteModal = (id) => setDeleteModal({ open: true, id });
//   const closeDeleteModal = () => setDeleteModal({ open: false, id: null });

//   const confirmDelete = () => {
//     if (deleteModal.id) {
//       deletescnario(deleteModal.id);
//     }
//     closeDeleteModal();
//   };

//   // ── History pagination (server-side limit/skip) ───────────────────────────
//   const [scenariosLoading, setScenariosLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [historySkip, setHistorySkip] = useState(0);
//   const [hasMoreHistory, setHasMoreHistory] = useState(false);

//   const fetchScenarios = useCallback(async (skip = 0, append = false) => {
//     const id = user?.id;
//     if (!id) {
//       setScenariosLoading(false);
//       return;
//     }

//     if (append) {
//       setLoadingMore(true);
//     } else {
//       setScenariosLoading(true);
//     }

//     try {
//       const response = await axiosInstance.get(
//         `/history/commonhistory/${id}?limit=${HISTORY_PAGE_SIZE}&skip=${skip}`
//       );
//       const payload = response.data;
//       const data = Array.isArray(payload) ? payload : payload?.data || [];
//       const hasMore = Array.isArray(payload) ? false : !!payload?.hasMore;

//       setScenarios((prev) => (append ? [...prev, ...data] : data));
//       setHasMoreHistory(hasMore);
//       setHistorySkip(skip + data.length);
//     } catch (err) {
//       if (err.response && err.response.status === 404) {
//         console.log("Scenarios not found for this user");
//         if (!append) {
//           setScenarios([]);
//         }
//         setHasMoreHistory(false);
//       }
//     } finally {
//       setScenariosLoading(false);
//       setLoadingMore(false);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     fetchScenarios(0, false);
//   }, [fetchScenarios]);

//   const handleViewMoreHistory = () => {
//     if (loadingMore) return;
//     fetchScenarios(historySkip, true);
//   };

//   // ── New chat title-a letter-by-letter type panna ──
//   useEffect(() => {
//     const handleScenarioCreated = (e) => {
//       const { session_id, title } = e.detail || {};
//       if (!session_id) return;

//       const fullTitle = title || "New chat";

//       // Empty title-oda item-a top la add pannu
//       setScenarios((prev) => {
//         if (prev.some((s) => s.session_id === session_id)) return prev;
//         return [{ session_id, title: "", isNew: true }, ...prev];
//       });

//       let i = 0;
//       const typeSpeed = 45;
//       const typer = setInterval(() => {
//         i += 1;
//         const partial = fullTitle.slice(0, i);
//         setScenarios((prev) =>
//           prev.map((s) =>
//             s.session_id === session_id ? { ...s, title: partial } : s
//           )
//         );
//         if (i >= fullTitle.length) {
//           clearInterval(typer);
//           setScenarios((prev) =>
//             prev.map((s) =>
//               s.session_id === session_id ? { ...s, isNew: false } : s
//             )
//           );
//         }
//       }, typeSpeed);
//     };

//     window.addEventListener("scenario:created", handleScenarioCreated);
//     return () => window.removeEventListener("scenario:created", handleScenarioCreated);
//   }, []);

//   const deleteHistory = async (id, endpoint) => {
//     try {
//       const response = await axiosInstance.delete(`/history/${endpoint}/${id}`);
//       if (response.status === 200) {
//         setScenarios((prev) => prev.filter((s) => s.session_id !== id));
//         setSearchList((prev) => prev.filter((s) => s.session_id !== id));
//         fetchScenarios(0, false);
//         if (location.pathname === `/C/${id}`) {
//           navigate("/chat");
//         }
//       }
//     } catch (err) {
//       console.error("Error deleting history:", err);
//       toast.error("An error occurred while deleting the history");
//     }
//   };

//   const deletescnario = (id) => deleteHistory(id, "commonhistorydelete");

//   const handleLogout = async () => {
//     try {
//       const id = user?.id;
//       if (id) {
//         await axios.post(`${config.apiBaseUrl}/auth/logout`, { id });
//       }
//       localStorage.clear();
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("Error during logout:", error.message);
//       alert("Failed to logout. Please try again.");
//     }
//   };

//   const generateUUID = () => {
//     return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
//       const r = (Math.random() * 16) | 0,
//         v = c === "x" ? r : (r & 0x3) | 0x8;
//       return v.toString(16);
//     });
//   };

//   const startScenarioChat = () => {
//     const newId = generateUUID();
//     localStorage.setItem("session_id", newId);
//     navigate("/chat", { state: { newChat: true, ts: Date.now() } });
//   };

//   // ── History search popup ──────────────────────────────────────────────────
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchList, setSearchList] = useState([]);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const searchInputRef = useRef(null);
//   const searchListRef = useRef(null);

//   const openSearch = async () => {
//     setSearchOpen(true);
//     setSearchTerm("");
//     setActiveIndex(0);
//     setSearchList(scenarios); // already load aana list-a udane kaattu

//     const id = user?.id;
//     if (!id) return;

//     setSearchLoading(true);
//     try {
//       const res = await axiosInstance.get(
//         `/history/commonhistory/${id}?limit=${SEARCH_FETCH_LIMIT}&skip=0`
//       );
//       const payload = res.data;
//       const data = Array.isArray(payload) ? payload : payload?.data || [];
//       setSearchList(data);
//     } catch (err) {
//       console.log("Search history fetch failed");
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const closeSearch = () => {
//     setSearchOpen(false);
//     setSearchTerm("");
//     setActiveIndex(0);
//   };

//   const filteredSearch = searchList.filter((s) =>
//     (s.title || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
//   );

//   const goToChat = (session_id) => {
//     closeSearch();
//     setVisible(false);
//     navigate(`/C/${session_id}`);
//   };

//   // Esc close + auto focus
//   useEffect(() => {
//     if (!searchOpen) return;

//     const onKey = (e) => {
//       if (e.key === "Escape") closeSearch();
//     };
//     document.addEventListener("keydown", onKey);
//     const t = setTimeout(() => searchInputRef.current?.focus(), 50);

//     return () => {
//       document.removeEventListener("keydown", onKey);
//       clearTimeout(t);
//     };
//   }, [searchOpen]);

//   // Keyboard-la move panna active item-a scroll pannu
//   useEffect(() => {
//     if (!searchOpen || !searchListRef.current) return;
//     const el = searchListRef.current.querySelector(".chat-search-item.active");
//     if (el) el.scrollIntoView({ block: "nearest" });
//   }, [activeIndex, searchOpen]);

//   const handleSearchKeyDown = (e) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setActiveIndex((i) => Math.min(i + 1, filteredSearch.length - 1));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setActiveIndex((i) => Math.max(i - 1, 0));
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       const item = filteredSearch[activeIndex];
//       if (item) goToChat(item.session_id);
//     }
//   };
//   // ──────────────────────────────────────────────────────────────────────────

//   const isProfessional = Role === "lawyer" || Role === "Advocate";

//   const hasMembership = planData?.user_active?.membership === 1;

//   const profilePath = planLoading
//     ? null
//     : hasMembership && isProfessional
//       ? "/listingprofile"
//       : "/profile";

//   // ── Sidebar mode: /ecourt pages-la eCourts sidebar, matha pages-la chat sidebar ──
//   const isEcourtMode = MODULE_ROOTS.some((root) => underPath(location.pathname, root));
//   const onEcourtPage = underPath(location.pathname, "/ecourt");
//   const [ecourtOpen, setEcourtOpen] = useState(true);

//   // e-Courts click: eCourts page-la irundha list open/close; vera page-la irundha /ecourt ku pogum
//   const handleEcourtClick = () => {
//     if (onEcourtPage) {
//       setEcourtOpen((o) => !o);
//     } else {
//       setEcourtOpen(true);
//       setVisible(false);
//       navigate("/ecourt");
//     }
//   };

//   // Citations: same open/close behaviour as e-Courts
//   const onCitationsPage = underPath(location.pathname, "/citations");
//   const [citeOpen, setCiteOpen] = useState(true);
//   const citeMode = new URLSearchParams(location.search).get("mode") === "verify" ? "verify" : "search";

//   const handleCitationsClick = () => {
//     if (onCitationsPage) {
//       setCiteOpen((o) => !o);
//     } else {
//       setCiteOpen(true);
//       setVisible(false);
//       navigate("/citations");
//     }
//   };

//   // Judgment pages (/citations/doc/...) are opened from search → keep "Search Judgments" highlighted
//   const isCitationLinkActive = (link) => onCitationsPage && link.key === citeMode;

//   const isEcourtLinkActive = (link) => {
//     if (link.exact) return location.pathname === link.to || location.pathname === `${link.to}/`;
//     if (link.to === "/ecourt/search") {
//       // case detail / order pages are reached from search → keep "Case Search" highlighted
//       return location.pathname.startsWith("/ecourt/search") || location.pathname.startsWith("/ecourt/case/");
//     }
//     return location.pathname.startsWith(link.to);
//   };

//   const goToAiTools = () => {
//     setVisible(false);
//     navigate("/chat");
//   };

//   const goToEcourts = () => {
//     setVisible(false);
//     navigate("/ecourt");
//   };

//   // ── Sidebar tab state (History / DPDP Shield) ──────────────────────────────
//   const [activeNavTab, setActiveNavTab] = useState("history");
//   const [selectedSector, setSelectedSector] = useState(null);

//   const handleSectorClick = (sectorKey) => {
//     setSelectedSector(sectorKey);
//   };

//   const handleBackToSectors = () => { setSelectedSector(null); };


//   const handleDocClick = (sectorKey, docName) => {
//     const sector = dpdpData[sectorKey];
//     const prompt = `Draft a DPDP Act compliant "${docName}" for the ${sector.label} sector.`;

//     const newId = generateUUID();
//     localStorage.setItem("session_id", newId);

//     navigate("/chat", { state: { dpdpPrompt: prompt, ts: Date.now() } });
//   };
//   // ────────────────────────────────────────────────────────────────────────────

//   const formatHistoryDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     if (isNaN(d)) return "";

//     const now = new Date();
//     const diffMs = now - d;

//     if (diffMs < 60 * 60 * 1000) return "Past hour";

//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
//     const dayDiff = Math.round((startOfToday - startOfDate) / 86400000);

//     if (dayDiff <= 0) return "Today";
//     if (dayDiff === 1) return "Yesterday";
//     if (dayDiff < 7) return `${dayDiff} days ago`;
//     if (dayDiff < 30) return `${Math.floor(dayDiff / 7)} weeks ago`;

//     return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
//   };

//   return (
//     <>
//       <ToastContainer />
//       <div className="top-nav">
//         <FontAwesomeIcon icon={faBarsStaggered} className="mobile-nav-btn" onClick={() => setVisible((prev) => !prev)} />
//         <img src={logo} alt="logo" className="top-logo" />
//         <div className="profile">
//           <div className="profile">
//             <label className="qx-theme-switch">
//               <input type="checkbox" checked={theme === "light"} onChange={toggleTheme} />
//               <span className="qx-theme-slider qx-theme-round">
//                 <FontAwesomeIcon icon={faSun} className="sun-icon" />
//                 <FontAwesomeIcon icon={faMoon} className="moon-icon" />
//               </span>
//             </label>
//           </div>
//           <div className="qx-menu-wrap" ref={menuRef}>
//             <div
//               className={`profileimage ${menuOpen ? "is-open" : ""}`}
//               onClick={handleLogoutClick}
//             >
//               <h6 className="firstletterchar">{username ? username.charAt(0).toUpperCase() : "G"}</h6>
//             </div>

//             {menuOpen && (
//               <div className="qx-menu" onClick={() => setMenuOpen(false)}>
//                 {/* User header */}
//                 <div className="qx-menu-head">
//                   <div className="qx-menu-avatar">{username.charAt(0).toUpperCase()}</div>
//                   <div className="qx-menu-user">
//                     <span className="qx-menu-name">{username}</span>
//                     <span className="qx-menu-role">{Role}</span>
//                   </div>
//                 </div>

//                 <div className="qx-menu-group">
//                   <Link to={profilePath || "/profile"} className="qx-menu-item">
//                     <span className="qx-menu-icon"><FontAwesomeIcon icon={faUser} /></span>
//                     <span className="qx-menu-label">Profile</span>
//                     <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
//                   </Link>

//                   {["Advocate", "Judge", "Company", "lawyer", "Student"].includes(Role) &&
//                     is_course_active === 1 && (
//                       <Link to="/mycourse" className="qx-menu-item">
//                         <span className="qx-menu-icon"><FontAwesomeIcon icon={faGraduationCap} /></span>
//                         <span className="qx-menu-label">Courses</span>
//                         <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
//                       </Link>
//                     )}

//                   <Link to="/payment-history" className="qx-menu-item">
//                     <span className="qx-menu-icon"><FontAwesomeIcon icon={faCreditCard} /></span>
//                     <span className="qx-menu-label">Manage Payment</span>
//                     <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
//                   </Link>

//                   <Link to="/demo-feature" className="qx-menu-item">
//                     <span className="qx-menu-icon"><FontAwesomeIcon icon={faWandMagicSparkles} /></span>
//                     <span className="qx-menu-label">Demo Feature</span>
//                     <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
//                   </Link>

//                   <Link to="/documents" className="qx-menu-item">
//                     <span className="qx-menu-icon"><FontAwesomeIcon icon={faFolderOpen} /></span>
//                     <span className="qx-menu-label">Documents</span>
//                     <span className="qx-menu-badge">New</span>
//                   </Link>
//                 </div>

//                 <div className="qx-menu-divider" />

//                 <button type="button" className="qx-menu-item qx-menu-logout" onClick={handleLogout}>
//                   <span className="qx-menu-icon"><FontAwesomeIcon icon={faRightFromBracket} /></span>
//                   <span className="qx-menu-label">Log out</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//       </div>
//       <div className="">
//         <nav ref={navref} className={visible ? "navbars open" : "navbars"}>
//           {isEcourtMode ? (
//           /* ── eCourts SIDEBAR (/ecourt/*) ── */
//           <div className="nav-top">
//             <div className="scrollable module-scroll">
//               <div className="module-nav">
//                 <div className="module-nav-label">Workspace</div>

//                 {/* AI Tools → back to /chat */}
//                 <button type="button" className="module-nav-item" onClick={goToAiTools}>
//                   <FontAwesomeIcon icon={faRobot} className="module-nav-icon" />
//                   <span>AI Tools</span>
//                 </button>

//                 {/* e-Courts (current module) */}
//                 <button
//                   type="button"
//                   className={`module-nav-item ${onEcourtPage ? "active" : ""}`}
//                   onClick={handleEcourtClick}
//                   aria-expanded={onEcourtPage && ecourtOpen}
//                 >
//                   <FontAwesomeIcon icon={faScaleBalanced} className="module-nav-icon" />
//                   <span>e-Courts</span>
//                   <FontAwesomeIcon
//                     icon={faChevronDown}
//                     className={`module-nav-caret ${onEcourtPage && ecourtOpen ? "open" : ""}`}
//                   />
//                 </button>

//                 {onEcourtPage && ecourtOpen && (
//                   <div className="ecourt-nav-panel">
//                     {ECOURT_LINKS.map((link) => (
//                       <Link
//                         key={link.to}
//                         to={link.to}
//                         className={`ecourt-nav-item ${isEcourtLinkActive(link) ? "active" : ""}`}
//                         onClick={() => setVisible(false)}
//                       >
//                         <FontAwesomeIcon icon={link.icon} className="ecourt-nav-icon" />
//                         <span>{link.label}</span>
//                       </Link>
//                     ))}
//                   </div>
//                 )}

//                 {/* Marketplace */}
//                 {EXTRA_MODULES.filter((m) => m.key !== "citations").map((m) => (
//                   <Link
//                     key={m.key}
//                     to={m.to}
//                     className={`module-nav-item ${underPath(location.pathname, m.to) ? "active" : ""}`}
//                     onClick={() => setVisible(false)}
//                   >
//                     <FontAwesomeIcon icon={m.icon} className="module-nav-icon" />
//                     <span>{m.label}</span>
//                   </Link>
//                 ))}

//                 {/* Citations (opens a sub-list like e-Courts) */}
//                 <button
//                   type="button"
//                   className={`module-nav-item ${onCitationsPage ? "active" : ""}`}
//                   onClick={handleCitationsClick}
//                   aria-expanded={onCitationsPage && citeOpen}
//                 >
//                   <FontAwesomeIcon icon={faBookOpen} className="module-nav-icon" />
//                   <span>Citations</span>
//                   <FontAwesomeIcon
//                     icon={faChevronDown}
//                     className={`module-nav-caret ${onCitationsPage && citeOpen ? "open" : ""}`}
//                   />
//                 </button>

//                 {onCitationsPage && citeOpen && (
//                   <div className="ecourt-nav-panel">
//                     {CITATION_LINKS.map((link) => (
//                       <Link
//                         key={link.key}
//                         to={link.to}
//                         className={`ecourt-nav-item ${isCitationLinkActive(link) ? "active" : ""}`}
//                         onClick={() => setVisible(false)}
//                       >
//                         <FontAwesomeIcon icon={link.icon} className="ecourt-nav-icon" />
//                         <span>{link.label}</span>
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//           ) : (
//           /* ── CHAT SIDEBAR (/chat, /C/:id) ── */
//           <div className="nav-top">
//             <div className="nav-fixed-top">
//               <div className="newchat-row">
//                 <button type="button" className="newchatbtn" onClick={startScenarioChat}>
//                   New chat
//                   <FontAwesomeIcon icon={faPenToSquare} />
//                 </button>
//                 <button
//                   type="button"
//                   className="history-search-btn"
//                   title="Search chats"
//                   aria-label="Search chats"
//                   onClick={openSearch}
//                 >
//                   <FontAwesomeIcon icon={faMagnifyingGlass} />
//                 </button>
//               </div>

//                <div className="nav-tab-switch nav-tab-switch-3">
//                 <button
//                   type="button"
//                   className={`nav-tab-btn ${activeNavTab === "history" ? "active" : ""}`}
//                   onClick={() => setActiveNavTab("history")}
//                 >
//                   History
//                 </button>
//                 <button
//                   type="button"
//                   className={`nav-tab-btn ${activeNavTab === "dpdp" ? "active" : ""}`}
//                   onClick={() => setActiveNavTab("dpdp")}
//                 >
//                   DPDP
//                 </button>
//                 <button
//                   type="button"
//                   className="nav-tab-btn"
//                   onClick={goToEcourts}
//                 >
//                   E-Courts
//                 </button>
//               </div>
//             </div>
//             <div className="scrollable">
//               {activeNavTab === "history" && (
//                 <div style={{ padding: "5px 0px" }}>
//                   {scenariosLoading ? (
//                     <div className="history-loading-state">
//                       {Array.from({ length: 8 }).map((_, i) => (
//                         <div key={i} className="history-skeleton-item" />
//                       ))}
//                     </div>
//                   ) : scenarios.length === 0 ? (
//                     <div className="history-empty-state">
//                       <svg
//                         className="history-empty-wave-bg"
//                         viewBox="0 0 325 410"
//                         preserveAspectRatio="xMaxYMin slice"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <defs>
//                           <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
//                             <stop offset="0%" stopColor="#ffce2d" stopOpacity="0.9" />
//                             <stop offset="100%" stopColor="#3a350d" stopOpacity="0.1" />
//                           </linearGradient>
//                         </defs>
//                         {Array.from({ length: 14 }).map((_, i) => {
//                           const offset = i * 6;
//                           return (
//                             <path
//                               key={i}
//                               d={`M ${60 + offset},0 
//                                   C ${180 + offset},40 ${20 + offset},90 ${160 + offset},140
//                                   C ${280 + offset},180 ${40 + offset},220 ${180 + offset},270
//                                   C ${300 + offset},310 ${60 + offset},350 ${200 + offset},400`}
//                               fill="none"
//                               stroke="url(#waveGrad)"
//                               strokeWidth="0.6"
//                               opacity={0.15 + (i % 5) * 0.12}
//                             />
//                           );
//                         })}
//                       </svg>

//                       <div className="history-empty-icon-wrap">
//                         <FontAwesomeIcon icon={faClockRotateLeft} className="history-empty-icon" />
//                       </div>
//                       <p className="history-empty-text">No history found</p>
//                       <span className="history-empty-subtext">
//                         Your recent conversations will show up here
//                       </span>
//                     </div>
//                   ) : (
//                     <>
//                       {scenarios.map((scenario) => (
//                         <Link
//                           className={`linkings ${location.pathname === `/C/${scenario.session_id}` ? "active-history-item" : ""}${scenario.isNew ? " history-item-new" : ""}`}
//                           to={`/C/${scenario.session_id}`}
//                           key={scenario.session_id}
//                         >
//                           <p className="texthistory1"> {scenario.title}  {scenario.isNew && <span className="typing-cursor">|</span>}</p>
//                           <span className="trashicon">
//                             <FontAwesomeIcon
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 openDeleteModal(scenario.session_id);
//                               }}
//                               icon={faTrash}
//                             />
//                           </span>
//                         </Link>
//                       ))}

//                       {hasMoreHistory && (
//                         <button
//                           type="button"
//                           className="view-more-history-btn"
//                           onClick={handleViewMoreHistory}
//                           disabled={loadingMore}
//                         >
//                           {loadingMore ? "Loading..." : "View more"}
//                         </button>
//                       )}
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* ── DPDP SHIELD PANEL ── */}
//               {activeNavTab === "dpdp" && (
//                 <div className="dpdp-panel">
//                   {selectedSector === null ? (
//                     // Level 1: sector list
//                     Object.entries(dpdpData).map(([key, sector]) => (
//                       <div
//                         key={key}
//                         className="dpdp-sector-item"
//                         onClick={() => handleSectorClick(key)}
//                       >
//                         {sector.label}
//                       </div>
//                     ))
//                   ) : (
//                     // Level 2: document list for selected sector
//                     <>
//                       <div className="dpdp-back-row" onClick={handleBackToSectors}>
//                         ← {dpdpData[selectedSector].label}
//                       </div>
//                       {dpdpData[selectedSector].docs.map((doc, i) => (
//                         <div
//                           key={i}
//                           className="dpdp-doc-item-nav"
//                           onClick={() => handleDocClick(selectedSector, doc)}
//                         >
//                           {doc}
//                         </div>
//                       ))}
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//           )}

//           <div className="profile-section">
//             {oldchat === 1 ? (
//               <div className="split-button-container">
//                 <Link className="split-btn split-btn-left" to="/chathistory">
//                   <span className="textupgrade">Old History</span>
//                 </Link>
//                 <div className="split-divider"></div>
//                 <Link className="split-btn split-btn-right" to="/Subscription">
//                   <span className="textupgrade">Upgrade Plan</span>
//                 </Link>
//               </div>
//             ) : (
//               <div className="split-button-container">
//                 <Link className="split-btn split-btn-full" to="/Subscription">
//                   <span className="textupgrade">Upgrade Plan</span>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </nav>
//       </div>

//       {/* ── SEARCH POPUP ── */}
//       {searchOpen && (
//         <div className="chat-search-overlay" onClick={closeSearch}>
//           <div className="chat-search-box" onClick={(e) => e.stopPropagation()}>
//             <div className="chat-search-head">
//               <FontAwesomeIcon icon={faMagnifyingGlass} className="chat-search-head-icon" />
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 className="chat-search-input"
//                 placeholder="Search chats"
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setActiveIndex(0);
//                 }}
//                 onKeyDown={handleSearchKeyDown}
//               />
//               <FontAwesomeIcon
//                 icon={faXmark}
//                 className="chat-search-close"
//                 onClick={closeSearch}
//               />
//             </div>

//             <div className="chat-search-list" ref={searchListRef}>
//               {searchLoading && filteredSearch.length === 0 ? (
//                 <div className="chat-search-empty">Loading chats...</div>
//               ) : filteredSearch.length === 0 ? (
//                 <div className="chat-search-empty">
//                   No chats match "{searchTerm.trim()}"
//                 </div>
//               ) : (
//                 filteredSearch.map((item, i) => (
//                   <div
//                     key={item.session_id}
//                     className={`chat-search-item ${i === activeIndex ? "active" : ""}`}
//                     onMouseEnter={() => setActiveIndex(i)}
//                     onClick={() => goToChat(item.session_id)}
//                   >
//                     <FontAwesomeIcon icon={faComment} className="chat-search-item-icon" />
//                     <span className="chat-search-item-title">{item.title || "New chat"}</span>
//                     {i === activeIndex ? (
//                       <span className="chat-search-enter">Enter</span>
//                     ) : (
//                       <span className="chat-search-date">{formatHistoryDate(item.Date)}</span>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {deleteModal.open && (
//         <div className="edit-modal-overlay" onClick={closeDeleteModal}>
//           <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
//             <h6 className="delete-modal-title">Delete this chat?</h6>
//             <p className="delete-modal-text">
//               This will permanently remove this conversation. This action cannot be undone.
//             </p>
//             <div className="edit-modal-actions">
//               <button className="edit-modal-cancel" onClick={closeDeleteModal}>
//                 Cancel
//               </button>
//               <button className="delete-modal-confirm" onClick={confirmDelete}>
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
// export default Navbar;


import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare, faTrash, faSun, faMoon, faClockRotateLeft, faBarsStaggered,
  faMagnifyingGlass, faXmark, faComment,
  faUser, faGraduationCap, faCreditCard,
  faWandMagicSparkles, faFolderOpen, faRightFromBracket, faChevronRight,
  faScaleBalanced, faCalendarDays, faArrowsRotate, faShieldHalved,
  faRobot, faStore, faBookOpen, faChevronDown, faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../config/config";
import axiosInstance from "../config/apiconfig";
import { useAuth } from "../AuthContext";
import { usePlanData } from "../../hooks/usePlanData";
import dpdpData from "./dpdpData";
import logo from '../Assets/logojuristbot.svg'


const HISTORY_PAGE_SIZE = 20;
const SEARCH_FETCH_LIMIT = 200;

// ── eCourts sidebar links (shown when the URL starts with /ecourt) ──────────
const ECOURT_LINKS = [
  { to: "/ecourt", label: "eCourts Home", icon: faScaleBalanced, exact: true },
  { to: "/ecourt/search", label: "Case Search", icon: faMagnifyingGlass },
  { to: "/ecourt/causelist", label: "Cause List", icon: faCalendarDays },
  { to: "/ecourt/refresh", label: "Bulk Refresh", icon: faArrowsRotate },
  { to: "/ecourt/legal-check", label: "Legal Check", icon: faShieldHalved },
];

// Marketplace / Citations pages (routes in App.js)
const EXTRA_MODULES = [
  { key: "marketplace", to: "/marketplace", label: "Marketplace", icon: faStore },
  { key: "citations", to: "/citations", label: "Citations", icon: faBookOpen },
];

// ── Citations sidebar links (shown under "Citations" on /citations pages) ───
// mode=verify opens the "Verify a citation" tab of the Citations page.
const CITATION_LINKS = [
  { key: "search", to: "/citations", label: "Search Judgments", icon: faMagnifyingGlass },
  { key: "verify", to: "/citations?mode=verify", label: "Verify Citation", icon: faCircleCheck },
];

// Indha paths-la "Workspace" sidebar (AI Tools / e-Courts / Marketplace / Citations) varum
const MODULE_ROOTS = ["/ecourt", ...EXTRA_MODULES.map((m) => m.to)];
const underPath = (pathname, root) => pathname === root || pathname.startsWith(`${root}/`);

function Navbar() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const { planData, planLoading } = usePlanData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const is_course_active = planData?.user_active?.is_course_active;
  const username = user?.username || "Guest";
  const Role = user?.role || "Guest";
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef();
  const navref = useRef();
  const oldchat = user?.oldchat;

  const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogoutClick = () => setMenuOpen(!menuOpen);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
    if (navref.current && !navref.current.contains(event.target)) {
      setVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const openDeleteModal = (id) => setDeleteModal({ open: true, id });
  const closeDeleteModal = () => setDeleteModal({ open: false, id: null });

  const confirmDelete = () => {
    if (deleteModal.id) {
      deletescnario(deleteModal.id);
    }
    closeDeleteModal();
  };

  // ── History pagination (server-side limit/skip) ───────────────────────────
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [historySkip, setHistorySkip] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);

  const fetchScenarios = useCallback(async (skip = 0, append = false) => {
    const id = user?.id;
    if (!id) {
      setScenariosLoading(false);
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setScenariosLoading(true);
    }

    try {
      const response = await axiosInstance.get(
        `/history/commonhistory/${id}?limit=${HISTORY_PAGE_SIZE}&skip=${skip}`
      );
      const payload = response.data;
      const data = Array.isArray(payload) ? payload : payload?.data || [];
      const hasMore = Array.isArray(payload) ? false : !!payload?.hasMore;

      setScenarios((prev) => (append ? [...prev, ...data] : data));
      setHasMoreHistory(hasMore);
      setHistorySkip(skip + data.length);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log("Scenarios not found for this user");
        if (!append) {
          setScenarios([]);
        }
        setHasMoreHistory(false);
      }
    } finally {
      setScenariosLoading(false);
      setLoadingMore(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchScenarios(0, false);
  }, [fetchScenarios]);

  const handleViewMoreHistory = () => {
    if (loadingMore) return;
    fetchScenarios(historySkip, true);
  };

  // ── New chat title-a letter-by-letter type panna ──
  useEffect(() => {
    const handleScenarioCreated = (e) => {
      const { session_id, title } = e.detail || {};
      if (!session_id) return;

      const fullTitle = title || "New chat";

      // Empty title-oda item-a top la add pannu
      setScenarios((prev) => {
        if (prev.some((s) => s.session_id === session_id)) return prev;
        return [{ session_id, title: "", isNew: true }, ...prev];
      });

      let i = 0;
      const typeSpeed = 45;
      const typer = setInterval(() => {
        i += 1;
        const partial = fullTitle.slice(0, i);
        setScenarios((prev) =>
          prev.map((s) =>
            s.session_id === session_id ? { ...s, title: partial } : s
          )
        );
        if (i >= fullTitle.length) {
          clearInterval(typer);
          setScenarios((prev) =>
            prev.map((s) =>
              s.session_id === session_id ? { ...s, isNew: false } : s
            )
          );
        }
      }, typeSpeed);
    };

    window.addEventListener("scenario:created", handleScenarioCreated);
    return () => window.removeEventListener("scenario:created", handleScenarioCreated);
  }, []);

  const deleteHistory = async (id, endpoint) => {
    try {
      const response = await axiosInstance.delete(`/history/${endpoint}/${id}`);
      if (response.status === 200) {
        setScenarios((prev) => prev.filter((s) => s.session_id !== id));
        setSearchList((prev) => prev.filter((s) => s.session_id !== id));
        fetchScenarios(0, false);
        if (location.pathname === `/C/${id}`) {
          navigate("/chat");
        }
      }
    } catch (err) {
      console.error("Error deleting history:", err);
      toast.error("An error occurred while deleting the history");
    }
  };

  const deletescnario = (id) => deleteHistory(id, "commonhistorydelete");

  const handleLogout = async () => {
    try {
      const id = user?.id;
      if (id) {
        await axios.post(`${config.apiBaseUrl}/auth/logout`, { id });
      }
      localStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error.message);
      alert("Failed to logout. Please try again.");
    }
  };

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const startScenarioChat = () => {
    const newId = generateUUID();
    localStorage.setItem("session_id", newId);
    navigate("/chat", { state: { newChat: true, ts: Date.now() } });
  };

  // ── History search popup ──────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef(null);
  const searchListRef = useRef(null);

  const openSearch = async () => {
    setSearchOpen(true);
    setSearchTerm("");
    setActiveIndex(0);
    setSearchList(scenarios); // already load aana list-a udane kaattu

    const id = user?.id;
    if (!id) return;

    setSearchLoading(true);
    try {
      const res = await axiosInstance.get(
        `/history/commonhistory/${id}?limit=${SEARCH_FETCH_LIMIT}&skip=0`
      );
      const payload = res.data;
      const data = Array.isArray(payload) ? payload : payload?.data || [];
      setSearchList(data);
    } catch (err) {
      console.log("Search history fetch failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
    setActiveIndex(0);
  };

  const filteredSearch = searchList.filter((s) =>
    (s.title || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const goToChat = (session_id) => {
    closeSearch();
    setVisible(false);
    navigate(`/C/${session_id}`);
  };

  // Esc close + auto focus
  useEffect(() => {
    if (!searchOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => searchInputRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [searchOpen]);

  // Keyboard-la move panna active item-a scroll pannu
  useEffect(() => {
    if (!searchOpen || !searchListRef.current) return;
    const el = searchListRef.current.querySelector(".chat-search-item.active");
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex, searchOpen]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredSearch.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredSearch[activeIndex];
      if (item) goToChat(item.session_id);
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

  const isProfessional = Role === "lawyer" || Role === "Advocate";

  const hasMembership = planData?.user_active?.membership === 1;

  const profilePath = planLoading
    ? null
    : hasMembership && isProfessional
      ? "/listingprofile"
      : "/profile";

  // ── Sidebar mode: /ecourt pages-la eCourts sidebar, matha pages-la chat sidebar ──
  const isEcourtMode = MODULE_ROOTS.some((root) => underPath(location.pathname, root));
  const onEcourtPage = underPath(location.pathname, "/ecourt");
  const [ecourtOpen, setEcourtOpen] = useState(true);

  // e-Courts click: eCourts page-la irundha list open/close; vera page-la irundha /ecourt ku pogum
  const handleEcourtClick = () => {
    if (onEcourtPage) {
      setEcourtOpen((o) => !o);
    } else {
      setEcourtOpen(true);
      setVisible(false);
      navigate("/ecourt");
    }
  };

  // Citations: same open/close behaviour as e-Courts
  const onCitationsPage = underPath(location.pathname, "/citations");
  const [citeOpen, setCiteOpen] = useState(true);
  const citeMode = new URLSearchParams(location.search).get("mode") === "verify" ? "verify" : "search";

  const handleCitationsClick = () => {
    if (onCitationsPage) {
      setCiteOpen((o) => !o);
    } else {
      setCiteOpen(true);
      setVisible(false);
      navigate("/citations");
    }
  };

  // Judgment pages (/citations/doc/...) are opened from search → keep "Search Judgments" highlighted
  const isCitationLinkActive = (link) => onCitationsPage && link.key === citeMode;

  const isEcourtLinkActive = (link) => {
    if (link.exact) return location.pathname === link.to || location.pathname === `${link.to}/`;
    if (link.to === "/ecourt/search") {
      // case detail / order pages are reached from search → keep "Case Search" highlighted
      return location.pathname.startsWith("/ecourt/search") || location.pathname.startsWith("/ecourt/case/");
    }
    return location.pathname.startsWith(link.to);
  };

  const goToAiTools = () => {
    setVisible(false);
    navigate("/chat");
  };

  // ── Sidebar tab state (History / DPDP Shield) ──────────────────────────────
  const [activeNavTab, setActiveNavTab] = useState("history");
  const [selectedSector, setSelectedSector] = useState(null);

  const handleSectorClick = (sectorKey) => {
    setSelectedSector(sectorKey);
  };

  const handleBackToSectors = () => { setSelectedSector(null); };


  const handleDocClick = (sectorKey, docName) => {
    const sector = dpdpData[sectorKey];
    const prompt = `Draft a DPDP Act compliant "${docName}" for the ${sector.label} sector.`;

    const newId = generateUUID();
    localStorage.setItem("session_id", newId);

    navigate("/chat", { state: { dpdpPrompt: prompt, ts: Date.now() } });
  };
  // ────────────────────────────────────────────────────────────────────────────

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";

    const now = new Date();
    const diffMs = now - d;

    if (diffMs < 60 * 60 * 1000) return "Past hour";

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayDiff = Math.round((startOfToday - startOfDate) / 86400000);

    if (dayDiff <= 0) return "Today";
    if (dayDiff === 1) return "Yesterday";
    if (dayDiff < 7) return `${dayDiff} days ago`;
    if (dayDiff < 30) return `${Math.floor(dayDiff / 7)} weeks ago`;

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <>
      <ToastContainer />
      <div className="top-nav">
        <FontAwesomeIcon icon={faBarsStaggered} className="mobile-nav-btn" onClick={() => setVisible((prev) => !prev)} />
        <img src={logo} alt="logo" className="top-logo" />
        <div className="profile">
          <div className="profile">
            <label className="qx-theme-switch">
              <input type="checkbox" checked={theme === "light"} onChange={toggleTheme} />
              <span className="qx-theme-slider qx-theme-round">
                <FontAwesomeIcon icon={faSun} className="sun-icon" />
                <FontAwesomeIcon icon={faMoon} className="moon-icon" />
              </span>
            </label>
          </div>
          <div className="qx-menu-wrap" ref={menuRef}>
            <div
              className={`profileimage ${menuOpen ? "is-open" : ""}`}
              onClick={handleLogoutClick}
            >
              <h6 className="firstletterchar">{username ? username.charAt(0).toUpperCase() : "G"}</h6>
            </div>

            {menuOpen && (
              <div className="qx-menu" onClick={() => setMenuOpen(false)}>
                {/* User header */}
                <div className="qx-menu-head">
                  <div className="qx-menu-avatar">{username.charAt(0).toUpperCase()}</div>
                  <div className="qx-menu-user">
                    <span className="qx-menu-name">{username}</span>
                    <span className="qx-menu-role">{Role}</span>
                  </div>
                </div>

                <div className="qx-menu-group">
                  <Link to={profilePath || "/profile"} className="qx-menu-item">
                    <span className="qx-menu-icon"><FontAwesomeIcon icon={faUser} /></span>
                    <span className="qx-menu-label">Profile</span>
                    <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
                  </Link>

                  {["Advocate", "Judge", "Company", "lawyer", "Student"].includes(Role) &&
                    is_course_active === 1 && (
                      <Link to="/mycourse" className="qx-menu-item">
                        <span className="qx-menu-icon"><FontAwesomeIcon icon={faGraduationCap} /></span>
                        <span className="qx-menu-label">Courses</span>
                        <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
                      </Link>
                    )}

                  <Link to="/payment-history" className="qx-menu-item">
                    <span className="qx-menu-icon"><FontAwesomeIcon icon={faCreditCard} /></span>
                    <span className="qx-menu-label">Manage Payment</span>
                    <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
                  </Link>

                  <Link to="/demo-feature" className="qx-menu-item">
                    <span className="qx-menu-icon"><FontAwesomeIcon icon={faWandMagicSparkles} /></span>
                    <span className="qx-menu-label">Demo Feature</span>
                    <FontAwesomeIcon icon={faChevronRight} className="qx-menu-arrow" />
                  </Link>

                  <Link to="/documents" className="qx-menu-item">
                    <span className="qx-menu-icon"><FontAwesomeIcon icon={faFolderOpen} /></span>
                    <span className="qx-menu-label">Documents</span>
                    <span className="qx-menu-badge">New</span>
                  </Link>
                </div>

                <div className="qx-menu-divider" />

                <button type="button" className="qx-menu-item qx-menu-logout" onClick={handleLogout}>
                  <span className="qx-menu-icon"><FontAwesomeIcon icon={faRightFromBracket} /></span>
                  <span className="qx-menu-label">Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      <div className="">
        <nav ref={navref} className={visible ? "navbars open" : "navbars"}>
          {isEcourtMode ? (
          /* ── eCourts SIDEBAR (/ecourt/*) ── */
          <div className="nav-top">
            <div className="scrollable module-scroll">
              <div className="module-nav">
                <div className="module-nav-label">Workspace</div>

                {/* AI Tools → back to /chat */}
                <button type="button" className="module-nav-item" onClick={goToAiTools}>
                  <FontAwesomeIcon icon={faRobot} className="module-nav-icon" />
                  <span>AI Tools</span>
                </button>

                {/* e-Courts (current module) */}
                <button
                  type="button"
                  className={`module-nav-item ${onEcourtPage ? "active" : ""}`}
                  onClick={handleEcourtClick}
                  aria-expanded={onEcourtPage && ecourtOpen}
                >
                  <FontAwesomeIcon icon={faScaleBalanced} className="module-nav-icon" />
                  <span>e-Courts</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`module-nav-caret ${onEcourtPage && ecourtOpen ? "open" : ""}`}
                  />
                </button>

                {onEcourtPage && ecourtOpen && (
                  <div className="ecourt-nav-panel">
                    {ECOURT_LINKS.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`ecourt-nav-item ${isEcourtLinkActive(link) ? "active" : ""}`}
                        onClick={() => setVisible(false)}
                      >
                        <FontAwesomeIcon icon={link.icon} className="ecourt-nav-icon" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Marketplace */}
                {EXTRA_MODULES.filter((m) => m.key !== "citations").map((m) => (
                  <Link
                    key={m.key}
                    to={m.to}
                    className={`module-nav-item ${underPath(location.pathname, m.to) ? "active" : ""}`}
                    onClick={() => setVisible(false)}
                  >
                    <FontAwesomeIcon icon={m.icon} className="module-nav-icon" />
                    <span>{m.label}</span>
                  </Link>
                ))}

                {/* Citations (opens a sub-list like e-Courts) */}
                <button
                  type="button"
                  className={`module-nav-item ${onCitationsPage ? "active" : ""}`}
                  onClick={handleCitationsClick}
                  aria-expanded={onCitationsPage && citeOpen}
                >
                  <FontAwesomeIcon icon={faBookOpen} className="module-nav-icon" />
                  <span>Citations</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`module-nav-caret ${onCitationsPage && citeOpen ? "open" : ""}`}
                  />
                </button>

                {onCitationsPage && citeOpen && (
                  <div className="ecourt-nav-panel">
                    {CITATION_LINKS.map((link) => (
                      <Link
                        key={link.key}
                        to={link.to}
                        className={`ecourt-nav-item ${isCitationLinkActive(link) ? "active" : ""}`}
                        onClick={() => setVisible(false)}
                      >
                        <FontAwesomeIcon icon={link.icon} className="ecourt-nav-icon" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          ) : (
          /* ── CHAT SIDEBAR (/chat, /C/:id) ── */
          <div className="nav-top">
            <div className="nav-fixed-top">
              <div className="newchat-row">
                <button type="button" className="newchatbtn" onClick={startScenarioChat}>
                  New chat
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button
                  type="button"
                  className="history-search-btn"
                  title="Search chats"
                  aria-label="Search chats"
                  onClick={openSearch}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>

               <div className="nav-tab-switch nav-tab-switch-3">
                <button
                  type="button"
                  className={`nav-tab-btn ${activeNavTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveNavTab("history")}
                >
                  History
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeNavTab === "dpdp" ? "active" : ""}`}
                  onClick={() => setActiveNavTab("dpdp")}
                >
                  DPDP
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeNavTab === "ecourts" ? "active" : ""}`}
                  onClick={() => setActiveNavTab("ecourts")}
                >
                  E-Courts
                </button>
              </div>
            </div>
            <div className="scrollable">
              {activeNavTab === "history" && (
                <div style={{ padding: "5px 0px" }}>
                  {scenariosLoading ? (
                    <div className="history-loading-state">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="history-skeleton-item" />
                      ))}
                    </div>
                  ) : scenarios.length === 0 ? (
                    <div className="history-empty-state">
                      <svg
                        className="history-empty-wave-bg"
                        viewBox="0 0 325 410"
                        preserveAspectRatio="xMaxYMin slice"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffce2d" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#3a350d" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                        {Array.from({ length: 14 }).map((_, i) => {
                          const offset = i * 6;
                          return (
                            <path
                              key={i}
                              d={`M ${60 + offset},0 
                                  C ${180 + offset},40 ${20 + offset},90 ${160 + offset},140
                                  C ${280 + offset},180 ${40 + offset},220 ${180 + offset},270
                                  C ${300 + offset},310 ${60 + offset},350 ${200 + offset},400`}
                              fill="none"
                              stroke="url(#waveGrad)"
                              strokeWidth="0.6"
                              opacity={0.15 + (i % 5) * 0.12}
                            />
                          );
                        })}
                      </svg>

                      <div className="history-empty-icon-wrap">
                        <FontAwesomeIcon icon={faClockRotateLeft} className="history-empty-icon" />
                      </div>
                      <p className="history-empty-text">No history found</p>
                      <span className="history-empty-subtext">
                        Your recent conversations will show up here
                      </span>
                    </div>
                  ) : (
                    <>
                      {scenarios.map((scenario) => (
                        <Link
                          className={`linkings ${location.pathname === `/C/${scenario.session_id}` ? "active-history-item" : ""}${scenario.isNew ? " history-item-new" : ""}`}
                          to={`/C/${scenario.session_id}`}
                          key={scenario.session_id}
                        >
                          <p className="texthistory1"> {scenario.title}  {scenario.isNew && <span className="typing-cursor">|</span>}</p>
                          <span className="trashicon">
                            <FontAwesomeIcon
                              onClick={(e) => {
                                e.preventDefault();
                                openDeleteModal(scenario.session_id);
                              }}
                              icon={faTrash}
                            />
                          </span>
                        </Link>
                      ))}

                      {hasMoreHistory && (
                        <button
                          type="button"
                          className="view-more-history-btn"
                          onClick={handleViewMoreHistory}
                          disabled={loadingMore}
                        >
                          {loadingMore ? "Loading..." : "View more"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── E-COURTS: COMING SOON ── */}
              {activeNavTab === "ecourts" && (
                <div className="soon-panel" role="status">
                  <div className="soon-icon-wrap">
                    <FontAwesomeIcon icon={faScaleBalanced} className="soon-icon" />
                  </div>
                  <span className="soon-badge">Coming soon</span>
                  <p className="soon-title">1.E-Courts </p>
                  <p className="soon-title">2.Drafting marketplace</p>
                  <p className="soon-title">3.Citation </p>
                  <p className="soon-text">
                    Case status, cause lists and court orders from every Indian court, Judgments,drafting marketplace right here in Jurist Bot.
                  </p>
                  <button type="button" className="soon-back" onClick={() => setActiveNavTab("history")}>
                    Back to History
                  </button>
                </div>
              )}

              {/* ── DPDP SHIELD PANEL ── */}
              {activeNavTab === "dpdp" && (
                <div className="dpdp-panel">
                  {selectedSector === null ? (
                    // Level 1: sector list
                    Object.entries(dpdpData).map(([key, sector]) => (
                      <div
                        key={key}
                        className="dpdp-sector-item"
                        onClick={() => handleSectorClick(key)}
                      >
                        {sector.label}
                      </div>
                    ))
                  ) : (
                    // Level 2: document list for selected sector
                    <>
                      <div className="dpdp-back-row" onClick={handleBackToSectors}>
                        ← {dpdpData[selectedSector].label}
                      </div>
                      {dpdpData[selectedSector].docs.map((doc, i) => (
                        <div
                          key={i}
                          className="dpdp-doc-item-nav"
                          onClick={() => handleDocClick(selectedSector, doc)}
                        >
                          {doc}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          )}

          <div className="profile-section">
            {oldchat === 1 ? (
              <div className="split-button-container">
                <Link className="split-btn split-btn-left" to="/chathistory">
                  <span className="textupgrade">Old History</span>
                </Link>
                <div className="split-divider"></div>
                <Link className="split-btn split-btn-right" to="/Subscription">
                  <span className="textupgrade">Upgrade Plan</span>
                </Link>
              </div>
            ) : (
              <div className="split-button-container">
                <Link className="split-btn split-btn-full" to="/Subscription">
                  <span className="textupgrade">Upgrade Plan</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ── SEARCH POPUP ── */}
      {searchOpen && (
        <div className="chat-search-overlay" onClick={closeSearch}>
          <div className="chat-search-box" onClick={(e) => e.stopPropagation()}>
            <div className="chat-search-head">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="chat-search-head-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="chat-search-input"
                placeholder="Search chats"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
              />
              <FontAwesomeIcon
                icon={faXmark}
                className="chat-search-close"
                onClick={closeSearch}
              />
            </div>

            <div className="chat-search-list" ref={searchListRef}>
              {searchLoading && filteredSearch.length === 0 ? (
                <div className="chat-search-empty">Loading chats...</div>
              ) : filteredSearch.length === 0 ? (
                <div className="chat-search-empty">
                  No chats match "{searchTerm.trim()}"
                </div>
              ) : (
                filteredSearch.map((item, i) => (
                  <div
                    key={item.session_id}
                    className={`chat-search-item ${i === activeIndex ? "active" : ""}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goToChat(item.session_id)}
                  >
                    <FontAwesomeIcon icon={faComment} className="chat-search-item-icon" />
                    <span className="chat-search-item-title">{item.title || "New chat"}</span>
                    {i === activeIndex ? (
                      <span className="chat-search-enter">Enter</span>
                    ) : (
                      <span className="chat-search-date">{formatHistoryDate(item.Date)}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="edit-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
            <h6 className="delete-modal-title">Delete this chat?</h6>
            <p className="delete-modal-text">
              This will permanently remove this conversation. This action cannot be undone.
            </p>
            <div className="edit-modal-actions">
              <button className="edit-modal-cancel" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className="delete-modal-confirm" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Navbar;