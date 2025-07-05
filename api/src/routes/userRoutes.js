const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Validador de e-mail melhorado
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Registrar usuário
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validações mais robustas
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Por favor, forneça o nome, e-mail e senha' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
  }

  try { 
    const user = await User.create({ 
      name,
      email: email.toLowerCase().trim(), // Normaliza o e-mail
      password
    });

    res.status(201).json({ 
      message: 'Usuário registrado com sucesso',
      user: {
        id: user._id,
        nome: user.name,
        email: user.email
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'E-mail já cadastrado' }); // 409 Conflict
    }
    res.status(500).json({ 
      error: 'Erro ao registrar usuário',
      details: error.message 
    });
  }
});

// Login do usuário
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor, forneça e-mail e senha' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' }); 
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao realizar login',
      details: error.message 
    });
  }
});

module.exports = router;