// src/components/Poll.jsx
import React, { useEffect, useState } from "react";

const Poll = () => {
  const [poll, setPoll] = useState(null);
  const [vote, setVote] = useState(-1);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not defined. Please set it in your .env file.");
        }

        const response = await fetch(`${apiUrl}/api/polls/current`);
        if (!response.ok) {
          throw new Error("No active poll");
        }
        const data = await response.json();
        setPoll(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchResults = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not defined. Please set it in your .env file.");
        }

        const response = await fetch(`${apiUrl}/api/results`);
        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPoll();
    fetchResults();
  }, []);

  const handleVote = async (optionIndex) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not defined. Please set it in your .env file.");
      }

      const response = await fetch(`${apiUrl}/api/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ option_index: optionIndex }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }

      alert("Vote submitted successfully!");
      setVote(optionIndex);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!poll) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{poll.title}</h2>
      <ul>
        {poll.options?.map((option, index) => (
          <li key={index} className="mb-4">
            <button
              type="button"
              onClick={() => handleVote(index)}
              disabled={vote !== -1 || vote === index}
              className={`w-full px-4 py-2 border rounded-md ${
                vote === index
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-4">Results</h3>
      <ul>
        {poll.options?.map((option, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <span>{option}</span>
            <span>
              {results.find((r) => r[0] === index)?.[1] || 0} votes
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Poll;