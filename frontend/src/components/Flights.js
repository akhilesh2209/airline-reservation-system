import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Flights.css";
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

const Flights = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const departure = queryParams.get("departure");
    const destination = queryParams.get("destination");
    const date = queryParams.get("date");
    

    // Flight Data with Updated Details (12 flights for pagination)
    const flights = [
        { id: 1, airline: "Emirates Airways Boeing 777-9X", image: emiratesA350, maxCapacity: 426, fuelCapacity: "162,000 L", maxLoad: "351,500 Kg", avgSpeed: "915 Kmph", manufacturer: "Boeing" },
        { id: 2, airline: "Qatar Airways 777-300ER", image: qatar777, maxCapacity: 396, fuelCapacity: "181,283 L", maxLoad: "347,450 Kg", avgSpeed: "905 Kmph", manufacturer: "Boeing" },
        { id: 3, airline: "Lufthansa Airbus A340-600", image: lufthansaA340, maxCapacity: 475, fuelCapacity: "155,000 L", maxLoad: "368,000 Kg", avgSpeed: "890 Kmph", manufacturer: "Airbus" },
        { id: 4, airline: "Etihad Airways Airbus A380", image: etihadA380, maxCapacity: 517, fuelCapacity: "320,000 L", maxLoad: "575,000 Kg", avgSpeed: "900 Kmph", manufacturer: "Airbus" },
        { id: 5, airline: "Air India Boeing 787 Dreamliner", image: airIndia, maxCapacity: 256, fuelCapacity: "126,000 L", maxLoad: "227,930 Kg", avgSpeed: "913 Kmph", manufacturer: "Boeing" },
        { id: 6, airline: "IndiGo Airbus A320neo", image: indigoA320, maxCapacity: 180, fuelCapacity: "23,858 L", maxLoad: "73,500 Kg", avgSpeed: "840 Kmph", manufacturer: "Airbus" },
        { id: 7, airline: "Vistara Boeing 787-9", image: vistara787, maxCapacity: 299, fuelCapacity: "126,372 L", maxLoad: "252,000 Kg", avgSpeed: "912 Kmph", manufacturer: "Boeing" },
        { id: 8, airline: "SpiceJet Boeing 737 MAX 8", image: spicejet737, maxCapacity: 189, fuelCapacity: "20,865 L", maxLoad: "82,190 Kg", avgSpeed: "842 Kmph", manufacturer: "Boeing" },
        { id: 9, airline: "Go First Airbus A320neo", image: goairA320, maxCapacity: 186, fuelCapacity: "23,858 L", maxLoad: "78,000 Kg", avgSpeed: "840 Kmph", manufacturer: "Airbus" },
        { id: 10, airline: "AirAsia India Airbus A320", image: airAsiaA320, maxCapacity: 180, fuelCapacity: "23,858 L", maxLoad: "77,000 Kg", avgSpeed: "838 Kmph", manufacturer: "Airbus" },
        { id: 11, airline: "Delta Airlines Airbus A321", image: deltaA321, maxCapacity: 230, fuelCapacity: "32,940 L", maxLoad: "93,500 Kg", avgSpeed: "840 Kmph", manufacturer: "Airbus" },
        { id: 12, airline: "KLM Boeing 747", image: klm747, maxCapacity: 524, fuelCapacity: "238,840 L", maxLoad: "447,700 Kg", avgSpeed: "920 Kmph", manufacturer: "Boeing" }
    ];

    // Pagination settings
    const flightsPerPage = 3;
    const totalPages = Math.ceil(flights.length / flightsPerPage);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const timer = setTimeout(() => {
    setLoading(false);
}, 1200);

    return () => clearTimeout(timer);
}, []);

    // Get flights for the current page
    const startIndex = (currentPage - 1) * flightsPerPage;
    const currentFlights = flights.slice(startIndex, startIndex + flightsPerPage);

    // Navigate to Booking Page
    const handleBookNow = (flight) => {
        navigate(`/booking?airline=${flight.airline}&departure=${departure}&destination=${destination}&date=${date}`);
    };
if (loading) {
    return (
    <div className="loading">
        <div className="spinner"></div>
        <p>Loading flights...</p>
    </div>
);
}
    return (
        <div className="flights-container">
            <h1 className="flights-title">🚀 Available Flights</h1>
            <p className="flight-info">
                <span className="route">✈️ <strong>From:</strong> {departure} → <strong>To:</strong> {destination}</span>
                <span className="date">📅 <strong>Date:</strong> {date}</span>
            </p>

            <ul className="flight-list">
                {currentFlights.map((flight) => (
                    <li className="flight-card" key={flight.id}>
                        <img src={flight.image} alt={flight.airline} className="flight-image" />
                        <h3 className="flight-name">{flight.airline}</h3>
                        <p><strong>🛫 Max Passenger Capacity:</strong> {flight.maxCapacity}</p>
                        <p><strong>⛽ Fuel Capacity:</strong> {flight.fuelCapacity}</p>
                        <p><strong>📦 Max Load:</strong> {flight.maxLoad}</p>
                        <p><strong>✈ Avg Air Speed:</strong> {flight.avgSpeed}</p>
                        <p><strong>🏭 Manufacturer:</strong> {flight.manufacturer}</p>
                        <button className="book-button" onClick={() => handleBookNow(flight)}>Book Now</button>
                    </li>
                ))}
            </ul>

{/* Pagination Controls */}
<div className="pagination">

<button 
className="pagination-btn"
onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
disabled={currentPage === 1}
>
◀ Prev
</button>

<div className="page-numbers">
{[...Array(totalPages)].map((_, index) => (
<button
key={index}
className={`page-number ${currentPage === index + 1 ? "active-page" : ""}`}
onClick={() => setCurrentPage(index + 1)}
>
{index + 1}
</button>
))}
</div>

<button 
className="pagination-btn"
onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
disabled={currentPage === totalPages}
>
Next ▶
</button>

</div>
        </div>
    );
};

export default Flights;
