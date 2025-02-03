import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Countdown from 'react-countdown';
import { ChartBarIcon } from '@heroicons/react/24/outline';

// Type definitions
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

interface ApiError {
  message: string;
}

// Constants
const API_URL = process.env.REACT_APP_API_URL;
const LOCAL_STORAGE_KEY = 'votedPolls';

// Helper functions
const getVotedPolls = (): Record<string, boolean> =>
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');

const hasVoted = (pollId: string): boolean =>
  !!getVotedPolls()[pollId];

const markAsVoted = (pollId: string): void => {
  const votedPolls = getVotedPolls();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
    ...votedPolls,
    [pollId]: true,
  }));
};

// API Client
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

const fetchCurrentPoll = async (): Promise<Poll> => {
  const response = await apiClient.get<Poll>('/api/polls/current');
  return response.data;
};

const submitVote = async (optionIndex: number): Promise<void> => {
  await apiClient.post('/api/votes', { 
    option_index: optionIndex 
  }, {
    headers: {
      'X-Forwarded-For': window.remoteAddress || '',
      'X-Real-IP': window.remoteAddress || ''
    }
  });
};

const fetchResults = async (): Promise<VoteResult[]> => {
  const response = await apiClient.get<VoteResult[]>('/api/results');
  return response.data;
};

export default function Poll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [error, setError] = useState<string>('');
  const [voted, setVoted] = useState<boolean>(false);

  const loadPollData = useCallback(async () => {
    try {
      const pollData = await fetchCurrentPoll();
      setPoll(pollData);
      setVoted(hasVoted(pollData.id));

      if (Date.now() > new Date(pollData.expires_at).getTime()) {
        const resultsData = await fetchResults();
        setResults(resultsData);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to load poll data');
    }
  }, []);

  useEffect(() => {
    if (!API_URL) {
      setError('Backend service is not configured properly');
      return;
    }
    loadPollData();
  }, [loadPollData]);

  const handleVote = async () => {
    if (selectedOption === null || !poll) return;

    try {
      await submitVote(selectedOption);
      markAsVoted(poll.id);
      setVoted(true);
      
      const resultsData = await fetchResults();
      setResults(resultsData);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.message 
        || 'Vote submission failed. Please try again.';
      
      setError(errorMessage);
      
      if (axiosError.response?.status === 409) {
        markAsVoted(poll.id);
        setVoted(true);
        loadPollData();
      }
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

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{poll.title}</h2>
        <div className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
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
        <div className="space-y-4">
          {poll.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full py-3 px-4 rounded-full border-2 transition-all 
                ${selectedOption === index 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
            >
              {option}
            </button>
          ))}

          <button 
            onClick={handleVote}
            disabled={selectedOption === null}
            className={`mt-4 w-full py-3 rounded-full font-semibold transition-colors 
              ${selectedOption === null 
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Submit Vote
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
            <ChartBarIcon className="w-8 h-8" />
            <span className="text-xl font-bold">Live Results</span>
          </div>

          {poll.options.map((option, index) => {
            const result = results.find(r => r.option_index === index);
            const count = result?.count || 0;
            const percent = totalVotes > 0 
              ? ((count / totalVotes) * 100).toFixed(1) 
              : '0.0';

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>{option}</span>
                  <span>{percent}% ({count})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
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