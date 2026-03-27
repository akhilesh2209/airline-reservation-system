import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // Optimized scroll listener
    useEffect(() => {
        const onScroll = () => {
            const isScrolled = window.scrollY > 12;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [scrolled]);

    // Close menu on route change or screen resize
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Robust logout handler
    const handleLogout = useCallback(() => {
        try {
            // Clear all auth related storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // Reset state
            setIsAuthenticated(false);
            setMenuOpen(false);
            
            // Redirect to home or login
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
            // Fallback navigation
            navigate("/");
        }
    }, [setIsAuthenticated, navigate]);

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className={`nb-nav ${scrolled ? "nb-scrolled" : ""}`}>

                {/* Logo */}
                <div className="nb-logo" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
                    <div className="nb-logo-icon">
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 18 L16 6 L28 18 L16 14 Z" fill="currentColor"/>
                            <path d="M11 18 L16 14 L21 18 L16 24 Z" fill="currentColor" opacity="0.55"/>
                        </svg>
                    </div>
                    <div className="nb-logo-text">
                        <span className="nb-logo-name">AirBook</span>
                        <span className="nb-logo-tagline">Fly Smarter</span>
                    </div>
                </div>

                {/* Desktop links */}
                <div className="nb-links">
                    <Link to="/" className={`nb-link ${isActive("/") ? "nb-link-active" : ""}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                        Home
                    </Link>
                    <Link to="/mybookings" className={`nb-link ${isActive("/mybookings") ? "nb-link-active" : ""}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                        My Bookings
                    </Link>
                </div>

                {/* Auth area */}
                <div className="nb-auth">
                    {isAuthenticated ? (
                        <button className="nb-logout" onClick={handleLogout}>
                            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
                            Logout
                        </button>
                    ) : (
                        <div className="nb-auth-btns">
                            <Link to="/login" className="nb-login">
                                Login
                            </Link>
                            <Link to="/register" className="nb-register">
                                Register
                                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className={`nb-hamburger ${menuOpen ? "nb-ham-open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>

            {/* Mobile drawer */}
            <div className={`nb-drawer ${menuOpen ? "nb-drawer-open" : ""}`}>
                <div className="nb-drawer-inner">
                    <Link to="/" className={`nb-drawer-link ${isActive("/") ? "active" : ""}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                        Home
                    </Link>
                    <Link to="/mybookings" className={`nb-drawer-link ${isActive("/mybookings") ? "active" : ""}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                        My Bookings
                    </Link>
                    <div className="nb-drawer-divider"></div>
                    {isAuthenticated ? (
                        <button className="nb-drawer-logout" onClick={handleLogout}>
                            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
                            Logout
                        </button>
                    ) : (
                        <div className="nb-drawer-auth">
                            <Link to="/login" className="nb-drawer-login">Login</Link>
                            <Link to="/register" className="nb-drawer-reg">Register</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile overlay */}
            {menuOpen && <div className="nb-overlay" onClick={() => setMenuOpen(false)} />}
        </>
    );
};

export default Navbar;