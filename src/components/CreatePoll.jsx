import React, { useState } from 'react';

const CreatePoll = () => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [createdPoll, setCreatedPoll] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!title.trim()) {
      errors.push('Poll title is required');
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      errors.push('At least 2 options are required');
    }

    if (!expiresAt) {
      errors.push('Expiration date is required');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const validOptions = options
        .map(opt => opt.trim())
        .filter(opt => opt !== '');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          options: validOptions,
          expires_at: new Date(expiresAt).toISOString(),
        }),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        const errorMessage = responseData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      setCreatedPoll(responseData);
      setTitle('');
      setOptions(['', '']);
      setExpiresAt('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create a New Poll</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block font-medium mb-1">Options</label>
          {options.map((opt, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-grow border border-gray-300 rounded px-3 py-2"
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required={index < 2}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  onClick={() => handleRemoveOption(index)}
                  disabled={isSubmitting}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleAddOption}
            disabled={options.length >= 10 || isSubmitting}
          >
            Add Option (Max 10)
          </button>
        </div>

        <div>
          <label className="block font-medium mb-1">Expires At</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded hover:bg-green-600 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {createdPoll && (
        <div className="mt-6 p-4 border border-gray-200 rounded">
          <h3 className="text-lg font-bold mb-2">Poll Created Successfully</h3>
          <p><strong>ID:</strong> {createdPoll.id}</p>
          <p><strong>Title:</strong> {createdPoll.title}</p>
          <p><strong>Expires At:</strong> {new Date(createdPoll.expires_at).toLocaleString()}</p>
          <p><strong>Options:</strong></p>
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