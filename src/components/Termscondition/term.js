import React from 'react';
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import './terms.css'
function Terms() {
    return (
      <div className='background-color-terms'>
        <div className="container">
          <Link to="/">
            <h1>
              <FontAwesomeIcon className="iconback" icon={faArrowLeft} />
            </h1>
          </Link>
          <div className="row">
            <div className="col-lg-2 col-md-1 col-1"> </div>
            <div className="col-lg-8 col-md-10 col-10">
              <h1 className="terms-head mt-4">Terms and Conditions</h1>
              <h4 className="termsecond mt-3">Your Agreement</h4>
              <h6 className="texthird mt-4">Introduction</h6>
              <p className="termsp">
                Welcome to Jurist Bot, a service provided by NeuroNest AI Pvt
                Ltd, Coimbatore. By subscribing to our platform, you agree to
                the following terms and conditions. Please read them carefully.
              </p>

              <h6 className="texthird">Subscription Services</h6>
              <p className="termsp">
                1. Service Description: Your subscription grants you access to
                exclusive features including Legal Drafting, Court Judgements,
                and Cross Question functionalities.
              </p>
              <p className="termsp">
                2. Subscription Plans: Various subscription plans may be
                offered, each with specific terms and conditions. Details of
                these plans are available on our website.
              </p>

              <h6 className="texthird">No Refund Policy</h6>
              <p className="termsp">
                1. Non-Refundable: All subscription fees are non-refundable.
                Once a subscription is purchased, the payment is final, and no
                refunds will be issued under any circumstances.
              </p>
              <h6 className="texthird">Cancellation Policy</h6>
              <p className="termsp">
                1.Cancellation Request: All requests to cancel must be submitted
                at least 10 calendar days prior to the scheduled automatic
                renewal date.{" "}
              </p>
              <p className="termsp">
                2.How to Cancel: Cancellations can be processed directly through
                the user’s account settings or by contacting the JuristBot
                Support Team.
              </p>
              <p className="termsp">
                3.Automatic Renewal: Unless cancelled in advance, all
                subscriptions will automatically renew at the end of the current
                subscription term, and the applicable subscription fee will be
                charged.
              </p>
              <p className="termsp">
                4.Responsibility: Kindly note that, it is the subscriber’s
                responsibility to ensure that cancellation requests are
                submitted within the required notice period to avoid automatic
                renewal.
              </p>

              <h6 className="texthird">Jurisdiction</h6>
              <p className="termsp">
                1. Legal Jurisdiction: All disputes arising from or in
                connection with this agreement shall be subject to the exclusive
                jurisdiction of the courts of Coimbatore, India.
              </p>

              <h6 className="texthird">Intellectual Property</h6>
              <p className="termsp">
                1. Rights Reserved: All intellectual property rights, including
                but not limited to copyrights, trademarks, and patents, in and
                to the services and content provided by Jurist Bot, are owned by
                NeuroNest AI Pvt Ltd, Coimbatore. Unauthorized use of any such
                materials is prohibited.
              </p>

              <h6 className="texthird">User Conduct</h6>
              <p className="termsp">
                1. Compliance with Laws: Subscribers must comply with all
                applicable laws and regulations while using our services
              </p>
              <p className="termsp">
                2. Prohibited Use: Any misuse of the platform, including but not
                limited to unauthorized access, dissemination of inappropriate
                content, or violation of intellectual property rights, is
                strictly prohibited.
              </p>

              <h6 className="texthird">Termination</h6>
              <p className="termsp">
                1. Termination of Services: NeuroNest AI Pvt Ltd reserves the
                right to terminate or suspend your access to our services
                without prior notice for any violation of these terms and
                conditions or other applicable policies
              </p>

              <h6 className="texthird">Disclaimer</h6>
              <p className="termsp">
                1. No Legal Advice: The services provided by Jurist Bot are
                intended for informational purposes only and do not constitute
                legal advice. Users should seek professional legal counsel for
                specific legal matters.
              </p>

              <h6 className="texthird">Amendments</h6>
              <p className="termsp">
                1. Changes to Terms: NeuroNest AI Pvt Ltd reserves the right to
                amend these terms and conditions at any time. Subscribers will
                be notified of any significant changes, and continued use of the
                services constitutes acceptance of the amended terms.
              </p>

              <p className="termsp">
                {" "}
                By subscribing to and using Jurist Bot, you acknowledge that you
                have read, understood, and agree to be bound by these terms and
                conditions. Thank you for choosing Jurist Bot by
                NeuroNest AI Pvt Ltd.
              </p>
              <p className="mt-5"></p>
            </div>
            <div className="col-lg-2 col-md-1 col-1"> </div>
          </div>
        </div>
      </div>
    );
}

export default Terms