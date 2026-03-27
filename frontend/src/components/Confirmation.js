import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Confirmation.css";

const Confirmation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const stateData = location.state;

    const bookingData = stateData?.bookingData;
    const paymentMethod = stateData?.paymentMethod;

    const [showContent, setShowContent] = useState(false);
    const [confettiPieces] = useState(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 1.5}s`,
            color: ["#0ea5e9", "#f59e0b", "#10b981", "#7c3aed", "#fcd34d"][Math.floor(Math.random() * 5)],
            size: `${6 + Math.random() * 8}px`,
            duration: `${2 + Math.random() * 2}s`,
        }))
    );

    const bookingRef = `SKB-${Math.floor(100000 + Math.random() * 900000)}`;

    useEffect(() => {
        const t = setTimeout(() => setShowContent(true), 300);
        return () => clearTimeout(t);
    }, []);

    const paymentLabels = {
        "credit-card":   "Credit / Debit Card",
        "upi":           "UPI Payment",
        "bank-transfer": "Bank Transfer",
    };

    return (
        <div className="cf-page">

            {/* Confetti */}
            <div className="cf-confetti" aria-hidden="true">
                {confettiPieces.map((p) => (
                    <div
                        key={p.id}
                        className="cf-piece"
                        style={{
                            left: p.left,
                            background: p.color,
                            width: p.size, height: p.size,
                            animationDelay: p.delay,
                            animationDuration: p.duration,
                        }}
                    />
                ))}
            </div>

            {/* Header strip */}
            <header className="cf-header">
                <div className="cf-header-overlay"></div>
                <div className="cf-header-inner">
                    <div className="cf-breadcrumb">
                        <span>Home</span><span className="cf-bc-sep">›</span>
                        <span>Flights</span><span className="cf-bc-sep">›</span>
                        <span>Booking</span><span className="cf-bc-sep">›</span>
                        <span>Payment</span><span className="cf-bc-sep">›</span>
                        <span className="cf-bc-active">Confirmation</span>
                    </div>
                </div>
            </header>

            {/* Progress */}
            <div className="cf-progress-wrap">
                <div className="cf-progress">
                    {["Search", "Select Flight", "Booking", "Payment", "Confirmation"].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={`cf-prog-step done ${i === 4 ? "current" : ""}`}>
                                <div className="cf-prog-circle">{i === 4 ? "🎉" : "✓"}</div>
                                <div className="cf-prog-label">{step}</div>
                            </div>
                            {i < 4 && <div className="cf-prog-line done"></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <main className={`cf-main ${showContent ? "cf-visible" : ""}`}>

                {/* Success Card */}
                <div className="cf-success-card">

                    {/* Animated check */}
                    <div className="cf-check-wrap">
                        <div className="cf-check-ring cf-ring-1"></div>
                        <div className="cf-check-ring cf-ring-2"></div>
                        <div className="cf-check-circle">
                            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="cf-check-svg">
                                <circle cx="26" cy="26" r="25" stroke="white" strokeWidth="2" fill="none" className="cf-check-bg-circle"/>
                                <path d="M14 26 L22 34 L38 18" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="cf-check-mark"/>
                            </svg>
                        </div>
                    </div>

                    <h1 className="cf-title">Booking Confirmed!</h1>
                    <p className="cf-subtitle">
                        Your flight has been booked successfully. A confirmation email with your e-ticket is on its way.
                    </p>

                    {/* Booking Reference */}
                    <div className="cf-ref-box">
                        <div className="cf-ref-label">Booking Reference</div>
                        <div className="cf-ref-code">{bookingRef}</div>
                        <div className="cf-ref-hint">Save this code for check-in & support</div>
                    </div>
                </div>

                {/* Flight Details Card */}
                {bookingData && (
                    <div className="cf-details-card">
                        <div className="cf-dc-head">
                            <div className="cf-dc-icon">✈</div>
                            <div>
                                <h2 className="cf-dc-title">Flight Summary</h2>
                                <p className="cf-dc-sub">Your itinerary at a glance</p>
                            </div>
                        </div>

                        {/* Route visual */}
                        <div className="cf-route-visual">
                            <div className="cf-rv-city">
                                <div className="cf-rv-code">{bookingData.flight?.departure}</div>
                                <div className="cf-rv-label">Departure</div>
                                <div className="cf-rv-time">{bookingData.flight?.timing}</div>
                            </div>
                            <div className="cf-rv-mid">
                                <div className="cf-rv-plane">✈</div>
                                <div className="cf-rv-line"></div>
                                <div className="cf-rv-date">{bookingData.flight?.date}</div>
                            </div>
                            <div className="cf-rv-city right">
                                <div className="cf-rv-code">{bookingData.flight?.destination}</div>
                                <div className="cf-rv-label">Arrival</div>
                                <div className="cf-rv-time">Estimated</div>
                            </div>
                        </div>

                        {/* Info grid */}
                        <div className="cf-info-grid">
                            <div className="cf-info-item">
                                <div className="cf-ii-label">Passengers</div>
                                <div className="cf-ii-val">{bookingData.passengers?.length}</div>
                            </div>
                            <div className="cf-info-item">
                                <div className="cf-ii-label">Seats</div>
                                <div className="cf-ii-val">{bookingData.passengers?.map(p => p.seat).join(", ")}</div>
                            </div>
                            <div className="cf-info-item">
                                <div className="cf-ii-label">Payment</div>
                                <div className="cf-ii-val">{paymentLabels[paymentMethod] || paymentMethod}</div>
                            </div>
                            <div className="cf-info-item highlight">
                                <div className="cf-ii-label">Amount Paid</div>
                                <div className="cf-ii-val gold">₹{bookingData.totalAmount?.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Passenger list */}
                        {bookingData.passengers?.length > 0 && (
                            <div className="cf-pax-list">
                                {bookingData.passengers.map((p, i) => (
                                    <div key={i} className="cf-pax-row">
                                        <div className="cf-pax-avatar">{i + 1}</div>
                                        <div className="cf-pax-info">
                                            <div className="cf-pax-name">{p.fullName}</div>
                                            <div className="cf-pax-detail">Seat {p.seat} · {p.seat[0] === "P" ? "Platinum" : p.seat[0] === "B" ? "Business" : "Economy"}</div>
                                        </div>
                                        <div className="cf-pax-badge">✓ Confirmed</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* What's next */}
                <div className="cf-next-card">
                    <h3 className="cf-next-title">What happens next?</h3>
                    <div className="cf-next-steps">
                        <div className="cf-next-step">
                            <div className="cf-ns-num">1</div>
                            <div className="cf-ns-info">
                                <div className="cf-ns-label">Email Confirmation</div>
                                <div className="cf-ns-sub">Your e-ticket and booking details have been sent to your registered email.</div>
                            </div>
                        </div>
                        <div className="cf-next-step">
                            <div className="cf-ns-num">2</div>
                            <div className="cf-ns-info">
                                <div className="cf-ns-label">Online Check-in</div>
                                <div className="cf-ns-sub">Check in online 24–48 hours before departure using your booking reference.</div>
                            </div>
                        </div>
                        <div className="cf-next-step">
                            <div className="cf-ns-num">3</div>
                            <div className="cf-ns-info">
                                <div className="cf-ns-label">Arrive at Airport</div>
                                <div className="cf-ns-sub">Reach the airport at least 2 hours before international or 1 hour before domestic flights.</div>
                            </div>
                        </div>
                        <div className="cf-next-step">
                            <div className="cf-ns-num">4</div>
                            <div className="cf-ns-info">
                                <div className="cf-ns-label">Board Your Flight</div>
                                <div className="cf-ns-sub">Proceed to your gate with your boarding pass and valid ID. Have a great flight! ✈</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA buttons */}
                <div className="cf-cta-row">
                    <button className="cf-btn-home" onClick={() => navigate("/")}>
                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                        Back to Homepage
                    </button>
                    <button className="cf-btn-search" onClick={() => navigate("/")}>
                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
                        Search More Flights
                    </button>
                </div>

                {/* Trust strip */}
                <div className="cf-trust-strip">
                    <div className="cf-trust-item">🔒 Secure Booking</div>
                    <div className="cf-trust-sep">·</div>
                    <div className="cf-trust-item">📧 Email Confirmation Sent</div>
                    <div className="cf-trust-sep">·</div>
                    <div className="cf-trust-item">24/7 Customer Support</div>
                    <div className="cf-trust-sep">·</div>
                    <div className="cf-trust-item">🔄 Free Cancellation</div>
                </div>
            </main>

            <footer className="cf-footer">
                <div className="cf-footer-inner">
                    <span>✈ SkyBook — Trusted by 2M+ travelers</span>
                    <span>🔒 Secure Booking &nbsp;|&nbsp; 24/7 Support &nbsp;|&nbsp; Free Cancellation</span>
                </div>
            </footer>
        </div>
    );
};

export default Confirmation;