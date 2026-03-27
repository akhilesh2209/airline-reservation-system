import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentDetails.css";
import { QRCodeCanvas } from "qrcode.react";

const PaymentDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state;
    const [isProcessing, setIsProcessing] = useState(false);
    const [focusedField, setFocusedField] = useState("");
    const [errors, setErrors] = useState({});

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: "",
        upiId: "",
        bankAccount: "",
        accountHolder: "",
        bankName: "",
        ifsc: "",
    });

    if (!stateData || !stateData.bookingData || !stateData.paymentMethod) {
        console.error("❌ Invalid Payment Request: Missing Data");
        return (
            <div className="pd-empty">
                <div className="pd-empty-icon">⚠️</div>
                <h2>Invalid Payment Request</h2>
                <p>No payment data found. Please restart your booking.</p>
            </div>
        );
    }

    const { bookingData, paymentMethod } = stateData;

    // Validation Helpers
    const validateCardLuhn = (num) => {
        const arr = (num + "").split("").reverse().map((x) => parseInt(x));
        const lastDigit = arr.splice(0, 1)[0];
        let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9 || (val * 2 === 0 ? 0 : 9))), 0);
        sum += lastDigit;
        return sum % 10 === 0;
    };

    const validateUPI = (id) => /^[\w.-]+@[\w.-]+$/.test(id);
    const validateIFSC = (code) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code);

    const handleChange = (e) => {
        let { name, value } = e.target;
        

        // Clear error for the field being edited
        setErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "cardNumber") {
            value = value.replace(/\D/g, "").substring(0, 16);
            const groups = value.match(/.{1,4}/g);
            value = groups ? groups.join(" ") : value;
        }

        if (name === "expiryDate") {
            value = value.replace(/\D/g, "");
            if (value.length >= 2) {
                let month = value.substring(0, 2);
                if (parseInt(month) > 12) month = "12";
                if (parseInt(month) === 0) month = "01";
                value = month + value.substring(2, 4);
            }
            if (value.length >= 3) value = value.replace(/(\d{2})(\d{0,2})/, "$1/$2");
            value = value.substring(0, 5);
        }

        if (name === "cvv") {
            value = value.replace(/\D/g, "").substring(0, 3);
        }

        if (name === "bankAccount") {
            value = value.replace(/\D/g, "").substring(0, 18);
        }

        if (name === "ifsc") {
            value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 11);
        }

        if (name === "cardHolderName" || name === "accountHolder") {
            value = value.replace(/[^a-zA-Z\s]/g, "");
        }

        setPaymentInfo({ ...paymentInfo, [name]: value });
    };

    const validateForm = () => {
        let newErrors = {};

        if (paymentMethod === "credit-card") {
            const rawCard = paymentInfo.cardNumber.replace(/\s/g, "");
            if (rawCard.length < 16 || !validateCardLuhn(rawCard)) newErrors.cardNumber = "Invalid Card";
            if (paymentInfo.cardHolderName.trim().length < 3) newErrors.cardHolderName = "Required";
            if (paymentInfo.expiryDate.length < 5) newErrors.expiryDate = "Invalid Date";
            if (paymentInfo.cvv.length < 3) newErrors.cvv = "Required";
        } else if (paymentMethod === "upi") {
            if (!validateUPI(paymentInfo.upiId)) newErrors.upiId = "Invalid UPI ID";
        } else if (paymentMethod === "bank-transfer") {
            if (paymentInfo.bankAccount.length < 9) newErrors.bankAccount = "Invalid Account";
            if (!validateIFSC(paymentInfo.ifsc)) newErrors.ifsc = "Invalid IFSC";
            if (!paymentInfo.accountHolder) newErrors.accountHolder = "Required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsProcessing(true);
        // Simulate secure API call
        setTimeout(() => {
            navigate("/confirmation", { state: { bookingData, paymentMethod } });
        }, 2000);
    };

    const displayCard = paymentInfo.cardNumber || "•••• •••• •••• ••••";
    const displayName = paymentInfo.cardHolderName || "YOUR NAME";
    const displayExpiry = paymentInfo.expiryDate || "MM/YY";

    const methodLabels = {
        "credit-card": { icon: "💳", label: "Credit / Debit Card" },
        "upi": { icon: "📱", label: "UPI Payment" },
        "bank-transfer": { icon: "🏦", label: "Bank Transfer" },
    };
    const currentMethod = methodLabels[paymentMethod] || { icon: "💳", label: paymentMethod };

    return (
        <div className="pd-page">
            <header className="pd-header">
                <div className="pd-header-overlay"></div>
                <div className="pd-header-content">
                    <div className="pd-breadcrumb">
                        <span>Home</span><span className="pd-bc-sep">›</span>
                        <span>Flights</span><span className="pd-bc-sep">›</span>
                        <span>Booking</span><span className="pd-bc-sep">›</span>
                        <span>Payment</span><span className="pd-bc-sep">›</span>
                        <span className="pd-bc-active">Payment Details</span>
                    </div>
                    <h1 className="pd-title">
                        {currentMethod.icon} {currentMethod.label}
                    </h1>
                    <div className="pd-route-row">
                        <span className="pd-route-city">{bookingData?.flight?.departure}</span>
                        <div className="pd-route-arrow">
                            <svg viewBox="0 0 100 24" fill="none">
                                <path d="M4 12 H80 M68 4 L80 12 L68 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="pd-route-city dest">{bookingData?.flight?.destination}</span>
                        <span className="pd-amount-pill">₹{bookingData?.totalAmount?.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <div className="pd-progress-wrap">
                <div className="pd-progress">
                    {["Search", "Select Flight", "Booking", "Payment", "Details", "Confirmation"].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={`pd-prog-step ${i <= 4 ? "done" : ""} ${i === 4 ? "current" : ""}`}>
                                <div className="pd-prog-circle">{i < 4 ? "✓" : i === 4 ? currentMethod.icon : i + 1}</div>
                                <div className="pd-prog-label">{step}</div>
                            </div>
                            {i < 5 && <div className={`pd-prog-line ${i < 4 ? "done" : ""}`}></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="pd-main">
                <div className="pd-left">
                    {paymentMethod === "credit-card" && (
                        <section className="pd-card" style={{ animationDelay: "0s" }}>
                            <div className="pd-card-head">
                                <div className="pd-card-num">01</div>
                                <div>
                                    <h2 className="pd-card-title">Card Details</h2>
                                    <p className="pd-card-sub">Visa, Mastercard, Amex, RuPay accepted</p>
                                </div>
                                <div className="pd-card-icons">
                                    <span className="pd-ci">VISA</span>
                                    <span className="pd-ci">MC</span>
                                    <span className="pd-ci">AMEX</span>
                                </div>
                            </div>

                            <div className="pd-card-body">
                                <div className="pd-credit-card-visual">
                                    <div className="pd-ccv-shine"></div>
                                    <div className="pd-ccv-top">
                                        <div className="pd-ccv-logo">✈ SkyBook</div>
                                        <div className="pd-ccv-chip">
                                            <div className="pd-chip-lines">
                                                {Array.from({ length: 5 }, (_, i) => <div key={i} className="pd-chip-line"></div>)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`pd-ccv-number ${focusedField === "cardNumber" ? "pd-field-focused" : ""} ${errors.cardNumber ? "pd-v-err" : ""}`}>
                                        {displayCard}
                                    </div>
                                    <div className="pd-ccv-bottom">
                                        <div className="pd-ccv-holder">
                                            <div className="pd-ccv-label">Card Holder</div>
                                            <div className={`pd-ccv-val ${focusedField === "cardHolderName" ? "pd-field-focused" : ""}`}>{displayName}</div>
                                        </div>
                                        <div className="pd-ccv-expiry">
                                            <div className="pd-ccv-label">Expires</div>
                                            <div className={`pd-ccv-val ${focusedField === "expiryDate" ? "pd-field-focused" : ""}`}>{displayExpiry}</div>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="pd-form" noValidate>
                                    <div className="pd-field-wrap">
                                        <label className="pd-label">Card Number</label>
                                        <div className={`pd-input-wrap ${errors.cardNumber ? "pd-error" : ""}`}>
                                            <span className="pd-input-icon">💳</span>
                                            <input
                                                className="pd-input"
                                                type="text"
                                                name="cardNumber"
                                                placeholder="1234 5678 9012 3456"
                                                value={paymentInfo.cardNumber}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField("cardNumber")}
                                                onBlur={() => setFocusedField("")}
                                                maxLength="19"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pd-field-wrap">
                                        <label className="pd-label">Cardholder Name</label>
                                        <div className={`pd-input-wrap ${errors.cardHolderName ? "pd-error" : ""}`}>
                                            <span className="pd-input-icon">👤</span>
                                            <input
                                                className="pd-input"
                                                type="text"
                                                name="cardHolderName"
                                                placeholder="Name as on card"
                                                value={paymentInfo.cardHolderName}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField("cardHolderName")}
                                                onBlur={() => setFocusedField("")}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pd-row-2">
                                        <div className="pd-field-wrap">
                                            <label className="pd-label">Expiry Date</label>
                                            <div className={`pd-input-wrap ${errors.expiryDate ? "pd-error" : ""}`}>
                                                <span className="pd-input-icon">📅</span>
                                                <input
                                                    className="pd-input"
                                                    type="text"
                                                    name="expiryDate"
                                                    placeholder="MM/YY"
                                                    value={paymentInfo.expiryDate}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedField("expiryDate")}
                                                    onBlur={() => setFocusedField("")}
                                                    maxLength="5"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="pd-field-wrap">
                                            <label className="pd-label">CVV</label>
                                            <div className={`pd-input-wrap ${errors.cvv ? "pd-error" : ""}`}>
                                                <span className="pd-input-icon">🔒</span>
                                                <input
                                                    className="pd-input"
                                                    type="password"
                                                    name="cvv"
                                                    placeholder="•••"
                                                    value={paymentInfo.cvv}
                                                    onChange={handleChange}
                                                    maxLength="3"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className={`pd-submit-btn ${isProcessing ? "pd-processing" : ""}`} disabled={isProcessing}>
                                        {isProcessing ? (
                                            <><div className="pd-spinner"></div>Processing Payment…</>
                                        ) : (
                                            <><span>🔒 Pay ₹{bookingData?.totalAmount?.toLocaleString()}</span><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </section>
                    )}

                    {paymentMethod === "upi" && (
                        <section className="pd-card">
                            <div className="pd-card-head">
                                <div className="pd-card-num">01</div>
                                <div>
                                    <h2 className="pd-card-title">UPI Payment</h2>
                                    <p className="pd-card-sub">Scan QR or enter your UPI ID</p>
                                </div>
                            </div>
                            <div className="pd-card-body">
                                <form onSubmit={handleSubmit} className="pd-form" noValidate>
                                    <div className="pd-amount-highlight">
                                        <div className="pd-ah-label">Amount to Pay</div>
                                        <div className="pd-ah-amount">₹{bookingData?.totalAmount?.toLocaleString()}</div>
                                    </div>
                                    <div className="pd-qr-wrap">
                                        <div className="pd-qr-header">
                                            <div className="pd-qr-badge">📱 Scan & Pay</div>
                                        </div>
                                        <div className="pd-qr-box">
                                            <div className="pd-qr-corner tl"></div>
                                            <div className="pd-qr-corner tr"></div>
                                            <div className="pd-qr-corner bl"></div>
                                            <div className="pd-qr-corner br"></div>
                                            <QRCodeCanvas
                                                value={`upi://pay?pa=airbook@upi&pn=AirBook&am=${bookingData?.totalAmount}&cu=INR`}
                                                size={180}
                                                bgColor="#ffffff"
                                                fgColor="#0a1628"
                                            />
                                        </div>
                                        <div className="pd-qr-apps">
                                            <span className="pd-qr-app">GPay</span>
                                            <span className="pd-qr-app">PhonePe</span>
                                            <span className="pd-qr-app">Paytm</span>
                                            <span className="pd-qr-app">BHIM</span>
                                        </div>
                                    </div>
                                    <div className="pd-or-divider">
                                        <div className="pd-or-line"></div>
                                        <span>OR</span>
                                        <div className="pd-or-line"></div>
                                    </div>
                                    <div className="pd-field-wrap">
                                        <label className="pd-label">Enter UPI ID</label>
                                        <div className={`pd-input-wrap ${errors.upiId ? "pd-error" : ""}`}>
                                            <span className="pd-input-icon">@</span>
                                            <input
                                                className="pd-input"
                                                type="text"
                                                name="upiId"
                                                placeholder="yourname@upi"
                                                value={paymentInfo.upiId}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <p className="pd-hint">e.g. name@okaxis · name@ybl</p>
                                    </div>
                                    <button type="submit" className={`pd-submit-btn ${isProcessing ? "pd-processing" : ""}`} disabled={isProcessing}>
                                        {isProcessing ? (
                                            <><div className="pd-spinner"></div>Processing Payment…</>
                                        ) : (
                                            <><span>🔒 Pay ₹{bookingData?.totalAmount?.toLocaleString()} via UPI</span><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </section>
                    )}

                    {paymentMethod === "bank-transfer" && (
                        <section className="pd-card">
                            <div className="pd-card-head">
                                <div className="pd-card-num">01</div>
                                <div>
                                    <h2 className="pd-card-title">Bank Transfer</h2>
                                    <p className="pd-card-sub">NEFT / RTGS / IMPS — Instant processing</p>
                                </div>
                            </div>
                            <div className="pd-card-body">
                                <div className="pd-bank-notice">
                                    <span className="pd-bank-notice-icon">🏦</span>
                                    <div>
                                        <div className="pd-bank-notice-title">Direct Bank Transfer</div>
                                        <div className="pd-bank-notice-sub">Secure transfer of ₹{bookingData?.totalAmount?.toLocaleString()}</div>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="pd-form" noValidate>
                                    <div className="pd-form-grid">
                                        <div className="pd-field-wrap">
                                            <label className="pd-label">Account Holder Name</label>
                                            <div className={`pd-input-wrap ${errors.accountHolder ? "pd-error" : ""}`}>
                                                <span className="pd-input-icon">👤</span>
                                                <input className="pd-input" type="text" name="accountHolder" placeholder="Full name" value={paymentInfo.accountHolder} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="pd-field-wrap">
                                            <label className="pd-label">Bank Name</label>
                                            <div className="pd-input-wrap">
                                                <span className="pd-input-icon">🏦</span>
                                                <input className="pd-input" type="text" name="bankName" placeholder="e.g. SBI" value={paymentInfo.bankName} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="pd-field-wrap">
                                            <label className="pd-label">Account Number</label>
                                            <div className={`pd-input-wrap ${errors.bankAccount ? "pd-error" : ""}`}>
                                                <span className="pd-input-icon">🔢</span>
                                                <input className="pd-input" type="text" name="bankAccount" placeholder="Account number" value={paymentInfo.bankAccount} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="pd-field-wrap">
                                            <label className="pd-label">IFSC Code</label>
                                            <div className={`pd-input-wrap ${errors.ifsc ? "pd-error" : ""}`}>
                                                <span className="pd-input-icon">🔑</span>
                                                <input className="pd-input" type="text" name="ifsc" placeholder="SBIN0001234" value={paymentInfo.ifsc} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pd-secure-note">
                                        🔒 Your bank details are secured with 256-bit SSL encryption.
                                    </div>
                                    <button type="submit" className={`pd-submit-btn ${isProcessing ? "pd-processing" : ""}`} disabled={isProcessing}>
                                        {isProcessing ? (
                                            <><div className="pd-spinner"></div>Processing Transfer…</>
                                        ) : (
                                            <><span>🔒 Initiate Transfer ₹{bookingData?.totalAmount?.toLocaleString()}</span><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </section>
                    )}
                </div>

                <aside className="pd-sidebar">
                    <div className="pd-sidebar-card">
                        <div className="pd-sc-header">
                            <h3>Order Summary</h3>
                        </div>
                        <div className="pd-sc-route">
                            <div className="pd-scr-col">
                                <div className="pd-scr-city">{bookingData?.flight?.departure || "—"}</div>
                                <div className="pd-scr-label">From</div>
                            </div>
                            <div className="pd-scr-plane">✈</div>
                            <div className="pd-scr-col right">
                                <div className="pd-scr-city">{bookingData?.flight?.destination || "—"}</div>
                                <div className="pd-scr-label">To</div>
                            </div>
                        </div>
                        <div className="pd-sc-rows">
                            <div className="pd-sc-row"><span>Date</span><span>{bookingData?.flight?.date || "—"}</span></div>
                            <div className="pd-sc-row"><span>Departure</span><span>{bookingData?.flight?.timing || "—"}</span></div>
                            <div className="pd-sc-row"><span>Passengers</span><span>{bookingData?.passengers?.length || 0}</span></div>
                        </div>
                        {bookingData?.passengers?.length > 0 && (
                            <div className="pd-sc-pax">
                                {bookingData.passengers.map((p, i) => (
                                    <div key={i} className="pd-sc-pax-row">
                                        <div className="pd-sc-pax-avatar">{i + 1}</div>
                                        <div className="pd-sc-pax-info">
                                            <div className="pd-sc-pax-name">{p.fullName}</div>
                                            <div className="pd-sc-pax-seat">{p.seat}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="pd-sc-total">
                            <span>Total Amount</span>
                            <span className="pd-sc-total-val">₹{bookingData?.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="pd-sc-badges">
                            <div className="pd-sc-badge">🔒 256-bit SSL Encrypted</div>
                            <div className="pd-sc-badge">✈ Instant E-Ticket</div>
                        </div>
                    </div>
                </aside>
            </div>

            <footer className="pd-footer">
                <div className="pd-footer-inner">
                    <span>✈ SkyBook — Trusted by 2M+ travelers</span>
                    <span>🔒 Secure Booking &nbsp;|&nbsp; 24/7 Support &nbsp;|&nbsp; Free Cancellation</span>
                </div>
            </footer>
        </div>
    );
};

export default PaymentDetails;