import React, { useState, useEffect } from "react";
import linkedin from "../assetes/images/linkedin.svg";
import instagram from "../assetes/images/instagram.svg";
import facebook from "../assetes/images/facebook.svg";
import absteact from "../assetes/images/absteact.svg";
import mail from "../assetes/images/mail.svg";
import phone from "../assetes/images/phone.svg";
import address from "../assetes/images/address.svg";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";
import axiosInstance from "../../components/config/apiconfig";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileno: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 500 });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  const validateForm = () => {
    let formIsValid = true;
    let newErrors = {};

    if (!formData.name) {
      formIsValid = false;
      newErrors.name = "First name is required.";
    } else if (formData.name.length > 50) {
      formIsValid = false;
      newErrors.name = "First name cannot exceed 50 characters.";
    }

    if (!formData.mobileno) {
      formIsValid = false;
      newErrors.mobileno = "Mobile number is required.";
    } else if (!/^[0-9]{10}$/.test(formData.mobileno)) {
      formIsValid = false;
      newErrors.mobileno = "Mobile number must be exactly 10 digits.";
    }

    if (!formData.email) {
      formIsValid = false;
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formIsValid = false;
      newErrors.email = "Email is invalid.";
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      sendMessageTemplate(formData);
    }
  };

  const sendMessageTemplate = async (formData) => {
    try {
      await axiosInstance.post(`/contact/send-message`, formData);
      alert("Message sent successfully!");
      setFormData({ name: "", mobileno: "", email: "", message: "" });
      setErrors({});
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-main-home text-center" data-aos="zoom-in-down">
      <p className="font-family" style={{ fontWeight: "700", textAlign: "left" }}>
        <img src={absteact} style={{ height: "25px", marginRight: "8px" }} alt="abstract" />
        Contact
      </p>
      <h2 className="font-family heading-section-all text-start">
        <span style={{ color: "#FFD119" }}>Contact </span>
        <span style={{ color: "#000000" }}>JuristBot AI </span>
      </h2>
      <p className="font-family con" style={{ textAlign: "left", fontSize: "16px", color: "#858585" }}>
        Fill out the form below and our team will get back to you shortly.
      </p>

      <div className="col-12 d-flex min-contact">
        <form
          onSubmit={handleSubmit}
          className="col-lg-7 col-sm-12 col-md-12"
          style={{ padding: "25px", boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px", borderRadius: "10px" }}
        >
          <div className="row justify-content-center" style={{ display: "flex", justifyContent: "flex-start !important" }}>
            <div className="col-12">

              {/* Name */}
              <div className="mb-3">
                <label htmlFor="BB" className="font-family form-data-cls">
                  First Name <span style={{ color: "#ff0000" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control contact-info"
                  placeholder="Enter first name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <small className="text-danger">{errors.name}</small>}
              </div>

              {/* Mobile */}
              <div className="mb-3">
                <label htmlFor="N" className="font-family form-data-cls">
                  Mobile Number <span style={{ color: "#ff0000" }}>*</span>
                </label>
                <input
                  type="text"
                  name="mobileno"
                  className="form-control contact-info"
                  placeholder="Enter Mobile Number"
                  value={formData.mobileno}
                  onChange={handleChange}
                  onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                  maxLength={10}
                />
                {errors.mobileno && <small className="text-danger">{errors.mobileno}</small>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="Email" className="font-family form-data-cls">
                  Email <span style={{ color: "#ff0000" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control contact-info form-data-cls"
                  placeholder="Enter your Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <small className="text-danger">{errors.email}</small>}
              </div>

              {/* Message */}
              <div className="mb-3">
                <label htmlFor="Message" className="font-family form-data-cls">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  className="form-control contact-info form-data-cls"
                  rows="4"
                  placeholder="Enter your message here"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="Contact-btn send-btn" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>

            </div>
          </div>
        </form>

        <div className="col-lg-5 col-md-12 col-sm-12 media-container pt-2">
          <div className="col-12 d-flex sub-div-container">
            <div className="contact-content">
              <p className="mgb-5 sdiv-style_text">Get in Touch</p>

              <div className="contact-item-row">
                <img src={mail} alt="Email" className="contact-svg-icon" />
                <div>
                  <p className="contact-heading">Email</p>
                  <p className="mgb-5 sdiv-style">
                    <a className="emailsdiv" href="mailto:support@juristbot.ai">support@juristbot.ai</a>
                  </p>
                </div>
              </div>

              <div className="contact-item-row">
                <img src={phone} alt="Phone" className="contact-svg-icon" />
                <div>
                  <p className="contact-heading">Phone</p>
                  <p className="mgb-5 sdiv-style">
                    <a className="emailsdiv" href="tel:+919655033228">+91 9655033228</a>
                  </p>
                </div>
              </div>

              <div className="contact-item-row">
                <img src={address} alt="Address" className="contact-svg-icon" />
                <div>
                  <p className="contact-heading">Address</p>
                  <p className="mgb-5 sdiv-style emailsdiv">
                    Neuronest AI Private Limited<br />
                    3G, A Block, Pioneer Apartments,<br />
                    Avinashi Road, Coimbatore – 641018
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 sub-div-container">
            <p className="mgb-5 sdiv-style_text">Follow Us</p>
            <div className="d-flex">
              <a href="https://www.linkedin.com/company/juristbot/" target="_blank" rel="noreferrer">
                <img className="media-img" src={linkedin} style={{ padding: "11px", marginLeft: "0px" }} alt="LinkedIn" />
              </a>
              <a href="https://www.instagram.com/jurist_bot_ai/" target="_blank" rel="noreferrer">
                <img className="media-img" src={instagram} style={{ padding: "10px" }} alt="Instagram" />
              </a>
              <a href="https://www.facebook.com/Juristbotai" target="_blank" rel="noreferrer">
                <img className="media-img" src={facebook} style={{ padding: "11px" }} alt="Facebook" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;