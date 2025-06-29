const express = require('express');
const mongoose= require('mongoose');
const jwt = require('jsonwebtoken');
const Tag = require('../models/Tags');  // Aqui  importa  models/Tags
const NoteTag = require('../models/NotesTags');
const Note = require('../models/Notes');
const router = express.Router();

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

// Get notes by tag(s)
router.get("/notesBytag", authenticate, async (req, res) => {
  let { tagId } = req.query;

  if (!tagId) {
    return res.status(400).json({ message: 'Por favor, forneça um ou mais IDs de tags.' });
  }

  try {
    let tagIdsArray;
    if (typeof tagId === 'string') {
        tagIdsArray = tagId.split(',');
    } else if (Array.isArray(tagId)) {
      tagIdsArray = tagId
    } else {
      return res.status(400).json({ message: 'Formato de ID de tag inválido. Esperado string ou array.' });
    }

    const notes = await NoteTag.aggregate([
      {
        $match: {
          tagId: { $in: tagIdsArray }
        }
      },
      {
        $group: {
          _id: "$noteId",
          tagCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
            convertedNoteId: { $toObjectId: "$_id" }
        }
      },
      {
        $lookup: {
          from: Note.collection.name,
          localField: "convertedNoteId", 
          foreignField: "_id",
          as: "note"
        }
      },
      {
        $unwind: "$note",
      },
      {
        $project: {
            _id: "$note._id",
            title: "$note.title",
            content: "$note.content",
            user: "$note.user",
            createdAt: "$note.createdAt",
            updatedAt: "$note.updatedAt",
            __v: "$note.__v",
            tagCount: 1
        }
      }
    ]);

    const resultNotes = notes.filter((note) => note.tagCount === tagIdsArray.length);
    res.json({ notes: resultNotes });

  } catch (error) {
    console.error("Error ao buscar notas por tags:", error); 
    if (error.message.includes('ID de tag inválido')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao buscar notas por tags.', error: error.message });
  }
});

// Relacionar tag a uma anotação
router.post("/note", authenticate, async (req, res) => {
    const { tagId, noteId } = req.body;
    
    try {
        if((await Tag.findById(tagId)) == null)
            return res.status(404).json({ message: 'Não foi possivel encontrar a tag informada.' });
        else if((Note.findById(noteId)) == null)
            return res.status(404).json({ message: 'Não foi possivel encontrar anotação.' });
        
        const noteTag = await NoteTag.create({tagId, noteId, user: req.userId});
        res.status(201).json(noteTag);
    } catch (error) {
        res.status(500).json({ message: 'Error ao relacionar tag à anotação', error: error.message });
    }
})

// Pegar tags de anotação
router.get("/note", authenticate, async (req, res) => {
    const { noteId } = req.query; // Destructure for cleaner access

    if(!noteId)
      return res.status(400).json({ message: '' });

    try {
        const note = await Note.findOne({ _id: noteId, user: req.userId });
        if (!note) {
            return res.status(404).json({ message: 'Não foi possível encontrar a anotação.' });
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
