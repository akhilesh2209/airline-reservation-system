import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
    const [departure, setDeparture] = useState("");
    const [destination, setDestination] = useState("");
    const [date, setDate] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is logged in
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    const handleSearch = () => {
        if (!isAuthenticated) {
            alert("Please log in to search for flights.");
            navigate("/login");
            return;
        }

        if (!departure || !destination || !date) {
            alert("Please fill in all fields before searching.");
            return;
        }

        // Navigate to flights page with query parameters
        navigate(`/flights?departure=${departure}&destination=${destination}&date=${date}`);
    };

    return (
        <div className="home-container">
            <div className="overlay">
                <div className="home-content">
                    <h2>Find Your Next Adventure</h2>
                    <p>Book flights at the best prices, hassle-free.</p>

                    <div className="search-form">
                        <input
                            type="text"
                            placeholder="Departure City"
                            value={departure}
                            onChange={(e) => setDeparture(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Destination City"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <button onClick={handleSearch}>Search Flights</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
