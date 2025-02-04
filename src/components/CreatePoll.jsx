import React, { useState } from 'react';

const CreatePoll = () => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresInMinutes, setExpiresInMinutes] = useState(60);
  const [message, setMessage] = useState('');

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || options.some(opt => !opt.trim()) || options.length < 2) {
      setMessage('Please fill all fields with at least 2 options');
      return;
    }

    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          options: options.map(opt => opt.trim()),
          expires_in_minutes: expiresInMinutes
        }),
      });

      if (!response.ok) throw new Error('Failed to create poll');
      
      setMessage('Poll created successfully!');
      setTitle('');
      setOptions(['', '']);
      setExpiresInMinutes(60);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="create-poll">
      <h2>Create New Poll</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Poll Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Options:</label>
          {options.map((option, index) => (
            <div key={index} className="option-input">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
              {index > 1 && (
                <button
                  type="button"
                  className="remove-option"
                  onClick={() => handleRemoveOption(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-option"
            onClick={handleAddOption}
          >
            Add Option
          </button>
        </div>

        <div className="form-group">
          <label>Duration (minutes):</label>
          <input
            type="number"
            min="1"
            value={expiresInMinutes}
            onChange={(e) => setExpiresInMinutes(Math.max(1, e.target.value))}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Create Poll
        </button>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default CreatePoll;