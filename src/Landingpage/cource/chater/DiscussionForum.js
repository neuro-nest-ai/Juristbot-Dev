import React, { useState, useEffect  } from "react";
import axiosInstance from "../../../components/config/apiconfig";
import config from "../../../components/config/config";
import { toast, ToastContainer } from "react-toastify";
import "../cource.css";
import io from 'socket.io-client';
import { useAuth } from "../../../components/AuthContext";

function DiscussionForum({ module}) {
  const { user } = useAuth();
  const user_id = user?.id;
  const [message, setMessage] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${config.apiBaseUrl}`, {
      withCredentials: true,
      extraHeaders: { 'Access-Control-Allow-Origin': '*' }
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('instructorReply', (data) => {
      if (selectedDiscussion && data.discussion_id === selectedDiscussion.discussion_id) {
        setReplies((prev) => [...prev, {
          reply_id: data.reply_id,
          message: data.message,
          is_instructor: 1,
          created_at: data.created_at
        }]);
        toast.success('Instructor replied to your question!');
      }
    });

    newSocket.on('newReply', (data) => {
      if (selectedDiscussion && data.discussion_id === selectedDiscussion.discussion_id) {
        setReplies((prev) => [...prev, {
          reply_id: data.reply_id,
          user_name: data.user?.name || 'Student',
          message: data.message,
          is_instructor: data.is_instructor,
          created_at: data.created_at
        }]);
      }
    });

    newSocket.on('disconnect', () => console.log('Disconnected from Socket.IO server'));

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [selectedDiscussion]);


useEffect(() => {
  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/admin/discussions/${module.module_id}/${user_id}`);
      setDiscussions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  if (module.module_id) {
    fetchDiscussions();
  }
}, [module.module_id, user_id]);

  const handleCreateDiscussion = async () => {
    if (!message.trim()) {
      toast.error('Please enter your question');
      return;
    }
    try {
      const res = await axiosInstance.post( `/admin/discussions`,
        {
          course_id: module.course_id,
          module_id: module.module_id,
          user_id,
          message: message.trim()
        },       
      );

      if (res.data.success) {
        setMessage('');
        setShowNewQuestionModal(false);
        toast.success('Question posted successfully!');
        setDiscussions((prev) => [res.data.data, ...prev]);
      }
    } catch (err) {
      console.error('Error creating discussion:', err);
      toast.error('Failed to post question');
    }
  };

 const handleSelectDiscussion = async (discussion) => {
  setSelectedDiscussion(discussion);
  if (socket) {
    socket.emit('joinRoom', `discussion_${discussion.discussion_id}`);
  }
  try {
    const res = await axiosInstance.get(
      `/admin/discussions/${discussion.discussion_id}/${user_id}/replies`,
    );
    setReplies(res.data.data || []);
  } catch (err) {
    console.error('Error fetching replies:', err);
    if (err.response?.status === 403) {
      toast.error('You do not have access to this discussion');
    } else {
      toast.error('Failed to load replies');
    }
  }
};

  const handleReply = async () => {
    if (!replyText.trim() || !selectedDiscussion) return;

    try {
      const res = await axiosInstance.post(
        `/admin/discussions/${selectedDiscussion.discussion_id}/${user_id}/reply`,
        { message: replyText.trim() },
      );

      if (res.data.success) {
        setReplyText('');
        toast.success('Reply posted successfully!');
        
        // Add reply to local state
        setReplies((prev) => [...prev, {
          reply_id: res.data.data.reply_id,
          message: res.data.data.message,
          is_instructor: 0,
          created_at: res.data.data.created_at
        }]);
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      toast.error('Failed to post reply');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="discussion-forum-container">
      <ToastContainer />
      
      {!selectedDiscussion ? (
        // Discussion List View
        <div className="discussion-list-view">
          <div className="forum-header">
            <h4>Discussion Forum</h4>
            <button 
              className=" mt-0  btn btn-primary"
              onClick={() => setShowNewQuestionModal(true)}
            >
              + Post a Question
            </button>
          </div>

          <div className="discussions-list">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : discussions.length === 0 ? (
              <div className="empty-state">
                <p>No discussions yet. Be the first to ask a question!</p>
              </div>
            ) : (
              discussions.map((discussion) => (
                <div 
                  key={discussion.discussion_id}
                  className="discussion-card"
                  onClick={() => handleSelectDiscussion(discussion)}
                >
                  <div className="discussion-header">
                    <div className="avatar-circle">
                      {getInitials(discussion.user_name)}
                    </div>
                    <div className="discussion-meta">
                      <span className="user-name">{discussion.user_name}</span>
                      <span className="timestamp">{formatTimestamp(discussion.created_at)}</span>
                    </div>
                    {discussion.status === 'answered' && (
                      <span className="badge bg-success">Answered</span>
                    )}
                  </div>
                  <div className="discussion-content">
                    <p>{discussion.message}</p>
                  </div>
                  <div className="discussion-footer">
                    <span className="reply-count">
                      {discussion.reply_count || 0} {discussion.reply_count === 1 ? 'reply' : 'replies'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Discussion Detail View
        <div className="discussion-detail-view">
          <div className="detail-header">
            <button 
              className="btn btn-link"
              onClick={() => setSelectedDiscussion(null)}
            >
              ← Back to all discussions
            </button>
          </div>

          {/* Original Question */}
          <div className="original-question">
            <div className="question-header">
              <div className="avatar-circle yellow">
                {getInitials(selectedDiscussion.user_name)}
              </div>
              <div className="question-meta">
                <span className="user-name">{selectedDiscussion.user_name}</span>
                <span className="timestamp">{formatTimestamp(selectedDiscussion.created_at)}</span>
              </div>
            </div>
            <div className="question-body">
              <p>{selectedDiscussion.message}</p>
            </div>
          </div>

          {/* Replies */}
          <div className="replies-section">
            {replies.map((reply) => (
              <div 
                key={reply.reply_id}
                className={`reply-item ${reply.is_instructor ? 'instructor-reply' : 'user-reply'}`}
              >
                <div className="reply-header">
                  <div className={`avatar-circle ${reply.is_instructor ? 'instructor' : ''}`}>
                    {reply.is_instructor ? 'I' : getInitials(reply.user_name)}
                  </div>
                  <div className="reply-meta">
                    <span className="user-name">
                      {reply.is_instructor ? 'Instructor (JuristBot)' : reply.user_name}
                    </span>
                    <span className="timestamp">{formatTimestamp(reply.created_at)}</span>
                  </div>
                </div>
                <div className="reply-body">
                  <p>{reply.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <div className="reply-input-section">
            <textarea
              className="form-control reply-textarea"
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="3"
            />
            <div className="reply-actions">
              <button 
                className="btn btn-primary"
                onClick={handleReply}
                disabled={!replyText.trim()}
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewQuestionModal && (
        <div className="modal-overlay" onClick={() => setShowNewQuestionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Post a Question</h5>
              <button 
                className="close-btn"
                onClick={() => setShowNewQuestionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <textarea
                className="form-control"
                placeholder="What's your question?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewQuestionModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn mt-0 btn-primary"
                onClick={handleCreateDiscussion}
                disabled={!message.trim()}
              >
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiscussionForum;