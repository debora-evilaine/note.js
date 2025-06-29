const express = require('express');
const jwt = require('jsonwebtoken');
const Tag = require('../models/Tags');  // Aqui  importa  models/Tags
const NoteTag = require('../models/NotesTags');
const Note = require('../models/Notes');
const router = express.Router();

console.log('Tag:', Tag);
console.log('Tag.find:', Tag.find);

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

// Criar nova tag
router.post('/', authenticate, async (req, res) => {
  const { name, color } = req.body;

  if (!name || !color) {
    return res.status(400).json({ message: 'Por favor, forneça um título e conteúdo' });
  }

  try {
    const tag = await Tag.create({ name, color, user: req.userId });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar a tag', error: error.message });
  }
});

// Pegar todas as tags
router.get('/', authenticate, async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.userId });

    res.json({tags});
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar as tags', error: error.message });
  }
});

// Relacionar tag a uma anotação
router.post("/note", authenticate, async (req, res) => {
    const { tagId, noteId } = req.body;
    
    try {
        if((await Tag.findById(tagId)) == null)
            return res.status(400).json({ message: 'Não foi possivel encontrar a tag informada.' });
        else if((Note.findById(noteId)) == null)
            return res.status(400).json({ message: 'Não foi possivel encontrar anotação.' });
        
        const noteTag = await NoteTag.create({tagId, noteId, user: req.userId});
        res.status(201).json(noteTag);
    } catch (error) {
        res.status(500).json({ message: 'Error ao relacionar tag à anotação', error: error.message });
    }
})

// Pegar tags de anotação
router.get("/note/:noteId", authenticate, async (req, res) => {
    const { noteId } = req.params; // Destructure for cleaner access

    try {
        const note = await Note.findOne({ _id: noteId, user: req.userId });
        if (!note) {
            return res.status(404).json({ message: 'Não foi possível encontrar a anotação.' }); // Use 404 for not found
        }

        const noteTags = await NoteTag.find({ noteId, user: req.userId });
        const responseTags = [];

        for (const noteTag of noteTags) {
            const tag = await Tag.findById(noteTag.tagId);
            if (tag) {
                responseTags.push(tag);
            }
        }

        res.json({ note, tags: responseTags }); 

    } catch (error) {
        console.error("Error ao buscar nota e tags:", error); // Log the error for debugging
        res.status(500).json({ message: 'Erro ao buscar nota e tags.', error: error.message });
    }
});

module.exports = router;
