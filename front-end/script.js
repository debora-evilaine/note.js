const API_URL = 'http://localhost:5000';

class NotesApp {
  constructor() {
    this.token = localStorage.getItem('authToken');

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
    } else {
      this.showAuth();
    }
  }

  showAuth() {
    this.authContainer.style.display = 'block';
    this.appContainer.style.display = 'none';
  }

  async showApp() {
    window.location.replace("http://192.168.15.7:8080/insercao_de_notas/app.html")
  }

  async handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha no cadastro');
      }

      alert('Cadastro realizado com sucesso! Por favor, faça o login.');
      document.getElementById('register-form').reset();
    } catch (error) {
      alert(error.message);
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

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

      localStorage.setItem('authToken', data.token);
      this.token = data.token;

      alert('Login bem-sucedido!');
      this.showApp();

    } catch (error) {
      alert(error.message);
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    this.notes = [];
    this.tags = [];
    this.showAuth();
  }
}

const app = new NotesApp();
