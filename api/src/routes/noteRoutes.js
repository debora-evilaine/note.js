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