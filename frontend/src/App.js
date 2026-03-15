import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Flights from "./components/Flights";
import Booking from "./components/Booking";
import Navbar from "./components/Navbar";
import MyBookings from "./components/MyBookings"; 
import Payment from "./components/Payment";  
import PaymentDetails from "./components/PaymentDetails";
import AuthProvider from "./context/AuthProvider"; 
import Confirmation from "./components/Confirmation"; 

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    return (
        <AuthProvider>
            <Router>
                <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/flights" element={<Flights />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/mybookings" element={<MyBookings />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/payment-details" element={<PaymentDetails />} />
                    <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
