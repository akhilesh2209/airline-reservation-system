import React, { useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";
import countryData from "./countryCodes.json";

// Configuration Constants
const SEAT_PRICES = {
    platinum: 15000,
    business: 9000,
    economy: 4500,
};

const FLIGHT_TIMINGS = [
    "08:00 AM",
    "10:00 AM",
    "01:00 PM",
    "03:00 PM",
    "05:00 PM",
];

const SEAT_CATEGORIES = {
    platinum: { rows: 2, cols: 6, code: "P" },
    business: { rows: 4, cols: 6, code: "B" },
    economy: { rows: 10, cols: 6, code: "E" },
};

const SEAT_CONFIG = {
    platinum: { color: "#f59e0b", label: "Platinum", icon: "👑" },
    business: { color: "#7c3aed", label: "Business", icon: "💼" },
    economy:  { color: "#0ea5e9", label: "Economy",  icon: "🪑" },
};

const STEPS = [
    { id: 1, label: "Contact Info", icon: "👤" },
    { id: 2, label: "Seat Selection", icon: "💺" },
    { id: 3, label: "Passengers", icon: "🧍" },
    { id: 4, label: "Review", icon: "✅" },
];

const Booking = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Route Params
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const airline = queryParams.get("airline");
    const departure = queryParams.get("departure");
    const destination = queryParams.get("destination");
    const date = queryParams.get("date");

    // --- State Management ---
    const [activeStep, setActiveStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [numPassengers, setNumPassengers] = useState(1);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengerSeats, setPassengerSeats] = useState({}); // { index: seatNumber }
    const [bookedSeats, setBookedSeats] = useState([]);
    const [waitingList, setWaitingList] = useState([]);
    
    const [passengerDetails, setPassengerDetails] = useState([{ fullName: "", passport: "" }]);
    const [contactDetails, setContactDetails] = useState({
        name: "", address: "", mobile: "", email: "", countryCode: "+1"
    });
    
    const [errors, setErrors] = useState({ email: "", mobile: "" });
    const [selectedTiming, setSelectedTiming] = useState(FLIGHT_TIMINGS[0]);

    // --- Helpers & Validation ---
    const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const validatePhone = (mobile) => /^[0-9]{7,15}$/.test(mobile);

    const isStepComplete = useCallback((stepId) => {
        switch (stepId) {
            case 1:
                return (
                    contactDetails.name && 
                    contactDetails.address && 
                    validateEmail(contactDetails.email) && 
                    validatePhone(contactDetails.mobile)
                );
            case 2:
                return selectedSeats.length === numPassengers;
            case 3:
                return passengerDetails.every((p, i) => p.fullName && p.passport && passengerSeats[i]);
            default:
                return true;
        }
    }, [contactDetails, selectedSeats, numPassengers, passengerDetails, passengerSeats]);

    // --- Event Handlers ---
    const handleStepNavigation = (stepId) => {
        // Prevent skipping ahead to incomplete steps
        if (stepId > activeStep) {
            for (let i = activeStep; i < stepId; i++) {
                if (!isStepComplete(i)) return;
            }
        }
        setActiveStep(stepId);
    };

    const handleSeatClick = (seat) => {
        if (bookedSeats.includes(seat)) {
            const userConfirmed = window.confirm("This seat is already booked. Join waiting list?");
            if (userConfirmed) {
                const name = prompt("Enter your name:");
                if (name) setWaitingList(prev => [...prev, { seat, name }]);
            }
            return;
        }

        if (selectedSeats.includes(seat)) {
            setSelectedSeats(prev => prev.filter(s => s !== seat));
            // Automatically unassign this seat from any passenger
            const updatedPaxSeats = { ...passengerSeats };
            Object.keys(updatedPaxSeats).forEach(key => {
                if (updatedPaxSeats[key] === seat) delete updatedPaxSeats[key];
            });
            setPassengerSeats(updatedPaxSeats);
        } else if (selectedSeats.length < numPassengers) {
            setSelectedSeats(prev => [...prev, seat]);
        }
    };

    const handleNumPassengersChange = (e) => {
        const count = parseInt(e.target.value, 10);
        setNumPassengers(count);
        setSelectedSeats([]);
        setPassengerSeats({});
        setPassengerDetails(Array.from({ length: count }, () => ({ fullName: "", passport: "" })));
    };

    const handlePassengerInput = (index, field, value) => {
        setPassengerDetails(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    const handleContactChange = (field, value) => {
        setContactDetails(prev => ({ ...prev, [field]: value }));
        if (field === "email") setErrors(prev => ({ ...prev, email: validateEmail(value) ? "" : "Invalid email" }));
        if (field === "mobile") setErrors(prev => ({ ...prev, mobile: validatePhone(value) ? "" : "Invalid phone" }));
    };

    const totalAmount = useMemo(() => {
        return selectedSeats.reduce((total, seat) => {
            const category = seat.startsWith("P") ? "platinum" : seat.startsWith("B") ? "business" : "economy";
            return total + SEAT_PRICES[category];
        }, 0);
    }, [selectedSeats]);

    const handleBooking = async () => {
        if (!isStepComplete(1) || !isStepComplete(2) || !isStepComplete(3)) {
            alert("Please complete all required information in previous steps.");
            return;
        }

        setIsSubmitting(true);
        const bookingData = {
            flight: { departure, destination, date, timing: selectedTiming },
            contactDetails,
            passengers: passengerDetails.map((p, i) => ({
                fullName: p.fullName, passport: p.passport, seat: passengerSeats[i]
            })),
            totalAmount,
            createdAt: new Date()
        };

        try {
            const response = await fetch("https://airline-backend-mrkm.onrender.com/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });
            
            const result = await response.json();
            if (response.ok) {
                setBookedSeats(prev => [...prev, ...selectedSeats]);
                navigate("/payment", { state: bookingData });
            } else {
                alert(`Booking failed: ${result.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Connection error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bk-page">
            {/* ── Top Banner ── */}
            <header className="bk-header">
                <div className="bk-header-overlay"></div>
                <div className="bk-header-content">
                    <div className="bk-breadcrumb">
                        <span>Home</span><span className="bk-bc-sep">›</span>
                        <span>Flights</span><span className="bk-bc-sep">›</span>
                        <span className="bk-bc-active">Booking</span>
                    </div>
                    <h1 className="bk-title">Complete Your Booking</h1>
                    <div className="bk-route-bar">
                        <div className="bk-route-city">{departure || "N/A"}</div>
                        <div className="bk-route-arrow">
                            <svg viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 14 H100 M88 5 L100 14 L88 23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <text x="36" y="10" fontSize="9" fill="currentColor" opacity="0.7" fontFamily="DM Sans">{date}</text>
                            </svg>
                        </div>
                        <div className="bk-route-city dest">{destination || "N/A"}</div>
                    </div>
                    {airline && <div className="bk-airline-pill">✈ {airline}</div>}
                </div>
            </header>

            {/* ── Stepper ── */}
            <div className="bk-stepper-wrap">
                <div className="bk-stepper">
                    {STEPS.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div
                                className={`bk-step ${activeStep === step.id ? "active" : ""} ${activeStep > step.id ? "done" : ""}`}
                                onClick={() => handleStepNavigation(step.id)}
                            >
                                <div className="bk-step-circle">
                                    {activeStep > step.id ? "✓" : step.icon}
                                </div>
                                <div className="bk-step-label">{step.label}</div>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={`bk-step-line ${activeStep > step.id ? "done" : ""}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="bk-main">
                <div className="bk-left-col">
                    {/* ── STEP 1: Contact Info ── */}
                    <section className={`bk-card bk-section-contact ${activeStep === 1 ? "bk-active-section" : ""}`} id="step-1">
                        <div className="bk-card-header" onClick={() => handleStepNavigation(1)}>
                            <div className="bk-card-header-left">
                                <div className="bk-section-num">01</div>
                                <div>
                                    <h2 className="bk-section-title">Contact Information</h2>
                                    <p className="bk-section-sub">Primary contact for booking confirmation</p>
                                </div>
                            </div>
                            <div className="bk-chevron">{activeStep === 1 ? "▲" : "▼"}</div>
                        </div>
                        {activeStep === 1 && (
                            <div className="bk-card-body">
                                <div className="bk-form-grid">
                                    <div className="bk-field bk-field-full">
                                        <label className="bk-label">Full Name</label>
                                        <input
                                            className="bk-input"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={contactDetails.name}
                                            onChange={(e) => handleContactChange("name", e.target.value)}
                                        />
                                    </div>
                                    <div className="bk-field bk-field-full">
                                        <label className="bk-label">Address</label>
                                        <input
                                            className="bk-input"
                                            type="text"
                                            placeholder="Street, City, Country"
                                            value={contactDetails.address}
                                            onChange={(e) => handleContactChange("address", e.target.value)}
                                        />
                                    </div>
                                    <div className="bk-field">
                                        <label className="bk-label">Phone Number</label>
                                        <div className="bk-phone-row">
                                            <select
                                                className="bk-select bk-code-select"
                                                value={contactDetails.countryCode}
                                                onChange={(e) => handleContactChange("countryCode", e.target.value)}
                                            >
                                                {countryData.map((country) => (
                                                    <option key={`${country.dial_code}-${country.code}`} value={country.dial_code}>
                                                        {country.flag} {country.name} ({country.dial_code})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                className={`bk-input bk-phone-num ${errors.mobile ? "bk-input-error" : ""}`}
                                                type="text"
                                                placeholder="Mobile number"
                                                value={contactDetails.mobile}
                                                onChange={(e) => handleContactChange("mobile", e.target.value)}
                                            />
                                        </div>
                                        {errors.mobile && <p className="bk-error">{errors.mobile}</p>}
                                    </div>
                                    <div className="bk-field">
                                        <label className="bk-label">Email Address</label>
                                        <input
                                            className={`bk-input ${errors.email ? "bk-input-error" : ""}`}
                                            type="email"
                                            placeholder="your@email.com"
                                            value={contactDetails.email}
                                            onChange={(e) => handleContactChange("email", e.target.value)}
                                        />
                                        {errors.email && <p className="bk-error">{errors.email}</p>}
                                    </div>
                                    <div className="bk-field">
                                        <label className="bk-label">Number of Passengers</label>
                                        <select className="bk-select" onChange={handleNumPassengersChange} value={numPassengers}>
                                            {[...Array(10).keys()].map((n) => (
                                                <option key={n + 1} value={n + 1}>{n + 1} Passenger{n > 0 ? "s" : ""}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="bk-field">
                                        <label className="bk-label">Preferred Departure Time</label>
                                        <select
                                            className="bk-select"
                                            onChange={(e) => setSelectedTiming(e.target.value)}
                                            value={selectedTiming}
                                        >
                                            {FLIGHT_TIMINGS.map((timing) => (
                                                <option key={timing} value={timing}>{timing}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button className="bk-next-btn" onClick={() => handleStepNavigation(2)} disabled={!isStepComplete(1)}>
                                    Continue to Seat Selection <span>→</span>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* ── STEP 2: Seat Selection ── */}
                    <section className={`bk-card ${activeStep === 2 ? "bk-active-section" : ""}`} id="step-2">
                        <div className="bk-card-header" onClick={() => handleStepNavigation(2)}>
                            <div className="bk-card-header-left">
                                <div className="bk-section-num">02</div>
                                <div>
                                    <h2 className="bk-section-title">Seat Selection</h2>
                                    <p className="bk-section-sub">
                                        {selectedSeats.length > 0
                                            ? `${selectedSeats.length}/${numPassengers} seats selected — ${selectedSeats.join(", ")}`
                                            : `Choose ${numPassengers} seat${numPassengers > 1 ? "s" : ""}`}
                                    </p>
                                </div>
                            </div>
                            <div className="bk-chevron">{activeStep === 2 ? "▲" : "▼"}</div>
                        </div>
                        {activeStep === 2 && (
                            <div className="bk-card-body">
                                <div className="bk-legend">
                                    <div className="bk-legend-item"><div className="bk-legend-box available"></div><span>Available</span></div>
                                    <div className="bk-legend-item"><div className="bk-legend-box selected"></div><span>Selected</span></div>
                                    <div className="bk-legend-item"><div className="bk-legend-box booked"></div><span>Booked</span></div>
                                </div>

                                <div className="bk-aircraft-wrap">
                                    <div className="bk-aircraft-nose">
                                        <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M60 4 C30 4 8 30 8 54 L112 54 C112 30 90 4 60 4Z" fill="var(--bk-navy-mid)" stroke="var(--bk-border)" strokeWidth="1.5"/>
                                            <text x="60" y="38" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="DM Sans">FRONT</text>
                                        </svg>
                                    </div>
                                    <div className="bk-aircraft-body">
                                        {Object.keys(SEAT_CATEGORIES).map((category) => (
                                            <div key={category} className="bk-cat-block">
                                                <div className="bk-cat-header">
                                                    <span className="bk-cat-icon">{SEAT_CONFIG[category].icon}</span>
                                                    <span className="bk-cat-name">{SEAT_CONFIG[category].label}</span>
                                                    <span className="bk-cat-price">₹{SEAT_PRICES[category].toLocaleString()}/seat</span>
                                                </div>
                                                <div className="bk-seating-grid">
                                                    {Array.from({ length: SEAT_CATEGORIES[category].rows }, (_, row) => (
                                                        <div key={row} className="bk-seat-row">
                                                            {Array.from({ length: 3 }, (_, col) => {
                                                                const seatNumber = `${SEAT_CATEGORIES[category].code}${row + 1}${col + 1}`;
                                                                const isSelected = selectedSeats.includes(seatNumber);
                                                                const isBooked = bookedSeats.includes(seatNumber);
                                                                return (
                                                                    <div
                                                                        key={seatNumber}
                                                                        className={`bk-seat ${isSelected ? "bk-seat-selected" : ""} ${isBooked ? "bk-seat-booked" : ""} bk-seat-${category}`}
                                                                        onClick={() => handleSeatClick(seatNumber)}
                                                                        title={seatNumber}
                                                                    >
                                                                        <span className="bk-seat-num">{seatNumber}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                            <div className="bk-aisle"><span>{row + 1}</span></div>
                                                            {Array.from({ length: 3 }, (_, col) => {
                                                                const seatNumber = `${SEAT_CATEGORIES[category].code}${row + 1}${col + 4}`;
                                                                const isSelected = selectedSeats.includes(seatNumber);
                                                                const isBooked = bookedSeats.includes(seatNumber);
                                                                return (
                                                                    <div
                                                                        key={seatNumber}
                                                                        className={`bk-seat ${isSelected ? "bk-seat-selected" : ""} ${isBooked ? "bk-seat-booked" : ""} bk-seat-${category}`}
                                                                        onClick={() => handleSeatClick(seatNumber)}
                                                                        title={seatNumber}
                                                                    >
                                                                        <span className="bk-seat-num">{seatNumber}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bk-aircraft-tail">
                                        <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 4 L112 4 L80 38 L40 38 Z" fill="var(--bk-navy-mid)" stroke="var(--bk-border)" strokeWidth="1.5"/>
                                        </svg>
                                    </div>
                                </div>
                                <button className="bk-next-btn" onClick={() => handleStepNavigation(3)} disabled={!isStepComplete(2)}>
                                    Continue to Passenger Details <span>→</span>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* ── STEP 3: Passenger Info ── */}
                    <section className={`bk-card ${activeStep === 3 ? "bk-active-section" : ""}`} id="step-3">
                        <div className="bk-card-header" onClick={() => handleStepNavigation(3)}>
                            <div className="bk-card-header-left">
                                <div className="bk-section-num">03</div>
                                <div>
                                    <h2 className="bk-section-title">Passenger Details</h2>
                                    <p className="bk-section-sub">{numPassengers} passenger{numPassengers > 1 ? "s" : ""}</p>
                                </div>
                            </div>
                            <div className="bk-chevron">{activeStep === 3 ? "▲" : "▼"}</div>
                        </div>
                        {activeStep === 3 && (
                            <div className="bk-card-body">
                                <div className="bk-passengers-list">
                                    {passengerDetails.map((passenger, index) => (
                                        <div key={index} className="bk-passenger-block">
                                            <div className="bk-passenger-head">
                                                <div className="bk-pax-avatar">{index + 1}</div>
                                                <div className="bk-pax-title">Passenger {index + 1}</div>
                                            </div>
                                            <div className="bk-form-grid">
                                                <div className="bk-field">
                                                    <label className="bk-label">Full Name</label>
                                                    <input
                                                        className="bk-input"
                                                        type="text"
                                                        placeholder="As on passport"
                                                        value={passenger.fullName}
                                                        onChange={(e) => handlePassengerInput(index, "fullName", e.target.value)}
                                                    />
                                                </div>
                                                <div className="bk-field">
                                                    <label className="bk-label">Passport Number</label>
                                                    <input
                                                        className="bk-input"
                                                        type="text"
                                                        placeholder="e.g. A1234567"
                                                        value={passenger.passport}
                                                        onChange={(e) => handlePassengerInput(index, "passport", e.target.value)}
                                                    />
                                                </div>
                                                <div className="bk-field bk-field-full">
                                                    <label className="bk-label">Assigned Seat</label>
                                                    <select
                                                        className="bk-select"
                                                        value={passengerSeats[index] || ""}
                                                        onChange={(e) => setPassengerSeats(prev => ({ ...prev, [index]: e.target.value }))}
                                                    >
                                                        <option value="">Select a seat</option>
                                                        {selectedSeats
                                                            .filter(seat => !Object.values(passengerSeats).includes(seat) || passengerSeats[index] === seat)
                                                            .map((seat) => (
                                                                <option key={seat} value={seat}>{seat}</option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="bk-next-btn" onClick={() => handleStepNavigation(4)} disabled={!isStepComplete(3)}>
                                    Review Booking <span>→</span>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* ── STEP 4: Review & Book ── */}
                    <section className={`bk-card ${activeStep === 4 ? "bk-active-section" : ""}`} id="step-4">
                        <div className="bk-card-header" onClick={() => handleStepNavigation(4)}>
                            <div className="bk-card-header-left">
                                <div className="bk-section-num">04</div>
                                <div>
                                    <h2 className="bk-section-title">Review & Confirm</h2>
                                    <p className="bk-section-sub">Verify your details before payment</p>
                                </div>
                            </div>
                            <div className="bk-chevron">{activeStep === 4 ? "▲" : "▼"}</div>
                        </div>
                        {activeStep === 4 && (
                            <div className="bk-card-body">
                                <div className="bk-review-grid">
                                    <div className="bk-review-block">
                                        <div className="bk-review-heading">Contact</div>
                                        <p>{contactDetails.name || "—"}</p>
                                        <p>{contactDetails.email || "—"}</p>
                                        <p>{contactDetails.countryCode} {contactDetails.mobile || "—"}</p>
                                    </div>
                                    <div className="bk-review-block">
                                        <div className="bk-review-heading">Flight</div>
                                        <p>{departure} → {destination}</p>
                                        <p>{date} · {selectedTiming}</p>
                                        {airline && <p className="bk-review-airline">{airline}</p>}
                                    </div>
                                    <div className="bk-review-block">
                                        <div className="bk-review-heading">Seats</div>
                                        {selectedSeats.length > 0 ? selectedSeats.map(s => <p key={s}>{s}</p>) : <p>None selected</p>}
                                    </div>
                                </div>
                                <button className="bk-book-btn" onClick={handleBooking} disabled={isSubmitting}>
                                    <span>{isSubmitting ? "Processing..." : "Confirm & Pay"}</span>
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* ── Right Sidebar ── */}
                <aside className="bk-sidebar">
                    <div className="bk-summary-card">
                        <div className="bk-summary-header"><h3>Booking Summary</h3></div>
                        <div className="bk-summary-flight">
                            <div className="bk-sf-col">
                                <div className="bk-sf-city">{departure || "—"}</div>
                                <div className="bk-sf-label">Departure</div>
                            </div>
                            <div className="bk-sf-arrow">✈</div>
                            <div className="bk-sf-col right">
                                <div className="bk-sf-city">{destination || "—"}</div>
                                <div className="bk-sf-label">Destination</div>
                            </div>
                        </div>
                        <div className="bk-summary-meta">
                            <div className="bk-sm-row"><span>Date</span><span>{date || "—"}</span></div>
                            <div className="bk-sm-row"><span>Time</span><span>{selectedTiming}</span></div>
                            <div className="bk-sm-row"><span>Passengers</span><span>{numPassengers}</span></div>
                            <div className="bk-sm-row"><span>Seats</span><span>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</span></div>
                        </div>
                        {selectedSeats.length > 0 && (
                            <div className="bk-summary-breakdown">
                                {selectedSeats.map((seat) => {
                                    const cat = seat.startsWith("P") ? "platinum" : seat.startsWith("B") ? "business" : "economy";
                                    return (
                                        <div key={seat} className="bk-sb-row">
                                            <span>{seat} ({cat})</span>
                                            <span>₹{SEAT_PRICES[cat].toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="bk-summary-total">
                            <span>Total Amount</span>
                            <span className="bk-total-val">₹{totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="bk-trust-badges">
                            <div className="bk-trust-item">🔒 Secure Payment</div>
                            <div className="bk-trust-item">✈ Instant Confirmation</div>
                        </div>
                    </div>
                    {waitingList.length > 0 && (
                        <div className="bk-waiting-card">
                            <h4>⏳ Waiting List</h4>
                            <ul className="bk-waiting-list">
                                {waitingList.map((entry, idx) => (
                                    <li key={idx} className="bk-waiting-item">
                                        <span className="bk-w-name">{entry.name}</span>
                                        <span className="bk-w-seat">Seat {entry.seat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
            </div>
            <footer className="bk-footer">
                <div className="bk-footer-inner">
                    <span>✈ SkyBook — Trusted by 2M+ travelers</span>
                    <span>🔒 Secure Booking &nbsp;|&nbsp; 24/7 Support</span>
                </div>
            </footer>
        </div>
    );
};

export default Booking;