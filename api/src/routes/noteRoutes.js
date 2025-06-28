const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/Notes');
const router = express.Router();

console.log('Note:', Note);
console.log('Note.find:', Note.find);

// Middleware para verificar JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Criar nova nota
router.post('/', authenticate, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Por favor, forneça um título e conteúdo' });
  }

  try {
    const note = await Note.create({ title, content, user: req.userId });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar a nota', error: error.message });
  }
});

// Pegar todas as notas com paginação
router.get('/', authenticate, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const notes = await Note.find({ user: req.userId })
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .exec();

    const count = await Note.countDocuments({ user: req.userId });

    res.json({
      notes,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar as notas', error: error.message });
  }
});

module.exports = router;