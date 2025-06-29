const express = require('express');
const router = express.Router();
const Tag = require('../models/Tags');
const Note = require('../models/Notes');
const authenticate = require('../middleware/authenticate');

// GET all tags
router.get('/', authenticate, async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tags', error: error.message });
  }
});

// POST a new tag
router.post('/', authenticate, async (req, res) => {
  const { name, color } = req.body;
  if (!name || !color) {
    return res.status(400).json({ message: 'Please provide a name and color' });
  }
  try {
    const tag = new Tag({ name, color, user: req.userId });
    const savedTag = await tag.save();
    res.status(201).json(savedTag);
  } catch (error) {
    res.status(400).json({ message: 'Error creating tag', error: error.message });
  }
});

// DELETE a tag by ID
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const tagId = req.params.id;
    const deletedTag = await Tag.findOneAndDelete({ _id: tagId, user: req.userId });

    if (!deletedTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await Note.updateMany(
      { user: req.userId },
      { $pull: { tagIds: tagId } }
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tag', error: error.message });
  }
});

module.exports = router;