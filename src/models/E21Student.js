const mongoose = require('mongoose');

const E21StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: Number },
  phone: { type: Number, required: true },
  formattedID: { type: String },
  altPhone: { type: Number },
  school: { type: String },
  schoolLocation: { type: String },
  email: { type: String, required: true },
  creationTime: { type: Number },
  lastUpdated: { type: Number }
});

module.exports = mongoose.model('E21Student', E21StudentSchema, 'e21-students');