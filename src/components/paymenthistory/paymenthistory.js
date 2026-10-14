import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faEnvelope, faPhone, faCrown, faCalendarDays,
  faArrowsRotate, faReceipt, faArrowUpRightFromSquare, faBolt, faHeadset,
  faDownload, faXmark, faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import "../../components/paymenthistory/history.css";
import { useAuth } from "../AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import axiosInstance from "../config/apiconfig";
import { usePlanData } from "../../hooks/usePlanData";

const statusClass = (status = "") => {
  const s = status.toLowerCase();
  if (["captured", "paid", "success", "active", "completed"].includes(s)) return "ok";
  if (["failed", "cancelled", "halted", "refunded"].includes(s)) return "bad";
  return "pending";
};

const formatDate = (str) => {
  if (!str) return "—";
  const d = new Date(String(str).replace(" ", "T"));
  if (isNaN(d)) return str;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const hasInvoice = (inv) => inv && inv !== "No Invoice" && inv !== "N/A";

// "#NNJB/210/26-27" -> "NNJB_210_26-27.pdf"
const invoiceFileName = (inv) =>
  `${String(inv).trim().replace(/^#/, "").replace(/\//g, "_")}.pdf`;

// Android browsers iframe-la PDF render pannaadhu -> direct download
const isAndroid = () => /Android/i.test(navigator.userAgent);

// Blob error response-la irundhu message edu
const readBlobError = async (err) => {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.message;
    } catch {
      return null;
    }
  }
  return data?.message;
};

