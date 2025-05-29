const mongoose = require('mongoose');
const StorySchema = new mongoose.Schema({ 
    nazwa: { type: String, required: true }, 
    opis: { type: String, required: true }, 
    priorytet: { type: String, 
    enum: ['niski','średni','wysoki'], 
    default: 'niski' }, 
    stan: { type: String, 
    enum: ['todo','doing','done'], 
    default: 'todo' },
    projekt: { type: mongoose.Types.ObjectId, 
    ref: 'Project', 
    required: true }, 
    wlasciciel: { type: Number, required: true }, 
    dataUtworzenia: { type: Date, default: Date.now } });
    
module.exports = mongoose.model('Story', StorySchema);