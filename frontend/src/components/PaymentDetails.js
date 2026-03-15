import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentDetails.css"; // Import updated styles
import { QRCodeCanvas } from "qrcode.react";

const PaymentDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state;
const [isProcessing, setIsProcessing] = useState(false);
    // ✅ Always declare Hooks at the top!
    const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
    bankAccount: "",
});
    // ✅ Prevent early returns from being before Hooks
    if (!stateData || !stateData.bookingData || !stateData.paymentMethod) {
        console.error("❌ Invalid Payment Request: Missing Data");
        return <h2 className="error-message">Invalid Payment Request</h2>;
    }

    const { bookingData, paymentMethod } = stateData;

    const handleChange = (e) => {
    let { name, value } = e.target;

   if (name === "cardNumber") {
    value = value.replace(/\D/g, "").substring(0, 16);

    const groups = value.match(/.{1,4}/g);
    value = groups ? groups.join(" ") : value;
}

    // Format expiry date (MM/YY) with month validation
if (name === "expiryDate") {
    value = value.replace(/\D/g, "");

    if (value.length >= 2) {
        let month = value.substring(0, 2);

        if (parseInt(month) > 12) {
            month = "12";
        }

        value = month + value.substring(2, 4);
    }

    if (value.length >= 3) {
        value = value.replace(/(\d{2})(\d{0,2})/, "$1/$2");
    }

    value = value.substring(0, 5);
}
if (name === "ifsc") {
        value = value.toUpperCase();
   }

    setPaymentInfo({ ...paymentInfo, [name]: value });
};

    const handleSubmit = (e) => {
    e.preventDefault();

    setIsProcessing(true);

    console.log("✅ Payment Details Submitted:", paymentInfo);

    setTimeout(() => {
        navigate("/confirmation", { state: { bookingData, paymentMethod } });
    }, 2000);
};

    return (
        <div className="payment-details-container">
            <h2 className="payment-title">
    📱 Enter <span className="method">{paymentMethod.toUpperCase()}</span> Details
</h2>

            <form onSubmit={handleSubmit} className="payment-form">
                {paymentMethod === "credit-card" && (
                    <>
                        <div className="input-group">
                            <label>Card Number</label>
                            <input
                                type="text"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={paymentInfo.cardNumber}
                                onChange={handleChange}
                                maxLength="19"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Cardholder Name</label>
                            <input
                                type="text"
                                name="cardHolderName"
                                placeholder="Enter Cardholder Name"
                                value={paymentInfo.cardHolderName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="card-row">

    <div className="input-group half">
        <label>Expiry Date</label>
        <input
            type="text"
            name="expiryDate"
            placeholder="MM/YY"
            value={paymentInfo.expiryDate}
            onChange={handleChange}
            maxLength="5"
            required
        />
    </div>

    <div className="input-group half">
        <label>CVV</label>
        <input
            type="password"
            name="cvv"
            placeholder="XXX"
            value={paymentInfo.cvv}
            onChange={handleChange}
            maxLength="3"
            required
        />
    </div>

</div>
                    </>
                )}

               {paymentMethod === "upi" && (
    <div className="upi-section">

        <h3 className="scan-title">
📱 Scan & Pay ₹{bookingData.totalAmount}
</h3>

        <div className="upi-qr">
            <QRCodeCanvas
                value="upi://pay?pa=airbook@upi&pn=AirBook&cu=INR"
                size={180}
            />
        </div>

        <p className="or-text">OR</p>

        <div className="input-group">
            <label>Enter UPI ID</label>
            <input
                type="text"
                name="upiId"
                placeholder="yourname@upi"
                value={paymentInfo.upiId}
                onChange={handleChange}
                required
            />
        </div>

        <p className="upi-hint">
            Examples: name@okaxis | name@ybl | name@paytm
        </p>

    </div>
)}

                {paymentMethod === "bank-transfer" && (
    <div className="bank-section">

        <h3 className="bank-title">🏦 Bank Transfer Payment</h3>

        <div className="input-group">
            <label>Account Holder Name</label>
            <input
                type="text"
                name="accountHolder"
                placeholder="Enter Account Holder Name"
                onChange={handleChange}
                required
            />
        </div>

        <div className="input-group">
            <label>Bank Name</label>
            <input
                type="text"
                name="bankName"
                placeholder="Enter Bank Name"
                onChange={handleChange}
                required
            />
        </div>

        <div className="input-group">
            <label>Account Number</label>
            <input
                type="text"
                name="bankAccount"
                placeholder="Enter Account Number"
                value={paymentInfo.bankAccount}
                onChange={handleChange}
                required
            />
        </div>

        <div className="input-group">
            <label>IFSC Code</label>
            <input
                type="text"
                name="ifsc"
                placeholder="Example: SBIN0001234"
                onChange={handleChange}
                required
            />
        </div>

        <p className="bank-note">
            🔒 Your bank details are securely encrypted.
        </p>

    </div>
)}

                <button 
    type="submit" 
    className="confirm-payment-btn"
    disabled={isProcessing}
>
    {isProcessing ? "Processing..." : "Submit Payment"}
</button>
            </form>
        </div>
    );
};

export default PaymentDetails;


