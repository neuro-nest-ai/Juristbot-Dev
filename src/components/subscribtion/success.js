import React from 'react';
import './res.css';
import fort from'../Assets/Animation.gif'

const PaymentSuccess = () => {
  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="checkmark-container">
         <img src={fort} alt='mm' />
        </div>
        <h1 className='sucess-hesd '>Payment Successful</h1>
        <p className='sucees-p'>Your payment has been successfully processed!</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
