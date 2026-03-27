import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
    const [departure, setDeparture] = useState("");
    const [destination, setDestination] = useState("");
    const [date, setDate] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tripType, setTripType] = useState("one-way");
    const [activeInput, setActiveInput] = useState("");
    const navigate = useNavigate();

    // Sync authentication state with storage
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
        };
        checkAuth();
        // Listener for storage changes (e.g., logout in another tab)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const validateInputs = () => {
        const trimmedDep = departure.trim();
        const trimmedDest = destination.trim();

        if (!isAuthenticated) {
            alert("Please log in to search for flights.");
            navigate("/login");
            return false;
        }

        if (!trimmedDep || !trimmedDest || !date) {
            alert("Please fill in all fields before searching.");
            return false;
        }

        if (trimmedDep.toLowerCase() === trimmedDest.toLowerCase()) {
            alert("Departure and destination cities cannot be the same.");
            return false;
        }

        const selectedDate = new Date(date);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < todayDate) {
            alert("Please select a current or future date.");
            return false;
        }

        return true;
    };

    const handleSearch = () => {
        if (!validateInputs()) return;

        const params = new URLSearchParams({
            departure: departure.trim(),
            destination: destination.trim(),
            date: date,
            type: tripType
        });

        navigate(`/flights?${params.toString()}`);
    };

    const handleSwap = useCallback((e) => {
        e.preventDefault();
        setDeparture(destination);
        setDestination(departure);
    }, [departure, destination]);

    const today = new Date().toISOString().split("T")[0];

    const popularRoutes = [
        { from: "DEL", to: "BOM", label: "Delhi → Mumbai" },
        { from: "BLR", to: "DXB", label: "Bengaluru → Dubai" },
        { from: "HYD", to: "SIN", label: "Hyderabad → Singapore" },
        { from: "MAA", to: "LHR", label: "Chennai → London" },
    ];

    const features = [
        { icon: "🛡️", title: "Secure Booking", sub: "256-bit SSL encryption" },
        { icon: "🔄", title: "Free Cancellation", sub: "Up to 24h before departure" },
        { icon: "📧", title: "Instant E-Ticket", sub: "Delivered to your inbox" },
        { icon: "🎧", title: "24/7 Support", sub: "Always here for you" },
    ];

    return (
        <div className="hm-page">

            {/* ── Hero ── */}
            <section className="hm-hero">
                <div className="hm-hero-bg">
                    <img src={require("../assets/mainflight.jpg")} alt="Flight" className="hm-hero-img" />
                    <div className="hm-hero-gradient"></div>
                </div>

                {/* Animated clouds */}
                <div className="hm-clouds" aria-hidden="true">
                    <div className="hm-cloud hm-c1"></div>
                    <div className="hm-cloud hm-c2"></div>
                    <div className="hm-cloud hm-c3"></div>
                </div>

                <div className="hm-hero-content">
                    {/* Badge */}
                    <div className="hm-badge">
                        <span className="hm-badge-dot"></span>
                        Trusted by 2M+ Travelers Worldwide
                    </div>

                    <h1 className="hm-hero-title">
                        Your Journey<br />
                        <span className="hm-hero-accent">Starts Here</span>
                    </h1>
                    <p className="hm-hero-sub">
                        Discover world-class flights at unbeatable prices.<br className="hm-br-hide" />
                        Book smarter. Fly better.
                    </p>

                    {/* ── Search Card ── */}
                    <div className="hm-search-card">

                        {/* Trip type tabs */}
                        <div className="hm-trip-tabs">
                            {["one-way", "round-trip", "multi-city"].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`hm-tab ${tripType === t ? "hm-tab-active" : ""}`}
                                    onClick={() => setTripType(t)}
                                >
                                    {t === "one-way" ? "One Way" : t === "round-trip" ? "Round Trip" : "Multi-City"}
                                </button>
                            ))}
                        </div>

                        {/* Input row */}
                        <div className="hm-inputs-row">

                            {/* Departure */}
                            <div className={`hm-input-group ${activeInput === "dep" ? "hm-focused" : ""}`}>
                                <div className="hm-input-icon">
                                    <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="3"/><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" opacity=".3"/></svg>
                                </div>
                                <div className="hm-input-inner">
                                    <label className="hm-input-label">From</label>
                                    <input
                                        className="hm-input"
                                        type="text"
                                        placeholder="Departure city"
                                        value={departure}
                                        onChange={(e) => setDeparture(e.target.value)}
                                        onFocus={() => setActiveInput("dep")}
                                        onBlur={() => setActiveInput("")}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            {/* Swap button */}
                            <button className="hm-swap-btn" onClick={handleSwap} title="Swap cities" type="button">
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0zm4.586 9.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 18H9a7 7 0 01-7-7V9a1 1 0 012 0v2a5 5 0 005 5h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                            </button>

                            {/* Destination */}
                            <div className={`hm-input-group ${activeInput === "dest" ? "hm-focused" : ""}`}>
                                <div className="hm-input-icon">
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                                </div>
                                <div className="hm-input-inner">
                                    <label className="hm-input-label">To</label>
                                    <input
                                        className="hm-input"
                                        type="text"
                                        placeholder="Destination city"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        onFocus={() => setActiveInput("dest")}
                                        onBlur={() => setActiveInput("")}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div className={`hm-input-group ${activeInput === "date" ? "hm-focused" : ""}`}>
                                <div className="hm-input-icon">
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                </div>
                                <div className="hm-input-inner">
                                    <label className="hm-input-label">Departure Date</label>
                                    <input
                                        className="hm-input hm-date-input"
                                        type="date"
                                        value={date}
                                        min={today}
                                        onChange={(e) => setDate(e.target.value)}
                                        onFocus={() => setActiveInput("date")}
                                        onBlur={() => setActiveInput("")}
                                    />
                                </div>
                            </div>

                            {/* Search button */}
                            <button className="hm-search-btn" onClick={handleSearch} type="button">
                                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
                                <span>Search Flights</span>
                            </button>
                        </div>

                        {/* Popular routes */}
                        <div className="hm-popular-row">
                            <span className="hm-popular-label">Popular:</span>
                            {popularRoutes.map((r) => (
                                <button
                                    key={r.label}
                                    type="button"
                                    className="hm-popular-chip"
                                    onClick={() => { setDeparture(r.from); setDestination(r.to); }}
                                >
                                    ✈ {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="hm-stats-row">
                        <div className="hm-stat">
                            <div className="hm-stat-val">500+</div>
                            <div className="hm-stat-label">Destinations</div>
                        </div>
                        <div className="hm-stat-divider"></div>
                        <div className="hm-stat">
                            <div className="hm-stat-val">2M+</div>
                            <div className="hm-stat-label">Passengers</div>
                        </div>
                        <div className="hm-stat-divider"></div>
                        <div className="hm-stat">
                            <div className="hm-stat-val">50+</div>
                            <div className="hm-stat-label">Airlines</div>
                        </div>
                        <div className="hm-stat-divider"></div>
                        <div className="hm-stat">
                            <div className="hm-stat-val">4.9★</div>
                            <div className="hm-stat-label">Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features strip ── */}
            <section className="hm-features">
                <div className="hm-features-inner">
                    {features.map((f) => (
                        <div key={f.title} className="hm-feature-item">
                            <div className="hm-feature-icon">{f.icon}</div>
                            <div className="hm-feature-info">
                                <div className="hm-feature-title">{f.title}</div>
                                <div className="hm-feature-sub">{f.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Footer strip ── */}
            <footer className="hm-footer">
                <div className="hm-footer-inner">
                    <span>✈ AirBook — Fly Smarter</span>
                    <span>🔒 Secure Booking &nbsp;|&nbsp; 24/7 Support &nbsp;|&nbsp; Free Cancellation</span>
                </div>
            </footer>
        </div>
    );
};

export default Home;