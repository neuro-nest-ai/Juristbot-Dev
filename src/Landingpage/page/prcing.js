import React, { useState } from 'react'
import './pricing.css';
import tick from '../assetes/tick.svg';
import tickw from '../assetes/tickw.svg';
import { Link } from "react-router-dom";

function Pricing() {
    const [isMonthly, setIsMonthly] = useState(true);

    return (
        <div className='price-banner-img-new'>
            <div className='container pt-4'>
                <div className='' >
                    <p className='price-new-text'>Choose a plan that fits your practice and pay only for what you use. No hidden charges. No complexity.</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p className='Enjoy-text'>New users enjoy Get Started at ₹499 - Get 750 Credits</p>
                </div>
                <div className='d-flex justify-content-end mb-2'>
                    <div className="plan-toggle-container">
                        <div className="toggle-button">
                            <button type="button"
                                className={`plan-option ${isMonthly ? 'active' : ''}`}
                                onClick={() => setIsMonthly(true)}
                            >
                                Monthly
                            </button>
                            <button type="button"
                                className={`plan-option ${!isMonthly ? 'active' : ''}`}
                                onClick={() => setIsMonthly(false)}
                            >
                                Yearly
                            </button>
                        </div>
                        <p className="save-note-price">Save 17% with Yearly Plan</p>
                    </div>
                </div>

                <div className='row row-equal-height row-left-right'>
                    {/* Standard */}
                    <div className='col-lg-4 mb-4'>
                        <div className='price-card-new-l card'>
                            <div className='card-body p-0'>
                                <div className='mb-3'>
                                    <h3 className='card-title-price'>Standard Pack</h3>
                                    <p className='price-new-p'>Access powerful tools without the complexity, and only pay for what you use.</p>
                                </div>
                                <p className='card-price-new mb-0'>
                                    <span>₹</span>{isMonthly ? '499' : '4999'}
                                    <span className='month-text-new'> {isMonthly ? '/month' : '/year'} +18% GST</span>
                                </p>
                                <div className='credit-badge mt-2'>
                                    
                                    <span>₹{isMonthly ? '500' : '5000'} + 50% extra = {isMonthly ? '750' : '7500'} credit</span>
                                </div>
                                <p className='pt-3'>Included:</p>
                                <ul className='ul-text-new-s mb-0'>
                                    <li><img src={tick} alt="tick" className='me-3' />AI Software Access </li>
                                    <li><img src={tick} alt="tick" className='me-3' />Scenario Solver</li>
                                    <li><img src={tick} alt="tick" className='me-3' />Legal Drafting</li>
                                    <li><img src={tick} alt="tick" className='me-3' />Cross Q/A</li>
                                    <li><img src={tick} alt="tick" className='me-3' />Relevant Judgement Finder</li>
                                    <li><img src={tick} alt="tick" className='me-3' />AI Legal Course Video about Pleading and Drafting </li>
                                    <li><img src={tick} alt="tick" className='me-3' />AI Legal Specialist Listing in Jurisbot website</li>
                                    <li><img src={tick} alt="tick" className='me-3' />3 Days AI Legal Prompting Programe.</li>
                                </ul>
                            </div>
                            <Link to="/register" className='text-decoration-none'>
                                <div className='d-flex justify-content-end pt-5'>
                                    <button type="button" className='btn btn-outline-dark w-100'>Get Started</button>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Premium */}
                    <div className='col-lg-4 mb-4'>
                        <div className='price-card-new-l card highlight-standard'>
                            <div className='card-body p-0'>
                                <div className='mb-3'>
                                    <h3 className='card-title-price-s'>Premium Pack</h3>
                                    <p className='price-new-p'>Everything you need to get started, designed for smooth, reliable workflows.</p>
                                </div>
                                <p className='card-price-new mb-0'>
                                    <span>₹</span>{isMonthly ? '1499' : '14999'}
                                    <span className='month-text-new'> {isMonthly ? '/month' : '/year'} +18% GST</span>
                                </p>
                                <div className='credit-badge mt-2'>
                                    <span>₹{isMonthly ? '1500' : '15000'} + 75% extra = {isMonthly ? '2500' : '25000'} credit</span>
                                </div>
                                <p className='pt-3'>Included:</p>
                                <ul className='ul-text-new-s mb-0'>
                                    <li><img src={tickw} alt="tick" className='me-3' />AI Software Access </li>
                                    <li><img src={tickw} alt="tick" className='me-3' />Scenario Solver</li>
                                    <li><img src={tickw} alt="tick" className='me-3' />Legal Drafting</li>
                                    <li><img src={tickw} alt="tick" className='me-3' />Cross Q/A</li>
                                    <li><img src={tickw} alt="tick" className='me-3' />Relevant Judgement Finder</li>
                                    <li><img src={tickw} alt="tick" className='me-3' />AI Legal Course Video about Pleading and Drafting </li>
                                    <li><img src={tickw} alt="tick" className='me-3' />AI Legal Specialist Listing in Jurisbot website</li>
                                    <li><img src={tickw} alt="tick" className='me-3' />Seo enabled website Landing page</li>
                                    <li><img src={tickw} alt="tick" className='me-3' />Online Assist for Case Research and Drafting using AI Credits.</li>
                                </ul>
                            </div>
                            <Link to="/register" className='text-decoration-none'>
                                <div className='d-flex justify-content-end pt-5'>
                                    <button type="button" className='btn btn-warning w-100'>Get Started</button>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Pro */}
                    <div className='col-lg-4 mb-4'>
                        <div className='price-card-new-l card'>
                            <div className='card-body p-0'>
                                <div className='mb-3'>
                                    <h3 className='card-title-price'>Pro Pack</h3>
                                    <p className='price-new-p'>All-in-one tools to kickstart your work, built for seamless and efficient performance.</p>
                                </div>
                                <p className='card-price-new mb-0'>
                                    <span>₹</span>{isMonthly ? '4999' : '49999'}
                                    <span className='month-text-new'> {isMonthly ? '/month' : '/year'} +18% GST</span>
                                </p>
                                <div className='credit-badge mt-2'>
                                    <span>₹{isMonthly ? '5000' : '50000'} + 100% extra = {isMonthly ? '10000' : '100000'} credit</span>
                                </div>
                                <p className='pt-3'>Included:</p>
                                <ul className='ul-text-new-s mb-0'>
                                    <li><img src={tick} alt="tick" className='me-3' />AI Software Access </li>
                                    <li><img src={tick} alt="tick" className='me-3' />Scenario Solver</li>
                                    <li><img src={tick} alt="tick" className='me-3' />Legal Drafting</li>
                                    <li><img src={tick} alt="tick" className='me-3' />Cross Q/A</li>
                                    <li><img src={tick} alt="tick" className='me-3' />Relevant Judgement Finder</li>
                                    <li><img src={tick} alt="tick" className='me-3' />AI Legal Course Video about Pleading and Drafting </li>
                                    <li><img src={tick} alt="tick" className='me-3' />AI Legal Specialist Listing in Jurisbot website</li>
                                    <li><img src={tick} alt="tick" className='me-3' />3 Days AI Legal Prompting Programe.</li>
                                    <li><img src={tick} alt="tick" className='me-3' />Online Assist for Case Research and Drafting using AI Credits.</li>
                                    <li><img src={tick} alt="tick" className='me-3' /> Relationship Manager to takecare the Drafting work using AI Credit</li>
                                </ul>
                            </div>
                            <Link to="/register" className='text-decoration-none'>
                                <div className='d-flex justify-content-end pt-4'>
                                    <button type="button" className='btn btn-outline-dark w-100'>Get Started</button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Pricing;