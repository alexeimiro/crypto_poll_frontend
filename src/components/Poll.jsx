import React, { useEffect, useState } from 'react';

const Poll = () => {
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch('/api/polls/current');
        if (!response.ok) throw new Error('Failed to fetch poll');
        const pollData = await response.json();
        
        if (pollData) {
          setPoll(pollData);
          const isExpired = new Date(pollData.expires_at) < new Date();
          const voted = localStorage.getItem(`voted_${pollData.id}`);

          if (isExpired || voted) {
            fetchResults();
            setHasVoted(true);
          }
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPoll();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      if (!response.ok) throw new Error('Failed to fetch results');
      const resultsData = await response.json();
      setResults(resultsData);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleVote = async (optionIndex) => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_index: optionIndex }),
      });

      if (!response.ok) throw new Error('Vote failed');
      
      localStorage.setItem(`voted_${poll.id}`, 'true');
      setHasVoted(true);
      fetchResults();
    } catch (error) {
      setError(error.message);
    }
  };

  if (!poll) return <div>Loading poll...</div>;

  const isExpired = new Date(poll.expires_at) < new Date();
  const options = poll.options || [];

  return (
    <div className="poll">
      <h2>{poll.title}</h2>
      {isExpired && <div className="expired-notice">This poll has closed</div>}

      {error && <div className="error">{error}</div>}

      {!isExpired && !hasVoted ? (
        <div className="voting-options">
          {options.map((option, index) => (
            <button
              key={index}
              className="vote-btn"
              onClick={() => handleVote(index)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="results">
          <h3>Results:</h3>
          {options.map((option, index) => {
            const count = results.find(r => r[0] === index)?.[1] || 0;
            return (
              <div key={index} className="result-item">
                <div className="option-label">{option}</div>
                <div className="vote-count">{count} votes</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Poll;