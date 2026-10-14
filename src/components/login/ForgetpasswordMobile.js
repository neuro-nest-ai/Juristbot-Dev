import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import emails from "../Assets/icons/mobile.svg";
import { ToastContainer, toast } from 'react-toastify';
import config from '../config/config';
import 'react-toastify/dist/ReactToastify.css';
import "./forgetpassword.css";


function ForgetmobileForm() {
    const [mobileNo, setMobileNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        console.log("Mobile Number Submitted: ", mobileNo); 
        try {
            const response = await axios.post(`${config.apiBaseUrl}/auth/sendotpmobile`, { mobile_no: mobileNo });
            console.log(response.data);
            toast.success('OTP sent successfully to your mobile number!', {
                position: "top-right",
                autoClose: 5000,
            });
    
            setTimeout(() => {
                navigate('/setpassword');
            }, 3000);
    
        } catch (error) {
            console.error('Error:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message, {
                    position: "top-right",
                    autoClose: 5000,
                });
            
            } else {
                toast.error('Failed to send OTP. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };
    
    

    return (
        <div className="container-fluid backimage3">
            <div className="row  justify-content-center align-items-center h-100">
                   <div className="col-lg-4  col-md-8 col-10 col-12">
                    <div className='container-fluid '>
                        <div className="registrationforget">
                            <form onSubmit={handleLogin}>
                                <div>
                                    <h3 className='passhead'>It's ok! Reset your password</h3>
                                </div>
                                <div className='mt-4 col-12'>
                                <div className="input-container">
                                <img src={emails} alt="emails" className="loginfaicons" />
                                    <input type="text"
                                        className="reg-form"
                                        placeholder='Enter Mobile No'
                                        value={mobileNo}
                                        onChange={(e) => setMobileNo(e.target.value)}
                                        required />
                                </div>
                                </div>
                                <button className='forgetpassbtn mt-3' type="submit" disabled={loading}>
                                    {loading ? 'Sending...' : 'Continue'}
                                </button>
                                {error && <p className="text-danger text-center">{error}</p>}
                                <p className='text-center  ptextpassforget'>Don’t have an account?
                                    <Link className="colorlogin" to="/register"> <span className='colorlogin'> Sign up</span></Link>
                                </p>
                                <p className='text-center  ptextpassforget'>
                                    <Link className="colorlogin" to="/forgetpassEmail"> <span className='colorlogin'>Try another Way</span></Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default ForgetmobileForm;
