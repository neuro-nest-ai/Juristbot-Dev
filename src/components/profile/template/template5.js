import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import config from '../../config/config';
import axios from 'axios';
import ProfileNotFound from './ProfileNotFound';
import './template1.css';
import review from './review.png';
import location from "./location.svg";

function Template5() {
  const { userid } = useParams();
  const [profile, setProfile] = useState(null);
  const [notVerified, setNotVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('practice');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [testimonials, setTestimonials] = useState([]);

  const refetchReviews = async () => {
    try {
      const res = await axios.get(`${config.apiBaseUrl}/auth/get-reviews`, {
        params: { lawyer_id: userid }
      });
      setTestimonials(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${config.apiBaseUrl}/auth/get-reviews`, {
          params: { lawyer_id: userid }
        });
        setTestimonials(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/auth/getprofile`, {
          params: { userid }
        });
        const data = response.data[0];
        setProfile(data);
        if (data.templatepath !== '/template1') {
          setNotVerified(true);
          return;
        }
      } catch (error) {
        if (error.response?.status === 404) setNotVerified(true);
      }
    };

    fetchProfile();
    fetchReviews();
  }, [userid]);

  if (notVerified) return <ProfileNotFound />;
  if (!profile) return (
    <div className="t1-loading">
      <p>Loading...</p>
    </div>
  );

  const jurisdictions = profile.jurisdiction && typeof profile.jurisdiction === 'object'
  ? Object.entries(profile.jurisdiction).flatMap(([courtType, courts]) =>
      Array.isArray(courts) ? courts : [courtType]
    )
  : [];

  const handelsubmit = async () => {
    if (rating === 0 || !reviewName.trim() || !reviewText.trim()) {
      alert('Please fill all fields including rating');
      return;
    }
    try {
      await axios.post(`${config.apiBaseUrl}/auth/submit-review`, {
        lawyer_id: userid,
        reviewer_name: reviewName,
        review_text: reviewText,
        rating
      });
      closereview();
      refetchReviews();
    } catch (err) {
      alert('Failed to submit review');
    }
  };

  const openReview = () => setReviewOpen(true);

  const closereview = () => {
    setReviewOpen(false);
    setRating(0);
    setReviewName('');
    setReviewText('');
  };

  const navLinks = [
    { label: 'Home',      id: 'Home' },
    { label: 'About',     id: 'About' },
    { label: 'Expertise', id: 'Expertise' },
    { label: 'Contact',   id: 'Contact' },
  ];

  return (
    <div>
      <nav className="t1-navbar">
        {navLinks.map(({ label, id }) => (
          <a
            key={label}
            href={`#${id}`}
            className="t1-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection(id); }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="r">

        <section className="t1-hero t1-wrapper" id="Home">
          <div className="t1-hero-bg">
            <img src={profile.profile_img} alt={profile.username} className="t1-avatar" />
          </div>
          <div>
            <h1 className="t1-name">Adv. {profile.username}</h1>
            <p className="t1-role">{profile.role}</p>
            <div className="t1-stars">★★★★☆ <span>4.8</span></div>
            <p className="t1-location">
              <img src={location} alt="Location" className="t1-location-icon" />
              {profile.state}, India
            </p>
            <div className="mb-3">
              <button
                className="t1-btn-primary"
                onClick={() => scrollToSection('Contact')}
              >
                Book Consultation
              </button>
            </div>
            <div>
              <button className="t1-btn-secondary" onClick={openReview}>Write a Review</button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="t1-stats t1-wrapper">
          {[
            { val: `${profile.cases_won}+`,                             label: 'Cases Won' },
            { val: `${profile.years_active}+`,                          label: 'Years Active' },
            { val: `${profile.happy_clients}+`,                         label: 'Happy Clients' },
            { val: `${parseFloat(profile.success_rate).toFixed(0)}%`,   label: 'Success Rate' },
          ].map(s => (
            <div key={s.label} className="t1-stat-item">
              <span className="t1-stat-val">{s.val}</span>
              <span className="t1-stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* About */}
        <section className="t1-section-about t1-wrapper" id="About">
          <h2 className="t1-section-title">About</h2>
          <p className="t1-about-text">{profile.about}</p>
        </section>

        {/* Expertise */}
        <section className="t1-section-expertise t1-wrapper" id="Expertise">
          <h2 className="t1-section-title">Expertise</h2>
          <div className="t1-tabs">
            <button
              className={`t1-tab ${activeTab === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveTab('practice')}
            >Practice Areas</button>
            <button
              className={`t1-tab ${activeTab === 'jurisdiction' ? 'active' : ''}`}
              onClick={() => setActiveTab('jurisdiction')}
            >Jurisdiction</button>
          </div>
          <div className="t1-tags">
            {activeTab === 'practice'
              ? profile.law_specialists?.map((s, i) => <span key={i} className="t1-tag">{s}</span>)
              : jurisdictions.map((j, i) => <span key={i} className="t1-tag">{j}</span>)
            }
          </div>
        </section>

        <div className="text-center">
          <h2 className="testimonials-section-title-h-t1">
            What Our Clients <span className="testimonials-section-title-span-t1">Say About Our Services</span>
          </h2>
        </div>

        <section className="testimonials-section-listview">
          <div className="row">
            <div className="col-lg-7 col-md-12 col-12 d-flex flex-column justify-content-center mb-3">
              <div className="testimonials-list" style={{ height: '100%', overflowY: 'auto', maxHeight: '500px' }}>
                {testimonials.length === 0 ? (
                  <p className="text-muted">No reviews yet. Be the first to write one!</p>
                ) : (
                  testimonials.map((t, i) => (
                    <div key={i} className="testimonial-card-listview-t1">
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
              <div className="testimonial-image-frame-listview-t1">
                <img src={review} alt="Client Meeting" className="testimonial-image-listview" />
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="t1-contact" id="Contact">
          <h2 className="t1-contact-title">Contact Us</h2>
          <p className="t1-contact-sub">
            For any legal matters requiring attention, or for clarification regarding our services, please feel free to contact us at your convenience. We are committed to providing professional and timely assistance.
          </p>
          <div className="t1-contact-card">
            <p className="t1-name">Adv. {profile.username}</p>
            <p className="t1-role">{profile.role}</p>
            <div className="t1-contact-row">
              <span>✉ {profile.email}</span>
              <span>📱 {profile.whatsapp_no}</span>
            </div>
          </div>
        </section>
      </div>

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
                {[1, 2, 3, 4, 5].map(star => (
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

export default Template5;