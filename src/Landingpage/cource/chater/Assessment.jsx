import React, { useEffect,useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../components/AuthContext";
import config from '../../../components/config/config'

const Assessment = ({ module }) => {
  const assessment = module?.assessment;
  const { user } = useAuth();
  const userId = user?.id;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [percentage, setPercentage] = useState(null);

 
  useEffect(() => {
    if (!userId || !module?.course_id || !module?.module_id) return;

    const fetchSubmitted = async () => {
      try {
        const res = await axios.get( `${config.apiBaseUrl}/course/assessment/submitted/${userId}/${module.course_id}/${module.module_id}` );

        if (res.data.submitted) {
          const backendAnswers = {};

          res.data.answers.forEach((a, index) => {
            backendAnswers[index] = a.user_answer;
          });

          setAnswers(backendAnswers);
          setPercentage(res.data.module_percentage);
          setSubmitted(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSubmitted();
  }, [userId, module]);



  if (!assessment || !assessment.qa || !assessment.qa.mcqs) {
    return <p>No assessment available.</p>;
  }

  const handleSelect = (qIndex, letter) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: letter }));
  };

 const handleSubmit = async () => {
   try {
     const res = await axios.post(
       `${config.apiBaseUrl}/course/assessment/submit`,
       {
         user_id: userId,
         course_id: module.course_id,
         module_id: module.module_id,
         answers,
       }
     );

     setSubmitted(true);
     setPercentage(res.data.module_percentage);
     toast.success("Assessment submitted successfully");
   } catch (err) {
     toast.error(err.response?.data?.message || "Submit failed");
   }
 };


  return (
    <div className="assessment-container">
      <h4 className="mb-3">Assessment</h4>

      {assessment.qa.mcqs.map((mcq, index) => {
        const userAnswer = answers[index];
        const correctAnswer = mcq.correct_answer;

        return (
          <div key={index} className="mcq-card mb-4">
            <p className="mcq-question">
              <strong>
                {index + 1}. {mcq.question}
              </strong>
            </p>

            <ol className="mcq-options">
              {mcq.options.map((option, optIndex) => {
                const letter = option.charAt(0);
                let className = "mcq-option";

                if (submitted) {
                  if (letter === correctAnswer) className += " correct";
                  else if (letter === userAnswer) className += " wrong";
                }

                return (
                  <li key={optIndex} className={className}>
                    <label>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={letter}
                        disabled={submitted}
                        checked={userAnswer === letter}
                        onChange={() => handleSelect(index, letter)}
                      />{" "}
                      {option}
                    </label>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}

      {!submitted && (
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Assessment
        </button>
      )}

      {submitted && percentage !== null && (
        <p className="result-text">
          Score: <strong>{percentage}%</strong>
        </p>
      )}
    </div>
  );
};

export default Assessment;
