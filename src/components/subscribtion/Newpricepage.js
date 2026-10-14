import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './res.css';
import tick from '../Assets/ticicon.svg';
import Wallet from './wallet';
import { Link, useNavigate } from 'react-router-dom';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from "../AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../config/apiconfig';
import logoImage from "../Assets/logo-chat.png";

// ============================================
// PLAN CATALOG - Standard / Premium / Pro only
// ============================================

const initialactiveplan = {
  setup: {
    price: 499,
    plan_id: 'order_initialactive',
    credits: 750,
    features: [
      'AI Software Access',
      'Scenario Solver',
      'Legal Drafting',
      'Cross Q/A',
      'Relevant Judgement Finder',
      'AI Legal Course Video about Pleading and Drafting'
    ]
  }
};

const planCatalog = {
  standard: {
    monthly: {
      price: 499,
      // plan_id: 'plan_TEwUmY0kcRheeK', // dev
      plan_id: 'plan_TGwD1hhoct4juo', // prod
      credits: 750,
      features: [
        'AI Software Access',
        'Scenario Solver',
        'Legal Drafting',
        'Cross Q/A',
        'Relevant Judgement Finder',
        'AI Legal Course Video about Pleading and Drafting',
        'AI Legal Specialist Listing in Jurisbot website',
        '3 Days AI Legal Prompting Programe.'
      ]
    },
    yearly: {
      price: 4999,
      plan_id: 'order_ad_std_dpdp',
      credits: 7500,
      features: [
        'AI Software Access',
        'Scenario Solver',
        'Legal Drafting',
        'Cross Q/A',
        'Relevant Judgement Finder',
        'AI Legal Course Video about Pleading and Drafting',
        'AI Legal Specialist Listing in Jurisbot website',
        '3 Days AI Legal Prompting Programe.'
      ]
    },
  },
  premium: {
    monthly: {
      price: 1499,
      // plan_id: 'plan_TEwW9JVtOYqb6A', // dev
      plan_id: 'plan_TGwDhoF0O43v1P', // prod
      credits: 2500,
      features: [
        'AI Software Access',
        'Scenario Solver',
        'Legal Drafting',
        'Cross Q/A',
        'Relevant Judgement Finder',
        'AI Legal Course Video about Pleading and Drafting',
        'AI Legal Specialist Listing in Jurisbot website',
        '3 Days AI Legal Prompting Programe.',
        'Online Assist for Case Research and Drafting using AI Credits.'
      ]
    },
    yearly: {
      price: 14999,
      plan_id: 'order_ad_prm_dpdp',
      credits: 25000,
      features: [
        'AI Software Access',
        'Scenario Solver',
        'Legal Drafting',
        'Cross Q/A',
        'Relevant Judgement Finder',
        'AI Legal Course Video about Pleading and Drafting',
        'AI Legal Specialist Listing in Jurisbot website',
        '3 Days AI Legal Prompting Programe.',
        'Online Assist for Case Research and Drafting using AI Credits.'
      ]
    },
  },
  pro: {
    monthly: {
      price: 4999,
      // plan_id: 'plan_TEwXH1RL8JoICv', // dev
      plan_id: 'plan_TGwECNYaMirpJV', // prod
      credits: 10000,
      features: [
        'AI Software Access',
        'Scenario Solver',
        'Legal Drafting',
        'Cross Q/A',
        'Relevant Judgement Finder',
        'AI Legal Course Video about Pleading and Drafting',
        'AI Legal Specialist Listing in Jurisbot website',
        '3 Days AI Legal Prompting Programe.',
        'Online Assist for Case Research and Drafting using AI Credits.',
        'Relationship Manager to takecare the Drafting work using AI Credit'
      ]
    },
    yearly: {
      price: 49999,
      plan_id: 'order_ad_pro_dpdp',
      credits: 100000,
      features: [
        'AI Software Access',
        'Scenario Solver',
        'Legal Drafting',
        'Cross Q/A',
        'Relevant Judgement Finder',
        'AI Legal Course Video about Pleading and Drafting',
        'AI Legal Specialist Listing in Jurisbot website',
        '3 Days AI Legal Prompting Programe.',
        'Online Assist for Case Research and Drafting using AI Credits.',
        'Relationship Manager to takecare the Drafting work using AI Credit'
      ]
    },
  },
};

