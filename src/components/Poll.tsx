import { useEffect, useState } from 'react';
import axios from 'axios';
import Countdown from 'react-countdown';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface Poll {
  id: string;
  title: string;
  options: string[];
  expires_at: string;
  created_at: string;
}

interface VoteResult {
  option_index: number;
  count: number;
}

// Validate environment variable
const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) {
  console.error('REACT_APP_API_URL environment variable is not set');
}

export default function Poll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [error, setError] = useState('');
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (!API_URL) {
      setError('Backend service is not configured properly');
      return;
    }
    fetchPoll();
  }, []);

  const fetchPoll = async () => {
    try {
      const response = await axios.get<Poll>(`${API_URL}/api/polls/current`);
      const pollData = response.data;
      setPoll(pollData);
      checkVoted(pollData.id);
      if (Date.now() > new Date(pollData.expires_at).getTime()) {
        fetchResults();
      }
    } catch (err) {
      setError('No active poll available');
    }
  };

  const checkVoted = (pollId: string) => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    setVoted(!!votedPolls[pollId]);
  };

  const handleVote = async () => {
    if (selectedOption === null || !poll || !API_URL) return;

    try {
      await axios.post(`${API_URL}/api/votes`, {
        option_index: selectedOption
      });

      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
      votedPolls[poll.id] = true;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
      
      setVoted(true);
      fetchResults();
    } catch (err) {
      setError('Failed to submit vote. You may have already voted.');
    }
  };

  const fetchResults = async () => {
    if (!API_URL) return;
    
    try {
      const response = await axios.get<VoteResult[]>(`${API_URL}/api/results`);
      setResults(response.data);
    } catch (err) {
      setError('Failed to load results');
    }
  };

  if (!API_URL) {
    return (
      <div className="text-center p-8 text-red-600">
        Error: Backend service URL not configured
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center p-8 text-gray-600">
        {error || 'Loading poll...'}
      </div>
    );
  }

  const totalVotes = results.reduce((acc, result) => acc + result.count, 0);
  const expiryDate = new Date(poll.expires_at);

  if (isNaN(expiryDate.getTime())) {
    return (
      <div className="text-center p-8 text-red-600">
        Error: Invalid poll expiration date
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          {poll.title}
        </h2>
        <div className="text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-600">
          <Countdown 
            date={expiryDate}
            renderer={({ days, hours, minutes, seconds }) => (
              <span>
                Ends in: {days}d {hours}h {minutes}m {seconds}s
              </span>
            )}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!voted ? (
        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full p-4 text-left rounded-lg transition-all ${
                selectedOption === index
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
          
          <button
            onClick={handleVote}
            disabled={selectedOption === null}
            className={`mt-4 w-full py-3 rounded-lg text-white transition-colors ${
              selectedOption === null 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Submit Vote
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <ChartBarIcon className="w-6 h-6" />
            <span className="text-lg font-semibold">Live Results</span>
          </div>
          
          {poll.options.map((option, index) => {
            const result = results.find(r => r.option_index === index);
            const count = result?.count || 0;
            const percent = totalVotes > 0 ? 
              ((count / totalVotes) * 100).toFixed(1) : 
              '0.0';

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>{option}</span>
                  <span>{percent}% ({count})</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}