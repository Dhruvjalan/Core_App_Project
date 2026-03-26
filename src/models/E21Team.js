const mongoose = require('mongoose');

const E21TeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  email: { type: String, required: true },
  leaderID: { type: String }, // Can be converted to mongoose.Schema.Types.ObjectId if it references another collection
  creationTime: { type: Number },
  lastUpdated: { type: Number }
});

module.exports = mongoose.model('E21Team', E21TeamSchema, 'e21-teams');