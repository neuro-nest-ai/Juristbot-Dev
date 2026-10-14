import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";
import config from "../config/config";
import "./profile.css";
import {Link} from "react-router-dom";
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, ToastContainer } from "react-toastify";
const CaseListRedirect = () => {
  const { user } = useAuth();
  const user_id = user?.id;
  const [requestDetails, setRequestDetails] = useState([]);
  const [modelopen ,setModelopen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const handleOpen = (caseItem) => {
    setSelectedCase(caseItem);
    setModelopen(true);
  };
const handleClose = () => {
    setModelopen(false);
};

  useEffect(() => {
    if (!user_id) return;
    axios
      .get(`${config.apiBaseUrl}/get-request/${user_id}`)
      .then((res) => {
        setRequestDetails(res.data); 
      })
      .catch((err) => {
        console.error("Error fetching request details:", err);
      });
  }, [user_id]);



  const handleAccept = async () => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}/accept-case`, {
        request_id: selectedCase.request_id,
        ...selectedCase,
        status: "accepted",
      });
      toast.success(response.data.message || "Case Accepted");
      setModelopen(false);
      setRequestDetails(prev =>
        prev.filter((req) => req.request_id !== selectedCase.request_id)
      );
    } catch (error) {
      console.error("Error accepting case:", error);
      toast.error("Failed to accept the case. Please try again.");
    }
  };
  
  const handleReject = async () => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}/reject-case`, {
        request_id: selectedCase.request_id,
        ...selectedCase,
        status: "rejected",
      });
     toast.success(response.data.message || "Case rejected ");
      setModelopen(false);
      setRequestDetails(prev =>
        prev.filter((req) => req.request_id !== selectedCase.request_id)
      );
    } catch (error) {
      console.error("Error rejecting case:", error);
      toast.error("Failed to reject the case. Please try again.");
    }
  };
  


  return (
    <div className="container-fluid">
        <ToastContainer/>
          <div className="pt-3">
               <Link to="/chat">
                 <h1><FontAwesomeIcon className='iconback ' icon={faArrowLeft} /></h1>
               </Link>
            </div>    
    <div className="overview-table-container ">
      <table className="case-table">
        <thead>
          <tr>
            <th className="text-center">S.No</th>
            <th className="text-center" >Client_Name</th>
            <th className="text-center">Client_Mobile_No</th>
            <th className="text-center">Case_request_date</th>
            <th>Case_Details</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {requestDetails.length > 0 ? (
            requestDetails.map((item, index) => (
              <tr key={item.request_id || index}>
                <td className="text-center" style={{ width: "10%" }}> {index + 1}</td>
                <td className="text-center" style={{ width: "10%" }}>{item.user_name}</td>
                <td className="text-center" style={{ width: "10%" }}>{item.user_mobile_no}</td>
                <td className="text-center" style={{ width: "10%" }}>{item.created_at?.split('T')[0]}</td>
                <td  style={{ width: "50%" }} >{item.user_des}</td>
                <td className="text-center" style={{ width: "10%" }}>
                <button
                className="btn-no view-casebtn"
                onClick={() => handleOpen(item)}
                disabled={item.status === 'accepted' || item.status === 'rejected'}
                >
                view case
                </button>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No requests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    {modelopen && selectedCase && (
  <>
    <button className="modal-overlay-cals" onClick={handleClose} aria-label="Close Modal"></button>
    <div className="modal-cals">
      <div className="form-group mb-2">
        <label htmlFor="f" className="lable-profile-txt">Enter your Name</label>
        <input
          type="text"
          className="profile-form-cals"
          placeholder="Your Name"
          value={selectedCase.user_name}
          readOnly
        />
      </div>
      <div className="form-group mb-2">
        <label htmlFor="f" className="lable-profile-txt">Phone Number</label>
        <input
          type="text"
          className="profile-form-cals"
          placeholder="Enter your Number"
          value={selectedCase.user_mobile_no}
          readOnly
        />
      </div>
      <div className="form-group mb-2">
        <label htmlFor="f" className="lable-profile-txt">Case Details</label>
        <textarea
          className="profile-form-cals"
          placeholder="Enter case details here..."
          rows="5"
          value={selectedCase.user_des}
          readOnly
        ></textarea>
      </div>
      <div className="d-flex justify-content-end">
        <button className="cals-cancle-btn" onClick={handleClose}>cancle</button>
        <button className="reject-cancle-btn ms-2" onClick={handleReject}>Reject</button>
        <button className="cals-submit-btn ms-2" onClick={handleAccept}>Accept</button>
      </div>
    </div>
  </>
)}

    </div>
  );
};

export default CaseListRedirect;
