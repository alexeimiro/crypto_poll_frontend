import React, { useEffect, useState, useRef } from "react";

const Poll = () => {
    const [cryptos, setCryptos] = useState([]);
    const [topVotes, setTopVotes] = useState([]);
    const [userVote, setUserVote] = useState(null);
    const [loading, setLoading] = useState(true);

    // Single "search + select" bar
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCrypto, setSelectedCrypto] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Reference to detect clicks outside the dropdown
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetch("https://crypto-poll.onrender.com/cryptos")
            .then((response) => response.json())
            .then((data) => {
                setCryptos(data);
                setTopVotes(data); // If needed, filter top 3 below
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching cryptos:", error);
                setLoading(false);
            });
    }, []);

    // Filter cryptos based on search term
    const filteredCryptos = cryptos.filter((crypto) =>
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle voting
    const handleVote = (symbol) => {
        if (!symbol) return;

        fetch("https://crypto-poll.onrender.com/vote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol }),
        })
            .then((response) => response.json())
            .then(() => {
                setUserVote(symbol);
                // Refresh topVotes
                fetch("https://crypto-poll.onrender.com/cryptos")
                    .then((response) => response.json())
                    .then((data) => setTopVotes(data))
                    .catch((error) => console.error("Error fetching updated cryptos:", error));
            })
            .catch((error) => console.error("Error voting:", error));
    };

    // Close the dropdown if you click outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-gray-600 text-lg">Loading cryptos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
                {/* Title */}
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                    Crypto Poll
                </h1>

                {/* Top 3 Most Voted Coins */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Top 3 Most Voted Coins
                    </h2>
                    <div className="space-y-3">
                        {topVotes.slice(0, 3).map((crypto) => (
                            <div
                                key={crypto.symbol}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm"
                            >
                                <span className="text-gray-700 font-medium">
                                    {crypto.symbol}
                                </span>
                                <span className="inline-block text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                    {crypto.votes} votes
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Display "Your Vote" only if user has voted */}
                {userVote && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Your Vote
                        </h2>
                        <p className="text-green-600">
                            You voted for:{" "}
                            <span className="font-semibold">{userVote}</span>
                        </p>
                    </div>
                )}

                {/* Single search bar + dropdown */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Vote for a Coin
                    </h2>
                    <div className="relative w-full max-w-sm mb-4" ref={dropdownRef}>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Type to search and select a coin..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setDropdownOpen(true);
                            }}
                            onFocus={() => setDropdownOpen(true)}
                        />
                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-auto">
                                {filteredCryptos.length > 0 ? (
                                    filteredCryptos.map((crypto) => (
                                        <div
                                            key={crypto.symbol}
                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                setSelectedCrypto(crypto.symbol);
                                                setSearchTerm(crypto.symbol);
                                                setDropdownOpen(false);
                                            }}
                                        >
                                            {crypto.symbol}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleVote(selectedCrypto)}
                        disabled={!selectedCrypto}
                    >
                        Vote
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Poll;
