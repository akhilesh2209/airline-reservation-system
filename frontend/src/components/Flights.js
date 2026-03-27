import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Flights.css";

// Asset Imports (Maintained)
import emiratesA350 from "../assets/emirates_a350.png";
import qatar777 from "../assets/qatar_777.jpg";
import lufthansaA340 from "../assets/lufthansa_a340.png";
import etihadA380 from "../assets/etihad_a380.png";
import airIndia from "../assets/airIndia_787.png";
import indigoA320 from "../assets/indigo_a320.png";
import vistara787 from "../assets/vistara_787.png";
import spicejet737 from "../assets/spicejet_737.png";
import goairA320 from "../assets/goair_a320.png";
import airAsiaA320 from "../assets/airasia_a320.png";
import deltaA321 from "../assets/delta_a321.png";
import klm747 from "../assets/klm_747.png";

const FLIGHT_DATA = [
    { id: 1, airline: "Emirates Airways Boeing 777-9X", image: emiratesA350, maxCapacity: 426, fuelCapacity: "162,000 L", maxLoad: "351,500 Kg", avgSpeed: "915 Kmph", manufacturer: "Boeing", duration: "14h 30m", price: 82400, stops: "Non-stop", rating: 4.9, class: "First" },
    { id: 2, airline: "Qatar Airways 777-300ER", image: qatar777, maxCapacity: 396, fuelCapacity: "181,283 L", maxLoad: "347,450 Kg", avgSpeed: "905 Kmph", manufacturer: "Boeing", duration: "13h 45m", price: 74200, stops: "Non-stop", rating: 4.8, class: "Business" },
    { id: 3, airline: "Lufthansa Airbus A340-600", image: lufthansaA340, maxCapacity: 475, fuelCapacity: "155,000 L", maxLoad: "368,000 Kg", avgSpeed: "890 Kmph", manufacturer: "Airbus", duration: "15h 10m", price: 68900, stops: "1 Stop", rating: 4.7, class: "Business" },
    { id: 4, airline: "Etihad Airways Airbus A380", image: etihadA380, maxCapacity: 517, fuelCapacity: "320,000 L", maxLoad: "575,000 Kg", avgSpeed: "900 Kmph", manufacturer: "Airbus", duration: "14h 00m", price: 79500, stops: "Non-stop", rating: 4.8, class: "First" },
    { id: 5, airline: "Air India Boeing 787 Dreamliner", image: airIndia, maxCapacity: 256, fuelCapacity: "126,000 L", maxLoad: "227,930 Kg", avgSpeed: "913 Kmph", manufacturer: "Boeing", duration: "16h 20m", price: 42300, stops: "1 Stop", rating: 4.2, class: "Economy" },
    { id: 6, airline: "IndiGo Airbus A320neo", image: indigoA320, maxCapacity: 180, fuelCapacity: "23,858 L", maxLoad: "73,500 Kg", avgSpeed: "840 Kmph", manufacturer: "Airbus", duration: "2h 45m", price: 5800, stops: "Non-stop", rating: 4.3, class: "Economy" },
    { id: 7, airline: "Vistara Boeing 787-9", image: vistara787, maxCapacity: 299, fuelCapacity: "126,372 L", maxLoad: "252,000 Kg", avgSpeed: "912 Kmph", manufacturer: "Boeing", duration: "3h 10m", price: 12400, stops: "Non-stop", rating: 4.6, class: "Premium" },
    { id: 8, airline: "SpiceJet Boeing 737 MAX 8", image: spicejet737, maxCapacity: 189, fuelCapacity: "20,865 L", maxLoad: "82,190 Kg", avgSpeed: "842 Kmph", manufacturer: "Boeing", duration: "2h 55m", price: 4900, stops: "Non-stop", rating: 4.0, class: "Economy" },
    { id: 9, airline: "Go First Airbus A320neo", image: goairA320, maxCapacity: 186, fuelCapacity: "23,858 L", maxLoad: "78,000 Kg", avgSpeed: "840 Kmph", manufacturer: "Airbus", duration: "3h 00m", price: 4500, stops: "Non-stop", rating: 3.9, class: "Economy" },
    { id: 10, airline: "AirAsia India Airbus A320", image: airAsiaA320, maxCapacity: 180, fuelCapacity: "23,858 L", maxLoad: "77,000 Kg", avgSpeed: "838 Kmph", manufacturer: "Airbus", duration: "3h 15m", price: 3999, stops: "Non-stop", rating: 4.1, class: "Economy" },
    { id: 11, airline: "Delta Airlines Airbus A321", image: deltaA321, maxCapacity: 230, fuelCapacity: "32,940 L", maxLoad: "93,500 Kg", avgSpeed: "840 Kmph", manufacturer: "Airbus", duration: "18h 40m", price: 58700, stops: "1 Stop", rating: 4.5, class: "Business" },
    { id: 12, airline: "KLM Boeing 747", image: klm747, maxCapacity: 524, fuelCapacity: "238,840 L", maxLoad: "447,700 Kg", avgSpeed: "920 Kmph", manufacturer: "Boeing", duration: "17h 55m", price: 63100, stops: "1 Stop", rating: 4.6, class: "Business" }
];

