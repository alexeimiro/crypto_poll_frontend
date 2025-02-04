// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Poll from "./components/Poll";
import CreatePoll from "./components/CreatePoll";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-blue-500 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Crypto Poll</h1>
            <nav>
              <Link
                to="/"
                className="mr-4 text-white hover:text-blue-300 transition-colors"
              >
                Current Poll
              </Link>
              <Link
                to="/create-poll"
                className="text-white hover:text-blue-300 transition-colors"
              >
                Create Poll
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow p-6">
          <Routes>
            <Route path="/" element={<Poll />} />
            <Route path="/create-poll" element={<CreatePoll />} />
          </Routes>
        </main>

        <footer className="bg-blue-500 text-white p-4 text-center">
          &copy; {new Date().getFullYear()} Crypto Poll
        </footer>
      </div>
    </Router>
  );
}

export default App;