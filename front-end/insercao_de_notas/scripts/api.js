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
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        if (method === 'DELETE') {
            return; 
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

export const getNotes = (token) => {
    return request('/notes', 'GET', null, token);
};

export const saveNote = (note, token) => {
    const endpoint = note.id ? `/notes/${note.id}` : '/notes';
    const method = note.id ? 'PUT' : 'POST';
    return request(endpoint, method, note, token);
};

export const deleteNote = (noteId, token) => {
    return request(`/notes/${noteId}`, 'DELETE', null, token);
};

export const getTags = (token) => {
    return request('/tags', 'GET', null, token);
};

export const saveTag = (tag, token) => {
    return request('/tags', 'POST', tag, token);
};

export const deleteTag = (tagId, token) => {
    return request(`/tags/${tagId}`, 'DELETE', null, token);
};