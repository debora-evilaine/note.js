import { showNotification } from './notifications.js';

const form = document.getElementById('reset-form');
const token = new URLSearchParams(window.location.search).get('token');

if (!token) {
    form.style.display = 'none';
    showNotification('Token de redefinição não encontrado ou inválido.', 'error');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password-input').value;
    const button = e.target.querySelector('button');
    
    button.disabled = true;
    button.textContent = 'Salvando...';

    try {
        const response = await fetch('http://localhost:5000/api/users/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        showNotification(data.message + ' Redirecionando...', 'success');

        setTimeout(() => { 
            window.location.href = 'http://localhost:8080/index.html'; 
        }, 3000);

    } catch (err) {
        showNotification(err.message || 'Ocorreu um erro.', 'error');
        button.disabled = false;
        button.textContent = 'Salvar Nova Senha';
    }
});