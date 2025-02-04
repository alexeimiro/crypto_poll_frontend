import React, { useState } from "react";

const CreatePoll = () => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["Option 1", "Option 2"]);
  const [expiresInMinutes, setExpiresInMinutes] = useState(60);
  const [error, setError] = useState(null);

  const handleAddOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          options,
          expires_in_minutes: expiresInMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create poll");
      }

      alert("Poll created successfully!");
      setTitle("");
      setOptions(["Option 1", "Option 2"]);
      setExpiresInMinutes(60);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create a Poll</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        {options.map((option, index) => (
          <div key={index} className="mb-4">
            <label
              htmlFor={`option-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Option {index + 1}
            </label>
            <input
              type="text"
              id={`option-${index}`}
              value={option}
              onChange={(e) =>
                setOptions(
                  options.map((opt, i) => (i === index ? e.target.value : opt))
                )
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            <button
              type="button"
              onClick={() => handleRemoveOption(index)}
              className="mt-2 text-red-500 hover:text-red-700"
            >
              Remove Option
            </button>
          </div>
        ))}

        <div className="mb-4">
          <label htmlFor="expires" className="block text-sm font-medium text-gray-700">
            Expires In (minutes)
          </label>
          <input
            type="number"
            id="expires"
            value={expiresInMinutes}
            onChange={(e) => setExpiresInMinutes(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <button
          type="button"
          onClick={handleAddOption}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Option
        </button>

        <button
          type="submit"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Create Poll
        </button>

        {error && <p className="mt-4 text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default CreatePoll;