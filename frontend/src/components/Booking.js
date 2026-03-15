import React, { useState } from "react";            
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";
import countryData from "./countryCodes.json"; 

// Flight seat prices
const seatPrices = {
    platinum: 15000,
    business: 9000,
    economy: 4500,
};

// Sample flight timings for selection
const flightTimings = [
    "08:00 AM",
    "10:00 AM",
    "01:00 PM",
    "03:00 PM",
    "05:00 PM",
];

const initialBookedSeats = []; // Placeholder for booked seats

const Booking = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const departure = queryParams.get("departure");
    const destination = queryParams.get("destination");
    const date = queryParams.get("date");

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    // Phone number validation (7+ digits)
    const validatePhoneNumber = (mobile) => /^[0-9]{7,15}$/.test(mobile);

    
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [numPassengers, setNumPassengers] = useState(1);
    const [passengerSeats, setPassengerSeats] = useState({});
    const [passengerDetails, setPassengerDetails] = useState(
        Array.from({ length: numPassengers }, () => ({ fullName: "", passport: "" }))
    );
    const [contactDetails, setContactDetails] = useState({
         name: "", address: "", mobile: "", email: "", countryCode: "+1" });

    const [errors, setErrors] = useState({ email: "", mobile: "" });
    const [selectedTiming, setSelectedTiming] = useState(flightTimings[0]);
    const [bookedSeats, setBookedSeats] = useState(initialBookedSeats); // Store booked seats
    const [waitingList, setWaitingList] = useState([]); // Manage waiting list

    const seatCategories = {
        platinum: { rows: 2, cols: 6 },
        business: { rows: 4, cols: 6 },
        economy: { rows: 10, cols: 6 },
    };

    // Handle seat click
    const handleSeatClick = (seat) => {
        if (bookedSeats.includes(seat)) {
            const userConfirmed = window.confirm("This seat is already booked. Would you like to join the waiting list?");
            if (userConfirmed) {
                const name = prompt("Please enter your name to join the waiting list:");
                if (name) {
                    setWaitingList((prev) => [...prev, { seat, name }]);
                    alert(`${name}, you have been added to the waiting list for seat ${seat}.`);
                }
            }
            return;
        }

        if (selectedSeats.includes(seat)) {
            setSelectedSeats(selectedSeats.filter((s) => s !== seat));
        } else if (selectedSeats.length < numPassengers) {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    // Handle number of passengers change
    const handleNumPassengersChange = (event) => {
        const count = parseInt(event.target.value);
        setNumPassengers(count);
        setSelectedSeats([]);
        setPassengerSeats({});
        setPassengerDetails(Array.from({ length: count }, () => ({ fullName: "", passport: "" })));
    };

    // Handle input change for passenger details
    const handleInputChange = (index, field, value) => {
        setPassengerDetails((prevDetails) =>
            prevDetails.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
    };

     // Handle contact details change
     const handleContactChange = (field, value) => {
        setContactDetails({ ...contactDetails, [field]: value });

        if (field === "email") {
            setErrors({ ...errors, email: validateEmail(value) ? "" : "Invalid email format" });
        }
        if (field === "mobile") {
            setErrors({ ...errors, mobile: validatePhoneNumber(value) ? "" : "Enter a valid phone number" });
        }
    };

    // Handle booking
    const handleBooking = async () => {
        if (!contactDetails.name || !contactDetails.address || !contactDetails.mobile || !contactDetails.email) {
            alert("Please fill in all contact details.");
            return;
        }
    
        for (let i = 0; i < numPassengers; i++) {
            if (!passengerDetails[i].fullName || !passengerDetails[i].passport || !passengerSeats[i]) {
                alert(`Please complete details for Passenger ${i + 1}.`);
                return;
            }
        }
    
        const totalAmount = selectedSeats.reduce((total, seat) => {
            const category = seat.startsWith("P") ? "platinum"
                : seat.startsWith("B") ? "business"
                : "economy";
            return total + seatPrices[category];
        }, 0);
    
        const bookingData = {
            flight: { 
                departure,
                destination,
                date,
                timing: selectedTiming
            },
            contactDetails,
            passengers: passengerDetails.map((p, i) => ({
                fullName: p.fullName,
                passport: p.passport,
                seat: passengerSeats[i]
            })),
            totalAmount,
            createdAt: new Date()
        };
    
        console.log("Sending booking data:", bookingData); // Debugging Line
    
        try {
            const response = await fetch("https://airline-backend-mrkm.onrender.com/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bookingData)
            });
    
            const result = await response.json();
            console.log("Server Response:", result); // Debugging Line
    
            if (response.ok) {
                alert("Booking successful!");
                setBookedSeats([...bookedSeats, ...selectedSeats]);
                navigate("/payment", { state: bookingData });

            } else {
                alert(`Booking failed: ${result.message}`);
            }
        } catch (error) {
            console.error("Error submitting booking:", error);
            alert("An error occurred while booking. Please check the console for details.");
        }
    };
    

    return (
        <div className="booking-container">
            {/* General Information */}
            <div className="booking-info">
                <h2>👤 General Information</h2>
                <form>
                    <input type="text" placeholder="Full Name" value={contactDetails.name} onChange={(e) => handleContactChange("name", e.target.value)} />
                    <input type="text" placeholder="Address" value={contactDetails.address} onChange={(e) => handleContactChange("address", e.target.value)} />
                    <div className="phone-input">
                        <select value={contactDetails.countryCode} onChange={(e) => handleContactChange("countryCode", e.target.value)}>
                            {countryData.map((country) => (
                                <option key={country.dial_code} value={country.dial_code}>
                                    {country.flag} {country.name} ({country.dial_code})
                                </option>
                            ))}
                        </select>
                        <input type="text" placeholder="Mobile Number" value={contactDetails.mobile} onChange={(e) => handleContactChange("mobile", e.target.value)} />
                    </div>
                    {errors.mobile && <p className="error-message">{errors.mobile}</p>}

                    <input type="email" placeholder="Email" value={contactDetails.email} onChange={(e) => handleContactChange("email", e.target.value)} />
                    {errors.email && <p className="error-message">{errors.email}</p>}

                    <select onChange={handleNumPassengersChange} value={numPassengers}>
                        {[...Array(10).keys()].map((n) => (
                            <option key={n + 1} value={n + 1}>{n + 1}</option>
                        ))}
                    </select>
                </form>
            </div>

            {/* Flight Details */}
            <div className="flight-details">
                <h2>✈ Flight Details</h2>
                <p className="flight-text"><strong>Date:</strong> {date}</p>
                <p className="flight-text"><strong>Departure:</strong> {departure}</p>
                <p className="flight-text"><strong>Arrival:</strong> {destination}</p>
                <label className="flight-time-label">Select Flight Time</label>

<select
    className="flight-time-dropdown"
    onChange={(e) => setSelectedTiming(e.target.value)}
    value={selectedTiming}
>
    {flightTimings.map((timing) => (
        <option key={timing} value={timing}>
            {timing}
        </option>
    ))}
</select>
            </div>

            {/* Seating Plan */}
            <div className="seat-container">
                <h2 className="seat-heading">💺 Seat Selection</h2>
                <div className="seat-legend">

    <div className="legend-item">
        <div className="legend-box available"></div>
        <span>Available</span>
    </div>

    <div className="legend-item">
        <div className="legend-box selected"></div>
        <span>Selected</span>
    </div>

    <div className="legend-item">
        <div className="legend-box booked"></div>
        <span>Booked</span>
    </div>

</div>
<div className="aircraft-front">
    ✈ Front of Aircraft
</div>
                <div className="seating-box">
                    
                    {Object.keys(seatCategories).map((category) => (
                        <div key={category} className="seat-category-container">
                           <h3 className="seat-category">{category.toUpperCase()} (₹{seatPrices[category]}/seat)</h3>
                            <div className="seating-grid">
                                {Array.from({ length: seatCategories[category].rows }, (_, row) => (
                                    <div key={row} className="seat-row">
                                        {Array.from({ length: 3 }, (_, col) => {
                                            const seatNumber = `${category[0].toUpperCase()}${row + 1}${col + 1}`;
                                            return (
                                                <div
                                                    key={seatNumber}
                                                    className={`seat ${selectedSeats.includes(seatNumber) ? "selected" : ""} ${bookedSeats.includes(seatNumber) ? "booked" : ""}`}
                                                    onClick={() => handleSeatClick(seatNumber)}
                                                >
                                                    {seatNumber}
                                                </div>
                                            );
                                        })}
                                        <div className="aisle-number">{row + 1}</div>
                                        {Array.from({ length: 3 }, (_, col) => {
                                            const seatNumber = `${category[0].toUpperCase()}${row + 1}${col + 4}`;
                                            return (
                                                <div
                                                    key={seatNumber}
                                                    className={`seat ${selectedSeats.includes(seatNumber) ? "selected" : ""} ${bookedSeats.includes(seatNumber) ? "booked" : ""}`}
                                                    onClick={() => handleSeatClick(seatNumber)}
                                                >
                                                    {seatNumber}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Passenger Info */}
            <div className="passenger-info">
                <h2>🧍 Passenger Information</h2>
                {passengerDetails.map((passenger, index) => (
                    <div key={index} className="passenger-details">
                        <h3>Passenger {index + 1}</h3>
                        <div className="passenger-field">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={passenger.fullName} 
                                onChange={(e) => handleInputChange(index, "fullName", e.target.value)} 
                            />
                        </div>
                        <div className="passenger-field">
                            <label>Passport Number</label>
                            <input 
                                type="text" 
                                placeholder="Passport Number" 
                                value={passenger.passport} 
                                onChange={(e) => handleInputChange(index, "passport", e.target.value)} 
                            />
                        </div>
                        <div className="passenger-field">
                            <label>Select Seat</label>
                            <select 
                                value={passengerSeats[index] || ""} 
                                onChange={(e) => setPassengerSeats({ ...passengerSeats, [index]: e.target.value })}
                            >
                                <option value="">Select Seat</option>
                                {selectedSeats
    .filter(seat => !Object.values(passengerSeats).includes(seat) || passengerSeats[index] === seat)
    .map((seat) => (
        <option key={seat} value={seat}>{seat}</option>
))}
                            </select>
                        </div>
                    </div>
                ))}
               <div className="booking-summary">

<p className="summary-line">
<strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
</p>

<p className="summary-line">
<strong>Passengers:</strong> {numPassengers}
</p>

<p className="summary-line total-price">
<strong>Total Price:</strong> ₹{
selectedSeats.reduce((total, seat) => {

const category =
seat.startsWith("P") ? "platinum" :
seat.startsWith("B") ? "business" :
"economy";

return total + seatPrices[category];

}, 0)
}
</p>

</div>
                <button className="booking-button" onClick={handleBooking}>Create Booking</button>
            </div>

            {/* Waiting List Info */}
            <div className="waiting-list-info">
                <h2>Waiting List</h2>
                {waitingList.length > 0 ? (
                    <ul>
                        {waitingList.map((entry, index) => (
                            <li key={index}>
                                {entry.name} is waiting for seat {entry.seat}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No one is currently on the waiting list.</p>
                )}
            </div>
        </div>
    );
};

export default Booking;