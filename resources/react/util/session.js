const STORAGE_KEY = 'userData';

/**
 * Safely parse JSON data with error handling
 */
function safeJSONParse(jsonString) {
  try {
    return jsonString ? JSON.parse(jsonString) : null;
  } catch (error) {
    console.warn('Failed to parse stored user data:', error);
    return null;
  }
}

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
}

/**
 * Validate user data structure
 */
function isValidUserData(userData) {
  return userData &&
         typeof userData === 'object' &&
         userData.token &&
         (userData.user || userData.partner);
}

/**
 * Stores user data in localStorage with validation
 */
export function storeUserData(userData) {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }

  if (!isValidUserData(userData)) {
    console.error('Invalid user data provided');
    return false;
  }

  try {
    const dataWithTimestamp = {
      ...userData,
      _timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
    return true;
  } catch (error) {
    console.error('Failed to store user data:', error);
    return false;
  }
}

/**
 * Retrieves raw user data from localStorage
 */
function getRawUserData() {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    const userData = safeJSONParse(rawData);

    if (!userData || typeof userData !== 'object') {
      console.warn('Invalid or corrupted user data found');
      deleteUserData();
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
}

/**
 * Deletes user data from localStorage
 */
export function deleteUserData() {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to delete user data:', error);
    return false;
  }
}

/**
 * Returns whether the user is logged in
 */
export function isLoggedIn() {
  const userData = getRawUserData();
  return !!(userData && userData.token && (userData.user || userData.partner));
}

/**
 * Legacy compatibility
 */
export function isLogIn() {
  return isLoggedIn();
}

/**
 * Returns the stored token or null
 */
export function getToken() {
  const userData = getRawUserData();
  return userData?.token ?? null;
}

/**
 * Returns user type or null (works for both user and partner)
 */
export function getUserType() {
  const userData = getRawUserData();
  return userData?.user?.type ?? userData?.partner?.type ?? null;
}

/**
 * Returns the user or partner object
 */
export function getUserData() {
  const userData = getRawUserData();
  return userData?.user ?? userData?.partner ?? null;
}

/**
 * Returns the full data object including metadata
 */
export function getCompleteUserData() {
  return getRawUserData();
}

/**
 * Legacy compatibility
 */
export function getFullUserData() {
  return getCompleteUserData();
}

/**
 * Check if the stored data is expired
 */
export function isDataExpired(maxAge = 24 * 60 * 60 * 1000) {
  const userData = getRawUserData();
  if (!userData || !userData._timestamp) return true;
  return (Date.now() - userData._timestamp) > maxAge;
}

/**
 * Validate current session
 */
export function validateSession() {
  const userData = getRawUserData();

  if (!userData) return false;

  if (isDataExpired()) {
    console.warn('User session has expired');
    deleteUserData();
    return false;
  }

  if (!userData.token || (!userData.user && !userData.partner)) {
    console.warn('Invalid session data');
    deleteUserData();
    return false;
  }

  return true;
}

/**
 * Update specific fields in user data
 */
export function updateUserData(updates) {
  const currentData = getRawUserData();

  if (!currentData) {
    console.error('No existing user data to update');
    return false;
  }

  const updatedData = {
    ...currentData,
    ...updates,
    _timestamp: Date.now()
  };

  return storeUserData(updatedData);
}

/**
 * Clear all session data
 */
export function clearSession() {
  deleteUserData();
  console.log('Session cleared successfully');
}

/**
 * Debug info
 */
export function debugSessionStorage() {
  console.log('=== Session Storage Debug Info ===');
  console.log('localStorage available:', isLocalStorageAvailable());
  console.log('Raw stored data:', localStorage.getItem(STORAGE_KEY));
  console.log('Parsed user data:', getRawUserData());
  console.log('Is logged in:', isLoggedIn());
  console.log('Token:', getToken());
  console.log('User type:', getUserType());
  console.log('User data:', getUserData());
  console.log('Data expired:', isDataExpired());
  console.log('Session valid:', validateSession());
}
