export const getAdminToken = () => {
  try {
    const token = window.localStorage.getItem('adminToken');
    if (token === 'null' || token === 'undefined') return null;
    return token;
  } catch (e) {
    console.warn('localStorage is not available:', e);
    return null;
  }
};

export const setAdminToken = (token: string) => {
  try {
    window.localStorage.setItem('adminToken', token);
  } catch (e) {
    console.warn('localStorage is not available:', e);
  }
};

export const removeAdminToken = () => {
  try {
    window.localStorage.removeItem('adminToken');
  } catch (e) {
    console.warn('localStorage is not available:', e);
  }
};
