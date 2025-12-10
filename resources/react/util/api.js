import { host } from './constants';
import { deleteUserData, getToken } from './session';

export async function login(data) {
  return await postOrPutData(host + '/api/login', data);
}

// Partner login function (renamed from login2 to be more descriptive)
export async function login2(data) {
  return await postOrPutData(host + '/api/partners/login', data);
}

// Alternative approach: Single login function with endpoint parameter
export async function loginWithEndpoint(data, endpoint = '/api/login') {
  return await postOrPutData(host + endpoint, data);
}

export async function register(data) {
  return await postOrPutData(host + '/api/register', data);
}

// otp
export async function sendOtp(data) {
  return await postOrPutData(host + '/api/send-otp', data)
}

export async function verifyOtp(data) {
  return await postOrPutData(host + '/api/verify-otp', data)
}

/**
 * Posts form data to a URL and returns the response as JSON.
 *
 * @param {string} url - The URL to post to.
 * @param {FormData} data - The form data to post.
 * @returns {Promise<object>} A promise that resolves to the response data.
 */
export async function postFormData(url = '', data) {
  try {
    const token = getToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    if (!response.ok) {
      handleError(response, url);
    }

    return response.json();
  } catch (error) {
    console.error('Error posting form data:', error);
    throw error;
  }
}

export async function postFormDataCsv(url = '', data) {
  try {
    const token = getToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        // No need to set Content-Type header for FormData
      },
      body: data, // 'data' is already a FormData object
    });

    if (!response.ok) {
      handleError(response, url);
    }

    return response.json();
  } catch (error) {
    console.error('Error posting form data:', error);
    throw error;
  }
}


/**
 * Posts or puts data to a URL and returns the response as JSON.
 *
 * @param {string} url - The URL to post/put to.
 * @param {object} data - The data to post/put.
 * @param {string} method - HTTP method (POST or PUT).
 * @returns {Promise<object>} A promise that resolves to the response data.
 */
async function postOrPutData(url = '', data = {}, method = 'POST') {
  try {
    const token = getToken();
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      handleError(response, url);
    }

    return response.json();
  } catch (error) {
    console.error(`Error with ${method} request to ${url}:`, error);
    throw error;
  }
}

/**
 * Gets or deletes data from a URL and returns the response as JSON.
 *
 * @param {string} url - The URL to get/delete data from.
 * @param {string} method - HTTP method (GET or DELETE).
 * @returns {Promise<object>} A promise that resolves to the response data.
 */
async function getOrDelete(url = '', method = 'GET') {
  try {
    const token = getToken();
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      handleError(response, url);
    }

    return response.json();
  } catch (error) {
    console.error(`Error with ${method} request to ${url}:`, error);
    throw error;
  }
}

/**
 * Handles errors in HTTP responses.
 *
 * @param {Response} response - The HTTP response object.
 * @param {string} url - The URL for the request.
 */
function handleError(response, url) {
  if (response.status === 401 && !url.includes('/login')) {
    deleteUserData();
    window.location.replace('/');
  }
  if (response.status === 422) {
    response.json().then((error) => {
      if (error.message) {
        throw new Error(error.message);
      }
    });
  }
  throw new Error(`HTTP error! status: ${response.status}`);
}

// Exported utility functions
export async function logout() {
  return await postOrPutData(host + '/api/logout');
}

export async function logoutEverywhere() {
  return await postOrPutData(host + '/api/logoutEverywhere');
}

export async function post(api, data) {
  return await postOrPutData(host + api, data);
}

export async function put(api, data) {
  return await postOrPutData(host + api, data, 'PUT');
}

export async function postAPICall(api, data) {
  return await postOrPutData(host + api, data); // Alias for POST
}

export async function getAPICall(api) {
  return await getOrDelete(host + api);
}

export async function deleteAPICall(api) {
  return await getOrDelete(host + api, 'DELETE');
}
