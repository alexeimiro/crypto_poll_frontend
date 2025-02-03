// For development
const dev = {
    API_URL: import.meta.env.REACT_APP_API_URL || 'http://localhost:3000'
  };
  
  // For production (Render.com)
  const prod = {
    API_URL: 'https://crypto-poll.onrender.com'
  };
  
  export default process.env.NODE_ENV === 'development' ? dev : prod;