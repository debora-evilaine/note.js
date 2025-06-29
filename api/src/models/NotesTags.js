const mongoose= require('mongoose');


const noteTagSchema = new mongoose.Schema({

tagId: { type:  mongoose.Schema.Types.ObjectId, required: true },

noteId: { type:  mongoose.Schema.Types.ObjectId, required: true },

user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

},{timestamps: true });


module.exports = mongoose.model('NoteTag', noteTagSchema);