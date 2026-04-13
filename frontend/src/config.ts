export const getApiUrl = (path) => {
  const base = (window.ACS_CONFIG && window.ACS_CONFIG.apiUrl) ? window.ACS_CONFIG.apiUrl : '';
  return `${base}${path}`;
};
