import React, { useEffect, useState } from "react";
import axios from "axios";

const Poll = () => {
  const [pollData, setPollData] = useState(null);
  const [userId] = useState(localStorage.getItem("userId") || crypto.randomUUID());
  const [hasVoted, setHasVoted] = useState(false);

  // Fetch poll data from the backend
  const fetchPollData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/poll`);
      setPollData(response.data);
      setHasVoted(response.data.votes.some(vote => vote.user_id === userId));
    } catch (error) {
      console.error("Failed to fetch poll data:", error);
    }
  };

  // Handle voting
  const handleVote = async (symbol) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/vote`, {
        coin_symbol: symbol,
        user_id: userId,
      });
      fetchPollData(); // Refresh poll data after voting
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  // Fetch poll data on component mount
  useEffect(() => {
    localStorage.setItem("userId", userId);
    fetchPollData();
  }, [userId]);

  if (!pollData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Crypto Poll</h1>
      <div className="space-y-4">
        {pollData.coins.map((coin) => (
          <div key={coin.symbol} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{coin.symbol}</span>
              <span className="text-gray-600">Price: ${coin.price}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleVote(coin.symbol)}
                disabled={hasVoted}
                className={`px-4 py-2 rounded ${
                  hasVoted
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Vote
              </button>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-green-500 rounded transition-all"
                    style={{
                      width: `${
                        (pollData.votes[coin.symbol] || 0) /
                        Object.values(pollData.votes).reduce((a, b) => a + b, 0) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {pollData.votes[coin.symbol] || 0} votes (
                  {Object.values(pollData.votes).reduce((a, b) => a + b, 0) > 0
                    ? (
                        ((pollData.votes[coin.symbol] || 0) /
                          Object.values(pollData.votes).reduce((a, b) => a + b, 0)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Poll;