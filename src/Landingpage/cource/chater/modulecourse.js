import React, { useCallback, useEffect, useState } from "react";
import "../cource.css";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../components/config/apiconfig";
import { toast } from "react-toastify";
import book from "../chater/svgicon/book.svg";
import completed from "../chater/svgicon/completed.svg";
import pasteicon from "../chater/svgicon/pasteicon.svg";
import backicon from "../chater/svgicon/backicon.svg";
import { useAuth } from "../../../components/AuthContext";
import Lock from "../chater/svgicon/lock.svg";

function Modulecourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const userid = user?.id;

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  const fetchmodule = useCallback(async () => {
    if (!id || !userid) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get( `/course/modules/${id}/${userid}`);
      setCourses(response.data.modules || []);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to fetch course modules"
      );
    } finally {
      setLoading(false);
    }
  }, [id, userid]);

  useEffect(() => {
    if (id && userid) {
      fetchmodule();
    }
  }, [id, userid, fetchmodule]);

  return (
    <div className="pattern-bnner">
      <div className="container-main">
        <div className="d-flex align-items-center gap-2 mb-3">
          <img
            src={backicon}
            alt="Back"
            className="back-icon"
            onClick={() => navigate(-1)}
            style={{ cursor: "pointer", width: "22px" }}
          />
          <h4 className="mb-0">AI Powered Drafting</h4>
        </div>

        {loading && <p>Loading modules...</p>}

        {!loading && courses.length === 0 && (
          <p className="text-muted">No modules available.</p>
        )}

        <div className="row d-flex">
          {courses.map((module) => (
            <div
              key={module.module_id}
              className={`col-md-6 col-lg-3 pt-3 ${
                module.is_locked ? "locked-wrapper" : ""
              }`}
              onClick={() => {
                if (module.is_locked) {
                  toast.info("Complete previous module to unlock");
                  return;
                }
                navigate(`/mycourse/module/course`, { state: { module } });
              }}
            >
              <div
                className={`card ai-card shadow-sm ${
                  module.is_locked ? "locked-card" : ""
                }`}
              >
                <div className="card-body pt-0 p-0">
                  <h5 className="card-title">{module.module_title}</h5>
                  <p className="card-text text-muted">{module.description}</p>
                </div>
                <div className="d-flex justify-content-around align-items-center mt-3 text-center footer-icons">
                  <div className="d-flex flex-column align-items-center">
                    <img src={book} alt="Topics" className="footer-icon" />
                    <p className="mb-0">{module.topic_count}</p>
                    <small>Topics</small>
                  </div>

                  <div className="d-flex flex-column align-items-center">
                    <img
                      src={completed}
                      alt="Completed"
                      className="footer-icon"
                    />
                    <p className="mb-0">{module.progress_percentage}</p>
                    <small>Completed</small>
                  </div>

                  <div className="d-flex flex-column align-items-center">
                    <img src={pasteicon} alt="Result" className="footer-icon" />
                    <p className="mb-0">{module.module_percentage}</p>
                    <small>Result</small>
                  </div>
                </div>

                {module.is_locked && (
                  <div className="lock-overlay">
                    <img src={Lock} alt="Lock" className="lock-icon" />
                    <small>Complete previous module</small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Modulecourse;

