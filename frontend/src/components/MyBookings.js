import React, { useState, useEffect } from "react";
import "./MyBookings.css";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/bookings")
            .then((res) => res.json())
            .then((data) => setBookings(data))
            .catch((error) => console.error("Error fetching bookings:", error));
    }, []);

    const handleCancelBooking = async (bookingId) => {
        const confirmDelete = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/bookings/${bookingId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Booking cancelled successfully!");
                setBookings(bookings.filter((booking) => booking._id !== bookingId));
            } else {
                alert("Failed to cancel booking.");
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            alert("An error occurred while canceling the booking.");
        }
    };

    // Function to calculate new time (same as in Payment.js)
    const calculateTime = (time, minutesToAdd) => {
        const [timePart, period] = time.split(" ");
        let [hours, minutes] = timePart.split(":").map(Number);

        // Convert to 24-hour format
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        // Adjust total minutes
        let totalMinutes = hours * 60 + minutes + minutesToAdd;

        // Handle wrap-around cases
        if (totalMinutes < 0) totalMinutes += 24 * 60;
        if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;

        // Convert back to hours and minutes
        let newHours = Math.floor(totalMinutes / 60) % 24;
        let newMinutes = totalMinutes % 60;

        // Determine AM/PM
        let newPeriod = newHours >= 12 ? "PM" : "AM";
        newHours = newHours % 12;
        newHours = newHours === 0 ? 12 : newHours; // Handle 12 AM/PM cases

        return `${newHours}:${newMinutes.toString().padStart(2, "0")} ${newPeriod}`;
    };

    return (
        <div className="my-bookings-container">
            <h2 className="my-bookings-title">My Bookings</h2>

            {bookings.length === 0 ? (
                <div className="no-bookings">
✈ No bookings yet
<p>Book a flight to see it here.</p>
</div>
            ) : (
                bookings.map((booking, index) => {
                    const { passengers, flight } = booking;

                    if (!flight) {
                        return <p key={index}>Flight details not available</p>;
                    }

                    const boardingTime = calculateTime(flight.timing, -45); // 45 min before departure
                    const estimatedArrival = calculateTime(flight.timing, 240); // 4 hours after departure
                    const flightNumber = booking._id.slice(-3).toUpperCase();

                    return (
                        <div key={index} className="boarding-pass">
                            <div className="route-header">
                                <span className="airport-code">{flight.departure}</span>
                                <span className="plane-icon">✈</span>
                                <span className="airport-code">{flight.destination}</span>
                            </div>

                            <div className="boarding-pass-header">
                                <span className="date">Date: {flight.date}</span>
                                <span className="boarding-time">Boarding: {boardingTime}</span>
                            </div>

                            <div className="boarding-pass-body">
                                
                                {passengers.map((passenger, idx) => (
                                    <div key={idx} className="passenger-row">
<p><strong>Passenger:</strong> {passenger.fullName}</p>
<p><strong>Class:</strong> {passenger.seat[0] === "P" ? "Platinum" : passenger.seat[0] === "B" ? "Business" : "Economy"}</p>
<p><strong>Seat:</strong> {passenger.seat}</p>
</div>
                                ))}
                                <div className="flight-row">
<p><strong>Departure</strong><br/>{flight.timing}</p>
<p><strong>Arrival</strong><br/>{estimatedArrival}</p>
<p><strong>Flight</strong><br/>{flightNumber}</p>
</div>
                            </div>

                            <div className="booking-actions">
                                <button
className="print-button"
onClick={(e) => {

const ticket = e.currentTarget.closest(".boarding-pass");

const printWindow = window.open("", "", "width=800,height=600");

printWindow.document.write(`
<html>
<head>
<title>Boarding Pass</title>
<style>
body{
font-family: Arial, sans-serif;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
background:#f5f5f5;
}

.booking-actions{
display:none;
}

.boarding-pass{
width:420px;
background:white;
border-radius:12px;
box-shadow:0 5px 15px rgba(0,0,0,0.15);
overflow:hidden;
}

.route-header{
background:#ff5722;
color:white;
text-align:center;
padding:15px;
font-weight:bold;
}

.boarding-pass-header{
background:#b71c1c;
color:white;
display:flex;
justify-content:space-between;
padding:10px 20px;
font-weight:bold;
}

.boarding-pass-body{
background:#e0e0e0;
padding:20px;
}

.passenger-row,
.flight-row{
display:flex;
justify-content:space-between;
margin-bottom:8px;
}
</style>
</head>
<body>

${ticket.outerHTML}

</body>
</html>
`);

printWindow.document.close();
printWindow.focus();
printWindow.print();
printWindow.close();

}}
>
Print
</button>
                                <button className="cancel-button" onClick={() => handleCancelBooking(booking._id)}>Cancel Booking</button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MyBookings;
