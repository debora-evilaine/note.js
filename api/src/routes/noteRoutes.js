const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');
const PDFDocument = require('pdfkit');
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

// pesquisa por data 
router.get('/by-date', authenticate, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'A data é obrigatória (formato: YYYY-MM-DD)' });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const userId = req.userId; 

    const notes = await Note.find({
      user: userId,
      updatedAt: {
        $gte: start,
        $lt: end
      }
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error('Erro ao buscar notas por data:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});




//gerar pdf das notas selecionas

router.post('/download-notes',  authenticate, async (req, res) => {
  try {
    // Espera um array de IDs no corpo da requisição
    const { noteIds } = req.body; 
    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({ error: 'Nenhuma nota selecionada' });
    }

    // Busca as notas no banco de dados
    const notes = await Note.find({ _id: { $in: noteIds }, user: req.userId });

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Notas não encontradas' });
    }

    // Cria um novo documento PDF
    const doc = new PDFDocument();

    // Define o header para download de PDF no response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=notas.pdf');

    // Pipe do PDF para o response
    doc.pipe(res);

    // Escreve o conteúdo de cada nota no PDF
    notes.forEach((note, index) => {
      doc.moveDown(0.5);
      doc.fontSize(12).text(`${note.title || 'Sem título'}`);
      doc.moveDown(0.2);
      doc.fontSize(10).text(note.content || 'Sem conteúdo');
     if (index < notes.length - 1) {
    doc.addPage();
  }
    });

    // Finaliza o documento PDF
    doc.end();

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});



module.exports = router;