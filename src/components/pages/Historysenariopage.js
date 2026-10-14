import React, { useState, useEffect, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faArrowUp, faStop, faMicrophone, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import logo from "../Assets/logo-law.png";
import defaultPdfImage from "../Assets/orangepdf.png";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config/pyconfig";
import "./chatui.css";
import axiosInstance from "../config/apiconfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../AuthContext";
import { usePlanData } from "../../hooks/usePlanData";
import {
  parseAssistantMessage,
  withClickableTokens,
  applyValues,
  SectionAccordion,
  scrollToAnchor,
} from "./Scenario";

import RichBlock from "./Richblock";

// ── Signature upload constraints ───────────────────────────────────────────
const MIN_SIG_BYTES = 5 * 1024;
const MAX_SIG_BYTES = 60 * 1024;
const ALLOWED_SIG_TYPES = new Set(["image/jpeg", "image/png"]);

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const SignatureUploadInput = ({ value, onChange, inputRef }) => {
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_SIG_TYPES.has(file.type)) {
      setError("Only JPEG or PNG images are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size < MIN_SIG_BYTES) {
      setError("Image is too small — minimum size is 10KB.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIG_BYTES) {
      setError("Image is too large — maximum size is 60KB.");
      e.target.value = "";
      return;
    }

    setError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      console.error("Signature upload error:", err);
      setError("Could not read that image. Please try again.");
    }
  };

  return (
    <div className="signature-upload">
      {value ? (
        <div className="signature-upload-preview">
          <img src={value} alt="Signature preview" className="signature-preview-img" />
          <button type="button" className="signature-upload-remove" onClick={() => onChange("")}>
            Remove
          </button>
        </div>
      ) : (
        <>
          <label className="signature-upload-btn">
            Upload signature image
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="signature-upload-input"
              style={{ display: "none" }}
              onChange={handleFile}
            />
          </label>
          <div className="signature-upload-hint">JPEG/PNG only, 10KB–60KB</div>
        </>
      )}
      {error && <div className="signature-upload-error">{error}</div>}
    </div>
  );
};

