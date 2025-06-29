<<<<<<< Updated upstream
const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/Notes');  // Aqui  importa  models/Notes
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

// Find note by title text
router.get('/search', authenticate, async (req, res) => {
  const searchTerms = req.query.searchTerms;
  const { page = 1, limit = 10 } = req.query;

  if (!searchTerms) {
    return res.status(400).json({ message: 'Por favor, forneça um termo para pesquisa' });
  }

  try{
    const notes = await Note.find({$text: { $search: searchTerms}, user: req.userId})
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Note.countDocuments({$text: { $search: searchTerms}, user: req.userId});

    res.json({
      notes,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar as notas', error: error.message });
  }
})

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');
const authenticate = require('../middleware/authenticate');

// GET all notes
router.get('/', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ updatedAt: -1 });
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// POST a new note
router.post('/', authenticate, async (req, res) => {
  const { title, content, tagIds = [] } = req.body;
  try {
    const note = new Note({
      title,
      content,
      tagIds,
      user: req.userId,
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note', error: error.message });
  }
});

// PUT (update) an existing note by ID
router.put('/:id', authenticate, async (req, res) => {
  const { title, content, tagIds } = req.body;
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, content, tagIds, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error updating note', error: error.message });
  }
});

// DELETE a note by ID
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

module.exports = router;
>>>>>>> Stashed changes
