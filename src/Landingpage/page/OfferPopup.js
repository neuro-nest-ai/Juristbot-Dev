import React from "react";
import Special from "../page/special.png";

export default function OfferPopup({ open, onClose, onPrimary }) {
    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="offer-backdrop"

        >
            <div className="offer-modal" onClick={(e) => e.stopPropagation()}>
                <button className="offer-close" aria-label="Close" onClick={onClose}>×</button>

                <div className="offer-body">
                    <img
                        src={Special}
                        alt="Special Offer"
                        className="offer-badge"
                    />

                    <h4>Get Started at ₹99 - Get 200 Credits   </h4>
                    <p>Exclusively for first-time users </p>
                    <div className="pt-2">
                        <button className="offer-cta " onClick={onPrimary}>
                            Register Now
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
