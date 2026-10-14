import React, { useCallback, useEffect, useState } from "react";
import "../cource.css";
import { useNavigate } from "react-router-dom";
import cardImage from "../course1.png";
import axiosInstance from "../../../components/config/apiconfig";
import { toast } from "react-toastify";
import { useAuth } from "../../../components/AuthContext";
import Lock from './svgicon/lock.svg';
import download from './svgicon/download.svg'


function Mycourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userid = user?.id;
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

 const fetchcourse = useCallback(async () => {
  if (!userid) return;

  try {
    setLoading(true);

    const response = await axiosInstance.get( `/course/getCourse/${userid}`);

    setCourses(response.data.result || []);
  } catch (error) {
    toast.error(error.response?.data?.error || "Failed to fetch courses");
  } finally {
    setLoading(false);
  }
}, [userid]);

useEffect(() => {
  fetchcourse();
}, [fetchcourse]);

const downloadCertificate = async (courseId, e) => {
  e.stopPropagation(); 

  try {
    const res = await axiosInstance.post( `/course/certificate/generate`,
      {
        user_id: userid,
        course_id: courseId, 
      }
    );

    window.open(res.data.certificate_url, "_blank");
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Unable to download certificate"
    );
  }
}; 

  return (
    <div className="pattern-bnner">
      <div className="container-main">
        <h4>My Courses</h4>
        <div className="row">
          {courses.map((course, index) => (
            <div
                key={course.id}
                onClick={() => navigate(`/mycourse/module/${course.id}`)}
                className="col-md-6  col-lg-4 pt-2"
                >
              <div className="card ai-card shadow-sm">
                <img
                  src={course.thumbnail_url || cardImage}
                  className="card-img-top-course ai-card-img"
                  alt={course.title}
                />

                <div className="card-body pt-3 p-0">
                  <h5 className="card-title fw-bold">{course.course_title}</h5>

                  <p className="card-text text-muted">
                    {course.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <div className="text-center">
                      <div className="fw-bold fs-5">{course.module_count || 0}</div>
                      <small className="text-muted">Modules</small>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold fs-5">
                        {course.progress_percentage || 0}%
                      </div>
                      <small className="text-muted">Completed</small>
                    </div>
                    <div className="text-center certificate-wrapper">
                      {course.progress_percentage >= 95 ? (
                        <img
                          src={download}
                          alt="download certificate"
                          className="certificate-icon download"
                          onClick={(e) => downloadCertificate(course.id, e)}
                        />
                      ) : (
                        <img
                          src={Lock}
                          alt="locked"
                          className="certificate-icon lock"
                          data-bs-toggle="tooltip"
                          title="Complete All the Modules to unlock certificate"
                        />
                      )}

                      <small className="text-muted certificate-text">
                        {course.progress_percentage >= 95
                          ? "Certificate"
                          : "Certification"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && courses.length === 0 && (
            <p className="text-muted mt-3">No courses available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Mycourse;
