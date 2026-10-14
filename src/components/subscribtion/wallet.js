import React, { useState, useCallback, useMemo } from 'react';
import './res.css';
import axios from 'axios';
import { useAuth } from "../AuthContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config/config';
import { useNavigate } from "react-router-dom";
import logoImage from "../Assets/logo-chat.png";

function Wallet({ planData }) {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { id: userid, username, email, mobile_no: userphone_number } = useMemo(() => user || {}, [user]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const isactiveplan = useMemo(
    () => Number(planData?.user_active?.activeplan) === 1,
    [planData]
  );

  const handleRecharge = () => {
    if (!isactiveplan) {
      toast.info("Please purchase setup plan first to enable wallet recharge.");
      return;
    }

    const rechargeAmount = Number.parseInt(amount, 10);
    if (!rechargeAmount || Number.isNaN(rechargeAmount)) {
      toast.error("Please enter a valid number");
      return;
    }
    if (rechargeAmount < 100) {
      toast.error("Minimum recharge amount is ₹200");
      return;
    }
    if (rechargeAmount % 100 !== 0) {
      toast.error("Please enter amount in multiples of 100");
      return;
    }

    handlePayment();
  };

  const paymentVerification = useCallback(async (signatureResponse) => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}/payment/verify-subscription`, { userid, ...signatureResponse });
      if (response.data.status === 'success') {
        navigate("/payment-success");
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        login(token);
        toast.success('Subscription purchased successfully!');
        setTimeout(() => {
          navigate("/chat");
          window.location.reload();
        }, 2000);
      } else {
        toast.error(response.data.error || 'Subscription verification failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error in subscription verification');
    }
  }, [userid, navigate, login]);

  const handlePayment = async () => {
    try {
      setPaymentProcessing(true);

      const { data: subResponse } = await axios.post(`${config.apiBaseUrl}/payment/create-order-wallet`, {
        purchaser: { userid },
        planName: "wallet",
        amount: amount.toString(),
      });

      if (subResponse.success) {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          currency: "INR",
          name: "JuristBot AI",
          description: "Wallet Recharge",
          image: logoImage,
          order_id: subResponse.subscription.id,
          handler: function (afterPayResponse) {
            paymentVerification({
              ...afterPayResponse,
              months: 12,
              isSubscription: false,
              planName: "wallet"
            });
            setPaymentProcessing(false);
          },
          prefill: {
            name: username,
            email: email.trim(),
            contact: userphone_number,
          },
          theme: {
            color: "#B8863B",
          },
          modal: { escape: false, ondismiss: () => setPaymentProcessing(false) }
        };

        const razorpayObject = new window.Razorpay(options);
        razorpayObject.open();
        razorpayObject.on('payment.failed', function (response) {
          alert(response.error.description);
          setPaymentProcessing(false);
        });
      } else {
        toast.error("Error while processing payment");
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="lg-balance-card">
      <div>
        <span className="lg-balance-label">Wallet Balance</span>
        <div className="lg-balance-amount">
          ₹{planData?.plan?.walletBalance || "0"}<span>.00</span>
        </div>
        <p className="lg-balance-note">1 credit = ₹1 · Add funds to keep using paid tools</p>
      </div>

      <div className="lg-recharge-block">
        <label htmlFor="recharge-amount" className="lg-recharge-label">Recharge amount</label>
        <div className="lg-recharge-row">
          <input
            id="recharge-amount"
            type="number"
            className="lg-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
          />
          <button className="lgs-btn-brass" onClick={handleRecharge}>
            {paymentProcessing ? "Recharging…" : "Recharge"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Wallet;