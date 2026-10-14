import './listing.css';
import location from "../listing/location.svg";
import whatsapp from "./whatsapp.svg";
import mail from "./mail.svg";
import review from './review.png';
import { Link, useParams } from 'react-router-dom';
import React, { useState, useEffect,useCallback  } from 'react';
import axios from 'axios';
import config from "../../components/config/config";

function Listingview() {
  const {id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('practice');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [testimonials, setTestimonials] = useState([]);

 const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${config.apiBaseUrl}/auth/get-reviews`, {
        params: { lawyer_id: id }
      });
      setTestimonials(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  }, [id,]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/auth/getmemberlistingem`, {
          params: { userid: id }
        });
        setProfile(response.data[0]);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    fetchReviews();
  }, [id,fetchReviews]);

 

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openReview = () => setReviewOpen(true);

  const closereview = () => {
    setReviewOpen(false);
    setRating(0);
    setReviewName('');
    setReviewText('');
  };

  const handelsubmit = async () => {
    if (rating === 0 || !reviewName.trim() || !reviewText.trim()) {
      alert('Please fill all fields including rating');
      return;
    }
    try {
      await axios.post(`${config.apiBaseUrl}/auth/submit-review`, {
        lawyer_id: id,
        reviewer_name: reviewName,
        review_text: reviewText,
        rating
      });
      closereview();
      fetchReviews(); // refresh after submit
    } catch (err) {
      alert('Failed to submit review');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <p>Loading...</p>
    </div>
  );

  if (!profile) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <p>Profile not found.</p>
    </div>
  );

  const jurisdictions = profile.jurisdiction && typeof profile.jurisdiction === 'object'
  ? Object.entries(profile.jurisdiction).flatMap(([courtType, courts]) =>
      Array.isArray(courts) ? courts : [courtType]
    )
  : [];

  const practiceAreas = Array.isArray(profile.law_specialists)
    ? profile.law_specialists : [];

  return (
    <div className="main-container">
      <div className="listingview-back-button-listview">
        <Link to="/list-lawyers">
          <button className="back-button-listview">Back to Listings</button>
        </Link>
      </div>

      {/* Profile Card */}
      <section className="profile-section-listview">
        <div className="profile-card-listview">
          <div className="profile-image-listview">
            <img src={profile.profile_img} alt={profile.username} />
          </div>
          <h1 className="profile-name-listview">Adv. {profile.username}</h1>
          <p className="profile-title-listview">{profile.role}</p>
          <div className="rating-section">
            <div className="stars-listview">★★★★☆ 4.8</div>
            <p className="location-listview">
              <img src={location} alt="Location" /> {profile.town}, {profile.state}
            </p>
          </div>
          <div className="action-buttons-listview">
            <button className="book-consultation-btn-listview" onClick={scrollToContact}>Book Consultation</button>
            <button className="write-review-btn-listview" onClick={openReview}>Write a Review</button>
          </div>
          <div className="stats-grid-listview">
            <div className="stat-listview"><h3>{profile.cases_won}+</h3><p>Cases Won</p></div>
            <div className="stat-listview"><h3>{profile.years_active}+</h3><p>Years Active</p></div>
            <div className="stat-listview"><h3>{profile.happy_clients}+</h3><p>Happy Clients</p></div>
            <div className="stat-listview"><h3>{parseFloat(profile.success_rate).toFixed(0)}%</h3><p>Success Rate</p></div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about-section-listview" id="about">
        <h2 className="pb-3 about-title-listview">About</h2>
        <p className="about-images-listview-p">{profile.about}</p>
      </section>

      {/* Expertise */}
      <section className="practice-section-listview">
        <h2 className="section-title-listview">Expertise</h2>
        <div className="tabs-wrapper-listview">
          <div className="tabs-container-listview">
            <button
              className={`tab-button-listview ${activeTab === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveTab('practice')}
            ><span className="tab-icon-listview">📋</span> Practice Areas</button>
            <button
              className={`tab-button-listview ${activeTab === 'jurisdiction' ? 'active' : ''}`}
              onClick={() => setActiveTab('jurisdiction')}
            ><span className="tab-icon-listview">⚖️</span> Jurisdiction</button>
          </div>
        </div>
        {activeTab === 'practice' && (
          <div className="content-grid-listview practice-grid-listview">
            {practiceAreas.map((area, i) => (
              <div key={i} className="expertise-card-listview">
                <div className="card-content-listview">{area}</div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'jurisdiction' && (
          <div className="content-grid-listview jurisdiction-grid-listview">
            {jurisdictions.map((j, i) => (
              <div key={i} className="expertise-card-listview">
                <div className="card-content-listview">{j}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="testimonials-section-listview">
        <h2 className="testimonials-section-title-h">
          What Our Clients <span className="testimonials-section-title-span">Say About Our Services</span>
        </h2>
        <div className="row">
          <div className="col-lg-7 col-md-12 col-12 d-flex flex-column justify-content-center mb-3 ">
            <div className="testimonials-list" style={{height:'100%', overflowY:'auto', maxHeight:'500px', }}>
              {testimonials.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first to write one!</p>
              ) : (
                testimonials.map((t, i) => (
                  <div key={i} className="testimonial-card-listview">
                    <p className="testimonial-text-listview">{t.review_text}</p>
                    <div className="testimonial-meta-listview">
                      <div className="stars-listview">{'★'.repeat(t.rating)}</div>
                      <p className="testimonial-name-listview">{t.reviewer_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="col-lg-5 col-md-12 col-12 d-flex">
            <div className="testimonial-image-frame-listview">
              <img src={review} alt="Client Meeting" className="testimonial-image-listview" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section-listview" id="contact">
        <div className="contact-main-listview">
          <h2 className="contact-title-listview">Contact Us</h2>
          <p className="contact-description-listview">
            For any legal matters requiring attention, or for clarification regarding our services,
            please feel free to contact us at your convenience.
          </p>
          <div className="contact-card-listview">
            <h3 className="contact-card-listview-name">Adv. {profile.username}</h3>
            <p className="contact-title-listview-y">{profile.role}</p>
            <p className="contact-location-listview">
              <img src={location} alt="loc" /> {profile.town}, {profile.state}
            </p>
            <div className="contact-details-listview">
              <a href={`mailto:${profile.email}`} className="contact-link-listview">
                <img src={mail} alt="mail" style={{ width: '25px' }} /> {profile.email}
              </a>
              <a href={`tel:+91${profile.whatsapp_no}`} className="contact-link-listview">
                <img src={whatsapp} alt="whatsapp" style={{ width: '25px' }} /> {profile.whatsapp_no}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {reviewOpen && (
        <div className="review-modal-listview">
          <div className="review-modal-content-listview">
            <div>
              <h2 className="review-modal-title-listview">Your Name</h2>
              <input
                type="text" className="review-name-input-listview"
                placeholder="Your Name" value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
              />
            </div>
            <h2 className="review-modal-title-listview">Write a Review</h2>
            <div className="textarea-wrapper-listview">
              <textarea
                className="review-textarea-listview"
                placeholder="Share your experience..."
                maxLength="100" value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <p className="char-count-listview">{reviewText.length}/100</p>
            </div>
            <div>
              <h2 className="review-modal-title-listview">Rating</h2>
              <div className="stars-rating-container-listview">
                {[1,2,3,4,5].map(star => (
                  <span key={star}
                    className={`star-icon-listview ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >★</span>
                ))}
              </div>
              {rating > 0 && <p className="rating-text-listview mb-0">{rating} out of 5 stars</p>}
            </div>
            <div className="d-flex gap-3 justify-content-end align-items-center">
              <button className="submit-review-btn-listview" onClick={closereview}>Cancel</button>
              <button className="submit-review-btn-listview" onClick={handelsubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Listingview;