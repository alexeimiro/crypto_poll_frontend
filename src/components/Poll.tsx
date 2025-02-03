import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Countdown from 'react-countdown';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import config from '../config';

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
const API_URL = config.API_URL || process.env.REACT_APP_API_URL;
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
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const fetchCurrentPoll = async (): Promise<Poll> => {
  const response = await apiClient.get<Poll>('/api/polls/current');
  return response.data;
};

const submitVote = async (optionIndex: number): Promise<void> => {
  await apiClient.post('/api/votes', { option_index: optionIndex });
};

const fetchResults = async (): Promise<VoteResult[]> => {
  const response = await apiClient.get<VoteResult[]>('/api/results');
  return response.data;
};

// Main Poll Component
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

      // If poll expired, show results immediately
      if (Date.now() > new Date(pollData.expires_at).getTime()) {
        const resultsData = await fetchResults();
        setResults(resultsData);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data.message || 'Failed to load poll data');
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

      // Optionally, refresh the results after voting
      const resultsData = await fetchResults();
      setResults(resultsData);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data.message || 'Vote submission failed');
    }
  };

  // Render error helper
  const renderError = (message: string) => (
    <div className="text-center p-8 text-red-600">
      {message}
    </div>
  );

  if (!API_URL) return renderError('Backend service URL not configured');
  if (!poll) return renderError(error || 'Loading poll...');

  return (
    <PollContainer
      poll={poll}
      error={error}
      voted={voted}
      results={results}
      selectedOption={selectedOption}
      onSelectOption={setSelectedOption}
      onSubmitVote={handleVote}
    />
  );
}

// PollContainer and Sub–components

interface PollContainerProps {
  poll: Poll;
  error: string;
  voted: boolean;
  results: VoteResult[];
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  onSubmitVote: () => void;
}

const PollContainer = ({
  poll,
  error,
  voted,
  results,
  selectedOption,
  onSelectOption,
  onSubmitVote
}: PollContainerProps) => {
  const totalVotes = results.reduce((acc, result) => acc + result.count, 0);
  const expiryDate = new Date(poll.expires_at);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-2xl">
      <PollHeader title={poll.title} expiryDate={expiryDate} />

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!voted ? (
        <VotingOptions
          options={poll.options}
          selectedOption={selectedOption}
          onSelect={onSelectOption}
          onSubmit={onSubmitVote}
        />
      ) : (
        <ResultsDisplay options={poll.options} results={results} totalVotes={totalVotes} />
      )}
    </div>
  );
};

const PollHeader = ({ title, expiryDate }: { title: string; expiryDate: Date }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    <CountdownTimer expiryDate={expiryDate} />
  </div>
);

const CountdownTimer = ({ expiryDate }: { expiryDate: Date }) => (
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
);

const VotingOptions = ({
  options,
  selectedOption,
  onSelect,
  onSubmit
}: {
  options: string[];
  selectedOption: number | null;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}) => (
  <div className="space-y-4">
    {options.map((option, index) => (
      <button
        key={index}
        onClick={() => onSelect(index)}
        className={`w-full py-3 px-4 rounded-full border-2 transition-all 
          ${selectedOption === index 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`
        }
      >
        {option}
      </button>
    ))}

    <button 
      onClick={onSubmit}
      disabled={selectedOption === null}
      className={`mt-4 w-full py-3 rounded-full font-semibold transition-colors 
        ${selectedOption === null 
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'}`
      }
    >
      Submit Vote
    </button>
  </div>
);

const ResultsDisplay = ({
  options,
  results,
  totalVotes
}: {
  options: string[];
  results: VoteResult[];
  totalVotes: number;
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
      <ChartBarIcon className="w-8 h-8" />
      <span className="text-xl font-bold">Live Results</span>
    </div>

    {options.map((option, index) => {
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
          <ProgressBar percent={Number(percent)} />
        </div>
      );
    })}
  </div>
);

const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
    <div
      className="bg-blue-500 h-full rounded-full transition-all duration-500"
      style={{ width: `${percent}%` }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  </div>
);
