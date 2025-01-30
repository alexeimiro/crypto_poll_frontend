import React, { useState } from "react";

const CreatePoll = () => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [createdPoll, setCreatedPoll] = useState(null);
  const [error, setError] = useState(null);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Format the data as required by backend
    const pollData = {
      title,
      options,
      // If your backend is expecting a specific RFC3339 or ISO8601 date-time,
      // you can handle it here. For simplicity:
      expires_at: new Date(expiresAt).toISOString(),
    };

    try {
      const response = await fetch("http://localhost:3000/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setCreatedPoll(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create a New Poll</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Poll Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Options */}
        <div>
          <label className="block font-medium mb-1">Options</label>
          {options.map((opt, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="ml-2 px-3 py-2 bg-red-500 text-white rounded"
                  onClick={() => handleRemoveOption(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-3 py-2 bg-blue-500 text-white rounded"
            onClick={handleAddOption}
          >
            + Add Option
          </button>
        </div>

        {/* Expires At */}
        <div>
          <label className="block font-medium mb-1">Expires At</label>
          <input
            type="datetime-local"
            className="border border-gray-300 rounded px-3 py-2"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600"
        >
          Create Poll
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="text-red-500 font-medium mt-4">
          Error creating poll: {error}
        </p>
      )}

      {/* Show created poll info */}
      {createdPoll && (
        <div className="mt-6 p-4 border border-gray-200 rounded">
          <h3 className="text-lg font-bold mb-2">Poll Created Successfully:</h3>
          <p>
            <strong>ID:</strong> {createdPoll.id}
          </p>
          <p>
            <strong>Title:</strong> {createdPoll.title}
          </p>
          <p>
            <strong>Expires At:</strong>{" "}
            {new Date(createdPoll.expires_at).toLocaleString()}
          </p>
          <p>
            <strong>Options:</strong>
          </p>
          <ul className="list-disc list-inside">
            {createdPoll.options?.map((opt, idx) => (
              <li key={idx}>{opt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CreatePoll;
