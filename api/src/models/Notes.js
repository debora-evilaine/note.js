const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

noteSchema.index({ title: 'text' });
module.exports = mongoose.model('Note', noteSchema);