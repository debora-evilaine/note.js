const API_BASE_URL = 'http://localhost:5000/api';

const request = async (endpoint, method, body = null, token) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

export const saveTag = (tag, token) => {
    return request('/tags', 'POST', tag, token);
};

export const saveNote = (note, token) => {
    return request('/notes', 'POST', note, token);
};