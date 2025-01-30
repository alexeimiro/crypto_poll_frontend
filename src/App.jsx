import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreatePoll from "./components/CreatePoll";
import PollResults from "./components/PollResults";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              PollApp
            </Link>
            <div>
              <Link to="/" className="mr-4 text-gray-700 hover:text-gray-900">
                Create Poll
              </Link>
              <Link to="/poll-results" className="text-gray-700 hover:text-gray-900">
                View Poll Results
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto mt-8 p-4">
          <Routes>
            <Route path="/" element={<CreatePoll />} />
            <Route path="/poll-results" element={<PollResults />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
