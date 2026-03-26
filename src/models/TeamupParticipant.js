const mongoose = require('mongoose');

const TeamupParticipantSchema = new mongoose.Schema({
  sourceInfoEvent: [{ type: String }],
  isCoFounderMatchingRegistered: { type: Boolean, default: false },
  cvUploaded: { type: Boolean, default: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number },
  roll: { type: String },
  password: { type: String }, // Make sure you never send this back to the frontend in standard API calls!
  isOnlineBSc: { type: Boolean, default: false },
  branch: { type: String },
  degree: { type: String },
  yearOfStudy: { type: Number },
  isDD: { type: Boolean, default: false }
});

module.exports = mongoose.model('TeamupParticipant', TeamupParticipantSchema, 'teamupparticipants');