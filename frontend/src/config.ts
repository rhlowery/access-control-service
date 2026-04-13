export const getApiUrl = (path: string): string => {
  const customWindow = window as any;
  const base = (customWindow.ACS_CONFIG && customWindow.ACS_CONFIG.apiUrl) ? customWindow.ACS_CONFIG.apiUrl : '';
  return `${base}${path}`;
};
