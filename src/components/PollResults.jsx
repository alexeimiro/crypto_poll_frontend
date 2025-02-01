import React, { useState } from 'react';

const PollResults = () => {
  const [pollId, setPollId] = useState('');
  const [pollResults, setPollResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to validate UUID format
  const isValidUuid = (uuid) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  const handleFetchResults = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!pollId.trim()) {
        throw new Error('Please enter a Poll ID');
      }

      if (!isValidUuid(pollId.trim())) {
        throw new Error('Invalid Poll ID format');
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/polls/${pollId}/results`,
        { method: 'GET', headers: { 'Accept': 'application/json' } }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      const contentType = response.headers.get('content-type');
      let errorData;

      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        const textResponse = await response.text();
        errorData = { error: textResponse };
      }

      if (!response.ok) throw new Error(errorData.error || `HTTP error! status: ${response.status}`);

      const data = contentType?.includes('application/json') ? await response.json() : {};

      console.log("Fetched Poll Results:", data); // Log fetched poll results
      setPollResults(data);

    } catch (err) {
      console.error('Poll results fetch error:', err);
      setError(err.message.includes('404') 
        ? `Poll ID ${pollId} not found`
        : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">View Poll Results</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Poll ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded px-3 py-2"
            value={pollId}
            onChange={(e) => setPollId(e.target.value)}
            placeholder="Enter Poll ID"
          />
          <button
            onClick={handleFetchResults}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading || !pollId.trim()}
          >
            {isLoading ? 'Loading...' : 'Get Results'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {pollResults && (
        <div className="mt-6 p-4 border border-gray-200 rounded">
          <h3 className="text-lg font-bold mb-2">Poll Results</h3>
          <p className="mb-3"><strong>Total Votes:</strong> {pollResults.total_votes}</p>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Option</th>
                  <th className="px-4 py-2 text-center">Votes</th>
                  <th className="px-4 py-2 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {pollResults.options.map((option, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{option.text}</td>
                    <td className="px-4 py-2 text-center">{option.votes}</td>
                    <td className="px-4 py-2 text-right">{option.percentage.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollResults;
