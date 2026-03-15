import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Logged out successfully!");
        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <nav className="navbar">
            {/* Static Logo - Not Clickable */}
            <div className="logo">
                <span>✈️ <strong>AirBook</strong></span>
            </div>

            <div className="nav-links">
    <Link to="/">Home</Link>
    <Link to="/mybookings">My Bookings</Link>

    {isAuthenticated ? (
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
    ) : (
        <>
            <Link to="/login" className="auth-btn login">Login</Link>
<Link to="/register" className="auth-btn register">Register</Link>
        </>
    )}
</div>
        </nav>
    );
};

export default Navbar;

