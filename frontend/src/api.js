const API_URL = 'http://localhost:3001';

export const getSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem('nexus_session') || 'null');
  } catch {
    return null;
  }
};

export const setSession = (session) => {
  sessionStorage.setItem('nexus_session', JSON.stringify(session));
};

export const clearSession = () => {
  sessionStorage.removeItem('nexus_session');
};

export const apiFetch = async (path, options = {}) => {
  const session = getSession();
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set('Content-Type', 'application/json');
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401) {
    clearSession();
  }
  return response;
};
