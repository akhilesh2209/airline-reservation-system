import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Memoize booking data to prevent unnecessary derived state calculations
    const bookingData = useMemo(() => location.state || null, [location.state]);

    const [paymentMethod, setPaymentMethod] = useState("");
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Generate a stable flight number for the session
    const flightNumber = useMemo(() => Math.floor(Math.random() * 900 + 100), []);

    // Safety redirect if accessed without data
    useEffect(() => {
        if (!bookingData || !bookingData.passengers || bookingData.passengers.length === 0) {
            const timer = setTimeout(() => {
                // Optional: navigate("/") 
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [bookingData, navigate]);

    // Handle missing data state (UI remains identical to original)
    if (!bookingData || !bookingData.passengers || bookingData.passengers.length === 0) {
        return (
            <div className="pm-empty">
                <div className="pm-empty-icon">✈</div>
                <h2>No booking details found!</h2>
                <p>Please start your booking from the flights page.</p>
            </div>
        );
    }

    const { passengers, flight, totalAmount } = bookingData;

    // Stable Time Calculation Utility
    const calculateTime = (time, minutesToAdd) => {
        if (!time) return "--:--";
        try {
            const [timePart, period] = time.split(" ");
            let [hours, minutes] = timePart.split(":").map(Number);
            
            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;
            
            let totalMinutes = hours * 60 + minutes + minutesToAdd;
            if (totalMinutes < 0) totalMinutes += 24 * 60;
            if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
            
            let newHours = Math.floor(totalMinutes / 60) % 24;
            let newMinutes = totalMinutes % 60;
            let newPeriod = newHours >= 12 ? "PM" : "AM";
            
            newHours = newHours % 12;
            newHours = newHours === 0 ? 12 : newHours;
            
            return `${newHours}:${newMinutes.toString().padStart(2, "0")} ${newPeriod}`;
        } catch (e) {
            return time;
        }
    };

    const boardingTime = calculateTime(flight?.timing, -45);
    const estimatedArrival = calculateTime(flight?.timing, 240);

    const getSeatClass = (seat) => {
        if (!seat) return "Economy";
        const char = seat[0].toUpperCase();
        if (char === "P") return "Platinum";
        if (char === "B") return "Business";
        return "Economy";
    };

    const getSeatClassStyle = (seat) => {
        if (!seat) return "pm-class-economy";
        const char = seat[0].toUpperCase();
        if (char === "P") return "pm-class-platinum";
        if (char === "B") return "pm-class-business";
        return "pm-class-economy";
    };

    const handlePayment = () => {
        if (isProcessing) return; // Prevent double submission

        if (!paymentMethod) {
            alert("Please select a payment method to continue.");
            return;
        }

        setIsProcessing(true);
        
        // Simulate payment gateway delay
        setTimeout(() => {
            setIsPaymentConfirmed(true);
            
            // Redirect to final details after showing success state
            setTimeout(() => {
                navigate("/payment-details", {
                    state: { 
                        bookingData: { ...bookingData, flightNumber }, 
                        paymentMethod 
                    },
                });
            }, 2000);
        }, 1500);
    };

    const paymentMethods = [
        { id: "credit-card", icon: "💳", label: "Credit Card",   sub: "Visa, Mastercard, Amex" },
        { id: "upi",         icon: "📱", label: "UPI",           sub: "GPay, PhonePe, Paytm" },
        { id: "bank-transfer", icon: "🏦", label: "Bank Transfer", sub: "NEFT / RTGS / IMPS" },
    ];

    return (
        <div className="pm-page">
            {/* ── Header ── */}
            <header className="pm-header">
                <div className="pm-header-overlay"></div>
                <div className="pm-header-content">
                    <div className="pm-breadcrumb">
                        <span>Home</span><span className="pm-bc-sep">›</span>
                        <span>Flights</span><span className="pm-bc-sep">›</span>
                        <span>Booking</span><span className="pm-bc-sep">›</span>
                        <span className="pm-bc-active">Payment</span>
                    </div>
                    <h1 className="pm-title">Secure Payment</h1>
                    <div className="pm-route-row">
                        <span className="pm-route-city">{flight?.departure}</span>
                        <div className="pm-route-arrow">
                            <svg viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 12 H80 M68 4 L80 12 L68 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="pm-route-city dest">{flight?.destination}</span>
                        <span className="pm-date-pill">📅 {flight?.date}</span>
                    </div>
                </div>
            </header>

            {/* ── Progress bar ── */}
            <div className="pm-progress-wrap">
                <div className="pm-progress">
                    {["Search", "Select Flight", "Booking", "Payment", "Confirmation"].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={`pm-prog-step ${i <= 3 ? "done" : ""} ${i === 3 ? "current" : ""}`}>
                                <div className="pm-prog-circle">{i < 3 ? "✓" : i === 3 ? "💳" : i + 1}</div>
                                <div className="pm-prog-label">{step}</div>
                            </div>
                            {i < 4 && <div className={`pm-prog-line ${i < 3 ? "done" : ""}`}></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="pm-main">
                <div className="pm-left">
                    {/* ── Booking Summary ── */}
                    <section className="pm-card">
                        <div className="pm-card-head">
                            <div className="pm-card-num">01</div>
                            <div>
                                <h2 className="pm-card-title">Booking Summary</h2>
                                <p className="pm-card-sub">{passengers.length} passenger{passengers.length > 1 ? "s" : ""} · Flight {flightNumber}</p>
                            </div>
                        </div>
                        <div className="pm-card-body">
                            <div className="pm-summary-grid">
                                <div className="pm-summary-col">
                                    <div className="pm-summary-label">Route</div>
                                    <div className="pm-summary-val">{flight?.departure} → {flight?.destination}</div>
                                </div>
                                <div className="pm-summary-col">
                                    <div className="pm-summary-label">Date</div>
                                    <div className="pm-summary-val">{flight?.date}</div>
                                </div>
                                <div className="pm-summary-col">
                                    <div className="pm-summary-label">Departure</div>
                                    <div className="pm-summary-val">{flight?.timing}</div>
                                </div>
                                <div className="pm-summary-col">
                                    <div className="pm-summary-label">Boarding</div>
                                    <div className="pm-summary-val">{boardingTime}</div>
                                </div>
                                <div className="pm-summary-col">
                                    <div className="pm-summary-label">Est. Arrival</div>
                                    <div className="pm-summary-val">{estimatedArrival}</div>
                                </div>
                                <div className="pm-summary-col">
                                    <div className="pm-summary-label">Seats</div>
                                    <div className="pm-summary-val">{passengers.map(p => p.seat).join(", ")}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Boarding Passes ── */}
                    <section className="pm-card">
                        <div className="pm-card-head">
                            <div className="pm-card-num">02</div>
                            <div>
                                <h2 className="pm-card-title">Boarding Passes</h2>
                                <p className="pm-card-sub">Present at the gate</p>
                            </div>
                        </div>
                        <div className="pm-card-body">
                            <div className="pm-passes-grid">
                                {passengers.map((passenger, index) => (
                                    <div key={index} className="pm-boarding-pass">
                                        <div className="pm-pass-header">
                                            <div className="pm-pass-airline">
                                                <div className="pm-pass-logo">✈</div>
                                                <div>
                                                    <div className="pm-pass-airline-name">SkyBook Airlines</div>
                                                    <div className="pm-pass-flight-num">Flight {flightNumber}</div>
                                                </div>
                                            </div>
                                            <div className={`pm-pass-class ${getSeatClassStyle(passenger.seat)}`}>
                                                {getSeatClass(passenger.seat)}
                                            </div>
                                        </div>

                                        <div className="pm-pass-route">
                                            <div className="pm-pass-city-block">
                                                <div className="pm-pass-city-code">{flight?.departure?.substring(0, 3).toUpperCase()}</div>
                                                <div className="pm-pass-city-label">Departure</div>
                                                <div className="pm-pass-time">{flight?.timing}</div>
                                            </div>
                                            <div className="pm-pass-route-mid">
                                                <div className="pm-pass-plane">✈</div>
                                                <div className="pm-pass-route-line"></div>
                                                <div className="pm-pass-duration">~4h 00m</div>
                                            </div>
                                            <div className="pm-pass-city-block right">
                                                <div className="pm-pass-city-code">{flight?.destination?.substring(0, 3).toUpperCase()}</div>
                                                <div className="pm-pass-city-label">Arrival</div>
                                                <div className="pm-pass-time">{estimatedArrival}</div>
                                            </div>
                                        </div>

                                        <div className="pm-pass-perf">
                                            <div className="pm-perf-notch left"></div>
                                            <div className="pm-perf-line"></div>
                                            <div className="pm-perf-notch right"></div>
                                        </div>

                                        <div className="pm-pass-details">
                                            <div className="pm-pass-detail-col">
                                                <div className="pm-pd-label">Passenger</div>
                                                <div className="pm-pd-val">{passenger.fullName || "TBA"}</div>
                                            </div>
                                            <div className="pm-pass-detail-col">
                                                <div className="pm-pd-label">Seat</div>
                                                <div className="pm-pd-val pm-pd-seat">{passenger.seat}</div>
                                            </div>
                                            <div className="pm-pass-detail-col">
                                                <div className="pm-pd-label">Date</div>
                                                <div className="pm-pd-val">{flight?.date}</div>
                                            </div>
                                            <div className="pm-pass-detail-col">
                                                <div className="pm-pd-label">Boarding</div>
                                                <div className="pm-pd-val">{boardingTime}</div>
                                            </div>
                                            <div className="pm-pass-detail-col">
                                                <div className="pm-pd-label">Gate</div>
                                                <div className="pm-pd-val">B{flightNumber % 30 + 1}</div>
                                            </div>
                                            <div className="pm-pass-detail-col">
                                                <div className="pm-pd-label">Passport</div>
                                                <div className="pm-pd-val">{passenger.passport || "—"}</div>
                                            </div>
                                        </div>

                                        <div className="pm-pass-barcode">
                                            <div className="pm-barcode-bars">
                                                {Array.from({ length: 40 }, (_, i) => (
                                                    <div key={i} className="pm-bar" style={{ height: `${20 + (i * 7 + 13) % 28}px`, width: i % 3 === 0 ? "3px" : "1.5px" }}></div>
                                                ))}
                                            </div>
                                            <div className="pm-barcode-num">SKB{flightNumber}-{index + 1}{passenger.seat}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Payment Method ── */}
                    <section className="pm-card">
                        <div className="pm-card-head">
                            <div className="pm-card-num">03</div>
                            <div>
                                <h2 className="pm-card-title">Payment Method</h2>
                                <p className="pm-card-sub">Choose how you'd like to pay</p>
                            </div>
                        </div>
                        <div className="pm-card-body">
                            <div className="pm-secure-notice">
                                <span className="pm-secure-icon">🔒</span>
                                <div>
                                    <div className="pm-secure-title">Secure & Encrypted Payment</div>
                                    <div className="pm-secure-sub">256-bit SSL encryption. Your data is fully protected.</div>
                                </div>
                            </div>

                            <div className="pm-methods">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`pm-method ${paymentMethod === method.id ? "pm-method-active" : ""}`}
                                        onClick={() => !isProcessing && setPaymentMethod(method.id)}
                                    >
                                        <div className="pm-method-radio">
                                            <div className={`pm-radio-dot ${paymentMethod === method.id ? "active" : ""}`}></div>
                                        </div>
                                        <div className="pm-method-icon">{method.icon}</div>
                                        <div className="pm-method-info">
                                            <div className="pm-method-label">{method.label}</div>
                                            <div className="pm-method-sub">{method.sub}</div>
                                        </div>
                                        {paymentMethod === method.id && (
                                            <div className="pm-method-check">✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                className={`pm-confirm-btn ${isProcessing ? "pm-processing" : ""}`}
                                onClick={handlePayment}
                                disabled={isProcessing || isPaymentConfirmed}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="pm-spinner"></div>
                                        Processing Payment…
                                    </>
                                ) : (
                                    <>
                                        <span>🔒 Confirm & Pay ₹{totalAmount?.toLocaleString()}</span>
                                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                                    </>
                                )}
                            </button>

                            {isPaymentConfirmed && (
                                <div className="pm-confirmed-banner">
                                    <div className="pm-confirmed-icon">✅</div>
                                    <div>
                                        <div className="pm-confirmed-title">Payment Confirmed!</div>
                                        <div className="pm-confirmed-sub">Thank you! You'll receive a confirmation email shortly. Redirecting…</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* ── Sidebar ── */}
                <aside className="pm-sidebar">
                    <div className="pm-sidebar-card">
                        <div className="pm-sc-header">
                            <h3>Order Summary</h3>
                        </div>

                        <div className="pm-sc-route">
                            <div className="pm-scr-col">
                                <div className="pm-scr-city">{flight?.departure}</div>
                                <div className="pm-scr-label">From</div>
                            </div>
                            <div className="pm-scr-plane">✈</div>
                            <div className="pm-scr-col right">
                                <div className="pm-scr-city">{flight?.destination}</div>
                                <div className="pm-scr-label">To</div>
                            </div>
                        </div>

                        <div className="pm-sc-rows">
                            <div className="pm-sc-row"><span>Flight</span><span>{flightNumber}</span></div>
                            <div className="pm-sc-row"><span>Date</span><span>{flight?.date}</span></div>
                            <div className="pm-sc-row"><span>Departure</span><span>{flight?.timing}</span></div>
                            <div className="pm-sc-row"><span>Boarding</span><span>{boardingTime}</span></div>
                            <div className="pm-sc-row"><span>Passengers</span><span>{passengers.length}</span></div>
                        </div>

                        <div className="pm-sc-pax">
                            {passengers.map((p, i) => (
                                <div key={i} className="pm-sc-pax-row">
                                    <div className="pm-sc-pax-avatar">{i + 1}</div>
                                    <div className="pm-sc-pax-info">
                                        <div className="pm-sc-pax-name">{p.fullName || "Passenger"}</div>
                                        <div className="pm-sc-pax-seat">{p.seat} · {getSeatClass(p.seat)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pm-sc-total">
                            <span>Total Amount</span>
                            <span className="pm-sc-total-val">₹{totalAmount?.toLocaleString()}</span>
                        </div>

                        <div className="pm-sc-badges">
                            <div className="pm-sc-badge">🔒 Secure Payment</div>
                            <div className="pm-sc-badge">✈ Instant Confirmation</div>
                            <div className="pm-sc-badge">🔄 Free Cancellation</div>
                            <div className="pm-sc-badge">📧 Email Receipt</div>
                        </div>
                    </div>
                </aside>
            </div>

            <footer className="pm-footer">
                <div className="pm-footer-inner">
                    <span>✈ SkyBook — Trusted by 2M+ travelers</span>
                    <span>🔒 Secure Booking &nbsp;|&nbsp; 24/7 Support &nbsp;|&nbsp; Free Cancellation</span>
                </div>
            </footer>
        </div>
    );
};

export default Payment;