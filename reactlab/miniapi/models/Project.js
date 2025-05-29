const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({ nazwa: { type: String, required: true }, opis: { type: String, required: true } }, { timestamps: true });
module.exports = mongoose.model('Project', ProjectSchema);