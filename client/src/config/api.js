const stripTrailingSlash = (url = '') => url.replace(/\/$/, '');

const defaultChatApi = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5001'
  : '';

const defaultMedicalApi = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5002'
  : '';

export const CHAT_API_BASE_URL = stripTrailingSlash(process.env.REACT_APP_CHAT_API_URL || defaultChatApi);
export const MEDICAL_API_BASE_URL = stripTrailingSlash(process.env.REACT_APP_MEDICAL_API_URL || defaultMedicalApi);
