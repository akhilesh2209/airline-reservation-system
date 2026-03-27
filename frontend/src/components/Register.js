import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState("");
    const navigate = useNavigate();

    // Password strength logic
    const getStrength = (pw) => {
        if (!pw) return 0;
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const strength = getStrength(password);
    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
    const strengthClass = ["", "rg-str-weak", "rg-str-fair", "rg-str-good", "rg-str-strong"][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Double-submit protection
        if (loading) return;

        // 2. Client-side Validation
        const trimmedUser = username.trim();
        const trimmedEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (trimmedUser.length < 3) {
            setError("Username must be at least 3 characters long.");
            return;
        }

        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (strength < 3) {
            setError("Please choose a stronger password (at least 'Good').");
            return;
        }

        if (!navigator.onLine) {
            setError("No internet connection. Please check your network.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://airline-backend-mrkm.onrender.com/api/auth/register", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ username: trimmedUser, email: trimmedEmail, password }),
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                throw new Error("Server error: invalid response format.");
            }

            if (!response.ok) {
                throw new Error(data.message || "Registration failed. This account may already exist.");
            }

            alert("Registration successful! Please log in.");
            navigate("/login");
        } catch (err) {
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                setError("Unable to connect to the server. Please try again later.");
            } else {
                setError(err.message);
            }
            console.error("Error in Register:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rg-page">

            {/* Left panel — branding */}
            <div className="rg-left">
                <div className="rg-left-overlay"></div>
                <div className="rg-left-content">

                    {/* Logo */}
                    <div className="rg-brand">
                        <div className="rg-brand-icon">
                            <svg viewBox="0 0 32 32" fill="none">
                                <path d="M4 18 L16 6 L28 18 L16 14 Z" fill="currentColor"/>
                                <path d="M11 18 L16 14 L21 18 L16 24 Z" fill="currentColor" opacity="0.55"/>
                            </svg>
                        </div>
                        <div>
                            <div className="rg-brand-name">AirBook</div>
                            <div className="rg-brand-tag">Fly Smarter</div>
                        </div>
                    </div>

                    {/* Hero text */}
                    <div className="rg-left-hero">
                        <h2 className="rg-left-title">Join millions<br/>of travelers.</h2>
                        <p className="rg-left-sub">Create your free AirBook account and unlock access to 500+ destinations, exclusive deals, and seamless booking.</p>
                    </div>

                    {/* Perks list */}
                    <div className="rg-perks">
                        {[
                            { icon: "🎟️", title: "Instant E-Tickets", sub: "Delivered straight to your inbox" },
                            { icon: "🔄", title: "Free Cancellation", sub: "Up to 24h before departure" },
                            { icon: "💰", title: "Best Price Guarantee", sub: "We match any lower fare" },
                            { icon: "🎧", title: "24/7 Support", sub: "Always here when you need us" },
                        ].map((p) => (
                            <div key={p.title} className="rg-perk">
                                <div className="rg-perk-icon">{p.icon}</div>
                                <div className="rg-perk-info">
                                    <div className="rg-perk-title">{p.title}</div>
                                    <div className="rg-perk-sub">{p.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating destinations decoration */}
                    <div className="rg-deco">
                        {["BOM → DXB", "DEL → LHR", "BLR → SIN", "HYD → JFK"].map((route, i) => (
                            <div key={route} className="rg-deco-chip" style={{ animationDelay: `${i * 0.8}s` }}>
                                ✈ {route}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="rg-right">
                <div className="rg-form-wrap">

                    {/* Mobile logo */}
                    <div className="rg-mobile-brand">
                        <div className="rg-brand-icon small">
                            <svg viewBox="0 0 32 32" fill="none">
                                <path d="M4 18 L16 6 L28 18 L16 14 Z" fill="currentColor"/>
                                <path d="M11 18 L16 14 L21 18 L16 24 Z" fill="currentColor" opacity="0.55"/>
                            </svg>
                        </div>
                        <span className="rg-mobile-name">AirBook</span>
                    </div>

                    <div className="rg-form-header">
                        <h1 className="rg-form-title">Create account</h1>
                        <p className="rg-form-sub">Join AirBook and start your journey today</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rg-error-banner">
                            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                            {error}
                        </div>
                    )}

                    <form className="rg-form" onSubmit={handleSubmit}>

                        {/* Username */}
                        <div className={`rg-field ${focusedField === "user" ? "rg-focused" : ""}`}>
                            <label className="rg-label">Username</label>
                            <div className="rg-input-wrap">
                                <span className="rg-icon">
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                                </span>
                                <input
                                    className="rg-input"
                                    type="text"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField("user")}
                                    onBlur={() => setFocusedField("")}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className={`rg-field ${focusedField === "email" ? "rg-focused" : ""}`}>
                            <label className="rg-label">Email Address</label>
                            <div className="rg-input-wrap">
                                <span className="rg-icon">
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                                </span>
                                <input
                                    className="rg-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField("email")}
                                    onBlur={() => setFocusedField("")}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className={`rg-field ${focusedField === "pw" ? "rg-focused" : ""}`}>
                            <label className="rg-label">Password</label>
                            <div className="rg-input-wrap">
                                <span className="rg-icon">
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                                </span>
                                <input
                                    className="rg-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField("pw")}
                                    onBlur={() => setFocusedField("")}
                                    required
                                />
                                <button type="button" className="rg-eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                    {showPassword ? (
                                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                                    ) : (
                                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                                    )}
                                </button>
                            </div>

                            {/* Password strength meter */}
                            {password && (
                                <div className="rg-strength">
                                    <div className="rg-strength-bars">
                                        {[1,2,3,4].map((i) => (
                                            <div key={i} className={`rg-str-bar ${strength >= i ? strengthClass : ""}`}></div>
                                        ))}
                                    </div>
                                    <span className={`rg-str-label ${strengthClass}`}>{strengthLabel}</span>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className={`rg-submit-btn ${loading ? "rg-loading" : ""}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <><div className="rg-spinner"></div>Creating account…</>
                            ) : (
                                <><span>Create Account</span><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg></>
                            )}
                        </button>
                    </form>

                    <div className="rg-divider">
                        <div className="rg-div-line"></div>
                        <span>Already have an account?</span>
                        <div className="rg-div-line"></div>
                    </div>

                    <Link to="/login" className="rg-login-btn">
                        Sign in instead
                    </Link>

                    <p className="rg-terms">
                        By creating an account you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.
                    </p>

                    <div className="rg-trust">
                        <span>🔒 256-bit SSL</span>
                        <span>·</span>
                        <span>✈ 500+ Routes</span>
                        <span>·</span>
                        <span>🎧 24/7 Support</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;