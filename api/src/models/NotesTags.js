const mongoose= require('mongoose');


const noteTagSchema = new mongoose.Schema({

tagId: { type: String, required: true },

noteId: { type: String, required: true },

user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

},{timestamps: true });


module.exports = mongoose.model('NoteTag', noteTagSchema);