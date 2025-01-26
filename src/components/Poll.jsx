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
                setTopVotes(data);
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
            headers: { "Content-Type": "text/plain" }, // Send as plain text
            body: symbol, // Send the symbol as a plain string
        })
            .then((response) => response.json())
            .then(() => {
                setUserVote(symbol);
                // Refresh topVotes
                fetch("https://crypto-poll.onrender.com/cryptos")
                    .then((response) => response.json())
                    .then((data) => setTopVotes(data))
                    .catch((error) =>
                        console.error("Error fetching updated cryptos:", error)
                    );
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
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="text-gray-600 text-lg animate-pulse">Loading cryptos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-10 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden">
                {/* Decorative circle/shape in the background for a fun vibe */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-300 rounded-full opacity-30 animate-ping" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-300 rounded-full opacity-30 animate-ping" />

                {/* Title */}
                <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800 relative z-10">
                    Crypto Poll <span className="inline-block">🚀</span>
                </h1>

                {/* Top 3 Most Voted Coins */}
                <div className="mb-8 relative z-10">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="text-purple-500">🔥</span>
                        Top 3 Most Voted Coins
                    </h2>
                    <div className="space-y-3">
                        {topVotes.slice(0, 3).map((crypto, index) => (
                            <div
                                key={crypto.symbol}
                                className={`flex items-center justify-between p-4 rounded-md shadow-sm transition-transform transform hover:scale-105 ${
                                    index === 0
                                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                                        : index === 1
                                        ? "bg-gradient-to-r from-gray-100 to-gray-200"
                                        : "bg-gradient-to-r from-orange-100 to-orange-200"
                                }`}
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
                    <div className="mb-8 relative z-10">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="text-green-500">✅</span>
                            Your Vote
                        </h2>
                        <p className="text-green-700">
                            You voted for:{" "}
                            <span className="font-bold uppercase">{userVote}</span>
                        </p>
                    </div>
                )}

                {/* Single search bar + dropdown */}
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="text-blue-500">🔍</span>
                        Vote for a Coin
                    </h2>

                    <div
                        className="relative w-full max-w-sm mb-4"
                        ref={dropdownRef}
                    >
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-purple-400 transition-colors duration-200"
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
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-auto shadow-lg">
                                {filteredCryptos.length > 0 ? (
                                    filteredCryptos.map((crypto) => (
                                        <div
                                            key={crypto.symbol}
                                            className="p-2 cursor-pointer hover:bg-purple-50"
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
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-md shadow-md transition-transform duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleVote(selectedCrypto)}
                        disabled={!selectedCrypto}
                    >
                        Cast Vote
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Poll;