// ── Inline token editor for optional fields ────────────────────────────────
const InlineTokenInput = ({ field, onCommit, onCancel }) => {
  const [val, setVal] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const commit = (v = val) => onCommit(v);

  if (field?.type === "signature") {
    return (
      <span className="doc-inline-token-editor doc-inline-token-editor-signature" onClick={(e) => e.stopPropagation()}>
        <SignatureUploadInput
          value={val}
          onChange={(dataUrl) => {
            setVal(dataUrl);
            if (dataUrl) commit(dataUrl);
          }}
        />
        <button type="button" className="doc-inline-token-cancel" onMouseDown={(e) => e.preventDefault()} onClick={onCancel}>
          ✕
        </button>
      </span>
    );
  }

  return (
    <span className="doc-inline-token-editor" onClick={(e) => e.stopPropagation()}>
      <input
        ref={ref}
        type={field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
        className="doc-inline-token-input"
        value={val}
        placeholder={field?.label || field?.token}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
      />
      <button type="button" className="doc-inline-token-ok" onMouseDown={(e) => e.preventDefault()} onClick={() => commit()}>
        ✓
      </button>
      <button type="button" className="doc-inline-token-cancel" onMouseDown={(e) => e.preventDefault()} onClick={onCancel}>
        ✕
      </button>
    </span>
  );
};

// ── Side panel body — renders filled + empty tokens ────────────────────────
const SidePanelDocBody = ({ doc, activeFieldKey, inlineEditKey, onTokenClick, onInlineCommit, onInlineCancel }) => {
  if (!doc) return null;
  const source = doc.filledContent || doc.content || "";
  const withTokens = withClickableTokens(source, doc.placeholders);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      urlTransform={(url) => url}
      components={{
        a: ({ href, children }) => {
          if (href?.startsWith("#filled:")) {
            const fieldKey = href.slice("#filled:".length);
            return (
              <mark
                className={`doc-filled-token${activeFieldKey === fieldKey ? " active" : ""}`}
                onClick={() => onTokenClick(fieldKey)}
                title="Click to edit"
              >
                {children}
              </mark>
            );
          }

          if (href?.startsWith("#token:")) {
            const fieldKey = href.slice("#token:".length);

            if (fieldKey === inlineEditKey) {
              const field = doc.placeholders?.[fieldKey];
              return (
                <InlineTokenInput
                  field={field}
                  onCommit={(val) => onInlineCommit(fieldKey, val)}
                  onCancel={onInlineCancel}
                />
              );
            }

            return (
              <mark
                className={`doc-placeholder-token${activeFieldKey === fieldKey ? " active" : ""}`}
                onClick={() => onTokenClick(fieldKey)}
              >
                {children}
              </mark>
            );
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
        table: ({ node, ...props }) => (
          <div className="table-responsive-md table-responsive-sm">
            <table className="table table-bordered markdown-table" {...props} />
          </div>
        ),
        img: ({ alt, src }) =>
          alt === "signature" ? (
            <img src={src} alt="Signature" className="doc-signature-image" />
          ) : (
            <img src={src} alt={alt} />
          ),
      }}
    >
      {withTokens}
    </ReactMarkdown>
  );
};

// ── Truncate base64 signatures in prompt bubbles ───────────────────────────
const truncateSignaturesForDisplay = (text) => {
  if (typeof text !== "string") return text;
  return text.replace(
    /data:image\/[a-z]+;base64,[A-Za-z0-9+/=]{40,}/g,
    "[signature image]"
  );
};

const Historysenariopage = () => {
  const { user } = useAuth();
  const userid = user?.id;
  const useremail = user?.email;
  const username = user?.username;
  const userphone = user?.mobile_no;
  const userrole = user?.role;
  const state = user?.state;
  const { session_id } = useParams();
  const navigate = useNavigate();
  const { planData, planLoading } = usePlanData();
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sendDisabled, setSendDisabled] = useState(true);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [fileInputs, setFileInputs] = useState([]);
  const [pendingIndex, setPendingIndex] = useState(null);
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatContainerRef = useRef();
  const textareaRef = useRef(null);
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const [editModal, setEditModal] = useState({ open: false, index: null, text: "" });
  const editModalTextareaRef = useRef(null);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, index: null, comment: "" });
  const feedbackTextareaRef = useRef(null);
  const [openDocId, setOpenDocId] = useState(null);
  const [docValues, setDocValues] = useState({});
  const [placeholderModal, setPlaceholderModal] = useState({ open: false, values: {} });
  // ── Locked answer popup (unlock-ku credit illa na) ──
  const [lockedModal, setLockedModal] = useState({ open: false, message: "" });
  const [activeFieldKey, setActiveFieldKey] = useState(null);
  const [inlineEditKey, setInlineEditKey] = useState(null);
  const autoOpenedDocIdsRef = useRef(new Set());
  const initialHistoryDocsMarkedRef = useRef(false);
  const placeholderInputRefs = useRef({});
  const [panelWidth, setPanelWidth] = useState(370);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ startX: 0, startWidth: 370 });
  const MIN_PANEL_WIDTH = 370;
  const MAX_PANEL_WIDTH_RATIO = 0.38;
  const MAX_FILES = 5;

  // ── Documents extracted from every bot message ────────────────────────────
  const allDocuments = useMemo(() => {
    const map = {};
    messages.forEach((m) => {
      if (m.sender !== "bot" || !m.message || typeof m.message !== "string") return;
      const { documents } = parseAssistantMessage(m.message);
      Object.entries(documents).forEach(([id, doc]) => {
        map[id] = { ...(map[id] || {}), ...doc };
      });
    });
    return map;
  }, [messages]);

  const sidePanelDoc = useMemo(() => {
    if (!openDocId) return null;
    const doc = allDocuments[openDocId];
    if (!doc) return null;

    const savedValues = docValues[openDocId] || {};
    const liveValues = placeholderModal.values || {};
    const values = { ...savedValues, ...liveValues };
    return {
      ...doc,
      filledContent: applyValues(doc.content, doc.placeholders, values),
      values,
    };
  }, [openDocId, allDocuments, docValues, placeholderModal.values]);

  useEffect(() => {
    if (historyLoading) return;
    if (initialHistoryDocsMarkedRef.current) return;
    initialHistoryDocsMarkedRef.current = true;

    Object.keys(allDocuments).forEach((id) => {
      autoOpenedDocIdsRef.current.add(id);
    });
    console.log("Marked ids:", [...autoOpenedDocIdsRef.current]);
  }, [historyLoading, allDocuments]);

  useEffect(() => {
    Object.keys(allDocuments).forEach((id) => {
      if (!autoOpenedDocIdsRef.current.has(id)) {
        autoOpenedDocIdsRef.current.add(id);
        console.log("Auto-opening doc:", id);
        setOpenDocId(id);
      }
    });
  }, [allDocuments]);

  // ── Resize handle ─────────────────────────────────────────────────────────
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = { startX: e.clientX, startWidth: panelWidth };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e) => {
      const delta = resizeStartRef.current.startX - e.clientX;
      const maxWidth = window.innerWidth * MAX_PANEL_WIDTH_RATIO;
      const next = Math.min(
        Math.max(resizeStartRef.current.startWidth + delta, MIN_PANEL_WIDTH),
        maxWidth
      );
      setPanelWidth(next);
    };

    const handlePointerUp = () => setIsResizing(false);

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing]);

  useEffect(() => {
    autoOpenedDocIdsRef.current = new Set();
    initialHistoryDocsMarkedRef.current = false;

    const fetchScenario = async () => {
      setHistoryLoading(true);
      try {
        const response = await axiosInstance.get(`/history/historytest/${session_id}`);
        const fetchedScenario = response.data || { messages: [] };

        const historicalMessages = (fetchedScenario.messages || []).flatMap((msg) => [
          { sender: "you", message: msg.prompt || "", copied: false },
          {
            sender: "bot",
            // locked -> teaser (blur), illa na -> full answer
            message: msg.locked ? (msg.teaser || "") : (msg.answer || ""),
            copied: false,
            messageId: msg.message_id || msg.messageId || null,
            sessionId: session_id,
            feedback:
              msg.rating === 1 ? "up" : msg.rating === -1 ? "down" : undefined,
            followupQuestions: msg.followup_questions || undefined,
            // ── lock state ──
            isPartial: !!msg.locked,
            locked: !!msg.locked,
          },
        ]);

        setMessages(historicalMessages);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching scenario data:", error);
        setMessages([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchScenario();
  }, [session_id]);

  // ── Cancellation ──────────────────────────────────────────────────────────
  const cancelActiveStream = async ({ markCancelledInUI = false } = {}) => {
    activeRequestIdRef.current += 1;

    try {
      abortControllerRef.current?.abort();
    } catch (_) { /* no-op */ }

    if (loading && session_id) {
      try {
        const res = await fetch(`${config.apiBaseUrl}/cancel/scenario_solver/${session_id}`, {
          method: "POST",
        });
        if (res.ok && markCancelledInUI) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastBotMsgIndex = [...updated]
              .reverse()
              .findIndex((msg) => msg.sender === "bot" && msg.message === "");
            if (lastBotMsgIndex !== -1) {
              const indexToUpdate = updated.length - 1 - lastBotMsgIndex;
              updated[indexToUpdate] = { ...updated[indexToUpdate], message: " Request cancelled" };
            }
            return updated;
          });
        }
      } catch (error) {
        console.error("Cancel stream error:", error);
      }
    }

    setLoading(false);
    setPendingIndex(null);
  };

  const stopStreaming = async () => {
    await cancelActiveStream({ markCancelledInUI: true });
  };

  // ── Audio ─────────────────────────────────────────────────────────────────
  const handleAudioRecording = async () => {
    if (audioRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setAudioRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const actualMimeType = mediaRecorder.mimeType || mimeType;
        const blob = new Blob(audioChunksRef.current, { type: actualMimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start(1000);
      setAudioRecording(true);
      setAudioBlob(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
      setAudioRecording(false);
    }
  };

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = chatContainerRef.current;
    const handleScroll = () => {
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      setIsUserAtBottom(scrollHeight - scrollTop - clientHeight < 80);
    };
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && isUserAtBottom) scrollToBottom();
  }, [messages, isUserAtBottom]);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setSendDisabled(textInput.trim() === "" && fileInputs.length === 0 && !audioBlob);
  }, [textInput, fileInputs.length, audioBlob]);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 250)}px`;
  };

  useEffect(() => {
    handleInput();
  }, [textInput]);

  // ── Plan gating
  const isAllowed = useMemo(() => {

    if (planLoading) return null;
    if (!planData) return false;
    const userActive = planData?.user_active;
    const subDetails = planData?.plan?.sub_Details;
    const activeplan = Number(userActive?.activeplan);
    // Setup plan innum vaanga la -> block
    if (activeplan !== 1) return false;
    const sub_id = userActive?.sub_id;
    // activeplan 1, aana subscription edhuvum illa (sub_id/status illa) -> allow
    // (setup plan credits use panna koodum)
    if (!sub_id || !subDetails) return true;
    const planStatus = subDetails.status;
    const isStatusValid = ["active", "completed", "cancelled"].includes(planStatus || "");

    return isStatusValid;
  }, [planData, planLoading]);

  // ── Streaming ─────────────────────────────────────────────────────────────
  const consumeStream = async (res, botIndex, requestId) => {
    try {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        const errorMsg = data?.message || "Something went wrong.";
        if (activeRequestIdRef.current === requestId) {
          setMessages((prev) => {
            if (!prev[botIndex]) return prev;
            const updated = [...prev];
            updated[botIndex] = { ...updated[botIndex], message: errorMsg };
            return updated;
          });
          setLoading(false);
        }
        return;
      }
      if (!res.ok) throw new Error("Streaming failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      let currentEvent = "token";

      while (true) {
        if (activeRequestIdRef.current !== requestId) {
          try { await reader.cancel(); } catch (_) { /* no-op */ }
          return;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            const payload = line.slice(5);

            if (currentEvent === "status") {
              setMessages((prev) => {
                if (activeRequestIdRef.current !== requestId || !prev[botIndex]) return prev;
                const updated = [...prev];
                updated[botIndex] = { ...updated[botIndex], currentStatus: payload, hadStatus: true };
                return updated;
              });
            } else if (currentEvent === "token") {
              const token = payload.replace(/\\n/g, "\n").replace(/\n([✅⚠️•\-#])/g, "\n\n$1");
              setMessages((prev) => {
                if (activeRequestIdRef.current !== requestId || !prev[botIndex]) return prev;
                const updated = [...prev];
                updated[botIndex] = {
                  ...updated[botIndex],
                  currentStatus: "",
                  message: updated[botIndex].message + token,
                };
                return updated;
              });
            } else if (currentEvent === "followup_questions") {
              let parsed = null;
              try {
                parsed = JSON.parse(payload);
              } catch (err) {
                console.error("Failed to parse followup_questions payload:", err);
              }
              if (parsed?.questions) {
                setMessages((prev) => {
                  if (activeRequestIdRef.current !== requestId || !prev[botIndex]) return prev;
                  const updated = [...prev];
                  updated[botIndex] = { ...updated[botIndex], followupQuestions: parsed.questions };
                  return updated;
                });
              }
            } else if (currentEvent === "message_id") {
              let parsedId = null;
              try {
                const parsed = JSON.parse(payload);
                parsedId = parsed?.message_id || null;
              } catch (err) {
                console.error("Failed to parse message_id payload:", err);
              }
              if (parsedId) {
                setMessages((prev) => {
                  if (activeRequestIdRef.current !== requestId || !prev[botIndex]) return prev;
                  const updated = [...prev];
                  updated[botIndex] = { ...updated[botIndex], messageId: parsedId, sessionId: session_id };
                  return updated;
                });
              }
            }
          }
        }
      }
    } catch (error) {
      if (activeRequestIdRef.current !== requestId) return;

      if (error.name === "AbortError") {
        setMessages((prev) => {
          if (!prev[botIndex]) return prev;
          const updated = [...prev];
          updated[botIndex] = { ...updated[botIndex], message: "⛔ Streaming stopped by user." };
          return updated;
        });
        toast.info("Streaming stopped.");
      } else {
        console.error("Streaming error:", error);
        setMessages((prev) => {
          if (!prev[botIndex]) return prev;
          const updated = [...prev];
          updated[botIndex] = { ...updated[botIndex], message: "⚠️ Error occurred while fetching response." };
          return updated;
        });
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setLoading(false);
        setPendingIndex(null);
      }
    }
  };

  const streamToBot = async (messageText, botIndex, requestId, extraFormFields = {}) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    formData.append("query", messageText);
    formData.append("username", username);
    formData.append("email", useremail);
    formData.append("mobile_no", userphone);
    formData.append("role", userrole);
    formData.append("state", state);
    fileInputs.forEach((file) => formData.append("files", file));
    if (audioBlob) {
      const ext = audioBlob.type.includes("webm") ? "webm"
        : audioBlob.type.includes("mp4") ? "mp4"
          : audioBlob.type.includes("mpeg") || audioBlob.type.includes("mp3") ? "mp3"
            : audioBlob.type.includes("wav") ? "wav"
              : "webm"; // safe default fallback
      formData.append("files", audioBlob, `audio.${ext}`);
    }

    Object.entries(extraFormFields).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
    });

    try {
      const res = await fetch(`${config.apiBaseUrl}/completion/${userid}/${session_id}`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      await consumeStream(res, botIndex, requestId);
    } catch (error) {
      if (activeRequestIdRef.current !== requestId) return;
      console.error("Streaming error:", error);
      setMessages((prev) => {
        if (!prev[botIndex]) return prev;
        const updated = [...prev];
        updated[botIndex] = { ...updated[botIndex], message: "⚠️ Error occurred while fetching response." };
        return updated;
      });
      setLoading(false);
      setPendingIndex(null);
    }
  };

  const sendMessageWithHistory = async (e, messageText, currentMessages) => {
    e.preventDefault();
    if (planLoading) return;
    if (isAllowed === false) {
      toast.error("Please upgrade your plan to continue.");
      return;
    }
    if (!messageText.trim()) return;

    setLoading(true);
    const botIndex = currentMessages.length - 1;
    const requestId = ++activeRequestIdRef.current;
    scrollToBottom();
    await streamToBot(messageText, botIndex, requestId);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (planLoading) return;
    if (isAllowed === false) {
      toast.error("Please upgrade your plan to continue.");
      return;
    }
    if (!textInput.trim() && fileInputs.length === 0 && !audioBlob) return;
    if (loading) await cancelActiveStream();

    setLoading(true);

    const newMessages = [...messages];
    let youIndex = null;

    if (textInput.trim()) {
      newMessages.push({ sender: "you", message: textInput, copied: false });
      youIndex = newMessages.length - 1;
    }

    fileInputs.forEach((file) => {
      const isImage = file.type.startsWith("image/");
      newMessages.push({
        sender: "imageyou",
        message: (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src={isImage ? URL.createObjectURL(file) : defaultPdfImage}
              alt={file.name}
              className="imageyou"
              style={{ width: "50px", height: "50px" }}
            />
            <p className="mb-0">{file.name}</p>
          </div>
        ),
      });
    });

    if (audioBlob) {
      newMessages.push({
        sender: "imageyou",
        message: (
          <audio
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            src={URL.createObjectURL(audioBlob)}
          />
        ),
      });
    }

    newMessages.push({ sender: "bot", message: "", copied: false });
    const botIndex = newMessages.length - 1;
    const messageText = textInput;
    const requestId = ++activeRequestIdRef.current;

    setPendingIndex(youIndex);
    setMessages(newMessages);
    setAudioBlob(null);
    setTextInput("");
    setFileInputs([]);
    const fileInputElement = document.getElementById("file-input");
    if (fileInputElement) fileInputElement.value = "";

    await streamToBot(messageText, botIndex, requestId);
  };

  const handleFollowupClick = async (question, extraFormFields = {}) => {
    if (planLoading) return;
    if (isAllowed === false) {
      toast.error("Please upgrade your plan to continue.");
      return;
    }
    if (loading) await cancelActiveStream();

    setLoading(true);
    const newMessages = [...messages, { sender: "you", message: question, copied: false }];
    const youIndex = newMessages.length - 1;
    newMessages.push({ sender: "bot", message: "", copied: false });
    const botIndex = newMessages.length - 1;
    const requestId = ++activeRequestIdRef.current;

    setPendingIndex(youIndex);
    setMessages(newMessages);
    scrollToBottom();

    await streamToBot(question, botIndex, requestId, extraFormFields);
  };

  const retryMessage = async (index) => {
    const msg = messages[index];
    if (!msg?.messageId || !msg?.sessionId) {
      toast.error("Can't retry this message.");
      return;
    }
    if (loading) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = ++activeRequestIdRef.current;

    setLoading(true);
    setMessages((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        message: "",
        currentStatus: "",
        hadStatus: false,
        feedback: undefined,
        copied: false,
        followupQuestions: undefined,
        // ── partial / lock state-um reset pannu ──
        isPartial: false,
        locked: false,
        unlocking: false,
      };
      return updated;
    });
    scrollToBottom();

    try {
      const res = await fetch(
        `${config.apiBaseUrl}/retry/${userid}/${msg.sessionId}/${msg.messageId}`,
        { method: "POST", signal: controller.signal }
      );
      await consumeStream(res, index, requestId);
    } catch (error) {
      if (activeRequestIdRef.current !== requestId) return;
      console.error("Retry error:", error);
      setMessages((prev) => {
        if (!prev[index]) return prev;
        const updated = [...prev];
        updated[index] = { ...updated[index], message: "⚠️ Error occurred while retrying." };
        return updated;
      });
      setLoading(false);
      setPendingIndex(null);
    }
  };

  // ── Locked message-a full-a fetch pannu (View more) ────────────────────────
  const unlockMessage = async (index) => {
    const msg = messages[index];
    if (!msg?.messageId || !msg?.sessionId) {
      toast.error("Can't unlock this message.");
      return;
    }
    if (msg.unlocking) return;

    // andha message-a mattum loading kaatu
    setMessages((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      updated[index] = { ...updated[index], unlocking: true };
      return updated;
    });

    try {
      const res = await fetch(
        `${config.apiBaseUrl}/message/${userid}/${msg.sessionId}/${msg.messageId}/full`,
        { method: "GET", headers: { Accept: "application/json" } }
      );
      const data = await res.json();

      // ── Credit illa na -> LOCKED / PAYWALL -> popup kaatu ──
      if (data?.status === "LOCKED" || data?.status === "PAYWALL") {
        setLockedModal({ open: true, message: data.message || "" });
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[index]) updated[index] = { ...updated[index], unlocking: false };
          return updated;
        });
        return;
      }

      if (!res.ok) {
        toast.error(data?.message?.replace(/[#*]/g, "") || "Could not unlock.");
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[index]) updated[index] = { ...updated[index], unlocking: false };
          return updated;
        });
        return;
      }

      // ── Success -> full answer show, blur remove ──
      const fullAnswer = data?.answer || data?.full || data?.message || "";
      setMessages((prev) => {
        const updated = [...prev];
        if (!updated[index]) return prev;
        updated[index] = {
          ...updated[index],
          message: fullAnswer,
          isPartial: false,
          locked: false,
          unlocking: false,
        };
        return updated;
      });
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error("Could not unlock. Please try again.");
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[index]) updated[index] = { ...updated[index], unlocking: false };
        return updated;
      });
    }
  };

  // ── Edit modal ────────────────────────────────────────────────────────────
  const openEditModal = (index, text) => {
    setEditModal({ open: true, index, text });
    setTimeout(() => {
      if (editModalTextareaRef.current) {
        editModalTextareaRef.current.focus();
        editModalTextareaRef.current.style.height = "auto";
        editModalTextareaRef.current.style.height =
          Math.min(editModalTextareaRef.current.scrollHeight, 300) + "px";
      }
    }, 60);
  };

  const closeEditModal = () => setEditModal({ open: false, index: null, text: "" });

  const saveEdit = async () => {
    const { index, text } = editModal;
    if (!text.trim()) return;
    if (loading) await cancelActiveStream();

    const sliced = messages
      .slice(0, index + 1)
      .map((m, i) => (i === index ? { ...m, message: text } : m));
    sliced.push({ sender: "bot", message: "", copied: false });

    setPendingIndex(index);
    setMessages(sliced);
    closeEditModal();

    await sendMessageWithHistory({ preventDefault: () => {} }, text, sliced);
  };

  // ── Feedback ──────────────────────────────────────────────────────────────
  const submitFeedback = async (index, rating, comment) => {
    const msg = messages[index];
    if (!msg?.messageId || !msg?.sessionId) {
      console.error("Cannot submit feedback: missing messageId/sessionId for message", index);
      toast.error("Couldn't submit feedback for this message. Please try again.");
      return false;
    }

    const params = new URLSearchParams();
    params.append("rating", rating);
    if (username) params.append("user_name", username);
    if (comment && comment.trim()) params.append("comment", comment.trim());

    try {
      const res = await fetch(
        `${config.apiBaseUrl}/feedback/${userid}/${msg.sessionId}/${msg.messageId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );
      if (!res.ok) throw new Error("Feedback request failed");

      setMessages((prev) => {
        if (!prev[index]) return prev;
        const updated = [...prev];
        updated[index] = { ...updated[index], feedback: rating === 1 ? "up" : "down" };
        return updated;
      });
      return true;
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Could not submit feedback. Please try again.");
      return false;
    }
  };

  const handleThumbsUp = (index) => submitFeedback(index, 1);

  const openFeedbackModal = (index) => {
    setFeedbackModal({ open: true, index, comment: "" });
    setTimeout(() => feedbackTextareaRef.current?.focus(), 60);
  };

  const closeFeedbackModal = () => setFeedbackModal({ open: false, index: null, comment: "" });

  const handleFeedbackSubmit = async () => {
    const { index, comment } = feedbackModal;
    const ok = await submitFeedback(index, -1, comment);
    if (ok) closeFeedbackModal();
  };

  // ── Document side panel ───────────────────────────────────────────────────
  const openDocumentPanel = (docId) => {
    if (!docId) return;
    setOpenDocId(docId);
  };

  const closeDocumentPanel = () => {
    setOpenDocId(null);
    setActiveFieldKey(null);
    setInlineEditKey(null);
  };

  const openPlaceholderModal = (focusKey = null) => {
    if (!sidePanelDoc?.placeholders) return;
    setPlaceholderModal((prev) => {
      const values = { ...(docValues[openDocId] || {}) };
      Object.keys(sidePanelDoc.placeholders).forEach((key) => {
        if (!(key in values)) values[key] = "";
      });
      return { open: true, values };
    });
    setActiveFieldKey(focusKey);
    setInlineEditKey(null);
  };

  const handleTokenClick = (fieldKey) => {
    const field = sidePanelDoc?.placeholders?.[fieldKey];
    if (field?.required === false) {
      setInlineEditKey(fieldKey);
      setActiveFieldKey(fieldKey);
    } else {
      openPlaceholderModal(fieldKey);
    }
  };

  const commitInlineValue = (key, value) => {
    setDocValues((prev) => ({
      ...prev,
      [openDocId]: { ...(prev[openDocId] || {}), [key]: value },
    }));
    setInlineEditKey(null);
  };

  const cancelInlineValue = () => setInlineEditKey(null);

  const closePlaceholderModal = () => {
    setPlaceholderModal((prev) => ({ ...prev, open: false }));
    setActiveFieldKey(null);
  };

  useEffect(() => {
    if (!placeholderModal.open || !activeFieldKey) return;
    const el = placeholderInputRefs.current[activeFieldKey];
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [placeholderModal.open, activeFieldKey]);

  const handlePlaceholderChange = (key, value) => {
    setPlaceholderModal((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }));
    setDocValues((prev) => ({
      ...prev,
      [openDocId]: { ...(prev[openDocId] || {}), [key]: value },
    }));
  };

  const handlePlaceholderSubmit = async () => {
    if (!sidePanelDoc?.placeholders || !openDocId) return;
    const { values } = placeholderModal;

    const missing = Object.entries(sidePanelDoc.placeholders)
      .filter(([key, field]) => field.required !== false && !(values[key] || "").trim())
      .map(([, field]) => field.label);

    if (missing.length > 0) {
      toast.error(`Please fill required field(s)`);
      return;
    }

    setDocValues((prev) => ({
      ...prev,
      [openDocId]: { ...(prev[openDocId] || {}), ...values },
    }));
    setPlaceholderModal({ open: false, values: {} });
    setActiveFieldKey(null);

    // Separate signatures from regular fields
    const signatureEntries = {};
    const regularLines = [];

    Object.entries(sidePanelDoc.placeholders).forEach(([key, field]) => {
      const value = (values[key] || "").trim();
      if (!value) return;

      if (field.type === "signature" && value.startsWith("data:")) {
        signatureEntries[field.token] = value;
      } else {
        regularLines.push(`- ${field.label}: ${value}`);
      }
    });

    if (regularLines.length === 0 && Object.keys(signatureEntries).length === 0) return;

    let prompt = "Please fill the document placeholders with the following details and regenerate the final document:";

    if (regularLines.length > 0) {
      prompt += "\n" + regularLines.join("\n");
    }

    if (Object.keys(signatureEntries).length > 0) {
      const sigTokenList = Object.keys(signatureEntries).join(", ");
      prompt += `\n\nSignatures attached for: ${sigTokenList} (emit add_signature_image with these exact tokens).`;
    }

    const extraFields = {};
    if (Object.keys(signatureEntries).length > 0) {
      extraFields.signatures = JSON.stringify(signatureEntries);
    }

    await handleFollowupClick(prompt, extraFields);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    const availableSlots = MAX_FILES - fileInputs.length;

    if (availableSlots <= 0) {
      toast.error(`You can upload a maximum of ${MAX_FILES} files.`);
    } else if (newFiles.length > availableSlots) {
      toast.error(`You can upload a maximum of ${MAX_FILES} files.`);
      setFileInputs((prev) => [...prev, ...newFiles.slice(0, availableSlots)]);
    } else {
      setFileInputs((prev) => [...prev, ...newFiles]);
    }

    e.target.value = "";
  };

  const removeFile = (indexToRemove) => {
    setFileInputs(fileInputs.filter((_, index) => index !== indexToRemove));
    const fileInputElement = document.getElementById("file-input");
    if (fileInputElement) fileInputElement.value = "";
  };

  const copyMessage = async (msg, index) => {
    try {
      await navigator.clipboard.writeText(msg);
      setMessages((prev) => {
        const updated = [...prev];
        if (!updated[index]) return prev;
        updated[index] = { ...updated[index], copied: true };
        return updated;
      });
      setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          if (!updated[index]) return prev;
          updated[index] = { ...updated[index], copied: false };
          return updated;
        });
      }, 1500);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  const isMobileDevice = () => {
    if (navigator.userAgentData) return navigator.userAgentData.mobile;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      (navigator.userAgent || window.opera).toLowerCase()
    );
  };

  const handleKeyPress = (e) => {
    if (!isMobileDevice() && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const isFileLink = (href = "") => /\.(pdf|docx?|xlsx?|pptx?)(\?|$)/i.test(href);

  const handleFileDownload = async (e, href) => {
    e.preventDefault();
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();

      const urlPath = href.split("?")[0];
      const filename =
        decodeURIComponent(urlPath.substring(urlPath.lastIndexOf("/") + 1)) || "download";

      const blobUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      tempLink.download = filename;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("File download error:", error);
      toast.error("Could not download file. Opening in new tab instead.");
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  /* ── Bot message renderer ─────────────────────────────────────────────── */
  const renderBotMessage = (msg, msgIndex = 0) => {
    if (typeof msg.message !== "string") return msg.message;

    const { cleaned, sections, blocks } = parseAssistantMessage(msg.message);
    const rawParts = cleaned.split(
      /(\[\[(?:DOC_CARD|SECTION_CARD|RICH_BLOCK):[^\]]+\]\])/g
    );

    // Consecutive section cards -> one accordion
    const parts = [];
    rawParts.forEach((part) => {
      const secMatch = part.match(/^\[\[SECTION_CARD:([^\]]+)\]\]$/);
      if (secMatch) {
        const last = parts[parts.length - 1];
        if (last?.type === "sections") last.ids.push(secMatch[1]);
        else parts.push({ type: "sections", ids: [secMatch[1]] });
        return;
      }

      const blockMatch = part.match(/^\[\[RICH_BLOCK:([^\]]+)\]\]$/);
      if (blockMatch) {
        parts.push({ type: "block", id: blockMatch[1] });
        return;
      }

      const docMatch = part.match(/^\[\[DOC_CARD:([^\]]+)\]\]$/);
      if (docMatch) {
        parts.push({ type: "doc", id: docMatch[1] });
        return;
      }

      if (!part || !part.trim()) return;
      parts.push({ type: "text", value: part });
    });

    const rendered = parts.map((p, i) => {
      if (p.type === "sections") {
        const items = p.ids.map((id) => sections[id]).filter(Boolean);
        if (!items.length) return null;
        return <SectionAccordion key={`sec-${i}`} items={items} />;
      }

      if (p.type === "block") {
        return <RichBlock key={`blk-${i}`} block={blocks[p.id]} />;
      }

      if (p.type === "doc") {
        return (
          <button
            key={`doc-${i}`}
            type="button"
            className="doc-open-card"
            onClick={() => openDocumentPanel(p.id)}
          >
            Document opened in side panel
          </button>
        );
      }

      return (
        <ReactMarkdown
          key={`txt-${i}`}
          remarkPlugins={[remarkGfm]}
          remarkRehypeOptions={{ clobberPrefix: `m${msgIndex}-` }}
          components={{
            a: ({ node, ...props }) => {
              const href = props.href || "";

              if (href.startsWith("#")) {
                return (
                  <a
                    {...props}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToAnchor(href);
                    }}
                  >
                    {props.children}
                  </a>
                );
              }

              if (isFileLink(href)) {
                return (
                  <a
                    href={href}
                    onClick={(e) => handleFileDownload(e, href)}
                    className="download-btn"
                  >
                    Download file
                  </a>
                );
              }

              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {props.children}
                </a>
              );
            },
            table: ({ node, ...props }) => (
              <div className="table-responsive-md table-responsive-sm">
                <table className="table table-bordered markdown-table" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => <th {...props} />,
            td: ({ node, ...props }) => <td {...props} />,
          }}
        >
          {p.value}
        </ReactMarkdown>
      );
    });

    // ── Locked / partial -> last line blur teaser ──
    if (msg.isPartial) {
      return (
        <div className="partial-answer">
          <div className="partial-answer-body">{rendered}</div>
          <div className="partial-answer-fade" aria-hidden="true" />
        </div>
      );
    }

    return rendered;
  };


