import { useState } from 'react';
import axios from 'axios';

export default function CreatePoll() {
  const [formData, setFormData] = useState({
    title: '',
    options: '',
    expires_in_minutes: 1440
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/polls`, {
        ...formData,
        options: formData.options.split(',').map(s => s.trim())
      });
      
      alert('Poll created successfully!');
      setFormData({
        title: '',
        options: '',
        expires_in_minutes: 1440
      });
    } catch (error) {
      alert('Error creating poll');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-2xl mt-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Poll</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Options (comma-separated)
          </label>
          <input
            type="text"
            value={formData.options}
            onChange={(e) => setFormData({...formData, options: e.target.value})}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
            placeholder="Option 1, Option 2, Option 3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.expires_in_minutes}
            onChange={(e) => setFormData({...formData, expires_in_minutes: Number(e.target.value)})}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
            min="1"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-full hover:bg-blue-700 transition-colors font-semibold"
        >
          Create Poll
        </button>
      </form>
    </div>
  );
}