function PaymentHistory() {
  const { planData, planLoading, refreshPlan } = usePlanData();
  const { user } = useAuth();
  const userid = user?.id;
  const navigate = useNavigate();

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(null);
  const [viewer, setViewer] = useState(null); // { url, invoice, fileName }

  const sub = planData?.plan?.sub_Details;
  const billingCycle = planData?.plan?.billingCycle;
  const razorpay_sub_id = sub?.razorpay_sub_id;
  const subStatus = sub?.status;
  const hasPlan = !!sub?.plan_Name;
  const isCancelled = subStatus === "cancelled" || subStatus === "halted";
  const showCancel = billingCycle === "monthly" || subStatus === "active";

  useEffect(() => {
    if (userid) refreshPlan();
  }, [userid, refreshPlan]);

  useEffect(() => {
    if (!userid) return;
    const fetchPaymentHistory = async () => {
      try {
        const res = await axiosInstance.get(`/commanprofile/payment-history/${userid}`);
        setPaymentHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching payment history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentHistory();
  }, [userid]);

  const cancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const res = await axiosInstance.post(`/payment/cancel-subscription`, { razorpay_sub_id });
      if (res.data.message === "success") {
        toast.success("Subscription will be cancelled at end of cycle");
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      toast.error("Failed to cancel subscription");
      console.error(error);
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Invoice: backend-la irundhu PDF blob-a edu ──
  const fetchInvoiceBlob = async (invoiceNumber) => {
    const res = await axiosInstance.get(`/commanprofile/invoice/${userid}`, {
      params: { invoice_number: invoiceNumber },
      responseType: "blob",
    });
    return new Blob([res.data], { type: "application/pdf" });
  };

  const saveBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const openInvoice = async (invoiceNumber, download = false) => {
    if (invoiceLoading) return;
    setInvoiceLoading(invoiceNumber);
    try {
      const blob = await fetchInvoiceBlob(invoiceNumber);
      const fileName = invoiceFileName(invoiceNumber);

      if (download || isAndroid()) {
        saveBlob(blob, fileName);
      } else {
        setViewer({ url: URL.createObjectURL(blob), invoice: invoiceNumber, fileName, blob });
      }
    } catch (err) {
      toast.error((await readBlobError(err)) || "Could not open invoice");
    } finally {
      setInvoiceLoading(null);
    }
  };

  const closeViewer = useCallback(() => {
    setViewer((v) => {
      if (v?.url) URL.revokeObjectURL(v.url);
      return null;
    });
  }, []);

  // Esc close + background scroll lock
  useEffect(() => {
    if (!viewer) return;
    const onKey = (e) => e.key === "Escape" && closeViewer();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [viewer, closeViewer]);

  const endDate = sub?.sub_end
    ? new Date(sub.sub_end.replace(" ", "T")).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  return (
    <div className="ms-page">
      <ToastContainer />
      <div className="ms-glow ms-glow-1" />
      <div className="ms-glow ms-glow-2" />

      <div className="ms-container">
        {/* Header */}
        <header className="ms-header ms-anim" style={{ "--d": "0ms" }}>
          <Link to="/chat" className="ms-back" aria-label="Back to chat">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <div>
            <h1 className="ms-title">Manage Subscription</h1>
            <p className="ms-subtitle">
              Manage your plan, billing history, and support details from one place.
            </p>
          </div>
        </header>

        <div className="ms-grid">
          {/* Plan card */}
          <section className="ms-card ms-plan ms-anim" style={{ "--d": "60ms" }}>
            <div className="ms-card-top">
              <span className="ms-eyebrow">Current plan</span>
              {planLoading ? (
                <span className="ms-skel" style={{ width: 70, height: 22 }} />
              ) : (
                <span className={`ms-chip ${hasPlan ? (isCancelled ? "bad" : "ok") : "muted"}`}>
                  <span className="ms-dot" />
                  {hasPlan ? (isCancelled ? "Cancelled" : subStatus || "Active") : "Free"}
                </span>
              )}
            </div>

            <div className="ms-plan-name">
              <span className="ms-plan-icon"><FontAwesomeIcon icon={faCrown} /></span>
              {planLoading ? (
                <span className="ms-skel" style={{ width: 160, height: 28 }} />
              ) : (
                <h2>{sub?.plan_Name || "No active plan"}</h2>
              )}
            </div>

            <div className="ms-stats">
              <div className="ms-stat">
                <FontAwesomeIcon icon={faArrowsRotate} className="ms-stat-icon" />
                <div>
                  <span className="ms-stat-label">Billing cycle</span>
                  <span className="ms-stat-value">
                    {planLoading ? "…" : billingCycle || "—"}
                  </span>
                </div>
              </div>
              <div className="ms-stat">
                <FontAwesomeIcon icon={faCalendarDays} className="ms-stat-icon" />
                <div>
                  <span className="ms-stat-label">
                    {isCancelled ? "Access until" : "Renews on"}
                  </span>
                  <span className="ms-stat-value">{planLoading ? "…" : endDate}</span>
                </div>
              </div>
            </div>

            <div className="ms-actions">
              {!planLoading && showCancel && (
                <button
                  type="button"
                  className="ms-btn ms-btn-ghost"
                  disabled={cancelLoading || isCancelled}
                  onClick={cancelSubscription}
                >
                  {isCancelled ? "Plan cancelled" : cancelLoading ? "Cancelling…" : "Cancel plan"}
                </button>
              )}
              <button
                type="button"
                className="ms-btn ms-btn-primary"
                onClick={() => navigate("/Subscription")}
              >
                <FontAwesomeIcon icon={faBolt} />
                {hasPlan ? "Upgrade" : "Get a plan"}
              </button>
            </div>
          </section>

          {/* Help card */}
          <section className="ms-card ms-anim" style={{ "--d": "120ms" }}>
            <div className="ms-card-top">
              <span className="ms-eyebrow">Support</span>
              <FontAwesomeIcon icon={faHeadset} className="ms-muted-icon" />
            </div>
            <h2 className="ms-card-title">Need help?</h2>
            <p className="ms-card-text">
              Facing issues with billing or subscriptions? We're here to help.
            </p>

            <div className="ms-contacts">
              <a href="mailto:support@juristbot.ai" className="ms-contact">
                <span className="ms-contact-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
                <span className="ms-contact-body">
                  <span className="ms-stat-label">Email us</span>
                  <span className="ms-contact-value">support@juristbot.ai</span>
                </span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-contact-arrow" />
              </a>
              <a href="tel:+919655033228" className="ms-contact">
                <span className="ms-contact-icon"><FontAwesomeIcon icon={faPhone} /></span>
                <span className="ms-contact-body">
                  <span className="ms-stat-label">Call us</span>
                  <span className="ms-contact-value">+91 9655033228</span>
                </span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-contact-arrow" />
              </a>
            </div>
          </section>
        </div>

        {/* Billing history */}
        <section className="ms-card ms-history ms-anim" style={{ "--d": "180ms" }}>
          <div className="ms-history-head">
            <div>
              <h2 className="ms-card-title mb-0">Billing history</h2>
              <p className="ms-card-text mb-0">All your invoices and payments</p>
            </div>
            {!loading && paymentHistory.length > 0 && (
              <span className="ms-count">{paymentHistory.length} records</span>
            )}
          </div>

          {loading ? (
            <div className="ms-skel-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="ms-skel" style={{ height: 42 }} />
              ))}
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="ms-empty">
              <span className="ms-empty-icon"><FontAwesomeIcon icon={faReceipt} /></span>
              <p className="ms-empty-title">No payments yet</p>
              <p className="ms-empty-text">Your invoices will show up here once you subscribe.</p>
            </div>
          ) : (
            <div className="ms-table-wrap">
              <table className="ms-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Payment ID</th>
                    <th>Invoice No.</th>
                    <th className="ta-r">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((p, i) => (
                    <tr key={p.razorpay_pay_id || i}>
                      <td className="ms-td-muted">{i + 1}</td>
                      <td>{formatDate(p.created_at)}</td>
                      <td><code className="ms-code">{p.razorpay_pay_id || "—"}</code></td>
                      <td>
                        {hasInvoice(p.invoice_number) ? (
                          <span className="ms-invoice-cell">
                            <button
                              type="button"
                              className="ms-invoice-link"
                              disabled={invoiceLoading === p.invoice_number}
                              onClick={() => openInvoice(p.invoice_number)}
                            >
                              {invoiceLoading === p.invoice_number ? "Opening…" : p.invoice_number}
                            </button>
                            <button
                              type="button"
                              className="ms-invoice-dl"
                              title="Download PDF"
                              aria-label="Download invoice PDF"
                              disabled={!!invoiceLoading}
                              onClick={() => openInvoice(p.invoice_number, true)}
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                          </span>
                        ) : (
                          <span className="ms-td-muted">—</span>
                        )}
                      </td>
                      <td className="ta-r ms-amount">
                        ₹{((p.amount_in_paise || 0) / 100).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span className={`ms-chip ${statusClass(p.status)}`}>
                          <span className="ms-dot" />
                          {p.status || "unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ── Invoice viewer popup ── */}
      {viewer && (
        <div className="ms-pdf-overlay" onClick={closeViewer}>
          <div className="ms-pdf-box" onClick={(e) => e.stopPropagation()}>
            <div className="ms-pdf-head">
              <span className="ms-pdf-title">
                <FontAwesomeIcon icon={faFilePdf} className="ms-pdf-title-icon" />
                Invoice {viewer.invoice}
              </span>
              <div className="ms-pdf-actions">
                <button
                  type="button"
                  className="ms-btn ms-btn-primary ms-pdf-btn"
                  onClick={() => saveBlob(viewer.blob, viewer.fileName)}
                >
                  <FontAwesomeIcon icon={faDownload} /> Download
                </button>
                <button
                  type="button"
                  className="ms-pdf-close"
                  aria-label="Close"
                  onClick={closeViewer}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
            <iframe
              title={`Invoice ${viewer.invoice}`}
              src={`${viewer.url}#toolbar=1&navpanes=0`}
              className="ms-pdf-frame"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentHistory;