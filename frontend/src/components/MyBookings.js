import React, { useState, useEffect, useCallback } from "react";
import "./MyBookings.css";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = "https://airline-backend-mrkm.onrender.com";

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/bookings`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError("Could not load bookings. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleCancelBooking = async (bookingId) => {
        const confirmDelete = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Booking cancelled successfully!");
                setBookings((prev) => prev.filter((b) => b._id !== bookingId));
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || "Failed to cancel booking. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            alert("An error occurred while canceling the booking.");
        }
    };

    const calculateTime = (time, minutesToAdd) => {
        if (!time || typeof time !== 'string') return "--:--";
        try {
            const [timePart, period] = time.split(" ");
            let [hours, minutes] = timePart.split(":").map(Number);
            
            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;
            
            let totalMinutes = hours * 60 + minutes + minutesToAdd;
            totalMinutes = ((totalMinutes % 1440) + 1440) % 1440; // Handles overflow/underflow
            
            let newHours = Math.floor(totalMinutes / 60);
            let newMinutes = totalMinutes % 60;
            let newPeriod = newHours >= 12 ? "PM" : "AM";
            
            newHours = newHours % 12 || 12;
            return `${newHours}:${newMinutes.toString().padStart(2, "0")} ${newPeriod}`;
        } catch (e) {
            return time;
        }
    };

    const getSeatClass = (seat) => {
        if (!seat) return "Economy";
        const code = seat[0]?.toUpperCase();
        return code === "P" ? "Platinum" : code === "B" ? "Business" : "Economy";
    };

    const getSeatClassStyle = (seat) => {
        if (!seat) return "mb-class-economy";
        const code = seat[0]?.toUpperCase();
        return code === "P" ? "mb-class-platinum" : code === "B" ? "mb-class-business" : "mb-class-economy";
    };

    const handlePrint = (e, booking, boardingTime, estimatedArrival, flightNumber) => {
        const ticket = e.currentTarget.closest(".mb-pass");
        if (!ticket) return;

        const printWindow = window.open("", "_blank", "width=860,height=700");
        if (!printWindow) {
            alert("Please allow pop-ups to print your ticket.");
            return;
        }

        printWindow.document.write(`
<html>
<head>
<title>Boarding Pass — ${booking.flight?.departure || 'Ticket'}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#f1f5f9;display:flex;justify-content:center;align-items:flex-start;padding:40px;min-height:100vh;}
.mb-pass{width:680px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(10,22,40,0.18);margin: auto;}
.mb-pass-header{background:linear-gradient(135deg,#0a1628,#1e3a5f);padding:22px 28px;display:flex;align-items:center;justify-content:space-between;}
.mb-ph-logo{font-size:15px;font-weight:700;color:#fff;letter-spacing:0.5px;display:flex;align-items:center;gap:10px;}
.mb-ph-fn{font-size:13px;color:rgba(255,255,255,0.5);}
.mb-pass-class{padding:4px 14px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase;}
.mb-class-platinum{background:linear-gradient(90deg,#d4af37,#f5e07b);color:#6b4f00;}
.mb-class-business{background:linear-gradient(90deg,#7c3aed,#a78bfa);color:#fff;}
.mb-class-economy{background:rgba(14,165,233,0.15);color:#0284c7;border:1px solid rgba(14,165,233,0.3);}
.mb-pass-route{display:flex;align-items:center;padding:24px 28px;background:#f1f5f9;border-bottom:1px dashed #e2e8f0;}
.mb-pr-city{display:flex;flex-direction:column;gap:3px;min-width:120px;}
.mb-pr-city.right{text-align:right;align-items:flex-end;}
.mb-pr-code{font-size:38px;font-weight:700;color:#0a1628;line-height:1;}
.mb-pr-city.right .mb-pr-code{color:#0284c7;}
.mb-pr-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;font-weight:600;}
.mb-pr-time{font-size:14px;font-weight:700;color:#0a1628;margin-top:4px;}
.mb-pr-mid{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:0 20px;}
.mb-pr-plane{font-size:22px;color:#0ea5e9;}
.mb-pr-line{width:100%;height:2px;background:linear-gradient(90deg,#0ea5e9,#f59e0b);}
.mb-pr-dur{font-size:11px;color:#94a3b8;font-weight:500;}
.mb-perf{display:flex;align-items:center;background:#f1f5f9;height:20px;position:relative;}
.mb-perf-notch{width:20px;height:20px;background:#f1f5f9;border-radius:50%;position:absolute;top:0;}
.mb-perf-notch.left{left:-10px;}
.mb-perf-notch.right{right:-10px;}
.mb-perf-line{flex:1;margin:0 16px;height:1px;background:repeating-linear-gradient(90deg,#cbd5e1 0,#cbd5e1 6px,transparent 6px,transparent 12px);}
.mb-pass-details{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:20px 28px;background:#fff;}
.mb-pd-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;font-weight:600;margin-bottom:4px;}
.mb-pd-val{font-size:14px;font-weight:700;color:#0f172a;}
.mb-pax-list{padding:0 28px 20px;}
.mb-pax-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:8px;}
.mb-pax-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;}
.mb-pax-name{font-size:13px;font-weight:700;color:#0f172a;}
.mb-pax-seat{font-size:11px;color:#64748b;}
.mb-pax-class-badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;margin-left:auto;text-transform:uppercase;}
.mb-barcode{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 28px 20px;border-top:1px dashed #e2e8f0;}
.mb-bars{display:flex;align-items:flex-end;gap:1px;}
.mb-bar{background:#0a1628;border-radius:1px;}
.mb-bar-num{font-size:11px;font-family:monospace;color:#94a3b8;letter-spacing:2px;}
.mb-actions{display:none;}
</style>
</head>
<body>
${ticket.outerHTML}
<script>window.onload=function(){window.print();window.close();}</script>
</body>
</html>`);
        printWindow.document.close();
    };

    return (
        <div className="mb-page">
            <header className="mb-header">
                <div className="mb-header-overlay"></div>
                <div className="mb-header-content">
                    <div className="mb-breadcrumb">
                        <span>Home</span><span className="mb-bc-sep">›</span>
                        <span className="mb-bc-active">My Bookings</span>
                    </div>
                    <h1 className="mb-title">My Bookings</h1>
                    <p className="mb-subtitle">
                        {loading ? "Loading your trips…" : error ? error : bookings.length > 0
                            ? `${bookings.length} booking${bookings.length > 1 ? "s" : ""} found`
                            : "No bookings yet"}
                    </p>
                </div>
            </header>

            <main className="mb-main">
                {loading && (
                    <div className="mb-loading">
                        <div className="mb-spinner"></div>
                        <p>Fetching your bookings…</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="mb-empty">
                        <div className="mb-empty-icon" style={{color: '#ef4444'}}>⚠️</div>
                        <h2 className="mb-empty-title">Oops! Something went wrong</h2>
                        <p className="mb-empty-sub">{error}</p>
                        <button onClick={fetchBookings} className="mb-empty-cta" style={{border: 'none', cursor: 'pointer'}}>Try Again</button>
                    </div>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <div className="mb-empty">
                        <div className="mb-empty-icon">✈</div>
                        <h2 className="mb-empty-title">No bookings yet</h2>
                        <p className="mb-empty-sub">Your booked flights will appear here. Start your journey today!</p>
                        <a href="/" className="mb-empty-cta">Search Flights</a>
                    </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <div className="mb-list">
                        {bookings.map((booking, index) => {
                            const { passengers = [], flight } = booking;

                            if (!flight) {
                                return (
                                    <div key={booking._id || index} className="mb-error-card">
                                        ⚠️ Flight details not available for booking ID: {booking._id?.slice(-8) || index}
                                        <button className="mb-cancel-btn" onClick={() => handleCancelBooking(booking._id)} style={{marginTop: '10px'}}>Remove Record</button>
                                    </div>
                                );
                            }

                            const boardingTime = calculateTime(flight.timing, -45);
                            const estimatedArrival = calculateTime(flight.timing, 240);
                            const flightNumber = (booking._id || "000").slice(-3).toUpperCase();

                            return (
                                <div key={booking._id || index} className="mb-pass" style={{ animationDelay: `${index * 0.08}s` }}>
                                    
                                    <div className="mb-pass-header">
                                        <div className="mb-ph-left">
                                            <div className="mb-ph-logo">
                                                <div className="mb-ph-icon">✈</div>
                                                <div>
                                                    <div className="mb-ph-airline">AirBook Airlines</div>
                                                    <div className="mb-ph-fn">Flight {flightNumber}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-ph-right">
                                            {passengers.length > 0 && (
                                                <span className={`mb-pass-class ${getSeatClassStyle(passengers[0].seat)}`}>
                                                    {getSeatClass(passengers[0].seat)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-pass-route">
                                        <div className="mb-pr-city">
                                            <div className="mb-pr-code">{flight.departure}</div>
                                            <div className="mb-pr-label">Departure</div>
                                            <div className="mb-pr-time">{flight.timing}</div>
                                        </div>
                                        <div className="mb-pr-mid">
                                            <div className="mb-pr-plane">✈</div>
                                            <div className="mb-pr-line"></div>
                                            <div className="mb-pr-dur">~4h 00m</div>
                                        </div>
                                        <div className="mb-pr-city right">
                                            <div className="mb-pr-code">{flight.destination}</div>
                                            <div className="mb-pr-label">Arrival</div>
                                            <div className="mb-pr-time">{estimatedArrival}</div>
                                        </div>
                                    </div>

                                    <div className="mb-perf">
                                        <div className="mb-perf-notch left"></div>
                                        <div className="mb-perf-line"></div>
                                        <div className="mb-perf-notch right"></div>
                                    </div>

                                    <div className="mb-pass-details">
                                        <div className="mb-pd-item">
                                            <div className="mb-pd-label">Date</div>
                                            <div className="mb-pd-val">{flight.date}</div>
                                        </div>
                                        <div className="mb-pd-item">
                                            <div className="mb-pd-label">Boarding</div>
                                            <div className="mb-pd-val">{boardingTime}</div>
                                        </div>
                                        <div className="mb-pd-item">
                                            <div className="mb-pd-label">Flight No.</div>
                                            <div className="mb-pd-val">{flightNumber}</div>
                                        </div>
                                        <div className="mb-pd-item">
                                            <div className="mb-pd-label">Departure</div>
                                            <div className="mb-pd-val">{flight.timing}</div>
                                        </div>
                                        <div className="mb-pd-item">
                                            <div className="mb-pd-label">Est. Arrival</div>
                                            <div className="mb-pd-val">{estimatedArrival}</div>
                                        </div>
                                        <div className="mb-pd-item">
                                            <div className="mb-pd-label">Passengers</div>
                                            <div className="mb-pd-val">{passengers.length}</div>
                                        </div>
                                    </div>

                                    <div className="mb-pax-list">
                                        {passengers.map((passenger, idx) => (
                                            <div key={idx} className="mb-pax-row">
                                                <div className="mb-pax-av">{idx + 1}</div>
                                                <div className="mb-pax-info">
                                                    <div className="mb-pax-name">{passenger.fullName || "Guest Passenger"}</div>
                                                    <div className="mb-pax-seat">
                                                        Seat {passenger.seat || "N/A"} · {getSeatClass(passenger.seat)}
                                                    </div>
                                                </div>
                                                <span className={`mb-pax-class-badge ${getSeatClassStyle(passenger.seat)}`}>
                                                    {getSeatClass(passenger.seat)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-barcode">
                                        <div className="mb-bars">
                                            {Array.from({ length: 44 }, (_, i) => (
                                                <div key={i} className="mb-bar" style={{
                                                    height: `${18 + (i * 7 + 11) % 24}px`,
                                                    width: i % 3 === 0 ? "3px" : "1.5px"
                                                }}></div>
                                            ))}
                                        </div>
                                        <div className="mb-bar-num">ABK{flightNumber}-{passengers.length}PAX</div>
                                    </div>

                                    <div className="mb-actions">
                                        <button
                                            className="mb-print-btn"
                                            onClick={(e) => handlePrint(e, booking, boardingTime, estimatedArrival, flightNumber)}
                                        >
                                            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-1h8v3H6v-2zm8-4a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd"/></svg>
                                            Print Ticket
                                        </button>
                                        <button
                                            className="mb-cancel-btn"
                                            onClick={() => handleCancelBooking(booking._id)}
                                        >
                                            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                                            Cancel Booking
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="mb-footer">
                <div className="mb-footer-inner">
                    <span>✈ AirBook — Trusted by 2M+ travelers</span>
                    <span>🔒 Secure Booking &nbsp;|&nbsp; 24/7 Support &nbsp;|&nbsp; Free Cancellation</span>
                </div>
            </footer>
        </div>
    );
};

export default MyBookings;