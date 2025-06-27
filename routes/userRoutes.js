const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Para comparar senha
const User = require('../models/User');

// Registrar usuário
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Por favor, forneça nome de usuário e senha' });
  }

  try {
    // Apenas cria o usuário — a senha será criptografada pelo hook pre-save do modelo User
    const user = await User.create({ username, password });

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    // Se for erro de duplicidade de nome de usuário, informe o usuário
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Nome de usuário já existe' });
    }
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

// Login do usuário
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Credenciais inválidas' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    // Compara senha enviada com o hash do banco
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    // Cria o token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
  }
});

module.exports = router;
