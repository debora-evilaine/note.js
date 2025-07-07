import { showNotification } from './notifications.js';

const API_URL = 'http://localhost:5000';

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const button = e.target.querySelector('button');

    button.disabled = true;
    button.textContent = 'Cadastrando...';
    showNotification('Verificando seus dados...', 'info');

    try {
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Falha no cadastro.');
        }

        showNotification('Cadastro realizado com sucesso! Redirecionando para o login...', 'success');
        
        setTimeout(() => {
            window.location.href = '../../index.html'; 
        }, 2000); 
        
    } catch (error) {
        showNotification(error.message, 'error');
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

if (passwordInput && rulesContainer) {
    passwordInput.addEventListener('focus', () => {
        rulesContainer.classList.add('visible');
    });

    passwordInput.addEventListener('blur', () => {
        rulesContainer.classList.remove('visible');
    });

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const validateRule = (element, isValid) => {
            if (element) {
                element.classList.toggle('valid', isValid);
                element.classList.toggle('invalid', !isValid);
            }
        };

        validateRule(ruleLength, password.length >= 8);
        validateRule(ruleUppercase, /[A-Z]/.test(password));
        validateRule(ruleLowercase, /[a-z]/.test(password));
        validateRule(ruleNumber, /\d/.test(password));
        validateRule(ruleSpecial, /[!@#$%^&*(),.?":{}|<>]/.test(password));
    });
}