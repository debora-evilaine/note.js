const API_URL = 'http://localhost:5000/api';

export const getNotes = async (token) => {
    const response = await fetch(`${API_URL}/notes`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar notas');
    }
    return response.json();
};

export const getTags = async (token) => {
    const response = await fetch(`${API_URL}/tags`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar tags');
    }
    return response.json();
};

export const saveNote = async (note, token) => {
    const method = note.id ? 'PUT' : 'POST';
    const url = note.id ? `${API_URL}/notes/${note.id}` : `${API_URL}/notes`;
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(note)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao ${note.id ? 'atualizar' : 'criar'} nota`);
    }
    return response.json();
};

export const deleteNote = async (noteId, token) => {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        let errorData = {};
        try {
          
            errorData = await response.json();
        } catch (e) {

            console.error("Erro ao parsear resposta de erro para deleteNote:", e);
        }

        throw new Error(errorData.error || `Falha ao deletar nota: ${response.status} ${response.statusText}`);
    }


    if (response.status === 204) {
        return {}; 
    }


    return response.json();
};

export const saveTag = async (tag, token) => {
    const method = tag.id ? 'PUT' : 'POST';
    const url = tag.id ? `${API_URL}/tags/${tag.id}` : `${API_URL}/tags`;
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tag)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao ${tag.id ? 'atualizar' : 'criar'} tag`);
    }
    return response.json();
};

export const deleteTag = async (tagId, token) => {
    const response = await fetch(`${API_URL}/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });


    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch (e) {
            console.error("Erro ao parsear resposta de erro para deleteTag:", e);
        }
        throw new Error(errorData.error || `Falha ao deletar tag: ${response.status} ${response.statusText}`);
    }
    if (response.status === 204) {
        return {};
    }
    return response.json();
};

export const downloadNotes = async (noteIds, token) => {
    const response = await fetch(`${API_URL}/notes/download-notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ noteIds })
    });

    if (!response.ok) {
        let errorMsg = 'Falha ao baixar notas';
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (e) {
            errorMsg = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notas.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};