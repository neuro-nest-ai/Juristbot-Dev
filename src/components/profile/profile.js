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

function Profile() {
  const { user } = useAuth();
  const userid = user?.id;
  const [profileImage, setProfileImage] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);


  const Role = user?.role;

  const fetchProfile = useCallback(async () => {
    if (!userid) return;
    try {
      setLoading(true);

      const response = await axiosInstance.get(`/commanprofile/getprofile`, {
        params: { userid },
      });

      const profileData = response.data[0];

      setProfiles(profileData);
      setSelectedItems(profileData.law_specialists || []); // Set the law specialists based on profile
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch profiles");
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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


  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (specialist) => {
    setSelectedItems((prev) =>
      prev.includes(specialist)
        ? prev.filter((item) => item !== specialist)
        : [...prev, specialist]
    );
  };

  const specialists = Lawdata.specialists;

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("id", userid);
      formData.append("username", profiles.username);
      formData.append("email", profiles.email);
      formData.append("mobile_no", profiles.mobile_no);
      formData.append("role", profiles.role);
      formData.append("law_specialists", JSON.stringify(selectedItems));
      formData.append("company_name", profiles.company_name);
      formData.append("bar_code", profiles.bar_code);
      formData.append("state", profiles.state);
      formData.append("town", profiles.town);
      formData.append("address", profiles.address || "");

      if (profileImageFile) {
        formData.append("profile_img", profileImageFile);
      } else {
        formData.append("profile_img", profiles.profile_img || "");
      }

      const res = await axiosInstance.post(`/commanprofile/updateprofile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res?.data?.message || "Profile updated successfully");
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="">
      <ToastContainer />
      <div className="pt-3 ms-3">
        <Link to="/chat">
          <h1>
            <FontAwesomeIcon className="iconback" icon={faArrowLeft} />
          </h1>
        </Link>
      </div>
      {!loading &&  (
      <div className="container pt-2">
        <h5 className="mb-4 profile-Form-txt">Edit Profile</h5>
        <div className="profile-container">
          <div className="">
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
        <div className="row mt-3 p-1">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="name" className="lable-profile-txt">
                Edit your Name
              </label>
              <input
                type="text"
                className="profile-form"
                name="username"
                placeholder="John Doe"
                value={profiles.username}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="email" className="lable-profile-txt">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="profile-form disabled-input"
                placeholder="Juristbotai@gmail.com"
                value={profiles.email}
                onChange={handleInputChange}
                disabled
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="Phone Number" className="lable-profile-txt">
                Phone Number
              </label>
              <input
                type="text"
                name="mobile_no"
                className="profile-form "
                placeholder="+91 9345115068"
                value={profiles.mobile_no}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="role" className="lable-profile-txt">
                Your Role
              </label>
              <input
                type="text"
                name="role"
                className="profile-form disabled-input"
                placeholder="Lawyer"
                value={profiles.role}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>
          </div>

     

          {(Role === "Advocate" ||
            Role === "judge" ||
            Role === "lawyer" ||
            Role === "Company" ||
            !Role === "public" ||
            Role === "Student" ||
            !Role === "police") && (
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="lawSpecialists" className="lable-profile-txt">
                  Law Specialists
                </label>
                <div className="dropdown-parent">
                  <button
                    type="button"
                    id="lawCategory"
                    onClick={toggleDropdown}
                    className="profile-form-div"
                  >
                    Select Law Specialists 
                  </button>
                  {isOpen && (
                    <div className="dropdown-list">
                      <div className="dropdown-body">
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
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="gst_number" className="lable-profile-txt">
                GST Number (Optional)
              </label>
              <input
                type="text"
                name="gst_number"
                className="profile-form"
                placeholder="33AAAAA0000A1Z5"
                value={profiles.gst_number}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {(Role === "Advocate" ||
            Role === "judge" ||
            Role === "lawyer" ||
            Role === "Company" ||
            !Role === "public" ||
            !Role === "Student" ||
            !Role === "police") && (
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="company_name" className="lable-profile-txt">
                  Company name (Optional)
                </label>
                <input
                  type="text"
                  name="company_name"
                  className="profile-form"
                  placeholder="Teck Pvt Ltd"
                  value={profiles.company_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          {(Role === "Advocate" ||
            Role === "judge" ||
            Role === "lawyer" ||
            Role === "Company" ||
            !Role === "public" ||
            !Role === "Student" ||
            !Role === "police") && (
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="bar_code" className="lable-profile-txt">
                  Bar Council No
                </label>
                <input
                  type="text"
                  name="bar_code"
                  className="profile-form"
                  placeholder="TN/1234/2023"
                  value={profiles.bar_code}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="state" className="lable-profile-txt">
                State
              </label>
              <input
                type="text"
                className="profile-form disabled-input"
                name="state"
                placeholder="Karnataka"
                value={profiles.state}
                onChange={handleInputChange}
                disabled
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="town" className="lable-profile-txt">
                City
              </label>
              <input
                type="text"
                name="town"
                className="profile-form disabled-input"
                placeholder="Mysore"
                value={profiles.town}
                onChange={handleInputChange}
                disabled
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="address" className="lable-profile-txt">
                Address
              </label>
              <input
                type="text"
                name="address"
                className="profile-form"
                placeholder="no-37,df,colony"
                value={profiles.address}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="d-flex justify-content-end mt-2">
            <button className="profile-save-btn" onClick={handleSaveProfile}>
              Save Profile
            </button>
          </div>
        </div>
      </div>)}
    </div>
  );
}

export default Profile;
