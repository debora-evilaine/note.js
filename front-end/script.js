import { showNotification } from '/login/scripts/notifications.js';

const API_URL = 'http://localhost:5000';
const APP_URL = 'http://localhost:8080';

class NotesApp {
  constructor() {
    this.token = sessionStorage.getItem('authToken');

    this.authContainer = document.getElementById('auth-container');
    this.appContainer = document.getElementById('app-container');

    this.init();
  }

  init() {
    if (!this.authContainer) return;

    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

    if (this.token) {
      this.showApp();
    }
  }

  async showApp() {
    window.location.replace(APP_URL + "/app/html/app.html")
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const button = event.target.querySelector('button');

    button.disabled = true;
    button.textContent = 'Entrando...';

    try {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Falha no login');
        }

        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('userName', data.user.name);
        this.token = data.token;
        
        showNotification('Login bem-sucedido! Redirecionando...', 'success');

        setTimeout(() => {
            this.showApp(); 
        }, 1500); 

    } catch (error) {
        showNotification(error.message, 'error');
        button.disabled = false;
        button.textContent = 'Entrar';
    }
}

  logout() {
    this.token = null;
    sessionStorage.removeItem('authToken');
    this.notes = [];
    this.tags = [];
    this.showAuth();
  }
}

const app = new NotesApp();