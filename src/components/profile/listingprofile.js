import React, { useState, useEffect, useCallback } from "react";
import "./profile.css";
import uploadIcon from "../Assets/logo-chat.png";
import axiosInstance from "../config/apiconfig";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../AuthContext";
import Lawdata from "../config/lawspecialists.json";
import { Link } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import temp1 from "./temp1.png";
import temp2 from "./temp2.png";
import temp3 from "./temp3.png";
import temp4 from "./temp4.png";
import temp5 from "./temp5.png";
import HighCourtsData from "../config/highCourts.json";
import SupremeCourtData from "../config/SupremeCourt.json";
import districtCourts from "../config/districtCourts.json";
import Tribunals from "../config/tribunals.json";

/* ─── Reusable search-bar with dropdown ─────────────────────────────────── */
function JurisdictionSearch({ label, placeholder, items, selectedItems = [], onToggle }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const safeSelectedItems = Array.isArray(selectedItems) ? selectedItems : [];
  const filtered = query
    ? items.filter((i) => {
        const q = query.toLowerCase().trim();
        const nameMatch = i.name?.toLowerCase().startsWith(q);
        const stateMatch = i.state?.toLowerCase().startsWith(q);
        const locationMatch = i.location?.toLowerCase().startsWith(q);
        return nameMatch || stateMatch || locationMatch;
      })
    : items;

  return (
    <div className="jurisdiction-sub-list mt-3">
      <h6 className="lable-profile-txt mb-2">{label}</h6>
      <div className="jur-search-wrap mb-2">
        <span className="jur-search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="text"
          className="jur-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="jur-search-clear"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery("");
            }}
          >
            &#x2715;
          </button>
        )}
        {open && (
          <div className="jur-dropdown">
            {filtered.length === 0 ? (
              <div className="jur-no-results">No results found</div>
            ) : (
              filtered.map((item) => {
                const checked = safeSelectedItems.includes(item.name);
                return (
                  <label
                    key={item.id ?? item.name}
                    className={`jur-dropdown-item${checked ? " jur-checked" : ""}`}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <svg
                      className="jur-item-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(item.name)}
                      style={{ display: "none" }}
                    />
                    <span className="jur-item-name">{item.name}</span>
                    {item.location && (
                      <span className="jur-item-location">{item.location}</span>
                    )}
                    {checked && (
                      <svg
                        className="jur-item-check"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>
      {safeSelectedItems.length > 0 && (
        <div className="jur-tags">
          {safeSelectedItems.map((name) => (
            <span key={name} className="jur-tag">
              {name}
              <button
                type="button"
                className="jur-tag-remove"
                onClick={() => onToggle(name)}
              >
                &#x2715;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
function ListingProfile() {
  const { user } = useAuth();
  const userid = user?.id;
  const [profileImage, setProfileImage] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const Role = user?.role;
  const [selectedJurisdictions, setSelectedJurisdictions] = useState([]);
  const [whatsappInput, setWhatsappInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const jurisdictionCategories = [
    "Supreme Court",
    "High Court",
    "District Court",
    "Tribunals",
  ];

  const toggleJurisdictionCategory = (cat) => {
    setSelectedJurisdictions((prev) => {
      const updated = { ...prev };
      if (updated[cat] !== undefined) {
        delete updated[cat];
      } else {
        updated[cat] = [];
      }
      return updated;
    });
  };

  const toggleSubItem = (cat, name) => {
    setSelectedJurisdictions((prev) => {
      const arr = Array.isArray(prev[cat]) ? [...prev[cat]] : [];
      return {
        ...prev,
        [cat]: arr.includes(name) ? arr.filter((x) => x !== name) : [...arr, name],
      };
    });
  };

  const templates = [
    { img: temp1, path: "/template1" },
    { img: temp2, path: "/template2" },
    { img: temp3, path: "/template3" },
    { img: temp4, path: "/template4" },
    { img: temp5, path: "/template5" },
  ];

  const normalizeJurisdiction = (data) => {
    const categories = ["Supreme Court", "High Court", "District Court", "Tribunals"];
    const result = {};
    categories.forEach((cat) => {
      result[cat] = Array.isArray(data?.[cat]) ? data[cat] : [];
    });
    return result;
  };

  const fetchProfile = useCallback(async () => {
    if (!userid) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/commanprofile/getprofile`, {
        params: { userid },
      });
      const profileData = response.data[0];
      setProfiles(profileData);
      setSelectedItems(profileData.law_specialists || []);
      setCharCount(profileData.about?.length || 0);
      const savedJurisdiction = profileData.jurisdiction
        ? typeof profileData.jurisdiction === "string"
          ? JSON.parse(profileData.jurisdiction)
          : profileData.jurisdiction
        : {};
      setSelectedJurisdictions(normalizeJurisdiction(savedJurisdiction));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch profiles");
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleConfirmOtp = async () => {
    if (!otpInput) return toast.error("Enter OTP");
    try {
      setLoading(true);
      await axiosInstance.post(`/commanprofile/confirmotp`, {
        userid,
        whatsapp_number: whatsappInput,
        otp: otpInput,
      });
      toast.success("WhatsApp verified successfully!");
      setOtpSent(false);
      setOtpInput("");
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleverifynumber = async () => {
    if (!whatsappInput) return toast.error("Enter WhatsApp number");
    try {
      await axiosInstance.post(`/commanprofile/verifywhatsapp`, {
        userid,
        whatsapp_number: whatsappInput,
      });
      setOtpSent(true);
      toast.success("OTP sent to WhatsApp");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfiles((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setProfileImageFile(file);
    }
  };

  const handleCheckboxChange = (specialist) => {
    setSelectedItems((prev) =>
      prev.includes(specialist)
        ? prev.filter((item) => item !== specialist)
        : [...prev, specialist]
    );
  };

  const specialists = Lawdata.specialists || [];

  // ── Mandatory field validation (GST Number & Bar Council No are optional) ──
  const validateProfile = () => {
    if (!profiles.username?.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!profiles.mobile_no?.trim()) {
      toast.error("WhatsApp Number is required");
      return false;
    }
    if (!profiles.address?.trim()) {
      toast.error("Address is required");
      return false;
    }
    if (!profiles.year_ex) {
      toast.error("Years of Experience is required");
      return false;
    }
    if (!profiles.about?.trim()) {
      toast.error("About section is required");
      return false;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one Expertise Practice Area");
      return false;
    }
    if (!profiles.cases_won) {
      toast.error("Cases Won is required");
      return false;
    }
    if (!profiles.happy_clients) {
      toast.error("Happy Clients is required");
      return false;
    }
    if (!profiles.years_active) {
      toast.error("Years Active is required");
      return false;
    }
    if (!profiles.success_rate) {
      toast.error("Success Rate is required");
      return false;
    }
    const hasJurisdiction = Object.values(selectedJurisdictions).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
    if (!hasJurisdiction) {
      toast.error("Please select at least one Jurisdiction");
      return false;
    }
    if (!profiles.templatepath) {
      toast.error("Please select a Website Template");
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    // Run validation — GST Number & Bar Council No are intentionally skipped (optional)
    if (!validateProfile()) return;

    try {
      const formData = new FormData();
      formData.append("id", userid);
      formData.append("username", profiles.username);
      formData.append("email", profiles.email);
      formData.append("mobile_no", profiles.mobile_no);
      formData.append("role", profiles.role);
      formData.append("law_specialists", JSON.stringify(selectedItems) || "[]");
      formData.append("bar_code", profiles.bar_code || "");
      formData.append("state", profiles.state || "");
      formData.append("town", profiles.town || "");
      formData.append("address", profiles.address || "");
      formData.append("year_ex", profiles.year_ex || "");
      formData.append("about", profiles.about || "");
      formData.append("gst_number", profiles.gst_number || "");
      formData.append("jurisdiction", JSON.stringify(selectedJurisdictions));
      formData.append("cases_won", profiles.cases_won || 0);
      formData.append("happy_clients", profiles.happy_clients || 0);
      formData.append("years_active", profiles.years_active || 0);
      formData.append("success_rate", profiles.success_rate || 0);
      formData.append("templatepath", profiles.templatepath || 0);
      if (profileImageFile) {
        formData.append("profile_img", profileImageFile);
      } else {
        formData.append("profile_img", profiles.profile_img || "");
      }
      const res = await axiosInstance.post(
        `/commanprofile/listingupdateprofile`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res?.data?.message || "Profile updated successfully");
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleTemplateSelect = (template) => {
    setProfiles((prev) => ({ ...prev, templatepath: template.path }));
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <ToastContainer />
      <div className="pt-3 ms-3">
        <Link to="/chat">
          <h1>
            <FontAwesomeIcon className="iconback" icon={faArrowLeft} />
          </h1>
        </Link>
      </div>

      <div className="listingProfile-member pt-2">
        <h5 className="mb-4 profile-Form-txt">Edit Profile</h5>

        {/* ── Profile Image ────────────────────────────────────────────── */}
        <div className="profile-container">
          <div>
            <label htmlFor="imageUpload" className="imageLabel">
              {profileImage || profiles.profile_img ? (
                <img
                  src={profileImage || profiles.profile_img}
                  alt="Profile"
                  className="image"
                />
              ) : (
                <div className="placeholder">
                  <span>
                    <img className="uploadIcon" src={uploadIcon} alt="Upload" />
                  </span>
                </div>
              )}
            </label>
            <input
              type="file"
              id="imageUpload"
              className="imageUploadInput"
              onChange={handleImageUpload}
              accept="image/*"
            />
          </div>
          <label htmlFor="imageUpload" className="uploadButton">
            Choose profile <span className="uploadIconText">📂</span>
          </label>
        </div>

        {/* ── Contact Verification ─────────────────────────────────────── */}
        <div className="listingProfile-member-p mt-4">
          <h4>Contact Verification</h4>
          {profiles.verified_whatsapp === 1 ? (
            <div className="d-flex align-items-center gap-2 mt-2">
              <span style={{ fontSize: "20px" }}></span>
              <div>
                <p className="mb-0 fw-semibold" style={{ color: "#2e7d32" }}>
                  WhatsApp Verified
                </p>
                <small className="text-muted">{profiles.mobile_no}</small>
              </div>
              <button
                type="button"
                className="profile-save-btn ms-3"
                style={{ fontSize: "12px", padding: "4px 12px" }}
                onClick={() =>
                  setProfiles((prev) => ({ ...prev, verified_whatsapp: 0 }))
                }
              >
                Change Number
              </button>
            </div>
          ) : (
            <>
              <div className="row">
                <div className="col-md-6 col-lg-6 col-12">
                  <div className="form-group">
                    <label className="lable-profile-txt">WhatsApp Number</label>
                    <input
                      type="text"
                      className="profile-form"
                      placeholder="Enter WhatsApp No"
                      value={whatsappInput}
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) setWhatsappInput(val);
                      }}
                    />
                  </div>
                </div>
                {otpSent && (
                  <div className="col-md-6 col-lg-6 col-12">
                    <div className="form-group">
                      <label className="lable-profile-txt">Enter OTP</label>
                      <input
                        type="text"
                        className="profile-form"
                        placeholder="Enter OTP"
                        value={otpInput}
                        maxLength={6}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 6) setOtpInput(val);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="d-flex justify-content-end mt-2 gap-2">
                <button
                  type="button"
                  className="profile-save-btn"
                  onClick={handleverifynumber}
                >
                  {otpSent ? "Resend OTP" : "Verify Now"}
                </button>
                {otpSent && (
                  <button
                    type="button"
                    className="profile-save-btn"
                    onClick={handleConfirmOtp}
                  >
                    Confirm OTP
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Personal Information ─────────────────────────────────────── */}
        <div className="listingProfile-member-p mt-4">
          <h4>Personal Information</h4>
          <div className="row pt-3">
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">
                  Edit your Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  className="profile-form"
                  name="username"
                  placeholder="John Doe"
                  value={profiles.username || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">Email</label>
                <input
                  type="email"
                  name="email"
                  className="profile-form disabled-input"
                  placeholder="Juristbotai@gmail.com"
                  value={profiles.email || ""}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
            </div>
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">
                  Whatsapp Number <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="mobile_no"
                  className="profile-form"
                  placeholder="+91 9345115068"
                  value={profiles.mobile_no || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">Your Role</label>
                <input
                  type="text"
                  name="role"
                  className="profile-form disabled-input"
                  placeholder="Lawyer"
                  value={profiles.role || ""}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
            </div>
            {/* GST Number — Optional */}
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">GST Number (Optional)</label>
                <input
                  type="text"
                  name="gst_number"
                  className="profile-form"
                  placeholder="33AAAAA0000A1Z5"
                  value={profiles.gst_number || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            {/* Bar Council No — Optional */}
            {(Role === "Advocate" ||
              Role === "judge" ||
              Role === "lawyer" ||
              Role === "Company") && (
              <div className="col-md-4 col-lg-4 col-sm-12">
                <div className="form-group">
                  <label className="lable-profile-txt">Bar Council No (Optional)</label>
                  <input
                    type="text"
                    name="bar_code"
                    className="profile-form"
                    placeholder="TN/1234/2023"
                    value={profiles.bar_code || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">State</label>
                <input
                  type="text"
                  className="profile-form disabled-input"
                  name="state"
                  placeholder="Karnataka"
                  value={profiles.state || ""}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
            </div>
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">City</label>
                <input
                  type="text"
                  name="town"
                  className="profile-form disabled-input"
                  placeholder="Mysore"
                  value={profiles.town || ""}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
            </div>
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">
                  Address <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className="profile-form"
                  placeholder="no-37,df,colony"
                  value={profiles.address || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-4 col-lg-4 col-sm-12">
              <div className="form-group">
                <label className="lable-profile-txt">
                  Years of Experience <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="number"
                  name="year_ex"
                  className="profile-form"
                  placeholder="number of years"
                  value={profiles.year_ex || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── About ────────────────────────────────────────────────────── */}
        <div className="listingProfile-member-p mt-4">
          <h4>
            About <span style={{ color: "red" }}>*</span>
          </h4>
          <textarea
            name="about"
            className="profile-about-textarea-form"
            placeholder="Write about yourself"
            maxLength={600}
            value={profiles.about || ""}
            onChange={(e) => {
              setCharCount(e.target.value.length);
              handleInputChange(e);
            }}
          />
          <small className="char-count">{charCount}/600</small>
        </div>

        {/* ── Expertise & Career ───────────────────────────────────────── */}
        <div className="row">
          <div className="col-lg-6 col-md-12 col-12">
            <div className="listingProfile-member-each mt-4">
              <h4 className="specialists-lable mb-0">
                Expertise Practice Areas <span style={{ color: "red" }}>*</span>
              </h4>
              <div className="specialists-multiselect-div">
                {specialists.map((specialist, index) => (
                  <label key={index} className="dropdown-options">
                    <input
                      type="checkbox"
                      className="custom-checkbox me-3"
                      checked={selectedItems.includes(specialist)}
                      onChange={() => handleCheckboxChange(specialist)}
                    />
                    {specialist}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-12 col-12">
            <div className="listingProfile-member-p mt-4">
              <h4>Career Highlights</h4>
              <div className="row">
                <div className="col-md-6 col-lg-6 col-6">
                  <div className="form-group">
                    <label className="lable-profile-txt">
                      Cases Won <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="cases_won"
                      className="profile-form"
                      placeholder="won count"
                      value={profiles.cases_won || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-lg-6 col-6">
                  <div className="form-group">
                    <label className="lable-profile-txt">
                      Happy Clients <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="happy_clients"
                      className="profile-form"
                      placeholder="Happy clients"
                      value={profiles.happy_clients || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-lg-6 col-6">
                  <div className="form-group">
                    <label className="lable-profile-txt">
                      Years Active <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="years_active"
                      className="profile-form"
                      placeholder="Years active"
                      value={profiles.years_active || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-lg-6 col-6">
                  <div className="form-group">
                    <label className="lable-profile-txt">
                      Success Rate <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="success_rate"
                      className="profile-form"
                      placeholder="Success rate %"
                      value={profiles.success_rate || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Jurisdiction ─────────────────────────────────────────────── */}
        <div className="listingProfile-member-p mt-4">
          <h4>
            Jurisdiction <span style={{ color: "red" }}>*</span>
          </h4>
          <div className="jurisdiction-buttons">
            {jurisdictionCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`jurisdiction-btn ${
                  selectedJurisdictions[cat] !== undefined ? "active" : ""
                }`}
                onClick={() => toggleJurisdictionCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {selectedJurisdictions["Supreme Court"] !== undefined && (
            <div className="jurisdiction-sub-list mt-3">
              <h6 className="lable-profile-txt mb-2">Select Supreme Court</h6>
              <div className="specialists-multiselect-div">
                {SupremeCourtData.SupremeCourt.map((court) => (
                  <label key={court.id} className="dropdown-options">
                    <input
                      type="checkbox"
                      className="custom-checkbox me-3"
                      checked={
                        Array.isArray(selectedJurisdictions["Supreme Court"]) &&
                        selectedJurisdictions["Supreme Court"].includes(court.name)
                      }
                      onChange={() => toggleSubItem("Supreme Court", court.name)}
                    />
                    {court.name}
                    <small className="text-muted ms-2">({court.location})</small>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedJurisdictions["High Court"] !== undefined && (
            <JurisdictionSearch
              label="Select High Courts"
              placeholder="Search High Court..."
              items={HighCourtsData.highCourts}
              selectedItems={
                Array.isArray(selectedJurisdictions["High Court"])
                  ? selectedJurisdictions["High Court"]
                  : []
              }
              onToggle={(name) => toggleSubItem("High Court", name)}
            />
          )}

          {selectedJurisdictions["District Court"] !== undefined && (
            <JurisdictionSearch
              label="Select District Courts"
              placeholder="Search District Court..."
              items={districtCourts.districtCourts}
              selectedItems={
                Array.isArray(selectedJurisdictions["District Court"])
                  ? selectedJurisdictions["District Court"]
                  : []
              }
              onToggle={(name) => toggleSubItem("District Court", name)}
            />
          )}

          {selectedJurisdictions["Tribunals"] !== undefined && (
            <JurisdictionSearch
              label="Select Tribunals"
              placeholder="Search Tribunal..."
              items={Tribunals.Tribunals}
              selectedItems={
                Array.isArray(selectedJurisdictions["Tribunals"])
                  ? selectedJurisdictions["Tribunals"]
                  : []
              }
              onToggle={(name) => toggleSubItem("Tribunals", name)}
            />
          )}
        </div>

        {/* ── Website Template ─────────────────────────────────────────── */}
        <div className="listingProfile-member-p mt-4">
          <h4>
            Website Template <span style={{ color: "red" }}>*</span>
          </h4>
          <div className="row template-rows">
            {templates.map((t) => (
              <img
                key={t.path}
                src={t.img}
                alt={`template-${t.path}`}
                onClick={() => handleTemplateSelect(t)}
                className="template-img template-rows"
                style={{
                  border:
                    profiles.templatepath === t.path
                      ? "3px solid #28a745"
                      : "1px solid #ccc",
                }}
              />
            ))}
          </div>

          {profiles.templatepath && (
            <div className="mt-3 d-flex align-items-center gap-2">
              <label className="lable-profile-txt mb-0">
                Your listing Website Link
              </label>
              <button
                type="button"
                className="profile-save-btn"
                style={{ fontSize: "12px", padding: "4px 12px" }}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://juristbot.ai${profiles.templatepath}/${userid}`
                  );
                  toast.success("Link copied!");
                }}
              >
                Copy
              </button>
            </div>
          )}

          <div className="d-flex justify-content-end mt-2">
            <button className="profile-save-btn" onClick={handleSaveProfile}>
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingProfile;