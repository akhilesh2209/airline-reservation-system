import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState("");
    const navigate = useNavigate();

    // Helper to validate email format before sending to server
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Prevent double submission
        if (loading) return;

        // 2. Client-side validation
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setError("Please enter both email and password.");
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        // 3. Network availability check
        if (!navigator.onLine) {
            setError("No internet connection. Please check your network.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://airline-backend-mrkm.onrender.com/api/auth/login", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email: trimmedEmail, password }),
            });

            // 4. Handle non-JSON or empty responses
            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                throw new Error("Server returned an invalid format. Please try again later.");
            }

            console.log("Server Response:", data);

            if (!response.ok) {
                // Handle specific status codes if needed
                if (response.status === 401) {
                    throw new Error("Invalid email or password.");
                } else if (response.status >= 500) {
                    throw new Error("Server error. Please try again in a few minutes.");
                }
                throw new Error(data.message || "Login failed. Please try again.");
            }

            // 5. Safe token handling
            if (data.token) {
                localStorage.setItem("token", data.token);
                setIsAuthenticated(true);
                navigate("/");
            } else {
                throw new Error("Login successful, but no session token received.");
            }

        } catch (err) {
            // 6. Detailed error logging for debugging, user-friendly message for UI
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                setError("Unable to connect to the server. The service might be down.");
            } else {
                setError(err.message || "An unexpected error occurred.");
            }
            console.error("Error in Login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lg-page">

            {/* Left panel — branding */}
            <div className="lg-left">
                <div className="lg-left-overlay"></div>
                <div className="lg-left-content">
                    <div className="lg-brand">
                        <div className="lg-brand-icon">
                            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 18 L16 6 L28 18 L16 14 Z" fill="currentColor"/>
                                <path d="M11 18 L16 14 L21 18 L16 24 Z" fill="currentColor" opacity="0.55"/>
                            </svg>
                        </div>
                        <div>
                            <div className="lg-brand-name">AirBook</div>
                            <div className="lg-brand-tag">Fly Smarter</div>
                        </div>
                    </div>

                    <div className="lg-left-hero">
                        <h2 className="lg-left-title">Your world<br/>is waiting.</h2>
                        <p className="lg-left-sub">Sign in to access your bookings, manage trips, and discover new destinations.</p>
                    </div>

                    <div className="lg-left-stats">
                        <div className="lg-ls-item">
                            <div className="lg-ls-val">500+</div>
                            <div className="lg-ls-label">Destinations</div>
                        </div>
                        <div className="lg-ls-div"></div>
                        <div className="lg-ls-item">
                            <div className="lg-ls-val">2M+</div>
                            <div className="lg-ls-label">Travelers</div>
                        </div>
                        <div className="lg-ls-div"></div>
                        <div className="lg-ls-item">
                            <div className="lg-ls-val">4.9★</div>
                            <div className="lg-ls-label">Rating</div>
                        </div>
                    </div>

                    {/* Floating boarding pass decoration */}
                    <div className="lg-deco-pass">
                        <div className="lg-dp-header">
                            <span>BOM</span>
                            <span className="lg-dp-plane">✈</span>
                            <span>DXB</span>
                        </div>
                        <div className="lg-dp-body">
                            <div>
                                <div className="lg-dp-label">Passenger</div>
                                <div className="lg-dp-val">John Traveler</div>
                            </div>
                            <div>
                                <div className="lg-dp-label">Seat</div>
                                <div className="lg-dp-val">12A</div>
                            </div>
                            <div>
                                <div className="lg-dp-label">Gate</div>
                                <div className="lg-dp-val">B7</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="lg-right">
                <div className="lg-form-wrap">

                    {/* Mobile logo */}
                    <div className="lg-mobile-brand">
                        <div className="lg-brand-icon small">
                            <svg viewBox="0 0 32 32" fill="none">
                                <path d="M4 18 L16 6 L28 18 L16 14 Z" fill="currentColor"/>
                                <path d="M11 18 L16 14 L21 18 L16 24 Z" fill="currentColor" opacity="0.55"/>
                            </svg>
                        </div>
                        <span className="lg-mobile-name">AirBook</span>
                    </div>

                    <div className="lg-form-header">
                        <h1 className="lg-form-title">Welcome back</h1>
                        <p className="lg-form-sub">Sign in to your account to continue</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="lg-error-banner">
                            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                            {error}
                        </div>
                    )}

                    <form className="lg-form" onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className={`lg-field ${focusedField === "email" ? "lg-focused" : ""} ${email ? "lg-has-val" : ""}`}>
                            <label className="lg-label">Email Address</label>
                            <div className="lg-input-wrap">
                                <span className="lg-icon">
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                                </span>
                                <input
                                    className="lg-input"
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
                        <div className={`lg-field ${focusedField === "password" ? "lg-focused" : ""} ${password ? "lg-has-val" : ""}`}>
                            <label className="lg-label">Password</label>
                            <div className="lg-input-wrap">
                                <span className="lg-icon">
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                                </span>
                                <input
                                    className="lg-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField("")}
                                    required
                                />
                                <button
                                    type="button"
                                    className="lg-eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                                    ) : (
                                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className={`lg-submit-btn ${loading ? "lg-loading" : ""}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <><div className="lg-spinner"></div>Signing in…</>
                            ) : (
                                <><span>Sign In</span><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg></>
                            )}
                        </button>
                    </form>

                    <div className="lg-divider">
                        <div className="lg-div-line"></div>
                        <span>New to AirBook?</span>
                        <div className="lg-div-line"></div>
                    </div>

                    <Link to="/register" className="lg-register-btn">
                        Create an account
                    </Link>

                    <div className="lg-trust">
                        <span>🔒 256-bit SSL</span>
                        <span>·</span>
                        <span>✈ 2M+ Travelers</span>
                        <span>·</span>
                        <span>🎧 24/7 Support</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;