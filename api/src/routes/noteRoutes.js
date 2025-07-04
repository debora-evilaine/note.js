const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');
const authenticate = require('../middleware/authenticate');

// converter para UTC-3
function convertToBrazilTime(date) {
  if (!date) return null;

 
  const dateObj = (typeof date === 'string' || date instanceof String) 
    ? new Date(date) 
    : date;


  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida recebida:', date);
    return null;
  }

  return dateObj.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// GET all notes
router.get('/', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ updatedAt: -1 });
    
    const formattedNotes = notes.map(note => {
      const noteData = note.toObject();
      return {
        ...noteData,
        createdAt: convertToBrazilTime(noteData.createdAt),
        updatedAt: convertToBrazilTime(noteData.updatedAt)
      };
    });

    res.json({ notes: formattedNotes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// POST a new note
router.post('/', authenticate, async (req, res) => {
  const { title, content, tagIds = [] } = req.body;
  
  try {
    const now = new Date();
    const note = new Note({
      title,
      content,
      tagIds,
      user: req.userId,
      createdAt: now,
      updatedAt: now
    });

    const savedNote = await note.save();
    
   
    const responseNote = savedNote.toObject();
    responseNote.createdAt = convertToBrazilTime(responseNote.createdAt);
    responseNote.updatedAt = convertToBrazilTime(responseNote.updatedAt);

    res.status(201).json(responseNote);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar a nota', error: error.message });
  }
});

// PUT (update) an existing note by ID
router.put('/:id', authenticate, async (req, res) => {
  const { title, content, tagIds } = req.body;
  
  try {
    const now = new Date(); 
    
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        title,
        content,
        tagIds,
        updatedAt: now
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }
    
    
    const responseNote = updatedNote.toObject();
    responseNote.createdAt = convertToBrazilTime(responseNote.createdAt);
    responseNote.updatedAt = convertToBrazilTime(responseNote.updatedAt);

    res.json(responseNote);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar a nota', error: error.message });
  }
});

// DELETE a note by ID
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.userId 
    });
    
    if (!deletedNote) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error ao deletar nota', error: error.message });
  }
});

// pesquisa por data
router.get('/by-date', authenticate, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ 
        error: 'A data é obrigatória (formato: YYYY-MM-DD)' 
      });
    }
    

    const start = new Date(`${date}T00:00:00-03:00`);
    const end = new Date(`${date}T23:59:59-03:00`);

    const notes = await Note.find({
      user: req.userId,
      updatedAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    
    const formattedNotes = notes.map(note => {
      const noteData = note.toObject();
      return {
        ...noteData,
        createdAt: convertToBrazilTime(noteData.createdAt),
        updatedAt: convertToBrazilTime(noteData.updatedAt)
      };
    });

    res.json(formattedNotes);
  } catch (err) {
    console.error('Erro ao buscar notas por data:', err);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;