// Logic Utility: Parse "14h 30m" to total minutes for sorting
const parseDuration = (str) => {
    const hours = parseInt(str.match(/(\d+)h/)?.[1] || 0);
    const mins = parseInt(str.match(/(\d+)m/)?.[1] || 0);
    return (hours * 60) + mins;
};

const Flights = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    
    const departure = queryParams.get("departure") || "Origin";
    const destination = queryParams.get("destination") || "Destination";
    const date = queryParams.get("date") || "Select Date";

    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState("All Flights");
    const [sortKey, setSortKey] = useState("Cheapest"); // Logic: New Sort State
    const [expandedCard, setExpandedCard] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    const flightsPerPage = 3;

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // --- ENHANCED LOGIC: FILTERING & SORTING ---
    const processedFlights = useMemo(() => {
        // 1. Filter Logic
        let result = FLIGHT_DATA.filter(flight => {
            if (filter === "All Flights") return true;
            if (filter === "Non-stop" || filter === "1 Stop") return flight.stops === filter;
            if (filter === "First Class") return flight.class === "First";
            return flight.class === filter;
        });

        // 2. Sorting Logic
        const sortMethods = {
            "Cheapest": (a, b) => a.price - b.price,
            "Fastest": (a, b) => parseDuration(a.duration) - parseDuration(b.duration),
            "Best Rated": (a, b) => b.rating - a.rating
        };

        return result.sort(sortMethods[sortKey] || sortMethods["Cheapest"]);
    }, [filter, sortKey]);

    // Pagination Calculation
    const totalPages = Math.ceil(processedFlights.length / flightsPerPage);
    const startIndex = (currentPage - 1) * flightsPerPage;
    const currentFlights = processedFlights.slice(startIndex, startIndex + flightsPerPage);

    useEffect(() => setCurrentPage(1), [filter, sortKey]);

    const handleBookNow = (flight) => {
        const url = `/booking?airline=${encodeURIComponent(flight.airline)}&departure=${departure}&destination=${destination}&date=${date}&price=${flight.price}`;
        navigate(url);
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="flights-page">
            <header className="flights-header">
                <div className="header-overlay"></div>
                <div className="header-content">
                    <Breadcrumbs />
                    <h1 className="header-title">
                        <span className="title-from">{departure}</span>
                        <HeaderArrow />
                        <span className="title-to">{destination}</span>
                    </h1>
                    <div className="header-meta">
                        <MetaPill icon="calendar" text={date} />
                        <MetaPill icon="check" text={`${processedFlights.length} Flights Found`} />
                    </div>
                </div>
                <div className="header-clouds">
                    <div className="cloud c1"></div><div className="cloud c2"></div><div className="cloud c3"></div>
                </div>
            </header>

            <main className="flights-main">
                <div className="filter-bar">
                    <div className="filter-label">Sort By</div>
                    <div className="filter-chips" style={{ marginRight: '24px', borderRight: '1px solid #e2e8f0', paddingRight: '16px' }}>
                        {["Cheapest", "Fastest", "Best Rated"].map(s => (
                            <button 
                                key={s} 
                                className={`chip ${sortKey === s ? "active" : ""}`}
                                onClick={() => setSortKey(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="filter-label">Filters</div>
                    <div className="filter-chips">
                        {["All Flights", "Non-stop", "1 Stop", "Economy", "Business", "First Class"].map(f => (
                            <button 
                                key={f} 
                                className={`chip ${filter === f ? "active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="results-count">
                        Showing {processedFlights.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + flightsPerPage, processedFlights.length)} of {processedFlights.length}
                    </div>
                </div>

                <div className="flight-cards-grid">
                    {currentFlights.map((flight, idx) => (
                        <FlightCard 
                            key={flight.id}
                            flight={flight}
                            idx={idx}
                            departure={departure}
                            destination={destination}
                            isHovered={hoveredCard === flight.id}
                            isExpanded={expandedCard === flight.id}
                            onHover={setHoveredCard}
                            onExpand={setExpandedCard}
                            onBook={handleBookNow}
                        />
                    ))}
                    {processedFlights.length === 0 && <NoResults />}
                </div>

                {totalPages > 1 && (
                    <Pagination 
                        current={currentPage} 
                        total={totalPages} 
                        onChange={setCurrentPage} 
                    />
                )}
            </main>

            <Footer />
        </div>
    );
};

// --- SUB-COMPONENTS (Maintained Pixel-Perfect) ---

const FlightCard = ({ flight, idx, departure, destination, isHovered, isExpanded, onHover, onExpand, onBook }) => {
    const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`star ${i < Math.floor(rating) ? "filled" : i < rating ? "half" : ""}`}>★</span>
    ));

    const getClassBadge = (cls) => {
        const map = { First: "badge-first", Business: "badge-business", Premium: "badge-premium", Economy: "badge-economy" };
        return map[cls] || "badge-economy";
    };

    return (
        <div
            className={`flight-card ${isHovered ? "hovered" : ""} ${isExpanded ? "expanded" : ""}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
            onMouseEnter={() => onHover(flight.id)}
            onMouseLeave={() => onHover(null)}
        >
            <div className="card-image-wrap">
                <img src={flight.image} alt={flight.airline} className="card-image" />
                <div className="card-image-overlay"></div>
                <span className={`class-badge ${getClassBadge(flight.class)}`}>{flight.class}</span>
                <span className="stops-tag">{flight.stops}</span>
            </div>

            <div className="card-body">
                <div className="card-top">
                    <div className="airline-info">
                        <h3 className="airline-name">{flight.airline}</h3>
                        <div className="rating-row">
                            <div className="stars">{renderStars(flight.rating)}</div>
                            <span className="rating-val">{flight.rating}</span>
                        </div>
                    </div>
                    <div className="price-block">
                        <div className="price-label">from</div>
                        <div className="price-value">₹{flight.price.toLocaleString()}</div>
                        <div className="price-sub">per person</div>
                    </div>
                </div>

                <div className="route-timeline">
                    <div className="rt-point"><div className="rt-dot dep"></div><div className="rt-city">{departure}</div></div>
                    <div className="rt-line">
                        <div className="rt-duration">{flight.duration}</div>
                        <div className="rt-track"><div className="rt-plane">✈</div></div>
                    </div>
                    <div className="rt-point right"><div className="rt-dot arr"></div><div className="rt-city">{destination}</div></div>
                </div>

                <div className="specs-grid">
                    <SpecItem icon="🛫" label="Capacity" val={`${flight.maxCapacity} pax`} />
                    <SpecItem icon="⛽" label="Fuel" val={flight.fuelCapacity} />
                    <SpecItem icon="📦" label="Max Load" val={flight.maxLoad} />
                    <SpecItem icon="💨" label="Avg Speed" val={flight.avgSpeed} />
                    <SpecItem icon="🏭" label="Maker" val={flight.manufacturer} />
                </div>

                <div className="card-actions">
                    <button className="details-btn" onClick={() => onExpand(isExpanded ? null : flight.id)}>
                        {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                    <button className="book-btn" onClick={() => onBook(flight)}>
                        <span>Book Now</span>
                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    </button>
                </div>

                <div className="amenities-strip">
                    {["🍽 Meals", "📶 Wi-Fi", "🎬 Entertainment", "🧳 Baggage"].map(a => <span key={a} className="amenity">{a}</span>)}
                </div>
            </div>
        </div>
    );
};

// Helper Components (Maintained)
const SpecItem = ({ icon, label, val }) => (
    <div className="spec-item">
        <div className="spec-icon">{icon}</div>
        <div className="spec-info">
            <div className="spec-label">{label}</div>
            <div className="spec-val">{val}</div>
        </div>
    </div>
);

const Pagination = ({ current, total, onChange }) => (
    <div className="pagination-wrap">
        <button className="pag-btn" disabled={current === 1} onClick={() => onChange(current - 1)}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/></svg>
            Previous
        </button>
        <div className="page-numbers">
            {[...Array(total)].map((_, i) => (
                <button key={i} className={`page-num ${current === i + 1 ? "active-page" : ""}`} onClick={() => onChange(i + 1)}>{i + 1}</button>
            ))}
        </div>
        <button className="pag-btn" disabled={current === total} onClick={() => onChange(current + 1)}>
            Next
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
        </button>
    </div>
);

const MetaPill = ({ icon, text }) => (
    <div className="meta-pill">
        {icon === "calendar" ? (
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" /></svg>
        ) : (
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
        {text}
    </div>
);

const LoadingScreen = () => (
    <div className="loading-screen">
        <div className="loading-content">
            <div className="plane-loader">
                <svg viewBox="0 0 100 100" className="plane-svg">
                    <path d="M10,50 L50,20 L90,50 L50,40 Z" fill="currentColor"/><path d="M35,50 L50,40 L65,50 L50,70 Z" fill="currentColor" opacity="0.6"/>
                </svg>
            </div>
            <div className="loading-bar-wrap"><div className="loading-bar-fill"></div></div>
            <p className="loading-text">Searching best flights for you…</p>
        </div>
    </div>
);

const HeaderArrow = () => (
    <span className="title-arrow">
        <svg viewBox="0 0 80 24" fill="none">
            <path d="M2 12 H60 M48 4 L60 12 L48 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="70" cy="12" r="6" fill="currentColor" opacity="0.3"/>
            <path d="M68 12 L72 9 L74 12 L72 15 Z" fill="currentColor"/>
        </svg>
    </span>
);

const Breadcrumbs = () => (
    <div className="breadcrumb">
        <span>Home</span><span className="bc-sep">›</span><span>Search</span><span className="bc-sep">›</span><span className="bc-active">Available Flights</span>
    </div>
);

const NoResults = () => (
    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#64748b' }}>
        <h3>No flights found for this filter.</h3>
        <p>Try adjusting your sorting or filter selection.</p>
    </div>
);

const Footer = () => (
    <footer className="flights-footer">
        <div className="footer-inner">
            <span>✈ SkyBook — Trusted by 2M+ travelers</span>
            <span>🔒 Secure Booking &nbsp;|&nbsp; 24/7 Support &nbsp;|&nbsp; Free Cancellation</span>
        </div>
    </footer>
);

export default Flights;