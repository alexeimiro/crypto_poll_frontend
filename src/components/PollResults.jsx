import React, { useState } from "react";

const PollResults = () => {
  const [pollId, setPollId] = useState("");
  const [pollResults, setPollResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFetchResults = async () => {
    setError(null);
    setPollResults(null);

    if (!pollId) {
      setError("Please enter a Poll ID.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/polls/${pollId}/results`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setPollResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">View Poll Results</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Poll ID</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={pollId}
          onChange={(e) => setPollId(e.target.value)}
          placeholder="Enter Poll ID"
        />
      </div>
      <button
        onClick={handleFetchResults}
        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
      >
        Get Results
      </button>

      {error && (
        <p className="text-red-500 font-medium mt-4">
          Error fetching results: {error}
        </p>
      )}

      {pollResults && (
        <div className="mt-6 p-4 border border-gray-200 rounded">
          <h3 className="text-lg font-bold mb-2">Poll Results:</h3>
          <p>
            <strong>Total Votes:</strong> {pollResults.total_votes}
          </p>
          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr>
                <th className="border px-4 py-2">Option</th>
                <th className="border px-4 py-2">Votes</th>
                <th className="border px-4 py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {pollResults.options.map((option, idx) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">{option.text}</td>
                  <td className="border px-4 py-2">{option.votes}</td>
                  <td className="border px-4 py-2">
                    {option.percentage.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PollResults;
