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
    [pollId]: true
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

// Main Component
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
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data.message || 'Failed to load poll data');
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
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data.message || 'Vote submission failed');
    }
  };

  // Render helpers
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

// Sub-components
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
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
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">{title}</h2>
    <CountdownTimer expiryDate={expiryDate} />
  </div>
);

const CountdownTimer = ({ expiryDate }: { expiryDate: Date }) => (
  <div className="text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-600">
    <Countdown 
      date={expiryDate}
      renderer={({ days, hours, minutes, seconds }) => (
        <span>Ends in: {days}d {hours}h {minutes}m {seconds}s</span>
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
  <div className="space-y-3">
    {options.map((option, index) => (
      <button
        key={index}
        onClick={() => onSelect(index)}
        className={`w-full p-4 text-left rounded-lg transition-all ${
          selectedOption === index
            ? 'bg-blue-50 border-2 border-blue-500'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        {option}
      </button>
    ))}
    
    <VoteButton 
      disabled={selectedOption === null}
      onClick={onSubmit}
    />
  </div>
);

const VoteButton = ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`mt-4 w-full py-3 rounded-lg text-white transition-colors ${
      disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
    }`}
  >
    Submit Vote
  </button>
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
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-gray-600 mb-4">
      <ChartBarIcon className="w-6 h-6" />
      <span className="text-lg font-semibold">Live Results</span>
    </div>
    
    {options.map((option, index) => {
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
          <ProgressBar percent={Number(percent)} />
        </div>
      );
    })}
  </div>
);

const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
    <div 
      className="h-full bg-blue-500 transition-all duration-500"
      style={{ width: `${percent}%` }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  </div>
);
