# Note.js API

## How to run

```
git clone https://github.com/debora-evilaine/note.js.git
cd api
npm install
npm run dev
```

## API DOC

### USER

**POST**

```
/register

body: 
    user
    password

response:
    code 201:
        message: 'Nome de usuário já existe'
    code 400:
        message: 'Nome de usuário já existe'
    code 500:
         message: 'Erro ao registrar usuário'
         error
```

---

```
/login

body: 
    user
    password

response:
    code 200:
        token
    code 400:
        message: 'Credenciais inválidas'
    code 401:
        message: 'Usuário ou senha incorretos'
    code 500:
        message: 'Erro ao realizar login', error: error.message
```

---