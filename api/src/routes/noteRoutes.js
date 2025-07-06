const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');
const Tag = require('../models/Tags');
const PDFDocument = require('pdfkit');
const marked = require('marked');
const authenticate = require('../middleware/authenticate');


function removeEmojis(text) {
  if (!text) return '';
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');
}
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

//baixar o pdf
router.post('/download-notes', authenticate, async (req, res) => {
  try {
    const { noteIds } = req.body;
    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({ error: 'Nenhuma nota selecionada' });
    }

    const foundNotes = await Note.find({ _id: { $in: noteIds }, user: req.userId });

    const orderedNotes = noteIds.map(id => foundNotes.find(note => note._id.toString() === id)).filter(note => note);

    if (orderedNotes.length === 0) {
      return res.status(404).json({ error: 'Nenhuma nota válida encontrada para os IDs fornecidos' });
    }

    const allTags = await Tag.find({ user: req.userId });
    const tagMap = new Map(allTags.map(tag => [tag._id.toString(), tag.name]));

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=notas.pdf');

    doc.pipe(res);

    for (let i = 0; i < orderedNotes.length; i++) {
      const note = orderedNotes[i];

      
      const cleanedTitle = removeEmojis(note.title || 'Sem título');
      doc.fontSize(16).font('Helvetica-Bold').text(cleanedTitle, { align: 'center' });
      doc.moveDown(0.5);

      
      const cleanedContent = removeEmojis(note.content || 'Sem conteúdo');
      const tokens = marked.lexer(cleanedContent);

      tokens.forEach(token => {
        if (token.type === 'heading') {
          switch (token.depth) {
            case 1: doc.fontSize(14).font('Helvetica-Bold'); break;
            case 2: doc.fontSize(12).font('Helvetica-Bold'); break;
            case 3: doc.fontSize(10).font('Helvetica-Bold'); break;
            default: doc.fontSize(9).font('Helvetica-Bold'); break; 
          }
          doc.text(token.text);
          doc.moveDown(0.5);
        } else if (token.type === 'paragraph' || token.type === 'text') {
          doc.fontSize(10).font('Helvetica'); 
          
          let currentText = token.text || token.raw;
          let lastIndex = 0;
          const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
          const italicRegex = /\*(.*?)\*|_(.*?)_/g;
          let match;
          
          
          while ((match = boldRegex.exec(currentText)) !== null) {
           
            doc.text(currentText.substring(lastIndex, match.index), { continued: true });
           
            doc.font('Helvetica-Bold').text(match[1] || match[2], { continued: true });
           
            doc.font('Helvetica');
            lastIndex = boldRegex.lastIndex;
          }
       
          doc.text(currentText.substring(lastIndex), { continued: true });
          
          
          let processedParagraph = '';
          let tempIndex = 0;
          let matchBold;
          
         
          const segments = [];
          tempIndex = 0;
          while ((matchBold = boldRegex.exec(currentText)) !== null) {
              if (matchBold.index > tempIndex) {
                  segments.push({ text: currentText.substring(tempIndex, matchBold.index), bold: false, italic: false });
              }
              segments.push({ text: matchBold[1] || matchBold[2], bold: true, italic: false });
              tempIndex = boldRegex.lastIndex;
          }
          if (tempIndex < currentText.length) {
              segments.push({ text: currentText.substring(tempIndex), bold: false, italic: false });
          }

          
          const finalSegments = [];
          segments.forEach(seg => {
              if (seg.bold) { 
                  finalSegments.push(seg);
              } else { 
                  let italicTempIndex = 0;
                  let matchItalic;
                  const currentSubText = seg.text;
                  while ((matchItalic = italicRegex.exec(currentSubText)) !== null) {
                      if (matchItalic.index > italicTempIndex) {
                          finalSegments.push({ text: currentSubText.substring(italicTempIndex, matchItalic.index), bold: false, italic: false });
                      }
                      finalSegments.push({ text: matchItalic[1] || matchItalic[2], bold: false, italic: true });
                      italicTempIndex = italicRegex.lastIndex;
                  }
                  if (italicTempIndex < currentSubText.length) {
                      finalSegments.push({ text: currentSubText.substring(italicTempIndex), bold: false, italic: false });
                  }
              }
          });

          finalSegments.forEach((seg, idx) => {
              let font = 'Helvetica';
              if (seg.bold && seg.italic) font = 'Helvetica-BoldOblique';
              else if (seg.bold) font = 'Helvetica-Bold';
              else if (seg.italic) font = 'Helvetica-Oblique';
              
              doc.font(font).text(seg.text, { continued: (idx < finalSegments.length -1) });
          });
          doc.text(''); 
          doc.moveDown(0.1); 
          
        } else if (token.type === 'list') {
          doc.fontSize(10).font('Helvetica');
          token.items.forEach(item => {
            doc.text(`• ${removeEmojis(item.text)}`, { indent: 20 });
          });
          doc.moveDown(0.2);
        } else if (token.type === 'code') {
          doc.fontSize(8).font('Courier').fillColor('grey').text(removeEmojis(token.text), {
            indent: 20,
            lineGap: 2
          });
          doc.fillColor('black'); 
          doc.moveDown(0.2);
        } else if (token.type === 'hr') {
          doc.strokeColor('grey').lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
          doc.moveDown(0.5);
          doc.strokeColor('black')
        } else {
          
          doc.fontSize(10).font('Helvetica').text(token.text || token.raw);
          doc.moveDown(0.2);
        }
      });

      doc.moveDown(1); 

      
      const cleanedTags = removeEmojis((note.tagIds || [])
        .map(tagId => tagMap.get(tagId.toString()))
        .filter(name => name)
        .join(', '));

      if (cleanedTags) {
        doc.fontSize(8).font('Helvetica').text(`Tags: ${cleanedTags}`, { align: 'left', continued: false });
      }

      if (i < orderedNotes.length - 1) {
        doc.addPage();
      }
    }

    doc.end();

  } catch (error) {
    console.error('Erro ao gerar PDF (catch principal):', error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

module.exports = router;