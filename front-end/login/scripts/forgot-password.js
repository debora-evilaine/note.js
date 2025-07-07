import { showNotification } from './notifications.js';

document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-input').value;
    const button = e.target.querySelector('button');

    button.disabled = true;
    showNotification('Enviando...', 'info');

    try {
        const response = await fetch('http://localhost:5000/api/users/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        
        showNotification(data.message, 'success');

    } catch (err) {
        showNotification('Ocorreu um erro. Tente novamente.', 'error');
        button.disabled = false;
    }
});