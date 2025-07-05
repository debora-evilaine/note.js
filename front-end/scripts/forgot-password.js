document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-input').value;
    const messageDiv = document.getElementById('message');
    const button = e.target.querySelector('button');
    button.disabled = true;
    messageDiv.textContent = 'Enviando...';

    try {
        const response = await fetch('http://localhost:5000/api/users/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        messageDiv.style.color = 'green';
        messageDiv.textContent = data.message;
    } catch (err) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Ocorreu um erro. Tente novamente.';
        button.disabled = false;
    }
});