const shareMessage = (msg) => {
  const plainText = msg
    .replace(/\[\[.*?\]\]/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .trim();

  const subject = "Legal AI response";
  const body = plainText.slice(0, 1800); // mailto has practical length limits
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const link = document.createElement("a");
  link.href = mailto;
  link.target = "_blank";           // new tab la mail compose open aagum
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div
      className={`main-container-ss${sidePanelDoc ? " doc-panel-open" : ""}${isResizing ? " doc-panel-resizing" : ""}`}
      style={sidePanelDoc ? { "--doc-panel-width": `${panelWidth}px` } : undefined}
    >
      <ToastContainer />

      {/* ── Locked Answer Popup (unlock-ku credit illa) ────────────────────── */}
      {lockedModal.open && (
        <div className="edit-modal-overlay" onClick={() => setLockedModal({ open: false, message: "" })}>
          <div className="credit-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="credit-modal-icon">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <div className="paywall-modal-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {lockedModal.message || "🔒 Your free responses are used up."}
              </ReactMarkdown>
            </div>
            <div className="credit-modal-actions">
              <button
                type="button"
                className="credit-modal-cancel"
                onClick={() => setLockedModal({ open: false, message: "" })}
              >
                Maybe later
              </button>
              <button
                type="button"
                className="credit-modal-cta"
                onClick={() => {
                  setLockedModal({ open: false, message: "" });
                  navigate("/subscription");   // <- unga pay route
                }}
              >
                Pay now
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ──────────────────────────────────────────────────────────────────── */}

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editModal.open && (
        <div className="edit-modal-overlay" onClick={closeEditModal}>
          <div className="edit-modal-box" onClick={(e) => e.stopPropagation()}>
            <textarea
              ref={editModalTextareaRef}
              className="edit-modal-textarea"
              value={editModal.text}
              onChange={(e) => {
                setEditModal((prev) => ({ ...prev, text: e.target.value }));
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 300) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeEditModal();
                if (e.key === "Enter" && !e.shiftKey && !isMobileDevice()) {
                  e.preventDefault();
                  saveEdit();
                }
              }}
            />
            <div className="edit-modal-actions">
              <button className="edit-modal-cancel" onClick={closeEditModal}>Cancel</button>
              <button
                className="edit-modal-send"
                onClick={saveEdit}
                disabled={!editModal.text.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Negative Feedback Modal ────────────────────────────────────────── */}
      {feedbackModal.open && (
        <div className="edit-modal-overlay" onClick={closeFeedbackModal}>
          <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
            <h6 className="delete-modal-title">Give negative feedback</h6>
            <p className="delete-modal-text">Please provide details:</p>
            <textarea
              ref={feedbackTextareaRef}
              className="edit-modal-textarea"
              placeholder="What went wrong with this response?"
              value={feedbackModal.comment}
              onChange={(e) => setFeedbackModal((prev) => ({ ...prev, comment: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeFeedbackModal();
              }}
            />
            <div className="edit-modal-actions">
              <button className="edit-modal-cancel" onClick={closeFeedbackModal}>Cancel</button>
              <button className="edit-modal-send" onClick={handleFeedbackSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Side Panel ────────────────────────────────────────────── */}
      {sidePanelDoc && (
        <div
          className={`doc-side-panel${isResizing ? " resizing" : ""}`}
          style={{ width: `${panelWidth}px` }}
        >
          <div
            className="doc-resize-handle"
            onPointerDown={handleResizeStart}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize document panel"
          >
            <div className="doc-resize-grip">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="doc-side-panel-header">
            <h6 className="doc-side-panel-title">
              Document
              {sidePanelDoc.streaming && <span className="doc-streaming-badge"> · streaming…</span>}
            </h6>
            <div className="doc-side-panel-actions">
              <button
                type="button"
                className="doc-panel-btn"
                onClick={() => openPlaceholderModal()}
                disabled={!sidePanelDoc.placeholders}
              >
                Fill the Draft
              </button>
              <button type="button" className="doc-panel-close" onClick={closeDocumentPanel} aria-label="Close">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
          <div className="doc-side-panel-body">
            <SidePanelDocBody
              doc={sidePanelDoc}
              activeFieldKey={activeFieldKey}
              inlineEditKey={inlineEditKey}
              onTokenClick={handleTokenClick}
              onInlineCommit={commitInlineValue}
              onInlineCancel={cancelInlineValue}
            />
          </div>
        </div>
      )}

      {/* ── Fill Placeholders Modal ────────────────────────────────────────── */}
      {placeholderModal.open && sidePanelDoc?.placeholders && (
        <div className="edit-modal-overlay">
          <div className="placeholder-modal-box" onClick={(e) => e.stopPropagation()}>
            <h6 className="delete-modal-title">Fill placeholders</h6>
            <div className="placeholder-fields">
              {Object.entries(sidePanelDoc.placeholders).map(([key, field]) => (
                <div className="placeholder-field" key={key}>
                  <label className="placeholder-field-label">
                    {field.label}
                    {field.required !== false && <span className="placeholder-required-mark"> *</span>}
                  </label>

                  {field.type === "select" ? (
                    <select
                      className={`placeholder-field-input${activeFieldKey === key ? " active-field" : ""}`}
                      value={placeholderModal.values[key] || ""}
                      onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                      ref={(el) => { placeholderInputRefs.current[key] = el; }}
                    >
                      <option value="" disabled>Select…</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className={`placeholder-field-input${activeFieldKey === key ? " active-field" : ""}`}
                      value={placeholderModal.values[key] || ""}
                      onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                      placeholder=""
                      ref={(el) => { placeholderInputRefs.current[key] = el; }}
                    />
                  ) : field.type === "signature" ? (
                    <SignatureUploadInput
                      value={placeholderModal.values[key] || ""}
                      onChange={(dataUrl) => handlePlaceholderChange(key, dataUrl)}
                      inputRef={(el) => { placeholderInputRefs.current[key] = el; }}
                    />
                  ) : field.type === "currency" ? (
                    <div className={`currency-input-wrapper${activeFieldKey === key ? " active-field" : ""}`}>
                      <span className="currency-input-symbol">₹</span>
                      <input
                        type="number"
                        className="placeholder-field-input"
                        value={placeholderModal.values[key] || ""}
                        onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                        placeholder=""
                        ref={(el) => { placeholderInputRefs.current[key] = el; }}
                      />
                    </div>
                  ) : (
                    <input
                      type={
                        field.type === "number" ? "number" :
                          field.type === "date" ? "date" :
                            "text"
                      }
                      className={`placeholder-field-input${activeFieldKey === key ? " active-field" : ""}`}
                      value={placeholderModal.values[key] || ""}
                      onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                      placeholder=""
                      ref={(el) => { placeholderInputRefs.current[key] = el; }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="edit-modal-actions">
              <button className="edit-modal-cancel" onClick={closePlaceholderModal}>Cancel</button>
              <button className="edit-modal-send" onClick={handlePlaceholderSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-container" ref={chatContainerRef}>
        {messages.length === 0 && !historyLoading && (
          <div className="center-content">
            <img src={logo} alt="Logo" className="center-logo" />
            <p className="center-text">How can I help you?</p>
          </div>
        )}

        {historyLoading && (
          <div className="loading-spinner">
            <h4 className="text-center">loading...</h4>
          </div>
        )}

        <div className="message-containerdiv">
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <>
                    <div className="d-flex">
                      <img className="boticon" src={require("../Assets/logo-chat.png")} alt="Bot" />
                      <div className="markdown">
                        {msg.currentStatus && msg.message === "" && (
                          <p key={msg.currentStatus} className="status-line">
                            {msg.currentStatus}
                          </p>
                        )}

                        {msg.message === "" && !msg.currentStatus && !msg.hadStatus && (
                          <div className="loader-dot">
                            <span></span><span></span>
                          </div>
                        )}

                        {renderBotMessage(msg, index)}
                      </div>
                    </div>

                    {/* Locked message-ku copy/thumb/retry venaam */}
                    {msg.message && !msg.locked && (
                      <>
                        <span
                          className="material-symbols-outlined icon-copy1"
                          onClick={() => copyMessage(msg.message, index)}
                        >
                          {msg.copied ? "check" : "content_copy"}
                        </span>
                        <span
                            className="material-symbols-outlined icon-share1"
                            onClick={() => shareMessage(msg.message)}
                            title="Share"
                          >
                            share
                          </span>
                        <span
                          className={`material-symbols-outlined icon-thumb-up ${msg.feedback === "up" ? "active" : ""}`}
                          onClick={() => handleThumbsUp(index)}
                          title="Good response"
                        >
                          thumb_up
                        </span>
                        <span
                          className={`material-symbols-outlined icon-thumb-down ${msg.feedback === "down" ? "active" : ""}`}
                          onClick={() => openFeedbackModal(index)}
                          title="Bad response"
                        >
                          thumb_down
                        </span>
                        <span
                          className={`material-symbols-outlined icon-retry-option ${loading ? "disabled" : ""}`}
                          onClick={() => !loading && retryMessage(index)}
                          title="Retry"
                        >
                          refresh
                        </span>
                      </>
                    )}

                    {/* ── Locked answer -> View more ── */}
                    {msg.locked && (
                      <div className="partial-lock-banner">
                        <p>🔒 This answer is locked. Unlock to read the full response.</p>
                        <button
                          type="button"
                          className="partial-lock-btn"
                          onClick={() => unlockMessage(index)}
                          disabled={msg.unlocking}
                        >
                          {msg.unlocking ? "Unlocking…" : "View more"}
                        </button>
                      </div>
                    )}

                    {msg.followupQuestions?.length > 0 && msg.message && !msg.locked && (
                      <div className="followup-container">
                        <div className="followup-header">CONTINUE EXPLORING</div>
                        <div className="followup-list">
                          {msg.followupQuestions.map((fq, fIndex) => (
                            <button
                              key={fIndex}
                              className="followup-item"
                              onClick={() => handleFollowupClick(fq.question)}
                              disabled={loading}
                            >
                              <span className="followup-text">
                                <span className="followup-arrow">↗</span>
                                {fq.question}
                              </span>
                              {fq.category && (
                                <span className="followup-badge">{fq.category.toUpperCase()}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : msg.sender === "you" ? (
                  <div className="user-message-wrapper">
                    <div className="user-bubble-group">
                      <pre>{truncateSignaturesForDisplay(msg.message)}</pre>
                    </div>
                    <div className="user-bubble-actions">
                      {typeof msg.message === "string" && (
                        <span
                          className="material-symbols-outlined prompt-edit-icon"
                          title="Copy message"
                          onClick={() => copyMessage(msg.message, index)}
                        >
                          {msg.copied ? "check" : "content_copy"}
                        </span>
                      )}
                      {typeof msg.message === "string" && index !== pendingIndex && (
                        <span
                          className="material-symbols-outlined prompt-edit-icon"
                          title="Edit message"
                          onClick={() => openEditModal(index, msg.message)}
                        >
                          edit
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <pre>{truncateSignaturesForDisplay(msg.message)}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed-bottom-gg">
        <form onSubmit={sendMessage} className="message-form">
          <div className="d-flex align-items-center">
            {fileInputs.length > 0 && (
              <div className="file-previews-container d-flex gap-2">
                {fileInputs.map((file, index) => (
                  <div key={index} className="file-preview-item">
                    <img
                      src={file.type.startsWith("image/") ? URL.createObjectURL(file) : defaultPdfImage}
                      className="image-preview-img"
                      alt={file.name}
                      title={file.name}
                    />
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="delete-icon"
                      onClick={() => removeFile(index)}
                    />
                  </div>
                ))}
              </div>
            )}

            {audioBlob && !audioRecording && (
              <div className="audio-preview mt-2">
                <audio
                  controls
                  controlsList="nodownload"
                  src={URL.createObjectURL(audioBlob)}
                  className="audio-player"
                ></audio>
                <FontAwesomeIcon
                  icon={faTimes}
                  className="delete-icon-mic"
                  onClick={() => setAudioBlob(null)}
                />
              </div>
            )}
          </div>

          <textarea
            value={textInput}
            ref={textareaRef}
            rows={1}
            onInputCapture={handleInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="expandingTextarea"
            placeholder="Ask me anything..."
            spellCheck="true"
          />

          <div className="d-flex justify-content-between">
            <div className="file-input-container d-flex align-items-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                id="file-input"
                multiple
              />
              <label htmlFor="file-input">
                <img src={require("../Assets/Vectoricon.png")} alt="Upload" className="icon-sent33" />
              </label>
            </div>
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon
                  icon={faMicrophone}
                  className={`icon-mic ${audioRecording ? "recording-active" : ""}`}
                  onClick={handleAudioRecording}
                />
              </div>
              <button
                type="button"
                className="message-button"
                onClick={loading ? stopStreaming : sendMessage}
                disabled={!loading && sendDisabled}
              >
                <FontAwesomeIcon
                  icon={loading ? faStop : faArrowUp}
                  className={loading ? "icon-sent2" : "icon-sent1"}
                />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Historysenariopage;