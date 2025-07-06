const API_URL = 'http://localhost:5000';

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const button = e.target.querySelector('button');

    button.disabled = true;
    button.textContent = 'Cadastrando...';

    try {
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Falha no cadastro. Verifique as regras da senha.');
        }

        alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
        window.location.href = '../../index.html'; 
        
    } catch (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = 'Cadastrar';
    }
});

const passwordInput = document.getElementById('register-password');
const rulesContainer = document.getElementById('password-rules');

const ruleLength = document.getElementById('rule-length');
const ruleUppercase = document.getElementById('rule-uppercase');
const ruleLowercase = document.getElementById('rule-lowercase');
const ruleNumber = document.getElementById('rule-number');
const ruleSpecial = document.getElementById('rule-special');

passwordInput.addEventListener('focus', () => {
    rulesContainer.classList.add('visible');
});

passwordInput.addEventListener('blur', () => {
    rulesContainer.classList.remove('visible');
});

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;

    const validateRule = (element, isValid) => {
        if (isValid) {
            element.classList.remove('invalid');
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
            element.classList.add('invalid');
        }
    };

    validateRule(ruleLength, password.length >= 8);
    validateRule(ruleUppercase, /[A-Z]/.test(password));
    validateRule(ruleLowercase, /[a-z]/.test(password));
    validateRule(ruleNumber, /\d/.test(password));
    validateRule(ruleSpecial, /[!@#$%^&*(),.?":{}|<>]/.test(password));
});