import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../cource.css";
import backicon from "../chater/svgicon/backicon.svg";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../../components/AuthContext";
import Assessment from "./Assessment";
import DiscussionForum from "./DiscussionForum";
import config from '../../../components/config/config'


const generateUUID = async () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const WATCHTIME_API =`${config.apiBaseUrl}/course/modules-progress/updatewatchtime`;

const WATCHTIME_INTERVAL = 10;


function Coursedetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { module } = location.state || {};
  const [activeTab, setActiveTab] = useState("description");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const progressRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [lastSyncedTime, setLastSyncedTime] = useState(0);
  const watchIntervalRef = useRef(null);
  const { user } = useAuth();
  const userId = user?.id;


  useEffect(() => {
    if (videoRef.current && module?.watched_seconds > 0) {
      videoRef.current.currentTime = module.watched_seconds;
      setCurrentTime(module.watched_seconds);
    }
  }, [module]);

  // Wrap updateWatchTime in useCallback to memoize it
  const updateWatchTime = useCallback(async (seconds) => {
    try {
      await fetch(WATCHTIME_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          module_id: module?.module_id || module?.id,
          watched_seconds: Math.floor(seconds),
        }),
      });

      setLastSyncedTime(seconds);
    } catch (error) {
      console.error("Watchtime update failed:", error);
    }
  }, [userId, module?.module_id, module?.id]);

  useEffect(() => {
    if (!isPlaying) return;

    watchIntervalRef.current = setInterval(() => {
      if (videoRef.current) {
        const current = videoRef.current.currentTime;

        // Only sync if user actually progressed
        if (current - lastSyncedTime >= WATCHTIME_INTERVAL) {
          updateWatchTime(current);
        }
      }
    }, WATCHTIME_INTERVAL * 1000);

    return () => {
      clearInterval(watchIntervalRef.current);
    };
  }, [isPlaying, lastSyncedTime, updateWatchTime]);

  useEffect(() => {
    const handleUnload = () => {
      if (videoRef.current) {
        updateWatchTime(videoRef.current.currentTime);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [updateWatchTime]);





  useEffect(() => {
    generateUUID().then(setThreadId);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && progressRef.current && videoRef.current) {
        const progressBar = progressRef.current;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        videoRef.current.currentTime = clickPosition * duration;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, duration]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("mousemove", handleMouseMove);
      videoElement.addEventListener("mouseleave", () => {
        if (isPlaying) setShowControls(false);
      });
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("mousemove", handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  if (!module) return <div className="container-main">No module found.</div>;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (videoRef.current && progressRef.current) {
      const progressBar = progressRef.current;
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = clickPosition * duration;
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleProgressHover = (e) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const hoverPosition = (e.clientX - rect.left) / rect.width;
      setHoverTime(hoverPosition * duration);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = async () => {
    if (!input.trim() || !threadId) return;

    const userMsg = { from: "usercourse", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const botId = Date.now().toString();

    try {
      const res = await fetch("https://model.juristbot.ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, thread_id: threadId })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (let line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.replace("data: ", "");

          if (data === "[DONE]") {
            setLoading(false);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.op === "content_append" && parsed.text) {
              setMessages(prev => {
                const exists = prev.find(m => m.id === botId);
                if (exists) {
                  return prev.map(m =>
                    m.id === botId ? { ...m, text: m.text + parsed.text } : m
                  );
                } else {
                  return [...prev, { id: botId, from: "botcourse", text: parsed.text }];
                }
              });
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentTime / duration) * 100 || 0;
  const hoverPercentage = (hoverTime / duration) * 100 || 0;

  // Render Description Content
  const renderDescription = () => {
    const desc = module.detail_description;
    
    if (!desc) return <p>No description available</p>;
    
    if (typeof desc === 'string') return <p>{desc}</p>;
    
    const content = desc.content || desc;
    
    return (
      <div className="description-content">
        {content.title && <h4 className="mb-3">{content.title}</h4>}
        {content.intro && <p className="mb-4">{content.intro}</p>}
        
        {content.sections && Array.isArray(content.sections) && content.sections.map((section, idx) => (
          <div key={idx} className="section-block mb-2">
            {section.heading && <h5 className="mb-3">{section.heading}</h5>}
            
            {section.subsections && Array.isArray(section.subsections) && section.subsections.map((sub, subIdx) => (
              <div key={subIdx} className="subsection mb-3">
                {sub.title && <h6 className="mb-2"><strong>{sub.title}:</strong></h6>}
                {sub.points && Array.isArray(sub.points) && (
                  <ul className="custom-list">
                    {sub.points.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Render Lesson Notes Content
  const renderLessonNotes = () => {
    const notes = module.lesson_notes;
    
    if (!notes) return <p>No lesson notes available.</p>;
    
    if (typeof notes === 'string') return <p>{notes}</p>;
    
    return (
      <div className="lesson-notes-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {notes.title &&   <h4 className="mb-3">{notes.title}</h4>}
        
        </div>
        
        {notes.sections && Array.isArray(notes.sections) && notes.sections.map((section, idx) => (
          <div key={idx} className="lesson-section mb-4" style={{ 
            // border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            {section.heading && (
              <h5 className="mb-3" style={{ fontWeight: '600' }}>
                {section.order || (idx + 1)}. {section.heading}
              </h5>
            )}
            
            {section.content && (
              <div className="content-text mb-3">
                {typeof section.content === 'string' ? (
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>{section.content}</p>
                ) : Array.isArray(section.content) ? (
                  section.content.map((para, pIdx) => (
                    <p key={pIdx} style={{ marginBottom: '10px', lineHeight: '1.6' }}>{para}</p>
                  ))
                ) : null}
              </div>
            )}
            
            {section.keypoints && (
              <div className="keypoints" style={{
                backgroundColor: '#fffbf0',
                padding: '15px',
                borderRadius: '6px',
                borderLeft: '4px solid #ffc31c'
              }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Keypoints :</strong>
                {typeof section.keypoints === 'string' ? (
                  <div style={{ marginLeft: '20px' }}>
                    {section.keypoints.split('.').filter(k => k.trim()).map((point, kIdx) => (
                      <div key={kIdx} style={{ marginBottom: '5px' }}>• {point.trim()}.</div>
                    ))}
                  </div>
                ) : Array.isArray(section.keypoints) ? (
                  <ul style={{ marginLeft: '20px', marginBottom: '0' }}>
                    {section.keypoints.map((point, kIdx) => (
                      <li key={kIdx} style={{ marginBottom: '5px' }}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };


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
          <h5 className="mb-0">{module.module_title}</h5>
        </div>

        <div className="course-layout">
          <div
            className="video-section"
            style={{ position: "relative" }}
            onMouseEnter={() => setShowControls(true)}
          >
            <video
              ref={videoRef}
              src={module.video_url}
              className="course-video"
              controlsList="nodownload noplaybackrate nopictureinpicture"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => {
                setIsPlaying(false);
                if (videoRef.current) {
                  updateWatchTime(videoRef.current.currentTime);
                }
              }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />

            {!isPlaying && (
              <div
                onClick={togglePlay}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "60px",
                  height: "60px",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  pointerEvents: "auto",
                  zIndex: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffc31cff";
                  e.currentTarget.style.transform =
                    "translate(-50%, -50%) scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                  e.currentTarget.style.transform =
                    "translate(-50%, -50%) scale(1)";
                }}
              >
                <svg
                  width="35"
                  height="35"
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ marginLeft: "3px" }}
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: "7px",
                left: "0",
                right: "0",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                padding: "10px",
                opacity: showControls || !isPlaying ? 1 : 0,
                transition: "opacity 0.3s ease",
                pointerEvents: showControls || !isPlaying ? "auto" : "none",
                borderRadius: "10px",
              }}
            >
              <div
                ref={progressRef}
                onClick={handleProgressClick}
                onMouseMove={handleProgressHover}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                  width: "100%",
                  height: isHovering ? "6px" : "5px",
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  borderRadius: "2px",
                  cursor: "pointer",
                  position: "relative",
                  marginBottom: "8px",
                  transition: "height 0.1s ease",
                }}
              >
                {isHovering && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${hoverPercentage}%`,
                      bottom: "100%",
                      transform: "translateX(-50%)",
                      marginBottom: "8px",
                      backgroundColor: "rgba(0, 0, 0, 0.9)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 100,
                    }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}

                {isHovering && (
                  <div
                    style={{
                      width: `${hoverPercentage}%`,
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: "2px",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      pointerEvents: "none",
                    }}
                  />
                )}

                <div
                  style={{
                    width: `${progressPercentage}%`,
                    height: "100%",
                    backgroundColor: "#ffc31cff",
                    borderRadius: "2px",
                    transition: isDragging ? "none" : "width 0.1s linear",
                    position: "relative",
                  }}
                >
                  <div
                    onMouseDown={handleMouseDown}
                    style={{
                      position: "absolute",
                      right: "-6px",
                      top: "50%",
                      transform: `translateY(-50%) scale(${
                        isHovering || isDragging ? 1 : 0
                      })`,
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#ffc31cff",
                      borderRadius: "50%",
                      cursor: "pointer",
                      transition: isDragging ? "none" : "transform 0.2s ease",
                      boxShadow: "0 0 4px rgba(0,0,0,0.5)",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {isPlaying ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <span style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="chatbot-section">
            <div className="chatbot-header">
              <div className="bot-avatar">🤖</div>
              <div>
                <strong>JuristBot AI</strong>
                <p className="bot-subtitle">
                  Helping you learn the law with confidence.
                </p>
              </div>
            </div>

            <div className="chatbot-body" ref={streamRef}>
              {messages.map((m, i) => (
                <div key={i} className={`bot-message-jd ${m.from}`}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              ))}
              {loading && (
                <div className="bot-message-jd botcourse">Typing…</div>
              )}
            </div>

            <div className="chatbot-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>➤</button>
            </div>
          </div>
        </div>

        <div className="tab-bar mb-3">
          <button
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={activeTab === "notes" ? "active" : ""}
            onClick={() => setActiveTab("notes")}
          >
            Lesson Notes
          </button>
          <button
            className={activeTab === "discussion" ? "active" : ""}
            onClick={() => setActiveTab("discussion")}
          >
            Discussion
          </button>
          <button
            className={activeTab === "assessment" ? "active" : ""}
            onClick={() => setActiveTab("assessment")}
          >
            Assessment
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && renderDescription()}
          {activeTab === "notes" && renderLessonNotes()}
           {activeTab === "discussion" && (
            <DiscussionForum module={module}  />
          )}
          {activeTab === "assessment" && (
            <Assessment module={module} userId={user?.id} />
          )}
         
        </div>
      </div>
    </div>
  );
}

export default Coursedetails;