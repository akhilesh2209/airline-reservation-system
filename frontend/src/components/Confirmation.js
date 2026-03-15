import React from "react";
import { useNavigate } from "react-router-dom";
import "./Confirmation.css";

const Confirmation = () => {
    const navigate = useNavigate();

    return (
        <div className="confirmation-page">

            <div className="confirmation-container">

                <div className="success-icon">✔</div>

                <h2 className="confirmation-title">
                    Payment Successful!
                </h2>

                <p className="confirmation-text">
                    Thank you for booking your flight. Your payment has been processed successfully.
                </p>

                <p className="confirmation-subtext">
                    You will receive an email confirmation with your ticket details shortly.
                </p>

                <button 
                    className="home-button"
                    onClick={() => navigate("/")}
                >
                    Go to Homepage
                </button>

            </div>

        </div>
    );
};

export default Confirmation;