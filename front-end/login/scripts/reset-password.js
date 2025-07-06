const messageDiv = document.getElementById('message');
const form = document.getElementById('reset-form');
const token = new URLSearchParams(window.location.search).get('token');

if (!token) {
    form.style.display = 'none';
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Token de redefinição não encontrado ou inválido. Por favor, solicite um novo link.';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password-input').value;
    const button = e.target.querySelector('button');
    button.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/users/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        messageDiv.style.color = 'green';
        messageDiv.textContent = data.message + ' Você será redirecionado para o login em 3 segundos.';
       setTimeout(() => { 
                     window.location.href = 'http://localhost:8080/index.html'; 
        }, 3000);
    } catch (err) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = err.message || 'Ocorreu um erro.';
        button.disabled = false;
    }
});