function PlansSection({ activedata }) {
  const [isMonthly, setIsMonthly] = useState(true);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { id: userid, username, email, mobile_no: userphone_number } = useMemo(() => user || {}, [user]);
  const [paymentProcessing, setPaymentProcessing] = useState({
    standard: false,
    premium: false,
    pro: false,
    setup: false,
  });
  const currentPlanName = activedata?.plan?.sub_Details?.plan_Name;
  const currentSubId = activedata?.user_active?.sub_id;
  const activeplan = user?.activeplan;

  const paymentVerification = useCallback(
    async (signatureResponse) => {
      try {
        const response = await axiosInstance.post(`/payment/verify-subscription`, {
          userid,
          ...signatureResponse,
        });
        if (response.data.status === "success") {
          navigate("/payment-success");
          const { token } = response.data;
          localStorage.setItem("authToken", token);
          login(token);
          toast.success("Subscription purchased successfully!");
          setTimeout(() => {
            navigate("/chat");
            window.location.reload();
          }, 2000);
        } else {
          toast.error(response.data.error || "Subscription verification failed");
        }
      } catch (err) {
        toast.error(err.response?.data?.error || "Error in subscription verification");
      }
    },
    [userid, navigate, login]
  );

  // ---- Payment handler for the ₹99 initial setup plan ----
  const handleSetupPayment = async () => {
    const selectedPlan = initialactiveplan.setup;

    try {
      setPaymentProcessing((prev) => ({ ...prev, setup: true }));

      const { data: subResponse } = await axiosInstance.post(`/payment/create-order`, {
        plan: selectedPlan.plan_id,
        purchaser: { userid },
        planName: "setup",
        activeplan,
      });

      if (subResponse.success) {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          currency: "INR",
          name: "JuristBot AI",
          description: "Initial Setup Plan",
          image: logoImage,
          order_id: subResponse.subscription.id,
          handler: function (afterPayResponse) {
            paymentVerification({
              ...afterPayResponse,
              plan_id: subResponse.subscription.plan_id,
              planName: "setup",
              isSubscription: false,
              activeplan,
            });
            setPaymentProcessing((prev) => ({ ...prev, setup: false }));
          },
          prefill: {
            name: username,
            email: (email || "").trim(),
            contact: userphone_number,
          },
          theme: { color: "#ffc82f" },
          modal: {
            escape: false,
            ondismiss: () =>
              setPaymentProcessing((prev) => ({ ...prev, setup: false })),
          },
        };

        const razorpayObject = new window.Razorpay(options);
        razorpayObject.open();
        razorpayObject.on("payment.failed", function (response) {
          alert(response.error.description);
          setPaymentProcessing((prev) => ({ ...prev, setup: false }));
        });
      } else {
        toast.error("Error while processing payment");
        setPaymentProcessing((prev) => ({ ...prev, setup: false }));
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentProcessing((prev) => ({ ...prev, setup: false }));
    }
  };

  // ---- Payment handler for standard/premium/pro plans ----
  const handlePayment = async (planKey, duration) => {
    const selectedPlan = planCatalog[planKey]?.[duration];

    if (!selectedPlan) {
      toast.error("Invalid plan selection");
      return;
    }

    const isSubscription = duration === "monthly";

    try {
      setPaymentProcessing((prev) => ({ ...prev, [planKey]: true }));

      const apiUrl = isSubscription
        ? `/payment/create-subscription`
        : `/payment/create-order`;

      const { data: subResponse } = await axiosInstance.post(apiUrl, {
        plan: selectedPlan.plan_id,
        purchaser: { userid },
        months: 12,
        planName: planKey,
        duration,
        activeplan,
      });

      if (subResponse.success) {
        const entity = isSubscription ? "subscription_id" : "order_id";
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          currency: "INR",
          name: "JuristBot AI",
          description: isSubscription ? "Subscription Plan" : "One-time Purchase",
          image: logoImage,
          [entity]: subResponse.subscription.id,
          handler: function (afterPayResponse) {
            paymentVerification({
              ...afterPayResponse,
              plan_id: subResponse.subscription.plan_id,
              months: 12,
              planName: planKey,
              isSubscription,
              activeplan,
            });
            setPaymentProcessing((prev) => ({ ...prev, [planKey]: false }));
          },
          prefill: {
            name: username,
            email: (email || "").trim(),
            contact: userphone_number,
          },
          theme: { color: "#ffc82f" },
          modal: {
            escape: false,
            ondismiss: () =>
              setPaymentProcessing((prev) => ({ ...prev, [planKey]: false })),
          },
        };

        const razorpayObject = new window.Razorpay(options);
        razorpayObject.open();
        razorpayObject.on("payment.failed", function (response) {
          alert(response.error.description);
          setPaymentProcessing((prev) => ({ ...prev, [planKey]: false }));
        });
      } else {
        toast.error("Error while processing payment");
        setPaymentProcessing((prev) => ({ ...prev, [planKey]: false }));
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentProcessing((prev) => ({ ...prev, [planKey]: false }));
    }
  };

  // ============================================
  // activeplan === 0 (or falsy) → show ONLY the ₹99 setup card
  // ============================================
  if (!activeplan) {
    const setupPlan = initialactiveplan.setup;
    return (
      <div className="lg-plans-grid">
        <div className="lg-plan-card is-popular">
          <h3 className="lg-plan-name">Setup Plan</h3>
          <div className="lg-plan-price">
            ₹{setupPlan.price}
            <span className="unit"> one-time +18% GST</span>
          </div>

          <div className="lg-credit-pool">
            <span className="lg-credit-pool-label">Total Credits</span>
            <span className="lg-credit-pool-value">
              {setupPlan.credits.toLocaleString()}
            </span>
            <span className="lg-credit-pool-note">Shared across all tools below</span>
          </div>

          <ul className="lg-perks">
            {setupPlan.features.map((feature, idx) => (
              <li key={idx}>
                <img src={tick} alt="" />
                {feature}
              </li>
            ))}
          </ul>

          <button type="button"
            className="lg-buy-btn"
            onClick={handleSetupPayment}
            disabled={paymentProcessing.setup}
          >
            {paymentProcessing.setup ? "Processing payment…" : "Buy now"}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // activeplan === 1 → normal Standard/Premium/Pro grid
  // ============================================
  const plans = [
    { key: 'standard', label: 'Standard', popular: false },
    { key: 'premium', label: 'Premium', popular: true },
    { key: 'pro', label: 'Pro', popular: false },
  ];

  return (
    <div>
      <div className="lg-toggle-wrap">
        <div className="lg-toggle">
          <button type="button"
            className={isMonthly ? "active" : ""}
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </button>
          <button type="button"
            className={!isMonthly ? "active" : ""}
            onClick={() => setIsMonthly(false)}
          >
            Yearly
          </button>
        </div>
        <p className="lg-toggle-note">Save 17% with the yearly plan</p>
      </div>

      <div className="lg-plans-grid">
        {plans.map(({ key, label, popular }) => {
          const duration = isMonthly ? 'monthly' : 'yearly';
          const plan = planCatalog[key][duration];
          const isCurrent = currentPlanName === key;

          return (
            <div key={key} className={`lg-plan-card ${popular ? 'is-popular' : ''}`}>
              {popular && <div className="lg-popular-tag">Popular</div>}
              {isCurrent && (
                <div className="lg-stamp">Active<br />Plan</div>
              )}

              <h3 className="lg-plan-name">{label} Plan</h3>
              <div className="lg-plan-price">
                ₹{plan.price}
                <span className="unit"> /{isMonthly ? "month" : "year"} +18% GST</span>
              </div>

              {activedata?.user_active?.sub_id && activedata?.plan?.planName === key && (
                <p className="lg-next-billing">
                  Next billing date:{" "}
                  <strong>
                    {new Date(activedata?.plan?.sub_Details?.sub_end).toLocaleDateString()}
                  </strong>
                </p>
              )}

              <div className="lg-credit-pool">
                <span className="lg-credit-pool-label">Total Credits</span>
                <span className="lg-credit-pool-value">{plan.credits.toLocaleString()}</span>
                <span className="lg-credit-pool-note">Shared across all tools below</span>
              </div>

              <ul className="lg-perks">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <img src={tick} alt="" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button type="button"
                className="lg-buy-btn"
                disabled={!!currentSubId}
                onClick={() => handlePayment(key, duration)}
              >
                {paymentProcessing[key]
                  ? "Processing payment…"
                  : isCurrent
                    ? "Your current plan"
                    : "Buy now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// TRANSACTIONS - single page: balance + plans
// ============================================

const Transactions = () => {
  const [planData, setPlanData] = useState(null);
  const { user } = useAuth();
  const user_id = user?.id;
  const activeplan = user?.activeplan; 
  const creditsBalance = planData?.plan?.credits?.credits ?? 0;

  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        const response = await axiosInstance.get(`/commanprofile/active-plan/${user_id}`);
        if (response.data.status === "active") {
          setPlanData(response.data);
        } else {
          setPlanData(null);
        }
      } catch (error) {
        console.error("❌ Axios Error:", error);
        toast.error("Failed to fetch subscription info.");
      }
    };

    if (user_id) fetchActivePlan();
  }, [user_id]);

  return (
    <div className="lg-page">
      <ToastContainer />
      <div className="lg-back">
        <Link to="/chat">
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
      </div>

      <div className="lg-container ">

        <div className=' p-2 mb-2'>
          <span className="lg-balance-label lg-credits-label">Credits Balance</span>
          <div className="lg-balance-amount lg-credits-amount">
               {creditsBalance.toLocaleString()}<span className='lg-balance-amount-span'>.00</span>
          </div>
        </div>


        {!!activeplan && <Wallet planData={planData} />}

        <div className="lg-divider"><span>Subscription Plans</span></div>

        <PlansSection activedata={planData} />
      </div>
    </div>
  );
};

export default Transactions;