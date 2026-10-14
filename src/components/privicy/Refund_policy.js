import { faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';

function RefundPolicy() {
  return (
    <div className='background-color-terms'>
    <div className='container-fluid mt-3'>
    <Link to="/">
        <h1><FontAwesomeIcon className='iconback' icon={faArrowLeft} /></h1></Link>
      </div>
      
    <div className="container ">
      <div className="row ">
        <div className="col-lg-1 col-md-1 col-1"> </div>
        <div className="col-lg-10 col-md-10 col-10">
          <h3 className='privicypolicy-head mt-4'>Refund and Cancellation Policy</h3>
          <p className='privicysecond mt-4'>At JuristBot AI, we are committed to ensuring a smooth and transparent experience. While we do not offer refunds, customers have the option to cancel their orders under certain conditions. Please review the policy below for further details.</p>
          
          <h5 className='privicypolicy mt-4'>1. Refund Policy</h5>  
          <p className='privicysecond'>
            We regret to inform you that no refunds are offered on any products or services purchased through our platform.
          </p>
          <ul>
            <li>All sales are considered final once the purchase is confirmed.</li>
            <li>Customers are encouraged to review their orders carefully before completing their purchase.</li>
          </ul>

          <h5 className='privicypolicy my-4'>2. Cancellation Policy</h5>
            <p className='privicysecond'>
           Cancellation & Automatic Renewal Policy.
          </p>
          <ul>
            <li>Cancellation Request: All requests to cancel must be submitted at least 10 calendar days prior to the scheduled automatic renewal date.</li>
            <li>How to Cancel: Cancellations can be processed directly through the user’s account settings or by contacting the JuristBot Support Team.</li>
            <li>Automatic Renewal: Unless cancelled in advance, all subscriptions will automatically renew at the end of the current subscription term, and the applicable subscription fee will be charged.</li>
            <li>Responsibility: Kindly note that, it is the subscriber’s responsibility to ensure that cancellation requests are submitted within the required notice period to avoid automatic renewal.</li>
          </ul>

          <h6 className='privicypolicy2'>How to Cancel an Order:</h6>
          <p className='text-privicy'>To request a cancellation, contact us:</p>
          <ul>
            <li>Email: <a href="mailto:info@juristbot.ai">info@juristbot.ai</a></li>
            <li>Phone: <a href="tel:+919655442477">+91 96-55-44-2477</a></li>
            <li>Include your order number and contact details in the request.</li>
          </ul>

          <h6 className='privicypolicy2'>Post-Cancellation Process:</h6>
          <p className='text-privicy'>Upon approval of a cancellation request:</p>
          <ul>
            <li>Any payments made will be converted into store credits for future purchases.</li>
            <li>No monetary refunds will be issued.</li>
          </ul>

          <h5 className='privicypolicy mt-4'>3. Non-Cancellable Items</h5>
          <p className='privicysecond'>
            Certain items and services cannot be canceled once purchased, including:
          </p>
          <ul>
            <li>Subscription-based services after activation.</li>
            <li>Perishable goods such as food items.</li>
            <li>Custom-made or personalized products.</li>
          </ul>

          <h5 className='privicypolicy mt-4'>4. Additional Guidelines</h5>
          <p className='privicysecond'>
            Cancellations are subject to the timelines and conditions specified above.
          </p>
          <ul>
            <li>Once a product related to JuristBot AI services has been shipped, no cancellations will be entertained.</li>
            <li>Customers are encouraged to review their orders carefully before confirming.</li>
          </ul>

          <h5 className='privicypolicy mt-4'>5. Frequently Asked Questions (FAQs)</h5>
          <h6 className='privicypolicy2 mt-3'>What is included in the JuristBot AI subscription?</h6>
          <ul>
            <li>The subscription provides access to a range of AI-driven legal services, including automated legal drafting, research assistance, case management, and more. Additional features may be available based on your subscription plan.</li>
          </ul>

          <h6 className='privicypolicy2 mt-3'>How can I subscribe to JuristBot AI?</h6>
          <ul>
            <li>You can subscribe by visiting our website and selecting a subscription plan that suits your needs. Once you have completed the subscription process, you will receive immediate access to the JuristBot AI services.</li>
          </ul>

          <h6 className='privicypolicy2 mt-3'>What are the available subscription plans?</h6>
          <ul>
            <li>We offer several subscription plans based on the level of service and features you require. For more details, visit the subscription page on our website or contact our sales team for personalized recommendations.</li>
          </ul>

          <h6 className='privicypolicy2 mt-3'>Is there a free trial available for JuristBot AI?</h6>
          <ul>
            <li>JuristBot AI offers a 7-day free trial for new users to experience its AI-driven legal assistance services. This trial allows you to explore features such as automated legal drafting, research assistance, and case management tools. To begin your free trial, visit the registration page on our website.</li>
          </ul>

          <h5 className='privicypolicy mt-4'>6. Contact Us</h5>
          <ul>
            <li>Email: <a href="mailto:info@juristbot.ai">info@juristbot.ai</a></li>
            <li>Phone: <a href="tel:+919655442477">+91 96-55-44-2477</a></li>
          </ul>
        </div>
        <div className="col-lg-1 col-md-1 col-1"> </div>
      </div>
    </div>
    </div>
  );
}

export default RefundPolicy;
