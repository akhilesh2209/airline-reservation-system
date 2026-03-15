import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingData = location.state;

    console.log("Received bookingData:", bookingData); // ✅ Debugging log

    const [paymentMethod, setPaymentMethod] = useState("");
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [flightNumber, setFlightNumber] = useState(null);

    useEffect(() => {
        // Generate flight number only once when the component mounts
        setFlightNumber(Math.floor(Math.random() * 900 + 100));
    }, []);

    if (!bookingData || !bookingData.passengers || bookingData.passengers.length === 0) {
        return <h2>No booking details found!</h2>;
    }

    const { passengers, flight, totalAmount } = bookingData;

    // Function to calculate new time
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

    const boardingTime = calculateTime(flight.timing, -45); // 45 minutes before departure
    const estimatedArrival = calculateTime(flight.timing, 240); // 4 hours after departure

    const handlePayment = () => {
        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }
    
        // ✅ Set payment confirmed before navigating
        setIsPaymentConfirmed(true);
    
        setTimeout(() => {
            navigate("/payment-details", {
                state: {
                    bookingData,  
                    paymentMethod, 
                },
            });
        }, 2000); // Simulate processing delay
    };
    

    return (
        <div className="payment-container">
            <h2 className="payment-title">Payment Section</h2>
           <div className="booking-summary-box">

<h3>🧾 Booking Summary</h3>

<div className="summary-grid">

<div>
<p><strong>Route:</strong> {flight.departure} → {flight.destination}</p>
<p><strong>Date:</strong> {flight.date}</p>
</div>

<div>
<p><strong>Passengers:</strong> {passengers.length}</p>
<p><strong>Seats:</strong> {passengers.map(p => p.seat).join(", ")}</p>
</div>

</div>

</div>
            <div className="boarding-pass-container">
                {passengers.map((passenger, index) => (
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
                            <div className="info-row">
                                <span><strong>Passenger:</strong> {passenger.fullName}</span>
                                <span><strong>Class:</strong> {passenger.seat[0] === "P" ? "Platinum" : passenger.seat[0] === "B" ? "Business" : "Economy"}</span>
                            </div>
                            <div className="info-row">
                                <span><strong>Departure:<p></p></strong> {flight.timing}</span>
                                <span><strong>Seat:</strong> {passenger.seat}</span>
                            </div>
                            <div className="info-row">
                                <span><strong>Estimate Arrive:<p></p></strong> {estimatedArrival}</span>
                                <span><strong>Flight:<p></p></strong> {flightNumber}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="total-amount">Total Amount: ₹{totalAmount}</h2>
<div className="secure-payment">
    🔒 Secure Payment
    <p>All transactions are encrypted</p>
</div>
<div className="payment-divider"></div>

            <div className="payment-method-container">
    <h3>Select Payment Method</h3>

    <div className="payment-options">

        <div
            className={`payment-option ${paymentMethod === "credit-card" ? "active" : ""}`}
            onClick={() => setPaymentMethod("credit-card")}
        >
            💳 Credit Card
        </div>

        <div
            className={`payment-option ${paymentMethod === "upi" ? "active" : ""}`}
            onClick={() => setPaymentMethod("upi")}
        >
            📱 UPI
        </div>

        <div
            className={`payment-option ${paymentMethod === "bank-transfer" ? "active" : ""}`}
            onClick={() => setPaymentMethod("bank-transfer")}
        >
            🏦 Bank Transfer
        </div>

    </div>
</div>

            <button className="confirm-payment" onClick={handlePayment}>
                Confirm Payment
            </button>

            {isPaymentConfirmed && (
                <div className="payment-confirmation">
                    <h3>Payment Confirmed!</h3>
                    <p>Thank you for your booking. You will receive an email confirmation shortly.</p>
                </div>
            )}
        </div>
    );
};

export default Payment;