// src/config.js

const getApiUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  if (!apiUrl) {
    console.error("REACT_APP_API_URL is not defined. Please set it in your .env file.");
    return "";
  }

  return apiUrl;
};

export default {
  API_URL: getApiUrl(),
};